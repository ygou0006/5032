<template>
    <div class="user-dashboard bg-success">
      <div class="container mt-4">
        <div class="row">
          <div class="col-12">
            <h2 class="fw-bold text-success">Welcome, {{ userProfile?.firstName }}!</h2>
            <p class="lead">Your Nutrition Journey Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { mapGetters } from 'vuex'
  
  export default {
    name: 'UserDashboard',
    components: {
    },
    computed: {
    },
    data() {
      return {
      }
    },
    methods: {
    }
  }
  </script>
  
  <style scoped>
  .user-dashboard {
    min-height: calc(100vh - 80px);
  }
  
  .card {
    transition: transform 0.2s ease;
  }
  
  .card:hover {
    transform: translateY(-2px);
  }
  </style>