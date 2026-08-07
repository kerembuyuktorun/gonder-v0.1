import { NextResponse } from 'next/server'
import { backendRequest, parseAuthMeUser } from '../../_lib/auth-backend'
import {
  lastmileGraphql,
  lastmileRest,
  requireAccessToken,
  unwrapEntity,
} from '../_lib/lastmile-bff'
import {
  LAST_MILE_SETTINGS_QUERY,
  tryUnwrapGraphqlData,
  UPSERT_LAST_MILE_SETTINGS_MUTATION,
} from './_lib/graphql-lastmile-settings'
import {
  normalizeLastMileSettingsPayload,
  toTenantSettingsPayload,
} from './_lib/lastmile-settings-map'
import type { OptimizeSettings } from '../../../(arf)/(workspaces)/lastmile/planning/route-orchestrator/_types/orchestrator'

async function resolveTenantId(
  accessToken: string,
  request: Request
): Promise<string | null> {
  const fromQuery = new URL(request.url).searchParams.get('tenantId')
  if (fromQuery?.trim()) return fromQuery.trim()

  const meResponse = await backendRequest<unknown>(
    'api/v1/auth/me',
    { method: 'GET' },
    { accessToken }
  )
  if (!meResponse.ok) return null

  const me = parseAuthMeUser(meResponse.data)
  return me?.tenantId ?? null
}

async function fetchSettingsGraphql(accessToken: string, tenantId: string | null) {
  const upstream = await lastmileGraphql<unknown>(
    LAST_MILE_SETTINGS_QUERY,
    tenantId ? { tenantId } : {},
    accessToken
  )
  if (!upstream.ok) {
    return { ok: false as const, error: upstream.error, status: upstream.status }
  }

  const parsed = tryUnwrapGraphqlData<Record<string, unknown>>(upstream.data)
  if (parsed.error || !parsed.data?.lastMileSettings) {
    return {
      ok: false as const,
      error: parsed.error ?? 'Last mile ayarları bulunamadı.',
      status: 502,
    }
  }

  return {
    ok: true as const,
    settings: normalizeLastMileSettingsPayload(parsed.data.lastMileSettings),
  }
}

async function fetchSettingsRest(accessToken: string, tenantId: string | null) {
  const query = tenantId
    ? `?tenantId=${encodeURIComponent(tenantId)}`
    : ''
  const upstream = await lastmileRest<unknown>(
    `api/v1/last-mile-settings${query}`,
    { method: 'GET' },
    accessToken
  )

  if (!upstream.ok) {
    return { ok: false as const, error: upstream.error, status: upstream.status }
  }

  const entity = unwrapEntity(upstream.data)
  if (Object.keys(entity).length === 0) {
    return { ok: false as const, error: 'Last mile ayarları bulunamadı.', status: 404 }
  }

  return {
    ok: true as const,
    settings: normalizeLastMileSettingsPayload(entity),
  }
}

async function upsertSettingsGraphql(
  accessToken: string,
  tenantId: string | null,
  settings: OptimizeSettings
) {
  const upstream = await lastmileGraphql<unknown>(
    UPSERT_LAST_MILE_SETTINGS_MUTATION,
    { input: toTenantSettingsPayload(settings, tenantId) },
    accessToken
  )
  if (!upstream.ok) {
    return { ok: false as const, error: upstream.error, status: upstream.status }
  }

  const parsed = tryUnwrapGraphqlData<Record<string, unknown>>(upstream.data)
  if (parsed.error || !parsed.data?.upsertLastMileSettings) {
    return {
      ok: false as const,
      error: parsed.error ?? 'Last mile ayarları kaydedilemedi.',
      status: 502,
    }
  }

  return {
    ok: true as const,
    settings: normalizeLastMileSettingsPayload(parsed.data.upsertLastMileSettings),
  }
}

async function upsertSettingsRest(
  accessToken: string,
  tenantId: string | null,
  settings: OptimizeSettings
) {
  const upstream = await lastmileRest<unknown>(
    'api/v1/last-mile-settings',
    {
      method: 'PUT',
      body: JSON.stringify(toTenantSettingsPayload(settings, tenantId)),
    },
    accessToken
  )

  if (!upstream.ok) {
    return { ok: false as const, error: upstream.error, status: upstream.status }
  }

  const entity = unwrapEntity(upstream.data)
  return {
    ok: true as const,
    settings: normalizeLastMileSettingsPayload(entity),
  }
}

function parseSettingsBody(body: unknown): OptimizeSettings | null {
  if (!body || typeof body !== 'object') return null
  return normalizeLastMileSettingsPayload(body)
}

export async function GET(request: Request) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const tenantId = await resolveTenantId(auth.accessToken, request)

  const graphqlResult = await fetchSettingsGraphql(auth.accessToken, tenantId)
  if (graphqlResult.ok) {
    return NextResponse.json({ success: true, data: graphqlResult.settings })
  }

  const restResult = await fetchSettingsRest(auth.accessToken, tenantId)
  if (restResult.ok) {
    return NextResponse.json({ success: true, data: restResult.settings })
  }

  return NextResponse.json(
    {
      success: false,
      error: restResult.error || graphqlResult.error || 'Last mile ayarları yüklenemedi.',
    },
    { status: restResult.status || graphqlResult.status || 502 }
  )
}

export async function PUT(request: Request) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => null)
  const settings = parseSettingsBody(body)
  if (!settings) {
    return NextResponse.json(
      { success: false, error: 'Geçersiz optimizasyon ayarları.' },
      { status: 400 }
    )
  }

  const tenantId = await resolveTenantId(auth.accessToken, request)

  const graphqlResult = await upsertSettingsGraphql(
    auth.accessToken,
    tenantId,
    settings
  )
  if (graphqlResult.ok) {
    return NextResponse.json({ success: true, data: graphqlResult.settings })
  }

  const restResult = await upsertSettingsRest(auth.accessToken, tenantId, settings)
  if (restResult.ok) {
    return NextResponse.json({ success: true, data: restResult.settings })
  }

  return NextResponse.json(
    {
      success: false,
      error: restResult.error || graphqlResult.error || 'Last mile ayarları kaydedilemedi.',
    },
    { status: restResult.status || graphqlResult.status || 502 }
  )
}
