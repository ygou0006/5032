<template>
  <div class="blog-page">
    <!-- 英雄区域 -->
    <section class="hero-section bg-success text-white py-5">
      <div class="container">
        <div class="row text-center">
          <div class="col">
            <h1 class="display-4 fw-bold mb-4">Nutrition Blog</h1>
            <p class="lead mb-4">
              Evidence-based articles, research updates, and practical nutrition tips from our experts
            </p>
            <button v-if="isAuthenticated" class="btn btn-light btn-lg" @click="showCreateModal = true">
              <i class="fas fa-plus me-2"></i>Write a Post
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 筛选和搜索区域 -->
    <section class="filters-section py-4 bg-light">
      <div class="container">
        <div class="row g-3 align-items-center">
          <!-- 搜索 -->
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-search"></i>
              </span>
              <input type="text" class="form-control" placeholder="Search articles..." v-model="filters.search"
                @input="debouncedSearch">
            </div>
          </div>

          <!-- 分类筛选 -->
          <div class="col-md-3">
            <select v-model="filters.category" class="form-select" @change="loadPosts">
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <!-- 排序选项 -->
          <div class="col-md-3">
            <select v-model="filters.sortBy" class="form-select" @change="loadPosts">
              <option value="createdAt">Newest First</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>

          <!-- 帖子计数 -->
          <div class="col-md-2 text-end">
            <span class="text-muted">{{ totalPosts }} posts</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 博客帖子区域 -->
    <section class="blog-posts py-5">
      <div class="container">
        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading posts...</p>
        </div>

        <!-- 帖子网格 -->
        <div v-else class="row">
          <div class="col-lg-8">
            <!-- 帖子列表 -->
            <div v-if="posts.length > 0">
              <div v-for="post in posts" :key="post.id" class="card mb-3 post-card" :data-post-id="post.id">
                <div class="card-body p-3">
                  <!-- 帖子头部 -->
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="flex-grow-1">
                      <span class="badge bg-success mb-1">{{ post.category }}</span>
                      <h3 class="card-title h5 mb-1 fw-bold">
                        <a href="#" class="text-decoration-none text-dark" @click.prevent="togglePostExpanded(post)">
                          {{ post.title }}
                        </a>
                      </h3>
                    </div>
                    <div class="dropdown" v-if="canEditPost(post)">
                      <button class="btn btn-sm btn-outline-secondary border-0 p-1" data-bs-toggle="dropdown">
                        <i class="fas fa-ellipsis-v fa-xs"></i>
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end">
                        <li>
                          <button class="dropdown-item small" @click="editPost(post)">
                            <i class="fas fa-edit me-1"></i>Edit
                          </button>
                        </li>
                        <li>
                          <button class="dropdown-item small text-danger" @click="deletePost(post)">
                            <i class="fas fa-trash me-1"></i>Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- 帖子元信息 -->
                  <div class="post-meta mb-2">
                    <small class="text-muted">
                      <i class="fas fa-user me-1"></i>
                      {{ post.authorName }}
                      <span class="badge ms-1" :class="getRoleBadgeClass(post.authorRole)">
                        {{ post.authorRole }}
                      </span>
                      •
                      <i class="fas fa-calendar me-1"></i>
                      {{ formatDate(post.createdAt) }}
                    </small>
                  </div>

                  <!-- 帖子内容预览 -->
                  <div v-if="!post.expanded" class="content-preview mb-2">
                    <p class="card-text small text-muted">{{ getContentPreview(post.content) }}</p>
                  </div>

                  <!-- 完整内容（展开时显示） -->
                  <div v-if="post.expanded" class="post-content mb-3">
                    <div class="content-html small" v-html="post.content"></div>
                  </div>

                  <!-- 帖子操作 -->
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="d-flex gap-2">
                      <!-- 点赞按钮 -->
                      <button class="btn btn-sm btn-outline-danger py-1 px-2"
                        :class="{ 'btn-danger text-white': post.userLiked }" @click="toggleLike(post)"
                        :disabled="!isAuthenticated">
                        <i class="fas fa-heart me-1"></i>
                        <span class="small">{{ post.likesCount || 0 }}</span>
                      </button>

                      <!-- 展开/收起按钮 -->
                      <button class="btn btn-sm btn-outline-success py-1 px-2" @click="togglePostExpanded(post)">
                        <i class="fas" :class="post.expanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                        <span class="small ms-1">{{ post.expanded ? 'Less' : 'More' }}</span>
                      </button>
                    </div>

                    <!-- 评分系统 -->
                    <RatingSystem :item-id="post.id" :initial-rating="post.averageRating || 0"
                      :initial-total-ratings="post.ratingsCount || 0" class="ms-2" />
                  </div>

                  <!-- 评论区域 -->
                  <div v-if="post.expanded" class="comments-section mt-3 border-top pt-2">
                    <!-- 评论表单 -->
                    <div v-if="isAuthenticated" class="comment-form mb-3">
                      <div class="input-group input-group-sm">
                        <input type="text" class="form-control" placeholder="Write a comment..."
                          v-model="post.newComment" @keyup.enter="addComment(post)">
                        <button class="btn btn-success" @click="addComment(post)" :disabled="!post.newComment?.trim()">
                          <i class="fas fa-paper-plane"></i>
                        </button>
                      </div>
                    </div>

                    <!-- 评论列表 -->
                    <div class="comments-list">
                      <div v-for="comment in post.comments" :key="comment.id"
                        class="comment-item mb-2 pb-2 border-bottom">
                        <div class="d-flex justify-content-between align-items-start">
                          <div class="flex-grow-1">
                            <div class="d-flex align-items-center mb-1">
                              <strong class="small me-2">{{ comment.authorName }}</strong>
                              <span class="badge me-2" :class="getRoleBadgeClass(comment.authorRole)">
                                {{ comment.authorRole }}
                              </span>
                              <small class="text-muted">{{ formatRelativeTime(comment.createdAt) }}</small>
                            </div>
                            <p class="small mb-0">{{ comment.content }}</p>
                          </div>
                          <button v-if="canDeleteComment(comment)"
                            class="btn btn-sm btn-outline-danger border-0 p-0 ms-2"
                            @click="deleteComment(post, comment)">
                            <i class="fas fa-times fa-xs"></i>
                          </button>
                        </div>
                      </div>

                      <!-- 无评论状态 -->
                      <div v-if="!post.comments || post.comments.length === 0" class="text-center py-2">
                        <small class="text-muted">No comments yet. Be the first to comment!</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 分页 -->
              <nav v-if="totalPages >= 1" aria-label="Blog pagination">
                <ul class="pagination justify-content-center">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="changePage(currentPage - 1)">
                      <i class="fas fa-chevron-left"></i>
                    </button>
                  </li>

                  <li v-for="page in visiblePages" :key="page" class="page-item"
                    :class="{ active: page === currentPage }">
                    <button class="page-link" @click="changePage(page)">
                      {{ page }}
                    </button>
                  </li>

                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <button class="page-link" @click="changePage(currentPage + 1)">
                      <i class="fas fa-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            <!-- 空状态 -->
            <div v-else class="text-center py-5">
              <i class="fas fa-newspaper display-1 text-muted mb-3"></i>
              <h4 class="text-muted">No posts found</h4>
              <p class="text-muted">
                {{ filters.search ? 'Try adjusting your search terms' : 'No blog posts available yet' }}
              </p>
              <button v-if="isAuthenticated && !filters.search" class="btn btn-success" @click="showCreateModal = true">
                Create First Post
              </button>
            </div>
          </div>

          <!-- 侧边栏 -->
          <div class="col-lg-4">
            <!-- 分类小部件 -->
            <div class="card mb-4">
              <div class="card-header bg-success text-white">
                <h5 class="mb-0">Categories</h5>
              </div>
              <div class="card-body">
                <div class="list-group list-group-flush">
                  <button v-for="category in categories" :key="category"
                    class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    :class="{ active: filters.category === category }" @click="setCategory(category)">
                    {{ category }}
                    <span class="badge bg-success rounded-pill">
                      {{ getCategoryCount(category) }}
                    </span>
                  </button>
                  <button
                    class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    :class="{ active: !filters.category }" @click="clearCategory">
                    All Categories
                    <span class="badge bg-secondary rounded-pill">
                      {{ totalPosts }}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <!-- 热门帖子 -->
            <div class="card mb-4">
              <div class="card-header bg-success text-white">
                <h5 class="mb-0">Popular Posts</h5>
              </div>
              <div class="card-body">
                <div v-for="popularPost in popularPosts" :key="popularPost.id" class="mb-3 pb-3 border-bottom">
                  <h6 class="card-title mb-1">
                    <a href="#" class="text-decoration-none text-dark" @click.prevent="scrollToPost(popularPost.id)">
                      {{ popularPost.title }}
                    </a>
                  </h6>
                  <small class="text-muted">
                    {{ formatDate(popularPost.createdAt) }} •
                    <i class="fas fa-heart text-danger me-1"></i>{{ popularPost.likesCount }}
                  </small>
                </div>
              </div>
            </div>

            <!-- 标签云 -->
            <div class="card">
              <div class="card-header bg-success text-white">
                <h5 class="mb-0">Tags</h5>
              </div>
              <div class="card-body">
                <div class="d-flex flex-wrap gap-2">
                  <span v-for="tag in allTags" :key="tag" class="badge bg-light text-dark border cursor-pointer"
                    @click="searchByTag(tag)">
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 创建/编辑帖子模态框 -->
    <div class="modal fade" :class="{ show: showCreateModal, 'd-block': showCreateModal }" tabindex="-1"
      v-if="showCreateModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">
              {{ editingPost ? 'Edit Post' : 'Create New Post' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="savePost">
              <div class="mb-3">
                <label class="form-label">Title</label>
                <input type="text" class="form-control" v-model="postForm.title" required>
              </div>

              <div class="mb-3">
                <label class="form-label">Category</label>
                <select class="form-select" v-model="postForm.category" required>
                  <option value="">Select Category</option>
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Content</label>
                <textarea class="form-control" rows="10" v-model="postForm.content" required></textarea>
                <div class="form-text">
                  You can use basic HTML formatting in your post content.
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Tags (comma separated)</label>
                <input type="text" class="form-control" v-model="postForm.tags" placeholder="nutrition, health, diet">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Cancel
            </button>
            <button type="button" class="btn btn-success" @click="savePost" :disabled="savingPost">
              <span v-if="savingPost" class="spinner-border spinner-border-sm me-2"></span>
              {{ editingPost ? 'Update Post' : 'Create Post' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showCreateModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { db } from '@/services/firebase'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp
} from 'firebase/firestore'
import { debounce } from '@/utils/helpers'
import RatingSystem from '@/components/Common/RatingSystem.vue'

export default {
  name: 'Blog',
  components: {
    RatingSystem
  },
  data() {
    return {
      loading: true,
      posts: [],
      popularPosts: [],
      categories: [
        'Nutrition Science',
        'Healthy Recipes',
        'Weight Management',
        'Sports Nutrition',
        'Clinical Nutrition',
        'Community Health'
      ],
      allTags: [],
      filters: {
        search: '',
        category: '',
        sortBy: 'createdAt'
      },
      pagination: {
        currentPage: 1,
        pageSize: 10, // 每页10个博客数据
        totalPosts: 0,
        lastVisible: null,
        hasMore: true
      },
      showCreateModal: false,
      editingPost: null,
      savingPost: false,
      postForm: {
        title: '',
        category: '',
        content: '',
        tags: ''
      }
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser', 'userRole', 'userProfile']),

    // 计算总页数
    totalPages() {
      return Math.ceil(this.pagination.totalPosts / this.pagination.pageSize)
    },

    // 当前页的双向绑定
    currentPage: {
      get() {
        return this.pagination.currentPage
      },
      set(value) {
        this.pagination.currentPage = value
      }
    },

    // 可见页码范围
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
    },

    // 总帖子数
    totalPosts() {
      return this.pagination.totalPosts
    }
  },
  async mounted() {
    await this.loadPosts()
    await this.loadPopularPosts()
    await this.loadTags()

    // 设置防抖搜索
    this.debouncedSearch = debounce(this.loadPosts, 500)
  },
  methods: {
    // 加载帖子列表
    async loadPosts() {
      try {
        this.loading = true
        this.pagination.currentPage = 1

        let postsQuery = collection(db, 'blogPosts')

        // 构建查询条件
        const conditions = []

        // 搜索条件 - 简化以避免索引问题
        if (this.filters.search) {
          // 使用简单字符串匹配替代 array-contains
          const searchLower = this.filters.search.toLowerCase()

          // 获取所有帖子并在客户端过滤
          const allPostsQuery = query(postsQuery, limit(50)) // 限制数量以提高性能
          const allPostsSnapshot = await getDocs(allPostsQuery)

          // 客户端过滤帖子
          const filteredPosts = allPostsSnapshot.docs.filter(docSnap => {
            const post = docSnap.data()
            return (
              post.title?.toLowerCase().includes(searchLower) ||
              post.content?.toLowerCase().includes(searchLower) ||
              (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchLower)))
            )
          })

          // 客户端排序
          const sortField = this.filters.sortBy
          filteredPosts.sort((a, b) => {
            const aData = a.data()
            const bData = b.data()

            if (sortField === 'title') {
              return aData.title.localeCompare(bData.title)
            } else {
              // 默认按创建时间排序
              const aTime = aData.createdAt?.toDate ? aData.createdAt.toDate() : new Date(aData.createdAt)
              const bTime = bData.createdAt?.toDate ? bData.createdAt.toDate() : new Date(bData.createdAt)
              return bTime - aTime
            }
          })

          // 应用分页
          const startIndex = (this.pagination.currentPage - 1) * this.pagination.pageSize
          const endIndex = startIndex + this.pagination.pageSize
          const paginatedPosts = filteredPosts.slice(startIndex, endIndex)

          this.posts = await this.processPosts({ docs: paginatedPosts })
          this.pagination.totalPosts = filteredPosts.length
          this.pagination.hasMore = endIndex < filteredPosts.length

          // 跳过其余的服务器端查询逻辑
          this.loading = false
          return
        }

        // 分类条件 - 简化以避免复合索引
        if (this.filters.category) {
          // 使用客户端过滤分类以避免索引要求
          const allPostsQuery = query(postsQuery, limit(50)) // 限制数量以提高性能
          const allPostsSnapshot = await getDocs(allPostsQuery)

          // 客户端过滤帖子
          const filteredPosts = allPostsSnapshot.docs.filter(docSnap => {
            const post = docSnap.data()
            return post.category === this.filters.category
          })

          // 客户端排序
          const sortField = this.filters.sortBy
          filteredPosts.sort((a, b) => {
            const aData = a.data()
            const bData = b.data()

            if (sortField === 'title') {
              return aData.title.localeCompare(bData.title)
            } else {
              // 默认按创建时间排序
              const aTime = aData.createdAt?.toDate ? aData.createdAt.toDate() : new Date(aData.createdAt)
              const bTime = bData.createdAt?.toDate ? bData.createdAt.toDate() : new Date(bData.createdAt)
              return bTime - aTime
            }
          })

          // 应用分页
          const startIndex = (this.pagination.currentPage - 1) * this.pagination.pageSize
          const endIndex = startIndex + this.pagination.pageSize
          const paginatedPosts = filteredPosts.slice(startIndex, endIndex)

          this.posts = await this.processPosts({ docs: paginatedPosts })
          this.pagination.totalPosts = filteredPosts.length
          this.pagination.hasMore = endIndex < filteredPosts.length

          // 跳过其余的服务器端查询逻辑
          this.loading = false
          return
        }

        // 默认查询无过滤器 - 这应该无需特殊索引即可工作
        const sortField = this.filters.sortBy === 'title' ? 'title' : 'createdAt'
        const sortDirection = this.filters.sortBy === 'title' ? 'asc' : 'desc'

        const q = query(
          postsQuery,
          orderBy(sortField, sortDirection),
          limit(this.pagination.pageSize)
        )

        const querySnapshot = await getDocs(q)
        this.posts = await this.processPosts(querySnapshot)

        // 获取总数用于分页
        const countQuery = query(postsQuery)
        const countSnapshot = await getDocs(countQuery)
        this.pagination.totalPosts = countSnapshot.size

        // 更新最后可见文档用于分页
        this.pagination.lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]
        this.pagination.hasMore = querySnapshot.docs.length === this.pagination.pageSize

      } catch (error) {
        console.error('Error loading posts:', error)
      } finally {
        this.loading = false
      }
    },

    // 加载更多帖子
    async loadMorePosts() {
      if (!this.pagination.hasMore) return

      try {
        let postsQuery = collection(db, 'blogPosts')

        const sortField = this.filters.sortBy === 'title' ? 'title' : 'createdAt'
        const sortDirection = this.filters.sortBy === 'title' ? 'asc' : 'desc'

        const q = query(
          postsQuery,
          orderBy(sortField, sortDirection),
          startAfter(this.pagination.lastVisible),
          limit(this.pagination.pageSize)
        )

        const querySnapshot = await getDocs(q)
        const newPosts = await this.processPosts(querySnapshot)
        this.posts = [...this.posts, ...newPosts]

        this.pagination.lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]
        this.pagination.hasMore = querySnapshot.docs.length === this.pagination.pageSize
        this.pagination.currentPage++

      } catch (error) {
        console.error('Error loading more posts:', error)
        alert('Failed to load more posts')
      }
    },

    // 加载热门帖子
    async loadPopularPosts() {
      try {
        // 使用客户端排序热门帖子以避免索引要求
        const allPostsQuery = query(collection(db, 'blogPosts'), limit(20))
        const allPostsSnapshot = await getDocs(allPostsQuery)

        // 按点赞数客户端排序
        const sortedPosts = allPostsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
          .slice(0, 5) // 取前5个

        this.popularPosts = sortedPosts
      } catch (error) {
        console.error('Error loading popular posts:', error)
      }
    },

    // 加载标签
    async loadTags() {
      try {
        const tagsSnapshot = await getDocs(collection(db, 'blogPosts'))
        const allTags = new Set()

        tagsSnapshot.forEach(doc => {
          const post = doc.data()
          if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach(tag => allTags.add(tag))
          }
        })

        this.allTags = Array.from(allTags)
      } catch (error) {
        console.error('Error loading tags:', error)
      }
    },

    // 处理帖子数据
    async processPosts(querySnapshot) {
      const posts = []

      for (const docSnap of querySnapshot.docs) {
        const post = {
          id: docSnap.id,
          ...docSnap.data(),
          expanded: false,
          newComment: '',
          comments: []
        }

        // 检查用户是否已点赞此帖子
        if (this.isAuthenticated) {
          const likeQuery = query(
            collection(db, 'postLikes'),
            where('postId', '==', post.id),
            where('userId', '==', this.currentUser.uid)
          )
          const likeSnapshot = await getDocs(likeQuery)
          post.userLiked = !likeSnapshot.empty
        }

        // 加载评论 - 无排序以避免索引错误
        await this.loadComments(post)

        posts.push(post)
      }

      return posts
    },

    // 加载评论
    async loadComments(post) {
      try {
        // 简单查询无排序以避免索引要求
        const commentsQuery = query(
          collection(db, 'postComments'),
          where('postId', '==', post.id),
          limit(10) // 限制为10条评论
        )

        const commentsSnapshot = await getDocs(commentsQuery)
        // 客户端排序评论
        post.comments = commentsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a, b) => {
            // 按创建时间排序（最新的在前）
            const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
            const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
            return bTime - aTime
          })
      } catch (error) {
        console.error('Error loading comments:', error)
        post.comments = []
      }
    },

    // 切换点赞
    async toggleLike(post) {
      if (!this.isAuthenticated) {
        alert('Please login to like posts')
        return
      }

      try {
        const likeQuery = query(
          collection(db, 'postLikes'),
          where('postId', '==', post.id),
          where('userId', '==', this.currentUser.uid)
        )
        const likeSnapshot = await getDocs(likeQuery)

        if (likeSnapshot.empty) {
          // 添加点赞
          await addDoc(collection(db, 'postLikes'), {
            postId: post.id,
            userId: this.currentUser.uid,
            createdAt: serverTimestamp()
          })

          // 更新帖子点赞数
          await updateDoc(doc(db, 'blogPosts', post.id), {
            likesCount: (post.likesCount || 0) + 1
          })

          post.likesCount = (post.likesCount || 0) + 1
          post.userLiked = true

          // 重新加载热门帖子
          await this.loadPopularPosts()
        } else {
          // 移除点赞
          await deleteDoc(likeSnapshot.docs[0].ref)

          // 更新帖子点赞数
          await updateDoc(doc(db, 'blogPosts', post.id), {
            likesCount: Math.max(0, (post.likesCount || 1) - 1)
          })

          post.likesCount = Math.max(0, (post.likesCount || 1) - 1)
          post.userLiked = false

          // 重新加载热门帖子
          await this.loadPopularPosts()
        }

      } catch (error) {
        console.error('Error toggling like:', error)
        alert('Failed to update like')
      }
    },

    // 添加评论
    async addComment(post) {
      if (!this.isAuthenticated) {
        alert('Please login to comment')
        return
      }

      if (!post.newComment?.trim()) return

      try {
        const commentData = {
          postId: post.id,
          userId: this.currentUser.uid,
          authorName: this.userProfile?.firstName
            ? `${this.userProfile.firstName} ${this.userProfile.lastName}`
            : this.currentUser.email,
          authorRole: this.userRole,
          content: post.newComment.trim(),
          createdAt: serverTimestamp()
        }

        await addDoc(collection(db, 'postComments'), commentData)

        // 更新帖子评论数
        await updateDoc(doc(db, 'blogPosts', post.id), {
          commentsCount: (post.commentsCount || 0) + 1
        })

        // 重新加载评论
        await this.loadComments(post)

        // 清空评论输入
        post.newComment = ''

        // 更新评论计数
        post.commentsCount = (post.commentsCount || 0) + 1

      } catch (error) {
        console.error('Error adding comment:', error)
        alert('Failed to add comment')
      }
    },

    // 删除评论
    async deleteComment(post, comment) {
      if (!this.canDeleteComment(comment)) return

      if (!confirm('Are you sure you want to delete this comment?')) return

      try {
        await deleteDoc(doc(db, 'postComments', comment.id))

        // 更新帖子评论数
        await updateDoc(doc(db, 'blogPosts', post.id), {
          commentsCount: Math.max(0, (post.commentsCount || 1) - 1)
        })

        // 重新加载评论
        await this.loadComments(post)

        // 更新评论计数
        post.commentsCount = Math.max(0, (post.commentsCount || 1) - 1)

      } catch (error) {
        console.error('Error deleting comment:', error)
        alert('Failed to delete comment')
      }
    },

    // 更改页面
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.pagination.currentPage = page
        this.loadPosts()
      }
    },

    // 设置分类筛选
    setCategory(category) {
      this.filters.category = category
      this.loadPosts()
    },

    // 清除分类筛选
    clearCategory() {
      this.filters.category = ''
      this.loadPosts()
    },

    // 按标签搜索
    searchByTag(tag) {
      this.filters.search = tag
      this.loadPosts()
    },

    // 获取分类计数
    getCategoryCount(category) {
      return this.posts.filter(post => post.category === category).length
    },

    // 格式化日期
    formatDate(timestamp) {
      if (!timestamp) return ''
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },

    // 格式化相对时间
    formatRelativeTime(timestamp) {
      if (!timestamp) return ''
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`

      return this.formatDate(timestamp)
    },

    // 获取内容预览
    getContentPreview(content) {
      if (!content) return ''

      // 移除HTML标签
      const plainText = content.replace(/<[^>]*>/g, '')

      // 截取前150个字符
      if (plainText.length <= 150) return plainText

      return plainText.substring(0, 150) + '...'
    },

    // 获取角色徽章类名
    getRoleBadgeClass(role) {
      const roleClasses = {
        admin: 'bg-danger',
        nutritionist: 'bg-primary',
        user: 'bg-secondary'
      }
      return roleClasses[role] || 'bg-secondary'
    },

    // 检查用户是否可以编辑帖子
    canEditPost(post) {
      if (!this.isAuthenticated) return false
      return this.userRole === 'admin' || post.authorId === this.currentUser.uid
    },

    // 检查用户是否可以删除评论
    canDeleteComment(comment) {
      if (!this.isAuthenticated) return false
      return this.userRole === 'admin' || comment.userId === this.currentUser.uid
    },

    // 切换帖子展开状态
    togglePostExpanded(post) {
      post.expanded = !post.expanded
      // 如果展开帖子且评论未加载，则加载评论
      if (post.expanded && (!post.comments || post.comments.length === 0)) {
        this.loadComments(post)
      }
    },

    // 滚动到特定帖子
    scrollToPost(postId) {
      const element = document.querySelector(`[data-post-id="${postId}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        // 展开帖子
        const post = this.posts.find(p => p.id === postId)
        if (post && !post.expanded) {
          this.togglePostExpanded(post)
        }
      }
    },

    // 编辑帖子
    editPost(post) {
      this.editingPost = post
      this.postForm = {
        title: post.title,
        category: post.category,
        content: post.content,
        tags: post.tags ? post.tags.join(', ') : ''
      }
      this.showCreateModal = true
    },

    // 删除帖子
    async deletePost(post) {
      if (!confirm('Are you sure you want to delete this post?')) return

      try {
        // 删除帖子的所有评论
        const commentsQuery = query(
          collection(db, 'postComments'),
          where('postId', '==', post.id)
        )
        const commentsSnapshot = await getDocs(commentsQuery)
        const deleteCommentPromises = commentsSnapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deleteCommentPromises)

        // 删除帖子的所有点赞
        const likesQuery = query(
          collection(db, 'postLikes'),
          where('postId', '==', post.id)
        )
        const likesSnapshot = await getDocs(likesQuery)
        const deleteLikePromises = likesSnapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deleteLikePromises)

        // 删除帖子
        await deleteDoc(doc(db, 'blogPosts', post.id))

        alert('Post deleted successfully')
        await this.loadPosts()
        await this.loadPopularPosts()
      } catch (error) {
        console.error('Error deleting post:', error)
        alert('Failed to delete post')
      }
    },

    // 保存帖子
    async savePost() {
      if (!this.isAuthenticated) {
        alert('Please login to create posts')
        return
      }

      try {
        this.savingPost = true

        // 从内容生成摘要
        const excerpt = this.generateExcerpt(this.postForm.content)

        const postData = {
          title: this.postForm.title,
          category: this.postForm.category,
          excerpt: excerpt, // 自动生成的摘要
          content: this.postForm.content,
          tags: this.postForm.tags ? this.postForm.tags.split(',').map(tag => tag.trim()) : [],
          keywords: this.generateKeywords(this.postForm.title + ' ' + this.postForm.content),
          authorId: this.currentUser.uid,
          authorName: this.userProfile?.firstName
            ? `${this.userProfile.firstName} ${this.userProfile.lastName}`
            : this.currentUser.email,
          authorRole: this.userRole,
          updatedAt: serverTimestamp()
        }

        if (this.editingPost) {
          // 更新现有帖子
          await updateDoc(doc(db, 'blogPosts', this.editingPost.id), postData)
          alert('Post updated successfully')
        } else {
          // 创建新帖子
          postData.createdAt = serverTimestamp()
          postData.likesCount = 0
          postData.commentsCount = 0
          postData.averageRating = 0
          postData.ratingsCount = 0

          await addDoc(collection(db, 'blogPosts'), postData)
          alert('Post created successfully')
        }

        this.closeModal()
        await this.loadPosts()
        await this.loadPopularPosts()
        await this.loadTags()

      } catch (error) {
        console.error('Error saving post:', error)
        alert('Failed to save post')
      } finally {
        this.savingPost = false
      }
    },

    // 生成摘要
    generateExcerpt(content) {
      if (!content) return ''

      // 移除HTML标签
      const plainText = content.replace(/<[^>]*>/g, '')

      // 截取前150个字符
      if (plainText.length <= 150) return plainText

      return plainText.substring(0, 150) + '...'
    },

    // 生成关键词
    generateKeywords(text) {
      const words = text.toLowerCase().split(/\s+/)
      const uniqueWords = [...new Set(words)]
      return uniqueWords.filter(word => word.length > 2)
    },

    // 关闭模态框
    closeModal() {
      this.showCreateModal = false
      this.editingPost = null
      this.postForm = {
        title: '',
        category: '',
        content: '',
        tags: ''
      }
    }
  }
}
</script>

<style scoped>
.hero-section {
  padding-top: 120px;
}

/* 博客卡片紧凑设计 */
.post-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #e9ecef;
}

.post-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cursor-pointer {
  cursor: pointer;
}

.badge:hover {
  opacity: 0.8;
}

.page-link {
  color: #222;
}

.page-item.active .page-link {
  background-color: #28a745;
  border-color: #28a745;
}

.modal-backdrop {
  opacity: 0.5;
}

/* 内容HTML样式 */
.content-html {
  line-height: 1.5;
}

.content-html h1,
.content-html h2,
.content-html h3,
.content-html h4,
.content-html h5,
.content-html h6 {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.content-html p {
  margin-bottom: 0.5rem;
}

.content-html ul,
.content-html ol {
  padding-left: 1rem;
  margin-bottom: 0.5rem;
}

/* 评论区域样式 */
.comments-section {
  max-height: 300px;
  overflow-y: auto;
}

.comment-item:last-child {
  border-bottom: none !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}
</style>