/**
 * 验证工具函数
 */

// 邮箱验证
export const validateEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

// 密码验证 - 至少6位
export const validatePassword = (password) => {
  return password && password.length >= 6
}

// 强密码验证
export const validateStrongPassword = (password) => {
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[`~!@#\$%\^&\*])(?=.{8,})/
  return strongRegex.test(password)
}

// 电话号码验证（澳大利亚格式）
export const validatePhone = (phone) => {
  const re = /^(\+?61|0)4\d{8}$/
  return re.test(phone.replace(/\s/g, ''))
}

// 必填字段验证
export const required = (value) => {
  return value !== null && value !== undefined && value.toString().trim().length > 0
}

// 最小长度验证
export const minLength = (value, min) => {
  return value && value.length >= min
}

// 最大长度验证
export const maxLength = (value, max) => {
  return value && value.length <= max
}

// 数字范围验证
export const numberRange = (value, min, max) => {
  const num = Number(value)
  return !isNaN(num) && num >= min && num <= max
}

// URL验证
export const validateURL = (url) => {
  const re = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  return re.test(url)
}

// 日期验证
export const validateDate = (date) => {
  const parsedDate = new Date(date)
  return parsedDate instanceof Date && !isNaN(parsedDate)
}

// 未来日期验证
export const validateFutureDate = (date) => {
  const parsedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return parsedDate >= today
}

// 时间冲突验证
export const validateTimeConflict = (existingSlots, newSlot) => {
  const newStart = new Date(newSlot.startTime)
  const newEnd = new Date(newSlot.endTime)

  return !existingSlots.some(slot => {
    const slotStart = new Date(slot.startTime)
    const slotEnd = new Date(slot.endTime)
    return (newStart < slotEnd && newEnd > slotStart)
  })
}

// 文件类型验证
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type)
}

// 文件大小验证
export const validateFileSize = (file, maxSizeInMB) => {
  const maxSize = maxSizeInMB * 1024 * 1024
  return file.size <= maxSize
}

// XSS防护 - 清理输入
export const sanitizeInput = (input) => {
  const div = document.createElement('div')
  div.textContent = input
  return div.innerHTML
}

// 验证表单
export const validateForm = (formData, rules) => {
  const errors = {}

  Object.keys(rules).forEach(field => {
    const value = formData[field]
    const fieldRules = rules[field]

    for (const rule of fieldRules) {
      if (rule.validator && !rule.validator(value, rule.params)) {
        errors[field] = rule.message
        break
      }
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// 创建验证规则
export const createRule = (validator, message, params = null) => ({
  validator,
  message,
  params
})

// 常用验证规则
export const commonRules = {
  email: [
    createRule(required, 'Email is required'),
    createRule(validateEmail, 'Please enter a valid email address')
  ],
  password: [
    createRule(required, 'Password is required'),
    createRule(validatePassword, 'Password must be at least 6 characters long')
  ],
  required: [
    createRule(required, 'This field is required')
  ],
  phone: [
    createRule(required, 'Phone number is required'),
    createRule(validatePhone, 'Please enter a valid Australian phone number')
  ]
}