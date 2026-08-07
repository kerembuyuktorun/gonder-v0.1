import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from '../../../_shared/auth-cookies'
import { backendRequest } from '../../_lib/auth-backend'
import { clearSessionCookies } from '../../_lib/auth-cookies'

/**
 * Client → `/api/auth/logout` body is empty on purpose (httpOnly cookies).
 * BFF reads cookies and calls IAM: POST /api/v1/auth/logout { refreshToken }.
 * Access token alone is enough to attempt server-side revoke when refresh was never persisted.
 */
export async function POST() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(AUTH_ACCESS_COOKIE)?.value
  const refreshToken = cookieStore.get(AUTH_REFRESH_COOKIE)?.value

  if (refreshToken || accessToken) {
    await backendRequest<unknown>(
      'api/v1/auth/logout',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshToken ?? null }),
      },
      { accessToken }
    )
  }

  const response = NextResponse.json({ success: true })
  clearSessionCookies(response)
  return response
}
