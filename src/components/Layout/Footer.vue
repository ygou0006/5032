<template>
    <footer class="bg-dark text-light py-4 mt-auto">
      <div class="container">
        <div class="row">

          <!-- 关于我们 -->
          <div class="col-lg-4 mb-4">
            <h5 class="text-success mb-3">
              <i class="fas fa-apple-alt me-2"></i>Nutrition Education
            </h5>
            <p class="small">
              Empowering communities through evidence-based nutrition education and personalized 
              guidance for better health outcomes.
            </p>
            <div class="social-links">
              <a href="#" class="text-light me-3"><i class="fab fa-facebook-f"></i></a>
              <a href="#" class="text-light me-3"><i class="fab fa-twitter"></i></a>
              <a href="#" class="text-light me-3"><i class="fab fa-instagram"></i></a>
              <a href="#" class="text-light"><i class="fab fa-linkedin-in"></i></a>
            </div>
          </div>
  
          <!-- 快速链接 -->
          <div class="col-lg-2 col-md-6 mb-4">
            <h6 class="text-success mb-3">Quick Links</h6>
            <ul class="list-unstyled">
              <li class="mb-2">
                <router-link to="/" class="text-light text-decoration-none small">Home</router-link>
              </li>
              <li class="mb-2">
                <router-link to="/about" class="text-light text-decoration-none small">About Us</router-link>
              </li>
              <li class="mb-2">
                <router-link to="/services" class="text-light text-decoration-none small">Services</router-link>
              </li>
              <li class="mb-2">
                <router-link to="/resources" class="text-light text-decoration-none small">Resources</router-link>
              </li>
            </ul>
          </div>

          <!-- 服务 -->
          <div class="col-lg-3 col-md-6 mb-4">
            <h6 class="text-success mb-3">Our Services</h6>
            <ul class="list-unstyled">
              <li class="mb-2">
                <a href="#" class="text-light text-decoration-none small">Nutrition Counseling</a>
              </li>
              <li class="mb-2">
                <a href="#" class="text-light text-decoration-none small">Meal Planning</a>
              </li>
              <li class="mb-2">
                <a href="#" class="text-light text-decoration-none small">Health Workshops</a>
              </li>
              <li class="mb-2">
                <a href="#" class="text-light text-decoration-none small">Community Programs</a>
              </li>
            </ul>
          </div>

          <!-- 联系信息 -->
          <div class="col-lg-3 mb-4">
            <h6 class="text-success mb-3">Contact Info</h6>
            <ul class="list-unstyled small">
              <li class="mb-2">
                <i class="fas fa-map-marker-alt text-success me-2"></i>
                123 Health Street, Melbourne VIC 3000
              </li>
              <li class="mb-2">
                <i class="fas fa-phone text-success me-2"></i>
                +61 3 1234 5678
              </li>
              <li class="mb-2">
                <i class="fas fa-envelope text-success me-2"></i>
                info@nutritionedu.org
              </li>
              <li class="mb-2">
                <i class="fas fa-clock text-success me-2"></i>
                Mon-Fri: 9AM-6PM
              </li>
            </ul>
          </div>
        </div>
  
        <hr class="bg-light">
  
        <!-- 底部版权和链接 -->
        <div class="row align-items-center">
          <div class="col-md-6">
            <p class="small mb-0">
              &copy; 2025 Nutrition Education. All rights reserved.
            </p>
          </div>
          <div class="col-md-6 text-md-end">
            <div class="footer-links">
              <router-link to="/privacy" class="text-light text-decoration-none small me-3">
                Privacy Policy
              </router-link>
              <router-link to="/terms" class="text-light text-decoration-none small me-3">
                Terms of Service
              </router-link>
              <router-link to="/accessibility" class="text-light text-decoration-none small">
                Accessibility
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    name: 'Footer',
    data() {
      return {
        currentYear: new Date().getFullYear()
      }
    }
  }
  </script>
  
  <style scoped>
  footer {
    margin-top: auto;
  }
  
  .social-links a {
    transition: color 0.3s ease;
  }
  
  .social-links a:hover {
    color: #28a745 !important;
  }
  
  .footer-links a {
    transition: color 0.3s ease;
  }
  
  .footer-links a:hover {
    color: #28a745 !important;
  }
  
  .list-unstyled li a {
    transition: color 0.3s ease, padding-left 0.3s ease;
  }
  
  .list-unstyled li a:hover {
    color: #28a745 !important;
    padding-left: 5px;
  }
  </style>