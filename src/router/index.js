import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../HomePage.vue'
import LoginPage from '../LoginPage.vue'
import ProfilePage from '../ProfilePage.vue'
import AdminPanel from '../AdminPanel.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/profile', name: 'Profile', component: ProfilePage, meta: { requiresAuth: true } },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')

  if (to.meta.requiresAuth && !currentUser) {
    return { name: 'Login' }
  }

  if (to.meta.requiresAdmin && (!currentUser || currentUser.role !== 'admin')) {
    alert('Access denied: Admin only')
    return { name: 'Home' }
  }
  return true
})

export default router
