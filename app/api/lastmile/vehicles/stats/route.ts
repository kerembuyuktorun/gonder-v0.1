import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  unwrapEntity,
  upstreamErrorResponse,
} from '../../_lib/lastmile-bff'

export async function GET() {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const upstream = await lastmileRest<unknown>(
    'api/v1/vehicles/stats',
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
