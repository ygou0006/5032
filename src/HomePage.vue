<script setup>
import { ref, computed, onMounted } from 'vue'
import RatingStars from './components/RatingStars.vue'
import { sanitizeString } from './utils/sanitize'

defineProps({ user: Object })

const tips = ref([
  {
    id: 'diet',
    title: 'Healthy Diet',
    desc: 'Eat more fruits and vegetables, less sugar and salt',
  },
  {
    id: 'exercise',
    title: 'Moderate Exercise',
    desc: '150 minutes of moderate-intensity exercise per week',
  },
  { id: 'sleep', title: 'Regular Schedule', desc: 'Ensure 7–8 hours of sleep' },
])

const q = ref('')
onMounted(() => {
  const last = localStorage.getItem('lastSearch')
  if (last) q.value = last
})

const filtered = computed(() => {
  const k = q.value.trim().toLowerCase()
  localStorage.setItem('lastSearch', q.value)
  if (!k) return tips.value
  return tips.value.filter(
    (t) => t.title.toLowerCase().includes(k) || t.desc.toLowerCase().includes(k),
  )
})
</script>

<template>
  <section class="container py-4 d-flex flex-column align-items-center">
    <h2 class="mb-3 text-center">Welcome to Public Health</h2>

    <div class="w-100 mb-3">
      <input
        class="form-control mx-auto"
        style="max-width: 520px"
        placeholder="Search for health tips..."
        v-model.trim="q"
        aria-label="Search health tips"
      />
    </div>

    <div class="row g-3 justify-content-center w-100" style="max-width: 1100px">
      <div class="col-12 col-md-6 col-lg-4" v-for="t in filtered" :key="t.id">
        <div class="card h-100 text-center shadow-sm">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ sanitizeString(t.title) }}</h5>
            <p class="card-text flex-grow-1">{{ sanitizeString(t.desc) }}</p>

            <div class="mt-2">
              <RatingStars :itemId="t.id" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="filtered.length === 0" class="col-12">
        <div class="alert alert-info text-center">
          No results found for "<strong>{{ sanitizeString(q) }}</strong
          >".
        </div>
      </div>
    </div>
  </section>
</template>
