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


if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
    .then((registration) => {
      console.log('Service Worker enregistré avec succès :', registration);

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Nouvelle version disponible
              console.log('Nouvelle version disponible.');
              // Optionnel : Forcer le rechargement ou informer l'utilisateur
              window.location.reload();
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Erreur lors de l’enregistrement du Service Worker :', error);
    });
}