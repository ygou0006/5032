<template>
  <div class="services-page">
    <!-- Hero Section -->
    <section class="hero-section bg-success text-white py-5">
      <div class="container">
        <div class="row text-center">
          <div class="col">
            <h1 class="display-4 fw-bold mb-4">Our Services</h1>
            <p class="lead mb-4">
              Comprehensive nutrition education and support services tailored to your needs
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Grid -->
    <section class="services-grid py-5">
      <div class="container">
        <div class="row">
          <div class="col-lg-4 col-md-6 mb-4" v-for="service in services" :key="service.id">
            <div class="card h-100 border-0 shadow-sm service-card">
              <div class="card-body text-center p-4">
                <i :class="service.icon" class="display-4 text-success mb-3"></i>
                <h4 class="card-title text-success">{{ service.title }}</h4>
                <p class="card-text">{{ service.description }}</p>
                <ul class="list-unstyled text-start small">
                  <li v-for="feature in service.features" :key="feature" class="mb-2">
                    <i class="fas fa-check text-success me-2"></i>{{ feature }}
                  </li>
                </ul>
                <div class="mt-3">
                  <span class="h5 text-dark">${{ service.price }}</span>
                  <span class="text-muted small">/{{ service.period }}</span>
                </div>
                <button class="btn btn-success mt-3" @click="bookService(service)" :disabled="!isAuthenticated">
                  {{ isAuthenticated ? 'Book Now' : 'Login to Book' }}
                </button>
                <RatingSystem v-if="service.rating" :item-id="`service-${service.id}`" :initial-rating="service.rating"
                  :initial-total-ratings="service.reviews" class="mt-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section bg-light py-5">
      <div class="container text-center">
        <h2 class="fw-bold text-success mb-4">Ready to Start Your Health Journey?</h2>
        <p class="lead mb-4">Join thousands of satisfied clients who have transformed their health</p>
        <div class="d-flex justify-content-center gap-3">
          <router-link to="/register" class="btn btn-success btn-lg">
            Get Started
          </router-link>
          <router-link to="/contact" class="btn btn-outline-success btn-lg">
            Contact Us
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import RatingSystem from '@/components/Common/RatingSystem.vue'

export default {
  name: 'Services',
  components: {
    RatingSystem
  },
  computed: {
    ...mapGetters(['isAuthenticated'])
  },
  data() {
    return {
      services: [
        {
          id: 1,
          title: 'Initial Consultation',
          icon: 'fas fa-user-md',
          description: 'Comprehensive health assessment and personalized nutrition plan',
          features: [
            '60-minute one-on-one session',
            'Detailed health assessment',
            'Personalized meal plan',
            'Follow-up support'
          ],
          price: 120,
          period: 'session',
          rating: 4.7,
          reviews: 234
        },
        {
          id: 2,
          title: 'Meal Planning Service',
          icon: 'fas fa-utensils',
          description: 'Customized weekly meal plans based on your preferences and goals',
          features: [
            'Weekly customized plans',
            'Grocery shopping list',
            'Recipe collection',
            'Nutrition analysis'
          ],
          price: 80,
          period: 'week',
          rating: 4.8,
          reviews: 189
        },
        {
          id: 3,
          title: 'Group Workshops',
          icon: 'fas fa-users',
          description: 'Interactive group sessions on various nutrition topics',
          features: [
            '90-minute group session',
            'Expert-led discussions',
            'Q&A opportunities',
            'Resource materials'
          ],
          price: 25,
          period: 'person',
          rating: 4.5,
          reviews: 156
        },
        {
          id: 4,
          title: 'Corporate Wellness',
          icon: 'fas fa-building',
          description: 'Nutrition education programs for workplace health',
          features: [
            'Team health assessments',
            'Lunch & learn sessions',
            'Wellness challenges',
            'Progress tracking'
          ],
          price: 500,
          period: 'program',
          rating: 4.9,
          reviews: 67
        },
        {
          id: 5,
          title: 'Online Coaching',
          icon: 'fas fa-laptop-medical',
          description: 'Virtual nutrition coaching from the comfort of your home',
          features: [
            'Video consultations',
            'Mobile app access',
            '24/7 messaging support',
            'Progress monitoring'
          ],
          price: 150,
          period: 'month',
          rating: 4.6,
          reviews: 312
        },
        {
          id: 6,
          title: 'Community Programs',
          icon: 'fas fa-hands-helping',
          description: 'Affordable nutrition education for the wider community',
          features: [
            'Sliding scale fees',
            'Multilingual resources',
            'Cultural sensitivity',
            'Community support'
          ],
          price: 0,
          period: 'free',
          rating: 4.8,
          reviews: 421
        }
      ]
    }
  },
  methods: {
    bookService(service) {
      if (this.isAuthenticated) {
        // 传递 service id 和 title
        this.$router.push(`/appointments?service=${service.id}&serviceTitle=${encodeURIComponent(service.title)}`)
      } else {
        this.$router.push('/login')
      }
    }
  }
}
</script>

<style scoped>
.hero-section {
  padding-top: 120px;
}

.service-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.service-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
}

.cta-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}
</style>