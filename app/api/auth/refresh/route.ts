import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AUTH_REFRESH_COOKIE } from '../../../_shared/auth-cookies'
import {
  backendRequest,
  parseSessionInfo,
} from '../../_lib/auth-backend'
import { setSessionCookies } from '../../_lib/auth-cookies'

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(AUTH_REFRESH_COOKIE)?.value

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, error: 'Yenileme oturumu bulunamadı.' },
      { status: 401 }
    )
  }

  const upstream = await backendRequest<unknown>('api/v1/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
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
  if (!session.accessToken) {
    return NextResponse.json(
      { success: false, error: 'Yenileme sonrası access token alınamadı.' },
      { status: 502 }
    )
  }

  const response = NextResponse.json({ success: true })
  setSessionCookies(response, {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken ?? refreshToken,
    expiresIn: session.expiresIn,
    rememberMe: true,
  })

  return response
}
