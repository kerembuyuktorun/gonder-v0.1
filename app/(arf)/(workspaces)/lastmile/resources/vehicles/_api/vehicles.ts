import type { VehicleCreateFormValues } from '../_components/create-vehicle-modal'
import type {
  LastmileVehicle,
  VehicleDocumentMeta,
  VehicleListKpi,
  VehicleOwnership,
  VehicleStatusScope,
} from '../_types/vehicle'
import type { OperationScopeRow } from '../../../customers/[id]/_types/customer-detail'
import {
  buildVehicleWritePayload,
  mapBackendVehicle,
  mapDriverOption,
  mapVehicleOperationScopes,
  mapVehicleStats,
  mapVehicleStatusCounts,
  ownershipToParam,
  sortByToApi,
  statusScopeToParam,
  vehicleClassToParam,
  type CourierOption,
} from '../_lib/map-vehicle'
import { fetchSkillCatalog } from '../../../_api/skill-catalog'
import { toScopePayload } from '../../../customers/_lib/map-customer'
import type {
  VehicleActivityEvent,
  VehicleAssignmentRecord,
} from '../[id]/_types/vehicle-detail'
import { unwrapPaginationMeta, type PaginatedResult } from '../../_lib/pagination'
import { lastmileClientRequest } from './client'

export type VehicleListQuery = {
  page: number
  pageSize: number
  search?: string
  statusScope?: VehicleStatusScope
  ownership?: VehicleOwnership[]
  vehicleClass?: string[]
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export type VehicleListResult = {
  items: LastmileVehicle[]
  total: number
  page: number
  pageSize: number
}

export type VehicleDetailResult = {
  vehicle: LastmileVehicle
  operationScopes: OperationScopeRow[]
}

function unwrapPayload(data: Record<string, unknown> | undefined) {
  if (!data) return {}
  if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
    return data.data as Record<string, unknown>
  }
  return data
}

function unwrapList(data: Record<string, unknown> | undefined): unknown[] {
  if (!data) return []
  const nested = unwrapPayload(data)
  const candidates = [
    data.items,
    data.vehicles,
    nested.items,
    nested.vehicles,
  ]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }
  return []
}

export async function fetchVehiclesList(query: VehicleListQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  })

  if (query.search?.trim()) params.set('search', query.search.trim())

  const status = statusScopeToParam(query.statusScope)
  if (status) params.set('status', status)

  const ownership = ownershipToParam(query.ownership ?? [])
  if (ownership) params.set('ownership', ownership)

  const vehicleClass = vehicleClassToParam(query.vehicleClass ?? [])
  if (vehicleClass) params.set('vehicleClass', vehicleClass)

  if (query.sortBy) {
    params.set('sortBy', sortByToApi(query.sortBy))
    params.set('sortDir', query.sortDir === 'desc' ? 'desc' : 'asc')
  }

  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/vehicles?${params.toString()}`,
    { method: 'GET' }
  )

  if (!result.success) return result

  const payload = result.data ?? {}
  const nested = unwrapPayload(payload)
  const rawItems = unwrapList(payload)
  const items = rawItems
    .map((item) => mapBackendVehicle(item))
    .filter((item): item is LastmileVehicle => Boolean(item))

  const total = Number(payload.total ?? nested.total ?? items.length)
  const page = Number(payload.page ?? nested.page ?? query.page)
  const pageSize = Number(payload.pageSize ?? nested.pageSize ?? query.pageSize)

  return {
    success: true as const,
    data: {
      items,
      total: Number.isFinite(total) ? total : items.length,
      page: Number.isFinite(page) ? page : query.page,
      pageSize: Number.isFinite(pageSize) ? pageSize : query.pageSize,
    },
  }
}

export async function fetchVehicleStats(): Promise<
  | {
      success: true
      data: { kpi: VehicleListKpi; statusCounts: Record<VehicleStatusScope, number> }
    }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    '/api/lastmile/vehicles/stats',
    { method: 'GET' }
  )

  if (!result.success) return result

  const payload = result.data ?? {}
  const nested = unwrapPayload(payload)
  const kpi = mapVehicleStats(payload)
  const statusCounts = mapVehicleStatusCounts(
    nested.statusCounts ?? payload.statusCounts,
    kpi.total
  )

  return { success: true, data: { kpi, statusCounts } }
}

export async function fetchVehicleDetail(id: string) {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/vehicles/${encodeURIComponent(id)}`,
    { method: 'GET' }
  )

  if (!result.success) return result

  const entity = unwrapPayload(result.data)
  const vehicle = mapBackendVehicle(entity)
  if (!vehicle) {
    return { success: false as const, error: 'Araç verisi okunamadı.' }
  }

  const operationScopes = mapVehicleOperationScopes(
    entity.operationScopes ?? entity.operation_scopes
  )

  return {
    success: true as const,
    data: { vehicle, operationScopes } satisfies VehicleDetailResult,
  }
}

