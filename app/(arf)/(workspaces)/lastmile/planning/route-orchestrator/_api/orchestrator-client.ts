/**
 * Canlı orkestratör API istemcisi.
 * Demo mod bu dosyayı çağırmaz.
 *
 * Sözleşme: docs/route-orchestrator-fe-api.md
 */

import { sanitizeLastmileError } from '../../../_lib/sanitize-lastmile-error'
import { lastmileClientRequest } from '../../../orders/new/_api/client'
import type {
  OptimizeResult,
  OptimizeSettings,
  OrchestratorActiveRoute,
  OrchestratorOrder,
  OrchestratorVehicle,
} from '../_types/orchestrator'
import type { ReoptimizeActiveRouteResult } from '../_lib/reoptimize-active-route'
import {
  applyMapDetailToRoute,
  mapDraftOptimizeRoute,
  mapOptimizeResult,
  mapOrderToOrchestratorOrder,
  mapOrchestratorListRoute,
  mapPlanningVehicle,
  toBackendSettings,
} from './map-orchestrator'

export type PlanningContext = {
  orders: OrchestratorOrder[]
  vehicles: OrchestratorVehicle[]
  activeRoutes: OrchestratorActiveRoute[]
}

export type OptimizeJobCreateInput = {
  operationDate: string
  orderIds: string[]
  vehicleIds: string[]
  settings: OptimizeSettings
  occupiedColors?: string[]
  /** Customer scope for tenant dispatcher attach/apply */
  customerId?: string
}

export type OptimizeJobState = {
  jobId: string
  status: string
  version: number
  result: OptimizeResult | null
  errorMessage: string | null
}

export type ApplySolutionResult = {
  approvedRoutes: OrchestratorActiveRoute[]
  approvedOrderIds: string[]
  approvedVehicleIds: string[]
  remainingResult: OptimizeResult | null
  /** Active job for subsequent apply/reject (child job when partial) */
  jobId: string | null
  /** Version to send on the next mutation */
  version: number | null
  status: string | null
  /** @deprecated Prefer jobId — kept as alias */
  nextJobId: string | null
  /** @deprecated Prefer version — kept as alias */
  nextJobVersion: number | null
}

