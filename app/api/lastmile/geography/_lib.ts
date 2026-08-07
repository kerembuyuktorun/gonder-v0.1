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

/**
 * Lokal Kong’da organization route’ları yoksa:
 * ORGANIZATION_BASE_URL=http://localhost:3013
 */
async function fetchGeographyUpstream(
  pathWithQuery: string,
  accessToken: string
) {
  const primary = await lastmileRest<unknown>(pathWithQuery, { method: 'GET' }, accessToken)
  if (primary.ok || primary.status !== 404) return primary

  const orgBase = process.env.ORGANIZATION_BASE_URL?.replace(/\/$/, '')
  if (!orgBase) return primary

  const url = new URL(pathWithQuery.replace(/^\/+/, ''), `${orgBase}/`)
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    return {
      ok: false as const,
      status: response.status,
      error:
        typeof asRecord(data).message === 'string'
          ? String(asRecord(data).message)
          : `HTTP_${response.status}`,
      data,
    }
  }

  return { ok: true as const, status: response.status, data }
}

export async function proxyGeographyList(
  request: Request,
  upstreamPath: string,
  allowedKeys: readonly string[]
) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const upstreamParams = new URLSearchParams()

  for (const key of allowedKeys) {
    const value = searchParams.get(key)
    if (value) upstreamParams.set(key, value)
  }

  if (!upstreamParams.has('page')) upstreamParams.set('page', '1')
  if (!upstreamParams.has('pageSize')) upstreamParams.set('pageSize', '300')

  const query = upstreamParams.toString()
  const pathWithQuery = `api/v1/${upstreamPath}${query ? `?${query}` : ''}`
  const upstream = await fetchGeographyUpstream(pathWithQuery, auth.accessToken)

  if (!upstream.ok) {
    return upstreamErrorResponse(upstream)
  }

  const root = asRecord(upstream.data)
  const nested = asRecord(root.data)
  const total = Number(root.total ?? nested.total ?? 0)

  return NextResponse.json({
    success: true,
    data: {
      items: unwrapListItems(upstream.data),
      total: Number.isFinite(total) ? total : 0,
      page: Number(root.page ?? nested.page ?? 1),
      pageSize: Number(root.pageSize ?? nested.pageSize ?? 300),
    },
  })
}
