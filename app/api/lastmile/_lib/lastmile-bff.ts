import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AUTH_ACCESS_COOKIE } from '../../../_shared/auth-cookies'
import { backendRequest, type BackendResult } from '../../_lib/auth-backend'

export type LastmileBffErrorBody = {
  success: false
  error: string
  code?: string
  data?: unknown
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

export function pickUpstreamCode(data: unknown): string | undefined {
  const root = asRecord(data)
  const nested = asRecord(root.data)
  const messageObj = asRecord(root.message)
  const code = root.code ?? nested.code ?? messageObj.code
  return typeof code === 'string' && code.trim() ? code : undefined
}

export async function requireAccessToken(): Promise<
  { ok: true; accessToken: string } | { ok: false; response: NextResponse }
> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(AUTH_ACCESS_COOKIE)?.value

  if (!accessToken) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Oturum bulunamadı.' } satisfies LastmileBffErrorBody,
        { status: 401 }
      ),
    }
  }

  return { ok: true, accessToken }
}

export function upstreamErrorResponse(upstream: BackendResult<unknown>) {
  if (upstream.ok) {
    throw new Error('upstreamErrorResponse called with ok result')
  }

  return NextResponse.json(
    {
      success: false,
      error: upstream.error,
      code: pickUpstreamCode(upstream.data),
      data: upstream.data,
    } satisfies LastmileBffErrorBody,
    { status: upstream.status }
  )
}

export async function lastmileRest<T>(
  path: string,
  init: RequestInit,
  accessToken: string
): Promise<BackendResult<T>> {
  return backendRequest<T>(path, init, { accessToken })
}

export async function lastmileGraphql<T>(
  query: string,
  variables: Record<string, unknown>,
  accessToken: string
): Promise<BackendResult<T>> {
  return backendRequest<T>(
    '',
    {
      method: 'POST',
      body: JSON.stringify({ query, variables }),
    },
    { accessToken, useGraphqlBase: true }
  )
}

export function unwrapListItems(data: unknown): unknown[] {
  const root = asRecord(data)
  const nested = asRecord(root.data)

  const candidates = [
    root.items,
    root.orders,
    root.customers,
    root.connections,
    root.vehicles,
    root.drivers,
    root.customerAddresses,
    root.addresses,
    root.routes,
    root.results,
    root.countries,
    root.cities,
    root.districts,
    root.neighborhoods,
    root.data,
    nested.items,
    nested.orders,
    nested.customers,
    nested.connections,
    nested.vehicles,
    nested.drivers,
    nested.customerAddresses,
    nested.addresses,
    nested.routes,
    nested.results,
    nested.countries,
    nested.cities,
    nested.districts,
    nested.neighborhoods,
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }

  return []
}

export function unwrapEntity(data: unknown): Record<string, unknown> {
  const root = asRecord(data)
  const nested = asRecord(root.data)
  if (Object.keys(nested).length > 0 && !Array.isArray(root.data)) {
    return nested
  }
  return root
}
