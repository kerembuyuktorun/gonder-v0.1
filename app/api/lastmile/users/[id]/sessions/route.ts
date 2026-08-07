import { NextResponse } from 'next/server'
import {
  lastmileGraphql,
  requireAccessToken,
  upstreamErrorResponse,
} from '../../../_lib/lastmile-bff'
import { USER_SESSIONS_QUERY, unwrapGraphqlData } from '../../_lib/graphql-users'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ success: false, error: 'Kullanıcı id gerekli.' }, { status: 400 })
  }

  try {
    const upstream = await lastmileGraphql<unknown>(
      USER_SESSIONS_QUERY,
      { userId: id },
      auth.accessToken
    )

    if (!upstream.ok) return upstreamErrorResponse(upstream)

    const data = unwrapGraphqlData<Record<string, unknown>>(upstream.data)
    const sessions = Array.isArray(data?.userSessions) ? data.userSessions : []

    return NextResponse.json({ success: true, data: sessions })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Oturumlar alınamadı.',
      },
      { status: 502 }
    )
  }
}
