import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  unwrapEntity,
  upstreamErrorResponse,
} from '../../_lib/lastmile-bff'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { id } = await params
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'route id zorunludur.' },
      { status: 400 }
    )
  }

  const upstream = await lastmileRest<unknown>(
    `api/v1/last-mile-routes/${encodeURIComponent(id)}`,
    { method: 'GET' },
    auth.accessToken
  )

  if (!upstream.ok) return upstreamErrorResponse(upstream)

  return NextResponse.json({
    success: true,
    data: unwrapEntity(upstream.data) ?? upstream.data,
  })
}