export async function fetchVehicleSkillCatalog() {
  return fetchSkillCatalog('vehicle')
}

export async function fetchVehicleDocumentDownloadUrl(vehicleId: string, documentId: string) {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/vehicles/${encodeURIComponent(vehicleId)}/documents/${encodeURIComponent(documentId)}/download`,
    { method: 'GET' }
  )

  if (!result.success) return result

  const payload = result.data ?? {}
  const url = typeof payload.url === 'string' ? payload.url : undefined

  return {
    success: true as const,
    data: {
      url: url ?? '',
      expiresAtUnix:
        typeof payload.expiresAtUnix === 'number' ? payload.expiresAtUnix : undefined,
    },
  }
}

export async function checkVehiclePlate(plaka: string, excludeId?: string) {
  const params = new URLSearchParams({ plaka: plaka.trim() })
  if (excludeId) params.set('excludeId', excludeId)

  return lastmileClientRequest<{ available: boolean; existingVehicleId?: string }>(
    `/api/lastmile/vehicles/check-plate?${params.toString()}`,
    { method: 'GET' }
  )
}

export async function createVehicle(values: VehicleCreateFormValues, documentIds: string[]) {
  const body = buildVehicleWritePayload(values, documentIds, { includeCourierAssignment: true })
  const result = await lastmileClientRequest<Record<string, unknown>>('/api/lastmile/vehicles', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  if (!result.success) return result

  const vehicle = mapBackendVehicle(unwrapPayload(result.data))
  if (!vehicle) {
    return { success: false as const, error: 'Araç oluşturuldu ancak yanıt okunamadı.' }
  }

  return { success: true as const, data: vehicle }
}

export async function updateVehicleOperationScopes(id: string, scopes: OperationScopeRow[]) {
  const body = { operationScopes: toScopePayload(scopes) }
  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/vehicles/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  )

  if (!result.success) return result

  const entity = unwrapPayload(result.data)
  const vehicle = mapBackendVehicle(entity)
  if (!vehicle) {
    return { success: false as const, error: 'Kapsam güncellendi ancak yanıt okunamadı.' }
  }

  const operationScopes = mapVehicleOperationScopes(
    entity.operationScopes ?? entity.operation_scopes
  )

  return {
    success: true as const,
    data: { vehicle, operationScopes } satisfies VehicleDetailResult,
  }
}

export async function updateVehicle(
  id: string,
  values: VehicleCreateFormValues,
  documentIds: string[]
) {
  const body = buildVehicleWritePayload(values, documentIds, { includeCourierAssignment: false })
  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/vehicles/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  )

  if (!result.success) return result

  const vehicle = mapBackendVehicle(unwrapPayload(result.data))
  if (!vehicle) {
    return { success: false as const, error: 'Araç güncellendi ancak yanıt okunamadı.' }
  }

  return { success: true as const, data: vehicle }
}

export async function uploadVehicleDocument(input: {
  fileName: string
  contentType: string
  contentBase64: string
  type: string
  vehicleId?: string
}) {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    '/api/lastmile/vehicles/documents/upload',
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  )

  if (!result.success) return result

  const doc = unwrapPayload(result.data)
  const id = String(doc.id ?? '')
  if (!id) {
    return { success: false as const, error: 'Dosya yüklendi ancak kimlik alınamadı.' }
  }

  return {
    success: true as const,
    data: {
      id,
      name: String(doc.name ?? doc.fileName ?? input.fileName),
      size: Number(doc.size ?? 0),
      mimeType: String(doc.mimeType ?? doc.contentType ?? input.contentType),
      type: String(doc.type ?? input.type) as VehicleDocumentMeta['type'],
      uploadedAt: String(doc.uploadedAt ?? new Date().toISOString()),
      uploadedBy: String(doc.uploadedBy ?? '—'),
    },
  }
}

export async function fetchDriverOptions(): Promise<
  | { success: true; data: CourierOption[] }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    '/api/lastmile/drivers?page=1&pageSize=100',
    { method: 'GET' }
  )

  if (!result.success) return result

  const payload = result.data ?? {}
  const nested = unwrapPayload(payload)
  const rawItems =
    (Array.isArray(payload.items) ? payload.items : null) ??
    (Array.isArray(payload.drivers) ? payload.drivers : null) ??
    (Array.isArray(nested.items) ? nested.items : null) ??
    (Array.isArray(nested.drivers) ? nested.drivers : null) ??
    []

  const seenIds = new Set<string>()
  const items = rawItems
    .map((item) => mapDriverOption(item))
    .filter((item): item is CourierOption => {
      if (!item) return false
      if (seenIds.has(item.id)) return false
      seenIds.add(item.id)
      return true
    })

  return { success: true, data: items }
}

export async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

export async function activateVehicle(id: string) {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/vehicles/${encodeURIComponent(id)}/activate`,
    { method: 'POST', body: JSON.stringify({}) }
  )

  if (!result.success) return result

  const vehicle = mapBackendVehicle(unwrapPayload(result.data))
  if (!vehicle) {
    return { success: false as const, error: 'Araç aktif edildi ancak yanıt okunamadı.' }
  }

  return { success: true as const, data: vehicle }
}

