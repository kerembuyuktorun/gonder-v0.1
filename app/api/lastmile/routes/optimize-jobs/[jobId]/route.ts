import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  unwrapEntity,
  upstreamErrorResponse,
} from '../../../_lib/lastmile-bff'

type Params = { params: Promise<{ jobId: string }> }

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { jobId } = await params
  if (!jobId) {
    return NextResponse.json(
      { success: false, error: 'jobId zorunludur.' },
      { status: 400 }
    )
  }

  const upstream = await lastmileRest<unknown>(
    `api/v1/last-mile-routes/optimize-jobs/${encodeURIComponent(jobId)}`,
    { method: 'GET' },
    auth.accessToken
  )

  if (!upstream.ok) return upstreamErrorResponse(upstream)

  return NextResponse.json({
    success: true,
    data: unwrapEntity(upstream.data) ?? upstream.data,
  })
}