export type RejectSolutionResult = {
  jobId: string | null
  version: number | null
  status: string
  remainingResult: OptimizeResult | null
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

function pickNullableVersion(...values: unknown[]): number | null {
  for (const value of values) {
    if (value == null || value === '') continue
    const n = typeof value === 'number' ? value : Number(value)
    if (Number.isFinite(n)) return n
  }
  return null
}

/** Prefer BE jobId/version; fall back to legacy nextJobId/nextJobVersion */
function pickJobCursor(row: Record<string, unknown>): {
  jobId: string | null
  version: number | null
  status: string | null
} {
  const jobId =
    pickString(row.jobId, row.nextJobId, row.activeJobId) || null
  const version = pickNullableVersion(
    row.version,
    row.nextJobVersion,
    row.nextVersion
  )
  const status = pickString(row.status) || null
  return { jobId, version, status }
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function fetchOrchestratorRoutesForScope(input: {
  operationDate: string
  scope: 'today' | 'carryover'
}): Promise<
  | { success: true; routes: OrchestratorActiveRoute[] }
  | { success: false; error: string; code?: string }
> {
  const routeParams = new URLSearchParams({
    scope: input.scope,
    view: 'orchestrator',
    operationDate: input.operationDate,
    page: '1',
    pageSize: '50',
  })

  const routesRes = await lastmileClientRequest<{ items?: unknown[] }>(
    `/api/lastmile/routes?${routeParams.toString()}`,
    { method: 'GET' }
  )
  if (!routesRes.success) {
    return { success: false, error: routesRes.error, code: routesRes.code }
  }

  const listRoutes = (routesRes.data.items ?? [])
    .map(mapOrchestratorListRoute)
    .filter((route): route is OrchestratorActiveRoute => route != null)

  const routes = await Promise.all(
    listRoutes.map(async (route) => {
      const detail = await fetchRouteMapDetail(route.id)
      if (!detail.success || !detail.data) return route
      return applyMapDetailToRoute(route, detail.data)
    })
  )

  return { success: true, routes }
}

function mergeRoutesById(
  ...groups: OrchestratorActiveRoute[][]
): OrchestratorActiveRoute[] {
  const byId = new Map<string, OrchestratorActiveRoute>()
  for (const group of groups) {
    for (const route of group) {
      if (!byId.has(route.id)) byId.set(route.id, route)
    }
  }
  return [...byId.values()]
}

/**
 * Loads pool + vehicles + active routes for both today and carryover scopes.
 * Tab counts/filters are applied client-side from the merged list.
 */
export async function loadPlanningContext(input: {
  operationDate: string
  respectShifts?: boolean
  /** @deprecated Both scopes are always loaded; kept for call-site compatibility */
  activeRouteScope?: 'today' | 'carryover'
}): Promise<
  | { success: true; data: PlanningContext }
  | { success: false; error: string; code?: string }
> {
  const orderParams = new URLSearchParams({
    poolScope: 'PLANNABLE',
    operationDate: input.operationDate,
    page: '1',
    pageSize: '100',
  })
  const vehicleParams = new URLSearchParams({
    operationDate: input.operationDate,
  })
  if (input.respectShifts !== undefined) {
    vehicleParams.set('respectShifts', String(input.respectShifts))
  }

  const [ordersRes, vehiclesRes, todayRoutesRes, carryoverRoutesRes] =
    await Promise.all([
      lastmileClientRequest<{ orders?: unknown[]; items?: unknown[] }>(
        `/api/lastmile/orders?${orderParams.toString()}`,
        { method: 'GET' }
      ),
      lastmileClientRequest<{ vehicles?: unknown[] }>(
        `/api/lastmile/routes/planning-vehicles?${vehicleParams.toString()}`,
        { method: 'GET' }
      ),
      fetchOrchestratorRoutesForScope({
        operationDate: input.operationDate,
        scope: 'today',
      }),
      fetchOrchestratorRoutesForScope({
        operationDate: input.operationDate,
        scope: 'carryover',
      }),
    ])

  if (!ordersRes.success) {
    return { success: false, error: ordersRes.error, code: ordersRes.code }
  }
  if (!vehiclesRes.success) {
    return { success: false, error: vehiclesRes.error, code: vehiclesRes.code }
  }
  if (!todayRoutesRes.success) {
    return {
      success: false,
      error: todayRoutesRes.error,
      code: todayRoutesRes.code,
    }
  }
  if (!carryoverRoutesRes.success) {
    return {
      success: false,
      error: carryoverRoutesRes.error,
      code: carryoverRoutesRes.code,
    }
  }

  const orderRows = ordersRes.data.orders ?? ordersRes.data.items ?? []
  const orders = orderRows
    .map(mapOrderToOrchestratorOrder)
    .filter((order): order is OrchestratorOrder => order != null)

  const vehicles = (vehiclesRes.data.vehicles ?? [])
    .map(mapPlanningVehicle)
    .filter((vehicle): vehicle is OrchestratorVehicle => vehicle != null)

  const activeRoutes = mergeRoutesById(
    todayRoutesRes.routes,
    carryoverRoutesRes.routes
  )

  return {
    success: true,
    data: { orders, vehicles, activeRoutes },
  }
}

export async function fetchRouteMapDetail(routeId: string): Promise<
  | { success: true; data: unknown }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/routes/${encodeURIComponent(routeId)}/map-detail`,
    { method: 'GET' }
  )
  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }
  return { success: true, data: result.data }
}

export async function createOptimizeJob(
  input: OptimizeJobCreateInput
): Promise<
  | { success: true; data: { jobId: string; status: string; result?: unknown } }
  | { success: false; error: string; code?: string }
> {
  const idempotencyKey =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `opt-${Date.now()}`

  const result = await lastmileClientRequest<{
    jobId?: string
    id?: string
    status?: string
    result?: unknown
  }>('/api/lastmile/routes/optimize-jobs', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({
      orderIds: input.orderIds,
      vehicleIds: input.vehicleIds,
      operationDate: input.operationDate,
      settings: toBackendSettings(input.settings),
      occupiedColors: input.occupiedColors,
      ...(input.customerId ? { customerId: input.customerId } : {}),
    }),
  })

  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }

  const jobId = pickString(result.data.jobId, result.data.id)
  if (!jobId) {
    return { success: false, error: 'Optimize job id alınamadı.' }
  }

  return {
    success: true,
    data: {
      jobId,
      status: pickString(result.data.status, 'QUEUED'),
      result: result.data.result,
    },
  }
}

export async function getOptimizeJob(
  jobId: string,
  vehicles: OrchestratorVehicle[]
): Promise<{ success: true; data: OptimizeJobState } | { success: false; error: string; code?: string }> {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/routes/optimize-jobs/${encodeURIComponent(jobId)}`,
    { method: 'GET' }
  )
  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }

  const row = asRecord(result.data)
  const status = pickString(row.status, 'QUEUED')
  const errorNode = asRecord(row.error)
  const resultNode = row.result

  return {
    success: true,
    data: {
      jobId: pickString(row.id, row.jobId, jobId),
      status,
      version: Number(row.version ?? 0) || 0,
      result:
        resultNode && status === 'COMPLETED'
          ? mapOptimizeResult(resultNode, vehicles)
          : null,
      errorMessage: (() => {
        const raw =
          pickString(errorNode.message, errorNode.code, row.error) || null
        return raw
          ? sanitizeLastmileError(raw, pickString(errorNode.code, row.code) || null)
          : null
      })(),
    },
  }
}

