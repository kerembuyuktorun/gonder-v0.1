import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import type {
  PlanningRouteDateScope,
  PlanningRouteListItem,
  PlanningRouteListKpi,
  PlanningRouteStatusScope,
} from '../_types/planning-route'

export function formatRouteDate(isoDate: string): string {
  const parsed = parseRouteDate(isoDate)
  return parsed?.date ?? (isoDate.slice(0, 10) || '—')
}

/** Planlanan tarih hücresi — tarih + haftanın günü */
export function parseRouteDate(isoDate: string): { date: string; weekday: string } | null {
  const day = isoDate.slice(0, 10)
  const [y, m, d] = day.split('-').map(Number)
  if (!y || !m || !d) return null
  const value = new Date(y, m - 1, d)
  if (Number.isNaN(value.getTime())) return null
  return {
    date: value.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    weekday: value.toLocaleDateString('tr-TR', { weekday: 'long' }),
  }
}

export function formatRouteDateTime(iso: string): string {
  const parsed = parseRouteDateTime(iso)
  if (!parsed) return iso || '—'
  return `${parsed.date} ${parsed.time}`
}

/** Oluşturulma zamanı hücresi — sipariş listesi gibi tarih / saat ayrık */
export function parseRouteDateTime(iso: string): { date: string; time: string } | null {
  const value = new Date(iso)
  if (Number.isNaN(value.getTime())) return null
  return {
    date: value.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    time: value.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}

export function formatDistanceKm(km: number): string {
  if (!Number.isFinite(km) || km <= 0) return '—'
  return `${km.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} km`
}

export function formatDurationMin(min: number | null | undefined): string {
  if (min == null || !Number.isFinite(min)) return '—'
  return `${Math.round(min)} dk`
}

export function formatCount(value: number): string {
  return value.toLocaleString('tr-TR')
}

export function buildRoutesKpi(rows: PlanningRouteListItem[]): PlanningRouteListKpi {
  return {
    todayActive: rows.filter((r) => r.dateChip === 'bugun' && r.status === 'aktif').length,
    plannedToday: rows.filter((r) => r.dateChip === 'bugun' && r.status === 'planlandi').length,
    carryover: rows.filter((r) => r.dateChip === 'gecmis' && (r.status === 'aktif' || r.status === 'planlandi')).length,
    future: rows.filter((r) => r.dateChip === 'ileri').length,
    completedToday: rows.filter((r) => r.dateChip === 'bugun' && r.status === 'tamamlandi').length,
    canceled: rows.filter((r) => r.status === 'iptal').length,
  }
}

export function countRoutesByStatus(
  rows: PlanningRouteListItem[]
): Record<PlanningRouteStatusScope, number> {
  return {
    all: rows.length,
    planlandi: rows.filter((r) => r.status === 'planlandi').length,
    aktif: rows.filter((r) => r.status === 'aktif').length,
    tamamlandi: rows.filter((r) => r.status === 'tamamlandi').length,
    iptal: rows.filter((r) => r.status === 'iptal').length,
  }
}

export function countRoutesByDate(
  rows: PlanningRouteListItem[]
): Record<PlanningRouteDateScope, number> {
  return {
    all: rows.length,
    bugun: rows.filter((r) => r.dateChip === 'bugun').length,
    gecmis: rows.filter((r) => r.dateChip === 'gecmis').length,
    ileri: rows.filter((r) => r.dateChip === 'ileri').length,
  }
}

function matchesStatusScope(row: PlanningRouteListItem, scope: PlanningRouteStatusScope) {
  if (scope === 'all') return true
  return row.status === scope
}

function matchesDateScope(row: PlanningRouteListItem, scope: PlanningRouteDateScope) {
  if (scope === 'all') return true
  return row.dateChip === scope
}

function matchesGlobalSearch(row: PlanningRouteListItem, query: string) {
  const q = query.trim().toLocaleLowerCase('tr-TR')
  if (!q) return true
  const haystack = [
    row.label,
    row.id,
    row.vehiclePlate,
    row.courierName ?? '',
    row.region,
    row.customerName ?? '',
    row.parkLabel ?? '',
    row.createdBy ?? '',
  ]
    .join(' ')
    .toLocaleLowerCase('tr-TR')
  return haystack.includes(q)
}

function matchesColumnFilter(row: PlanningRouteListItem, id: string, value: unknown) {
  if (value == null) return true
  const selected = Array.isArray(value) ? (value as string[]) : []
  if (selected.length === 0) return true

  if (id === 'status') return selected.includes(row.status)
  if (id === 'routeType') return selected.includes(row.routeType)
  if (id === 'dateChip') return selected.includes(row.dateChip)
  if (id === 'courierName') {
    const name = row.courierName?.trim() || 'Atanmadı'
    return selected.includes(name)
  }
  if (id === 'region') return selected.includes(row.region)
  return true
}

function getSortComparable(
  row: PlanningRouteListItem,
  id: string
): string | number | null {
  switch (id) {
    case 'label':
      return row.label
    case 'status':
      return row.status
    case 'routeType':
      return row.routeType
    case 'operationDate':
      return row.operationDate
    case 'dateChip':
      return row.dateChip
    case 'vehiclePlate':
      return row.vehiclePlate
    case 'courierName':
      return row.courierName
    case 'progress':
      return row.progressTotal > 0 ? row.progressCompleted / row.progressTotal : 0
    case 'orderCount':
      return row.orderCount
    case 'distanceKm':
      return row.distanceKm
    case 'duration':
      return row.durationPlannedMin
    case 'region':
      return row.region
    case 'capacity':
      return Math.max(row.capacityVolumePct, row.capacityWeightPct)
    case 'shift':
      return row.shiftStart
    case 'parkLabel':
      return row.parkLabel
    case 'customerName':
      return row.customerName
    case 'createdAt':
      return row.createdAt
    case 'createdBy':
      return row.createdBy
    default:
      return null
  }
}

function compareSortValues(
  left: string | number | null,
  right: string | number | null,
  desc: boolean
): number {
  if (left == null && right == null) return 0
  if (left == null) return desc ? 1 : -1
  if (right == null) return desc ? -1 : 1
  if (typeof left === 'number' && typeof right === 'number') {
    return desc ? right - left : left - right
  }
  const cmp = String(left).localeCompare(String(right), 'tr')
  return desc ? -cmp : cmp
}

export function queryRoutes({
  rows,
  statusScope,
  dateScope,
  pagination,
  sorting,
  columnFilters,
  globalFilter,
}: {
  rows: PlanningRouteListItem[]
  statusScope: PlanningRouteStatusScope
  dateScope: PlanningRouteDateScope
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
  globalFilter: string
}) {
  let filtered = rows
    .filter((row) => matchesStatusScope(row, statusScope))
    .filter((row) => matchesDateScope(row, dateScope))

  if (globalFilter) {
    filtered = filtered.filter((row) => matchesGlobalSearch(row, globalFilter))
  }

  for (const filter of columnFilters) {
    filtered = filtered.filter((row) => matchesColumnFilter(row, filter.id, filter.value))
  }

  if (sorting.length > 0) {
    const [{ id, desc }] = sorting
    filtered = [...filtered].sort((a, b) =>
      compareSortValues(getSortComparable(a, id), getSortComparable(b, id), desc)
    )
  }

  const totalRows = filtered.length
  const start = pagination.pageIndex * pagination.pageSize
  const end = start + pagination.pageSize

  return {
    rows: filtered.slice(start, end),
    totalRows,
  }
}
