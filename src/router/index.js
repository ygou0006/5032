import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../services/firebase'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: 'Nutrition Education - Home' },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: { title: 'About Us' },
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('../views/Services.vue'),
    meta: { title: 'Our Services' },
  },
  {
    path: '/resources',
    name: 'Resources',
    component: () => import('../views/Resources.vue'),
    meta: { title: 'Educational Resources' },
  },
  {
    path: '/blog',
    name: 'Blog',
    component: () => import('../views/Blog.vue'),
    meta: { title: 'Blog & Articles' },
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/Contact.vue'),
    meta: { title: 'Contact Us' },
  },

  // 认证路由
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/Auth/Login.vue'),
    meta: { requiresGuest: true, title: 'Login' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../components/Auth/Register.vue'),
    meta: { requiresGuest: true, title: 'Register' },
  },

  // 受保护的路由
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true, title: 'My Profile' },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../components/Dashboard/UserDashboard.vue'),
    meta: { requiresAuth: true, roles: ['user', 'nutritionist', 'admin'], title: 'Dashboard' },
  },
  {
    path: '/nutritionist-dashboard',
    name: 'NutritionistDashboard',
    component: () => import('../components/Dashboard/NutritionistDashboard.vue'),
    meta: { requiresAuth: true, roles: ['nutritionist', 'admin'], title: 'Nutritionist Dashboard' },
  },
  {
    path: '/admin-dashboard',
    name: 'AdminDashboard',
    component: () => import('../components/Dashboard/AdminDashboard.vue'),
    meta: { requiresAuth: true, roles: ['admin'], title: 'Admin Dashboard' },
  },
  {
    path: '/appointments',
    name: 'Appointments',
    component: () => import('../components/Features/AppointmentBooking.vue'),
    meta: {
      requiresAuth: true,
      roles: ['user', 'nutritionist', 'admin'],
      title: 'Book Appointment',
    },
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => {} /*import('../components/Features/InteractiveCharts.vue')*/,
    meta: { requiresAuth: true, roles: ['nutritionist', 'admin'], title: 'Analytics' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫 - 认证和权限控制
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)
  const requiredRoles = to.meta.roles || []

  // 获取当前用户
  await auth.authStateReady()
  const currentUser = auth.currentUser
  const userRole = localStorage.getItem('userRole') || 'user'

  if (requiresAuth && !currentUser) {
    next('/login')
  } else if (requiresGuest && currentUser) {
    next('/dashboard')
  } else if (requiresAuth && currentUser && requiredRoles.length > 0) {
    if (requiredRoles.includes(userRole)) {
      next()
    } else {
      next('/unauthorized')
    }
  } else {
    next()
  }
})

// 设置页面标题
router.afterEach((to) => {
  document.title = to.meta.title || 'Nutrition Education'
})

export default router
