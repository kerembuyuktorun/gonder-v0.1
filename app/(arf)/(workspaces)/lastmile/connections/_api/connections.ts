import { lastmileClientRequest } from '../../customers/_api/client'
import {
  mapBackendConnection,
  mapTypeCounts,
  typeScopeToContactType,
} from '../_lib/map-connection'
import type { ConnectionTypeScope, LastmileConnection } from '../_types/connection'

export type ConnectionListQuery = {
  page: number
  pageSize: number
  search?: string
  typeScope?: ConnectionTypeScope
  addressTitles?: string[]
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export type ConnectionListResult = {
  items: LastmileConnection[]
  total: number
  typeCounts: Record<ConnectionTypeScope, number>
}

function sortColumnToBackend(columnId: string | undefined): string | undefined {
  if (!columnId) return undefined
  const map: Record<string, string> = {
    kayit_tarihi: 'createdAt',
    primary_name: 'displayName',
    muhatap_tipi: 'companyType',
    tax_identity: 'taxNumber',
    vergi_dairesi: 'taxOffice',
    telefon: 'phone',
    adres_baslik: 'title',
    adres: 'fullAddress',
    adres_detay: 'buildingNo',
  }
  return map[columnId] ?? columnId
}

export async function fetchConnectionsList(
  query: ConnectionListQuery
): Promise<
  | { success: true; data: ConnectionListResult }
  | { success: false; error: string; code?: string }
> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  })

  if (query.search?.trim()) params.set('search', query.search.trim())

  const contactType = typeScopeToContactType(query.typeScope)
  if (contactType) params.set('contactType', contactType)

  const titles = (query.addressTitles ?? []).filter(Boolean)
  if (titles.length === 1) {
    params.set('addressTitle', titles[0])
  } else if (titles.length > 1) {
    params.set('addressTitleIn', titles.join(','))
  }

  const sortBy = sortColumnToBackend(query.sortBy)
  if (sortBy) {
    params.set('sortBy', sortBy)
    params.set('sortDir', query.sortDir === 'asc' ? 'asc' : 'desc')
  }

  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/connections?${params.toString()}`,
    { method: 'GET' }
  )

  if (!result.success) return result

  const payload = result.data ?? {}
  const nested =
    payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
      ? (payload.data as Record<string, unknown>)
      : {}

  const rawItems = Array.isArray(payload.connections)
    ? payload.connections
    : Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(nested.connections)
        ? nested.connections
        : Array.isArray(nested.items)
          ? nested.items
          : []

  const items = rawItems
    .map((item) => mapBackendConnection(item))
    .filter((item): item is LastmileConnection => Boolean(item))

  const total = Number(payload.total ?? nested.total ?? items.length)
  const typeCountsRaw = payload.typeCounts ?? nested.typeCounts ?? {
    all: total,
    INDIVIDUAL: 0,
    CORPORATE: 0,
  }

  return {
    success: true,
    data: {
      items,
      total: Number.isFinite(total) ? total : items.length,
      typeCounts: mapTypeCounts(typeCountsRaw),
    },
  }
}
