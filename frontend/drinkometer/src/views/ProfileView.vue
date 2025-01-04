<template>
  <div class="min-h-screen flex flex-col items-center justify-between bg-gradient-to-b from-purple-500 to-pink-500 p-6" style="min-height: 92vh; padding-bottom:8vh;">
    <div class="w-full max-w-lg bg-white rounded-lg shadow-lg p-8">
      <h1 class="text-2xl font-bold text-gray-700 text-center mb-6">Mon Profil</h1>
      <div v-if="user" class="space-y-4">
        <!-- Nom d'utilisateur -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
          <div class="mt-1 block w-full p-3 border border-gray-300 rounded-lg bg-gray-100 shadow-sm sm:text-sm">
            {{ user.username }}
          </div>
        </div>

        <!-- Adresse Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Adresse Email</label>
          <div class="mt-1 block w-full p-3 border border-gray-300 rounded-lg bg-gray-100 shadow-sm sm:text-sm">
            {{ user.email }}
          </div>
        </div>

        <!-- Compteur de boissons -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Boissons</label>
          <div class="mt-1 block w-full p-3 border border-gray-300 rounded-lg bg-gray-100 shadow-sm sm:text-sm flex justify-between items-center">
            {{ user.drinkCount }}
            <button
              @click="removeDrink"
              class="text-red-500 hover:text-red-700 font-medium text-sm"
            >
              -1
            </button>
          </div>
        </div>

        <!-- Section des photos -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Mes Photos</label>
          <div class="mt-1 grid grid-cols-3 gap-2">
            <img
              v-for="photo in photos"
              :key="photo.id"
              :src="`${baseURL}${photo.filePath}`"
              alt="Photo"
              class="w-full h-24 object-cover rounded-lg shadow-sm cursor-pointer"
              @click="openPhoto(photo)"
            />
          </div>
        </div>
      </div>
      <div v-else>
        <p class="text-center text-gray-500">Chargement des informations...</p>
      </div>

      <!-- Bouton de déconnexion -->
      <button
        @click="logout"
        class="mt-6 w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-pink-500 hover:to-red-500 text-white font-medium py-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Se déconnecter
      </button>

      <!-- Informations sur le cache -->
      <div class="text-sm text-gray-500 mt-4">
        Drink'O'Meter-{{ cacheName }}
      </div>
    </div>

    <!-- Modal pour afficher la photo en grand -->
    <div
      v-if="selectedPhoto"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out" style="z-index: 100;"
    >
      <div
        class="bg-white rounded-lg shadow-lg p-4 max-w-md w-full relative animate-fadeIn" 
      >
        <img
          :src="`${baseURL}${selectedPhoto.filePath}`"
          alt="Photo en grand"
          class="w-full h-auto rounded-md mb-4"
        />
        <div class="flex justify-between items-center">
          <button
            @click="confirmDeletePhoto"
            class="text-red-500 font-medium text-sm hover:underline"
          >
            Supprimer
          </button>
          <a
            :href="`${baseURL}${selectedPhoto.filePath}`"
            :download="getFileName(selectedPhoto.filePath)"
            class="text-blue-500 font-medium text-sm hover:underline"
          >
            Télécharger
          </a>
        </div>
        <button
          @click="closePhoto"
          class="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import api from '../api';

export default {
  data() {
    return {
      photos: [], // Stocke les photos récupérées
      baseURL: process.env.VUE_APP_API_URL || "http://localhost:3003/photos/", // URL du backend
      selectedPhoto: null, // Photo sélectionnée pour l'aperçu en grand
      cacheName: 'Loading...', // Nom du cache actif
    };
  },
  computed: {
    ...mapGetters(['getUser']),
    user() {
      return this.getUser;
    },
  },
  methods: {
    ...mapActions(['logout', 'saveDrinkCount']),
    async fetchCacheName() {
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          const cacheName = await new Promise((resolve) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
              resolve(event.data.cacheName || 'Unknown Cache Name');
            };
            navigator.serviceWorker.controller.postMessage(
              { type: 'GET_CACHE_NAME' },
              [messageChannel.port2]
            );
          });
          this.cacheName = cacheName;
        } else {
          this.cacheName = 'Service Worker Not Available';
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du nom du cache :', error);
        this.cacheName = 'Erreur de récupération';
      }
    },
    getFileName(filePath) {
      return filePath.split('/').pop(); // Récupère uniquement le nom du fichier
    },
    async removeDrink() {
      try {
        if (this.user.drinkCount > 0) {
          const response = await api.post('/decrement', {
            token: this.$store.state.token,
          });
          this.$store.dispatch('saveDrinkCount', response.data.drinkCount);
        } else {
          alert("Le compteur est déjà à zéro !");
        }
      } catch (error) {
        console.error('Erreur lors de la décrémentation :', error.response?.data || error.message);
        alert('Impossible de décrémenter le compteur. Veuillez réessayer.');
      }
    },
    async fetchPhotos() {
      try {
        const userId = localStorage.getItem('userId'); 
        const response = await api.get(`/user/${userId}/photos`);
        this.photos = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des photos :', error.response?.data || error.message);
        alert('Impossible de récupérer les photos.');
      }
    },
    openPhoto(photo) {
      this.selectedPhoto = photo;
    },
    closePhoto() {
      this.selectedPhoto = null;
    },
    confirmDeletePhoto() {
      if (confirm('Voulez-vous vraiment supprimer cette photo ?')) {
        this.deletePhoto(this.selectedPhoto);
      }
    },
    async deletePhoto(photo) {
      try {
        const response = await api.delete(`/photo/${photo.id}`, {
          data: { token: this.$store.getters.getToken },
        });

        this.photos = this.photos.filter((p) => p.id !== photo.id); // Met à jour la liste des photos
        alert('Photo supprimée avec succès !');
        this.closePhoto();
      } catch (error) {
        console.error('Erreur lors de la suppression de la photo :', error.response?.data || error.message);
        alert('Impossible de supprimer la photo.');
      }
    },
  },
  mounted() {
    this.fetchPhotos();
    this.fetchCacheName(); // Récupère le cache actif
  },
  async beforeRouteEnter(to, from, next) {
    try {
      const userId = localStorage.getItem('userId'); 
      const token = localStorage.getItem('token');

      if (!userId || !token) throw new Error('Utilisateur non connecté ou token manquant');

      const response = await api.get(`/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      next((vm) => {
        vm.$store.dispatch('saveUser', response.data);
      });
    } catch (error) {
      console.error('Erreur de récupération des données utilisateur :', error.response?.data || error.message);
      alert('Erreur de connexion. Veuillez vérifier votre connexion et réessayer.');
      next('/login');
    }
  },
};
</script>

<style scoped>
/* Animation d'apparition du modal */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>