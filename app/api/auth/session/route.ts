import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AUTH_ACCESS_COOKIE } from '../../../_shared/auth-cookies'
import {
  authMeToSessionUser,
  backendRequest,
  type ModuleCode,
  modulesToAllowedRoutePrefixes,
  parseAuthMeUser,
  parseModuleCodes,
  parseSessionInfo,
} from '../../_lib/auth-backend'

function isDevAuthBypassEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.DEV_AUTH_BYPASS === 'true'
}

export async function GET() {
  if (isDevAuthBypassEnabled()) {
    const modules: ModuleCode[] = [
      'CARGO',
      'LAST_MILE',
      'GONDER',
      'FLEET',
      'DELIVERY',
      'LOGISTIC',
      'TESTHUB',
    ]
    const allowedRoutes = modulesToAllowedRoutePrefixes(modules)

    return NextResponse.json({
      authenticated: true,
      success: true,
      data: {
        user: {
          id: 'dev-user',
          firstName: 'Dev',
          lastName: 'User',
          name: 'Dev User',
          email: 'dev@local.test',
          userType: 'Developer',
          role: 'Developer',
          profileImage: null,
          avatar: null,
        },
        modules,
        allowedRoutes,
      },
    })
  }

  const cookieStore = await cookies()
  const accessToken = cookieStore.get(AUTH_ACCESS_COOKIE)?.value

  if (!accessToken) {
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
