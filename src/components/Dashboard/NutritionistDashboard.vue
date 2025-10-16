<template>
  <div class="nutritionist-dashboard">
    <div class="container">
      <!-- 页面标题 -->
      <div class="row mb-4">
        <div class="col-12">
          <h2 class="fw-bold text-success">Nutritionist Dashboard</h2>
          <p class="lead">Manage Your Clients & Appointments</p>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="row mb-5">
        <div class="col-md-3 mb-3" v-for="stat in nutritionistStats" :key="stat.id">
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
          <!-- 全部预约 -->
          <div class="card mb-4">
            <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0">All Appointments</h5>
              <div class="btn-group">
                <button class="btn btn-light btn-sm" :class="{ active: appointmentFilter === 'all' }"
                  @click="appointmentFilter = 'all'">
                  All
                </button>
                <button class="btn btn-light btn-sm" :class="{ active: appointmentFilter === 'confirmed' }"
                  @click="appointmentFilter = 'confirmed'">
                  Confirmed
                </button>
                <button class="btn btn-light btn-sm" :class="{ active: appointmentFilter === 'pending' }"
                  @click="appointmentFilter = 'pending'">
                  Pending
                </button>
              </div>
            </div>
            <div class="card-body">
              <div v-if="filteredAppointments.length > 0">
                <DataTable :data="filteredAppointments" :columns="appointmentColumns" :searchable="true"
                  :sortable="true" :paginate="true" :initial-page-size="10" :actions="['view', 'update']"
                  @view="viewAppointmentDetails" @update="updateAppointmentStatus" />
              </div>
              <div v-else class="text-center py-4">
                <i class="fas fa-calendar-times display-4 text-muted mb-3"></i>
                <p class="text-muted">No appointments found</p>
              </div>
            </div>
          </div>

          <!-- 我的客户 -->
          <div class="card">
            <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0">My Clients</h5>
              <button class="btn btn-light btn-sm" @click="exportClients">
                <i class="fas fa-download me-1"></i>Export
              </button>
            </div>
            <div class="card-body">
              <div v-if="clients.length > 0">
                <DataTable :data="clients" :columns="clientColumns" :searchable="true" :sortable="true" :paginate="true"
                  :actions="['view', 'message']" @view="viewClient" @message="messageClient" />
              </div>
              <div v-else class="text-center py-4">
                <i class="fas fa-users display-4 text-muted mb-3"></i>
                <p class="text-muted">No clients found</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧边栏 -->
        <div class="col-lg-4">
          <!-- 即将到来的预约 -->
          <div class="card">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0">Upcoming Appointments</h5>
            </div>
            <div class="card-body">
              <div v-if="upcomingAppointments.length > 0">
                <div v-for="appointment in upcomingAppointments" :key="appointment.id"
                  class="upcoming-item mb-3 pb-3 border-bottom">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="fw-bold mb-1">{{ appointment.userName }}</h6>
                      <p class="small text-muted mb-1">
                        <i class="fas fa-clock me-1"></i>
                        {{ formatDateTime(appointment.dateTime) }}
                      </p>
                      <p class="small text-muted mb-1">
                        <i class="fas fa-stethoscope me-1"></i>
                        {{ formatAppointmentType(appointment.type) }}
                      </p>
                      <span class="badge" :class="getStatusBadgeClass(appointment.status)">
                        {{ appointment.status }}
                      </span>
                    </div>
                    <div class="text-end">
                      <button class="btn btn-sm btn-outline-success" @click="startAppointment(appointment)"
                        v-if="appointment.status === 'confirmed'" title="Start Appointment">
                        <i class="fas fa-play"></i>
                      </button>
                    </div>
                  </div>
                  <div v-if="appointment.notes" class="mt-2">
                    <p class="small text-muted mb-0">
                      <strong>Notes:</strong> {{ appointment.notes }}
                    </p>
                  </div>
                  <div v-if="appointment.serviceTitle" class="mt-1">
                    <span class="badge bg-secondary small">{{ appointment.serviceTitle }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-3">
                <i class="fas fa-calendar-plus display-4 text-muted mb-3"></i>
                <p class="text-muted">No upcoming appointments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { db } from '@/services/firebase'
import {
  collection,
  getDocs,
  doc,
  query,
  where,
  orderBy,
  limit,
  updateDoc
} from 'firebase/firestore'
import DataTable from '@/components/Common/DataTable.vue'
import { exportToCSV } from '@/utils/helpers'

export default {
  name: 'NutritionistDashboard',
  components: {
    DataTable
  },
  data() {
    return {
      nutritionistStats: [
        { id: 1, icon: 'fas fa-users', value: '0', label: 'Active Clients' },
        { id: 2, icon: 'fas fa-calendar-check', value: '0', label: 'Total Appointments' },
        { id: 3, icon: 'fas fa-star', value: '0', label: 'Average Rating' },
        { id: 4, icon: 'fas fa-dollar-sign', value: '$0', label: 'Monthly Revenue' }
      ],
      allAppointments: [],
      upcomingAppointments: [],
      clients: [],
      appointmentFilter: 'all',
      appointmentColumns: [
        { key: 'userName', label: 'Client', sortable: true },
        { key: 'type', label: 'Type', sortable: true, formatter: this.formatAppointmentType },
        { key: 'dateTime', label: 'Date & Time', sortable: true, formatter: this.formatDateTime },
        { key: 'status', label: 'Status', sortable: true, formatter: this.formatStatus }
      ],
      clientColumns: [
        { key: 'firstName', label: 'First Name', sortable: true },
        { key: 'lastName', label: 'Last Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'phone', label: 'Phone', sortable: true },
        { key: 'lastAppointment', label: 'Last Visit', sortable: true, formatter: this.formatDate }
      ]
    }
  },
  computed: {
    ...mapGetters(['currentUser', 'userProfile']),

    filteredAppointments() {
      if (this.appointmentFilter === 'all') {
        return this.allAppointments
      }
      return this.allAppointments.filter(apt => apt.status === this.appointmentFilter)
    }
  },
  async mounted() {
    await this.loadNutritionistData()
  },
  methods: {
    async loadNutritionistData() {
      if (!this.currentUser) return

      try {
        // 首先加载所有预约 - 避免复合查询
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('nutritionistId', '==', this.currentUser.uid)
          // 移除 orderBy 来避免复合索引需求
        )
        const appointmentsSnapshot = await getDocs(appointmentsQuery)
        const allAppointmentsRaw = await this.processAppointments(appointmentsSnapshot)

        // 在客户端进行排序
        this.allAppointments = allAppointmentsRaw.sort((a, b) =>
          new Date(b.dateTime) - new Date(a.dateTime)
        )

        // 在客户端过滤即将到来的预约
        const now = new Date()
        this.upcomingAppointments = this.allAppointments
          .filter(apt =>
            new Date(apt.dateTime) > now &&
            apt.status === 'confirmed'
          )
          .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
          .slice(0, 10) // 限制显示数量

        // 加载客户数据
        await this.loadClientsFromAppointments()

        // 更新统计数据
        this.updateStats()

      } catch (error) {
        console.error('Error loading nutritionist data:', error)
        // 如果仍然有错误，使用更简单的方法
        await this.loadNutritionistDataFallback()
      }
    },

    // 备用加载方法 - 不使用复杂查询
    async loadNutritionistDataFallback() {
      try {
        // 简单地获取所有预约，不进行过滤
        const appointmentsSnapshot = await getDocs(collection(db, 'appointments'))
        const allAppointments = await this.processAppointments(appointmentsSnapshot)

        // 在客户端过滤出该营养师的预约
        this.allAppointments = allAppointments
          .filter(apt => apt.nutritionistId === this.currentUser.uid)
          .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))

        // 在客户端过滤即将到来的预约
        const now = new Date()
        this.upcomingAppointments = this.allAppointments
          .filter(apt =>
            new Date(apt.dateTime) > now &&
            apt.status === 'confirmed'
          )
          .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
          .slice(0, 10)

        // 加载客户数据
        await this.loadClientsFromAppointments()

        // 更新统计数据
        this.updateStats()

      } catch (error) {
        console.error('Error in fallback loading:', error)
        this.$toast.error('Failed to load dashboard data')
      }
    },

    async loadClientsFromAppointments() {
      // 从预约中提取唯一的用户ID
      const uniqueUserIds = [...new Set(this.allAppointments
        .filter(apt => apt.userId)
        .map(apt => apt.userId))]

      this.clients = []

      // 获取每个用户的详细信息
      for (const userId of uniqueUserIds) {
        try {
          const userQuery = query(
            collection(db, 'users'),
            where('uid', '==', userId)
          )
          const userSnapshot = await getDocs(userQuery)

          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data()

            // 获取用户最近的预约
            const userAppointments = this.allAppointments
              .filter(apt => apt.userId === userId)
              .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))

            const lastAppointment = userAppointments.length > 0 ? userAppointments[0].dateTime : null

            this.clients.push({
              id: userId,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: userData.email || '',
              phone: userData.phone || '',
              lastAppointment: lastAppointment,
              appointmentCount: userAppointments.length
            })
          }
        } catch (error) {
          console.error('Error loading user data:', error)
        }
      }

      // 按最后预约时间排序
      this.clients.sort((a, b) => {
        if (!a.lastAppointment && !b.lastAppointment) return 0
        if (!a.lastAppointment) return 1
        if (!b.lastAppointment) return -1
        return new Date(b.lastAppointment) - new Date(a.lastAppointment)
      })
    },

    async processAppointments(snapshot) {
      const appointments = []

      for (const docSnap of snapshot.docs) {
        const appointmentData = docSnap.data()
        const appointment = {
          id: docSnap.id,
          ...appointmentData
        }

        // 确保日期是Date对象
        if (appointment.dateTime && appointment.dateTime.toDate) {
          appointment.dateTime = appointment.dateTime.toDate()
        }

        // 获取用户信息
        if (appointment.userId) {
          try {
            const userQuery = query(
              collection(db, 'users'),
              where('uid', '==', appointment.userId)
            )
            const userSnapshot = await getDocs(userQuery)
            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data()
              appointment.userName = `${userData.firstName} ${userData.lastName}`
              appointment.userEmail = userData.email
            } else {
              appointment.userName = 'Unknown User'
            }
          } catch (error) {
            console.error('Error loading user info:', error)
            appointment.userName = 'Error Loading User'
          }
        }

        appointments.push(appointment)
      }

      return appointments
    },

    updateStats() {
      // 活跃客户数（过去30天有预约的客户）
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const activeClients = this.clients.filter(client =>
        client.lastAppointment && new Date(client.lastAppointment) > thirtyDaysAgo
      ).length

      this.nutritionistStats[0].value = activeClients
      this.nutritionistStats[1].value = this.allAppointments.length

      // 计算平均评分（模拟数据）
      const ratings = this.allAppointments
        .filter(apt => apt.rating)
        .map(apt => apt.rating)

      const averageRating = ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : '0.0'

      this.nutritionistStats[2].value = averageRating

      // 计算月收入（模拟数据）
      const monthlyRevenue = this.allAppointments
        .filter(apt => {
          const aptDate = new Date(apt.dateTime)
          const firstDayOfMonth = new Date(aptDate.getFullYear(), aptDate.getMonth(), 1)
          const firstDayOfNextMonth = new Date(aptDate.getFullYear(), aptDate.getMonth() + 1, 1)
          return aptDate >= firstDayOfMonth && aptDate < firstDayOfNextMonth
        })
        .reduce((total, apt) => total + (apt.cost || 0), 0)

      this.nutritionistStats[3].value = `$${monthlyRevenue}`
    },

    formatDate(timestamp) {
      if (!timestamp) return 'N/A'
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    },

    formatDateTime(timestamp) {
      if (!timestamp) return 'N/A'
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

    formatAppointmentType(type) {
      const types = {
        initial: 'Initial Consultation',
        followup: 'Follow-up Session',
        emergency: 'Emergency Consultation'
      }
      return types[type] || type
    },

    formatStatus(status) {
      return status.charAt(0).toUpperCase() + status.slice(1)
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

    startAppointment(appointment) {
      // 实现开始预约逻辑
      console.log('Start appointment:', appointment)
      this.$toast.info('Starting appointment functionality coming soon')
    },

    viewAppointmentDetails(appointment) {
      // 查看预约详情
      console.log('View appointment:', appointment)
      this.$toast.info(`Viewing appointment with ${appointment.userName}`)
    },

    async updateAppointmentStatus(appointment) {
      // 更新预约状态
      const newStatus = prompt(`Update status for appointment with ${appointment.userName}:\n(current: ${appointment.status})`, appointment.status)

      if (newStatus && ['confirmed', 'pending', 'cancelled', 'completed'].includes(newStatus.toLowerCase())) {
        try {
          await updateDoc(doc(db, 'appointments', appointment.id), {
            status: newStatus.toLowerCase(),
            updatedAt: new Date()
          })

          // 更新本地数据
          const aptIndex = this.allAppointments.findIndex(apt => apt.id === appointment.id)
          if (aptIndex !== -1) {
            this.allAppointments[aptIndex].status = newStatus.toLowerCase()
          }

          // 更新即将到来的预约列表
          const upcomingIndex = this.upcomingAppointments.findIndex(apt => apt.id === appointment.id)
          if (upcomingIndex !== -1) {
            if (newStatus.toLowerCase() === 'confirmed') {
              this.upcomingAppointments[upcomingIndex].status = 'confirmed'
            } else {
              this.upcomingAppointments.splice(upcomingIndex, 1)
            }
          }

          this.updateStats()
          this.$toast.success('Appointment status updated successfully')
        } catch (error) {
          console.error('Error updating appointment status:', error)
          this.$toast.error('Failed to update appointment status')
        }
      }
    },

    viewClient(client) {
      // 查看客户详情
      console.log('View client:', client)
      this.$toast.info(`Viewing client: ${client.firstName} ${client.lastName}`)
    },

    messageClient(client) {
      // 给客户发消息
      console.log('Message client:', client)
      this.$toast.info(`Messaging ${client.firstName} ${client.lastName}`)
    },

    exportClients() {
      const clientData = this.clients.map(client => ({
        'First Name': client.firstName,
        'Last Name': client.lastName,
        'Email': client.email,
        'Phone': client.phone,
        'Last Appointment': this.formatDate(client.lastAppointment),
        'Total Appointments': client.appointmentCount
      }))

      exportToCSV(clientData, 'clients-export.csv')
      this.$toast.success('Clients exported successfully')
    }
  }
}
</script>

<style scoped>
.nutritionist-dashboard {
  min-height: calc(100vh - 80px);
  background-color: #f8f9fa;
}

.upcoming-item:last-child {
  border-bottom: none !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

.btn-group .btn.active {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
}

.card {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: none;
}

.card-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>