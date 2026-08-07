import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  unwrapEntity,
  upstreamErrorResponse,
} from '../../_lib/lastmile-bff'

type RouteContext = {
  params: Promise<{ noteId: string }>
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : {}
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { noteId } = await context.params
  if (!noteId?.trim()) {
    return NextResponse.json({ success: false, error: 'Not id gerekli.' }, { status: 400 })
  }

  const body = asRecord(await request.json().catch(() => ({})))
  const payload: Record<string, string> = {}

  if (typeof body.note === 'string' && body.note.trim()) {
    payload.note = body.note.trim()
  }
  if (typeof body.visibility === 'string' && body.visibility.trim()) {
    payload.visibility = body.visibility.trim().toUpperCase()
  }

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ success: false, error: 'Güncellenecek alan yok.' }, { status: 400 })
  }

  const upstream = await lastmileRest<unknown>(
    `api/v1/last-mile-route-notes/${encodeURIComponent(noteId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    auth.accessToken
  )

  if (!upstream.ok) return upstreamErrorResponse(upstream)

  return NextResponse.json({
    success: true,
    data: unwrapEntity(upstream.data),
  })
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { noteId } = await context.params
  if (!noteId?.trim()) {
    return NextResponse.json({ success: false, error: 'Not id gerekli.' }, { status: 400 })
  }

  const upstream = await lastmileRest<unknown>(
    `api/v1/last-mile-route-notes/${encodeURIComponent(noteId)}`,
    { method: 'DELETE' },
    auth.accessToken
  )

  if (!upstream.ok) return upstreamErrorResponse(upstream)

  return NextResponse.json({ success: true, data: { id: noteId } })
}
