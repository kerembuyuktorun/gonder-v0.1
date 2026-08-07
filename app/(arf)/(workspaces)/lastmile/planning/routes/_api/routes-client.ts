/**
 * Aktif rota listesi / detay sayfası API istemcisi.
 */

import { lastmileClientRequest } from '../../../orders/new/_api/client'
import { mapBackendOrderToLastmileOrder } from '../../../orders/_lib/map-order-list'
import type { LastmileOrder } from '../../../orders/_types/order'
import type { OrderAuditLogItem } from '../../../orders/[id]/_types/order-detail'
import type { OrchestratorActiveRoute } from '../../route-orchestrator/_types/orchestrator'
import {
  applyMapDetailToRoute,
  mapOrchestratorListRoute,
} from '../../route-orchestrator/_api/map-orchestrator'
import { fetchRouteMapDetail } from '../../route-orchestrator/_api/orchestrator-client'
import {
  buildPlanningRoutesExportSearchParams,
  buildPlanningRoutesListSearchParams,
  type PlanningRoutesListQuery,
} from '../_lib/build-routes-list-query'
import { toPlanningRouteListItem } from '../_lib/map-planning-route'
import {
  extractRouteHeaderFields,
  type RouteHeaderFields,
} from '../_lib/format-route-detail'
import { queryRoutes } from '../_lib/query-routes'
import {
  mapRouteActivityFromBe,
  mapRouteNoteFromBe,
  visibilityToBe,
} from '../_lib/map-route-detail-api'
import type { PlanningRouteListItem } from '../_types/planning-route'
import type { RouteNoteItem, RouteNoteVisibility } from '../_types/planning-route-detail'

export type RouteEtaStop = {
  stopId: string | null
  sequence: number | null
  distanceFromPrevM: number | null
  durationFromPrevSec: number | null
  etaAt: string | null
}

export type RouteEtaPayload = {
  stops: RouteEtaStop[]
  remainingDistanceM: number | null
  remainingDurationSec: number | null
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function pickNullableNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const n = Number(value)
      if (Number.isFinite(n)) return n
    }
  }
  return null
}

export async function fetchActiveRoutesList(input?: {
  page?: number
  pageSize?: number
  search?: string
  operationDate?: string
}): Promise<
  | { success: true; data: { routes: OrchestratorActiveRoute[]; total: number } }
  | { success: false; error: string; code?: string }
> {
  const page = String(input?.page ?? 1)
  const pageSize = String(input?.pageSize ?? 50)
  const search = input?.search?.trim()

  // CREATED (planlandı) + STARTED (sahada) — BE tek status kabul ediyor
  const buildParams = (status: 'CREATED' | 'STARTED') => {
    const params = new URLSearchParams({
      status,
      view: 'orchestrator',
      page,
      pageSize,
    })
    if (search) params.set('search', search)
    if (input?.operationDate) params.set('operationDate', input.operationDate)
    return params
  }

  const [createdRes, startedRes] = await Promise.all([
    lastmileClientRequest<{ items?: unknown[]; total?: number }>(
      `/api/lastmile/routes?${buildParams('CREATED').toString()}`,
      { method: 'GET' }
    ),
    lastmileClientRequest<{ items?: unknown[]; total?: number }>(
      `/api/lastmile/routes?${buildParams('STARTED').toString()}`,
      { method: 'GET' }
    ),
  ])

  if (!createdRes.success && !startedRes.success) {
    return {
      success: false,
      error: createdRes.success === false ? createdRes.error : startedRes.error,
      code:
        createdRes.success === false ? createdRes.code : startedRes.code,
    }
  }

  const byId = new Map<string, OrchestratorActiveRoute>()
  for (const res of [createdRes, startedRes]) {
    if (!res.success) continue
    for (const raw of res.data.items ?? []) {
      const route = mapOrchestratorListRoute(raw)
      if (route) byId.set(route.id, route)
    }
  }

  const routes = [...byId.values()].sort((a, b) => {
    // Sahadaki (aktif) üstte, sonra planlandı
    if (a.status !== b.status) {
      if (a.status === 'aktif') return -1
      if (b.status === 'aktif') return 1
    }
    return a.label.localeCompare(b.label, 'tr')
  })

  const total =
    (createdRes.success ? Number(createdRes.data.total ?? 0) : 0) +
    (startedRes.success ? Number(startedRes.data.total ?? 0) : 0)

  return {
    success: true,
    data: {
      routes,
      total: total || routes.length,
    },
  }
}

