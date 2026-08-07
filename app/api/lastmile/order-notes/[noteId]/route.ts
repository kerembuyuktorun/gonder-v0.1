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
  const note = typeof body.note === 'string' ? body.note.trim() : ''
  if (!note) {
    return NextResponse.json({ success: false, error: 'Not metni gerekli.' }, { status: 400 })
  }

  const payload: Record<string, string> = { note }
  if (typeof body.noteType === 'string' && body.noteType.trim()) {
    const rawType = body.noteType.trim().toUpperCase()
    payload.noteType = rawType === 'COURIER' ? 'COURIER' : 'INTERNAL'
  }

  const upstream = await lastmileRest<unknown>(
    `api/v1/last-mile-order-notes/${encodeURIComponent(noteId)}`,
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
