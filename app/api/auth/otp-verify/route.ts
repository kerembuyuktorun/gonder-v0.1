import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AUTH_LOGIN_SESSION_COOKIE } from '../../../_shared/auth-cookies'
import {
  backendRequest,
  parseSessionInfo,
  validateOtpVerifyPayload,
} from '../../_lib/auth-backend'
import { clearOtpPendingCookies, setSessionCookies } from '../../_lib/auth-cookies'
import { getDevDemoAuthConfig, isDevAuthBypassEnabled } from '../../_lib/dev-auth'
import { enforceRateLimit } from '../../_lib/rate-limit'

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(request, 'auth-otp-verify', {
    maxRequests: 8,
    windowMs: 60_000,
  })
  if (rateLimited) return rateLimited

  try {
    const cookieStore = await cookies()
    const loginSessionId = cookieStore.get(AUTH_LOGIN_SESSION_COOKIE)?.value

    if (!loginSessionId) {
      return NextResponse.json(
        { success: false, error: 'OTP oturumu bulunamadı. Tekrar giriş yapın.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const payload = validateOtpVerifyPayload({
      code: body?.code,
      loginSessionId,
    })

    if (isDevAuthBypassEnabled()) {
      const demo = getDevDemoAuthConfig()
      const validSession = loginSessionId === demo.loginSessionId
      const validOtp = payload.code === demo.otp

      if (!validSession || !validOtp) {
        return NextResponse.json(
          { success: false, error: 'Invalid verification code' },
          { status: 400 }
        )
      }

      const response = NextResponse.json({
        success: true,
        data: {
          user: {
            name: 'Demo User',
            username: 'demo-user',
            email: demo.email,
          },
          token: '__cookie_managed_session__',
        },
      })

      setSessionCookies(response, {
        accessToken: demo.accessToken,
        refreshToken: demo.refreshToken,
        rememberMe: true,
      })
      clearOtpPendingCookies(response)

      return response
    }

    const upstream = await backendRequest<unknown>('api/v1/auth/login/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (!upstream.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            upstream.status === 401 || upstream.status === 400
              ? 'Doğrulama kodu geçersiz.'
              : upstream.error,
          ...(upstream.retryAfterSec ? { retryAfterSec: upstream.retryAfterSec } : {}),
        },
        { status: upstream.status }
      )
    }

    const session = parseSessionInfo(upstream.data, { setCookies: upstream.setCookies })
    if (!session.accessToken) {
      return NextResponse.json(
        { success: false, error: 'OTP doğrulandı ancak oturum açılamadı.' },
        { status: 502 }
      )
    }

    if (process.env.NODE_ENV !== 'production' && !session.refreshToken) {
      const root = upstream.data && typeof upstream.data === 'object'
        ? Object.keys(upstream.data as object)
        : []
      console.warn(
        '[auth/otp-verify] refreshToken yok — logout IAM çağrısı atlanır. upstream keys:',
        root
      )
    }

    const response = NextResponse.json({
      success: true,
      data: {
        user: session.user,
        token: '__cookie_managed_session__',
      },
    })

    setSessionCookies(response, {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresIn: session.expiresIn,
      rememberMe: true,
    })
    clearOtpPendingCookies(response)

    return response
  } catch {
    return NextResponse.json(
      { success: false, error: 'OTP doğrulama isteği geçersiz.' },
      { status: 400 }
    )
  }
}
