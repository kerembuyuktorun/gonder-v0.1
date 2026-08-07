/**
 * Auth Kit - Token Management Utilities
 * 
 * JWT token yönetimi ve localStorage helpers
 */

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user_data'
const DEMO_AUTH_COOKIE_KEY = 'arf_demo_auth'
const OTP_PENDING_COOKIE_KEY = 'arf_otp_pending'

const setDemoAuthCookie = (): void => {
  if (typeof document !== 'undefined') {
    document.cookie = `${DEMO_AUTH_COOKIE_KEY}=1; Path=/; SameSite=Lax`
  }
}

const removeDemoAuthCookie = (): void => {
  if (typeof document !== 'undefined') {
    document.cookie = `${DEMO_AUTH_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`
  }
}

export const setOtpPendingSession = (): void => {
  if (typeof document !== 'undefined') {
    document.cookie = `${OTP_PENDING_COOKIE_KEY}=1; Path=/; SameSite=Lax`
  }
}

export const clearOtpPendingSession = (): void => {
  if (typeof document !== 'undefined') {
    document.cookie = `${OTP_PENDING_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`
  }
}

type SessionPayload = {
  token?: string
  refreshToken?: string
  user?: Record<string, unknown>
}

/**
 * Demo/local auth oturumunu tarayicida kalici hale getirir.
 * Backend yokken route korumasi icin cookie ve local storage birlikte yazilir.
 * Gercek cookie-managed oturumlarda demo cookie yazilmaz.
 */
export const setAuthSession = (payload?: SessionPayload): void => {
  const token = payload?.token
  const isCookieManaged = token === '__cookie_managed_session__'
  const isDemoSession = !token || token === 'demo-session-token'

  if (token) {
    setToken(token)
  } else {
    setToken('demo-session-token')
  }

  if (payload?.refreshToken) {
    setRefreshToken(payload.refreshToken)
  }

  if (payload?.user) {
    setUser(payload.user)
  }

  if (isDemoSession && !isCookieManaged) {
    setDemoAuthCookie()
  } else {
    removeDemoAuthCookie()
  }

  clearOtpPendingSession()
}

/**
 * Token'ı localStorage'a kaydet
 */
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

/**
 * Token'ı localStorage'dan al
 */
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

/**
 * Token'ı localStorage'dan sil
 */
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
  }
}

/**
 * Refresh token'ı kaydet
 */
export const setRefreshToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  }
}

/**
 * Refresh token'ı al
 */
export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }
  return null
}

/**
 * Refresh token'ı sil
 */
export const removeRefreshToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}

/**
 * Kullanıcı verisini kaydet
 */
export const setUser = (user: Record<string, unknown>): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

/**
 * Kullanıcı verisini al
 */
export const getUser = <T = Record<string, unknown>>(): T | null => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem(USER_KEY)
    if (userData) {
      try {
        return JSON.parse(userData) as T
      } catch (_error) {
        return null
      }
    }
  }
  return null
}

/**
 * Kullanıcı verisini sil
 */
export const removeUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY)
  }
}

/**
 * Tüm auth verilerini temizle (logout)
 */
export const clearAuth = (): void => {
  removeToken()
  removeRefreshToken()
  removeUser()
  removeDemoAuthCookie()
  clearOtpPendingSession()
}

/**
 * JWT token'ı decode et (payload'ı al)
 * Not: Signature doğrulaması yapmaz, sadece payload'ı okur
 */
export const decodeToken = <T = Record<string, unknown>>(token: string): T | null => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded) as T
  } catch (_error) {
    return null
  }
}

/**
 * Token'ın expire olup olmadığını kontrol et
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken<{ exp?: number }>(token)
  if (!decoded || !decoded.exp) return true
  
  const currentTime = Math.floor(Date.now() / 1000)
  return decoded.exp < currentTime
}

/**
 * Token'ın ne kadar süre sonra expire olacağını hesapla (saniye)
 */
export const getTokenExpiresIn = (token: string): number => {
  const decoded = decodeToken<{ exp?: number }>(token)
  if (!decoded || !decoded.exp) return 0
  
  const currentTime = Math.floor(Date.now() / 1000)
  return Math.max(0, decoded.exp - currentTime)
}

/**
 * Session storage helper (tab kapanınca silinen)
 */
export const sessionStorage = {
  set: (key: string, value: unknown): void => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(key, JSON.stringify(value))
    }
  },
  
  get: <T = unknown>(key: string): T | null => {
    if (typeof window !== 'undefined') {
      const item = window.sessionStorage.getItem(key)
      if (item) {
        try {
          return JSON.parse(item) as T
        } catch (_error) {
          return null
        }
      }
    }
    return null
  },
  
  remove: (key: string): void => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(key)
    }
  },
  
  clear: (): void => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.clear()
    }
  }
}
