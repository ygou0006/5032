<template>
    <div class="appointment-booking">
        <div class="container mt-4">
            <div class="row">
                <div class="col-12">
                    <h2 class="fw-bold text-success">Book Nutrition Consultation</h2>
                    <p class="lead">Schedule an appointment with our certified nutrition experts</p>
                </div>
            </div>

            <div class="row">
                <div class="col-lg-8">
                    <!-- 日历组件 -->
                    <div class="card mb-4">
                        <div
                            class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Select Date & Time</h5>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="showMyAppointments"
                                    v-model="showMyAppointments">
                                <label class="form-check-label text-white" for="showMyAppointments">
                                    Show My Appointments
                                </label>
                            </div>
                        </div>
                        <div class="card-body">
                            <FullCalendar :options="calendarOptions" />
                        </div>
                    </div>
                </div>

                <div class="col-lg-4">
                    <!-- 预约表单 -->
                    <div class="card">
                        <div class="card-header bg-success text-white">
                            <h5 class="mb-0">Appointment Details</h5>
                        </div>
                        <div class="card-body">
                            <form @submit.prevent="bookAppointment">
                                <!-- 显示选中的服务信息 -->
                                <div v-if="selectedService" class="mb-3 p-3 bg-light rounded">
                                    <h6 class="text-success mb-2">Selected Service</h6>
                                    <p class="mb-1 small">{{ selectedService.title }}</p>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Nutritionist</label>
                                    <select v-model="appointment.nutritionistId" class="form-select" required
                                        @change="onNutritionistChange">
                                        <option value="">Select Nutritionist</option>
                                        <option v-for="nutri in nutritionists" :key="nutri.id" :value="nutri.id">
                                            {{ nutri.name }} - {{ nutri.specialty }}
                                        </option>
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Appointment Type</label>
                                    <select v-model="appointment.type" class="form-select" required>
                                        <option value="initial">Initial Consultation</option>
                                        <option value="followup">Follow-up Session</option>
                                        <option value="emergency">Emergency Consultation</option>
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Selected Date & Time</label>
                                    <input type="text" class="form-control" :value="formattedSelectedSlot" readonly>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Notes (Optional)</label>
                                    <textarea v-model="appointment.notes" class="form-control" rows="3"></textarea>
                                </div>

                                <button type="submit" class="btn btn-success w-100"
                                    :disabled="!selectedSlot || loading || conflicts.length > 0">
                                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                    {{ loading ? 'Booking...' : 'Book Appointment' }}
                                </button>
                            </form>
                        </div>
                    </div>

                    <!-- 冲突检测 -->
                    <div v-if="conflicts.length > 0" class="alert alert-warning mt-3">
                        <h6><i class="fas fa-exclamation-triangle me-2"></i>Time Conflict Detected</h6>
                        <p class="mb-2 small">The selected time conflicts with existing appointments:</p>
                        <ul class="mb-0 small">
                            <li v-for="conflict in conflicts" :key="conflict.id">
                                {{ formatConflict(conflict) }}
                            </li>
                        </ul>
                    </div>

                    <!-- 用户预约列表 -->
                    <div class="card mt-4">
                        <div class="card-header bg-info text-white">
                            <h6 class="mb-0"><i class="fas fa-calendar-check me-2"></i>My Upcoming Appointments</h6>
                        </div>
                        <div class="card-body">
                            <div v-if="userAppointments.length === 0" class="text-center py-3">
                                <p class="text-muted mb-0">No upcoming appointments</p>
                            </div>
                            <div v-else>
                                <div v-for="apt in userAppointments" :key="apt.id"
                                    class="appointment-item mb-3 p-2 border rounded">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 class="mb-1">{{ getNutritionistName(apt.nutritionistId) }}</h6>
                                            <p class="mb-1 small text-muted">{{ formatAppointmentType(apt.type) }}</p>
                                            <p class="mb-0 small">{{ formatDateTime(apt.dateTime) }}</p>
                                            <!-- 显示服务信息 -->
                                            <div v-if="apt.serviceId" class="mt-1">
                                                <span class="badge bg-secondary small">{{ apt.serviceTitle }}</span>
                                            </div>
                                            <span class="badge" :class="getStatusBadgeClass(apt.status)">{{ apt.status
                                                }}</span>
                                        </div>
                                        <button class="btn btn-sm btn-outline-danger" @click="cancelAppointment(apt.id)"
                                            title="Cancel Appointment">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/services/firebase'
import { db } from '@/services/firebase'
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore'

