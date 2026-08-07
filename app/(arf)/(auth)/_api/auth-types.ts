export type AuthApiResult<T = unknown> = {
  success?: boolean
  error?: string
  message?: string
  retryAfterSec?: number
  requiresOtp?: boolean
  redirectTo?: string
  data?: T
}

export type SessionUser = Record<string, unknown>

export type SessionData = {
  user?: SessionUser
  modules?: string[]
  allowedRoutes?: string[]
}

export type SignInResultData = {
  user?: SessionUser
  token?: string
  requiresOtp?: boolean
}

export type OtpVerifyResultData = {
  token?: string
  user?: SessionUser
}
