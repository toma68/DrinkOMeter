<template>
  <div class="min-h-screen flex flex-col items-center justify-between bg-gradient-to-b from-purple-500 to-pink-500 p-6" style="min-height: 92vh; padding-bottom:8vh;">
    <!-- Aperçu de la photo capturée ou téléchargée -->
    <div class="flex-1 w-full relative flex items-center justify-center">
      <img v-if="photoPreview" :src="photoPreview" alt="Aperçu de la photo" class="w-full h-full object-contain" />
      <div v-else class="flex items-center justify-center text-gray-100">
        <p>Aucune photo sélectionnée ou capturée.</p>
      </div>
    </div>

    <!-- Boutons pour capturer une photo et télécharger -->
    <div class="w-full flex flex-col items-center gap-4 mt-4">
      <label class="cursor-pointer">
        <input type="file" accept="image/*" capture="environment" @change="onFileChange" class="hidden" />
        <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg focus:outline-none hover:shadow-xl">
          📸
        </div>
      </label>
      <button
        v-if="photoBlob"
        @click="uploadPhoto"
        class="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-full flex items-center justify-center shadow-lg focus:outline-none hover:shadow-xl"
      >
        ⬆️
      </button>
    </div>
  </div>
</template>

<script>
import api from '../api';

export default {
  data() {
    return {
      photoPreview: null, // Stocke l'aperçu de la photo sélectionnée
      photoBlob: null, // Stocke la photo sous forme de Blob
    };
  },
  methods: {
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.photoBlob = file;

        // Crée un aperçu de l'image
        this.photoPreview = URL.createObjectURL(file);
      }
    },
    async uploadPhoto() {
      if (!this.photoBlob) {
        alert('Veuillez sélectionner ou capturer une photo avant de l’envoyer.');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('photo', this.photoBlob, 'photo.jpg');
        formData.append('token', this.$store.getters.getToken);

        await api.post('/addDrinkWithPhoto', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        alert('Photo envoyée avec succès !');
        this.resetPhoto();
      } catch (error) {
        console.error('Erreur lors de l’envoi de la photo :', error);
        alert('Impossible d’envoyer la photo. Veuillez réessayer.');
      }
    },
    resetPhoto() {
      this.photoPreview = null;
      this.photoBlob = null;
    },
  },
};
</script>

<style scoped>
/* Stylisation des boutons */
button {
  transition: all 0.2s ease-in-out;
}
button:hover {
  transform: scale(1.1);
}
</style>