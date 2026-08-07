import { NextResponse } from 'next/server'
import {
  ACCESS_MAX_AGE_SECONDS,
  AUTH_ACCESS_COOKIE,
  AUTH_LOGIN_SESSION_COOKIE,
  AUTH_OTP_PENDING_COOKIE,
  AUTH_REFRESH_COOKIE,
  COOKIE_PATH,
  OTP_PENDING_MAX_AGE_SECONDS,
  REFRESH_MAX_AGE_SECONDS,
  isProd,
} from '../../_shared/auth-cookies'

export function setOtpPendingCookies(response: NextResponse, loginSessionId: string): void {
  response.cookies.set(AUTH_OTP_PENDING_COOKIE, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: COOKIE_PATH,
    maxAge: OTP_PENDING_MAX_AGE_SECONDS,
  })

  response.cookies.set(AUTH_LOGIN_SESSION_COOKIE, loginSessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: COOKIE_PATH,
    maxAge: OTP_PENDING_MAX_AGE_SECONDS,
  })
}

export function clearOtpPendingCookies(response: NextResponse): void {
  response.cookies.set(AUTH_OTP_PENDING_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: COOKIE_PATH,
    maxAge: 0,
  })

  response.cookies.set(AUTH_LOGIN_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: COOKIE_PATH,
    maxAge: 0,
  })
}

export function setSessionCookies(
  response: NextResponse,
  payload: {
    accessToken: string
    refreshToken?: string | null
    rememberMe?: boolean
    expiresIn?: number | null
  }
): void {
  const accessMaxAge =
    typeof payload.expiresIn === 'number' && payload.expiresIn > 0
      ? payload.expiresIn
      : ACCESS_MAX_AGE_SECONDS

  response.cookies.set(AUTH_ACCESS_COOKIE, payload.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: COOKIE_PATH,
    maxAge: accessMaxAge,
  })

  // Refresh must outlive access (IAM access is often ~300s). Always persist when present
  // so logout can forward { refreshToken } to IAM.
  if (payload.refreshToken) {
    response.cookies.set(AUTH_REFRESH_COOKIE, payload.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: COOKIE_PATH,
      maxAge: REFRESH_MAX_AGE_SECONDS,
    })
  }
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.set(AUTH_ACCESS_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: COOKIE_PATH,
    maxAge: 0,
  })

  response.cookies.set(AUTH_REFRESH_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: COOKIE_PATH,
    maxAge: 0,
  })

  clearOtpPendingCookies(response)
}
