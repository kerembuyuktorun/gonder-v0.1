import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  unwrapEntity,
  upstreamErrorResponse,
} from '../../../../_lib/lastmile-bff'

type RouteContext = {
  params: Promise<{ id: string; documentId: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { id, documentId } = await context.params
  if (!id?.trim() || !documentId?.trim()) {
    return NextResponse.json({ success: false, error: 'Kurye ve evrak id gerekli.' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ success: false, error: 'Geçersiz istek gövdesi.' }, { status: 400 })
  }

  const upstream = await lastmileRest<unknown>(
    `api/v1/drivers/${encodeURIComponent(id)}/documents/${encodeURIComponent(documentId)}`,
    { method: 'PATCH', body: JSON.stringify(body) },
    auth.accessToken
  )

  if (!upstream.ok) return upstreamErrorResponse(upstream)

  return NextResponse.json({ success: true, data: unwrapEntity(upstream.data) })
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { id, documentId } = await context.params
  if (!id?.trim() || !documentId?.trim()) {
    return NextResponse.json({ success: false, error: 'Kurye ve evrak id gerekli.' }, { status: 400 })
  }

  const upstream = await lastmileRest<unknown>(
    `api/v1/drivers/${encodeURIComponent(id)}/documents/${encodeURIComponent(documentId)}`,
    { method: 'DELETE' },
    auth.accessToken
  )

  if (!upstream.ok) return upstreamErrorResponse(upstream)

  return NextResponse.json({ success: true, data: unwrapEntity(upstream.data) })
}