/** @deprecated Use fetchActiveRoutesList */
export const fetchActiveStartedRoutes = fetchActiveRoutesList

const ORCHESTRATOR_LIST_STATUSES = ['CREATED', 'STARTED', 'COMPLETED', 'CANCELLED'] as const

function mapRawRowsToPlanningListItems(items: unknown[]): PlanningRouteListItem[] {
  return items
    .map((raw) => {
      const base = mapOrchestratorListRoute(raw)
      if (!base) return null
      return toPlanningRouteListItem(base, raw)
    })
    .filter((route): route is PlanningRouteListItem => route != null)
}

function paginatePlanningRoutesClientSide(
  pool: PlanningRouteListItem[],
  query: PlanningRoutesListQuery
): { routes: PlanningRouteListItem[]; total: number; page: number; pageSize: number } {
  const { rows, totalRows } = queryRoutes({
    rows: pool,
    statusScope: query.statusScope ?? 'all',
    dateScope: query.dateScope ?? 'all',
    pagination: {
      pageIndex: Math.max(0, query.page - 1),
      pageSize: query.pageSize,
    },
    sorting: query.sorting ?? [],
    columnFilters: query.columnFilters ?? [],
    globalFilter: query.search ?? '',
  })

  return {
    routes: rows,
    total: totalRows,
    page: query.page,
    pageSize: query.pageSize,
  }
}

/**
 * Tüm statüler — view=orchestrator, tarih filtresi yok.
 * Eski planlı rotalar (RT-0001 vb.) routeList view'da gelmeyebilir; bu yol kanıtlanmış.
 */
async function fetchPlanningRoutesOrchestratorPool(input?: {
  search?: string
  pageSizePerStatus?: number
}): Promise<
  | { success: true; data: { routes: PlanningRouteListItem[] } }
  | { success: false; error: string; code?: string }
> {
  const pageSize = String(Math.min(100, Math.max(1, input?.pageSizePerStatus ?? 100)))
  const search = input?.search?.trim()

  const responses = await Promise.all(
    ORCHESTRATOR_LIST_STATUSES.map((status) => {
      const params = new URLSearchParams({
        status,
        view: 'orchestrator',
        page: '1',
        pageSize,
      })
      if (search) params.set('search', search)
      return lastmileClientRequest<{ items?: unknown[]; total?: number }>(
        `/api/lastmile/routes?${params.toString()}`,
        { method: 'GET' }
      )
    })
  )

  if (responses.every((res) => !res.success)) {
    const first = responses.find((res) => !res.success)
    return {
      success: false,
      error: first && !first.success ? first.error : 'Rota listesi yüklenemedi.',
      code: first && !first.success ? first.code : undefined,
    }
  }

  const byId = new Map<string, PlanningRouteListItem>()
  for (const res of responses) {
    if (!res.success) continue
    for (const route of mapRawRowsToPlanningListItems(res.data.items ?? [])) {
      byId.set(route.id, route)
    }
  }

  const routes = [...byId.values()].sort((a, b) => {
    if (a.status !== b.status) {
      if (a.status === 'aktif') return -1
      if (b.status === 'aktif') return 1
    }
    const dateCmp = b.operationDate.localeCompare(a.operationDate)
    if (dateCmp !== 0) return dateCmp
    return a.label.localeCompare(b.label, 'tr')
  })

  return { success: true, data: { routes } }
}

function shouldPreferOrchestratorPool(query: PlanningRoutesListQuery): boolean {
  if (query.statusScope && query.statusScope !== 'all') return false
  if (query.dateScope && query.dateScope !== 'all') return false

  const hasRouteTypeFilter = (query.columnFilters ?? []).some((filter) => {
    if (filter.id !== 'routeType') return false
    const values = Array.isArray(filter.value) ? (filter.value as string[]) : []
    return values.length > 0
  })

  return !hasRouteTypeFilter
}

/**
 * Rota Listesi — view=routeList, sunucu tarafı filtre/sıralama/sayfalama.
 * Filtresiz listede orchestrator birleşik havuz (eski rotalar dahil).
 */
export async function fetchPlanningRoutesList(query: PlanningRoutesListQuery): Promise<
  | { success: true; data: { routes: PlanningRouteListItem[]; total: number; page: number; pageSize: number } }
  | { success: false; error: string; code?: string }
