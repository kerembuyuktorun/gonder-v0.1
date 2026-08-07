import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  unwrapEntity,
  unwrapListItems,
  upstreamErrorResponse,
} from '../_lib/lastmile-bff'

const LIST_QUERY_KEYS = [
  'page',
  'pageSize',
  'search',
  'status',
  'ownership',
  'vehicleClass',
  'type',
  'sortBy',
  'sortDir',
] as const

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

function pickPaginationMeta(data: unknown) {
  const root = asRecord(data)
  const nested = asRecord(root.data)
  const total = Number(root.total ?? nested.total ?? 0)
  const page = Number(root.page ?? nested.page ?? 1)
  const pageSize = Number(root.pageSize ?? nested.pageSize ?? 10)

  return {
    total: Number.isFinite(total) ? total : 0,
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 10,
  }
}

export async function GET(request: Request) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const upstreamParams = new URLSearchParams()

  for (const key of LIST_QUERY_KEYS) {
    const values = searchParams.getAll(key)
    for (const value of values) {
      if (value) upstreamParams.append(key, value)
    }
  }

  if (!upstreamParams.has('page')) upstreamParams.set('page', '1')
  if (!upstreamParams.has('pageSize')) upstreamParams.set('pageSize', '10')

  const query = upstreamParams.toString()
  const upstream = await lastmileRest<unknown>(
    `api/v1/vehicles${query ? `?${query}` : ''}`,
    { method: 'GET' },
    auth.accessToken
  )

  if (!upstream.ok) {
    return upstreamErrorResponse(upstream)
  }

  const meta = pickPaginationMeta(upstream.data)
  const root = asRecord(upstream.data)
  const nested = asRecord(root.data)

  return NextResponse.json({
    success: true,
    data: {
      items: unwrapListItems(upstream.data),
      vehicles: unwrapListItems(upstream.data),
      total: meta.total,
      page: meta.page,
      pageSize: meta.pageSize,
      statusCounts: root.statusCounts ?? nested.statusCounts ?? null,
    },
  })
}

export async function POST(request: Request) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ success: false, error: 'Geçersiz istek gövdesi.' }, { status: 400 })
  }

  const upstream = await lastmileRest<unknown>(
    'api/v1/vehicles',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    auth.accessToken
  )

  if (!upstream.ok) {
    return upstreamErrorResponse(upstream)
  }

  return NextResponse.json(
    {
      success: true,
      data: unwrapEntity(upstream.data),
    },
    { status: 201 }
  )
}
