import { NextResponse } from 'next/server'

type RateLimitConfig = {
  maxRequests: number
  windowMs: number
}

type Entry = {
  count: number
  windowStart: number
}

const rateStore = new Map<string, Entry>()

function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  return request.headers.get('x-real-ip') || 'unknown'
}

export function enforceRateLimit(
  request: Request,
  scope: string,
  config: RateLimitConfig
): NextResponse | null {
  const now = Date.now()
  const identifier = getClientIdentifier(request)
  const key = `${scope}:${identifier}`
  const current = rateStore.get(key)

  if (!current || now - current.windowStart > config.windowMs) {
    rateStore.set(key, { count: 1, windowStart: now })
    return null
  }

  current.count += 1
  if (current.count > config.maxRequests) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((config.windowMs - (now - current.windowStart)) / 1000)
    )

    return NextResponse.json(
      {
        success: false,
        error: 'Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
        },
      }
    )
  }

  return null
}
