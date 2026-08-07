import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  upstreamErrorResponse,
} from '../../_lib/lastmile-bff'

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

export async function GET(request: Request) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const upstreamParams = new URLSearchParams()

  for (const key of [
    'operationDate',
    'search',
    'customerId',
    'respectShifts',
  ] as const) {
    const value = searchParams.get(key)
    if (value) upstreamParams.set(key, value)
  }

  const query = upstreamParams.toString()
  const upstream = await lastmileRest<unknown>(
    `api/v1/last-mile-routes/planning-vehicles${query ? `?${query}` : ''}`,
    { method: 'GET' },
    auth.accessToken
  )

  if (!upstream.ok) return upstreamErrorResponse(upstream)

  const root = asRecord(upstream.data)
  const nested = asRecord(root.data)
  const vehicles = Array.isArray(root.vehicles)
    ? root.vehicles
    : Array.isArray(nested.vehicles)
      ? nested.vehicles
      : []

  return NextResponse.json({
    success: true,
    data: {
      vehicles,
      total: Number(root.total ?? nested.total ?? vehicles.length),
    },
  })
}
