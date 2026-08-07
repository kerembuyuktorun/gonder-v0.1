import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  unwrapListItems,
  upstreamErrorResponse,
} from '../_lib/lastmile-bff'

const LIST_QUERY_KEYS = [
  'page',
  'pageSize',
  'search',
  'contactType',
  'companyType',
  'addressTitle',
  'addressTitleIn',
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
    const value = searchParams.get(key)
    if (value) upstreamParams.set(key, value)
  }

  if (!upstreamParams.has('page')) upstreamParams.set('page', '1')
  if (!upstreamParams.has('pageSize')) upstreamParams.set('pageSize', '10')

  const query = upstreamParams.toString()
  const upstream = await lastmileRest<unknown>(
    `api/v1/last-mile-connections${query ? `?${query}` : ''}`,
    { method: 'GET' },
    auth.accessToken
  )

  if (!upstream.ok) {
    return upstreamErrorResponse(upstream)
  }

  const meta = pickPaginationMeta(upstream.data)
  const root = asRecord(upstream.data)
  const nested = asRecord(root.data)
  const typeCounts = root.typeCounts ?? nested.typeCounts ?? null

  return NextResponse.json({
    success: true,
    data: {
      connections: unwrapListItems(upstream.data),
      items: unwrapListItems(upstream.data),
      total: meta.total,
      page: meta.page,
      pageSize: meta.pageSize,
      typeCounts,
    },
  })
}
