import { createStore } from 'vuex';

const store = createStore({
  state: {
    user: null, // Stocke les informations utilisateur
    token: null, // Stocke le token JWT
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
    async updateProfilePicture({ commit }, formData) {
      try {
        const response = await api.post(`/user/${state.user.id}/profilePicture`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        commit('updateProfilePicture', response.data.profilePicture);
        return response;
      } catch (error) {
        console.error('Erreur API :', error);
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