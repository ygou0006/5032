<script setup>
import { ref, watch } from 'vue'
const emit = defineEmits(['authed'])

const mode = ref('login') // 'login' | 'register'
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const gender = ref('') // Male | Female | Other | Prefer not to say
const address = ref('')

const msg = ref('')
const errors = ref({
  email: '',
  password: '',
  confirmPassword: '',
  gender: '',
  address: '',
})

// -- Helpers for local demo store --
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

// -- Password rule: ≥9 chars & at least one uppercase --
function pwRules(pw) {
  return {
    hasUpper: /[A-Z]/.test(pw),
    longEnough: pw.length >= 9,
  }
}

// ---- Field-level validators (called on input) ----
function validateEmail() {
  if (!email.value) errors.value.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
    errors.value.email = 'Invalid email format'
  else errors.value.email = ''
}

function validatePassword() {
  if (!password.value) {
    errors.value.password = 'Password is required'
  } else {
    const r = pwRules(password.value)
    errors.value.password =
      !r.hasUpper || !r.longEnough
        ? 'Password must be at least 9 characters and contain at least one uppercase letter'
        : ''
  }
  // When password changes, also re-check confirm match
  if (mode.value === 'register') validateConfirm()
}

function validateConfirm() {
  if (mode.value !== 'register') {
    errors.value.confirmPassword = ''
    return
  }
  if (!confirmPassword.value) errors.value.confirmPassword = 'Please confirm your password'
  else if (confirmPassword.value !== password.value)
    errors.value.confirmPassword = 'Passwords do not match'
  else errors.value.confirmPassword = ''
}

function validateGender() {
  if (mode.value === 'register') {
    errors.value.gender = gender.value ? '' : 'Please select a gender'
  } else errors.value.gender = ''
}

function validateAddress() {
  if (mode.value === 'register') {
    errors.value.address =
      address.value && address.value.trim().length >= 5
        ? ''
        : 'Address is required (min 5 characters)'
  } else errors.value.address = ''
}

// ---- Live validation: watch inputs ----
watch(email, validateEmail)
watch(password, validatePassword)
watch(confirmPassword, validateConfirm)
watch(gender, validateGender)
watch(address, validateAddress)

// Overall validity before submit
function formValid() {
  validateEmail()
  validatePassword()
  if (mode.value === 'register') {
    validateConfirm()
    validateGender()
    validateAddress()
  }
  return Object.values(errors.value).every((v) => v === '')
}

function submit() {
  if (!formValid()) return

  const users = readUsers()
  if (mode.value === 'register') {
    const exists = users.find((u) => u.email.toLowerCase() === email.value.toLowerCase())
    if (exists) {
      msg.value = 'This email is already registered'
      return
    }
    const record = {
      email: email.value,
      password: password.value, // demo only
      gender: gender.value,
      address: address.value.trim(),
    }
    users.push(record)
    writeUsers(users)
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
    <div class="card shadow p-4" style="max-width: 520px; width: 100%">
      <h4 class="mb-3 text-center">{{ mode === 'login' ? 'Login' : 'Register' }}</h4>

      <!-- Email -->
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input
          class="form-control"
          :class="{ 'is-invalid': !!errors.email }"
          v-model.trim="email"
          type="email"
          placeholder="you@example.com"
        />
        <div class="invalid-feedback" v-if="errors.email">{{ errors.email }}</div>
      </div>

      <!-- Password (live policy check) -->
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input
          class="form-control"
          :class="{ 'is-invalid': !!errors.password }"
          v-model="password"
          type="password"
          placeholder="At least 9 chars & 1 uppercase"
        />
        <div class="invalid-feedback" v-if="errors.password">{{ errors.password }}</div>
      </div>

      <!-- Register-only fields -->
      <template v-if="mode === 'register'">
        <!-- Confirm Password (live mismatch check) -->
        <div class="mb-3">
          <label class="form-label">Confirm Password</label>
          <input
            class="form-control"
            :class="{ 'is-invalid': !!errors.confirmPassword }"
            v-model="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
          />
          <!-- Always show red text as soon as it mismatches -->
          <div class="invalid-feedback" v-if="errors.confirmPassword">
            {{ errors.confirmPassword }}
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Gender</label>
          <select class="form-select" :class="{ 'is-invalid': !!errors.gender }" v-model="gender">
            <option value="" disabled>Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
            <option>Prefer not to say</option>
          </select>
          <div class="invalid-feedback" v-if="errors.gender">{{ errors.gender }}</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Address</label>
          <textarea
            class="form-control"
            :class="{ 'is-invalid': !!errors.address }"
            v-model.trim="address"
            rows="2"
            placeholder="Street, City / State, Postcode"
          ></textarea>
          <div class="invalid-feedback" v-if="errors.address">{{ errors.address }}</div>
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

      <div
        class="small mt-3"
        :class="{
          'text-danger': msg.includes('Invalid') || msg.includes('already'),
          'text-success': msg.includes('success'),
        }"
      >
        {{ msg }}
      </div>
    </div>
  </div>
</template>
