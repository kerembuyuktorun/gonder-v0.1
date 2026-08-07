import type { CustomerListKpi, CustomerStatusScope, LastmileCustomer } from '../_types/customer'
import type { CustomerDetail } from '../[id]/_types/customer-detail'
import {
  mapBackendCustomer,
  mapBackendCustomerDetail,
  mapCustomerStats,
  mapStatusCounts,
  type CreateCustomerPayload,
} from '../_lib/map-customer'
import { lastmileClientRequest } from './client'

export type CustomerListQuery = {
  page: number
  pageSize: number
  search?: string
  statusScope?: CustomerStatusScope
  sector?: string[]
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export type CustomerListResult = {
  items: LastmileCustomer[]
  total: number
  statusCounts: Record<'all' | 'aktif' | 'pasif', number>
}

/**
 * Tek status enum gönderilir (multi-query yok).
 * BE: status=Passive → Passive + Suspend kayıtları döner.
 */
function statusScopeToParam(scope: CustomerStatusScope | undefined): string | undefined {
  if (!scope || scope === 'all') return undefined
  return scope === 'aktif' ? 'Active' : 'Passive'
}

function sortColumnToBackend(columnId: string | undefined): string | undefined {
  if (!columnId) return undefined
  const map: Record<string, string> = {
    kayit_tarihi: 'createdAt',
    musteri_kodu: 'code',
    firma_unvani: 'companyName',
    marka_kisa_ad: 'shortName',
    vkn: 'taxNumber',
    bugunku_aktif_siparis: 'todayActiveOrders',
    gunluk_ortalama_hacim: 'avgDailyVolume',
    teslimat_basari_orani: 'deliverySuccessRate',
    toplam_paket: 'totalOrders',
    son_senkronizasyon: 'lastSyncedAt',
  }
  return map[columnId] ?? columnId
}

export async function fetchCustomersList(
  query: CustomerListQuery
): Promise<
  | { success: true; data: CustomerListResult }
  | { success: false; error: string; code?: string }
> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  })

  if (query.search?.trim()) params.set('search', query.search.trim())

  const status = statusScopeToParam(query.statusScope)
  if (status) params.set('status', status)

  for (const sector of query.sector ?? []) {
    if (sector) params.append('sector', sector)
  }

  const sortBy = sortColumnToBackend(query.sortBy)
  if (sortBy) {
    params.set('sortBy', sortBy)
    params.set('sortDir', query.sortDir === 'asc' ? 'asc' : 'desc')
  }

  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/customers?${params.toString()}`,
    { method: 'GET' }
  )

  if (!result.success) return result

  const payload = result.data ?? {}
  const nested =
    payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
      ? (payload.data as Record<string, unknown>)
      : {}
  // REST kanonik: customers; GraphQL BFF: items
  const rawItems = Array.isArray(payload.customers)
    ? payload.customers
    : Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(nested.customers)
        ? nested.customers
        : Array.isArray(nested.items)
          ? nested.items
          : []

  const items = rawItems
    .map((item) => mapBackendCustomer(item))
    .filter((item): item is LastmileCustomer => Boolean(item))

  const total = Number(payload.total ?? nested.total ?? items.length)
  const statusCountsRaw = payload.statusCounts ?? nested.statusCounts ?? { all: total }

  return {
    success: true,
    data: {
      items,
      total: Number.isFinite(total) ? total : items.length,
      statusCounts: mapStatusCounts(statusCountsRaw),
    },
  }
}

export async function fetchCustomerStats() {
  const result = await lastmileClientRequest<unknown>('/api/lastmile/customers/stats', {
    method: 'GET',
  })
  if (!result.success) return result
  return { success: true as const, data: mapCustomerStats(result.data) satisfies CustomerListKpi }
}

export async function fetchCustomerDetail(id: string) {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/customers/${encodeURIComponent(id)}`,
    { method: 'GET' }
  )
  if (!result.success) return result

  const detail = mapBackendCustomerDetail(result.data)
  if (!detail) {
    return { success: false as const, error: 'Müşteri bulunamadı.' }
  }
  return { success: true as const, data: detail satisfies CustomerDetail }
}

export async function createCustomer(payload: CreateCustomerPayload) {
  const result = await lastmileClientRequest<unknown>('/api/lastmile/customers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!result.success) return result

  const customer = mapBackendCustomer(result.data)
  if (!customer) {
    return { success: false as const, error: 'Müşteri oluşturuldu ancak yanıt okunamadı.' }
  }
  return { success: true as const, data: customer }
}

export async function updateCustomer(id: string, payload: CreateCustomerPayload) {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/customers/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  )
  if (!result.success) return result

  const customer = mapBackendCustomer(result.data)
  if (!customer) {
    return { success: false as const, error: 'Müşteri güncellendi ancak yanıt okunamadı.' }
  }
  return { success: true as const, data: customer }
}

export async function patchCustomerStatus(id: string, status: 'Active' | 'Passive' | 'Suspend') {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/customers/${encodeURIComponent(id)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }
  )
  if (!result.success) return result

  const customer = mapBackendCustomer(result.data)
  if (!customer) {
    return { success: false as const, error: 'Durum güncellendi ancak yanıt okunamadı.' }
  }
  return { success: true as const, data: customer }
}
