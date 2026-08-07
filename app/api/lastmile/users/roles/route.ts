import { NextResponse } from 'next/server'
import {
  lastmileGraphql,
  requireAccessToken,
  upstreamErrorResponse,
} from '../../_lib/lastmile-bff'
import { ROLES_QUERY, unwrapGraphqlData } from '../_lib/graphql-users'

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

export async function GET(request: Request) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const filter: Record<string, unknown> = {
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
    pageSize: Math.min(Number.parseInt(searchParams.get('pageSize') ?? '100', 10) || 100, 100),
  }

  const search = searchParams.get('search')?.trim()
  if (search) filter.search = search

  try {
    const upstream = await lastmileGraphql<unknown>(
      ROLES_QUERY,
      { filter },
      auth.accessToken
    )

    if (!upstream.ok) return upstreamErrorResponse(upstream)

    const data = unwrapGraphqlData<Record<string, unknown>>(upstream.data)
    const roles = asRecord(data?.roles)
    const items = Array.isArray(roles.items) ? roles.items : []

    return NextResponse.json({
      success: true,
      data: {
        items,
        total: Number(roles.total ?? items.length),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Roller alınamadı.',
      },
      { status: 502 }
    )
  }
}
