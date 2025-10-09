import { auth, db } from './firebase'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

/**
 * 认证服务
 */
export const authService = {
  // 用户注册
  async register(userData) {
    try {
      // 创建用户认证 - 使用新的模块化语法
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      )
      
      const user = userCredential.user
      
      // 更新用户资料
      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`
      })
      
      // 保存用户资料到Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role || 'user',
        phone: userData.phone || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        healthConditions: userData.healthConditions || [],
        dietaryPreferences: userData.dietaryPreferences || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      })
      
      return { success: true, user }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  },
  
  // 用户登录
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: userCredential.user }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },
  
  // 用户登出
  async logout() {
    try {
      await signOut(auth)
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  },
  
  // 获取当前用户资料
  async getCurrentUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        return userDoc.data()
      }
      return null
    } catch (error) {
      console.error('Get user profile error:', error)
      throw error
    }
  },
  
  // 更新用户资料
  async updateUserProfile(uid, profileData) {
    try {
      await setDoc(doc(db, 'users', uid), {
        ...profileData,
        updatedAt: new Date()
      }, { merge: true })
      
      return { success: true }
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  },
  
  // 检查用户角色
  async checkUserRole(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        return userDoc.data().role || 'user'
      }
      return 'user'
    } catch (error) {
      console.error('Check user role error:', error)
      return 'user'
    }
  },
  
  // 监听认证状态变化
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback)
  },
  
  // 获取当前用户
  getCurrentUser() {
    return auth.currentUser
  },
  
  // 等待认证状态就绪
  async waitForAuthState() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, user => {
        unsubscribe()
        resolve(user)
      })
    })
  }
}