<template>
  <div class="user-dashboard">
    <div class="container">
      <!-- 页面标题 -->
      <div class="row mb-4">
        <div class="col-12">
          <h2 class="fw-bold text-success">Welcome, {{ userProfile?.firstName || 'User' }}!</h2>
          <p class="lead">Your Personal Nutrition Dashboard</p>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="row mb-5">
        <div class="col-md-3 mb-3" v-for="stat in userStats" :key="stat.id">
          <div class="card text-center h-100 border-0 shadow-sm">
            <div class="card-body">
              <i :class="stat.icon" class="display-6 text-success mb-3"></i>
              <h3 class="card-title text-dark">{{ stat.value }}</h3>
              <p class="card-text small text-muted">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- 左侧内容 -->
        <div class="col-lg-8">
          <!-- 快速操作 -->
          <div class="card mb-4">
            <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Quick Actions</h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-4" v-for="action in quickActions" :key="action.id">
                  <div class="text-center p-3 border rounded hover-card">
                    <i :class="action.icon" class="display-6 text-success mb-3"></i>
                    <h6 class="fw-bold">{{ action.title }}</h6>
                    <p class="small text-muted mb-2">{{ action.description }}</p>
                    <router-link :to="action.link" class="btn btn-sm btn-outline-success">
                      {{ action.buttonText }}
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 最近的预约 -->
          <div class="card mb-4">
            <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Recent Appointments</h5>
              <router-link to="/appointments" class="btn btn-light btn-sm">
                View All
              </router-link>
            </div>
            <div class="card-body">
              <div v-if="appointments.length > 0">
                <div v-for="appointment in recentAppointments" :key="appointment.id"
                  class="appointment-item border-bottom pb-3 mb-3">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="fw-bold mb-1">{{ getNutritionistName(appointment.nutritionistId) }}</h6>
                      <p class="mb-1 small text-muted">
                        <i class="fas fa-calendar me-1"></i>
                        {{ formatDate(appointment.dateTime) }}
                      </p>
                      <p class="mb-1 small text-muted">
                        <i class="fas fa-clock me-1"></i>
                        {{ formatTime(appointment.dateTime) }}
                      </p>
                      <span class="badge" :class="getStatusBadgeClass(appointment.status)">
                        {{ appointment.status }}
                      </span>
                      <!-- 显示服务信息 -->
                      <div v-if="appointment.serviceTitle" class="mt-1">
                        <span class="badge bg-secondary small">{{ appointment.serviceTitle }}</span>
                      </div>
                    </div>
                    <div class="text-end">
                      <p class="mb-1 fw-bold text-success">{{ appointment.type }}</p>
                      <button v-if="appointment.status === 'confirmed'" class="btn btn-sm btn-outline-danger"
                        @click="cancelAppointment(appointment)">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4">
                <i class="fas fa-calendar-times display-4 text-muted mb-3"></i>
                <p class="text-muted">No appointments scheduled</p>
                <router-link to="/appointments" class="btn btn-success">
                  Book Your First Appointment
                </router-link>
              </div>
            </div>
          </div>

          <!-- 营养日志 -->
          <div class="card">
            <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Recent Nutrition Logs</h5>
              <button class="btn btn-light btn-sm" @click="showAddLogModal = true">
                Add Entry
              </button>
            </div>
            <div class="card-body">
              <DataTable :data="nutritionLogs" :columns="nutritionColumns" :searchable="true" :sortable="true"
                :paginate="true" :initial-page-size="5" />
            </div>
          </div>
        </div>

        <!-- 右侧边栏 -->
        <div class="col-lg-4">
          <!-- 营养统计 -->
          <div class="card mb-4">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0">Nutrition Summary</h5>
            </div>
            <div class="card-body">
              <div class="nutrition-summary">
                <div class="nutrition-item mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="small">Average Daily Calories</span>
                    <span class="small fw-bold text-success">{{ averageCalories }}</span>
                  </div>
                  <div class="progress" style="height: 6px;">
                    <div class="progress-bar bg-success"
                      :style="{ width: Math.min((averageCalories / 2500) * 100, 100) + '%' }"></div>
                  </div>
                </div>
                <div class="nutrition-item mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="small">Protein (g/day)</span>
                    <span class="small fw-bold text-info">{{ averageProtein }}</span>
                  </div>
                  <div class="progress" style="height: 6px;">
                    <div class="progress-bar bg-info"
                      :style="{ width: Math.min((averageProtein / 100) * 100, 100) + '%' }"></div>
                  </div>
                </div>
                <div class="nutrition-item">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="small">Carbs (g/day)</span>
                    <span class="small fw-bold text-warning">{{ averageCarbs }}</span>
                  </div>
                  <div class="progress" style="height: 6px;">
                    <div class="progress-bar bg-warning"
                      :style="{ width: Math.min((averageCarbs / 300) * 100, 100) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 卡路里摄入曲线 -->
          <div class="card mb-4">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0">Calorie Intake Trend</h5>
            </div>
            <div class="card-body">
              <div class="chart-container" style="height: 200px;">
                <canvas ref="calorieChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加日志模态框 -->
    <div class="modal fade" :class="{ show: showAddLogModal, 'd-block': showAddLogModal }" tabindex="-1"
      v-if="showAddLogModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">Add Nutrition Log</h5>
            <button type="button" class="btn-close btn-close-white" @click="showAddLogModal = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addNutritionLog">
              <div class="mb-3">
                <label class="form-label">Date</label>
                <input type="date" class="form-control" v-model="logForm.date" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Meal Type</label>
                <select class="form-select" v-model="logForm.mealType" required>
                  <option value="">Select Meal</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Calories</label>
                  <input type="number" class="form-control" v-model="logForm.calories">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Protein (g)</label>
                  <input type="number" class="form-control" v-model="logForm.protein">
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Carbs (g)</label>
                  <input type="number" class="form-control" v-model="logForm.carbs">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Fat (g)</label>
                  <input type="number" class="form-control" v-model="logForm.fat">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" rows="3" v-model="logForm.description"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showAddLogModal = false">
              Cancel
            </button>
            <button type="button" class="btn btn-success" @click="addNutritionLog">
              Save Log
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showAddLogModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { db } from '@/services/firebase'
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore'
import DataTable from '@/components/Common/DataTable.vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default {
  name: 'UserDashboard',
  components: {
    DataTable
  },
  data() {
    return {
      userStats: [
        { id: 1, icon: 'fas fa-apple-alt', value: '0', label: 'Meals Logged' },
        { id: 2, icon: 'fas fa-heart', value: '0', label: 'Active Goals' },
        { id: 3, icon: 'fas fa-calendar-check', value: '0', label: 'Upcoming Appointments' },
        { id: 4, icon: 'fas fa-chart-line', value: '0', label: 'Progress Score' }
      ],
      quickActions: [
        {
          id: 1,
          icon: 'fas fa-calendar-plus',
          title: 'Book Appointment',
          description: 'Schedule with nutrition experts',
          link: '/appointments',
          buttonText: 'Book Now'
        },
        {
          id: 2,
          icon: 'fas fa-utensils',
          title: 'Meal Plans',
          description: 'Access personalized meal plans',
          link: '/resources',
          buttonText: 'View Plans'
        },
        {
          id: 3,
          icon: 'fas fa-file-export',
          title: 'Export Data',
          description: 'Download your nutrition data',
          link: '/resources',
          buttonText: 'Export'
        }
      ],
      appointments: [],
      nutritionLogs: [],
      showAddLogModal: false,
      logForm: {
        date: new Date().toISOString().split('T')[0],
        mealType: '',
        description: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
      },
      nutritionColumns: [
        { key: 'date', label: 'Date', sortable: true },
        { key: 'mealType', label: 'Meal', sortable: true },
        { key: 'calories', label: 'Calories', sortable: true },
        { key: 'protein', label: 'Protein (g)', sortable: true },
        { key: 'carbs', label: 'Carbs (g)', sortable: true },
        { key: 'fat', label: 'Fat (g)', sortable: true }
      ],
      calorieChart: null,
      nutritionists: [
        { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Sports Nutrition' },
        { id: 2, name: 'Dr. Mike Chen', specialty: 'Clinical Nutrition' },
        { id: 3, name: 'Dr. Emily Davis', specialty: 'Pediatric Nutrition' }
      ],
      unsubscribeNutritionLogs: null
    }
  },
  computed: {
    ...mapGetters(['currentUser', 'userProfile']),

    recentAppointments() {
      return this.appointments
        .filter(apt => apt.status !== 'cancelled')
        .slice(0, 3)
    },

    averageCalories() {
      if (this.nutritionLogs.length === 0) return 0
      const total = this.nutritionLogs.reduce((sum, log) => sum + (log.calories || 0), 0)
      return Math.round(total / this.nutritionLogs.length)
    },

    averageProtein() {
      if (this.nutritionLogs.length === 0) return 0
      const total = this.nutritionLogs.reduce((sum, log) => sum + (log.protein || 0), 0)
      return Math.round(total / this.nutritionLogs.length)
    },

    averageCarbs() {
      if (this.nutritionLogs.length === 0) return 0
      const total = this.nutritionLogs.reduce((sum, log) => sum + (log.carbs || 0), 0)
      return Math.round(total / this.nutritionLogs.length)
    }
  },
  async mounted() {
    await this.loadUserData()
  },
  beforeUnmount() {
    if (this.calorieChart) {
      this.calorieChart.destroy()
    }
    if (this.unsubscribeNutritionLogs) {
      this.unsubscribeNutritionLogs()
    }
  },
  methods: {
    async loadUserData() {
      if (!this.currentUser) return

      try {
        // 加载预约数据 - 使用实时监听
        await this.setupAppointmentsListener()

        // 加载营养日志 - 使用实时监听
        await this.setupNutritionLogsListener()

        // 更新统计数据
        this.updateStats()

      } catch (error) {
        console.error('Error loading user data:', error)
      }
    },

    async setupAppointmentsListener() {
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('userId', '==', this.currentUser.uid)
      )

      // 设置实时监听
      this.unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
        this.appointments = []
        snapshot.forEach(doc => {
          const appointment = {
            id: doc.id,
            ...doc.data()
          }
          // 确保日期是Date对象
          if (appointment.dateTime && appointment.dateTime.toDate) {
            appointment.dateTime = appointment.dateTime.toDate()
          }
          this.appointments.push(appointment)
        })
        this.updateStats()
      })
    },

    async setupNutritionLogsListener() {
      const logsQuery = query(
        collection(db, 'nutritionLogs'),
        where('userId', '==', this.currentUser.uid),
        //orderBy('date', 'desc')
      )

      // 设置实时监听
      this.unsubscribeNutritionLogs = onSnapshot(logsQuery, (snapshot) => {
        this.nutritionLogs = []
        snapshot.forEach(doc => {
          const log = {
            id: doc.id,
            ...doc.data()
          }
          this.nutritionLogs.push(log)
        })

        // 更新图表和统计数据
        this.updateCalorieChart()
        this.updateStats()
      })
    },

    updateStats() {
      this.userStats[0].value = this.nutritionLogs.length
      this.userStats[1].value = '3' // 模拟目标数
      this.userStats[2].value = this.appointments.filter(apt =>
        apt.status === 'confirmed' && new Date(apt.dateTime) > new Date()
      ).length

      // 简单的进度评分计算
      const progressScore = Math.min(
        this.nutritionLogs.length * 2 +
        this.appointments.filter(apt => apt.status === 'completed').length * 10,
        100
      )
      this.userStats[3].value = progressScore
    },

    initCalorieChart() {
      const ctx = this.$refs.calorieChart
      if (!ctx) return

      this.calorieChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Calories',
            data: [],
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                drawBorder: false
              },
              title: {
                display: true,
                text: 'Calories'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      })
    },

    updateCalorieChart() {
      if (this.nutritionLogs.length === 0) {
        // 如果没有数据，清空图表
        if (this.calorieChart) {
          this.calorieChart.data.labels = []
          this.calorieChart.data.datasets[0].data = []
        }
        return
      }

      // 计算数据
      const dailyCalories = {}
      this.nutritionLogs.forEach(log => {
        if (dailyCalories[log.date]) {
          dailyCalories[log.date] += parseInt(log.calories) || 0
        } else {
          dailyCalories[log.date] = parseInt(log.calories) || 0
        }
      })

      const dates = Object.keys(dailyCalories)
        .sort()
        .slice(-7)

      const calories = dates.map(date => dailyCalories[date])

      const formattedDates = dates.map(date => {
        const dateObj = new Date(date)
        return dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      })

      // 销毁旧图表
      if (this.calorieChart) {
        this.calorieChart.destroy()
      }

      // 创建新图表
      const ctx = this.$refs.calorieChart
      if (!ctx) return

      this.calorieChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: formattedDates,
          datasets: [{
            label: 'Calories',
            data: calories,
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                drawBorder: false
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      })
    },

    formatDate(timestamp) {
      if (!timestamp) return ''
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    },

    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    getStatusBadgeClass(status) {
      const classes = {
        confirmed: 'bg-success',
        pending: 'bg-warning',
        cancelled: 'bg-danger',
        completed: 'bg-info'
      }
      return classes[status] || 'bg-secondary'
    },

    getNutritionistName(nutritionistId) {
      const nutritionist = this.nutritionists.find(n => n.id === nutritionistId)
      return nutritionist ? nutritionist.name : 'Unknown Nutritionist'
    },

    async cancelAppointment(appointment) {
      if (!confirm('Are you sure you want to cancel this appointment?')) return

      try {
        await deleteDoc(doc(db, 'appointments', appointment.id))
        this.$toast.success('Appointment cancelled successfully')
      } catch (error) {
        console.error('Error cancelling appointment:', error)
        this.$toast.error('Failed to cancel appointment')
      }
    },

    async addNutritionLog() {
      if (!this.currentUser) return

      try {
        await addDoc(collection(db, 'nutritionLogs'), {
          userId: this.currentUser.uid,
          date: this.logForm.date,
          mealType: this.logForm.mealType,
          description: this.logForm.description,
          calories: parseInt(this.logForm.calories) || 0,
          protein: parseInt(this.logForm.protein) || 0,
          carbs: parseInt(this.logForm.carbs) || 0,
          fat: parseInt(this.logForm.fat) || 0,
          createdAt: new Date()
        })

        this.showAddLogModal = false
        this.resetLogForm()
        this.$toast.success('Nutrition log added successfully')

        // 数据会自动通过实时监听更新，无需手动重新加载

      } catch (error) {
        console.error('Error adding nutrition log:', error)
        this.$toast.error('Failed to add nutrition log')
      }
    },

    resetLogForm() {
      this.logForm = {
        date: new Date().toISOString().split('T')[0],
        mealType: '',
        description: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
      }
    }
  }
}
</script>

<style scoped>
.user-dashboard {
  min-height: calc(100vh - 80px);
  background-color: #f8f9fa;
}

.hover-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: #28a745 !important;
}

.appointment-item:last-child {
  border-bottom: none !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

.nutrition-item:last-child {
  margin-bottom: 0 !important;
}

.modal-backdrop {
  opacity: 0.5;
}
</style>