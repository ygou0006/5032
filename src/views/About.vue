<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="hero-section bg-light py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold text-success mb-4">About Nutrition Education</h1>
            <p class="lead mb-4">
              We are a Melbourne-based non-profit organization dedicated to improving public health
              through evidence-based nutrition education and community support programs.
            </p>
          </div>
          <div class="col-lg-6">
            <img src="@/assets/logo.svg" alt="About Nutrition Education" class="img-fluid rounded shadow">
          </div>
        </div>
      </div>
    </section>

    <!-- Mission & Vision -->
    <section class="mission-section py-5">
      <div class="container">
        <div class="row">
          <div class="col-lg-6 mb-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <i class="fas fa-bullseye display-4 text-success mb-3"></i>
                <h3 class="card-title text-success">Our Mission</h3>
                <p class="card-text">
                  To empower individuals and communities with practical nutrition knowledge
                  and resources that promote lifelong health and well-being through accessible
                  education programs and personalized support.
                </p>
              </div>
            </div>
          </div>
          <div class="col-lg-6 mb-4">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center p-4">
                <i class="fas fa-eye display-4 text-success mb-3"></i>
                <h3 class="card-title text-success">Our Vision</h3>
                <p class="card-text">
                  A world where every individual has access to evidence-based nutrition education
                  and the tools needed to make informed decisions about their health, leading to
                  healthier communities and reduced health disparities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="team-section bg-light py-5">
      <div class="container">
        <div class="row text-center mb-5">
          <div class="col">
            <h2 class="fw-bold text-success">Meet Our Nutrition Experts</h2>
            <p class="lead">Certified professionals committed to your health journey</p>
          </div>
        </div>

        <!-- 搜索和筛选 -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
              <input type="text" class="form-control" placeholder="Search nutritionists by name or specialty..."
                v-model="searchQuery" @input="handleSearch">
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="sortBy" @change="applySorting">
              <option value="rating">Sort by Rating</option>
              <option value="experience">Sort by Experience</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="pageSize" @change="updatePagination">
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="30">30 per page</option>
            </select>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading nutritionists...</p>
        </div>

        <!-- 营养师列表 -->
        <div class="row" v-else>
          <div class="col-md-3 mb-3" v-for="nutritionist in paginatedNutritionists" :key="nutritionist.uid">
            <div class="card h-100 border-0 shadow-sm">
              <!-- 营养师图片 -->
              <div class="nutritionist-image-container">
                <img :src="nutritionist.profileImage || defaultProfileImage" class="card-img-top nutritionist-image"
                  :alt="nutritionist.firstName" @error="handleImageError">
                <div class="nutritionist-badge">
                  <i class="fas fa-user-md me-1"></i> Nutritionist
                </div>
              </div>

              <div class="card-body text-center">
                <!-- 姓名 -->
                <h5 class="card-title">{{ nutritionist.firstName }} {{ nutritionist.lastName }}</h5>

                <!-- 专业领域 -->
                <p v-if="nutritionist.specialty" class="card-text text-success small fw-bold">
                  {{ nutritionist.specialty }}
                </p>

                <!-- 资质 -->
                <p v-if="nutritionist.qualifications" class="card-text small text-muted">
                  <i class="fas fa-graduation-cap me-1"></i>
                  {{ nutritionist.qualifications }}
                </p>

                <!-- 简介 -->
                <p v-if="nutritionist.bio" class="card-text small">
                  {{ nutritionist.bio }}
                </p>

                <!-- 工作经验 -->
                <p v-if="nutritionist.experience" class="card-text small text-muted">
                  <i class="fas fa-briefcase me-1"></i>
                  {{ nutritionist.experience }} years experience
                </p>

                <!-- 语言 -->
                <p v-if="nutritionist.languages && nutritionist.languages.length" class="card-text small text-muted">
                  <i class="fas fa-language me-1"></i>
                  {{ nutritionist.languages.join(', ') }}
                </p>

                <!-- 评分系统 -->
                <RatingSystem :item-id="`nutritionist-${nutritionist.uid}`"
                  :initial-rating="nutritionist.averageRating || 0"
                  :initial-total-ratings="nutritionist.totalRatings || 0" />

                <!-- 无资料提示 -->
                <div v-if="!nutritionist.bio && !nutritionist.specialty && !nutritionist.qualifications"
                  class="mt-2 p-2 bg-light rounded">
                  <small class="text-muted">
                    <i class="fas fa-info-circle me-1"></i>
                    This nutritionist hasn't completed their profile yet.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && filteredNutritionists.length === 0" class="text-center py-5">
          <i class="fas fa-user-md display-1 text-muted mb-3"></i>
          <h4 class="text-muted">No Nutritionists Found</h4>
          <p class="text-muted">Try adjusting your search criteria.</p>
          <button class="btn btn-success" @click="clearFilters">
            Clear Filters
          </button>
        </div>

        <!-- 分页控件 -->
        <div v-if="!loading && filteredNutritionists.length > 0" class="row mt-4">
          <div class="col-12">
            <nav aria-label="Nutritionists pagination">
              <ul class="pagination justify-content-center">
                <!-- 上一页 -->
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="changePage(currentPage - 1)">
                    <i class="fas fa-chevron-left"></i> Previous
                  </button>
                </li>

                <!-- 页码 -->
                <li v-for="page in visiblePages" :key="page" class="page-item"
                  :class="{ active: page === currentPage }">
                  <button class="page-link" @click="changePage(page)">
                    {{ page }}
                  </button>
                </li>

                <!-- 下一页 -->
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="changePage(currentPage + 1)">
                    Next <i class="fas fa-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>

            <!-- 页面信息 -->
            <div class="text-center mt-2">
              <p class="text-muted small">
                Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredNutritionists.length }} nutritionists
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { db } from '@/services/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import RatingSystem from '@/components/Common/RatingSystem.vue'
import _defaultProfileImage from '@/assets/default-profile.jpg';

