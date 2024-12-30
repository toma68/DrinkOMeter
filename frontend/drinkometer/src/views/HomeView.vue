<template>
  <div class="min-h-screen flex flex-col items-center justify-between bg-gradient-to-b from-purple-500 to-pink-500 p-6" style="height: 100vh;">
    <h1 class="text-3xl font-bold text-white mt-6">Drink'O'Meter</h1>
    <p class="text-lg text-gray-200 mt-2">2025, une année, un défi. Suivez votre compteur ! 🍹</p>

    <!-- Jauge circulaire -->
    <div class="relative mt-8 w-64 h-64">
      <div class="absolute inset-0 rounded-full bg-white opacity-20"></div>
      <svg class="w-64 h-64">
        <circle cx="128" cy="128" r="100" stroke="rgba(255, 255, 255, 0.3)" stroke-width="16" fill="none" />
        <circle
          cx="128"
          cy="128"
          r="100"
          stroke="rgba(255, 255, 255, 0.8)"
          stroke-width="16"
          fill="none"
          stroke-dasharray="628"
          :stroke-dashoffset="628 - (628 * drinks / goal)"
          class="transition-all duration-500"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-4xl font-bold text-white">{{ drinks }}</span>
        <span class="text-sm text-gray-300">/ {{ goal }} verres</span>
      </div>
    </div>

    <!-- Bouton pour ajouter un verre -->
    <button
      @click="addDrink"
      class="mt-8 w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold rounded-full text-4xl flex items-center justify-center shadow-lg focus:outline-none focus:ring-4 focus:ring-pink-200"
    >
      +
    </button>

    <!-- Bouton pour ajouter une boisson avec une image -->
    <button
      @click="showImageUpload"
      class="mt-4 w-full max-w-xs bg-gradient-to-r from-blue-500 to-green-500 hover:from-green-500 hover:to-blue-500 text-white font-medium py-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      Ajouter une boisson avec une image
    </button>

    <!-- Modal pour ajouter une boisson avec une image -->
    <div v-if="imageUploadVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 class="text-xl font-bold text-gray-700 mb-4 text-center">Ajouter une image</h2>
        <form @submit.prevent="uploadDrinkWithImage">
          <input
            type="file"
            accept="image/*"
            @change="onFileChange"
            class="w-full mb-4 border border-gray-300 rounded-lg p-2"
          />
          <button
            type="submit"
            class="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-medium py-2 rounded-lg shadow-md"
          >
            Ajouter
          </button>
        </form>
        <button
          @click="closeImageUpload"
          class="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-lg shadow-md"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import api from '../api';
import { mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {
      goal: 2025, // Objectif total
      infoVisible: false, // Contrôle la visibilité du modal d'information
      imageUploadVisible: false, // Contrôle la visibilité du modal d'upload
      selectedFile: null, // Fichier sélectionné pour l'upload
    };
  },
  computed: {
    ...mapGetters(['getUser']),
    drinks() {
      return this.getUser.drinkCount;
    },
  },
  methods: {
    async addDrink() {
      try {
        const response = await api.post('/increment', {
          token: this.$store.getters.getToken,
        });
        this.$store.dispatch('saveDrinkCount', response.data.drinkCount);
      } catch (error) {
        console.error('Erreur de connexion :', error.response?.data || error.message);
        alert('Erreur de connexion. Vérifiez que vous êtes bien connecté à internet, puis réésayez.');
      }
    },
    showImageUpload() {
      this.imageUploadVisible = true; // Ouvre le modal
    },
    closeImageUpload() {
      this.imageUploadVisible = false; // Ferme le modal
    },
    onFileChange(event) {
      this.selectedFile = event.target.files[0]; // Stocke le fichier sélectionné
    },
    async uploadDrinkWithImage() {
      if (!this.selectedFile) {
        alert('Veuillez sélectionner une image.');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('photo', this.selectedFile);
        formData.append('token', this.$store.getters.getToken);

        const response = await api.post('/addDrinkWithPhoto', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Met à jour le compteur après l'upload
        this.$store.dispatch('saveDrinkCount', response.data.drinkCount);
        this.closeImageUpload(); // Ferme le modal
        alert('Boisson ajoutée avec succès !');
      } catch (error) {
        console.error('Erreur lors de l’ajout de la boisson avec une image :', error.response?.data || error.message);
        alert('Échec de l’ajout. Veuillez réessayer.');
      }
    },
  },
};
</script>

<style scoped>
/* Aucun style personnalisé requis grâce à Tailwind */
</style>