import { lastmileClientRequest } from '../../customers/_api/client'
import type { LastmileUser, UserStatusScope } from '../_types/user'
import type { UserActivityEvent, UserSession } from '../[id]/_types/user-detail'
import {
  mapBackendActivity,
  mapBackendRole,
  mapBackendSession,
  mapBackendUser,
  mapStatusScopeToBackend,
  mapSummaryToKpi,
  mapSummaryToStatusCounts,
  type RoleOption,
} from '../_lib/map-user'

export type UsersListQuery = {
  page: number
  pageSize: number
  search?: string
  statusScope?: UserStatusScope
}

export type UsersListResult = {
  items: LastmileUser[]
  total: number
  page: number
  pageSize: number
  summary: Record<string, unknown>
  statusCounts: Record<UserStatusScope, number>
  kpi: ReturnType<typeof mapSummaryToKpi>
}

export async function fetchUsersList(
  query: UsersListQuery
): Promise<
  | { success: true; data: UsersListResult }
  | { success: false; error: string; code?: string }
> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  })

  if (query.search?.trim()) params.set('search', query.search.trim())
  if (query.statusScope && query.statusScope !== 'all') {
    params.set('statusScope', query.statusScope)
  }

  const result = await lastmileClientRequest<{
    items?: unknown[]
    total?: number
    page?: number
    pageSize?: number
    summary?: Record<string, unknown>
  }>(`/api/lastmile/users?${params.toString()}`, { method: 'GET' })

  if (!result.success) return result

  const payload = result.data ?? {}
  const rawItems = Array.isArray(payload.items) ? payload.items : []
  const items = rawItems
    .map((item) => mapBackendUser(item))
    .filter((item): item is LastmileUser => Boolean(item))

  const summary = payload.summary ?? {}
  const statusCounts = mapSummaryToStatusCounts(summary)

  return {
    success: true,
    data: {
      items,
      total: Number(payload.total ?? items.length),
      page: Number(payload.page ?? query.page),
      pageSize: Number(payload.pageSize ?? query.pageSize),
      summary,
      statusCounts,
      kpi: mapSummaryToKpi(summary, items),
    },
  }
}

export async function fetchUserDetail(
  id: string
): Promise<
  | { success: true; data: LastmileUser }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<unknown>(`/api/lastmile/users/${encodeURIComponent(id)}`, {
    method: 'GET',
  })

  if (!result.success) return result

  const user = mapBackendUser(result.data)
  if (!user) {
    return { success: false, error: 'Kullanıcı bulunamadı.' }
  }

  return { success: true, data: user }
}

export async function fetchUserActivity(
  userId: string,
  page = 1,
  pageSize = 20
): Promise<
  | { success: true; data: UserActivityEvent[] }
  | { success: false; error: string; code?: string }
> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  const result = await lastmileClientRequest<{ items?: unknown[] }>(
    `/api/lastmile/users/${encodeURIComponent(userId)}/activity?${params.toString()}`,
    { method: 'GET' }
  )

  if (!result.success) return result

  const rawItems = Array.isArray(result.data?.items) ? result.data.items : []
  const items = rawItems
    .map((item) => mapBackendActivity(item))
    .filter((item): item is UserActivityEvent => Boolean(item))

  return { success: true, data: items }
}

export async function fetchUserSessions(
  userId: string
): Promise<
  | { success: true; data: UserSession[] }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<unknown[]>(
    `/api/lastmile/users/${encodeURIComponent(userId)}/sessions`,
    { method: 'GET' }
  )

  if (!result.success) return result

  const rawItems = Array.isArray(result.data) ? result.data : []
  const items = rawItems
    .map((item) => mapBackendSession(item))
    .filter((item): item is UserSession => Boolean(item))

  return { success: true, data: items }
}

export async function fetchRoles(): Promise<
  | { success: true; data: RoleOption[] }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<{ items?: unknown[] }>(
    '/api/lastmile/users/roles?page=1&pageSize=100',
    { method: 'GET' }
  )

  if (!result.success) return result

  const rawItems = Array.isArray(result.data?.items) ? result.data.items : []
  const items = rawItems
    .map((item) => mapBackendRole(item))
    .filter((item): item is RoleOption => Boolean(item))

  return { success: true, data: items }
}

export async function inviteUser(
  input: Record<string, unknown>
): Promise<{ success: true; data: unknown } | { success: false; error: string; code?: string }> {
  return lastmileClientRequest('/api/lastmile/users/invite', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateUser(
  id: string,
  input: Record<string, unknown>
): Promise<{ success: true; data: unknown } | { success: false; error: string; code?: string }> {
  return lastmileClientRequest(`/api/lastmile/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function runUserAction(
  id: string,
  action: string,
  payload: Record<string, unknown> = {}
): Promise<{ success: true; data: unknown } | { success: false; error: string; code?: string }> {
  return lastmileClientRequest(`/api/lastmile/users/${encodeURIComponent(id)}/actions`, {
    method: 'POST',
    body: JSON.stringify({ action, ...payload }),
  })
}

export async function assignUserRole(id: string, roleId: string) {
  return runUserAction(id, 'assign-role', { roleId })
}

export async function updateUserPersonnelProfile(id: string, input: Record<string, unknown>) {
  return runUserAction(id, 'personnel-profile', { input })
}

export async function activateUser(id: string) {
  return runUserAction(id, 'activate')
}

export async function passiveUser(id: string) {
  return runUserAction(id, 'passive')
}

export async function suspendUser(id: string) {
  return runUserAction(id, 'suspend')
}

export async function deleteUser(id: string) {
  return runUserAction(id, 'delete')
}

export async function sendPasswordResetLink(id: string) {
  return runUserAction(id, 'password-reset')
}

export { mapStatusScopeToBackend }
