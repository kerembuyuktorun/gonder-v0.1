import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  unwrapEntity,
  upstreamErrorResponse,
} from '../../_lib/lastmile-bff'

export async function POST(request: Request) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { success: false, error: 'Geçersiz istek gövdesi.' },
      { status: 400 }
    )
  }

  const upstream = await lastmileRest<unknown>(
    'api/v1/last-mile-routes/reject-solution',
    { method: 'POST', body: JSON.stringify(body) },
    auth.accessToken
  )

  if (!upstream.ok) return upstreamErrorResponse(upstream)

  return NextResponse.json({
    success: true,
    data: unwrapEntity(upstream.data) ?? upstream.data,
  })
}
