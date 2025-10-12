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
                        <div class="card-header bg-success text-white">
                            <h5 class="mb-0">Select Date & Time</h5>
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
                                <div class="mb-3">
                                    <label class="form-label">Nutritionist</label>
                                    <select v-model="appointment.nutritionistId" class="form-select" required>
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
                                    <input type="text" class="form-control" :value="selectedSlot" readonly>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Notes (Optional)</label>
                                    <textarea v-model="appointment.notes" class="form-control" rows="3"></textarea>
                                </div>

                                <button type="submit" class="btn btn-success w-100" :disabled="!selectedSlot">
                                    Book Appointment
                                </button>
                            </form>
                        </div>
                    </div>

                    <!-- 冲突检测 -->
                    <div v-if="conflicts.length > 0" class="alert alert-warning mt-3">
                        <h6>Potential Conflicts:</h6>
                        <ul class="mb-0">
                            <li v-for="conflict in conflicts" :key="conflict.id">
                                {{ conflict.description }}
                            </li>
                        </ul>
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
                notes: ''
            },
            selectedSlot: null,
            conflicts: [],
            nutritionists: [
                { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Sports Nutrition' },
                { id: 2, name: 'Dr. Mike Chen', specialty: 'Clinical Nutrition' },
                { id: 3, name: 'Dr. Emily Davis', specialty: 'Pediatric Nutrition' }
            ],
            calendarOptions: {
                plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
                initialView: 'timeGridWeek',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                events: [
                    // 从Firestore获取现有预约
                ],
                selectable: true,
                select: this.handleDateSelect,
                eventClick: this.handleEventClick
            }
        }
    },
    methods: {
        handleDateSelect(selectInfo) {
            this.selectedSlot = selectInfo.startStr
            this.appointment.dateTime = selectInfo.start

            // 检查时间冲突
            this.checkConflicts(selectInfo.start)
        },

        async checkConflicts(selectedTime) {
            // 调用云函数检查冲突
            const checkConflict = this.$functions.httpsCallable('checkAppointmentConflict')
            try {
                const result = await checkConflict({
                    nutritionistId: this.appointment.nutritionistId,
                    dateTime: selectedTime
                })
                this.conflicts = result.data.conflicts
            } catch (error) {
                console.error('Error checking conflicts:', error)
            }
        },

        async bookAppointment() {
            if (!this.selectedSlot) {
                alert('Please select a date and time')
                return
            }

            try {
                // 调用云函数创建预约
                const createAppointment = this.$functions.httpsCallable('createAppointment')
                const result = await createAppointment({
                    ...this.appointment,
                    userId: this.$store.getters.currentUser.uid
                })

                if (result.data.success) {
                    this.$router.push('/dashboard')
                    // 显示成功消息
                }
            } catch (error) {
                console.error('Error booking appointment:', error)
                alert('Failed to book appointment. Please try again.')
            }
        }
    }
}
</script>

<style scoped>
.appointment-booking {
    min-height: calc(100vh - 80px);
}
</style>