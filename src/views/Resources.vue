<template>
  <div class="resources-page">
    <!-- Hero Section -->
    <section class="hero-section bg-light py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold text-success mb-4">Educational Resources</h1>
            <p class="lead mb-4">
              Access our comprehensive library of nutrition resources, meal plans,
              and educational materials to support your health journey.
            </p>
            <div class="d-flex gap-3">
              <button class="btn btn-success btn-lg" @click="scrollToResources">
                Explore Resources
              </button>
              <button class="btn btn-outline-success btn-lg" @click="showFilters = !showFilters">
                <i class="fas fa-filter me-2"></i>Filter
              </button>
            </div>
          </div>
          <div class="col-lg-6">
            <img src="@/assets/logo.svg" alt="Nutrition Resources" class="img-fluid rounded shadow">
          </div>
        </div>
      </div>
    </section>

    <!-- Loading State -->
    <section v-if="loading" class="py-5">
      <div class="container text-center">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading resources...</p>
      </div>
    </section>

    <!-- Filters -->
    <section v-else-if="!loading && resources.length > 0" v-show="showFilters"
      class="filters-section py-4 bg-white border-bottom">
      <div class="container">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label fw-bold">Category</label>
            <select v-model="filters.category" class="form-select" @change="filterResources">
              <option value="">All Categories</option>
              <option value="meal-plans">Meal Plans</option>
              <option value="recipes">Recipes</option>
              <option value="guides">Nutrition Guides</option>
              <option value="research">Research Articles</option>
              <option value="videos">Video Content</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label fw-bold">Difficulty</label>
            <select v-model="filters.difficulty" class="form-select" @change="filterResources">
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label fw-bold">Sort By</label>
            <select v-model="filters.sortBy" class="form-select" @change="handleSortChange">
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Title A-Z</option>
              <option value="downloads">Most Downloads</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- Resources Grid -->
    <section v-if="!loading" class="resources-grid py-5">
      <div class="container">
        <div class="row">
          <div class="col-12 mb-4">
            <h2 class="fw-bold text-success">Available Resources</h2>
            <p class="text-muted">
              Showing {{ filteredResources.length }} of {{ resources.length }} resources
            </p>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-4 col-md-6 mb-4" v-for="resource in filteredResources" :key="resource.id">
            <div class="card h-100 border-0 shadow-sm resource-card">
              <div class="card-img-top position-relative">
                <img :src="resource.image" class="card-img-top" :alt="resource.title"
                  style="height: 200px; object-fit: cover;">
                <span class="badge bg-success position-absolute top-0 end-0 m-2">
                  {{ formatCategory(resource.category) }}
                </span>
              </div>
              <div class="card-body d-flex flex-column">
                <h5 class="card-title text-success">{{ resource.title }}</h5>
                <p class="card-text flex-grow-1">{{ resource.description }}</p>

                <div class="resource-meta mb-3">
                  <small class="text-muted">
                    <i class="fas fa-chart-bar me-1"></i>{{ resource.difficulty }} •
                    <i class="fas fa-download me-1"></i>{{ resource.downloads || 0 }}
                  </small>
                </div>

                <RatingSystem :item-id="`resource-${resource.rid}`" :initial-rating="resource.calculatedRating || 0"
                  :initial-total-ratings="resource.calculatedReviews || 0" class="mb-3" />

                <div class="d-flex gap-2">
                  <button class="btn btn-success flex-fill" @click="isAuthenticated ? downloadResource(resource) : null"
                    :disabled="!isAuthenticated" :title="!isAuthenticated ? 'Login to download' : 'View / Download'">
                    <i class="fas fa-download"></i>{{ isAuthenticated ? 'View / Download' : 'Login to download' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredResources.length === 0 && !loading" class="text-center py-5">
          <i class="fas fa-search display-1 text-muted mb-3"></i>
          <h4 class="text-muted">No resources found</h4>
          <p class="text-muted">Try adjusting your filters to see more results.</p>
          <button class="btn btn-success" @click="clearFilters">
            Clear All Filters
          </button>
        </div>
      </div>
    </section>

    <!-- Export Section -->
    <section v-if="!loading && resources.length > 0" class="export-section bg-light py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h3 class="fw-bold text-success mb-2">Export Resources</h3>
            <p class="mb-0">Download your selected resources for offline access</p>
          </div>
          <div class="col-md-4 text-end">
            <ExportButton :data="selectedResources" :columns="exportColumns" filename="nutrition-resources"
              class="btn btn-success btn-lg" />
          </div>
        </div>
      </div>
    </section>

    <!-- No Resources State -->
    <section v-if="!loading && resources.length === 0" class="text-center py-5">
      <div class="container">
        <i class="fas fa-inbox display-1 text-muted mb-3"></i>
        <h3 class="text-muted">No Resources Available</h3>
        <p class="text-muted">Check back later for new educational materials.</p>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import RatingSystem from '@/components/Common/RatingSystem.vue'
import ExportButton from '@/components/Common/ExportButton.vue'
import { db } from '@/services/firebase'
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  increment,
  orderBy,
  query,
  where
} from 'firebase/firestore'

import { resourceService } from '@/services/resourceService' // 导入资源服务

export default {
  name: 'Resources',
  components: {
    RatingSystem,
    ExportButton
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser']),
    selectedResources() {
      return this.filteredResources.map(resource => ({
        Title: resource.title,
        Category: this.formatCategory(resource.category),
        Description: resource.description,
        Difficulty: resource.difficulty,
        Rating: resource.calculatedRating || 0,
        Downloads: resource.downloads || 0
      }))
    }
  },
  data() {
    return {
      loading: true,
      showFilters: false,
      filters: {
        category: '',
        difficulty: '',
        sortBy: 'newest'
      },
      resources: [],
      filteredResources: [],
      exportColumns: [
        { key: 'Title', label: 'Title' },
        { key: 'Category', label: 'Category' },
        { key: 'Description', label: 'Description' },
        { key: 'Difficulty', label: 'Difficulty' },
        { key: 'Rating', label: 'Rating' },
        { key: 'Downloads', label: 'Downloads' }
      ],
      ratingsData: {} // 存储评分数据 {resourceId: {rating: number, reviews: number}}
    }
  },
  async mounted() {
    await this.loadResourcesFromFirestore()
    await this.loadRatingsData() // 加载评分数据
    this.filteredResources = [...this.resources]
    this.sortResources()
  },
  methods: {
    async loadResourcesFromFirestore() {
      try {
        this.loading = true
        const resourcesCollection = collection(db, 'resources')
        const resourcesQuery = query(resourcesCollection, orderBy('createdAt', 'desc'))
        const resourcesSnapshot = await getDocs(resourcesQuery)

        this.resources = resourcesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        console.log('Loaded resources from Firestore:', this.resources.length)

        // 如果没有资源，初始化示例数据
        /*
        if (this.resources.length === 0) {
          console.log('No resources found, initializing sample data...')
          await resourceService.initializeSampleData()
          this.resources = await resourceService.getAllResources()
        }
        */
      } catch (error) {
        console.error('Error loading resources from Firestore:', error)
      } finally {
        this.loading = false
      }
    },

    // 从 Firestore 的 ratings 集合加载所有评分数据
    async loadRatingsData() {
      try {
        const ratingsCollection = collection(db, 'ratings')
        const ratingsSnapshot = await getDocs(ratingsCollection)

        // 按资源ID分组计算评分
        const ratingsByResource = {}

        ratingsSnapshot.docs.forEach(doc => {
          const ratingData = doc.data()
          const itemId = ratingData.itemId

          if (!ratingsByResource[itemId]) {
            ratingsByResource[itemId] = {
              totalRating: 0,
              count: 0
            }
          }

          ratingsByResource[itemId].totalRating += ratingData.rating
          ratingsByResource[itemId].count += 1
        })

        // 计算平均评分
        Object.keys(ratingsByResource).forEach(itemId => {
          const data = ratingsByResource[itemId]
          ratingsByResource[itemId] = {
            rating: data.totalRating / data.count,
            reviews: data.count
          }
        })

        this.ratingsData = ratingsByResource

        // 为每个资源添加计算后的评分数据
        this.resources.forEach(resource => {
          const resourceId = `resource-${resource.rid}`
          if (this.ratingsData[resourceId]) {
            resource.calculatedRating = this.ratingsData[resourceId].rating
            resource.calculatedReviews = this.ratingsData[resourceId].reviews
          } else {
            resource.calculatedRating = 0
            resource.calculatedReviews = 0
          }
        })

        console.log('Loaded ratings data:', this.ratingsData)
      } catch (error) {
        console.error('Error loading ratings data:', error)
      }
    },

    formatCategory(category) {
      const categoryMap = {
        'meal-plans': 'Meal Plans',
        'recipes': 'Recipes',
        'guides': 'Nutrition Guides',
        'research': 'Research Articles',
        'videos': 'Video Content'
      }
      return categoryMap[category] || category
    },

    filterResources() {
      this.filteredResources = this.resources.filter(resource => {
        const categoryMatch = !this.filters.category || resource.category === this.filters.category
        const difficultyMatch = !this.filters.difficulty || resource.difficulty === this.filters.difficulty

        return categoryMatch && difficultyMatch
      })

      this.sortResources()
    },

    getDateFromTimestamp(timestamp) {
      if (!timestamp) return new Date(0)

      if (timestamp.seconds && timestamp.nanoseconds) {
        return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000)
      }

      if (timestamp instanceof Date) {
        return timestamp
      }

      if (typeof timestamp === 'string') {
        return new Date(timestamp)
      }

      return new Date()
    },

    async handleSortChange() {
      // 如果按评分排序，确保评分数据已加载
      if (this.filters.sortBy === 'rating' && Object.keys(this.ratingsData).length === 0) {
        await this.loadRatingsData()
      }
      this.sortResources()
    },

    sortResources() {
      const sortField = this.filters.sortBy

      this.filteredResources.sort((a, b) => {
        switch (sortField) {
          case 'newest':
            const dateA = this.getDateFromTimestamp(a.createdAt)
            const dateB = this.getDateFromTimestamp(b.createdAt)
            return dateB - dateA
          case 'rating':
            // 使用从 ratings 集合计算出的评分
            return (b.calculatedRating || 0) - (a.calculatedRating || 0)
          case 'title':
            return a.title.localeCompare(b.title)
          case 'downloads':
            return (b.downloads || 0) - (a.downloads || 0)
          default:
            return 0
        }
      })
    },

    clearFilters() {
      this.filters = {
        category: '',
        difficulty: '',
        sortBy: 'newest'
      }
      this.filteredResources = [...this.resources]
      this.sortResources()
    },

    async downloadResource(resource) {
      if (!this.isAuthenticated) {
        alert('Please login to download resources')
        this.$router.push('/login')
        return
      }

      try {
        // 更新下载次数
        const resourceRef = doc(db, 'resources', resource.id)
        await updateDoc(resourceRef, {
          downloads: increment(1),
          updatedAt: new Date()
        })

        // 更新本地状态
        resource.downloads = (resource.downloads || 0) + 1

        // 触发下载
        if (resource.fileUrl) {
          window.open(resource.fileUrl, '_blank')
        } else {
          // 如果没有文件URL，显示成功消息
          alert(`Download started: ${resource.title}`)
        }

        console.log('Downloaded resource:', resource.title)

      } catch (error) {
        console.error('Error downloading resource:', error)
        alert('Error downloading resource. Please try again.')
      }
    },

    scrollToResources() {
      const resourcesSection = document.querySelector('.resources-grid')
      if (resourcesSection) {
        resourcesSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }
}
</script>

<style scoped>
.hero-section {
  padding-top: 120px;
}

.resource-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
}

.badge {
  font-size: 0.7rem;
  padding: 5px 10px;
}

.export-section {
  border-top: 1px solid #dee2e6;
  border-bottom: 1px solid #dee2e6;
}
</style>