> {
  if (shouldPreferOrchestratorPool(query)) {
    const pool = await fetchPlanningRoutesOrchestratorPool({ search: query.search })
    if (pool.success) {
      return {
        success: true,
        data: paginatePlanningRoutesClientSide(pool.data.routes, query),
      }
    }
  }

  const params = buildPlanningRoutesListSearchParams(query)

  const result = await lastmileClientRequest<{
    items?: unknown[]
    total?: number
    page?: number
    pageSize?: number
  }>(`/api/lastmile/routes?${params.toString()}`, { method: 'GET' })

  if (!result.success) {
    const pool = await fetchPlanningRoutesOrchestratorPool({ search: query.search })
    if (pool.success) {
      return {
        success: true,
        data: paginatePlanningRoutesClientSide(pool.data.routes, query),
      }
    }
    return { success: false, error: result.error, code: result.code }
  }

  const rawItems = result.data.items ?? []
  let routes = mapRawRowsToPlanningListItems(rawItems)

  if (routes.length === 0 && rawItems.length > 0) {
    const pool = await fetchPlanningRoutesOrchestratorPool({ search: query.search })
    if (pool.success) {
      return {
        success: true,
        data: paginatePlanningRoutesClientSide(pool.data.routes, query),
      }
    }
  }

  if (routes.length === 0 && shouldPreferOrchestratorPool(query)) {
    const pool = await fetchPlanningRoutesOrchestratorPool({ search: query.search })
    if (pool.success && pool.data.routes.length > 0) {
      return {
        success: true,
        data: paginatePlanningRoutesClientSide(pool.data.routes, query),
      }
    }
  }

  return {
    success: true,
    data: {
      routes,
      total: Number(result.data.total ?? routes.length),
      page: Number(result.data.page ?? query.page),
      pageSize: Number(result.data.pageSize ?? query.pageSize),
    },
  }
}

/** KPI / sekme sayaçları — orchestrator havuzu (tarih filtresi yok, max 100×4 rota) */
export async function fetchPlanningRoutesSummary(): Promise<
  | { success: true; data: { routes: PlanningRouteListItem[]; total: number } }
  | { success: false; error: string; code?: string }
> {
  const pool = await fetchPlanningRoutesOrchestratorPool({ pageSizePerStatus: 100 })
  if (!pool.success) return pool
  return {
    success: true,
    data: { routes: pool.data.routes, total: pool.data.routes.length },
  }
}

export async function exportPlanningRoutes(
  query: Omit<PlanningRoutesListQuery, 'page' | 'pageSize'>
): Promise<
  | {
      success: true
      data: { filename: string; contentType: string; base64: string; rowCount: number }
    }
  | { success: false; error: string; code?: string }
> {
  const params = buildPlanningRoutesExportSearchParams(query)
  const result = await lastmileClientRequest<{
    filename?: string
    contentType?: string
    base64?: string
    rowCount?: number
  }>(`/api/lastmile/routes/export?${params.toString()}`, { method: 'GET' })

  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }

  return {
    success: true,
    data: {
      filename: result.data.filename ?? 'rota-listesi.xlsx',
      contentType:
        result.data.contentType ??
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      base64: result.data.base64 ?? '',
      rowCount: Number(result.data.rowCount ?? 0),
    },
  }
}

export function downloadExportedFile(input: {
  filename: string
  contentType: string
  base64: string
}) {
  const binary = atob(input.base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: input.contentType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = input.filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function fetchOrdersByRouteId(routeId: string): Promise<
  | { success: true; data: { orders: LastmileOrder[]; total: number } }
  | { success: false; error: string; code?: string }
> {
  const params = new URLSearchParams({
    routeId,
    page: '1',
    pageSize: '100',
  })

  const result = await lastmileClientRequest<{
    orders?: unknown[]
    items?: unknown[]
    total?: number
  }>(`/api/lastmile/orders?${params.toString()}`, { method: 'GET' })

  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }

  const rows = result.data.orders ?? result.data.items ?? []
  const orders = rows
    .map((row) => mapBackendOrderToLastmileOrder(row))
    .filter((order) => Boolean(order.id))

  return {
    success: true,
    data: {
      orders,
      total: Number(result.data.total ?? orders.length),
    },
  }
}

export async function fetchRouteNotes(routeId: string): Promise<
  | { success: true; data: { items: RouteNoteItem[]; total: number } }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<{ items?: unknown[]; total?: number }>(
    `/api/lastmile/routes/${encodeURIComponent(routeId)}/notes?page=1&pageSize=50`,
    { method: 'GET' }
  )

  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }

  const items = (result.data.items ?? [])
    .map((row) => mapRouteNoteFromBe(row))
    .filter((item): item is RouteNoteItem => item != null)

  return {
    success: true,
    data: { items, total: Number(result.data.total ?? items.length) },
  }
}

