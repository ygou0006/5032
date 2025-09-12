<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const user = ref(null)
function loadUser() {
  user.value = JSON.parse(localStorage.getItem('currentUser') || 'null')
}
function onAuthChanged(e) {
  user.value = e.detail || null
}
function logout() {
  localStorage.removeItem('currentUser')
  window.dispatchEvent(new CustomEvent('auth:changed', { detail: null }))
}

onMounted(() => {
  loadUser()
  window.addEventListener('auth:changed', onAuthChanged)
})
onBeforeUnmount(() => {
  window.removeEventListener('auth:changed', onAuthChanged)
})
</script>

<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container d-flex justify-content-between">
        <router-link class="navbar-brand" to="/">NFP Project</router-link>

        <ul class="navbar-nav ms-auto align-items-center">
          <li class="nav-item me-2">
            <router-link class="btn btn-light btn-sm" to="/">Home</router-link>
          </li>

          <template v-if="!user">
            <li class="nav-item me-2">
              <router-link class="btn btn-outline-light btn-sm" to="/login">Login</router-link>
            </li>
          </template>

          <template v-else>
            <li class="nav-item me-2">
              <router-link class="btn btn-outline-light btn-sm" to="/profile">Profile</router-link>
            </li>
            <li class="nav-item me-2" v-if="user.role === 'admin'">
              <router-link class="btn btn-warning btn-sm" to="/admin">Admin Panel</router-link>
            </li>
            <li class="nav-item d-flex align-items-center gap-2">
              <span class="text-white small d-none d-md-inline">
                Hi, {{ user.email }} ({{ user.role || 'user' }})
              </span>
              <button class="btn btn-outline-light btn-sm" @click="logout">Logout</button>
            </li>
          </template>
        </ul>
      </div>
    </nav>

    <main class="container py-4">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
