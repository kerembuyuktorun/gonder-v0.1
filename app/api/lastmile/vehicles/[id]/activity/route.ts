import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  unwrapListItems,
  upstreamErrorResponse,
} from '../../../_lib/lastmile-bff'

type RouteContext = { params: Promise<{ id: string }> }

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

function pickPaginationMeta(data: unknown) {
  const root = asRecord(data)
  const nested = asRecord(root.data)
  return {
    total: Number(root.total ?? nested.total ?? 0),
    page: Number(root.page ?? nested.page ?? 1),
    pageSize: Number(root.pageSize ?? nested.pageSize ?? 50),
  }
}

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ success: false, error: 'Araç id gerekli.' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const upstreamParams = new URLSearchParams()
  for (const key of ['page', 'pageSize'] as const) {
    const value = searchParams.get(key)
    if (value) upstreamParams.set(key, value)
  }
  if (!upstreamParams.has('page')) upstreamParams.set('page', '1')
  if (!upstreamParams.has('pageSize')) upstreamParams.set('pageSize', '50')

  const upstream = await lastmileRest<unknown>(
    `api/v1/vehicles/${encodeURIComponent(id)}/activity?${upstreamParams.toString()}`,
    { method: 'GET' },
    auth.accessToken
  )

  if (!upstream.ok) return upstreamErrorResponse(upstream)

  const meta = pickPaginationMeta(upstream.data)

  return NextResponse.json({
    success: true,
    data: {
      items: unwrapListItems(upstream.data),
      ...meta,
    },
  })
}
