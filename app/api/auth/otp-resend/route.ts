import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AUTH_LOGIN_SESSION_COOKIE } from '../../../_shared/auth-cookies'
import {
  backendRequest,
  validateOtpResendPayload,
} from '../../_lib/auth-backend'
import { getDevDemoAuthConfig, isDevAuthBypassEnabled } from '../../_lib/dev-auth'
import { enforceRateLimit } from '../../_lib/rate-limit'

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(request, 'auth-otp-resend', {
    maxRequests: 5,
    windowMs: 60_000,
  })
  if (rateLimited) return rateLimited

  const cookieStore = await cookies()
  const loginSessionId = cookieStore.get(AUTH_LOGIN_SESSION_COOKIE)?.value

  if (!loginSessionId) {
    return NextResponse.json(
      { success: false, error: 'OTP oturumu bulunamadı. Tekrar giriş yapın.' },
      { status: 401 }
    )
  }

  const payload = validateOtpResendPayload({ loginSessionId })

  if (isDevAuthBypassEnabled()) {
    const demo = getDevDemoAuthConfig()
    if (payload.loginSessionId !== demo.loginSessionId) {
      return NextResponse.json(
        { success: false, error: 'OTP oturumu bulunamadı. Tekrar giriş yapın.' },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true })
  }

  const upstream = await backendRequest<unknown>('api/v1/auth/login/resend-otp', {
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

  return NextResponse.json({ success: true })
}
