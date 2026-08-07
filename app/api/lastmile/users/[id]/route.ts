import { NextResponse } from 'next/server'
import {
  lastmileGraphql,
  lastmileRest,
  requireAccessToken,
  unwrapEntity,
  upstreamErrorResponse,
} from '../../_lib/lastmile-bff'
import {
  UPDATE_USER_MUTATION,
  USER_DETAIL_QUERY,
  tryUnwrapGraphqlData,
  unwrapGraphqlData,
} from '../_lib/graphql-users'

type RouteContext = { params: Promise<{ id: string }> }

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

function pickDocuments(data: unknown): unknown[] {
  const root = asRecord(data)
  const nested = asRecord(root.data)
  const candidates = [root.items, root.documents, nested.items, nested.documents]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }
  return []
}

async function fetchUserGraphql(accessToken: string, id: string) {
  const upstream = await lastmileGraphql<unknown>(USER_DETAIL_QUERY, { id }, accessToken)
  if (!upstream.ok) return { ok: false as const, error: upstream.error, status: upstream.status }

  const parsed = tryUnwrapGraphqlData<Record<string, unknown>>(upstream.data)
  if (parsed.error || !parsed.data?.user) {
    return {
      ok: false as const,
      error: parsed.error ?? 'Kullanıcı bulunamadı.',
      status: 502,
    }
  }

  return { ok: true as const, user: asRecord(parsed.data.user) }
}

async function fetchUserRest(accessToken: string, id: string) {
  const upstream = await lastmileRest<unknown>(
    `api/v1/users/${encodeURIComponent(id)}`,
    { method: 'GET' },
    accessToken
  )

  if (!upstream.ok) {
    return { ok: false as const, error: upstream.error, status: upstream.status }
  }

  const user = unwrapEntity(upstream.data)
  if (!user.id) {
    return { ok: false as const, error: 'Kullanıcı bulunamadı.', status: 404 }
  }

  const documentsUpstream = await lastmileRest<unknown>(
    `api/v1/users/${encodeURIComponent(id)}/documents`,
    { method: 'GET' },
    accessToken
  )

  if (documentsUpstream.ok) {
    const docs = pickDocuments(documentsUpstream.data)
    if (docs.length > 0) {
      user.documents = docs
    }
  }

  return { ok: true as const, user }
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ success: false, error: 'Kullanıcı id gerekli.' }, { status: 400 })
  }

  const graphqlResult = await fetchUserGraphql(auth.accessToken, id)
  if (graphqlResult.ok) {
    return NextResponse.json({ success: true, data: graphqlResult.user })
  }

  const restResult = await fetchUserRest(auth.accessToken, id)
  if (restResult.ok) {
    return NextResponse.json({ success: true, data: restResult.user })
  }

  return NextResponse.json(
    {
      success: false,
      error: restResult.error || graphqlResult.error || 'Kullanıcı detayı alınamadı.',
    },
    { status: restResult.status === 404 ? 404 : 502 }
  )
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id?.trim()) {
    return NextResponse.json({ success: false, error: 'Kullanıcı id gerekli.' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ success: false, error: 'Geçersiz istek gövdesi.' }, { status: 400 })
  }

  try {
    const upstream = await lastmileGraphql<unknown>(
      UPDATE_USER_MUTATION,
      { id, input: body },
      auth.accessToken
    )

    if (!upstream.ok) return upstreamErrorResponse(upstream)

    const data = unwrapGraphqlData<Record<string, unknown>>(upstream.data)
    return NextResponse.json({ success: true, data: data?.updateUser ?? null })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Kullanıcı güncellenemedi.',
      },
      { status: 502 }
    )
  }
}
