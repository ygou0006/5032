<template>
    <div class="home">
      <!-- Hero Section -->
      <section class="hero-section bg-success text-white py-5">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-lg-6">
              <h1 class="display-4 fw-bold mb-4">
                Transform Your Health Through Nutrition Education
              </h1>
              <p class="lead mb-4">
                Empowering communities with evidence-based nutrition knowledge and personalized guidance 
                for better health outcomes.
              </p>
              <div class="d-flex gap-3">
                <router-link to="/services" class="btn btn-light btn-lg">
                  Our Services
                </router-link>
                <router-link to="/register" class="btn btn-outline-light btn-lg">
                  Get Started
                </router-link>
              </div>
            </div>
            <div class="col-lg-6">
              <img 
                src="@/assets/logo.svg" 
                alt="Healthy Nutrition"
                class="img-fluid rounded shadow"
              >
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script>
  //import RatingSystem from '@/components/Common/RatingSystem.vue'
  
  export default {
    name: 'Home',
    data() {
    }
  }
  </script>
  
  <style scoped>
  .hero-section {
    margin-top: 0px;
    padding-top: 120px;
  }
  
  .features-section .card {
    transition: transform 0.3s ease;
  }
  
  .features-section .card:hover {
    transform: translateY(-5px);
  }
  </style>