export async function pollOptimizeJobUntilDone(input: {
  jobId: string
  vehicles: OrchestratorVehicle[]
  intervalMs?: number
  maxAttempts?: number
}): Promise<
  | { success: true; data: OptimizeJobState }
  | { success: false; error: string; code?: string }
> {
  const intervalMs = input.intervalMs ?? 1500
  const maxAttempts = input.maxAttempts ?? 80

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const current = await getOptimizeJob(input.jobId, input.vehicles)
    if (!current.success) return current

    const status = current.data.status.toUpperCase()
    if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELED') {
      if (status === 'FAILED') {
        return {
          success: false,
          error: current.data.errorMessage || 'Optimizasyon başarısız.',
        }
      }
      if (status === 'CANCELED') {
        return { success: false, error: 'Optimizasyon iptal edildi.' }
      }
      if (!current.data.result) {
        return { success: false, error: 'Optimizasyon sonucu boş döndü.' }
      }
      return current
    }

    await sleep(intervalMs)
  }

  return { success: false, error: 'Optimizasyon zaman aşımına uğradı.' }
}

export async function cancelOptimizeJob(jobId: string): Promise<
  | { success: true }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/routes/optimize-jobs/${encodeURIComponent(jobId)}/cancel`,
    { method: 'POST', body: JSON.stringify({}) }
  )
  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }
  return { success: true }
}

export async function applyOptimizeSolution(input: {
  jobId: string
  operationDate: string
  routeIds?: string[]
  version?: number
  vehicles: OrchestratorVehicle[]
  /** Optional filter only — not required for tenant-wide apply */
  customerId?: string
  senderContactId?: string
}): Promise<
  | { success: true; data: ApplySolutionResult }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<unknown>(
    '/api/lastmile/routes/apply-solution',
    {
      method: 'POST',
      body: JSON.stringify({
        jobId: input.jobId,
        routeIds: input.routeIds,
        operationDate: input.operationDate,
        version: input.version,
        ...(input.customerId ? { customerId: input.customerId } : {}),
        ...(input.senderContactId
          ? { senderContactId: input.senderContactId }
          : {}),
      }),
    }
  )

  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }

  const row = asRecord(result.data)
  const approvedRaw = Array.isArray(row.approvedRoutes) ? row.approvedRoutes : []
  const approvedRoutes = approvedRaw
    .map(mapOrchestratorListRoute)
    .filter((route): route is OrchestratorActiveRoute => route != null)

  const remainingRaw = row.remainingResult
  const remainingResult =
    remainingRaw == null
      ? null
      : mapOptimizeResult(remainingRaw, input.vehicles)

  const cursor = pickJobCursor(row)

  return {
    success: true,
    data: {
      approvedRoutes,
      approvedOrderIds: Array.isArray(row.approvedOrderIds)
        ? row.approvedOrderIds.map(String)
        : [],
      approvedVehicleIds: Array.isArray(row.approvedVehicleIds)
        ? row.approvedVehicleIds.map(String)
        : [],
      remainingResult,
      jobId: cursor.jobId,
      version: cursor.version,
      status: cursor.status,
      nextJobId: cursor.jobId,
      nextJobVersion: cursor.version,
    },
  }
}

export async function rejectOptimizeSolution(input: {
  jobId: string
  routeIds?: string[]
  version?: number
  vehicles: OrchestratorVehicle[]
}): Promise<
  | { success: true; data: RejectSolutionResult }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<unknown>(
    '/api/lastmile/routes/reject-solution',
    {
      method: 'POST',
      body: JSON.stringify({
        jobId: input.jobId,
        routeIds: input.routeIds,
        version: input.version,
      }),
    }
  )

  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }

  const row = asRecord(result.data)
  const remainingRaw = row.remainingResult
  const cursor = pickJobCursor(row)

  return {
    success: true,
    data: {
      jobId: cursor.jobId,
      version: cursor.version,
      status: cursor.status ?? pickString(row.status),
      remainingResult:
        remainingRaw == null
          ? null
          : mapOptimizeResult(remainingRaw, input.vehicles),
    },
  }
}

export async function removeOrdersFromPendingRoute(input: {
  jobId: string
  routeId: string
  orderIds: string[]
  version?: number
  vehicles: OrchestratorVehicle[]
}): Promise<
  | { success: true; data: { version: number; result: OptimizeResult } }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/routes/optimize-jobs/${encodeURIComponent(input.jobId)}/pending-routes/${encodeURIComponent(input.routeId)}/remove-orders`,
    {
      method: 'POST',
      body: JSON.stringify({
        orderIds: input.orderIds,
        version: input.version,
      }),
    }
  )
  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }

  const row = asRecord(result.data)
  const routesPayload = Array.isArray(row.routes)
    ? { routes: row.routes, unmatchedOrders: row.unmatchedOrders ?? [] }
    : row.result ?? row

  return {
    success: true,
    data: {
      version: Number(row.version ?? input.version ?? 0) || 0,
      result: mapOptimizeResult(routesPayload, input.vehicles),
    },
  }
}

