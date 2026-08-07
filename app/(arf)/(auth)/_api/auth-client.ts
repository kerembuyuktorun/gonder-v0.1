import type {
  AuthApiResult,
  OtpVerifyResultData,
  SessionData,
  SignInResultData,
} from './auth-types'

function canTryRefresh(path: string): boolean {
  return ![
    '/api/auth/login',
    '/api/auth/refresh',
    '/api/auth/logout',
    '/api/auth/otp-verify',
    '/api/auth/otp-resend',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/accept-invite',
  ].includes(path)
}

async function doRequest<T>(path: string, init: RequestInit): Promise<Response> {
  return fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init.headers ?? {}),
    },
  })
}

async function request<T>(path: string, init: RequestInit, retried = false): Promise<AuthApiResult<T>> {
  const response = await doRequest<T>(path, init)

  if (response.status === 401 && canTryRefresh(path) && !retried) {
    const refresh = await doRequest<unknown>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    if (refresh.ok) {
      return request(path, init, true)
    }
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return {
      success: false,
      error:
        response.status === 404
          ? 'Kimlik doğrulama servisi bulunamadı. Sayfayı yenileyip tekrar deneyin.'
          : 'İşlem başarısız oldu.',
    }
  }

  const payload = (await response.json().catch(() => ({}))) as AuthApiResult<T>
  if (!response.ok) {
    return {
      success: false,
      error: payload.error || 'İşlem başarısız oldu.',
      retryAfterSec: payload.retryAfterSec,
    }
  }

  return payload
}

export function signInWithPassword(payload: { email: string; password: string; rememberMe?: boolean }) {
  return request<SignInResultData>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function verifyOtpCode(payload: { code: string }) {
  return request<OtpVerifyResultData>('/api/auth/otp-verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function resendOtp() {
  return request<unknown>('/api/auth/otp-resend', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function forgotPassword(payload: { email: string }) {
  return request<unknown>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function acceptInvite(payload: { token: string; password: string }) {
  return request<unknown>('/api/auth/accept-invite', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function resetPassword(payload: { token: string; password: string }) {
  return request<unknown>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function logoutSession() {
  // Body is intentionally empty: refreshToken lives in httpOnly `arf_refresh` cookie.
  // BFF reads the cookie and forwards `{ refreshToken }` to IAM `/api/v1/auth/logout`.
  return request<unknown>('/api/auth/logout', {
    method: 'POST',
  })
}

export function getSession() {
  return request<SessionData>('/api/auth/session', {
    method: 'GET',
  })
}

export function getModuleRelations() {
  return request<Pick<SessionData, 'modules' | 'allowedRoutes'>>('/api/tenant-business-module-relations', {
    method: 'GET',
  })
}
