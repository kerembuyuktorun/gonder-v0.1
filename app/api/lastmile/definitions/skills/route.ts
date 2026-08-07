import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  unwrapListItems,
  upstreamErrorResponse,
} from '../../_lib/lastmile-bff'

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

function pickPaginationMeta(data: unknown) {
  const root = asRecord(data)
  const nested = asRecord(root.data)
  const total = Number(root.total ?? nested.total ?? 0)

  return {
    total: Number.isFinite(total) ? total : 0,
  }
}

export async function GET(request: Request) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const upstreamParams = new URLSearchParams()

  for (const key of ['appliesTo', 'excludeDefault', 'page', 'pageSize', 'search'] as const) {
    const value = searchParams.get(key)
    if (value) upstreamParams.set(key, value)
  }

  if (!upstreamParams.has('appliesTo')) {
    upstreamParams.set('appliesTo', 'vehicle')
  }
  if (!upstreamParams.has('excludeDefault')) {
    upstreamParams.set('excludeDefault', 'true')
  }

  const query = upstreamParams.toString()
  const upstream = await lastmileRest<unknown>(
    `api/v1/definitions/skills${query ? `?${query}` : ''}`,
    { method: 'GET' },
    auth.accessToken
  )

  if (!upstream.ok) {
    return upstreamErrorResponse(upstream)
  }

  const meta = pickPaginationMeta(upstream.data)

  return NextResponse.json({
    success: true,
    data: {
      items: unwrapListItems(upstream.data),
      total: meta.total,
    },
  })
}