export default {
    name: 'AppointmentBooking',
    components: {
        FullCalendar
    },
    data() {
        return {
            appointment: {
                nutritionistId: '',
                type: 'initial',
                dateTime: null,
                notes: '',
                serviceId: null,
                serviceTitle: ''
            },
            selectedService: null, // 存储选中的服务信息
            selectedSlot: null,
            conflicts: [],
            loading: false,
            showMyAppointments: true,
            userAppointments: [],
            nutritionists: [],
            calendarOptions: {
                plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
                initialView: 'timeGridWeek',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                events: [],
                selectable: true,
                selectOverlap: false,
                select: this.handleDateSelect,
                eventClick: this.handleEventClick,
                eventColor: '#28a745',
                eventTextColor: '#ffffff'
            }
        }
    },
    computed: {
        formattedSelectedSlot() {
            if (!this.selectedSlot) return 'Not selected'
            return new Date(this.selectedSlot).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }
    },
    watch: {
        showMyAppointments(newVal) {
            this.updateCalendarEvents()
        }
    },
    async mounted() {
        await this.loadNutritionists()
        await this.loadUserAppointments()
        this.updateCalendarEvents()
        this.parseServiceFromQuery() // 从URL参数解析服务信息
    },
    methods: {
        // 从URL参数解析服务信息
        parseServiceFromQuery() {
            const serviceId = this.$route.query.service
            const serviceTitle = this.$route.query.serviceTitle

            if (serviceId && serviceTitle) {
                this.selectedService = {
                    id: parseInt(serviceId),
                    title: decodeURIComponent(serviceTitle)
                }
                this.appointment.serviceId = parseInt(serviceId)
                this.appointment.serviceTitle = decodeURIComponent(serviceTitle)
            }
        },

        // 从 Firestore 加载营养师数据
        async loadNutritionists() {
            try {
                const nutritionistsQuery = query(
                    collection(db, 'users'),
                    where('role', '==', 'nutritionist'),
                    where('isActive', '==', true)
                )

                const querySnapshot = await getDocs(nutritionistsQuery)
                this.nutritionists = querySnapshot.docs.map(doc => {
                    const userData = doc.data()
                    return {
                        id: doc.id, // 使用文档ID作为营养师ID
                        name: `${userData.firstName} ${userData.lastName}`,
                        specialty: userData.specialty || 'General Nutrition' // 如果没有专业信息，使用默认值
                    }
                })

                console.log('Loaded nutritionists:', this.nutritionists)
            } catch (error) {
                console.error('Error loading nutritionists:', error)
                // 如果出错，可以设置一个默认的营养师列表作为后备
                this.nutritionists = [
                    { id: 'default1', name: 'Available Nutritionist', specialty: 'General Nutrition' }
                ]
            }
        },

        async loadUserAppointments() {
            const currentUser = this.$store.getters.currentUser
            if (!currentUser) return

            try {
                // 实时监听用户预约变化
                const appointmentsQuery = query(
                    collection(db, 'appointments'),
                    where('userId', '==', currentUser.uid)
                )

                // 设置实时监听
                this.unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
                    this.userAppointments = []
                    snapshot.forEach(doc => {
                        const appointment = {
                            id: doc.id,
                            ...doc.data()
                        }
                        // 确保日期是Date对象
                        if (appointment.dateTime && appointment.dateTime.toDate) {
                            appointment.dateTime = appointment.dateTime.toDate()
                        }
                        this.userAppointments.push(appointment)
                    })
                    this.updateCalendarEvents()
                })
            } catch (error) {
                console.error('Error loading user appointments:', error)
            }
        },

        updateCalendarEvents() {
            const events = []

            // 添加用户预约事件
            if (this.showMyAppointments) {
                this.userAppointments.forEach(apt => {
                    if (apt.dateTime) {
                        const start = new Date(apt.dateTime)
                        const end = new Date(start.getTime() + (apt.duration || 60) * 60000)

                        events.push({
                            id: apt.id,
                            title: `${this.getNutritionistName(apt.nutritionistId)} - ${this.formatAppointmentType(apt.type)}`,
                            start: start,
                            end: end,
                            color: this.getEventColor(apt.status),
                            extendedProps: {
                                type: 'user',
                                status: apt.status
                            }
                        })
                    }
                })
            }

            // 添加冲突事件
            this.conflicts.forEach(conflict => {
                events.push({
                    id: `conflict-${conflict.id}`,
                    title: 'Time Conflict',
                    start: new Date(conflict.existingStart),
                    end: new Date(conflict.existingEnd),
                    color: '#dc3545',
                    extendedProps: {
                        type: 'conflict'
                    }
                })
            })

            this.calendarOptions.events = events
        },

        getEventColor(status) {
            switch (status) {
                case 'confirmed':
                    return '#28a745' // 绿色
                case 'pending':
                    return '#ffc107' // 黄色
                case 'cancelled':
                    return '#6c757d' // 灰色
                default:
                    return '#17a2b8' // 蓝色
            }
        },

        getStatusBadgeClass(status) {
            switch (status) {
                case 'confirmed':
                    return 'bg-success'
                case 'pending':
                    return 'bg-warning'
                case 'cancelled':
                    return 'bg-secondary'
                default:
                    return 'bg-info'
            }
        },

        handleDateSelect(selectInfo) {
            this.selectedSlot = selectInfo.startStr
            this.appointment.dateTime = selectInfo.start

            // 检查时间冲突
            this.checkConflicts(selectInfo.start)
        },

        async checkConflicts(selectedTime) {
            if (!this.appointment.nutritionistId) return

            // 使用导入的 functions
            const checkConflict = httpsCallable(functions, 'checkAppointmentConflict')
            try {
                const result = await checkConflict({
                    nutritionistId: this.appointment.nutritionistId,
                    dateTime: selectedTime
                })
                this.conflicts = result.data.conflicts || []
                this.updateCalendarEvents() // 更新日历显示冲突
            } catch (error) {
                console.error('Error checking conflicts:', error)
            }
        },

        onNutritionistChange() {
            this.conflicts = []
            this.updateCalendarEvents()
            if (this.selectedSlot) {
                this.checkConflicts(new Date(this.selectedSlot))
            }
        },

        async bookAppointment() {
            if (!this.selectedSlot) {
                alert('Please select a date and time')
                return
            }

            if (this.conflicts.length > 0) {
                alert('Please resolve time conflicts before booking')
                return
            }

            this.loading = true

            try {
                // 使用导入的 functions
                const createAppointment = httpsCallable(functions, 'createAppointment')
                const result = await createAppointment({
                    ...this.appointment,
                    userId: this.$store.getters.currentUser.uid
                })

                if (result.data.success) {
                    alert('Appointment booked successfully!')
                    // 重置表单
                    this.appointment = {
                        nutritionistId: '',
                        type: 'initial',
                        dateTime: null,
                        notes: '',
                        serviceId: null,
                        serviceTitle: ''
                    }
                    // this.selectedService = null
                    this.selectedSlot = null
                    this.conflicts = []
                    this.updateCalendarEvents()

                    // 跳转到仪表板或保持当前页面
                    // this.$router.push('/dashboard')
                }
            } catch (error) {
                console.error('Error booking appointment:', error)
                alert('Failed to book appointment. Please try again.')
            } finally {
                this.loading = false
            }
        },

        handleEventClick(info) {
            const event = info.event
            const extendedProps = event.extendedProps

            if (extendedProps.type === 'user') {
                // 用户预约点击事件
                const appointment = this.userAppointments.find(apt => apt.id === event.id)
                if (appointment) {
                    let message = `Your Appointment:\nNutritionist: ${this.getNutritionistName(appointment.nutritionistId)}\nType: ${this.formatAppointmentType(appointment.type)}\nTime: ${this.formatDateTime(appointment.dateTime)}\nStatus: ${appointment.status}`

                    // 添加服务信息
                    if (appointment.serviceTitle) {
                        message += `\nService: ${appointment.serviceTitle}`
                    }

                    alert(message)
                }
            } else if (extendedProps.type === 'conflict') {
                // 冲突事件点击
                alert('This time slot conflicts with an existing appointment')
            }
        },

        formatConflict(conflict) {
            const start = new Date(conflict.existingStart).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            const end = new Date(conflict.existingEnd).toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            })
            return `${start} - ${end}`
        },

        formatDateTime(date) {
            if (!date) return 'N/A'
            return new Date(date).toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
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

        getNutritionistName(nutritionistId) {
            const nutritionist = this.nutritionists.find(n => n.id === nutritionistId)
            return nutritionist ? nutritionist.name : 'Unknown Nutritionist'
        },

        async cancelAppointment(appointmentId) {
            if (!confirm('Are you sure you want to cancel this appointment?')) {
                return
            }

            try {
                // 更新预约状态为取消
                await updateDoc(doc(db, 'appointments', appointmentId), {
                    status: 'cancelled',
                    updatedAt: new Date()
                })

                // 日历会自动更新，因为我们在监听实时变化
                alert('Appointment cancelled successfully')
            } catch (error) {
                console.error('Error cancelling appointment:', error)
                alert('Failed to cancel appointment. Please try again.')
            }
        },

        beforeUnmount() {
            // 清理监听器
            if (this.unsubscribeAppointments) {
                this.unsubscribeAppointments()
            }
        }
    }
}
</script>

<style scoped>
.appointment-booking {
    min-height: calc(100vh - 80px);
}

.appointment-item {
    transition: all 0.3s ease;
}

.appointment-item:hover {
    background-color: #f8f9fa;
    transform: translateY(-2px);
}

.badge {
    font-size: 0.7rem;
}

.card {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.alert {
    border: none;
    border-radius: 8px;
}

/* FullCalendar 自定义样式 */
:deep(.fc-event) {
    border: none;
    border-radius: 4px;
    font-size: 0.8rem;
    padding: 2px 4px;
}

:deep(.fc-event-conflict) {
    background-color: #dc3545;
    border-color: #dc3545;
}

:deep(.fc-day-today) {
    background-color: rgba(40, 167, 69, 0.1) !important;
}
</style>