export async function createRouteNote(input: {
  routeId: string
  note: string
  visibility: RouteNoteVisibility
}): Promise<
  | { success: true; data: RouteNoteItem }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/routes/${encodeURIComponent(input.routeId)}/notes`,
    {
      method: 'POST',
      body: JSON.stringify({
        note: input.note,
        visibility: visibilityToBe(input.visibility),
      }),
    }
  )

  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }

  const mapped = mapRouteNoteFromBe(result.data)
  if (!mapped) {
    return { success: false, error: 'Not yanıtı okunamadı.' }
  }

  return { success: true, data: mapped }
}

export async function updateRouteNote(input: {
  noteId: string
  note: string
  visibility?: RouteNoteVisibility
}): Promise<
  | { success: true; data: RouteNoteItem }
  | { success: false; error: string; code?: string }
> {
  const body: Record<string, string> = { note: input.note }
  if (input.visibility) {
    body.visibility = visibilityToBe(input.visibility)
  }

  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/route-notes/${encodeURIComponent(input.noteId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  )

  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }

  const mapped = mapRouteNoteFromBe(result.data)
  if (!mapped) {
    return { success: false, error: 'Not yanıtı okunamadı.' }
  }

  return { success: true, data: mapped }
}

export async function deleteRouteNote(noteId: string): Promise<
  | { success: true }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/route-notes/${encodeURIComponent(noteId)}`,
    { method: 'DELETE' }
  )

  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }

  return { success: true }
}

export async function fetchRouteActivity(routeId: string): Promise<
  | { success: true; data: { items: OrderAuditLogItem[]; total: number } }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<{ items?: unknown[]; total?: number }>(
    `/api/lastmile/routes/${encodeURIComponent(routeId)}/activity`,
    { method: 'GET' }
  )

  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }

  const items = (result.data.items ?? [])
    .map((row) => mapRouteActivityFromBe(row))
    .filter((item): item is OrderAuditLogItem => item != null)

  return {
    success: true,
    data: { items, total: Number(result.data.total ?? items.length) },
  }
}

export type { RouteHeaderFields } from '../_lib/format-route-detail'

export async function fetchRouteDetail(routeId: string): Promise<
  | { success: true; data: { route: OrchestratorActiveRoute; header: RouteHeaderFields } }
  | { success: false; error: string; code?: string }
> {
  const [routeRes, mapRes] = await Promise.all([
    lastmileClientRequest<unknown>(
      `/api/lastmile/routes/${encodeURIComponent(routeId)}`,
      { method: 'GET' }
    ),
    fetchRouteMapDetail(routeId),
  ])

  if (!routeRes.success) {
    return { success: false, error: routeRes.error, code: routeRes.code }
  }

  const base = mapOrchestratorListRoute(routeRes.data)
  if (!base) {
    return { success: false, error: 'Rota verisi okunamadı.' }
  }

  const route =
    mapRes.success && mapRes.data
      ? applyMapDetailToRoute(base, mapRes.data)
      : base

  const header = extractRouteHeaderFields(
    routeRes.data,
    mapRes.success ? mapRes.data : undefined,
    route
  )

  return { success: true, data: { route, header } }
}

export async function fetchRouteEta(routeId: string): Promise<
  | { success: true; data: RouteEtaPayload }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/routes/${encodeURIComponent(routeId)}/eta`,
    { method: 'GET' }
  )
  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }

  const root = asRecord(result.data)
  const totals = asRecord(root.totals)
  const stopsRaw = Array.isArray(root.stops) ? root.stops : []

  return {
    success: true,
    data: {
      remainingDistanceM: pickNullableNumber(
        totals.remainingDistanceM,
        root.remainingDistanceM
      ),
      remainingDurationSec: pickNullableNumber(
        totals.remainingDurationSec,
        root.remainingDurationSec
      ),
      stops: stopsRaw.map((item, index) => {
        const row = asRecord(item)
        return {
          stopId: pickString(row.stopId, row.routeItemId, row.id) || null,
          sequence: pickNullableNumber(row.sequence, index),
          distanceFromPrevM: pickNullableNumber(
            row.distanceFromPrevM,
            row.distance
          ),
          durationFromPrevSec: pickNullableNumber(
            row.durationFromPrevSec,
            row.duration
          ),
          etaAt: pickString(row.etaAt, row.estimatedArrival) || null,
        }
      }),
    },
  }
}
