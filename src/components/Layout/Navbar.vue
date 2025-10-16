<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-success fixed-top">
    <div class="container">
      <router-link class="navbar-brand" to="/">
        <i class="fas fa-apple-alt me-2"></i>
        Nutrition Education
      </router-link>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/about">About</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/services">Services</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/resources">Resources</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/blog">Blog</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/contact">Contact</router-link>
          </li>
        </ul>

        <ul class="navbar-nav">
          <template v-if="isAuthenticated">
            <!-- 用户特定菜单 -->
            <li class="nav-item dropdown" v-if="userRole === 'user'">
              <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                <i class="fas fa-user me-1"></i> {{ currentUser.displayName }}
              </a>
              <ul class="dropdown-menu">
                <li><router-link class="dropdown-item" to="/dashboard">Dashboard</router-link></li>
                <li><router-link class="dropdown-item" to="/appointments">Book Appointment</router-link></li>
                <li><router-link class="dropdown-item" to="/profile">Profile</router-link></li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li><a class="dropdown-item" href="#" @click="logout">Logout</a></li>
              </ul>
            </li>

            <!-- 营养师菜单 -->
            <li class="nav-item dropdown" v-if="userRole === 'nutritionist'">
              <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                <i class="fas fa-user-md me-1"></i> Nutritionist
              </a>
              <ul class="dropdown-menu">
                <li><router-link class="dropdown-item" to="/nutritionist-dashboard">Dashboard</router-link></li>
                <li><router-link class="dropdown-item" to="/analytics">Analytics</router-link></li>
                <li><router-link class="dropdown-item" to="/profile">Profile</router-link></li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li><a class="dropdown-item" href="#" @click="logout">Logout</a></li>
              </ul>
            </li>

            <!-- 管理员菜单 -->
            <li class="nav-item dropdown" v-if="userRole === 'admin'">
              <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                <i class="fas fa-cog me-1"></i> Admin
              </a>
              <ul class="dropdown-menu">
                <li><router-link class="dropdown-item" to="/admin-dashboard">Dashboard</router-link></li>
                <!--li><router-link class="dropdown-item" to="/analytics">Analytics</router-link></li>
                <li><router-link class="dropdown-item" to="/profile">Profile</router-link></li-->
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li><a class="dropdown-item" href="#" @click="logout">Logout</a></li>
              </ul>
            </li>
          </template>
          <template v-else>
            <li class="nav-item">
              <router-link class="nav-link" to="/login">Login</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/register">Register</router-link>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Navbar',
  computed: {
    ...mapGetters(['isAuthenticated', 'userRole', 'currentUser'])
  },
  methods: {
    ...mapActions(['logout'])
  }
}
</script>

<style scoped>
.navbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
}

.nav-link {
  font-weight: 500;
}

.nav-link.router-link-active {
  color: #fff !important;
  font-weight: bold;
}
</style>