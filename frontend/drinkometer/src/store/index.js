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
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    getUser: (state) => state.user,
    getToken: (state) => state.token
  },
});

export default store;