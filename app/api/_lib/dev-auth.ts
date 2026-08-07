export type DevDemoAuthConfig = {
  email: string
  password: string
  otp: string
  loginSessionId: string
  accessToken: string
  refreshToken: string
}

export function isDevAuthBypassEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DEV_AUTH_BYPASS === 'true'
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
