<template>
  <div class="min-h-screen flex flex-col items-center justify-between bg-gradient-to-b from-purple-500 to-pink-500 p-6" style="min-height: 92vh; padding-bottom:8vh;">
    <!-- Aperçu de la caméra -->
    <div class="flex-1 w-full relative">
      <video ref="video" autoplay playsinline class="absolute inset-0 w-full h-full object-cover"></video>

      <!-- Aperçu de la photo capturée -->
      <canvas ref="canvas" class="absolute inset-0 right-4 h-full hidden"></canvas>
    </div>

    <!-- Boutons pour capturer une photo et télécharger -->
    <div class="w-full flex justify-center gap-4 mt-4">
      <button
        @click="capturePhoto"
        class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg focus:outline-none hover:shadow-xl"
      >
        📸
      </button>
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
      videoStream: null, // Flux vidéo de la caméra
      photoBlob: null, // Stocke la photo capturée sous forme de fichier
    };
  },
  methods: {
    async startCamera() {
      try {
        // Demande l'accès à la caméra
        this.videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.$refs.video.srcObject = this.videoStream;
      } catch (error) {
        alert('Impossible d’accéder à la caméra : ' + error.message);
      }
    },
    capturePhoto() {
      const video = this.$refs.video;
      const canvas = this.$refs.canvas;

      // Configure le canvas pour conserver l'aspect ratio
      const aspectRatio = video.videoWidth / video.videoHeight;
      const width = 640; // Largeur standard pour la capture
      const height = width / aspectRatio;

      canvas.width = width;
      canvas.height = height;

      // Dessine l'image de la vidéo sur le canvas sans déformer
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, width, height);

      // Convertit le contenu du canvas en Blob (fichier photo)
      canvas.toBlob((blob) => {
        this.photoBlob = blob; // Stocke le Blob pour l'envoi
      }, 'image/jpeg');

      // Affiche l'aperçu de la photo capturée
      video.classList.add('hidden');
      canvas.classList.remove('hidden');
    },
    async uploadPhoto() {
      if (!this.photoBlob) {
        alert('Veuillez capturer une photo avant de l’envoyer.');
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
        this.resetCamera();
      } catch (error) {
        console.error('Erreur lors de l’envoi de la photo :', error);
        alert('Impossible d’envoyer la photo. Veuillez réessayer.');
      }
    },
    resetCamera() {
      this.photoBlob = null;
      this.$refs.video.classList.remove('hidden');
      this.$refs.canvas.classList.add('hidden');
    },
  },
  mounted() {
    this.startCamera();
  },
  beforeDestroy() {
    // Arrête le flux vidéo lorsque le composant est détruit
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track) => track.stop());
    }
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