import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  unwrapEntity,
  unwrapListItems,
  upstreamErrorResponse,
} from '../_lib/lastmile-bff'

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

export async function GET(request: Request) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customerId')

  if (!customerId) {
    return NextResponse.json(
      { success: false, error: 'customerId zorunludur.' },
      { status: 400 }
    )
  }

  const upstreamParams = new URLSearchParams({
    customerId,
    page: searchParams.get('page') ?? '1',
    pageSize: searchParams.get('pageSize') ?? '100',
  })

  const upstream = await lastmileRest<unknown>(
    `api/v1/customer-addresses?${upstreamParams.toString()}`,
    { method: 'GET' },
    auth.accessToken
  )

  if (!upstream.ok) {
    return upstreamErrorResponse(upstream)
  }

  const root = asRecord(upstream.data)
  const nested = asRecord(root.data)
  const total = Number(root.total ?? nested.total ?? 0)

  return NextResponse.json({
    success: true,
    data: {
      items: unwrapListItems(upstream.data),
      total: Number.isFinite(total) ? total : 0,
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
    'api/v1/customer-addresses',
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
