<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-500 to-pink-500 p-6" style="height: 100vh;">
    <!-- Formulaire combiné -->
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <div class="flex justify-around border-b border-gray-200 pb-4 mb-6">
        <button
          :class="{'text-pink-500 font-bold border-b-2 border-pink-500': isLogin, 'text-gray-500': !isLogin}"
          class="text-lg pb-2 pr-4"
          @click="toggleForm(true)"
        >
          Connexion
        </button>
        <button
          :class="{'text-pink-500 font-bold border-b-2 border-pink-500': !isLogin, 'text-gray-500': isLogin}"
          class="text-lg pb-2 pr-4"
          @click="toggleForm(false)"
        >
          Inscription
        </button>
      </div>

      <!-- Formulaire de connexion -->
      <form v-if="isLogin" @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="login-email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="loginEmail"
            type="text"
            id="login-email"
            required
            class="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            placeholder="Votre email"
          />
        </div>
        <div>
          <label for="login-password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            v-model="loginPassword"
            type="password"
            id="login-password"
            required
            class="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            placeholder="Votre mot de passe"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-medium py-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
        >
          Se connecter
        </button>
      </form>

      <!-- Formulaire d'inscription -->
      <form v-else @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="register-username" class="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
          <input
            v-model="registerUsername"
            type="text"
            id="register-username"
            required
            class="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            placeholder="Votre nom d'utilisateur"
          />
        </div>
        <div>
          <label for="register-email" class="block text-sm font-medium text-gray-700">Adresse Email</label>
          <input
            v-model="registerEmail"
            type="email"
            id="register-email"
            required
            class="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label for="register-password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            v-model="registerPassword"
            type="password"
            id="register-password"
            required
            class="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            placeholder="Votre mot de passe"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-medium py-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
        >
          S'inscrire
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import api from '../api';

export default {
  data() {
    return {
      isLogin: true,
      loginEmail: '',
      loginPassword: '',
      registerUsername: '',
      registerEmail: '',
      registerPassword: '',
    };
  },
  methods: {
    toggleForm(isLogin) {
      this.isLogin = isLogin;
    },
    async handleLogin() {
  try {
    const response = await api.post('/login', {
      email: this.loginEmail,
      password: this.loginPassword,
    });
    // Enregistrement du token et des informations de l'utilisateur dans le localStorage

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.userInfos));
    this.$store.dispatch('saveToken', response.data.token);
    this.$store.dispatch('saveUser', response.data.userInfos);
    console.log('Connexion réussie :', response.data);
    this.$router.push('/profile'); // Redirection vers la page de profil
  } catch (error) {
    console.error('Erreur de connexion :', error.response?.data || error.message);
    alert('Erreur de connexion. Vérifiez vos informations.');
  }
},
    async handleRegister() {
      try {
        const response = await api.post('/register', {
          username: this.registerUsername,
          email: this.registerEmail,
          password: this.registerPassword,
        });
        console.log('Inscription réussie :', response.data);
        alert('Inscription réussie. Vous pouvez vous connecter.');
        this.isLogin = true; // Bascule vers la page de connexion
      } catch (error) {
        console.error('Erreur d\'inscription :', error.response?.data || error.message);
        alert('Erreur d\'inscription. Vérifiez vos informations.');
      }
    },
  },
};
</script>