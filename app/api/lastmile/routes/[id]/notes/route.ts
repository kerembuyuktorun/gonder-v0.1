import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  unwrapEntity,
  upstreamErrorResponse,
} from '../../../_lib/lastmile-bff'

type RouteContext = {
  params: Promise<{ id: string }>
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : {}
}

function unwrapNotes(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  const root = asRecord(data)
  const nested = asRecord(root.data)
  const candidates = [root.items, root.notes, nested.items, nested.notes, root.data]
  return candidates.find(Array.isArray) ?? []
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
    return NextResponse.json({ success: false, error: 'Rota id gerekli.' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const params = new URLSearchParams({
    routeId: id,
    page: searchParams.get('page') || '1',
    pageSize: searchParams.get('pageSize') || '50',
  })

  const upstream = await lastmileRest<unknown>(
    `api/v1/last-mile-routes/${encodeURIComponent(id)}/notes?${params.toString()}`,
    { method: 'GET' },
    auth.accessToken
  )

  if (!upstream.ok) {
    const listUpstream = await lastmileRest<unknown>(
      `api/v1/last-mile-route-notes?${params.toString()}`,
      { method: 'GET' },
      auth.accessToken
    )
    if (!listUpstream.ok) return upstreamErrorResponse(listUpstream)
    const meta = pickPaginationMeta(listUpstream.data)
    return NextResponse.json({
      success: true,
      data: { items: unwrapNotes(listUpstream.data), ...meta },
    })
  }

  const meta = pickPaginationMeta(upstream.data)
  return NextResponse.json({
    success: true,
    data: { items: unwrapNotes(upstream.data), ...meta },
  })
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ success: false, error: 'Rota id gerekli.' }, { status: 400 })
  }

  const body = asRecord(await request.json().catch(() => ({})))
  const note = typeof body.note === 'string' ? body.note.trim() : ''
  if (!note) {
    return NextResponse.json({ success: false, error: 'Not metni gerekli.' }, { status: 400 })
  }

  const visibility =
    typeof body.visibility === 'string' ? body.visibility.trim().toUpperCase() : 'DISPATCHER'

  const upstream = await lastmileRest<unknown>(
    'api/v1/last-mile-route-notes',
    {
      method: 'POST',
      body: JSON.stringify({
        routeId: id,
        note,
        visibility,
      }),
    },
    auth.accessToken
  )

  if (!upstream.ok) return upstreamErrorResponse(upstream)

  return NextResponse.json({
    success: true,
    data: unwrapEntity(upstream.data),
  })
}
