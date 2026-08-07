import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AUTH_ACCESS_COOKIE } from '../../../_shared/auth-cookies'
import {
  authMeToSessionUser,
  backendRequest,
  modulesToAllowedRoutePrefixes,
  parseAuthMeUser,
  parseModuleCodes,
  parseSessionInfo,
} from '../../_lib/auth-backend'
import {
  getDemoSessionPayload,
  isDemoAccessToken,
  isDevAuthBypassEnabled,
} from '../../_lib/dev-auth'

export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(AUTH_ACCESS_COOKIE)?.value

  if (isDevAuthBypassEnabled() && isDemoAccessToken(accessToken)) {
    return NextResponse.json(getDemoSessionPayload())
  }

  if (!accessToken) {
    return NextResponse.json({ authenticated: false, success: false }, { status: 401 })
  }

  // Demo bypass without matching token: still reject (login must set demo cookies)
  if (isDevAuthBypassEnabled()) {
    return NextResponse.json({ authenticated: false, success: false }, { status: 401 })
  }

  const verifyResponse = await backendRequest<unknown>(
    'api/v1/auth/verify-token',
    {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    },
    { accessToken }
  )

  if (!verifyResponse.ok) {
    return NextResponse.json(
      { authenticated: false, success: false, error: 'Oturum doğrulanamadı.' },
      { status: 401 }
    )
  }

  const session = parseSessionInfo(verifyResponse.data, { accessTokenHint: accessToken })

  const [meResponse, moduleResponse] = await Promise.all([
    backendRequest<unknown>('api/v1/auth/me', { method: 'GET' }, { accessToken }),
    backendRequest<unknown>(
      'api/v1/tenant-business-module-relations',
      { method: 'GET' },
      { accessToken }
    ),
  ])

  const meUser = meResponse.ok ? parseAuthMeUser(meResponse.data) : null
  const user = meUser ? authMeToSessionUser(meUser) : session.user
  const modules = moduleResponse.ok ? parseModuleCodes(moduleResponse.data) : []
  const allowedRoutes = modulesToAllowedRoutePrefixes(modules)

  return NextResponse.json({
    authenticated: true,
    success: true,
    data: {
      user,
      modules,
      allowedRoutes,
    },
  })
}
