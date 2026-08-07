import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  upstreamErrorResponse,
} from '../../_lib/lastmile-bff'

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

const EXPORT_QUERY_KEYS = [
  'view',
  'search',
  'status',
  'plannedDate',
  'operationDate',
  'plannedDateFrom',
  'plannedDateTo',
  'sortBy',
  'sortDir',
  'routeType',
  'minDistance',
  'maxDistance',
  'minDuration',
  'maxDuration',
  'minVolumeOccupancyPct',
  'maxVolumeOccupancyPct',
  'minWeightOccupancyPct',
  'maxWeightOccupancyPct',
  'tenantId',
] as const

export async function GET(request: Request) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const upstreamParams = new URLSearchParams()

  if (!searchParams.get('view')) {
    upstreamParams.set('view', 'routeList')
  }

  for (const key of EXPORT_QUERY_KEYS) {
    const value = searchParams.get(key)
    if (value) upstreamParams.set(key, value)
  }

  const upstream = await lastmileRest<unknown>(
    `api/v1/last-mile-routes/export?${upstreamParams.toString()}`,
    { method: 'GET' },
    auth.accessToken
  )

  if (!upstream.ok) {
    return upstreamErrorResponse(upstream)
  }

  const root = asRecord(upstream.data)
  const nested = asRecord(root.data)
  const payload = Object.keys(nested).length > 0 ? nested : root

  return NextResponse.json({
    success: true,
    data: {
      filename: String(payload.filename ?? 'rota-listesi.xlsx'),
      contentType: String(
        payload.contentType ?? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ),
      base64: String(payload.base64 ?? ''),
      rowCount: Number(payload.rowCount ?? 0),
    },
  })
}
