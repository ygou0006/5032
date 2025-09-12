<!-- src/AdminPanel.vue -->
<script setup>
import { ref, onMounted } from 'vue'

const user = ref(null)
onMounted(() => {
  user.value = JSON.parse(localStorage.getItem('currentUser') || 'null')
})
</script>

<template>
  <div class="container py-4">
    <h2 class="mb-3">Admin Dashboard</h2>
    <p class="text-muted">Only admins can see this page.</p>

    <div v-if="user" class="alert alert-info">
      Logged in as: <strong>{{ user.email }}</strong> (role: <strong>{{ user.role }}</strong
      >)
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">User Management</h5>
            <p class="card-text">This is a placeholder panel for your admin-only features.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
