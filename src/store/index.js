import { createStore } from 'vuex'
import { authService } from '../services/auth'

export default createStore({
  state: {
    user: null,
    userProfile: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_USER_PROFILE(state, profile) {
      state.userProfile = profile
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    CLEAR_ERROR(state) {
      state.error = null
    }
  },
  actions: {
    async checkAuthState({ commit }) {
      try {
        authService.onAuthStateChanged(async (user) => {
          if (user) {
            commit('SET_USER', user)
            // 获取用户资料
            const userProfile = await authService.getCurrentUserProfile(user.uid)
            if (userProfile) {
              commit('SET_USER_PROFILE', userProfile)
              localStorage.setItem('userRole', userProfile.role)
            }
          } else {
            commit('SET_USER', null)
            commit('SET_USER_PROFILE', null)
            localStorage.removeItem('userRole')
          }
        })
      } catch (error) {
        commit('SET_ERROR', error.message)
      }
    },

    async login({ commit }, { email, password }) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        const result = await authService.login(email, password)
        commit('SET_USER', result.user)

        // 获取用户资料
        const userProfile = await authService.getCurrentUserProfile(result.user.uid)
        if (userProfile) {
          commit('SET_USER_PROFILE', userProfile)
          localStorage.setItem('userRole', userProfile.role)
        }
        
        return result
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async register({ commit }, userData) {
      try {
        commit('SET_LOADING', true)
        commit('CLEAR_ERROR')
        
        // 使用 authService 注册用户
        const result = await authService.register(userData)
        
        commit('SET_USER', result.user)
        return result
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async logout({ commit }) {
      try {
        await authService.logout()
        commit('SET_USER', null)
        commit('SET_USER_PROFILE', null)
        localStorage.removeItem('userRole')
      } catch (error) {
        commit('SET_ERROR', error.message)
      }
    }
  },
  getters: {
    isAuthenticated: state => !!state.user,
    currentUser: state => state.user,
    userProfile: state => state.userProfile,
    userRole: state => state.userProfile?.role || 'user',
    isLoading: state => state.loading,
    error: state => state.error
  }
})