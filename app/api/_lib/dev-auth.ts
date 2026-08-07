import type { ModuleCode } from './auth-backend'
import { modulesToAllowedRoutePrefixes } from './auth-backend'

export type DevDemoAuthConfig = {
  email: string
  password: string
  otp: string
  loginSessionId: string
  accessToken: string
  refreshToken: string
}

const DEMO_MODULES: ModuleCode[] = [
  'CARGO',
  'LAST_MILE',
  'GONDER',
  'FLEET',
  'DELIVERY',
  'LOGISTIC',
  'TESTHUB',
]

/**
 * Demo / test auth without IAM.
 * Enabled only when DEV_AUTH_BYPASS=true (works in preview/production for test deploys).
 */
export function isDevAuthBypassEnabled(): boolean {
  return process.env.DEV_AUTH_BYPASS === 'true'
}

export function getDevDemoAuthConfig(): DevDemoAuthConfig {
  return {
    email: process.env.DEV_DEMO_EMAIL ?? 'superadmin@arfplatform.local',
    password: process.env.DEV_DEMO_PASSWORD ?? 'Demo123!',
    otp: process.env.DEV_DEMO_OTP ?? '123456',
    loginSessionId: process.env.DEV_DEMO_LOGIN_SESSION_ID ?? '11111111-1111-4111-8111-111111111111',
    accessToken: process.env.DEV_DEMO_ACCESS_TOKEN ?? 'dev-access-token',
    refreshToken: process.env.DEV_DEMO_REFRESH_TOKEN ?? 'dev-refresh-token',
  }
}

export function isDemoAccessToken(token: string | undefined | null): boolean {
  if (!token) return false
  return token === getDevDemoAuthConfig().accessToken
}

export function getDemoSessionPayload(email?: string) {
  const demo = getDevDemoAuthConfig()
  const modules = DEMO_MODULES
  const allowedRoutes = modulesToAllowedRoutePrefixes(modules)
  const resolvedEmail = email?.trim() || demo.email

  return {
    authenticated: true as const,
    success: true as const,
    data: {
      user: {
        id: 'demo-user',
        firstName: 'Demo',
        lastName: 'User',
        name: 'Demo User',
        email: resolvedEmail,
        username: 'demo-user',
        userType: 'Developer',
        role: 'Developer',
        profileImage: null,
        avatar: null,
      },
      modules,
      allowedRoutes,
    },
  }
}

/** Accept demo credentials, or any non-empty pair when strict match env is unset. */
export function isValidDemoLogin(email: string, password: string): boolean {
  const demo = getDevDemoAuthConfig()
  const sameEmail = email.trim().toLowerCase() === demo.email.trim().toLowerCase()
  const samePassword = password === demo.password
  if (sameEmail && samePassword) return true

  // Frictionless test login: any email + password when bypass is on
  return email.trim().length > 0 && password.length > 0
}
