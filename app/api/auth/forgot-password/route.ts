import { NextResponse } from 'next/server'
import {
  backendRequest,
  validateForgotPasswordPayload,
} from '../../_lib/auth-backend'
import { enforceRateLimit } from '../../_lib/rate-limit'

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit(request, 'auth-forgot-password', {
    maxRequests: 5,
    windowMs: 60_000,
  })
  if (rateLimited) return rateLimited

  try {
    const body = await request.json()
    const payload = validateForgotPasswordPayload(body)

    const upstream = await backendRequest<unknown>('api/v1/auth/forgot-password', {
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

    return NextResponse.json({
      success: true,
      message: 'E-posta adresinizi kontrol edin. Şifre sıfırlama bağlantısı gönderildi.',
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'İstek geçersiz.' },
      { status: 400 }
    )
  }
}
