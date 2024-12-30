import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3003/', // Remplace par l'URL de ton backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;