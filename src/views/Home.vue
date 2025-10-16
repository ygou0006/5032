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
            <img src="@/assets/logo.svg" alt="Healthy Nutrition" class="img-fluid rounded shadow">
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section py-5">
      <div class="container">
        <div class="row text-center mb-5">
          <div class="col">
            <h2 class="fw-bold text-success">Why Choose Our Program?</h2>
            <p class="lead">Comprehensive nutrition education for lasting health benefits</p>
          </div>
        </div>
        <div class="row">
          <div class="col-md-4 mb-4" v-for="feature in features" :key="feature.id">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <i :class="feature.icon" class="display-4 text-success mb-3"></i>
                <h5 class="card-title">{{ feature.title }}</h5>
                <p class="card-text">{{ feature.description }}</p>
                <!-- 添加评分系统到每个特性 -->
                <RatingSystem :item-id="`feature-${feature.id}`" :initial-rating="feature.rating"
                  :initial-total-ratings="feature.reviews" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Rating Section -->
    <section class="rating-section bg-light py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h3 class="fw-bold mb-4">What Our Community Says</h3>
            <RatingSystem item-id="home-page-overall" :initial-rating="4.5" :initial-total-ratings="127" />
            <p class="mt-3">
              Join thousands of satisfied members who have transformed their health through
              our evidence-based nutrition programs.
            </p>
          </div>
          <div class="col-lg-6">
            <!-- 这里可以添加评价轮播 -->
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import RatingSystem from '@/components/Common/RatingSystem.vue'

export default {
  name: 'Home',
  components: {
    RatingSystem
  },
  data() {
    return {
      features: [
        {
          id: 1,
          icon: 'fas fa-graduation-cap',
          title: 'Expert-Led Education',
          description: 'Learn from certified nutritionists and dietitians with years of experience.',
          rating: 4.8,
          reviews: 156
        },
        {
          id: 2,
          title: 'Personalized Plans',
          icon: 'fas fa-user-cog',
          description: 'Customized nutrition plans tailored to your specific health goals and needs.',
          rating: 4.7,
          reviews: 128
        },
        {
          id: 3,
          title: 'Community Support',
          icon: 'fas fa-users',
          description: 'Join a supportive community of individuals on similar health journeys.',
          rating: 4.6,
          reviews: 203
        }
      ]
    }
  }
}
</script>

<style scoped>
.hero-section {
  margin-top: -80px;
  padding-top: 120px;
}

.features-section .card {
  transition: transform 0.3s ease;
}

.features-section .card:hover {
  transform: translateY(-5px);
}
</style>