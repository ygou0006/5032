<template>
  <div class="register-container bg-success">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow-lg">
            <div class="card-body p-4">
              <h2 class="text-center mb-4 text-success">
                <i class="fas fa-user-plus me-2"></i>Create Account
              </h2>
              
              <form @submit.prevent="handleRegister">
                <!-- 姓名 -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="firstName" class="form-label">First Name</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="firstName"
                      v-model="form.firstName"
                      :class="{ 'is-invalid': errors.firstName }"
                      required
                    >
                    <div class="invalid-feedback" v-if="errors.firstName">
                      {{ errors.firstName }}
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="lastName" class="form-label">Last Name</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="lastName"
                      v-model="form.lastName"
                      :class="{ 'is-invalid': errors.lastName }"
                      required
                    >
                    <div class="invalid-feedback" v-if="errors.lastName">
                      {{ errors.lastName }}
                    </div>
                  </div>
                </div>

                <!-- 邮箱 -->
                <div class="mb-3">
                  <label for="email" class="form-label">Email Address</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email"
                    v-model="form.email"
                    :class="{ 'is-invalid': errors.email }"
                    required
                  >
                  <div class="invalid-feedback" v-if="errors.email">
                    {{ errors.email }}
                  </div>
                </div>

                <!-- 密码 -->
                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password"
                    v-model="form.password"
                    :class="{ 'is-invalid': errors.password }"
                    required
                  >
                  <div class="invalid-feedback" v-if="errors.password">
                    {{ errors.password }}
                  </div>
                  <div class="form-text">
                    Password must be at least 6 characters long
                  </div>
                </div>

                <!-- 确认密码 -->
                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirm Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="confirmPassword"
                    v-model="form.confirmPassword"
                    :class="{ 'is-invalid': errors.confirmPassword }"
                    required
                  >
                  <div class="invalid-feedback" v-if="errors.confirmPassword">
                    {{ errors.confirmPassword }}
                  </div>
                </div>

                <!-- 用户角色 -->
                <div class="mb-4">
                  <label class="form-label">I want to join as:</label>
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="radio"
                      id="roleUser"
                      value="user" 
                      v-model="form.role"
                      checked
                    >
                    <label class="form-check-label" for="roleUser">
                      <strong>Community Member</strong> - Access resources and book appointments
                    </label>
                  </div>
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="radio" 
                      id="roleNutritionist"
                      value="nutritionist" 
                      v-model="form.role"
                    >
                    <label class="form-check-label" for="roleNutritionist">
                      <strong>Nutrition Professional</strong> - Provide consultations and guidance
                    </label>
                  </div>
                </div>

                <!-- 条款同意 -->
                <div class="mb-4">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="agreeTerms"
                      v-model="form.agreeTerms"
                      :class="{ 'is-invalid': errors.agreeTerms }"
                    >
                    <label class="form-check-label small" for="agreeTerms">
                      I agree to the <a href="#" class="text-success">Terms of Service</a> and <a href="#" class="text-success">Privacy Policy</a>
                    </label>
                    <div class="invalid-feedback" v-if="errors.agreeTerms">
                      {{ errors.agreeTerms }}
                    </div>
                  </div>
                </div>

                <!-- 注册按钮 -->
                <div class="d-grid gap-2">
                  <button 
                    type="submit" 
                    class="btn btn-success btn-lg"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    Create Account
                  </button>
                </div>

                <!-- 登录链接 -->
                <div class="text-center mt-3">
                  <router-link to="/login" class="text-decoration-none">
                    Already have an account? Sign in here
                  </router-link>
                </div>
              </form>

              <!-- 错误提示 -->
              <div v-if="error" class="alert alert-danger mt-3" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                {{ error }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { validateEmail, validatePassword } from '@/utils/validators'

export default {
  name: 'Register',
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        agreeTerms: false
      },
      errors: {}
    }
  },
  computed: {
    ...mapGetters(['loading', 'error'])
  },
  methods: {
    ...mapActions(['register']),
    
    validateForm() {
      this.errors = {}
      
      // 名字验证
      if (!this.form.firstName) {
        this.errors.firstName = 'First name is required'
      }
      
      if (!this.form.lastName) {
        this.errors.lastName = 'Last name is required'
      }
      
      // 邮箱验证
      if (!this.form.email) {
        this.errors.email = 'Email is required'
      } else if (!validateEmail(this.form.email)) {
        this.errors.email = 'Please enter a valid email address'
      }
      
      // 密码验证
      if (!this.form.password) {
        this.errors.password = 'Password is required'
      } else if (!validatePassword(this.form.password)) {
        this.errors.password = 'Password must be at least 6 characters long'
      }
      
      // 确认密码验证
      if (!this.form.confirmPassword) {
        this.errors.confirmPassword = 'Please confirm your password'
      } else if (this.form.password !== this.form.confirmPassword) {
        this.errors.confirmPassword = 'Passwords do not match'
      }
      
      // 条款同意验证
      if (!this.form.agreeTerms) {
        this.errors.agreeTerms = 'You must agree to the terms and conditions'
      }
      
      return Object.keys(this.errors).length === 0
    },
    
    async handleRegister() {
      if (!this.validateForm()) return
      
      try {
        await this.register(this.form)
        
        // 注册成功，根据用户角色重定向
        const userRole = this.form.role
        switch (userRole) {
          case 'nutritionist':
            this.$router.push('/nutritionist-dashboard')
            break
          default:
            this.$router.push('/dashboard')
        }
        
      } catch (error) {
        // 错误已在store中处理
        console.error('Registration error:', error)
      }
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 20px 0;
}

.card {
  border: none;
  border-radius: 15px;
}

.card-body {
  border-radius: 15px;
}

.form-check-label {
  font-size: 0.9rem;
  line-height: 1.4;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.invalid-feedback {
  display: block;
}

.form-text {
  font-size: 0.8rem;
  color: #6c757d;
}
</style>