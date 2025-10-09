<template>
  <div id="app">
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>
    <Footer></Footer>
  </div>
</template>

<script>
import Navbar from './components/Layout/Navbar.vue'
import Footer from './components/Layout/Footer.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    Footer
  },
  created() {
    // 检查登录状态持久化
    this.$store.dispatch('checkAuthState')
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 62px; /* 为固定导航栏留出空间 */
}
</style>