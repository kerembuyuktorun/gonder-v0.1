import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import type {
  ConnectionTypeScope,
  LastmileConnection,
} from '../_types/connection'

export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  const national = digits.startsWith('90') ? digits.slice(2) : digits
  if (national.length === 10) {
    return `+90 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`
  }
  return value
}

export function formatAddressDetail(connection: LastmileConnection) {
  const { bina_no, kat, daire_no } = connection
  if (!bina_no && !kat && !daire_no) return '—'
  return [bina_no || '—', kat || '—', daire_no || '—'].join(' · ')
}

export function parseKayitTarihi(value: string) {
  const [date, time] = value.split(' ')
  if (!date) return null
  return { date, time: time ?? '' }
}

export function formatTaxIdentity(connection: LastmileConnection) {
  if (connection.muhatap_tipi === 'bireysel') {
    return connection.tckn ?? '—'
  }
  return connection.vkn ?? '—'
}

export function formatPrimaryName(connection: LastmileConnection) {
  if (connection.muhatap_tipi === 'kurumsal') {
    return connection.firma_adi ?? '—'
  }
  return connection.muhatabi
}

export function matchesTypeScope(
  connection: LastmileConnection,
  scope: ConnectionTypeScope
): boolean {
  if (scope === 'all') return true
  return connection.muhatap_tipi === scope
}

export function countConnectionsByTypeScope(
  connections: LastmileConnection[]
): Record<ConnectionTypeScope, number> {
  return {
    all: connections.length,
    bireysel: connections.filter((item) => item.muhatap_tipi === 'bireysel').length,
    kurumsal: connections.filter((item) => item.muhatap_tipi === 'kurumsal').length,
  }
}

const GLOBAL_SEARCH_KEYS = [
  'muhatabi',
  'firma_adi',
  'tckn',
  'vkn',
  'telefon',
  'adres_baslik',
  'adres',
  'full_address',
  'vergi_dairesi',
] as const

function matchesGlobalSearch(connection: LastmileConnection, query: string): boolean {
  const normalized = query.trim().toLocaleLowerCase('tr-TR')
  if (!normalized) return true

  return GLOBAL_SEARCH_KEYS.some((key) =>
    String(connection[key] ?? '')
      .toLocaleLowerCase('tr-TR')
      .includes(normalized)
  )
}

function matchesColumnFilter(
  connection: LastmileConnection,
  filterId: string,
  value: unknown
): boolean {
  if (filterId === 'muhatap_tipi' || filterId === 'adres_baslik') {
    const selected = Array.isArray(value) ? (value as string[]) : []
    if (selected.length === 0) return true
    return selected.includes(String(connection[filterId as keyof LastmileConnection] ?? ''))
  }
  return true
}

function parseDate(value: string) {
  const [datePart, timePart = '00:00'] = value.split(' ')
  const [day, month, year] = datePart.split('.').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute).getTime()
}

function getSortComparable(
  connection: LastmileConnection,
  columnId: string
): string | number | null {
  if (columnId === 'kayit_tarihi') {
    return parseDate(connection.kayit_tarihi)
  }
  if (columnId === 'primary_name') {
    return formatPrimaryName(connection)
  }
  if (columnId === 'tax_identity') {
    return formatTaxIdentity(connection)
  }
  if (columnId === 'adres_detay') {
    return formatAddressDetail(connection)
  }

  const value = connection[columnId as keyof LastmileConnection]
  if (typeof value === 'number') return value
  if (typeof value === 'string') return value
  return null
}

export function queryConnections({
  rows,
  typeScope,
  pagination,
  sorting,
  columnFilters,
  globalFilter,
}: {
  rows: LastmileConnection[]
  typeScope: ConnectionTypeScope
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
  globalFilter: string
}) {
  let filtered = rows.filter((row) => matchesTypeScope(row, typeScope))

  if (globalFilter) {
    filtered = filtered.filter((row) => matchesGlobalSearch(row, globalFilter))
  }

  for (const filter of columnFilters) {
    filtered = filtered.filter((row) => matchesColumnFilter(row, filter.id, filter.value))
  }

  if (sorting.length > 0) {
    const [{ id, desc }] = sorting
    filtered = [...filtered].sort((left, right) => {
      const a = getSortComparable(left, id)
      const b = getSortComparable(right, id)
      if (a == null && b == null) return 0
      if (a == null) return 1
      if (b == null) return -1
      if (typeof a === 'number' && typeof b === 'number') {
        return desc ? b - a : a - b
      }
      return desc
        ? String(b).localeCompare(String(a), 'tr')
        : String(a).localeCompare(String(b), 'tr')
    })
  }

  const totalRows = filtered.length
  const start = pagination.pageIndex * pagination.pageSize
  const pageRows = filtered.slice(start, start + pagination.pageSize)

  return { rows: pageRows, totalRows }
}
