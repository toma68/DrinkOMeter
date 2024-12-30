<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-500 to-pink-500 p-6" style="height: 100vh;">
    <div class="w-full max-w-lg bg-white rounded-lg shadow-lg p-8">
      <h1 class="text-2xl font-bold text-gray-700 text-center mb-6">Mon Profil</h1>
      <div v-if="user" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
          <div class="mt-1 block w-full p-3 border border-gray-300 rounded-lg bg-gray-100 shadow-sm sm:text-sm">
            {{ user.username }}
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Adresse Email</label>
          <div class="mt-1 block w-full p-3 border border-gray-300 rounded-lg bg-gray-100 shadow-sm sm:text-sm">
            {{ user.email }}
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Boissons</label>
          <div class="mt-1 block w-full p-3 border border-gray-300 rounded-lg bg-gray-100 shadow-sm sm:text-sm">
            {{ user.drinkCount }}
          </div>
        </div>
      </div>
      <div v-else>
        <p class="text-center text-gray-500">Chargement des informations...</p>
      </div>
      <button
        @click="logout"
        class="mt-6 w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-pink-500 hover:to-red-500 text-white font-medium py-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Se déconnecter
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  computed: {
    ...mapGetters(['getUser']),
    user() {
      return this.getUser;
    },
  },
  methods: {
    ...mapActions(['logout']),
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString('fr-FR', options);
    },
  },
};
</script>