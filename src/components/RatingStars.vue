<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  itemId: { type: [String, Number], required: true },
})

const me = JSON.parse(localStorage.getItem('currentUser') || 'null')

const STORAGE_KEY = 'ratings_v2'
function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}
function writeAll(obj) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
}

const myScore = ref(0)
const avg = ref(0)
const count = ref(0)

function load() {
  const all = readAll()
  const bucket = all[props.itemId] || {}
  const scores = Object.values(bucket)
  count.value = scores.length
  avg.value = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  myScore.value = me ? bucket[me.email] || 0 : 0
}

function rate(n) {
  if (!me) {
    alert('Please login to rate')
    return
  }
  const all = readAll()
  const bucket = all[props.itemId] || {}
  bucket[me.email] = n
  all[props.itemId] = bucket
  writeAll(all)
  load()
}

onMounted(load)

const avgText = computed(() => (avg.value ? avg.value.toFixed(2) : '—'))
</script>

<template>
  <div class="d-flex align-items-center gap-2">
    <div class="btn-group btn-group-sm" role="group" aria-label="rate 1-5">
      <button
        v-for="n in 5"
        :key="n"
        class="btn"
        :class="n === myScore ? 'btn-primary' : 'btn-outline-primary'"
        @click="rate(n)"
      >
        {{ n }}
      </button>
    </div>
    <small class="text-muted">Avg: {{ avgText }} ({{ count }})</small>
  </div>
</template>
