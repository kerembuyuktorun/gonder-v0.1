import { NextResponse } from 'next/server'
import {
  backendRequest,
  validateResetPasswordPayload,
} from '../../_lib/auth-backend'
import { enforceRateLimit } from '../../_lib/rate-limit'

const INVALID_OR_EXPIRED_LINK =
  'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.'

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(request, 'auth-reset-password', {
    maxRequests: 6,
    windowMs: 60_000,
  })
  if (rateLimited) return rateLimited

  try {
    const body = await request.json()
    const payload = validateResetPasswordPayload(body)

    const upstream = await backendRequest<unknown>('api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: payload.token,
        password: payload.password,
      }),
    })

    if (!upstream.ok) {
      return NextResponse.json(
        {
          success: false,
          error: upstream.status === 400 ? INVALID_OR_EXPIRED_LINK : upstream.error,
          ...(upstream.retryAfterSec ? { retryAfterSec: upstream.retryAfterSec } : {}),
        },
        { status: upstream.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Şifreniz başarıyla sıfırlandı.',
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'İstek geçersiz.' },
      { status: 400 }
    )
  }
}