export async function reorderPendingRouteStopsApi(input: {
  jobId: string
  routeId: string
  orderedStopIds: string[]
  version?: number
  vehicles: OrchestratorVehicle[]
}): Promise<
  | { success: true; data: { version: number; result: OptimizeResult } }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/routes/optimize-jobs/${encodeURIComponent(input.jobId)}/pending-routes/${encodeURIComponent(input.routeId)}/reorder-stops`,
    {
      method: 'POST',
      body: JSON.stringify({
        orderedStopIds: input.orderedStopIds,
        version: input.version,
        recalculateGeometry: true,
      }),
    }
  )
  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }

  const row = asRecord(result.data)
  const routesPayload = Array.isArray(row.routes)
    ? { routes: row.routes, unmatchedOrders: row.unmatchedOrders ?? [] }
    : row.result ?? row

  return {
    success: true,
    data: {
      version: Number(row.version ?? input.version ?? 0) || 0,
      result: mapOptimizeResult(routesPayload, input.vehicles),
    },
  }
}

export async function removeOrdersFromActiveRouteApi(input: {
  routeId: string
  orderIds: string[]
  version?: number
}): Promise<{ success: true; data: unknown } | { success: false; error: string; code?: string }> {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/routes/${encodeURIComponent(input.routeId)}/remove-orders`,
    {
      method: 'POST',
      body: JSON.stringify({
        orderIds: input.orderIds,
        version: input.version,
      }),
    }
  )
  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }
  return { success: true, data: result.data }
}

