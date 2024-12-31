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
        class="bg-white rounded-lg shadow-lg p-4"
      >
        <!-- En-tête avec l'utilisateur et la date -->
        <div class="flex items-center mb-4">
          <span class="text-sm font-medium text-gray-700">Posté par {{ photo.User.username }}</span>
          <span class="text-sm font-medium text-gray-700 mr-auto ml-auto">Boisson {{ photo.drinkCount }}</span>
          <span class="text-sm text-gray-500 ml-auto">{{ formatDate(photo.uploadedAt) }}</span>
        </div>

        <!-- Image -->
        <img
          :src="`${baseURL}${photo.filePath}`"
          alt="Photo récente"
          class="w-full h-auto rounded-md mb-4"
        />

        <!-- Bouton Like -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">{{ photo.totalLikes }} like(s)</span>
          <button
            :disabled="photo.likedByCurrentUser"
            @click="likePhoto(photo.id)"
            class="text-blue-500 hover:text-blue-700 text-sm font-medium"
          >
            ❤️ {{ photo.likedByCurrentUser ? 'Liké' : 'Like' }}
          </button>
        </div>
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
    };
  },
  methods: {
    async fetchRecentPhotos() {
      try {
        const response = await api.get('/photos-recent');
        const userId = localStorage.getItem('userId'); 
        
        
    
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
          photo.likes = response.data.likes;
          photo.likedByCurrentUser = true;
          photo.totalLikes += 1;

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
  },
  mounted() {
    this.fetchRecentPhotos();
  },
};
</script>

<style scoped>
/* Aucun style supplémentaire nécessaire, Tailwind s'occupe de l'apparence */
</style>