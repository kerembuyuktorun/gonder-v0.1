import type { ColumnFiltersState } from '@tanstack/react-table'
import { lastmileClientRequest } from '../new/_api/client'
import type { OrderStatus, OrderStatusScope, OrderType, OrderTypeScope } from '../_types/order'
import {
  mapBackendOrderToLastmileOrder,
  ORDER_STATUS_TO_AGGREGATED,
  ORDER_TYPE_TO_BE,
  typeScopeToBackendType,
} from '../_lib/map-order-list'
import type { LastmileOrder } from '../_types/order'

export type ListOrdersQuery = {
  page: number
  pageSize: number
  search?: string
  /** BE orderOwner filtresi — müşteri detaydan gelen sipariş listesi */
  orderOwner?: string
  typeScope?: OrderTypeScope
  statusScopes?: OrderStatusScope[]
  columnFilters?: ColumnFiltersState
  /** Override type from tab (e.g. count helpers) */
  type?: string
  cancelled?: boolean
  unassigned?: boolean
  statusGroup?: 'ACTIVE' | 'PASSIVE' | 'ALL'
}

export type ListOrdersResult = {
  orders: LastmileOrder[]
  total: number
  page: number
  pageSize: number
}

type BackendListPayload = {
  orders?: unknown[]
  total?: number
  page?: number
  pageSize?: number
}

function appendFilterParams(params: URLSearchParams, columnFilters: ColumnFiltersState = []) {
  for (const filter of columnFilters) {
    const values = Array.isArray(filter.value) ? (filter.value as string[]) : []
    if (values.length === 0) continue

    if (filter.id === 'durum') {
      for (const value of values) {
        const mapped = ORDER_STATUS_TO_AGGREGATED[value as OrderStatus]
        if (mapped) params.append('aggregatedStatus', mapped)
      }
      continue
    }

    if (filter.id === 'siparis_tipi' && values.length === 1) {
      const mapped = ORDER_TYPE_TO_BE[values[0] as OrderType]
      if (mapped) params.set('type', mapped)
    }
  }
}

export function buildListOrdersSearchParams(query: ListOrdersQuery): URLSearchParams {
  const params = new URLSearchParams()
  params.set('page', String(Math.max(1, query.page)))
  params.set('pageSize', String(Math.min(100, Math.max(1, query.pageSize))))

  const search = query.search?.trim()
  if (search) params.set('search', search)

  const orderOwner = query.orderOwner?.trim()
  if (orderOwner) params.set('orderOwner', orderOwner)

  const statusScopes = query.statusScopes ?? []
  const hasCancelled = statusScopes.includes('iptal') || query.cancelled === true
  const hasUnassigned = statusScopes.includes('atanmayan') || query.unassigned === true

  if (hasCancelled) params.set('cancelled', 'true')
  if (hasUnassigned) params.set('unassigned', 'true')

  if (query.statusGroup) {
    params.set('statusGroup', query.statusGroup)
  } else if (!hasCancelled) {
    params.set('statusGroup', 'ACTIVE')
  }

  if (query.type) {
    params.set('type', query.type)
  } else {
    const fromScope = typeScopeToBackendType(query.typeScope ?? 'all')
    if (fromScope) params.set('type', fromScope)
  }

  appendFilterParams(params, query.columnFilters)

  return params
}

export async function fetchOrdersList(query: ListOrdersQuery): Promise<
  | { success: true; data: ListOrdersResult }
  | { success: false; error: string }
> {
  const params = buildListOrdersSearchParams(query)
  const result = await lastmileClientRequest<BackendListPayload>(
    `/api/lastmile/orders?${params.toString()}`,
    { method: 'GET' }
  )

  if (!result.success) {
    return { success: false, error: result.error }
  }

  const rawRows = result.data.orders ?? []
  const orders = rawRows.map(mapBackendOrderToLastmileOrder).filter((order) => order.id)

  return {
    success: true,
    data: {
      orders,
      total: Number(result.data.total ?? orders.length),
      page: Number(result.data.page ?? query.page),
      pageSize: Number(result.data.pageSize ?? query.pageSize),
    },
  }
}

/**
 * Tek istek: statusGroup=ALL + pageSize=100.
 * Sekme sayaçları ve istemci filtreleri bu havuzdan türetilir (pageSize=1 fan-out yok).
 */
export async function fetchOrdersPool(input: {
  search?: string
  orderOwner?: string
}): Promise<
  | { success: true; data: { orders: LastmileOrder[]; total: number } }
  | { success: false; error: string }
> {
  return fetchOrdersList({
    page: 1,
    pageSize: 100,
    search: input.search,
    orderOwner: input.orderOwner,
    typeScope: 'all',
    statusScopes: [],
    statusGroup: 'ALL',
  })
}
