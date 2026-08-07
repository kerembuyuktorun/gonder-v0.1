'use client'

/**
 * DataTable Kit - URL State Hook
 * 
 * Sync DataTable state with URL query parameters for bookmarkable/shareable links
 */

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type {
  PaginationState,
  SortingState,
  ColumnFiltersState,
  OnChangeFn,
} from '@tanstack/react-table'

export interface TableUrlStateOptions {
  /** Enable pagination state in URL */
  enablePagination?: boolean
  /** Enable sorting state in URL */
  enableSorting?: boolean
  /** Enable filters state in URL */
  enableFilters?: boolean
  /** Default pagination state */
  defaultPagination?: PaginationState
  /** Default sorting state */
  defaultSorting?: SortingState
  /** Default filters state */
  defaultFilters?: ColumnFiltersState
}

export interface TableUrlState {
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
  onPaginationChange: OnChangeFn<PaginationState>
  onSortingChange: OnChangeFn<SortingState>
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
}

/**
 * Hook to sync DataTable state with URL query parameters
 * 
 * @example
 * ```tsx
 * const {
 *   pagination,
 *   sorting,
 *   columnFilters,
 *   onPaginationChange,
 *   onSortingChange,
 *   onColumnFiltersChange,
 * } = useTableUrlState({
 *   enablePagination: true,
 *   enableSorting: true,
 *   enableFilters: true,
 * })
 * 
 * <DataTable
 *   data={data}
 *   columns={columns}
 *   pagination={pagination}
 *   onPaginationChange={onPaginationChange}
 *   sorting={sorting}
 *   onSortingChange={onSortingChange}
 *   columnFilters={columnFilters}
 *   onColumnFiltersChange={onColumnFiltersChange}
 * />
 * ```
 */
export function useTableUrlState(
  options: TableUrlStateOptions = {}
): TableUrlState {
  const {
    enablePagination = true,
    enableSorting = true,
    enableFilters = true,
    defaultPagination = { pageIndex: 0, pageSize: 10 },
    defaultSorting = [],
    defaultFilters = [],
  } = options

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchKey = searchParams?.toString() || ''
  const defaultSortingKey = JSON.stringify(defaultSorting)
  const defaultFiltersKey = JSON.stringify(defaultFilters)

  // Parse initial state from URL
  const parseInitialState = useCallback(() => {
    const params = new URLSearchParams(searchKey)
    const parsedDefaultSorting = JSON.parse(defaultSortingKey) as SortingState
    const parsedDefaultFilters = JSON.parse(defaultFiltersKey) as ColumnFiltersState

    // Parse pagination
    const pagination: PaginationState = {
      pageIndex: enablePagination
        ? parseInt(params.get('page') || String(defaultPagination.pageIndex))
        : defaultPagination.pageIndex,
      pageSize: enablePagination
        ? parseInt(params.get('pageSize') || String(defaultPagination.pageSize))
        : defaultPagination.pageSize,
    }

    // Parse sorting
    let sorting: SortingState = parsedDefaultSorting
    if (enableSorting) {
      const sortParam = params.get('sort')
      if (sortParam) {
        try {
          sorting = JSON.parse(sortParam)
        } catch (_error) {
          sorting = parsedDefaultSorting
        }
      }
    }

    // Parse filters
    let filters: ColumnFiltersState = parsedDefaultFilters
    if (enableFilters) {
      const filtersParam = params.get('filters')
      if (filtersParam) {
        try {
          filters = JSON.parse(filtersParam)
        } catch (_error) {
          filters = parsedDefaultFilters
        }
      }
    }

    return { pagination, sorting, filters }
  }, [
    searchKey,
    enablePagination,
    enableSorting,
    enableFilters,
    defaultPagination.pageIndex,
    defaultPagination.pageSize,
    defaultSortingKey,
    defaultFiltersKey,
  ])

  // State
  const [pagination, setPagination] = useState<PaginationState>(
    parseInitialState().pagination
  )
  const [sorting, setSorting] = useState<SortingState>(
    parseInitialState().sorting
  )
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    parseInitialState().filters
  )

  // Update URL when state changes
  const updateUrl = useCallback(
    (
      newPagination: PaginationState,
      newSorting: SortingState,
      newFilters: ColumnFiltersState
    ) => {
      const params = new URLSearchParams(searchParams?.toString() || '')

      // Update pagination params
      if (enablePagination) {
        params.set('page', String(newPagination.pageIndex))
        params.set('pageSize', String(newPagination.pageSize))
      }

      // Update sorting params
      if (enableSorting) {
        if (newSorting.length > 0) {
          params.set('sort', JSON.stringify(newSorting))
        } else {
          params.delete('sort')
        }
      }

      // Update filters params
      if (enableFilters) {
        if (newFilters.length > 0) {
          params.set('filters', JSON.stringify(newFilters))
        } else {
          params.delete('filters')
        }
      }

      // Push to router
      const newUrl = `${pathname}?${params.toString()}`
      router.push(newUrl, { scroll: false })
    },
    [
      router,
      pathname,
      searchParams,
      enablePagination,
      enableSorting,
      enableFilters,
    ]
  )

  // Handlers
  const handlePaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater(pagination) : updater
      setPagination(newPagination)
      updateUrl(newPagination, sorting, columnFilters)
    },
    [pagination, sorting, columnFilters, updateUrl]
  )

  const handleSortingChange: OnChangeFn<SortingState> = useCallback(
    (updater) => {
      const newSorting =
        typeof updater === 'function' ? updater(sorting) : updater
      setSorting(newSorting)
      // Reset to first page when sorting changes
      const resetPagination = { ...pagination, pageIndex: 0 }
      setPagination(resetPagination)
      updateUrl(resetPagination, newSorting, columnFilters)
    },
    [sorting, pagination, columnFilters, updateUrl]
  )

  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
    (updater) => {
      const newFilters =
        typeof updater === 'function' ? updater(columnFilters) : updater
      setColumnFilters(newFilters)
      // Reset to first page when filters change
      const resetPagination = { ...pagination, pageIndex: 0 }
      setPagination(resetPagination)
      updateUrl(resetPagination, sorting, newFilters)
    },
    [columnFilters, pagination, sorting, updateUrl]
  )

  // Sync with URL on mount and when URL changes
  useEffect(() => {
    const { pagination: urlPagination, sorting: urlSorting, filters: urlFilters } =
      parseInitialState()
    setPagination(urlPagination)
    setSorting(urlSorting)
    setColumnFilters(urlFilters)
  }, [parseInitialState])

  return {
    pagination,
    sorting,
    columnFilters,
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
  }
}
