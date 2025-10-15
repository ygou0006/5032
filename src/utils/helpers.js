/**
 * 辅助工具函数
 */

// 格式化日期
export const formatDate = (date, format = 'DD/MM/YYYY') => {
    if (!date) return ''
    
    const d = new Date(date)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    
    return format
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year)
  }
  
  // 格式化时间
  export const formatTime = (date) => {
    if (!date) return ''
    
    const d = new Date(date)
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    
    return `${hours}:${minutes}`
  }
  
  // 格式化货币
  export const formatCurrency = (amount, currency = 'AUD') => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }
  
  // 防抖函数
  export const debounce = (func, wait, immediate) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        timeout = null
        if (!immediate) func(...args)
      }
      const callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func(...args)
    }
  }
  
  // 节流函数
  export const throttle = (func, limit) => {
    let inThrottle
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
  
  // 深度克隆
  export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (obj instanceof Array) return obj.map(item => deepClone(item))
    if (obj instanceof Object) {
      const clonedObj = {}
      Object.keys(obj).forEach(key => {
        clonedObj[key] = deepClone(obj[key])
      })
      return clonedObj
    }
  }
  
  // 生成唯一ID
  export const generateId = (prefix = '') => {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
  
  // 计算年龄
  export const calculateAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }
  
  // 计算BMI
  export const calculateBMI = (weight, height) => {
    if (!weight || !height) return null
    const heightInMeters = height / 100
    return (weight / (heightInMeters * heightInMeters)).toFixed(1)
  }
  
  // 获取BMI分类
  export const getBMICategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight'
    if (bmi < 25) return 'Normal weight'
    if (bmi < 30) return 'Overweight'
    return 'Obese'
  }
  
  // 本地存储辅助函数
  export const storage = {
    get: (key, defaultValue = null) => {
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : defaultValue
      } catch {
        return defaultValue
      }
    },
    
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        return true
      } catch {
        return false
      }
    },
    
    remove: (key) => {
      try {
        localStorage.removeItem(key)
        return true
      } catch {
        return false
      }
    },
    
    clear: () => {
      try {
        localStorage.clear()
        return true
      } catch {
        return false
      }
    }
  }
  
  // 导出数据为CSV
  export const exportToCSV = (data, filename = 'data.csv') => {
    if (!data || data.length === 0) return
    
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          `"${String(row[header] || '').replace(/"/g, '""')}"`
        ).join(',')
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // 计算两个日期之间的天数
  export const daysBetween = (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000
    const firstDate = new Date(date1)
    const secondDate = new Date(date2)
    return Math.round(Math.abs((firstDate - secondDate) / oneDay))
  }
  
  // 数组分组
  export const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
      const group = item[key]
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {})
  }
  
  // 数组去重
  export const uniqueBy = (array, key) => {
    const seen = new Set()
    return array.filter(item => {
      const value = item[key]
      if (seen.has(value)) {
        return false
      }
      seen.add(value)
      return true
    })
  }
  
  // 等待函数
  export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  // 生成随机颜色
  export const getRandomColor = () => {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }
  
  // 检查设备类型
  export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }
  
  // 检查在线状态
  export const isOnline = () => {
    return navigator.onLine
  }
  
  // 添加在线状态监听
  export const addOnlineListener = (callback) => {
    window.addEventListener('online', callback)
    window.addEventListener('offline', callback)
  }
  
  // 移除在线状态监听
  export const removeOnlineListener = (callback) => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }