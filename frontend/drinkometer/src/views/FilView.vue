<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-purple-500 to-pink-500 p-6" style="min-height: 92vh; padding-bottom:8vh;">
    <h1 class="text-2xl font-bold text-white text-center mb-6">Photos récentes</h1>

    <!-- Si aucune photo -->
    <div v-if="photos.length === 0" class="text-center text-gray-100">
      <p>Aucune photo postée au cours des dernières 24 heures.</p>
    </div>

    <!-- Liste des photos -->
    <div v-else class="space-y-4">
      <div
        v-for="photo in photos"
        :key="photo.id"
        class="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center"
      >
        <!-- En-tête avec l'utilisateur et la date -->
        <div class="flex items-center w-full mb-4">
          <span class="text-sm font-medium text-gray-700">Posté par {{ photo.User.username }}</span>
          <span class="text-sm font-medium text-gray-700 mx-auto">Boisson {{ photo.drinkCount }}</span>
          <span class="text-sm text-gray-500 ml-auto">{{ formatDate(photo.uploadedAt) }}</span>
        </div>

        <!-- Image -->
        <div class="relative w-full flex justify-center items-center overflow-hidden">
          <img
            :src="`${baseURL}${photo.filePath}`"
            alt="Photo récente"
            class="w-full h-auto rounded-md mb-4"
            @click="openModal(photo)"
          />
        </div>

        <!-- Bouton Like -->
        <div class="flex items-center justify-between w-full">
          <span class="text-sm text-gray-600">{{ photo.totalLikes }} like(s)</span>
          <button
            :disabled="photo.likedByCurrentUser"
            @click="likePhoto(photo.id)"
            class="text-sm font-medium px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {{ photo.likedByCurrentUser ? '❤️ Liké' : '❤️ Like' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal pour afficher la photo en grand -->
    <div
      v-if="selectedPhoto"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center w-full justify-center z-50 transition-opacity duration-300 ease-in-out" style="z-index: 100;"
    >
      <div
        class="bg-white rounded-lg shadow-lg p-1 max-w-md w-full relative animate-fadeIn" 
      >
        <img
          :src="`${baseURL}${selectedPhoto.filePath}`"
          alt="Photo en grand"
          class="w-full rounded-md mb-4"
        />
        <div class="flex justify-between items-center m-2">
          
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
          class="absolute top-2 right-2 text-white hover:text-gray-800 rounded-full p-1" style="z-index: 1000; background-color: red;"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api';

export default {
  data() {
    return {
      photos: [], // Liste des photos récentes
      baseURL: process.env.VUE_APP_API_URL || "http://localhost:3003/photos/", // URL du backend
      showModal: false, // Contrôle la visibilité du modal
      selectedPhoto: null, // Photo sélectionnée pour affichage dans le modal
    };
  },
  methods: {
    getFileName(filePath) {
    return filePath.split('/').pop(); // Récupère uniquement le nom du fichier
  },
    async fetchRecentPhotos() {
      try {
        const response = await api.get('/photos-recent');
        const userId = parseInt(localStorage.getItem('userId'), 10); // Récupération du userId
        
        // Ajoute une propriété pour savoir si l'utilisateur a déjà liké
        this.photos = response.data.map((photo) => ({
          ...photo,
          likedByCurrentUser: photo.Likes.some((like) => like.userId === userId),
          totalLikes: photo.Likes.length,
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des photos récentes :', error.response?.data || error.message);
        alert('Impossible de récupérer les photos récentes.');
      }
    },
    async likePhoto(photoId) {
      try {
        const response = await api.post(`/photo/${photoId}/like`, {
          token: this.$store.getters.getToken,
        });

        // Met à jour localement le nombre de likes et bloque le bouton
        const photo = this.photos.find((p) => p.id === photoId);
        if (photo) {
          photo.totalLikes = response.data.likes; // Met à jour le total des likes
          photo.likedByCurrentUser = true; // Bloque le bouton
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          alert('Vous avez déjà liké cette photo.');
        } else {
          console.error('Erreur lors du like de la photo :', error.response?.data || error.message);
          alert('Impossible de liker cette photo.');
        }
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    openModal(photo) {
      this.selectedPhoto = photo;
      this.showModal = true;
    },
    
    closePhoto() {
      this.selectedPhoto = null;
    },
  },
  mounted() {
    this.fetchRecentPhotos();
  },
};
</script>