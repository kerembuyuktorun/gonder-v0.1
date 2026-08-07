import type { CourierCreateFormValues } from '../_components/create-courier-modal'
import type {
  CourierListKpi,
  CourierOperationalStatus,
  CourierStatusScope,
  LastmileCourier,
} from '../_types/courier'
import type { CourierEmploymentType } from '../_types/courier'
import type {
  CourierActivityEvent,
  CourierVehicleAssignment,
} from '../[id]/_types/courier-detail'
import { lastmileClientRequest } from '../../vehicles/_api/client'
import {
  buildCourierWritePayload,
  mapActivityEvent,
  mapAssignmentHistoryItem,
  mapBackendCourier,
  mapCourierDocument,
  mapCourierStats,
  mapCourierStatusCounts,
  mapDriverSkillCatalogItem,
  sortByToApi,
  statusScopeToParam,
  employmentToParam,
  type DriverSkillCatalogItem,
} from '../_lib/map-courier'
import type { VehicleOption } from '../_lib/vehicle-options'
import { mapVehicleOptions } from '../_lib/vehicle-options'
import { mapBackendVehicle } from '../../vehicles/_lib/map-vehicle'
import type { CourierDocumentMeta } from '../_types/courier'
import { unwrapPaginationMeta, type PaginatedResult } from '../../_lib/pagination'

export type DriverListQuery = {
  page: number
  pageSize: number
  search?: string
  statusScope?: CourierStatusScope
  employment?: CourierEmploymentType[]
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export type DriverListResult = {
  items: LastmileCourier[]
  total: number
  page: number
  pageSize: number
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
  const candidates = [data.items, data.drivers, nested.items, nested.drivers]
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
  }
  return []
}

export async function fetchDriversList(query: DriverListQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  })

  if (query.search?.trim()) params.set('search', query.search.trim())

  const status = statusScopeToParam(query.statusScope)
  if (status) params.set('status', status)

  const employment = employmentToParam(query.employment ?? [])
  if (employment) params.set('employment', employment)

  if (query.sortBy) {
    params.set('sortBy', sortByToApi(query.sortBy))
    params.set('sortDir', query.sortDir === 'desc' ? 'desc' : 'asc')
  }

  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/drivers?${params.toString()}`,
    { method: 'GET' }
  )

  if (!result.success) return result

  const payload = result.data ?? {}
  const nested = unwrapPayload(payload)
  const rawItems = unwrapList(payload)
  const items = rawItems
    .map((item) => mapBackendCourier(item))
    .filter((item): item is LastmileCourier => Boolean(item))

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

export async function fetchDriverStats(): Promise<
  | {
      success: true
      data: { kpi: CourierListKpi; statusCounts: Record<CourierStatusScope, number> }
    }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    '/api/lastmile/drivers/stats',
    { method: 'GET' }
  )

  if (!result.success) return result

  const payload = result.data ?? {}
  const nested = unwrapPayload(payload)
  const kpi = mapCourierStats(payload)
  const statusCounts = mapCourierStatusCounts(
    nested.statusCounts ?? payload.statusCounts,
    kpi.total
  )

  return { success: true, data: { kpi, statusCounts } }
}

export async function fetchDriverDetail(id: string) {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/drivers/${encodeURIComponent(id)}`,
    { method: 'GET' }
  )

  if (!result.success) return result

  const courier = mapBackendCourier(unwrapPayload(result.data))
  if (!courier) {
    return { success: false as const, error: 'Kurye verisi okunamadı.' }
  }

  return { success: true as const, data: courier }
}

export async function createDriver(values: CourierCreateFormValues, documentIds: string[]) {
  const body = buildCourierWritePayload(values, documentIds)
  const result = await lastmileClientRequest<Record<string, unknown>>('/api/lastmile/drivers', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  if (!result.success) return result

  const courier = mapBackendCourier(unwrapPayload(result.data))
  if (!courier) {
    return { success: false as const, error: 'Kurye oluşturuldu ancak yanıt okunamadı.' }
  }

  return { success: true as const, data: courier }
}

export async function updateDriver(
  id: string,
  values: CourierCreateFormValues,
  documentIds: string[]
) {
  const body = buildCourierWritePayload(values, documentIds)
  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/drivers/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  )

  if (!result.success) return result

  const courier = mapBackendCourier(unwrapPayload(result.data))
  if (!courier) {
    return { success: false as const, error: 'Kurye güncellendi ancak yanıt okunamadı.' }
  }

  return { success: true as const, data: courier }
}

export async function activateDriver(id: string) {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/drivers/${encodeURIComponent(id)}/activate`,
    { method: 'POST', body: JSON.stringify({}) }
  )

  if (!result.success) return result

  const courier = mapBackendCourier(unwrapPayload(result.data))
  if (!courier) {
    return { success: false as const, error: 'Kurye aktif edildi ancak yanıt okunamadı.' }
  }

  return { success: true as const, data: courier }
}

export async function updateDriverAssignment(id: string, vehicleId: string | null) {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/drivers/${encodeURIComponent(id)}/assignment`,
    {
      method: 'PATCH',
      body: JSON.stringify({ vehicleId }),
    }
  )

  if (!result.success) return result

  const courier = mapBackendCourier(unwrapPayload(result.data))
  if (!courier) {
    return { success: false as const, error: 'Zimmet güncellendi ancak yanıt okunamadı.' }
  }

  return { success: true as const, data: courier }
}

