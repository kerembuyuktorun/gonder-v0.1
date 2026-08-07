import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  unwrapEntity,
  upstreamErrorResponse,
} from '../../../_lib/lastmile-bff'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ success: false, error: 'Kurye id gerekli.' }, { status: 400 })
  }

  const body = await request.json().catch(() => ({}))

  const upstream = await lastmileRest<unknown>(
    `api/v1/drivers/${encodeURIComponent(id)}/status`,
    { method: 'POST', body: JSON.stringify(body) },
    auth.accessToken
  )

  if (!upstream.ok) return upstreamErrorResponse(upstream)

  return NextResponse.json({ success: true, data: unwrapEntity(upstream.data) })
}
