/**
 * Auth Kit - Validation Utilities
 * 
 * Form validation helper fonksiyonları
 */

/**
 * Email formatı doğrulama
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Şifre gücü kontrolü
 * @returns 0-4 arası değer (0: çok zayıf, 4: çok güçlü)
 */
export const getPasswordStrength = (password: string): number => {
  let strength = 0
  
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++
  
  return Math.min(strength, 4)
}

/**
 * Şifre gücü metni
 */
export interface PasswordStrengthTextConfig {
  labels?: string[]
  invalidLabel?: string
}

export const DEFAULT_PASSWORD_STRENGTH_TEXT_CONFIG: Required<PasswordStrengthTextConfig> = {
  labels: ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'],
  invalidLabel: 'Invalid',
}

export const getPasswordStrengthText = (
  strength: number,
  config: PasswordStrengthTextConfig = {}
): string => {
  const labels = config.labels || DEFAULT_PASSWORD_STRENGTH_TEXT_CONFIG.labels
  const invalidLabel = config.invalidLabel || DEFAULT_PASSWORD_STRENGTH_TEXT_CONFIG.invalidLabel
  return labels[strength] || invalidLabel
}

/**
 * Kullanıcı adı formatı kontrolü
 * - En az 3 karakter
 * - Sadece harf, rakam, alt çizgi ve nokta
 */
export const isValidUsername = (username: string): boolean => {
  if (username.length < 3) return false
  const usernameRegex = /^[a-zA-Z0-9_.]+$/
  return usernameRegex.test(username)
}

/**
 * Telefon numarası formatı kontrolü (Türkiye)
 * Desteklenen formatlar:
 * - 05XX XXX XX XX
 * - 5XXXXXXXXX
 * - +90 5XX XXX XX XX
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\s+/g, '')
  const phoneRegex = /^(\+?90)?5\d{9}$/
  return phoneRegex.test(cleaned)
}

/**
 * OTP kodu formatı kontrolü
 */
export const isValidOtp = (otp: string, length: number = 6): boolean => {
  const otpRegex = new RegExp(`^\\d{${length}}$`)
  return otpRegex.test(otp)
}

/**
 * Şifre eşleşme kontrolü
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword && password.length > 0
}

/**
 * Minimum şifre uzunluğu kontrolü
 */
export const meetsMinPasswordLength = (password: string, minLength: number = 8): boolean => {
  return password.length >= minLength
}

/**
 * İki şifre arasındaki farkı hesapla (güvenlik için)
 * Yeni şifre eski şifre ile çok benzer olmamalı
 */
export const calculatePasswordSimilarity = (oldPassword: string, newPassword: string): number => {
  // Levenshtein distance basitleştirilmiş versiyonu
  if (oldPassword === newPassword) return 100
  if (!oldPassword || !newPassword) return 0
  
  let matches = 0
  const shorter = oldPassword.length < newPassword.length ? oldPassword : newPassword
  const longer = oldPassword.length >= newPassword.length ? oldPassword : newPassword
  
  for (let i = 0; i < shorter.length; i++) {
    if (shorter[i] === longer[i]) matches++
  }
  
  return Math.round((matches / longer.length) * 100)
}
