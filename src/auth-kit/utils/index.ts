/**
 * Auth Kit - Utilities Barrel Export
 */

// Validation utilities
export {
  isValidEmail,
  isValidUsername,
  isValidPhoneNumber,
  isValidOtp,
  getPasswordStrength,
  getPasswordStrengthText,
  DEFAULT_PASSWORD_STRENGTH_TEXT_CONFIG,
  passwordsMatch,
  meetsMinPasswordLength,
  calculatePasswordSimilarity,
} from './validation'
export type { PasswordStrengthTextConfig } from './validation'

// Token management utilities
export {
  setAuthSession,
  setOtpPendingSession,
  clearOtpPendingSession,
  setToken,
  getToken,
  removeToken,
  setRefreshToken,
  getRefreshToken,
  removeRefreshToken,
  setUser,
  getUser,
  removeUser,
  clearAuth,
  decodeToken,
  isTokenExpired,
  getTokenExpiresIn,
  sessionStorage,
} from './token'

// Error sanitization utility
export {
  sanitizeAuthErrorMessage,
} from './sanitize-error'
export type {
  SanitizeAuthErrorOptions,
} from './sanitize-error'