export async function passiveVehicle(id: string) {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/vehicles/${encodeURIComponent(id)}/passive`,
    { method: 'POST', body: JSON.stringify({}) }
  )

  if (!result.success) return result

  const vehicle = mapBackendVehicle(unwrapPayload(result.data))
  if (!vehicle) {
    return { success: false as const, error: 'Araç pasife alındı ancak yanıt okunamadı.' }
  }

  return { success: true as const, data: vehicle }
}

function mapVehicleAssignmentHistoryItem(raw: unknown): VehicleAssignmentRecord | null {
  const row =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {}
  const id = String(row.id ?? '').trim()
  const courierId = String(row.courierId ?? row.driverId ?? '').trim()
  if (!id || !courierId) return null

  return {
    id,
    courierId,
    courierName: String(row.courierName ?? row.driverName ?? '—'),
    startedAt: String(row.startedAt ?? ''),
    endedAt: row.endedAt ? String(row.endedAt) : null,
    note: row.note ? String(row.note) : undefined,
  }
}

function mapVehicleActivityEvent(raw: unknown): VehicleActivityEvent | null {
  const row =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {}
  const id = String(row.id ?? '').trim()
  if (!id) return null

  const meta =
    row.meta && typeof row.meta === 'object' && !Array.isArray(row.meta)
      ? (row.meta as Record<string, unknown>)
      : {}
  const detail =
    (typeof meta.detail === 'string' ? meta.detail : '') ||
    (typeof meta.message === 'string' ? meta.message : '') ||
    (Object.keys(meta).length > 0 ? JSON.stringify(meta) : undefined)

  return {
    id,
    kind: String(row.kind ?? 'updated') as VehicleActivityEvent['kind'],
    title: String(row.summary ?? row.title ?? 'Güncelleme'),
    detail: detail || undefined,
    at: String(row.createdAt ?? row.at ?? new Date().toISOString()),
    actor: typeof row.createdByName === 'string' ? row.createdByName : undefined,
    ip: typeof meta.ip === 'string' ? meta.ip : null,
  }
}

export async function fetchVehicleAssignmentHistory(
  id: string,
  page = 1,
  pageSize = 50
) {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/vehicles/${encodeURIComponent(id)}/assignment-history?page=${page}&pageSize=${pageSize}`,
    { method: 'GET' }
  )

  if (!result.success) return result

  const payload = result.data ?? {}
  const rawItems = unwrapList(payload)
  const items = rawItems
    .map((item) => mapVehicleAssignmentHistoryItem(item))
    .filter((item): item is VehicleAssignmentRecord => Boolean(item))

  const meta = unwrapPaginationMeta(payload, page, pageSize)

  return {
    success: true as const,
    data: {
      items,
      ...meta,
    } satisfies PaginatedResult<VehicleAssignmentRecord>,
  }
}

export async function fetchVehicleActivity(id: string, page = 1, pageSize = 50) {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/vehicles/${encodeURIComponent(id)}/activity?page=${page}&pageSize=${pageSize}`,
    { method: 'GET' }
  )

  if (!result.success) return result

  const payload = result.data ?? {}
  const rawItems = unwrapList(payload)
  const items = rawItems
    .map((item) => mapVehicleActivityEvent(item))
    .filter((item): item is VehicleActivityEvent => Boolean(item))
  const meta = unwrapPaginationMeta(payload, page, pageSize)

  return {
    success: true as const,
    data: {
      items,
      ...meta,
    } satisfies PaginatedResult<VehicleActivityEvent>,
  }
}

export async function updateVehicleAssignment(id: string, courierId: string | null) {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/vehicles/${encodeURIComponent(id)}/assignment`,
    {
      method: 'PATCH',
      body: JSON.stringify({ courierId }),
    }
  )

  if (!result.success) return result

  const vehicle = mapBackendVehicle(unwrapPayload(result.data))
  if (!vehicle) {
    return { success: false as const, error: 'Zimmet güncellendi ancak yanıt okunamadı.' }
  }

  return { success: true as const, data: vehicle }
}

export async function patchVehicleDocumentType(
  vehicleId: string,
  documentId: string,
  type: string
) {
  return lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/vehicles/${encodeURIComponent(vehicleId)}/documents/${encodeURIComponent(documentId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ type }),
    }
  )
}

export async function deleteOrphanDocument(documentId: string) {
  return lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/documents/${encodeURIComponent(documentId)}`,
    { method: 'DELETE' }
  )
}

export async function deleteVehicleDocument(vehicleId: string, documentId: string) {
  return lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/vehicles/${encodeURIComponent(vehicleId)}/documents/${encodeURIComponent(documentId)}`,
    { method: 'DELETE' }
  )
}