export default {
  name: 'About',
  components: {
    RatingSystem
  },
  data() {
    return {
      loading: true,
      allNutritionists: [], // 所有营养师数据
      filteredNutritionists: [], // 筛选后的营养师数据
      paginatedNutritionists: [], // 当前页显示的营养师数据
      defaultProfileImage: _defaultProfileImage,

      // 分页相关
      currentPage: 1,
      pageSize: 10,

      // 搜索和排序
      searchQuery: '',
      sortBy: 'rating'
    }
  },
  computed: {
    // 总页数
    totalPages() {
      return Math.ceil(this.filteredNutritionists.length / this.pageSize)
    },

    // 当前页的起始索引
    startIndex() {
      return (this.currentPage - 1) * this.pageSize
    },

    // 当前页的结束索引
    endIndex() {
      const end = this.startIndex + this.pageSize
      return end > this.filteredNutritionists.length ? this.filteredNutritionists.length : end
    },

    // 可见的页码（最多显示5个）
    visiblePages() {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(this.totalPages, start + maxVisible - 1)

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      return pages
    }
  },
  async mounted() {
    await this.loadNutritionists()
  },
  methods: {
    async loadNutritionists() {
      try {
        this.loading = true

        // 查询所有角色为营养师的用户
        const nutritionistsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'nutritionist'),
          where('isActive', '==', true)
        )

        const querySnapshot = await getDocs(nutritionistsQuery)

        this.allNutritionists = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            uid: doc.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            specialty: data.specialty || '',
            qualifications: data.qualifications || '',
            bio: data.bio || '',
            experience: data.experience || 0,
            languages: data.languages || [],
            profileImage: data.profileImage || '',
            averageRating: data.averageRating || 0,
            totalRatings: data.totalRatings || 0,
            createdAt: data.createdAt || null,
            // 用于搜索的完整名称
            fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim().toLowerCase()
          }
        })

        // 应用初始排序和筛选
        this.applySorting()

      } catch (error) {
        console.error('Error loading nutritionists:', error)
        // 如果查询失败，使用模拟数据作为后备
        this.allNutritionists = this.getMockNutritionists()
        this.applySorting()
      } finally {
        this.loading = false
      }
    },

    // 处理搜索
    handleSearch() {
      this.currentPage = 1 // 重置到第一页
      this.applySorting()
    },

    // 应用排序和筛选
    applySorting() {
      // 首先应用搜索筛选
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        this.filteredNutritionists = this.allNutritionists.filter(nutritionist => {
          return (
            nutritionist.fullName.includes(query) ||
            (nutritionist.specialty && nutritionist.specialty.toLowerCase().includes(query)) ||
            (nutritionist.qualifications && nutritionist.qualifications.toLowerCase().includes(query)) ||
            (nutritionist.bio && nutritionist.bio.toLowerCase().includes(query))
          )
        })
      } else {
        this.filteredNutritionists = [...this.allNutritionists]
      }

      // 然后应用排序
      switch (this.sortBy) {
        case 'rating':
          this.filteredNutritionists.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          break
        case 'experience':
          this.filteredNutritionists.sort((a, b) => (b.experience || 0) - (a.experience || 0))
          break
        case 'name':
          this.filteredNutritionists.sort((a, b) => a.fullName.localeCompare(b.fullName))
          break
        default:
          // 默认按资料完整性排序
          this.filteredNutritionists.sort((a, b) => {
            const aComplete = this.isProfileComplete(a)
            const bComplete = this.isProfileComplete(b)

            if (aComplete && !bComplete) return -1
            if (!aComplete && bComplete) return 1

            return (b.averageRating || 0) - (a.averageRating || 0)
          })
      }

      // 更新分页数据
      this.updatePagination()
    },

    // 更新分页数据
    updatePagination() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      this.paginatedNutritionists = this.filteredNutritionists.slice(start, end)
    },

    // 切换页面
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        this.updatePagination()
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },

    isProfileComplete(nutritionist) {
      return !!(nutritionist.bio && nutritionist.specialty && nutritionist.qualifications)
    },

    handleImageError(event) {
      // 图片加载失败时使用默认图片
      event.target.src = this.defaultProfileImage
    },

    // 清除筛选条件
    clearFilters() {
      this.searchQuery = ''
      this.sortBy = 'rating'
      this.currentPage = 1
      this.applySorting()
    },

    // 后备模拟数据（在实际数据不可用时使用）
    getMockNutritionists() {
      return [
        {
          uid: 'mock-1',
          firstName: 'Sarah',
          lastName: 'Chen',
          email: 'sarah@example.com',
          specialty: 'Clinical Nutrition',
          qualifications: 'PhD in Nutritional Sciences',
          bio: 'Specialized in clinical nutrition with 10+ years of experience helping patients with chronic conditions.',
          experience: 12,
          languages: ['English', 'Mandarin'],
          averageRating: 4.8,
          totalRatings: 127,
          fullName: 'sarah chen'
        },
        {
          uid: 'mock-2',
          firstName: 'Michael',
          lastName: 'Rodriguez',
          email: 'michael@example.com',
          specialty: 'Sports Nutrition',
          qualifications: 'MSc in Sports Science',
          bio: 'Focused on optimizing athletic performance through personalized nutrition plans.',
          experience: 8,
          languages: ['English', 'Spanish'],
          averageRating: 4.6,
          totalRatings: 89,
          fullName: 'michael rodriguez'
        },
        {
          uid: 'mock-3',
          firstName: 'Emily',
          lastName: 'Watson',
          email: 'emily@example.com',
          specialty: 'Pediatric Nutrition',
          qualifications: 'RD, Certified Pediatric Nutritionist',
          bio: 'Specializing in nutrition for children and adolescents with a focus on healthy growth and development.',
          experience: 6,
          languages: ['English'],
          averageRating: 4.9,
          totalRatings: 95,
          fullName: 'emily watson'
        },
        {
          uid: 'mock-4',
          firstName: 'James',
          lastName: 'Wilson',
          email: 'james@example.com',
          specialty: 'Weight Management',
          qualifications: 'MSc in Dietetics',
          bio: 'Helping clients achieve sustainable weight loss through evidence-based nutrition strategies.',
          experience: 10,
          languages: ['English', 'French'],
          averageRating: 4.7,
          totalRatings: 143,
          fullName: 'james wilson'
        },
        {
          uid: 'mock-5',
          firstName: 'Lisa',
          lastName: 'Garcia',
          email: 'lisa@example.com',
          specialty: 'Gut Health',
          qualifications: 'PhD in Nutritional Biochemistry',
          bio: 'Expert in digestive health and the gut microbiome with research background in probiotics.',
          experience: 7,
          languages: ['English', 'Spanish'],
          averageRating: 4.8,
          totalRatings: 78,
          fullName: 'lisa garcia'
        },
        {
          uid: 'mock-6',
          firstName: 'David',
          lastName: 'Kim',
          email: 'david@example.com',
          specialty: 'Plant-Based Nutrition',
          qualifications: 'RD, Certified in Plant-Based Nutrition',
          bio: 'Helping clients transition to and thrive on plant-based diets for optimal health.',
          experience: 5,
          languages: ['English', 'Korean'],
          averageRating: 4.5,
          totalRatings: 64,
          fullName: 'david kim'
        },
        {
          uid: 'mock-7',
          firstName: 'Anna',
          lastName: 'Patel',
          email: 'anna@example.com',
          specialty: 'Diabetes Management',
          qualifications: 'CDE, RD',
          bio: 'Certified Diabetes Educator specializing in medical nutrition therapy for diabetes prevention and management.',
          experience: 9,
          languages: ['English', 'Hindi'],
          averageRating: 4.9,
          totalRatings: 112,
          fullName: 'anna patel'
        },
        {
          uid: 'mock-8',
          firstName: 'Robert',
          lastName: 'Taylor',
          email: 'robert@example.com',
          specialty: 'Geriatric Nutrition',
          qualifications: 'MSc in Clinical Nutrition',
          bio: 'Focus on nutritional needs of older adults and strategies for healthy aging.',
          experience: 11,
          languages: ['English'],
          averageRating: 4.6,
          totalRatings: 87,
          fullName: 'robert taylor'
        }
      ]
    }
  }
}
</script>

<style scoped>
.hero-section {
  padding-top: 120px;
}

.card {
  max-width: 350px;
}

.mission-section .card {
  transition: transform 0.3s ease;
}

.mission-section .card:hover {
  transform: translateY(-5px);
}

.nutritionist-image-container {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.nutritionist-image {
  height: 100%;
  width: 100%;
  object-fit: fill;
  object-position: center;
}

.nutritionist-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(40, 167, 69, 0.9);
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
}

.team-section .card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.team-section .card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
}

.card-text.small {
  line-height: 1.4;
}

.pagination .page-link {
  color: #000;
  border-color: #dee2e6;
}

.pagination .page-item.active .page-link {
  background-color: #28a745;
  border-color: #28a745;
}

.pagination .page-link:hover {
  color: #060;
}
</style>