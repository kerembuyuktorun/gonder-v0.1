import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import type {
  CustomerListKpi,
  CustomerStatusScope,
  LastmileCustomer,
} from '../_types/customer'

export function matchesStatusScope(
  customer: LastmileCustomer,
  scope: CustomerStatusScope
): boolean {
  if (scope === 'all') return true
  return customer.durum === scope
}

export function countCustomersByStatusScope(
  customers: LastmileCustomer[]
): Record<CustomerStatusScope, number> {
  return {
    all: customers.length,
    aktif: customers.filter((item) => item.durum === 'aktif').length,
    pasif: customers.filter((item) => item.durum === 'pasif').length,
  }
}

export function buildCustomerKpi(customers: LastmileCustomer[]): CustomerListKpi {
  const count = customers.length
  const avg = (sum: number) => (count === 0 ? 0 : sum / count)

  return {
    todayActiveOrders: customers.reduce((sum, item) => sum + item.bugunku_aktif_siparis, 0),
    avgDailyVolume: Math.round(avg(customers.reduce((sum, item) => sum + item.gunluk_ortalama_hacim, 0))),
    avgTaskDurationMin: Number(
      avg(customers.reduce((sum, item) => sum + item.ortalama_gorev_suresi_dk, 0)).toFixed(1)
    ),
    avgSuccessRate: Number(
      avg(customers.reduce((sum, item) => sum + item.teslimat_basari_orani, 0)).toFixed(1)
    ),
    totalFacilities: customers.reduce((sum, item) => sum + item.tesis_sayisi, 0),
    totalOrders: customers.reduce((sum, item) => sum + item.toplam_paket, 0),
    totalDelivered: customers.reduce((sum, item) => sum + item.toplam_teslim, 0),
    totalCanceled: customers.reduce((sum, item) => sum + item.toplam_iptal, 0),
  }
}

const GLOBAL_SEARCH_KEYS: (keyof LastmileCustomer)[] = [
  'musteri_kodu',
  'firma_unvani',
  'marka_kisa_ad',
  'vkn',
  'ana_yetkili',
  'telefon',
  'email',
]

function matchesGlobalSearch(customer: LastmileCustomer, query: string): boolean {
  const normalized = query.trim().toLocaleLowerCase('tr-TR')
  if (!normalized) return true

  return GLOBAL_SEARCH_KEYS.some((key) =>
    String(customer[key] ?? '')
      .toLocaleLowerCase('tr-TR')
      .includes(normalized)
  )
}

function matchesColumnFilter(
  customer: LastmileCustomer,
  filterId: string,
  value: unknown
): boolean {
  if (filterId === 'durum' || filterId === 'sektor') {
    const selected = Array.isArray(value) ? (value as string[]) : []
    if (selected.length === 0) return true
    return selected.includes(String(customer[filterId as keyof LastmileCustomer] ?? ''))
  }
  return true
}

function getSortComparable(
  customer: LastmileCustomer,
  columnId: string
): string | number | null {
  const value = customer[columnId as keyof LastmileCustomer]
  if (typeof value === 'number') return value
  if (typeof value === 'string') return value
  return null
}

export function queryCustomers({
  rows,
  statusScope,
  pagination,
  sorting,
  columnFilters,
  globalFilter,
}: {
  rows: LastmileCustomer[]
  statusScope: CustomerStatusScope
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
  globalFilter: string
}) {
  let filtered = rows.filter((row) => matchesStatusScope(row, statusScope))

  if (globalFilter) {
    filtered = filtered.filter((row) => matchesGlobalSearch(row, globalFilter))
  }

  for (const filter of columnFilters) {
    filtered = filtered.filter((row) => matchesColumnFilter(row, filter.id, filter.value))
  }

  if (sorting.length > 0) {
    const [{ id, desc }] = sorting
    filtered = [...filtered].sort((a, b) => {
      const left = getSortComparable(a, id)
      const right = getSortComparable(b, id)
      if (left == null && right == null) return 0
      if (left == null) return 1
      if (right == null) return -1
      if (typeof left === 'number' && typeof right === 'number') {
        return desc ? right - left : left - right
      }
      return desc
        ? String(right).localeCompare(String(left), 'tr')
        : String(left).localeCompare(String(right), 'tr')
    })
  }

  const totalRows = filtered.length
  const start = pagination.pageIndex * pagination.pageSize
  const pageRows = filtered.slice(start, start + pagination.pageSize)

  return { rows: pageRows, totalRows }
}

export function formatSuccessRate(value: number): string {
  return `%${value.toFixed(1)}`
}

export function formatVolume(value: number): string {
  return `${value.toLocaleString('tr-TR')} Paket/Gün`
}

export function formatCount(value: number): string {
  return value.toLocaleString('tr-TR')
}
