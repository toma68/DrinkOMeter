const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const cors = require('cors');

const multer = require('multer');
const path = require('path');

// Configuration de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Dossier où les fichiers seront enregistrés
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });


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

// 6. Update profile picture

app.post('/user/:id/profilePicture', upload.single('profilePicture'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Met à jour le champ `profilePicture` avec le chemin du fichier
        user.profilePicture = `/uploads/${req.file.filename}`;
        await user.save();

        res.json({ message: 'Profile picture updated successfully', profilePicture: user.profilePicture });
    } catch (err) {
        res.status(500).json({ error: 'Error updating profile picture', details: err.message });
    }
});

// 7. Get profile picture
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

