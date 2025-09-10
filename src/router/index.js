import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../HomePage.vue'
import LoginPage from '../LoginPage.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/login', name: 'Login', component: LoginPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
