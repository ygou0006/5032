<template>
  <div class="admin-dashboard">
    <div class="container">
      <!-- 页面标题 -->
      <div class="row mb-4">
        <div class="col-12">
          <h2 class="fw-bold text-success">Admin Dashboard</h2>
          <p class="lead">System Overview & Management</p>
        </div>
      </div>

      <!-- 系统统计 -->
      <div class="row mb-5">
        <div class="col-md-3 mb-3" v-for="stat in systemStats" :key="stat.id">
          <div class="card text-center h-100 border-0 shadow-sm">
            <div class="card-body">
              <i :class="stat.icon" class="display-6 text-success mb-3"></i>
              <h3 class="card-title text-dark">{{ stat.value }}</h3>
              <p class="card-text small text-muted">{{ stat.label }}</p>
              <!--p class="small" :class="stat.trendClass">
                <i :class="stat.trendIcon"></i> {{ stat.trend }}
              </p-->
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- 主要内容 -->
        <div class="col-lg-8">
          <!-- 用户注册趋势图表 -->
          <div class="card mb-4">
            <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0">User Registration Trends</h5>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-light" :class="{ active: chartPeriod === '7d' }"
                  @click="changeChartPeriod('7d')">
                  7 Days
                </button>
                <button class="btn btn-light" :class="{ active: chartPeriod === '30d' }"
                  @click="changeChartPeriod('30d')">
                  30 Days
                </button>
                <button class="btn btn-light" :class="{ active: chartPeriod === '90d' }"
                  @click="changeChartPeriod('90d')">
                  90 Days
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="chart-container" style="height: 300px;">
                <canvas ref="userTrendsChart"></canvas>
              </div>
            </div>
          </div>

          <!-- 用户管理 -->
          <div class="card">
            <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0">User Management</h5>
              <div>
                <button class="btn btn-light btn-sm me-2" @click="exportUsers">
                  <i class="fas fa-download me-1"></i>Export
                </button>
                <button class="btn btn-light btn-sm" @click="showBulkEmailModal = true">
                  <i class="fas fa-envelope me-1"></i>Bulk Email
                </button>
              </div>
            </div>
            <div class="card-body">
              <DataTable :data="users" :columns="userColumns" :searchable="true" :sortable="true" :paginate="true"
                :actions="['view']" @view="viewUser" />
            </div>
          </div>
        </div>

        <!-- 右侧边栏 -->
        <div class="col-lg-4">
          <!-- 系统概览 -->
          <div class="card">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0">System Overview</h5>
            </div>
            <div class="card-body">
              <div class="system-overview">
                <div class="overview-item d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <span class="small">Total Users</span>
                  <span class="fw-bold text-success">{{ systemStats[0].value }}</span>
                </div>
                <div class="overview-item d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <span class="small">Total Appointments</span>
                  <span class="fw-bold text-success">{{ systemStats[1].value }}</span>
                </div>
                <div class="overview-item d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <span class="small">Blog Posts</span>
                  <span class="fw-bold text-success">{{ systemStats[2].value }}</span>
                </div>
                <div class="overview-item d-flex justify-content-between align-items-center">
                  <span class="small">System Status</span>
                  <span class="badge bg-success">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 群发邮件模态框 -->
    <div class="modal fade" :class="{ show: showBulkEmailModal, 'd-block': showBulkEmailModal }" tabindex="-1"
      v-if="showBulkEmailModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">Send Bulk Email</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeBulkEmailModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="sendBulkEmail">
              <!-- 收件人选择 -->
              <div class="mb-4">
                <label class="form-label fw-bold">Recipients</label>
                <div class="row">
                  <div class="col-md-6 mb-2">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" id="allUsers" value="all"
                        v-model="emailForm.recipientType">
                      <label class="form-check-label" for="allUsers">
                        All Users ({{ users.length }})
                      </label>
                    </div>
                  </div>
                  <div class="col-md-6 mb-2">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" id="byRole" value="role"
                        v-model="emailForm.recipientType">
                      <label class="form-check-label" for="byRole">
                        By Role
                      </label>
                    </div>
                  </div>
                </div>

                <!-- 角色选择 -->
                <div v-if="emailForm.recipientType === 'role'" class="mt-3">
                  <label class="form-label">Select Roles</label>
                  <div class="row">
                    <div class="col-md-4" v-for="role in userRoles" :key="role.value">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" :id="`role-${role.value}`" :value="role.value"
                          v-model="emailForm.selectedRoles">
                        <label class="form-check-label small" :for="`role-${role.value}`">
                          {{ role.label }} ({{ role.count }})
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 邮件内容 -->
              <div class="mb-3">
                <label class="form-label fw-bold">Email Subject</label>
                <input type="text" class="form-control" v-model="emailForm.subject" placeholder="Enter email subject"
                  required>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">Email Content</label>
                <textarea class="form-control" rows="8" v-model="emailForm.message"
                  placeholder="Write your email message here. You can use {{firstName}} to personalize the message."
                  required></textarea>
                <div class="form-text">
                  Use <code>{{ firstName }}</code> to include the user's first name in the message.
                </div>
              </div>

              <!-- 预览信息 -->
              <div v-if="selectedRecipientsCount > 0" class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                This email will be sent to <strong>{{ selectedRecipientsCount }}</strong> recipients.
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeBulkEmailModal">
              Cancel
            </button>
            <button type="button" class="btn btn-success" @click="sendBulkEmail"
              :disabled="!canSendEmail || sendingEmail">
              <span v-if="sendingEmail" class="spinner-border spinner-border-sm me-2"></span>
              {{ sendingEmail ? 'Sending...' : 'Send Email' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showBulkEmailModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { db, functions } from '@/services/firebase'
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  where,
  getCountFromServer
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import DataTable from '@/components/Common/DataTable.vue'
import { exportToCSV } from '@/utils/helpers'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default {
  name: 'AdminDashboard',
  components: {
    DataTable
  },
  data() {
    return {
      systemStats: [
        {
          id: 1,
          icon: 'fas fa-users',
          value: '0',
          label: 'Total Users',
          trend: '',
          trendIcon: 'fas fa-sync',
          trendClass: 'text-info'
        },
        {
          id: 2,
          icon: 'fas fa-calendar-check',
          value: '0',
          label: 'Appointments',
          trend: '',
          trendIcon: 'fas fa-sync',
          trendClass: 'text-info'
        },
        {
          id: 3,
          icon: 'fas fa-file-alt',
          value: '0',
          label: 'Blog Posts',
          trend: '',
          trendIcon: 'fas fa-sync',
          trendClass: 'text-info'
        },
        {
          id: 4,
          icon: 'fas fa-chart-bar',
          value: '95%',
          label: 'System Uptime',
          trend: '',
          trendIcon: 'fas fa-minus',
          trendClass: 'text-info'
        }
      ],
      users: [],
      userTrendsChart: null,
      chartPeriod: '30d',
      showBulkEmailModal: false,
      sendingEmail: false,
      emailForm: {
        recipientType: 'all',
        selectedRoles: ['user', 'nutritionist', 'admin'],
        subject: '',
        message: ''
      },
      userColumns: [
        { key: 'firstName', label: 'First Name', sortable: true },
        { key: 'lastName', label: 'Last Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'role', label: 'Role', sortable: true },
        { key: 'createdAt', label: 'Joined', sortable: true, formatter: this.formatDate }
      ]
    }
  },
  computed: {
    ...mapGetters(['currentUser']),

    userRoles() {
      const roleCounts = {
        user: 0,
        nutritionist: 0,
        admin: 0
      }

      this.users.forEach(user => {
        if (roleCounts.hasOwnProperty(user.role)) {
          roleCounts[user.role]++
        }
      })

      return [
        { value: 'user', label: 'Users', count: roleCounts.user },
        { value: 'nutritionist', label: 'Nutritionists', count: roleCounts.nutritionist },
        { value: 'admin', label: 'Admins', count: roleCounts.admin }
      ]
    },

    selectedRecipientsCount() {
      if (this.emailForm.recipientType === 'all') {
        return this.users.length
      } else {
        return this.users.filter(user =>
          this.emailForm.selectedRoles.includes(user.role)
        ).length
      }
    },

    canSendEmail() {
      return this.selectedRecipientsCount > 0 &&
        this.emailForm.subject.trim() &&
        this.emailForm.message.trim()
    }
  },
  async mounted() {
    await this.loadAdminData()
    this.initUserTrendsChart()
  },
  beforeUnmount() {
    if (this.userTrendsChart) {
      this.userTrendsChart.destroy()
    }
  },
  methods: {
    async loadAdminData() {
      try {
        // 加载用户数据
        const usersQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
        const usersSnapshot = await getDocs(usersQuery)
        this.users = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // 更新统计数据
        await this.updateSystemStats()

      } catch (error) {
        console.error('Error loading admin data:', error)
      }
    },

    async updateSystemStats() {
      try {
        // 获取用户总数
        const usersCount = await getCountFromServer(collection(db, 'users'))
        this.systemStats[0].value = usersCount.data().count

        // 获取预约总数
        const appointmentsCount = await getCountFromServer(collection(db, 'appointments'))
        this.systemStats[1].value = appointmentsCount.data().count

        // 获取博客帖子总数
        const blogPostsCount = await getCountFromServer(collection(db, 'blogPosts'))
        this.systemStats[2].value = blogPostsCount.data().count

        // 计算用户增长趋势
        await this.calculateUserTrends()

      } catch (error) {
        console.error('Error updating system stats:', error)
        // 如果计数查询失败，使用列表长度作为后备
        this.systemStats[0].value = this.users.length
      }
    },

    async calculateUserTrends() {
      try {
        const now = new Date()
        let startDate

        switch (this.chartPeriod) {
          case '7d':
            startDate = new Date(now.setDate(now.getDate() - 7))
            break
          case '30d':
            startDate = new Date(now.setDate(now.getDate() - 30))
            break
          case '90d':
            startDate = new Date(now.setDate(now.getDate() - 90))
            break
          default:
            startDate = new Date(now.setDate(now.getDate() - 30))
        }

        // 获取指定时间段内的用户
        const recentUsersQuery = query(
          collection(db, 'users'),
          where('createdAt', '>=', startDate)
        )
        const recentUsersSnapshot = await getDocs(recentUsersQuery)
        const recentUsersCount = recentUsersSnapshot.size

        // 计算趋势
        const totalUsers = this.systemStats[0].value
        const previousPeriodUsers = totalUsers - recentUsersCount
        const growthRate = previousPeriodUsers > 0
          ? ((recentUsersCount / previousPeriodUsers) * 100).toFixed(1)
          : 100

        if (growthRate > 0) {
          this.systemStats[0].trend = `+${growthRate}%`
          this.systemStats[0].trendIcon = 'fas fa-arrow-up'
          this.systemStats[0].trendClass = 'text-success'
        } else {
          this.systemStats[0].trend = `${growthRate}%`
          this.systemStats[0].trendIcon = 'fas fa-arrow-down'
          this.systemStats[0].trendClass = 'text-danger'
        }

      } catch (error) {
        console.error('Error calculating user trends:', error)
        this.systemStats[0].trend = 'N/A'
        this.systemStats[0].trendIcon = 'fas fa-minus'
        this.systemStats[0].trendClass = 'text-info'
      }
    },

    async initUserTrendsChart() {
      const ctx = this.$refs.userTrendsChart
      if (!ctx) return

      try {
        // 获取最近30天的用户注册数据
        const userData = await this.getUserRegistrationData()

        this.userTrendsChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: userData.labels,
            datasets: [{
              label: 'User Registrations',
              data: userData.registrations,
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
                display: true,
                position: 'top'
              },
              tooltip: {
                mode: 'index',
                intersect: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  drawBorder: false
                },
                title: {
                  display: true,
                  text: 'Number of Registrations'
                }
              },
              x: {
                grid: {
                  display: false
                },
                title: {
                  display: true,
                  text: 'Date'
                }
              }
            }
          }
        })
      } catch (error) {
        console.error('Error initializing user trends chart:', error)
      }
    },

    async getUserRegistrationData() {
      try {
        const days = this.chartPeriod === '7d' ? 7 : this.chartPeriod === '90d' ? 90 : 30

        // 计算开始日期
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)
        startDate.setHours(0, 0, 0, 0)

        // 查询指定时间段内的用户
        const usersQuery = query(
          collection(db, 'users'),
          where('createdAt', '>=', startDate),
          orderBy('createdAt', 'asc')
        )

        const usersSnapshot = await getDocs(usersQuery)

        // 按日期分组统计
        const dateMap = new Map()

        // 初始化日期范围
        const labels = []
        const registrations = []

        for (let i = 0; i < days; i++) {
          const date = new Date(startDate)
          date.setDate(date.getDate() + i)
          const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD
          labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
          dateMap.set(dateKey, 0)
          registrations.push(0)
        }

        // 统计每日注册用户数
        usersSnapshot.forEach(doc => {
          const userData = doc.data()
          let userDate

          if (userData.createdAt && userData.createdAt.toDate) {
            userDate = userData.createdAt.toDate()
          } else if (userData.createdAt) {
            userDate = new Date(userData.createdAt)
          } else {
            return // 跳过没有创建日期的用户
          }

          const dateKey = userDate.toISOString().split('T')[0]

          if (dateMap.has(dateKey)) {
            dateMap.set(dateKey, dateMap.get(dateKey) + 1)
          }
        })

        // 填充注册数据
        let index = 0
        for (let i = 0; i < days; i++) {
          const date = new Date(startDate)
          date.setDate(date.getDate() + i)
          const dateKey = date.toISOString().split('T')[0]
          registrations[index] = dateMap.get(dateKey) || 0
          index++
        }

        return { labels, registrations }

      } catch (error) {
        console.error('Error getting user registration data:', error)

        /*
        // 如果查询失败，返回模拟数据作为后备
        const days = this.chartPeriod === '7d' ? 7 : this.chartPeriod === '90d' ? 90 : 30
        const labels = []
        const registrations = []

        const now = new Date()
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)
          labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
          registrations.push(Math.floor(Math.random() * 5) + 1)
        }

        return { labels, registrations }
        */
      }
    },

    changeChartPeriod(period) {
      this.chartPeriod = period
      this.calculateUserTrends()

      // 重新加载图表数据
      if (this.userTrendsChart) {
        this.userTrendsChart.destroy()
      }
      this.initUserTrendsChart()
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

    viewUser(user) {
      this.$router.push(`/admin/users/${user.id}`)
    },

    editUser(user) {
      console.log('Edit user:', user)
    },

    async deleteUser(user) {
      if (!confirm(`Are you sure you want to delete user ${user.firstName} ${user.lastName}?`)) return

      try {
        await deleteDoc(doc(db, 'users', user.id))
        this.users = this.users.filter(u => u.id !== user.id)
        await this.updateSystemStats()
        this.$toast.success('User deleted successfully')
      } catch (error) {
        console.error('Error deleting user:', error)
        this.$toast.error('Failed to delete user')
      }
    },

    exportUsers() {
      const userData = this.users.map(user => ({
        'First Name': user.firstName,
        'Last Name': user.lastName,
        'Email': user.email,
        'Role': user.role,
        'Joined Date': this.formatDate(user.createdAt)
      }))

      exportToCSV(userData, 'users-export.csv')
      this.$toast.success('Users exported successfully')
    },

    async sendBulkEmail() {
      if (!this.canSendEmail) return

      this.sendingEmail = true

      try {
        // 确定收件人
        let recipients = []
        if (this.emailForm.recipientType === 'all') {
          recipients = this.users
        } else {
          recipients = this.users.filter(user =>
            this.emailForm.selectedRoles.includes(user.role)
          )
        }

        // 调用云函数发送批量邮件
        const sendBulkEmail = httpsCallable(functions, 'sendBulkEmail')
        const result = await sendBulkEmail({
          users: recipients.map(user => ({
            email: user.email,
            firstName: user.firstName
          })),
          subject: this.emailForm.subject,
          message: this.emailForm.message,
          userGroup: this.emailForm.recipientType === 'all' ? 'all' : this.emailForm.selectedRoles.join(',')
        })

        if (result.data.success) {
          alert(result.data.message)
          this.closeBulkEmailModal()
        } else {
          throw new Error(result.data.message || 'Failed to send email')
        }

      } catch (error) {
        console.error('Error sending bulk email:', error)
      } finally {
        this.sendingEmail = false
      }
    },

    closeBulkEmailModal() {
      this.showBulkEmailModal = false
      this.emailForm = {
        recipientType: 'all',
        selectedRoles: ['user', 'nutritionist', 'admin'],
        subject: '',
        message: ''
      }
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  min-height: calc(100vh - 80px);
  background-color: #f8f9fa;
}

.system-overview .overview-item:last-child {
  border-bottom: none !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

.btn-group .btn.active {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
}

.modal-backdrop {
  opacity: 0.5;
}

.form-check-input:checked {
  background-color: #28a745;
  border-color: #28a745;
}

code {
  background-color: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.875em;
  color: #e83e8c;
}
</style>