<script setup>
import { ref, onMounted } from 'vue'
const emit = defineEmits(['authed'])

const mode = ref('login') // 'login' | 'register'
const email = ref('')
const password = ref('')
const agree = ref(false)
const msg = ref('')

onMounted(() => {
  const last = localStorage.getItem('lastEmail')
  if (last) email.value = last
})

function validate() {
  if (!email.value) return 'Please fill in your email address'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
    return 'The email address format is incorrect'
  if (password.value.length < 6) return 'The password cannot be less than 6 characters'
  if (mode.value === 'register' && !agree.value) return 'Please check the box to agree to the terms'
  return ''
}

function submit() {
  const err = validate()
  if (err) {
    msg.value = err
    return
  }

  const user = { email: email.value }
  localStorage.setItem('lastEmail', email.value)
  emit('authed', user)
  msg.value = `${mode.value === 'login' ? 'login' : 'Register'}Success`
}
</script>

<template>
  <div class="d-flex justify-content-center">
    <div class="card shadow p-4" style="max-width: 420px; width: 100%">
      <h4 class="mb-3 text-center">{{ mode === 'login' ? 'login' : 'Register' }}</h4>

      <div class="mb-3">
        <label class="form-label">Email</label>
        <input
          class="form-control"
          v-model.trim="email"
          type="email"
          placeholder="you@example.com"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Password</label>
        <input
          class="form-control"
          v-model="password"
          type="password"
          minlength="6"
          placeholder="Password more than 6 "
        />
      </div>

      <div v-if="mode === 'register'" class="form-check mb-3">
        <input id="agree" class="form-check-input" type="checkbox" v-model="agree" />
        <label class="form-check-label" for="agree">I agree to the terms of service</label>
      </div>

      <button class="btn btn-primary w-100 mb-2" @click="submit">
        {{ mode === 'login' ? 'login' : 'Register' }}
      </button>
      <button
        class="btn btn-outline-secondary w-100"
        @click="mode = mode === 'login' ? 'register' : 'login'"
      >
        Go to {{ mode === 'login' ? 'Register' : 'login' }}
      </button>

      <div class="small text-danger mt-3" v-if="msg">{{ msg }}</div>
    </div>
  </div>
</template>
