import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  upstreamErrorResponse,
} from '../../../_lib/lastmile-bff'

type RouteContext = {
  params: Promise<{ id: string }>
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ success: false, error: 'Sipariş id gerekli.' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const upstreamParams = new URLSearchParams()

  for (const key of ['page', 'pageSize', 'itemId', 'actionType'] as const) {
    const value = searchParams.get(key)
    if (value) upstreamParams.set(key, value)
  }

  if (!upstreamParams.has('page')) upstreamParams.set('page', '1')
  if (!upstreamParams.has('pageSize')) upstreamParams.set('pageSize', '50')

  const query = upstreamParams.toString()
  const upstream = await lastmileRest<unknown>(
    `api/v1/last-mile-orders/${encodeURIComponent(id)}/movements${query ? `?${query}` : ''}`,
    { method: 'GET' },
    auth.accessToken
  )

  if (!upstream.ok) {
    return upstreamErrorResponse(upstream)
  }

  const root = asRecord(upstream.data)
  const nested = asRecord(root.data)
  const movements = Array.isArray(root.movements)
    ? root.movements
    : Array.isArray(nested.movements)
      ? nested.movements
      : []

  return NextResponse.json({
    success: true,
    data: {
      movements,
      total: Number(root.total ?? nested.total ?? movements.length),
      page: Number(root.page ?? nested.page ?? 1),
      pageSize: Number(root.pageSize ?? nested.pageSize ?? 50),
    },
  })
}
