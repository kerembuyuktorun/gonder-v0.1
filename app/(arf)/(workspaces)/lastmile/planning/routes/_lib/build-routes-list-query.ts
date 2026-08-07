import type { ColumnFiltersState, SortingState } from '@tanstack/react-table'
import type {
  PlanningRouteDateScope,
  PlanningRouteStatusScope,
  PlanningRouteType,
} from '../_types/planning-route'

export type PlanningRoutesListQuery = {
  page: number
  pageSize: number
  search?: string
  statusScope?: PlanningRouteStatusScope
  dateScope?: PlanningRouteDateScope
  sorting?: SortingState
  columnFilters?: ColumnFiltersState
}

const SORT_COLUMN_TO_BE: Record<string, string> = {
  operationDate: 'plannedDate',
  createdAt: 'createdAt',
  distanceKm: 'distance',
  duration: 'duration',
  orderCount: 'orderCount',
  capacity: 'volumeOccupancyPct',
  progress: 'stopCount',
}

const STATUS_SCOPE_TO_BE: Record<Exclude<PlanningRouteStatusScope, 'all'>, string> = {
  planlandi: 'CREATED',
  aktif: 'STARTED',
  tamamlandi: 'COMPLETED',
  iptal: 'CANCELLED',
}

const FE_STATUS_TO_BE: Record<string, string> = {
  planlandi: 'CREATED',
  aktif: 'STARTED',
  tamamlandi: 'COMPLETED',
  iptal: 'CANCELLED',
}

export function planningRouteTypeToBe(type: PlanningRouteType): string {
  switch (type) {
    case 'Karışık':
      return 'MIXED'
    case 'Standart Rota':
      return 'DELIVERY'
    case 'Toplama Ringi':
      return 'PICKUP'
    default:
      return ''
  }
}

function todayIsoLocal(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(isoDate: string, delta: number): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const value = new Date(y, m - 1, d)
  value.setDate(value.getDate() + delta)
  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, '0'),
    String(value.getDate()).padStart(2, '0'),
  ].join('-')
}

function dateScopeToRange(scope: PlanningRouteDateScope): {
  plannedDateFrom?: string
  plannedDateTo?: string
} {
  if (scope === 'all') return {}
  const today = todayIsoLocal()
  if (scope === 'bugun') {
    return { plannedDateFrom: today, plannedDateTo: today }
  }
  if (scope === 'gecmis') {
    return { plannedDateTo: addDays(today, -1) }
  }
  return { plannedDateFrom: addDays(today, 1) }
}

export function buildPlanningRoutesListSearchParams(
  query: PlanningRoutesListQuery
): URLSearchParams {
  const params = new URLSearchParams()
  params.set('view', 'routeList')
  params.set('page', String(Math.max(1, query.page)))
  params.set('pageSize', String(Math.min(100, Math.max(1, query.pageSize))))

  const search = query.search?.trim()
  if (search) params.set('search', search)

  if (query.statusScope && query.statusScope !== 'all') {
    params.set('status', STATUS_SCOPE_TO_BE[query.statusScope])
  }

  const dateRange = dateScopeToRange(query.dateScope ?? 'all')
  if (dateRange.plannedDateFrom) params.set('plannedDateFrom', dateRange.plannedDateFrom)
  if (dateRange.plannedDateTo) params.set('plannedDateTo', dateRange.plannedDateTo)

  for (const filter of query.columnFilters ?? []) {
    const values = Array.isArray(filter.value) ? (filter.value as string[]) : []
    if (values.length === 0) continue

    if (filter.id === 'status' && values.length === 1) {
      const mapped = FE_STATUS_TO_BE[values[0]]
      if (mapped) params.set('status', mapped)
    }

    if (filter.id === 'routeType' && values.length === 1) {
      const mapped = planningRouteTypeToBe(values[0] as PlanningRouteType)
      if (mapped) params.set('routeType', mapped)
    }
  }

  const sorting = query.sorting ?? []
  if (sorting.length > 0) {
    const [{ id, desc }] = sorting
    const sortBy = SORT_COLUMN_TO_BE[id]
    if (sortBy) {
      params.set('sortBy', sortBy)
      params.set('sortDir', desc ? 'desc' : 'asc')
    }
  }

  return params
}

export function buildPlanningRoutesExportSearchParams(
  query: Omit<PlanningRoutesListQuery, 'page' | 'pageSize'>
): URLSearchParams {
  const params = buildPlanningRoutesListSearchParams({
    ...query,
    page: 1,
    pageSize: 100,
  })
  params.set('view', 'routeList')
  return params
}
