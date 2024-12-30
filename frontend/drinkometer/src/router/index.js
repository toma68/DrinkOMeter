
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import ProfileView from '../views/ProfileView.vue';
import LeaderboardView from '../views/LeaderboardView.vue';
import PhotoTakeView from '../views/PhotoTakeView.vue';
import store from '../store'; // Import du store


const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true }, },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true }, },
  { path: '/leaderboard', name: 'leaderboard', component: LeaderboardView },
  { path: '/phototake', name: 'phototake', component: PhotoTakeView },

];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && (store.state.token == null || store.state.user == null)) {
    next({ path: '/login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});



export default router;