export async function sendDriverPasswordReset(id: string) {
  return lastmileClientRequest<{ sent: boolean }>(
    `/api/lastmile/drivers/${encodeURIComponent(id)}/password-reset`,
    { method: 'POST', body: JSON.stringify({}) }
  )
}

export async function passiveDriver(id: string) {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/drivers/${encodeURIComponent(id)}/passive`,
    { method: 'POST', body: JSON.stringify({}) }
  )

  if (!result.success) return result

  const courier = mapBackendCourier(unwrapPayload(result.data))
  if (!courier) {
    return { success: false as const, error: 'Kurye pasife alındı ancak yanıt okunamadı.' }
  }

  return { success: true as const, data: courier }
}

export async function fetchDriverAssignmentHistory(
  id: string,
  page = 1,
  pageSize = 50
) {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/drivers/${encodeURIComponent(id)}/assignment-history?page=${page}&pageSize=${pageSize}`,
    { method: 'GET' }
  )

  if (!result.success) return result

  const payload = result.data ?? {}
  const rawItems = unwrapList(payload)
  const items = rawItems
    .map((item) => mapAssignmentHistoryItem(item))
    .filter((item): item is CourierVehicleAssignment => Boolean(item))
  const meta = unwrapPaginationMeta(payload, page, pageSize)

  return {
    success: true as const,
    data: {
      items,
      ...meta,
    } satisfies PaginatedResult<CourierVehicleAssignment>,
  }
}

export async function fetchDriverActivity(id: string, page = 1, pageSize = 50) {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/drivers/${encodeURIComponent(id)}/activity?page=${page}&pageSize=${pageSize}`,
    { method: 'GET' }
  )

  if (!result.success) return result

  const payload = result.data ?? {}
  const rawItems = unwrapList(payload)
  const items = rawItems
    .map((item) => mapActivityEvent(item))
    .filter((item): item is CourierActivityEvent => Boolean(item))
  const meta = unwrapPaginationMeta(payload, page, pageSize)

  return {
    success: true as const,
    data: {
      items,
      ...meta,
    } satisfies PaginatedResult<CourierActivityEvent>,
  }
}

export async function fetchDriverSkillCatalog() {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    '/api/lastmile/definitions/skills?appliesTo=driver&excludeDefault=true',
    { method: 'GET' }
  )

  if (!result.success) return result

  const payload = result.data ?? {}
  const nested = unwrapPayload(payload)
  const rawItems =
    (Array.isArray(payload.items) ? payload.items : null) ??
    (Array.isArray(nested.items) ? nested.items : null) ??
    []

  const seen = new Set<string>()
  const items = rawItems
    .map((item) => mapDriverSkillCatalogItem(item))
    .filter((item): item is DriverSkillCatalogItem => {
      if (!item) return false
      if (seen.has(item.code)) return false
      seen.add(item.code)
      return true
    })

  return { success: true as const, data: items }
}

export async function fetchVehicleOptionsForCourier(): Promise<
  | { success: true; data: VehicleOption[] }
  | { success: false; error: string; code?: string }
> {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    '/api/lastmile/vehicles?page=1&pageSize=50',
    { method: 'GET' }
  )

  if (!result.success) return result

  const rawItems = unwrapList(result.data ?? {})
  const vehicles = rawItems
    .map((item) => mapBackendVehicle(item))
    .filter((item): item is NonNullable<ReturnType<typeof mapBackendVehicle>> => Boolean(item))

  return { success: true, data: mapVehicleOptions(vehicles) }
}

export async function uploadDriverDocument(input: {
  fileName: string
  contentType: string
  contentBase64: string
  type: string
  driverId?: string
}) {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    '/api/lastmile/drivers/documents/upload',
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

  const mapped = mapCourierDocument(doc)
  if (!mapped) {
    return {
      success: true as const,
      data: {
        id,
        name: String(doc.name ?? doc.fileName ?? input.fileName),
        size: Number(doc.size ?? 0),
        mimeType: String(doc.mimeType ?? doc.contentType ?? input.contentType),
        type: (String(doc.type ?? input.type ?? 'diger') as CourierDocumentMeta['type']),
        uploadedAt: String(doc.uploadedAt ?? new Date().toISOString()),
        uploadedBy: String(doc.uploadedBy ?? '—'),
      },
    }
  }

  return { success: true as const, data: mapped }
}

export async function patchDriverDocumentType(
  driverId: string,
  documentId: string,
  type: string
) {
  return lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/drivers/${encodeURIComponent(driverId)}/documents/${encodeURIComponent(documentId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ type }),
    }
  )
}

export async function fetchDriverDocumentDownloadUrl(driverId: string, documentId: string) {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/drivers/${encodeURIComponent(driverId)}/documents/${encodeURIComponent(documentId)}/download`,
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

export async function deleteDriverDocument(driverId: string, documentId: string) {
  return lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/drivers/${encodeURIComponent(driverId)}/documents/${encodeURIComponent(documentId)}`,
    { method: 'DELETE' }
  )
}

export async function deleteOrphanDocument(documentId: string) {
  return lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/documents/${encodeURIComponent(documentId)}`,
    { method: 'DELETE' }
  )
}

export { fileToBase64 } from '../../vehicles/_api/vehicles'
