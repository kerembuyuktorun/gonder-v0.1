import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AUTH_ACCESS_COOKIE } from '../../_shared/auth-cookies'
import {
  backendRequest,
  modulesToAllowedRoutePrefixes,
  parseModuleCodes,
} from '../_lib/auth-backend'

export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(AUTH_ACCESS_COOKIE)?.value

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: 'Oturum bulunamadı.' },
      { status: 401 }
    )
  }

  const upstream = await backendRequest<unknown>(
    'api/v1/tenant-business-module-relations',
    {
      method: 'GET',
    },
    { accessToken }
  )

  if (!upstream.ok) {
    return NextResponse.json(
      { success: false, error: upstream.error },
      { status: upstream.status }
    )
  }

  const modules = parseModuleCodes(upstream.data)
  const allowedRoutes = modulesToAllowedRoutePrefixes(modules)

  return NextResponse.json({
    success: true,
    data: {
      modules,
      allowedRoutes,
    },
  })
}