export async function reorderActiveRouteStopsApi(input: {
  routeId: string
  orderedStopIds: string[]
  version?: number
}): Promise<{ success: true; data: unknown } | { success: false; error: string; code?: string }> {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/routes/${encodeURIComponent(input.routeId)}/reorder-items`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        orderedStopIds: input.orderedStopIds,
        orderedRouteItemIds: input.orderedStopIds,
        version: input.version,
        recalculate: true,
      }),
    }
  )
  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }
  return { success: true, data: result.data }
}

export async function previewReoptimizeActiveRoute(input: {
  route: OrchestratorActiveRoute
  orderIds: string[]
  orders: OrchestratorOrder[]
  vehicles: OrchestratorVehicle[]
  settings: OptimizeSettings
}): Promise<
  | { success: true; data: ReoptimizeActiveRouteResult }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/routes/${encodeURIComponent(input.route.id)}/reoptimize/preview`,
    {
      method: 'POST',
      body: JSON.stringify({
        orderIds: input.orderIds,
        settings: toBackendSettings(input.settings),
        version: input.route.version,
      }),
    }
  )
  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }

  const row = asRecord(result.data)
  const previewToken = pickString(row.previewToken)
  const vehicleById = new Map(input.vehicles.map((v) => [v.id, v]))
  const routesRaw = Array.isArray(row.routes) ? row.routes : []
  const proposed =
    routesRaw
      .map((route) => mapDraftOptimizeRoute(route, vehicleById))
      .find((route) => route != null) ?? null

  const orderById = new Map(input.orders.map((o) => [o.id, o]))
  const addedOrders = input.orderIds.map((id) => {
    const order = orderById.get(id)
    return {
      id,
      takipNo: order?.takip_no ?? id.slice(0, 8),
      musteri: order?.musteri ?? '—',
    }
  })

  const afterStops =
    proposed?.stops.filter((s) => s.kind === 'pickup' || s.kind === 'delivery') ??
    []

  const draftRoute: OrchestratorActiveRoute = proposed
    ? {
        ...input.route,
        orderIds: proposed.orderIds,
        orderCount: proposed.orderIds.length,
        stopCount: proposed.stopCount,
        distanceKm: proposed.distanceKm,
        durationMin: proposed.durationMin,
        polyline: proposed.polyline,
        stops: proposed.stops.map((stop) => ({
          ...stop,
          completed: false,
        })),
        color: proposed.color || input.route.color,
        version: Number(row.version ?? input.route.version ?? 0) || input.route.version,
      }
    : input.route

  return {
    success: true,
    data: {
      previewToken: previewToken || undefined,
      assignedOrderIds: input.orderIds,
      route: draftRoute,
      preview: {
        routeId: input.route.id,
        routeLabel: input.route.label,
        vehiclePlate: input.route.vehiclePlate,
        courierName: input.route.courierName,
        addedOrders,
        lockedStopCount: input.route.stops.filter((s) => s.completed).length,
        before: {
          orderCount: input.route.orderCount,
          stopCount: input.route.stopCount,
          distanceKm: input.route.distanceKm,
          durationMin: input.route.durationMin,
        },
        after: {
          orderCount: draftRoute.orderCount,
          stopCount: draftRoute.stopCount,
          distanceKm: draftRoute.distanceKm,
          durationMin: draftRoute.durationMin,
        },
        proposedIncompleteStops: afterStops.map((stop) => ({
          sequence: stop.sequence,
          kind: stop.kind === 'delivery' ? 'delivery' : 'pickup',
          title: stop.locationLabel ?? stop.label,
          address: stop.openAddress,
        })),
        warnings: Array.isArray(row.warnings)
          ? row.warnings.map(String)
          : proposed?.warnings ?? [],
      },
    },
  }
}

export async function applyReoptimizeActiveRoute(input: {
  routeId: string
  previewToken?: string
  orderIds: string[]
  settings: OptimizeSettings
  version?: number
}): Promise<{ success: true; data: unknown } | { success: false; error: string; code?: string }> {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/routes/${encodeURIComponent(input.routeId)}/reoptimize`,
    {
      method: 'POST',
      body: JSON.stringify({
        previewToken: input.previewToken,
        orderIds: input.orderIds,
        settings: toBackendSettings(input.settings),
        version: input.version,
      }),
    }
  )
  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }
  return { success: true, data: result.data }
}

export async function fetchLastMileSettings(): Promise<
  | { success: true; data: OptimizeSettings }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<OptimizeSettings>('/api/lastmile/settings', {
    method: 'GET',
  })
  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }
  return { success: true, data: result.data }
}

export async function upsertLastMileSettings(
  settings: OptimizeSettings
): Promise<
  | { success: true; data: OptimizeSettings }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<OptimizeSettings>('/api/lastmile/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  })
  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }
  return { success: true, data: result.data }
}
