import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  unwrapEntity,
  upstreamErrorResponse,
} from '../../_lib/lastmile-bff'

export async function GET(request: Request) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const plaka = searchParams.get('plaka')?.trim()
  if (!plaka) {
    return NextResponse.json({ success: false, error: 'Plaka gerekli.' }, { status: 400 })
  }

  const upstreamParams = new URLSearchParams({ plaka })
  const excludeId = searchParams.get('excludeId')?.trim()
  if (excludeId) upstreamParams.set('excludeId', excludeId)

  const upstream = await lastmileRest<unknown>(
    `api/v1/vehicles/check-plate?${upstreamParams.toString()}`,
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
