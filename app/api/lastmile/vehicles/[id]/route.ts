import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  unwrapEntity,
  upstreamErrorResponse,
} from '../../_lib/lastmile-bff'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ success: false, error: 'Araç id gerekli.' }, { status: 400 })
  }

  const upstream = await lastmileRest<unknown>(
    `api/v1/vehicles/${encodeURIComponent(id)}`,
    { method: 'GET' },
    auth.accessToken
  )

  if (!upstream.ok) {
    return upstreamErrorResponse(upstream)
  }

  return NextResponse.json({
    success: true,
    data: unwrapEntity(upstream.data),
  })
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ success: false, error: 'Araç id gerekli.' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ success: false, error: 'Geçersiz istek gövdesi.' }, { status: 400 })
  }

  const upstream = await lastmileRest<unknown>(
    `api/v1/vehicles/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
    auth.accessToken
  )

  if (!upstream.ok) {
    return upstreamErrorResponse(upstream)
  }

  return NextResponse.json({
    success: true,
    data: unwrapEntity(upstream.data),
  })
}
