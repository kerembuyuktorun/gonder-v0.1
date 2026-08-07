'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { ColumnFiltersState, OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table'
import { kitLogger } from '../../_shared/logger'

export interface DataTableSyncOptions {
  defaultPagination?: PaginationState
  defaultSorting?: SortingState
  defaultFilters?: ColumnFiltersState
  searchColumnId?: string
  searchDebounceMs?: number
  onSearchApplied?: (value: string, context: { signal: AbortSignal }) => void | Promise<void>
}

export interface DataTableSyncState {
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
  searchValue: string
  isSearchPending: boolean
  onPaginationChange: OnChangeFn<PaginationState>
  onSortingChange: OnChangeFn<SortingState>
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  onSearchValueChange: (value: string) => void
  cancelPendingSearch: () => void
}

function parseJsonParam<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch (_error) {
    return fallback
  }
}

function getSearchFilterValue(filters: ColumnFiltersState, columnId?: string): string {
  if (!columnId) return ''

  const match = filters.find((filter) => filter.id === columnId)
  return typeof match?.value === 'string' ? match.value : ''
}

function upsertSearchFilter(
  filters: ColumnFiltersState,
  columnId: string,
  value: string
): ColumnFiltersState {
  const nextFilters = filters.filter((filter) => filter.id !== columnId)
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return nextFilters
  }

  return [...nextFilters, { id: columnId, value: trimmedValue }]
}

