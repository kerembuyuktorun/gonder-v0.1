import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  AUTH_ACCESS_COOKIE,
  AUTH_LOGIN_SESSION_COOKIE,
  AUTH_OTP_PENDING_COOKIE,
  AUTH_POST_LOGIN_NEXT_COOKIE,
} from './app/_shared/auth-cookies'

const PUBLIC_PATHS = new Set(['/signin', '/forgot-password'])
const PUBLIC_FILE_REGEX = /\.[^/]+$/
const SESSION_CACHE_TTL_MS = 10_000

type SessionPayload = {
  authenticated?: boolean
  data?: {
    allowedRoutes?: string[]
  }
}

type SessionCacheEntry = {
  payload: SessionPayload
  expiresAt: number
}

const sessionCache = new Map<string, SessionCacheEntry>()

function isDevAuthBypassEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DEV_AUTH_BYPASS === 'true'
}

function isSafeInternalPath(path: string): boolean {
  if (!path || !path.startsWith('/')) return false
  if (path.startsWith('//')) return false
  if (path.startsWith('/signin')) return false
  if (path.startsWith('/otp')) return false
  if (path.startsWith('/forgot-password')) return false
  if (path.startsWith('/reset-password')) return false
  if (path.startsWith('/accept-invite')) return false

  return true
}

function isRouteAllowed(pathname: string, allowedRoutes: string[]): boolean {
  if (pathname === '/') return true

  return allowedRoutes.some((prefix) => {
    if (prefix === '/') return false
    return pathname === prefix || pathname.startsWith(`${prefix}/`)
  })
}

function isRouterPrefetch(request: NextRequest): boolean {
  return (
    request.headers.get('Next-Router-Prefetch') === '1' ||
    request.headers.get('next-router-prefetch') === '1'
  )
}

async function fetchSession(request: NextRequest): Promise<SessionPayload | null> {
  const accessToken = request.cookies.get(AUTH_ACCESS_COOKIE)?.value
  if (!accessToken) return null

  const cached = sessionCache.get(accessToken)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.payload
  }

  try {
    const sessionUrl = new URL('/api/auth/session', request.url)
    const response = await fetch(sessionUrl, {
      method: 'GET',
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      sessionCache.delete(accessToken)
      return null
    }

    const payload = (await response.json()) as SessionPayload
    sessionCache.set(accessToken, {
      payload,
      expiresAt: Date.now() + SESSION_CACHE_TTL_MS,
    })
    return payload
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  if (isDevAuthBypassEnabled()) {
    // Dev bypass: keep routes accessible so auth UI flows can be tested locally.
    return NextResponse.next()
  }

  const hasSessionCookie = Boolean(request.cookies.get(AUTH_ACCESS_COOKIE)?.value)

  if (pathname.startsWith('/api') || PUBLIC_FILE_REGEX.test(pathname)) {
    return NextResponse.next()
  }

  if (PUBLIC_PATHS.has(pathname)) {
    if (pathname === '/signin') {
      const hasOtpPending =
        request.cookies.get(AUTH_OTP_PENDING_COOKIE)?.value === '1' ||
        Boolean(request.cookies.get(AUTH_LOGIN_SESSION_COOKIE)?.value)

      // Login OTP branch set cookies but client bounced here → recover to OTP page
      if (hasOtpPending && !hasSessionCookie) {
        return NextResponse.redirect(new URL('/otp', request.url))
      }

      if (hasSessionCookie) {
        const session = await fetchSession(request)
        if (session?.authenticated) {
          return NextResponse.redirect(new URL('/', request.url))
        }
      }
    }

    return NextResponse.next()
  }

  if (pathname === '/reset-password') {
    const token = searchParams.get('token')
    if (token && token.trim().length > 0) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/forgot-password', request.url))
  }

  if (pathname === '/accept-invite') {
    const token = searchParams.get('token')
    if (token && token.trim().length > 0) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/signin', request.url))
  }

  if (pathname === '/otp') {
    if (hasSessionCookie) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    const hasOtpPending =
      request.cookies.get(AUTH_OTP_PENDING_COOKIE)?.value === '1' ||
      Boolean(request.cookies.get(AUTH_LOGIN_SESSION_COOKIE)?.value)
    if (hasOtpPending) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/signin', request.url))
  }

  if (pathname.startsWith('/_next') || pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  if (!hasSessionCookie) {
    const signInUrl = new URL('/signin', request.url)
    const safeNext = `${pathname}${request.nextUrl.search}`
    signInUrl.searchParams.set('next', safeNext)

    const response = NextResponse.redirect(signInUrl)
    if (isSafeInternalPath(safeNext)) {
      response.cookies.set(AUTH_POST_LOGIN_NEXT_COOKIE, safeNext, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 300,
      })
    }
    return response
  }

  // Prefetch: cookie varken IAM round-trip atlama; soft-nav RSC kopmalarını azaltır.
  if (isRouterPrefetch(request)) {
    return NextResponse.next()
  }

  const session = await fetchSession(request)
  if (!session?.authenticated) {
    // Cookie var ama IAM session doğrulaması geçici fail olduysa soft-nav döngüsüne sokma
    if (hasSessionCookie && pathname === '/') {
      return NextResponse.next()
    }

    const signInUrl = new URL('/signin', request.url)
    signInUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(signInUrl)
  }

  const allowedRoutes = session.data?.allowedRoutes ?? ['/']

  if (pathname === '/') {
    const nextFromCookie = request.cookies.get(AUTH_POST_LOGIN_NEXT_COOKIE)?.value
    if (nextFromCookie && isSafeInternalPath(nextFromCookie) && isRouteAllowed(nextFromCookie, allowedRoutes)) {
      const redirectResponse = NextResponse.redirect(new URL(nextFromCookie, request.url))
      redirectResponse.cookies.set(AUTH_POST_LOGIN_NEXT_COOKIE, '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
      })
      return redirectResponse
    }
  }

  if (!isRouteAllowed(pathname, allowedRoutes)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
}
