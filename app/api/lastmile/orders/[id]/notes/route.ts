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
  const candidates = [
    root.items,
    root.notes,
    root.results,
    root.data,
    nested.items,
    nested.notes,
    nested.results,
  ]
  return candidates.find(Array.isArray) ?? []
}

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ success: false, error: 'Sipariş id gerekli.' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const params = new URLSearchParams({
    lastMileOrderId: id,
    noteType: searchParams.get('noteType') || 'INTERNAL',
  })

  const upstream = await lastmileRest<unknown>(
    `api/v1/last-mile-order-notes?${params.toString()}`,
    { method: 'GET' },
    auth.accessToken
  )

  if (!upstream.ok) return upstreamErrorResponse(upstream)

  return NextResponse.json({
    success: true,
    data: { items: unwrapNotes(upstream.data) },
  })
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ success: false, error: 'Sipariş id gerekli.' }, { status: 400 })
  }

  const body = asRecord(await request.json().catch(() => ({})))
  const note = typeof body.note === 'string' ? body.note.trim() : ''
  if (!note) {
    return NextResponse.json({ success: false, error: 'Not metni gerekli.' }, { status: 400 })
  }

  const rawType = typeof body.noteType === 'string' ? body.noteType.trim().toUpperCase() : 'INTERNAL'
  const noteType = rawType === 'COURIER' ? 'COURIER' : 'INTERNAL'

  const upstream = await lastmileRest<unknown>(
    'api/v1/last-mile-order-notes',
    {
      method: 'POST',
      body: JSON.stringify({
        lastMileOrderId: id,
        note,
        noteType,
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
