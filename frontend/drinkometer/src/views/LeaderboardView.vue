<template>
  <div class="min-h-screen bg-gradient-to-b from-purple-500 to-pink-500 p-6" style="min-height: 92vh; padding-bottom:8vh ;">
    <h1 class="text-3xl font-bold text-white text-center mb-6">Classement</h1>

    <!-- Podium -->
    <div class="flex justify-center space-x-4 items-end mb-8">
      <!-- 2ème place -->
      <div class="flex flex-col items-center">
        <div class="w-16 h-16 bg-gray-200 text-gray-800 font-bold text-xl rounded-full flex items-center justify-center shadow-md">
          🥈
        </div>
        <p class="text-white text-sm mt-2">{{ podium[1]?.username || '---' }}</p>
        <p class="text-gray-300 text-xs">{{ podium[1]?.drinkCount || '0' }} verres</p>
      </div>

      <!-- 1ère place -->
      <div class="flex flex-col items-center">
        <div class="w-20 h-20 bg-yellow-300 text-gray-800 font-bold text-2xl rounded-full flex items-center justify-center shadow-md">
          🥇
        </div>
        <p class="text-white text-sm mt-2">{{ podium[0]?.username || '---' }}</p>
        <p class="text-gray-300 text-xs">{{ podium[0]?.drinkCount || '0' }} verres</p>
      </div>

      <!-- 3ème place -->
      <div class="flex flex-col items-center">
        <div class="w-16 h-16 bg-gray-400 text-gray-800 font-bold text-xl rounded-full flex items-center justify-center shadow-md">
          🥉
        </div>
        <p class="text-white text-sm mt-2">{{ podium[2]?.username || '---' }}</p>
        <p class="text-gray-300 text-xs">{{ podium[2]?.drinkCount || '0' }} verres</p>
      </div>
    </div>

    <!-- Liste des autres utilisateurs -->
    <div class="bg-white rounded-lg shadow-lg p-4">
      <h2 class="text-lg font-bold text-gray-700 mb-4">Autres utilisateurs</h2>
      <ul>
        <li
          v-for="(user, index) in otherUsers"
          :key="user.id"
          class="flex justify-between items-center py-2 border-b last:border-b-0"
        >
          <span class="text-gray-800 font-medium">
            {{ index + 4 }}. {{ user.username }}
          </span>
          <span class="text-gray-500 text-sm">{{ user.drinkCount }} verres</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import api from '../api';

export default {
  data() {
    return {
      podium: [], // Les 3 premiers utilisateurs
      otherUsers: [], // Les autres utilisateurs
    };
  },
  methods: {
    async fetchLeaderboard() {
      try {
        const response = await api.get('/leaderboard');
        const sortedUsers = response.data.sort((a, b) => b.drinkCount - a.drinkCount); // Trie par drinkCount décroissant
        this.podium = sortedUsers.slice(0, 3); // Les 3 premiers
        this.otherUsers = sortedUsers.slice(3); // Les autres utilisateurs
      } catch (error) {
        console.error('Erreur lors de la récupération du leaderboard :', error.response?.data || error.message);
        alert('Impossible de charger le classement.');
      }
    },
  },
  mounted() {
    this.fetchLeaderboard(); // Charger les données du leaderboard au montage
  },
};
</script>

<style scoped>
/* Aucun style personnalisé grâce à Tailwind CSS */
</style>