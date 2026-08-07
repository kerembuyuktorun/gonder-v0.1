import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  unwrapEntity,
  upstreamErrorResponse,
} from '../../../_lib/lastmile-bff'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { id } = await params
  const body = await request.json().catch(() => null)
  if (!id || !body || typeof body !== 'object') {
    return NextResponse.json(
      { success: false, error: 'Geçersiz istek.' },
      { status: 400 }
    )
  }

  const upstream = await lastmileRest<unknown>(
    `api/v1/last-mile-routes/${encodeURIComponent(id)}/reoptimize`,
    { method: 'POST', body: JSON.stringify(body) },
    auth.accessToken
  )

  if (!upstream.ok) return upstreamErrorResponse(upstream)

  return NextResponse.json({
    success: true,
    data: unwrapEntity(upstream.data) ?? upstream.data,
  })
}
