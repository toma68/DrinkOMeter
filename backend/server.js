const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const cors = require('cors');


// App initialization
const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'secret_key';

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite::memory:', {
    logging: false,
});

// User model
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    drinkCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    profilePicture: {
        type: DataTypes.STRING, // URL ou chemin de l'image
        defaultValue: null, // Valeur par défaut si aucune photo n'est définie
    },
});

// Sync the database
sequelize.sync({ force: false }).then(() => {
    console.log('Database connected and synced!');
});

// Routes
// 1. Register
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, password: hashedPassword });

        res.status(201).json({ message: 'User registered successfully!', userId: newUser.id });
    } catch (err) {
        res.status(400).json({ error: 'Error registering user', details: err.message });
    }
});

// 2. Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '2y' });
        //on récupere les infos de l'user
        userInfos = {
            userId: user.id,
            username: user.username,
            email: user.email,
            drinkCount: user.drinkCount,
            profilePicture: user.profilePicture, 

        }
        res.json({ message: 'Login successful', token, userInfos });
    } catch (err) {
        res.status(500).json({ error: 'Error logging in', details: err.message });
    }
});

// 3. Increment drink count
app.post('/increment', async (req, res) => {
    const { token } = req.body;

    try {
        const decoded = jwt.verify(token, SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) return res.status(404).json({ error: 'User not found' });

        user.drinkCount += 1;
        await user.save();

        res.json({ message: 'Drink count updated', drinkCount: user.drinkCount });
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized', details: err.message });
    }
});

// 4. Leaderboard
app.get('/leaderboard', async (req, res) => {
    try {
        const users = await User.findAll({
            order: [['drinkCount', 'DESC']],
            limit: 10,
            attributes: ['id', 'username', 'drinkCount'],
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching leaderboard', details: err.message });
    }
});

// 5. User profile
app.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            username: user.username,
            email: user.email,
            drinkCount: user.drinkCount,
            profilePicture: user.profilePicture, 
        });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching user profile', details: err.message });
    }
});

// 6. Decrement

app.post('/decrement', async (req, res) => {
    const { token } = req.body;

    try {
        const decoded = jwt.verify(token, SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) return res.status(404).json({ error: 'User not found' });

        user.drinkCount -= 1;
        await user.save();

        res.json({ message: 'Drink count updated', drinkCount: user.drinkCount });
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized', details: err.message });
    }
}
);


//############### Implementation de la gestion des images ####################

const multer = require('multer');
const path = require('path');

// Configuration de stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Répertoire où les fichiers seront stockés
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Nom unique
  },
});

// Initialiser Multer
const upload = multer({ storage });

// utilitaires de compression
const sharp = require('sharp');
const fs = require('fs');

// 7. Add drink with photo


// Endpoint pour ajouter une boisson avec une photo compressée
app.post('/addDrinkWithPhoto', upload.single('photo'), async (req, res) => {
  const { token } = req.body;

  try {
    // Vérifie et décode le token JWT
    const decoded = jwt.verify(token, SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Vérifie si une photo a été téléchargée
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const inputPath = req.file.path; // Chemin original
    const outputPath = `uploads/compressed-${req.file.filename}`; // Chemin compressé

    // Compression de l'image
    await sharp(inputPath)
      .resize(800) // Redimensionne la largeur à 800px (la hauteur est ajustée automatiquement)
      .jpeg({ quality: 70 }) // Convertit en JPEG avec une qualité de 70%
      .toFile(outputPath);

    // Supprime l'image originale non compressée
    fs.unlinkSync(inputPath);

    // Met à jour le compteur de boissons
    user.drinkCount += 1;

    // Enregistre la photo compressée (chemin relatif)
    const photoPath = `/${outputPath}`;
    await user.save();

    res.json({
      message: 'Drink added with compressed photo',
      drinkCount: user.drinkCount,
      photo: photoPath,
    });
  } catch (err) {
    console.error('Error adding drink with photo:', err);
    res.status(500).json({ error: 'Error adding drink with photo', details: err.message });
  }
});

// 8. Get a picture

app.get('/photos/:filename', (req, res) => {
    const filename = req.params.filename; // Récupère le nom du fichier depuis l'URL
    const filePath = path.join(__dirname, 'uploads', filename); // Chemin complet du fichier
  
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Erreur lors de l’envoi du fichier :', err.message);
        res.status(404).json({ error: 'Photo non trouvée' });
      }
    });
  });

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
