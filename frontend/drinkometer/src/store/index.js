import { createStore } from 'vuex';

const store = createStore({
  state: {
    state: {
      user: JSON.parse(localStorage.getItem('user')) || null,
      token: localStorage.getItem('token') || null,
    },
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    clearUser(state) {
      state.user = null;
    },
    setToken(state, token) {
      state.token = token;
    },
    setDrinkCount(state, drinkCount) {
      state.user.drinkCount = drinkCount;
      localStorage.setItem('user', JSON.stringify(state.user));

    },
    updateProfilePicture(state, profilePicture) {
      state.user.profilePicture = profilePicture;
    },
  },
  actions: {
    saveUser({ commit }, user) {
      commit('setUser', user);
    },
    logout({ commit }) {
      commit('clearUser');
      commit('setToken', null);
    },
    saveToken({ commit }, token) {
      commit('setToken', token);
    },
    saveDrinkCount({ commit }, drinkCount) {
      commit('setDrinkCount', drinkCount);
    },

    async updateUser({ commit, state }) {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (!userId || !token) {
          throw new Error('Utilisateur non connecté');
        }

        // Appeler l'API pour récupérer les données utilisateur
        const response = await api.get(`/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Mettre à jour le store avec les nouvelles données utilisateur
        commit('saveUser', response.data);
      } catch (error) {
        console.error('Erreur lors de la mise à jour des données utilisateur :', error.message);
        throw error;
      }
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    getUser: (state) => state.user,
    getToken: (state) => state.token
  },



});

export default store;