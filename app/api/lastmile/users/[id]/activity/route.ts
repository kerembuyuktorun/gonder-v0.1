import { NextResponse } from 'next/server'
import {
  lastmileGraphql,
  requireAccessToken,
  upstreamErrorResponse,
} from '../../../_lib/lastmile-bff'
import { USER_ACTIVITY_QUERY, unwrapGraphqlData } from '../../_lib/graphql-users'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ success: false, error: 'Kullanıcı id gerekli.' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10) || 1
  const pageSize = Math.min(Number.parseInt(searchParams.get('pageSize') ?? '20', 10) || 20, 100)

  try {
    const upstream = await lastmileGraphql<unknown>(
      USER_ACTIVITY_QUERY,
      { filter: { userId: id, page, pageSize } },
      auth.accessToken
    )

    if (!upstream.ok) return upstreamErrorResponse(upstream)

    const data = unwrapGraphqlData<Record<string, unknown>>(upstream.data)
    const logs = data?.userActivityLogs ?? null

    return NextResponse.json({ success: true, data: logs })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Aktivite geçmişi alınamadı.',
      },
      { status: 502 }
    )
  }
}
