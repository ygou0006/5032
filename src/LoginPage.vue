<script setup>
import { ref, onMounted } from 'vue'
const emit = defineEmits(['authed'])

const mode = ref('login')
const email = ref('')
const password = ref('')
const gender = ref('') // Male | Female | Other | Prefer not to say
const address = ref('')
const msg = ref('')

// Remember last email
onMounted(() => {
  const last = localStorage.getItem('lastEmail')
  if (last) email.value = last
})

function validate() {
  if (!email.value) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return 'Invalid email format'
  if (password.value.length < 6) return 'Password must be at least 6 characters'
  if (mode.value === 'register') {
    if (!gender.value) return 'Please select a gender'
    if (!address.value || address.value.trim().length < 5)
      return 'Address is required (min 5 chars)'
  }
  return ''
}

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem('users') || '[]')
  } catch {
    return []
  }
}
function writeUsers(arr) {
  localStorage.setItem('users', JSON.stringify(arr))
}

function submit() {
  const err = validate()
  if (err) {
    msg.value = err
    return
  }

  localStorage.setItem('lastEmail', email.value)

  const users = readUsers()

  if (mode.value === 'register') {
    const exists = users.find((u) => u.email.toLowerCase() === email.value.toLowerCase())
    if (exists) {
      msg.value = 'This email is already registered'
      return
    }

    const record = {
      email: email.value,
      password: password.value, // simple local demo only
      gender: gender.value,
      address: address.value.trim(),
    }
    users.push(record)
    writeUsers(users)

    // Auto sign-in after register
    const publicProfile = { email: record.email, gender: record.gender, address: record.address }
    localStorage.setItem('currentUser', JSON.stringify(publicProfile))
    emit('authed', publicProfile)
    msg.value = 'Registered successfully'
  } else {
    const found = users.find(
      (u) => u.email.toLowerCase() === email.value.toLowerCase() && u.password === password.value,
    )
    if (!found) {
      msg.value = 'Invalid email or password'
      return
    }
    const publicProfile = { email: found.email, gender: found.gender, address: found.address }
    localStorage.setItem('currentUser', JSON.stringify(publicProfile))
    emit('authed', publicProfile)
    msg.value = 'Logged in successfully'
  }
}
</script>

<template>
  <div class="d-flex justify-content-center w-100">
    <div class="card shadow p-4" style="max-width: 480px; width: 100%">
      <h4 class="mb-3 text-center">{{ mode === 'login' ? 'Login' : 'Register' }}</h4>

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
          placeholder="At least 6 characters"
        />
      </div>

      <template v-if="mode === 'register'">
        <div class="mb-3">
          <label class="form-label">Gender</label>
          <select class="form-select" v-model="gender">
            <option value="" disabled>Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
            <option>Prefer not to say</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Address</label>
          <textarea
            class="form-control"
            v-model.trim="address"
            rows="2"
            placeholder="Street, City / State, Postcode"
          ></textarea>
        </div>
      </template>

      <button class="btn btn-primary w-100 mb-2" @click="submit">
        {{ mode === 'login' ? 'Login' : 'Create account' }}
      </button>
      <button
        class="btn btn-outline-secondary w-100"
        @click="mode = mode === 'login' ? 'register' : 'login'"
      >
        Switch to {{ mode === 'login' ? 'Register' : 'Login' }}
      </button>

      <div class="small text-danger mt-3" v-if="msg">{{ msg }}</div>
    </div>
  </div>
</template>
