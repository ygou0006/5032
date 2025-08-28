<script setup>
const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
})
</script>

<template>
  <div class="container py-4" style="max-width: 720px">
    <h3 class="mb-3">My Profile</h3>

    <div v-if="!user" class="alert alert-warning">You are not signed in. Please login first.</div>

    <div v-else class="card">
      <div class="card-body">
        <dl class="row mb-0">
          <dt class="col-sm-3">Email</dt>
          <dd class="col-sm-9">{{ user.email }}</dd>

          <dt class="col-sm-3">Gender</dt>
          <dd class="col-sm-9">{{ user.gender || '—' }}</dd>

          <dt class="col-sm-3">Address</dt>
          <dd class="col-sm-9" style="white-space: pre-line">{{ user.address || '—' }}</dd>
        </dl>
      </div>
    </div>
  </div>
</template>
