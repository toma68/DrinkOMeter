<template>
  <div class="min-h-screen flex flex-col items-center justify-between bg-gradient-to-b from-purple-500 to-pink-500 p-6" style="min-height: 92vh; padding-bottom:8vh ;">
    <h1 class="text-3xl font-bold text-white mt-6">Drink'O'Meter</h1>
    <p class="text-lg text-gray-200 mt-2">2025, une année, un défi. Suivez votre compteur ! 🍹</p>

    <!-- Jauge circulaire -->
    <div class="relative mt-8 w-64 h-64">
      <!-- Cercle extérieur -->
      <div class="absolute inset-0 rounded-full bg-white opacity-20"></div>
      <!-- SVG pour la jauge -->
      <svg class="w-64 h-64">
        <!-- Cercle arrière -->
        <circle
          cx="128"
          cy="128"
          r="100"
          stroke="rgba(255, 255, 255, 0.3)"
          stroke-width="16"
          fill="none"
        />
        <!-- Cercle avant (progression) -->
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
      <!-- Texte au centre -->
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

    <!-- Message sous le bouton -->
    <p class="text-sm text-gray-200 mt-4">Appuyez sur le bouton pour ajouter un verre</p>

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
    showInfo() {
      this.infoVisible = true; // Affiche le modal
    },
    closeInfo() {
      this.infoVisible = false; // Cache le modal
    },
  },
};
</script>

<style scoped>
/* Aucun style personnalisé requis grâce à Tailwind */
</style>