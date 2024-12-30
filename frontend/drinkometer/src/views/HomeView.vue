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

    <!-- Formulaire pour ajouter une boisson avec une photo -->
    <form @submit.prevent="uploadPhoto" class="mt-6 w-full max-w-xs flex flex-col items-center">
      <label for="photo" class="block text-sm font-medium text-gray-100 mb-2">Prendre une photo</label>
      <input
        id="photo"
        type="file"
        accept="image/*"
        capture="environment"
        @change="onPhotoCapture"
        class="w-full mb-4 border border-gray-300 rounded-lg p-2"
      />
      <!-- Aperçu de la photo -->
      <div v-if="preview" class="mb-4">
        <img :src="preview" alt="Aperçu de la photo" class="max-w-full rounded-lg shadow-md" />
      </div>
      <button
        type="submit"
        class="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-green-500 hover:to-blue-500 text-white font-medium py-2 rounded-lg shadow-md"
      >
        Ajouter une boisson avec une photo
      </button>
    </form>

    <!-- Bouton d'information -->
    <button
      @click="showInfo"
      class="absolute top-4  w-8 h-8 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200 focus:outline-none" style="right: 10px;"
      aria-label="Information"
    >
      i
    </button>

    <!-- Modal d'information -->
    <div v-if="infoVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm text-center">
        <h2 class="text-xl font-bold text-gray-700 mb-4">À propos du défi</h2>
        <p class="text-gray-600">
          Le but de ce défi est de boire 2025 quantités d'alcool en 2025. Chacun suit son propre compteur, verre après verre. 🍹 
        </p>
        <p class="text-gray-600 mt-4">
          (Exemples, un shooter ➡️ +1, un double ricard ➡️ +2, ...)
        </p>
        <button
          @click="closeInfo"
          class="mt-4 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-medium py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
        >
          OK
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
      photo: null, // Stocke le fichier capturé
      preview: null, // Stocke l'aperçu de la photo
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
        alert('Erreur de connexion. Vérifiez que vous êtes bien connecté à internet, puis réessayez.');
      }
    },
    onPhotoCapture(event) {
      const file = event.target.files[0];
      if (file) {
        this.photo = file;
        this.preview = URL.createObjectURL(file); // Crée un aperçu
      }
    },
    async uploadPhoto() {
      if (!this.photo) {
        alert('Veuillez capturer une photo avant de l’envoyer.');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('photo', this.photo);
        formData.append('token', this.$store.getters.getToken);

        const response = await api.post('/addDrinkWithPhoto', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        this.$store.dispatch('saveDrinkCount', response.data.drinkCount);
        alert('Boisson ajoutée avec succès !');
        this.preview = null;
        this.photo = null;
      } catch (error) {
        console.error('Erreur lors de l’ajout de la photo :', error.response?.data || error.message);
        alert('Impossible d’ajouter la photo. Réessayez.');
      }
    },
    showInfo() {
      this.infoVisible = true;
    },
    closeInfo() {
      this.infoVisible = false;
    },
  },
};
</script>