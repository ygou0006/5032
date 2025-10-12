<template>
    <div class="rating-system">
        <div class="d-flex align-items-center mb-2">
            <!-- 星级显示 -->
            <div class="star-rating me-3">
                <span v-for="star in 5" :key="star" class="star"
                    :class="{ filled: star <= Math.floor(averageRating), half: star === Math.ceil(averageRating) && !Number.isInteger(averageRating) }">
                    <i class="fas fa-star"></i>
                </span>
            </div>

            <!-- 评分数字 -->
            <span class="rating-value fw-bold text-dark me-2">
                {{ averageRating.toFixed(1) }}
            </span>

            <!-- 评价数量 -->
            <span class="rating-count text-muted small">
                ({{ totalRatings }} {{ totalRatings === 1 ? 'review' : 'reviews' }})
            </span>
        </div>

        <!-- 用户评分（如果已登录且未评价过） -->
        <div v-if="isAuthenticated && !userRating" class="user-rating mt-3">
            <h6 class="mb-2">Rate this content:</h6>
            <div class="star-input">
                <span v-for="star in 5" :key="star" class="star selectable"
                    :class="{ filled: star <= hoverRating || star <= currentRating }" @click="rate(star)"
                    @mouseenter="hoverRating = star" @mouseleave="hoverRating = 0">
                    <i class="fas fa-star"></i>
                </span>
            </div>
        </div>

        <!-- 用户已评价显示 -->
        <div v-else-if="isAuthenticated && userRating" class="user-rating mt-3">
            <p class="small text-muted mb-0">
                You rated this:
                <span class="fw-bold text-success">{{ userRating }}/5</span>
            </p>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { db } from '@/services/firebase'
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    doc
} from 'firebase/firestore'

export default {
    name: 'RatingSystem',
    props: {
        itemId: {
            type: String,
            required: true
        },
        initialRating: {
            type: Number,
            default: 0
        },
        initialTotalRatings: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            averageRating: this.initialRating,
            totalRatings: this.initialTotalRatings,
            userRating: null,
            currentRating: 0,
            hoverRating: 0,
            ratings: []
        }
    },
    computed: {
        ...mapGetters(['isAuthenticated', 'currentUser'])
    },
    async mounted() {
        await this.loadRatings()
        if (this.isAuthenticated) {
            await this.loadUserRating()
        }
    },
    methods: {
        async loadRatings() {
            // 从Firestore加载评分数据
            try {
                const ratingsQuery = query(
                    collection(db, 'ratings'),
                    where('itemId', '==', this.itemId)
                )

                const ratingsSnapshot = await getDocs(ratingsQuery)

                this.ratings = ratingsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))

                this.calculateAverage()
            } catch (error) {
                console.error('Error loading ratings:', error)
            }
        },

        async loadUserRating() {
            // 加载当前用户的评分
            try {
                if (!this.currentUser) return

                const userRatingQuery = query(
                    collection(db, 'ratings'),
                    where('itemId', '==', this.itemId),
                    where('userId', '==', this.currentUser.uid)
                )

                const userRatingSnapshot = await getDocs(userRatingQuery)

                if (!userRatingSnapshot.empty) {
                    this.userRating = userRatingSnapshot.docs[0].data().rating
                    this.currentRating = this.userRating
                }
            } catch (error) {
                console.error('Error loading user rating:', error)
            }
        },

        calculateAverage() {
            if (this.ratings.length === 0) {
                this.averageRating = 0
                this.totalRatings = 0
                return
            }

            const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0)
            this.averageRating = sum / this.ratings.length
            this.totalRatings = this.ratings.length
        },

        async rate(rating) {
            if (!this.isAuthenticated) {
                alert('Please login to rate content')
                return
            }

            if (!this.currentUser) {
                alert('User information not available')
                return
            }

            try {
                // 检查是否已经评价过
                const existingRatingQuery = query(
                    collection(db, 'ratings'),
                    where('itemId', '==', this.itemId),
                    where('userId', '==', this.currentUser.uid)
                )

                const existingRatingSnapshot = await getDocs(existingRatingQuery)

                if (!existingRatingSnapshot.empty) {
                    // 更新现有评价
                    const existingDoc = existingRatingSnapshot.docs[0]
                    await updateDoc(doc(db, 'ratings', existingDoc.id), {
                        rating: rating,
                        updatedAt: new Date()
                    })
                } else {
                    // 创建新评价
                    await addDoc(collection(db, 'ratings'), {
                        itemId: this.itemId,
                        userId: this.currentUser.uid,
                        rating: rating,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    })
                }

                this.userRating = rating
                this.currentRating = rating
                await this.loadRatings() // 重新加载所有评分

                this.$emit('rated', {
                    rating: rating,
                    average: this.averageRating,
                    total: this.totalRatings
                })

            } catch (error) {
                console.error('Error saving rating:', error)
                alert('Error saving your rating. Please try again.')
            }
        }
    }
}
</script>

<style scoped>
.star-rating {
    display: inline-flex;
}

.star {
    color: #ddd;
    margin-right: 2px;
    font-size: 1.2rem;
}

.star.filled {
    color: #ffc107;
}

.star.half {
    background: linear-gradient(90deg, #ffc107 50%, #ddd 50%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.star.selectable {
    cursor: pointer;
    transition: transform 0.2s ease;
}

.star.selectable:hover {
    transform: scale(1.2);
}

.rating-value {
    font-size: 1.5rem;
}

.user-rating {
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 5px;
}
</style>