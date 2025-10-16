<template>
  <div class="contact-page">
    <!-- Hero Section -->
    <section class="hero-section bg-light py-5">
      <div class="container">
        <div class="row text-center">
          <div class="col">
            <h1 class="display-4 fw-bold text-success mb-4">Contact Us</h1>
            <p class="lead mb-4">
              Get in touch with our nutrition experts. We're here to answer your questions and help you
              start your health journey.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Information & Form -->
    <section class="contact-content py-5">
      <div class="container">
        <div class="row">
          <!-- Contact Information -->
          <div class="col-lg-4 mb-5">
            <div class="contact-info">
              <h3 class="fw-bold text-success mb-4">Get In Touch</h3>

              <div class="contact-item mb-4">
                <div class="d-flex align-items-start">
                  <div
                    class="contact-icon bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                    <i class="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <h5 class="fw-bold mb-1">Our Location</h5>
                    <p class="mb-0 text-muted">
                      123 Health Street<br>
                      Melbourne VIC 3000<br>
                      Australia
                    </p>
                  </div>
                </div>
              </div>

              <div class="contact-item mb-4">
                <div class="d-flex align-items-start">
                  <div
                    class="contact-icon bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                    <i class="fas fa-phone"></i>
                  </div>
                  <div>
                    <h5 class="fw-bold mb-1">Phone Number</h5>
                    <p class="mb-0 text-muted">
                      +61 3 1234 5678<br>
                      Mon-Fri: 9AM-6PM
                    </p>
                  </div>
                </div>
              </div>

              <div class="contact-item mb-4">
                <div class="d-flex align-items-start">
                  <div
                    class="contact-icon bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                    <i class="fas fa-envelope"></i>
                  </div>
                  <div>
                    <h5 class="fw-bold mb-1">Email Address</h5>
                    <p class="mb-0 text-muted">
                      info@nutritionedu.org<br>
                      support@nutritionedu.org
                    </p>
                  </div>
                </div>
              </div>

              <div class="contact-item">
                <div class="d-flex align-items-start">
                  <div
                    class="contact-icon bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div>
                    <h5 class="fw-bold mb-1">Office Hours</h5>
                    <p class="mb-0 text-muted">
                      Monday - Friday: 9:00 AM - 6:00 PM<br>
                      Saturday: 10:00 AM - 2:00 PM<br>
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              <!-- Social Media Links -->
              <div class="social-links mt-5">
                <h5 class="fw-bold text-success mb-3">Follow Us</h5>
                <div class="d-flex gap-3">
                  <a href="#" class="social-link text-success">
                    <i class="fab fa-facebook-f fa-lg"></i>
                  </a>
                  <a href="#" class="social-link text-success">
                    <i class="fab fa-twitter fa-lg"></i>
                  </a>
                  <a href="#" class="social-link text-success">
                    <i class="fab fa-instagram fa-lg"></i>
                  </a>
                  <a href="#" class="social-link text-success">
                    <i class="fab fa-linkedin-in fa-lg"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="col-lg-8">
            <div class="contact-form-card card shadow-sm border-0">
              <div class="card-body p-4">
                <h3 class="fw-bold text-success mb-4">Send Us a Message</h3>
                <p class="text-muted mb-4">
                  Have questions about our nutrition programs? Fill out the form below and our team will
                  get back to you within 24 hours.
                </p>

                <form @submit.prevent="handleSubmit">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="firstName" class="form-label">First Name *</label>
                      <input type="text" class="form-control" id="firstName" v-model="form.firstName"
                        :class="{ 'is-invalid': errors.firstName }" required>
                      <div class="invalid-feedback" v-if="errors.firstName">
                        {{ errors.firstName }}
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="lastName" class="form-label">Last Name *</label>
                      <input type="text" class="form-control" id="lastName" v-model="form.lastName"
                        :class="{ 'is-invalid': errors.lastName }" required>
                      <div class="invalid-feedback" v-if="errors.lastName">
                        {{ errors.lastName }}
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="email" class="form-label">Email Address *</label>
                      <input type="email" class="form-control" id="email" v-model="form.email"
                        :class="{ 'is-invalid': errors.email }" required>
                      <div class="invalid-feedback" v-if="errors.email">
                        {{ errors.email }}
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="phone" class="form-label">Phone Number</label>
                      <input type="tel" class="form-control" id="phone" v-model="form.phone"
                        :class="{ 'is-invalid': errors.phone }">
                      <div class="invalid-feedback" v-if="errors.phone">
                        {{ errors.phone }}
                      </div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="recipient" class="form-label">Send to *</label>
                    <select class="form-select" id="recipient" v-model="form.recipient"
                      :class="{ 'is-invalid': errors.recipient }" required>
                      <option value="support@nutritionedu.org">Ygou0006@student.Monash.edu (Technical Support)</option>
                      <option value="appointments@nutritionedu.org">Ygou0006@student.Monash.edu (Appointment Requests)
                      </option>
                      <option value="custom">Custom Email Address</option>
                    </select>
                    <div class="invalid-feedback" v-if="errors.recipient">
                      {{ errors.recipient }}
                    </div>
                  </div>

                  <!-- 自定义邮箱输入框 -->
                  <div class="mb-3" v-if="form.recipient === 'custom'">
                    <label for="customRecipient" class="form-label">Custom Email Address *</label>
                    <input type="email" class="form-control" id="customRecipient" v-model="form.customRecipient"
                      :class="{ 'is-invalid': errors.customRecipient }" placeholder="Enter email address">
                    <div class="invalid-feedback" v-if="errors.customRecipient">
                      {{ errors.customRecipient }}
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="subject" class="form-label">Subject *</label>
                    <select class="form-select" id="subject" v-model="form.subject"
                      :class="{ 'is-invalid': errors.subject }" required>
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="appointment">Book an Appointment</option>
                      <option value="program">Program Information</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                    <div class="invalid-feedback" v-if="errors.subject">
                      {{ errors.subject }}
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="message" class="form-label">Message *</label>
                    <textarea class="form-control" id="message" rows="6" v-model="form.message"
                      :class="{ 'is-invalid': errors.message }" placeholder="Tell us how we can help you..."
                      required></textarea>
                    <div class="invalid-feedback" v-if="errors.message">
                      {{ errors.message }}
                    </div>
                  </div>

                  <!-- 如果是已登录用户，显示预约选项 -->
                  <div v-if="isAuthenticated" class="mb-3">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="requestAppointment"
                        v-model="form.requestAppointment">
                      <label class="form-check-label" for="requestAppointment">
                        I'd like to request a nutrition consultation appointment
                      </label>
                    </div>
                  </div>

                  <!-- 如果是未登录用户，显示注册提示 -->
                  <div v-else class="alert alert-info mb-3">
                    <i class="fas fa-info-circle me-2"></i>
                    <router-link to="/register" class="alert-link">Create an account</router-link>
                    to book appointments and access personalized nutrition resources.
                  </div>

                  <div class="d-grid">
                    <button type="submit" class="btn btn-success btn-lg" :disabled="loading">
                      <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                      Send Message
                    </button>
                  </div>
                </form>

                <!-- 成功消息 -->
                <div v-if="successMessage" class="alert alert-success mt-3" role="alert">
                  <i class="fas fa-check-circle me-2"></i>
                  {{ successMessage }}
                </div>

                <!-- 错误消息 -->
                <div v-if="error" class="alert alert-danger mt-3" role="alert">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ error }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Map Section -->
    <section class="map-section py-5 bg-light">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <h3 class="fw-bold text-success text-center mb-4">Find Our Location</h3>
            <p class="text-center text-muted mb-5">
              Visit our Melbourne office for personalized nutrition consultations and health assessments.
            </p>

            <div class="map-container rounded shadow-sm overflow-hidden">
              <MapComponent :features="['search', 'navigation']" :initial-center="{ lng: 144.9631, lat: -37.8136 }"
                :initial-zoom="14" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section py-5">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center mb-5">
            <h2 class="fw-bold text-success">Frequently Asked Questions</h2>
            <p class="lead">Quick answers to common questions</p>
          </div>
        </div>
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="accordion" id="faqAccordion">
              <div class="accordion-item border-0 mb-3 shadow-sm" v-for="(faq, index) in faqs" :key="faq.id">
                <h3 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    :data-bs-target="`#faq${faq.id}`" :aria-expanded="index === 0 ? 'true' : 'false'"
                    :aria-controls="`faq${faq.id}`">
                    <i class="fas fa-question-circle text-success me-2"></i>
                    {{ faq.question }}
                  </button>
                </h3>
                <div :id="`faq${faq.id}`" class="accordion-collapse collapse" :class="{ 'show': index === 0 }"
                  data-bs-parent="#faqAccordion">
                  <div class="accordion-body">
                    {{ faq.answer }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MapComponent from '@/components/Common/MapComponent.vue'
import { validateEmail, validatePhone } from '@/utils/validators'
import { functions } from '@/services/firebase'
import { httpsCallable } from 'firebase/functions'

export default {
  name: 'Contact',
  components: {
    MapComponent
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser', 'userProfile'])
  },
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        recipient: 'info@nutritionedu.org',
        customRecipient: '',
        subject: '',
        message: '',
        requestAppointment: false
      },
      errors: {},
      loading: false,
      successMessage: '',
      error: '',
      faqs: [
        {
          id: 1,
          question: 'How soon can I expect a response to my inquiry?',
          answer: 'We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call our office directly.'
        },
        {
          id: 2,
          question: 'Do I need a referral to book a nutrition consultation?',
          answer: 'No, you do not need a referral. Anyone can book a consultation with our nutrition experts. However, if you have specific medical conditions, we recommend consulting with your doctor first.'
        },
        {
          id: 3,
          question: 'What should I bring to my first appointment?',
          answer: 'Please bring any recent medical reports, a list of current medications, and a 3-day food diary if possible. This will help our nutritionists provide the most accurate assessment.'
        },
        {
          id: 4,
          question: 'Do you offer virtual consultations?',
          answer: 'Yes, we offer both in-person and virtual consultations via video call. You can choose your preferred method when booking your appointment.'
        },
        {
          id: 5,
          question: 'Are your services covered by health insurance?',
          answer: 'Some private health insurance plans may cover nutrition consultations. We recommend checking with your insurance provider about coverage for dietitian services. We can provide receipts for insurance claims.'
        }
      ]
    }
  },
  methods: {
    validateForm() {
      this.errors = {}

      // 名字验证
      if (!this.form.firstName.trim()) {
        this.errors.firstName = 'First name is required'
      }

      if (!this.form.lastName.trim()) {
        this.errors.lastName = 'Last name is required'
      }

      // 邮箱验证
      if (!this.form.email.trim()) {
        this.errors.email = 'Email is required'
      } else if (!validateEmail(this.form.email)) {
        this.errors.email = 'Please enter a valid email address'
      }

      // 电话验证（可选）
      if (this.form.phone && !validatePhone(this.form.phone)) {
        this.errors.phone = 'Please enter a valid phone number'
      }

      // 收件人验证
      if (!this.form.recipient) {
        this.errors.recipient = 'Please select a recipient'
      } else if (this.form.recipient === 'custom') {
        if (!this.form.customRecipient.trim()) {
          this.errors.customRecipient = 'Custom email is required'
        } else if (!validateEmail(this.form.customRecipient)) {
          this.errors.customRecipient = 'Please enter a valid email address'
        }
      }

      // 主题验证
      if (!this.form.subject) {
        this.errors.subject = 'Please select a subject'
      }

      // 消息验证
      if (!this.form.message.trim()) {
        this.errors.message = 'Message is required'
      } else if (this.form.message.trim().length < 10) {
        this.errors.message = 'Message should be at least 10 characters long'
      }

      return Object.keys(this.errors).length === 0
    },

    async handleSubmit() {
      if (!this.validateForm()) return

      this.loading = true
      this.successMessage = ''
      this.error = ''

      try {
        // 调用云函数发送邮件
        await this.sendContactEmail()

        this.successMessage = 'Thank you for your message! We will get back to you within 24 hours.'

        // 重置表单
        this.resetForm()

      } catch (error) {
        this.error = 'Sorry, there was an error sending your message. Please try again or call us directly.'
        console.error('Contact form error:', error)
      } finally {
        this.loading = false
      }
    },

    async sendContactEmail() {
      try {
        // 构建邮件内容
        const emailContent = this.buildEmailContent()

        // 确定收件人邮箱
        const toEmail = this.form.recipient === 'custom' ? this.form.customRecipient : this.form.recipient

        // 调用云函数发送邮件
        const sendEmail = httpsCallable(functions, 'sendEmail')
        const result = await sendEmail({
          to: toEmail,
          subject: emailContent.subject,
          message: emailContent.htmlMessage
        })

        console.log('Email sent successfully:', result.data)
        return result.data

      } catch (error) {
        console.error('Failed to send email via cloud function:', error)
        throw error
      }
    },

    buildEmailContent() {
      const fullName = `${this.form.firstName} ${this.form.lastName}`
      const subjectMap = {
        'general': 'General Inquiry',
        'appointment': 'Appointment Booking Request',
        'program': 'Program Information Request',
        'partnership': 'Partnership Opportunity',
        'feedback': 'Website Feedback',
        'other': 'Other Inquiry'
      }

      const subjectText = subjectMap[this.form.subject] || 'Website Contact Form'

      const htmlMessage = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 5px 5px; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #28a745; }
                .appointment-request { background: #fff3cd; padding: 10px; border-radius: 5px; border-left: 4px solid #ffc107; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>New Contact Form Submission</h2>
                    <p>Nutrition Education Website</p>
                </div>
                <div class="content">
                    <div class="field">
                        <span class="label">From:</span> ${fullName}
                    </div>
                    <div class="field">
                        <span class="label">Email:</span> ${this.form.email}
                    </div>
                    <div class="field">
                        <span class="label">Phone:</span> ${this.form.phone || 'Not provided'}
                    </div>
                    <div class="field">
                        <span class="label">Subject:</span> ${subjectText}
                    </div>
                    <div class="field">
                        <span class="label">Message:</span><br>
                        ${this.form.message.replace(/\n/g, '<br>')}
                    </div>
                    ${this.form.requestAppointment ? `
                    <div class="appointment-request">
                        <strong>📅 Appointment Requested:</strong> This user has requested a nutrition consultation appointment.
                    </div>
                    ` : ''}
                    <div class="field" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <small>This message was sent from the Nutrition Education website contact form.</small>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `

      return {
        subject: `Website Contact: ${subjectText} from ${fullName}`,
        htmlMessage: htmlMessage
      }
    },

    resetForm() {
      this.form = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        recipient: 'info@nutritionedu.org',
        customRecipient: '',
        subject: '',
        message: '',
        requestAppointment: false
      }
    },

    // 预填充已登录用户的信息
    prefillUserInfo() {
      if (this.isAuthenticated && this.currentUser) {
        if (this.userProfile) {
          this.form.firstName = this.userProfile.firstName || ''
          this.form.lastName = this.userProfile.lastName || ''
        }
        this.form.email = this.currentUser.email || ''
      }
    }
  },
  mounted() {
    this.prefillUserInfo()
  },
  watch: {
    isAuthenticated() {
      this.prefillUserInfo()
    }
  }
}
</script>

<style scoped>
.hero-section {
  padding-top: 120px;
}

.contact-icon {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}

.contact-form-card {
  border-radius: 15px;
}

.social-link {
  transition: all 0.3s ease;
  text-decoration: none;
}

.social-link:hover {
  transform: translateY(-3px);
  color: #1e7e34 !important;
}

.map-container {
  height: 560px;
}

.accordion-button {
  font-weight: 600;
  background-color: #f8f9fa;
  border-radius: 8px !important;
}

.accordion-button:not(.collapsed) {
  background-color: #e8f5e8;
  color: #198754;
  box-shadow: none;
}

.accordion-body {
  background-color: #f8f9fa;
  border-radius: 0 0 8px 8px;
}

.alert-info {
  background-color: #e8f4fd;
  border-color: #b6d7f7;
  color: #055160;
}

@media (max-width: 768px) {
  .contact-icon {
    width: 40px;
    height: 40px;
  }

  .hero-section {
    padding-top: 100px;
  }
}
</style>