<script setup>
import { ref, computed, onMounted } from 'vue'
const props = defineProps({ user: Object })

const tips = ref([
  { id: 1, title: 'Healthy Diet', desc: 'Eat more fruits and vegetables, less sugar and salt' },
  {
    id: 2,
    title: 'Moderate Exercise',
    desc: '150 minutes of moderate-intensity exercise per week',
  },
  { id: 3, title: 'Regular Schedule', desc: 'Ensure 7–8 hours of sleep' },
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
  <section class="w-100 d-flex flex-column align-items-center">
    <h2 class="mb-3 text-center">welcome to Public Health</h2>
    <div class="w-100 mb-3">
      <input
        class="form-control mx-auto"
        style="max-width: 520px"
        placeholder="Search for health tips..."
        v-model.trim="q"
      />
    </div>
    <div class="row g-3 justify-content-center w-100" style="max-width: 1100px">
      <div class="col-12 col-md-6 col-lg-4" v-for="t in filtered" :key="t.id">
        <div class="card h-100 text-center">
          <div class="card-body">
            <h5 class="card-title">{{ t.title }}</h5>
            <p class="card-text">{{ t.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
