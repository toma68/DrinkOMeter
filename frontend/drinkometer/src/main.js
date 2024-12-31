import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './index.css';
import store from './store';
import api from './api'; // Si tu utilises Axios ou une API personnalisée

// Restaurer le token et les informations utilisateur depuis localStorage
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

if (token && user) {
  // Sauvegarder le token dans le store et configurer Axios si nécessaire
  store.commit('setToken', token); // Assure-toi que ton store a une mutation 'setToken'
  store.commit('setUser', JSON.parse(user)); // Assure-toi que ton store a une mutation 'setUser'

  // Configurer Axios pour inclure le token dans chaque requête
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}



// Créer et monter l'application
createApp(App).use(router).use(store).mount('#app');