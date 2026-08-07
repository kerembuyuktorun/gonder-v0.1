import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  unwrapListItems,
  upstreamErrorResponse,
} from '../_lib/lastmile-bff'

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

function pickPaginationMeta(data: unknown) {
  const root = asRecord(data)
  const nested = asRecord(root.data)
  return {
    total: Number(root.total ?? nested.total ?? 0),
    page: Number(root.page ?? nested.page ?? 1),
    pageSize: Number(root.pageSize ?? nested.pageSize ?? 20),
  }
}

export async function GET(request: Request) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customerId')
  const driverId = searchParams.get('driverId')
  const vehicleId = searchParams.get('vehicleId')
  const scope = searchParams.get('scope')
  const view = searchParams.get('view')
  const isOrchestratorView =
    view === 'orchestrator' || scope === 'today' || scope === 'carryover'
  const isRouteListView = view === 'routeList'

  if (!customerId && !driverId && !vehicleId && !isOrchestratorView && !isRouteListView) {
    return NextResponse.json(
      {
        success: false,
        error: 'customerId, driverId, vehicleId veya orchestrator scope zorunludur.',
      },
      { status: 400 }
    )
  }

  const upstreamParams = new URLSearchParams()
  if (customerId) upstreamParams.set('customerId', customerId)
  if (driverId) upstreamParams.set('driverId', driverId)
  if (vehicleId) upstreamParams.set('vehicleId', vehicleId)

  for (const key of [
    'page',
    'pageSize',
    'status',
    'search',
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
    'scope',
    'view',
    'tenantId',
  ] as const) {
    const value = searchParams.get(key)
    if (value) upstreamParams.set(key, value)
  }

  if (!upstreamParams.has('page')) upstreamParams.set('page', '1')
  if (!upstreamParams.has('pageSize')) {
    upstreamParams.set('pageSize', isOrchestratorView ? '50' : '50')
  }

  const upstream = await lastmileRest<unknown>(
    `api/v1/last-mile-routes?${upstreamParams.toString()}`,
    { method: 'GET' },
    auth.accessToken
  )

  if (!upstream.ok) {
    return upstreamErrorResponse(upstream)
  }

  const meta = pickPaginationMeta(upstream.data)

  return NextResponse.json({
    success: true,
    data: {
      items: unwrapListItems(upstream.data),
      ...meta,
    },
  })
}
