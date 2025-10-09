<template>
    <div class="login-container bg-success">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-4">
            <div class="card shadow-lg">
              <div class="card-body p-5">
                <h2 class="text-center mb-4 text-success">
                  <i class="fas fa-sign-in-alt me-2"></i>Login
                </h2>
                
                <form @submit.prevent="handleLogin">
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
                  </div>
                  
                  <div class="d-grid gap-2">
                    <button 
                      type="submit" 
                      class="btn btn-success btn-lg"
                      :disabled="loading"
                    >
                      <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                      Login
                    </button>
                  </div>
                  
                  <div class="text-center mt-3">
                    <router-link to="/register" class="text-decoration-none">
                      Don't have an account? Register here
                    </router-link>
                  </div>
                </form>
                
                <!-- 错误提示 -->
                <div v-if="error" class="alert alert-danger mt-3" role="alert">
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
  import { validateEmail, validatePassword } from '../../utils/validators'
  
  export default {
    name: 'Login',
    data() {
      return {
        form: {
          email: '',
          password: ''
        },
        errors: {}
      }
    },
    computed: {
      ...mapGetters(['loading', 'error'])
    },
    methods: {
      ...mapActions(['login']),
      
      validateForm() {
        this.errors = {}
        
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
        
        return Object.keys(this.errors).length === 0
      },
      
      async handleLogin() {
        if (!this.validateForm()) return
        
        try {
          await this.login({
            email: this.form.email,
            password: this.form.password
          })
          
          // 根据用户角色重定向
          const userRole = localStorage.getItem('userRole')
          switch (userRole) {
            case 'admin':
              this.$router.push('/admin-dashboard')
              break
            case 'nutritionist':
              this.$router.push('/nutritionist-dashboard')
              break
            default:
              this.$router.push('/dashboard')
          }
        } catch (error) {
          // 错误已在store中处理
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
  
  .card {
    border: none;
    border-radius: 15px;
  }
  
  .card-body {
    border-radius: 15px;
  }
  </style>