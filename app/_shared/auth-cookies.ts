export const AUTH_ACCESS_COOKIE = 'arf_access'
export const AUTH_REFRESH_COOKIE = 'arf_refresh'
export const AUTH_OTP_PENDING_COOKIE = 'arf_otp_pending'
export const AUTH_LOGIN_SESSION_COOKIE = 'arf_login_session'
export const AUTH_POST_LOGIN_NEXT_COOKIE = 'arf_post_login_next'

export const COOKIE_PATH = '/'
export const OTP_PENDING_MAX_AGE_SECONDS = 10 * 60
export const ACCESS_MAX_AGE_SECONDS = 15 * 60
export const REFRESH_MAX_AGE_SECONDS = 30 * 24 * 60 * 60

export const isProd = process.env.NODE_ENV === 'production'