export function useDataTableSync(options: DataTableSyncOptions = {}): DataTableSyncState {
  const {
    defaultPagination = { pageIndex: 0, pageSize: 10 },
    defaultSorting = [],
    defaultFilters = [],
    searchColumnId,
    searchDebounceMs = 400,
    onSearchApplied,
  } = options

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchKey = searchParams?.toString() || ''
  const defaultSortingKey = JSON.stringify(defaultSorting)
  const defaultFiltersKey = JSON.stringify(defaultFilters)

  const arePaginationEqual = (a: PaginationState, b: PaginationState) =>
    a.pageIndex === b.pageIndex && a.pageSize === b.pageSize

  const areSortingEqual = (a: SortingState, b: SortingState) =>
    JSON.stringify(a) === JSON.stringify(b)

  const areFiltersEqual = (a: ColumnFiltersState, b: ColumnFiltersState) =>
    JSON.stringify(a) === JSON.stringify(b)

  const initialState = useMemo(() => {
    const params = new URLSearchParams(searchKey)
    const parsedDefaultSorting = parseJsonParam<SortingState>(defaultSortingKey, [])
    const parsedDefaultFilters = parseJsonParam<ColumnFiltersState>(defaultFiltersKey, [])

    return {
      pagination: {
        pageIndex: Number(params.get('page') || defaultPagination.pageIndex),
        pageSize: Number(params.get('pageSize') || defaultPagination.pageSize),
      },
      sorting: parseJsonParam<SortingState>(params.get('sort'), parsedDefaultSorting),
      columnFilters: parseJsonParam<ColumnFiltersState>(params.get('filters'), parsedDefaultFilters),
    }
  }, [searchKey, defaultPagination.pageIndex, defaultPagination.pageSize, defaultSortingKey, defaultFiltersKey])

  const [pagination, setPagination] = useState<PaginationState>(initialState.pagination)
  const [sorting, setSorting] = useState<SortingState>(initialState.sorting)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialState.columnFilters)
  const initialSearchValue = searchColumnId
    ? getSearchFilterValue(initialState.columnFilters, searchColumnId)
    : ''
  const [searchValue, setSearchValue] = useState(initialSearchValue)
  const [appliedSearchValue, setAppliedSearchValue] = useState(initialSearchValue)
  const [isSearchPending, setIsSearchPending] = useState(false)
  const paginationRef = useRef(pagination)
  const sortingRef = useRef(sorting)
  const columnFiltersRef = useRef(columnFilters)
  const activeSearchControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    paginationRef.current = pagination
  }, [pagination])

  useEffect(() => {
    sortingRef.current = sorting
  }, [sorting])

  useEffect(() => {
    columnFiltersRef.current = columnFilters
  }, [columnFilters])

  const syncUrl = useCallback(
    (nextPagination: PaginationState, nextSorting: SortingState, nextFilters: ColumnFiltersState) => {
      const params = new URLSearchParams(searchKey)
      params.set('page', String(nextPagination.pageIndex))
      params.set('pageSize', String(nextPagination.pageSize))

      if (nextSorting.length > 0) params.set('sort', JSON.stringify(nextSorting))
      else params.delete('sort')

      if (nextFilters.length > 0) params.set('filters', JSON.stringify(nextFilters))
      else params.delete('filters')

      const nextQuery = params.toString()
      if (nextQuery === searchKey) return
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false })
    },
    [pathname, router, searchKey]
  )

  const cancelPendingSearch = useCallback(() => {
    activeSearchControllerRef.current?.abort()
    activeSearchControllerRef.current = null
    setIsSearchPending(false)
  }, [])

  const onPaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updater) => {
      const next = typeof updater === 'function' ? updater(paginationRef.current) : updater
      setPagination(next)
      syncUrl(next, sortingRef.current, columnFiltersRef.current)
    },
    [syncUrl]
  )

  const onSortingChange: OnChangeFn<SortingState> = useCallback(
    (updater) => {
      const nextSorting = typeof updater === 'function' ? updater(sortingRef.current) : updater
      const resetPagination = { ...paginationRef.current, pageIndex: 0 }
      setSorting(nextSorting)
      setPagination(resetPagination)
      syncUrl(resetPagination, nextSorting, columnFiltersRef.current)
    },
    [syncUrl]
  )

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
    (updater) => {
      const nextFilters = typeof updater === 'function' ? updater(columnFiltersRef.current) : updater
      const resetPagination = { ...paginationRef.current, pageIndex: 0 }
      setColumnFilters(nextFilters)
      setPagination(resetPagination)
      if (searchColumnId) {
        const nextSearchValue = getSearchFilterValue(nextFilters, searchColumnId)
        setSearchValue(nextSearchValue)
        setAppliedSearchValue(nextSearchValue)
        setIsSearchPending(false)
      }
      syncUrl(resetPagination, sortingRef.current, nextFilters)
    },
    [searchColumnId, syncUrl]
  )

  useEffect(() => {
    if (!searchColumnId) return

    if (searchValue === appliedSearchValue) {
      setIsSearchPending(false)
      return
    }

    setIsSearchPending(true)

    const timer = window.setTimeout(() => {
      const nextFilters = upsertSearchFilter(columnFiltersRef.current, searchColumnId, searchValue)
      const resetPagination = { ...paginationRef.current, pageIndex: 0 }

      setColumnFilters((prev) => (areFiltersEqual(prev, nextFilters) ? prev : nextFilters))
      setPagination((prev) => (arePaginationEqual(prev, resetPagination) ? prev : resetPagination))
      setAppliedSearchValue(searchValue.trim())
      setIsSearchPending(false)
      syncUrl(resetPagination, sortingRef.current, nextFilters)

      if (onSearchApplied) {
        activeSearchControllerRef.current?.abort()
        const controller = new AbortController()
        activeSearchControllerRef.current = controller
        void Promise.resolve(onSearchApplied(searchValue.trim(), { signal: controller.signal })).catch(
          (error: unknown) => {
            if (error instanceof Error && error.name === 'AbortError') {
              return
            }

            kitLogger.error('DataTable search apply failed', error)
          }
        )
      }
    }, searchDebounceMs)

    return () => {
      window.clearTimeout(timer)
    }
  }, [appliedSearchValue, onSearchApplied, searchColumnId, searchDebounceMs, searchValue, syncUrl])

  useEffect(() => {
    setPagination((prev) =>
      arePaginationEqual(prev, initialState.pagination) ? prev : initialState.pagination
    )
    setSorting((prev) =>
      areSortingEqual(prev, initialState.sorting) ? prev : initialState.sorting
    )
    setColumnFilters((prev) =>
      areFiltersEqual(prev, initialState.columnFilters) ? prev : initialState.columnFilters
    )
    if (searchColumnId) {
      const nextSearchValue = getSearchFilterValue(initialState.columnFilters, searchColumnId)
      setSearchValue(nextSearchValue)
      setAppliedSearchValue(nextSearchValue)
      setIsSearchPending(false)
    }
  }, [initialState, searchColumnId])

  useEffect(() => {
    return () => {
      activeSearchControllerRef.current?.abort()
    }
  }, [initialState])

  return {
    pagination,
    sorting,
    columnFilters,
    searchValue,
    isSearchPending,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onSearchValueChange: setSearchValue,
    cancelPendingSearch,
  }
}
