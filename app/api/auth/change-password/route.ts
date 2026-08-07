import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AUTH_ACCESS_COOKIE } from '../../../_shared/auth-cookies'
import {
  backendRequest,
  validateChangePasswordPayload,
} from '../../_lib/auth-backend'
import { enforceRateLimit } from '../../_lib/rate-limit'

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(request, 'auth-change-password', {
    maxRequests: 8,
    windowMs: 60_000,
  })
  if (rateLimited) return rateLimited

  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(AUTH_ACCESS_COOKIE)?.value

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Oturum geçersiz. Lütfen tekrar giriş yapın.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const payload = validateChangePasswordPayload(body)

    const upstream = await backendRequest<unknown>(
      'api/v1/auth/change-password',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      { accessToken }
    )

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
  } catch {
    return NextResponse.json(
      { success: false, error: 'İstek geçersiz.' },
      { status: 400 }
    )
  }
}
