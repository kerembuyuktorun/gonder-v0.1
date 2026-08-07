import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import {
  backendRequest,
  parseSessionInfo,
  validateLoginPayload,
} from '../../_lib/auth-backend'
import { clearOtpPendingCookies, setOtpPendingCookies, setSessionCookies } from '../../_lib/auth-cookies'
import {
  getDevDemoAuthConfig,
  isDevAuthBypassEnabled,
  isValidDemoLogin,
} from '../../_lib/dev-auth'
import { enforceRateLimit } from '../../_lib/rate-limit'

function isMissingEnvError(error: unknown): boolean {
  return error instanceof Error && error.message.includes('Missing required environment variable')
}

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(request, 'auth-login', {
    maxRequests: 10,
    windowMs: 60_000,
  })
  if (rateLimited) return rateLimited

  try {
    const body = await request.json()
    const payload = validateLoginPayload(body)

    // Demo / test mode: skip IAM + OTP and open a session immediately
    if (isDevAuthBypassEnabled()) {
      const demo = getDevDemoAuthConfig()

      if (!isValidDemoLogin(payload.email, payload.password)) {
        return NextResponse.json(
          { success: false, error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const response = NextResponse.json({
        success: true,
        requiresOtp: false,
        redirectTo: '/',
        data: {
          requiresOtp: false,
          user: {
            name: 'Demo User',
            username: 'demo-user',
            email: payload.email.trim() || demo.email,
          },
          token: '__cookie_managed_session__',
        },
      })

      setSessionCookies(response, {
        accessToken: demo.accessToken,
        refreshToken: demo.refreshToken,
        rememberMe: body?.rememberMe === true,
      })
      clearOtpPendingCookies(response)
      return response
    }

    const upstream = await backendRequest<unknown>('api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (!upstream.ok) {
      return NextResponse.json(
        {
          success: false,
          error: upstream.error,
          ...(upstream.retryAfterSec ? { retryAfterSec: upstream.retryAfterSec } : {}),
        },
        { status: upstream.status }
      )
    }

    const session = parseSessionInfo(upstream.data, { setCookies: upstream.setCookies })

    // Prefer explicit OTP flag; also treat loginSession without access token as OTP step
    const requiresOtp =
      session.requiresOtp || Boolean(session.loginSessionId && !session.accessToken)

    if (process.env.NODE_ENV !== 'production') {
      console.info('[auth/login]', {
        requiresOtp,
        hasAccessToken: Boolean(session.accessToken),
        hasLoginSessionId: Boolean(session.loginSessionId),
        parsedRequiresOtp: session.requiresOtp,
      })
    }

    if (requiresOtp) {
      if (!session.loginSessionId) {
        return NextResponse.json(
          { success: false, error: 'OTP oturumu başlatılamadı.' },
          { status: 502 }
        )
      }

      const response = NextResponse.json({
        success: true,
        requiresOtp: true,
        redirectTo: '/otp',
        data: {
          requiresOtp: true,
          user: session.user,
        },
      })
      setOtpPendingCookies(response, session.loginSessionId)
      return response
    }

    if (!session.accessToken) {
      return NextResponse.json(
        { success: false, error: 'Giriş sonrası oturum oluşturulamadı.' },
        { status: 502 }
      )
    }

    const response = NextResponse.json({
      success: true,
      requiresOtp: false,
      redirectTo: '/',
      data: {
        requiresOtp: false,
        user: session.user,
        token: '__cookie_managed_session__',
      },
    })

    setSessionCookies(response, {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresIn: session.expiresIn,
      rememberMe: body?.rememberMe === true,
    })
    clearOtpPendingCookies(response)

    return response
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Gönderilen giriş bilgileri geçersiz.' },
        { status: 400 }
      )
    }

    if (isMissingEnvError(error)) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[auth/login] Environment configuration error:', error)
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Sunucu yapılandırması eksik. Lütfen sistem yöneticinize iletin.',
        },
        { status: 500 }
      )
    }

    if (process.env.NODE_ENV !== 'production') {
      console.error('[auth/login] Unexpected error:', error)
    }

    return NextResponse.json(
      { success: false, error: 'Giriş işlemi şu anda tamamlanamadı.' },
      { status: 500 }
    )
  }
}
