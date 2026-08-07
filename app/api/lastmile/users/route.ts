import { NextResponse } from 'next/server'
import {
  lastmileGraphql,
  lastmileRest,
  requireAccessToken,
  unwrapListItems,
} from '../_lib/lastmile-bff'
import {
  USER_LIST_SUMMARY_QUERY,
  USERS_LIST_QUERY,
  buildListUsersFilter,
  buildSummaryFilter,
  statusScopeToBackend,
  tryUnwrapGraphqlData,
} from './_lib/graphql-users'

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

function pickPaginationMeta(data: unknown, fallback: Record<string, unknown>) {
  const root = asRecord(data)
  const users = asRecord(root.users)
  const nested = asRecord(root.data)
  const nestedUsers = asRecord(nested.users)

  const total = Number(
    users.total ?? nestedUsers.total ?? root.total ?? nested.total ?? 0
  )
  const page = Number(users.page ?? nestedUsers.page ?? fallback.page ?? 1)
  const pageSize = Number(users.pageSize ?? nestedUsers.pageSize ?? fallback.pageSize ?? 20)

  return {
    total: Number.isFinite(total) ? total : 0,
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 20,
  }
}

function pickListItems(data: unknown): unknown[] {
  const root = asRecord(data)
  const users = asRecord(root.users)
  if (Array.isArray(users.items)) return users.items

  const nested = asRecord(root.data)
  const nestedUsers = asRecord(nested.users)
  if (Array.isArray(nestedUsers.items)) return nestedUsers.items

  return unwrapListItems(data)
}

function pickSummary(data: unknown) {
  const root = asRecord(data)
  const summary = asRecord(root.userListSummary)
  const nested = asRecord(asRecord(root.data).userListSummary)

  return {
    total: Number(summary.total ?? nested.total ?? 0),
    active: Number(summary.active ?? nested.active ?? 0),
    passive: Number(summary.passive ?? nested.passive ?? 0),
    invited: Number(summary.invited ?? nested.invited ?? 0),
  }
}

function buildRestQueryParams(filter: Record<string, unknown>): URLSearchParams {
  const params = new URLSearchParams()
  params.set('page', String(filter.page ?? 1))
  params.set('pageSize', String(filter.pageSize ?? 20))

  const search = filter.search
  if (typeof search === 'string' && search.trim()) {
    params.set('search', search.trim())
  }

  const userStatus = filter.userStatus
  if (typeof userStatus === 'string' && userStatus.trim()) {
    params.set('userStatus', userStatus.trim())
  }

  return params
}

async function fetchUsersGraphql(
  accessToken: string,
  filter: Record<string, unknown>
): Promise<
  | { ok: true; items: unknown[]; total: number; page: number; pageSize: number }
  | { ok: false; error: string }
> {
  const upstream = await lastmileGraphql<unknown>(
    USERS_LIST_QUERY,
    { filter },
    accessToken
  )

  if (!upstream.ok) {
    return { ok: false, error: upstream.error }
  }

  const parsed = tryUnwrapGraphqlData<Record<string, unknown>>(upstream.data)
  if (parsed.error || !parsed.data) {
    return { ok: false, error: parsed.error ?? 'Kullanıcı listesi alınamadı.' }
  }

  const meta = pickPaginationMeta(parsed.data, filter)
  return {
    ok: true,
    items: pickListItems(parsed.data),
    ...meta,
  }
}

async function fetchUsersRest(
  accessToken: string,
  filter: Record<string, unknown>
): Promise<
  | { ok: true; items: unknown[]; total: number; page: number; pageSize: number }
  | { ok: false; error: string }
> {
  const params = buildRestQueryParams(filter)
  const upstream = await lastmileRest<unknown>(
    `api/v1/users?${params.toString()}`,
    { method: 'GET' },
    accessToken
  )

  if (!upstream.ok) {
    return { ok: false, error: upstream.error }
  }

  const meta = pickPaginationMeta(upstream.data, filter)
  return {
    ok: true,
    items: unwrapListItems(upstream.data),
    ...meta,
  }
}

async function fetchSummaryGraphql(
  accessToken: string,
  summaryFilter: Record<string, unknown> | null
): Promise<{ total: number; active: number; passive: number; invited: number } | null> {
  const upstream = await lastmileGraphql<unknown>(
    USER_LIST_SUMMARY_QUERY,
    { filter: summaryFilter },
    accessToken
  )

  if (!upstream.ok) return null

  const parsed = tryUnwrapGraphqlData<Record<string, unknown>>(upstream.data)
  if (parsed.error || !parsed.data) return null

  return pickSummary(parsed.data)
}

async function fetchSummaryRest(
  accessToken: string
): Promise<{ total: number; active: number; passive: number; invited: number } | null> {
  const upstream = await lastmileRest<unknown>('api/v1/users/summary', { method: 'GET' }, accessToken)
  if (!upstream.ok) return null

  const root = asRecord(upstream.data)
  const nested = asRecord(root.data)
  const summary = asRecord(root.summary ?? nested.summary ?? root)

  return {
    total: Number(summary.total ?? 0),
    active: Number(summary.active ?? 0),
    passive: Number(summary.passive ?? nested.passive ?? 0),
    invited: Number(summary.invited ?? 0),
  }
}

export async function GET(request: Request) {
  const auth = await requireAccessToken()
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const filter = buildListUsersFilter(searchParams)

  const statusScope = searchParams.get('statusScope')
  const userStatus = statusScopeToBackend(statusScope)
  if (userStatus) filter.userStatus = userStatus

  const summaryFilter = buildSummaryFilter(filter)

  const [usersGraphql, summaryGraphql] = await Promise.all([
    fetchUsersGraphql(auth.accessToken, filter),
    fetchSummaryGraphql(auth.accessToken, summaryFilter),
  ])

  let usersResult = usersGraphql
  if (!usersResult.ok) {
    usersResult = await fetchUsersRest(auth.accessToken, filter)
  }

  if (!usersResult.ok) {
    return NextResponse.json(
      {
        success: false,
        error: usersResult.error,
      },
      { status: 502 }
    )
  }

  let summary = summaryGraphql
  if (!summary) {
    summary = await fetchSummaryRest(auth.accessToken)
  }

  if (!summary) {
    summary = {
      total: usersResult.total,
      active: 0,
      passive: 0,
      invited: 0,
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      items: usersResult.items,
      total: usersResult.total,
      page: usersResult.page,
      pageSize: usersResult.pageSize,
      summary,
    },
  })
}
