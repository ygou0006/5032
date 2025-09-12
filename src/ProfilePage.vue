<!-- src/ProfilePage.vue -->
<script setup>
import { ref, onMounted } from 'vue'
const me = ref(null)
onMounted(() => {
  me.value = JSON.parse(localStorage.getItem('currentUser') || 'null')
})
</script>

<template>
  <div class="container py-4">
    <h2 class="mb-3">My Profile</h2>
    <div v-if="!me" class="alert alert-warning">You are not signed in. Please login first.</div>
    <div v-else class="card shadow-sm">
      <div class="card-body">
        <p><strong>Email:</strong> {{ me.email }}</p>
        <p><strong>Gender:</strong> {{ me.gender || '-' }}</p>
        <p><strong>Address:</strong> {{ me.address || '-' }}</p>
        <p><strong>Role:</strong> {{ me.role }}</p>
      </div>
    </div>
  </div>
</template>
