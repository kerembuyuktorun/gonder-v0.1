import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  unwrapEntity,
  upstreamErrorResponse,
} from '../../../_lib/lastmile-bff'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ success: false, error: 'Araç id gerekli.' }, { status: 400 })
  }

  const upstream = await lastmileRest<unknown>(
    `api/v1/vehicles/${encodeURIComponent(id)}/passive`,
    { method: 'POST', body: JSON.stringify({}) },
    auth.accessToken
  )

  if (!upstream.ok) return upstreamErrorResponse(upstream)

  return NextResponse.json({ success: true, data: unwrapEntity(upstream.data) })
}
