<script setup>
import { ref, onMounted } from 'vue'
import HomePage from './HomePage.vue'
import LoginPage from './LoginPage.vue'
import ProfilePage from './ProfilePage.vue' // ⬅ new

const page = ref('home')
const user = ref(null)

onMounted(() => {
  const saved = localStorage.getItem('currentUser')
  if (saved) user.value = JSON.parse(saved)
})

function handleAuthed(u) {
  user.value = u
  localStorage.setItem('currentUser', JSON.stringify(u))
  page.value = 'home'
}

function logout() {
  user.value = null
  localStorage.removeItem('currentUser')
  page.value = 'home'
}
</script>

<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container d-flex justify-content-between">
        <span class="navbar-brand">NFP Project</span>

        <ul class="navbar-nav ms-auto align-items-center">
          <li class="nav-item me-2">
            <button class="btn btn-light btn-sm" @click="page = 'home'">Home</button>
          </li>

          <template v-if="!user">
            <li class="nav-item me-2">
              <button class="btn btn-outline-light btn-sm" @click="page = 'login'">Login</button>
            </li>
          </template>

          <template v-else>
            <li class="nav-item me-2">
              <button class="btn btn-outline-light btn-sm" @click="page = 'profile'">
                Profile
              </button>
            </li>
            <li class="nav-item d-flex align-items-center gap-2">
              <span class="text-white small d-none d-md-inline">Hi, {{ user.email }}</span>
              <button class="btn btn-outline-light btn-sm" @click="logout">Logout</button>
            </li>
          </template>
        </ul>
      </div>
    </nav>

    <main class="d-flex justify-content-center align-items-start w-100" style="min-height: 80vh">
      <HomePage v-if="page === 'home'" :user="user" />
      <LoginPage v-else-if="page === 'login'" @authed="handleAuthed" />
      <ProfilePage v-else-if="page === 'profile'" :user="user" />
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
