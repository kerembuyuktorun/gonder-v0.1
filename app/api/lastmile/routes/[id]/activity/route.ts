import { NextResponse } from 'next/server'
import {
  lastmileRest,
  requireAccessToken,
  upstreamErrorResponse,
} from '../../../_lib/lastmile-bff'

type RouteContext = {
  params: Promise<{ id: string }>
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

function unwrapActivityItems(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  const root = asRecord(data)
  const nested = asRecord(root.data)
  const candidates = [
    root.items,
    root.events,
    root.activity,
    nested.items,
    nested.events,
    nested.activity,
  ]
  return candidates.find(Array.isArray) ?? []
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ success: false, error: 'Rota id gerekli.' }, { status: 400 })
  }

  const upstream = await lastmileRest<unknown>(
    `api/v1/last-mile-routes/${encodeURIComponent(id)}/activity`,
    { method: 'GET' },
    auth.accessToken
  )

  if (!upstream.ok) return upstreamErrorResponse(upstream)

  const root = asRecord(upstream.data)
  const nested = asRecord(root.data)

  return NextResponse.json({
    success: true,
    data: {
      items: unwrapActivityItems(upstream.data),
      total: Number(root.total ?? nested.total ?? unwrapActivityItems(upstream.data).length),
    },
  })
}
