'use client'

/**
 * DataTable - Main Component
 *
 * TanStack Table tabanlı, feature-rich veri tablosu bileşeni
 */

import React, { useMemo, useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getExpandedRowModel,
  flexRender,
  type ColumnDef,
  type Row,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { DataTableProps } from '../types'
import { useDataTableState } from '../hooks/useDataTableState'
import { kitLogger } from '../../_shared/logger'

export function DataTable<TData>({
  data,
  columns,

  // Pagination
  enablePagination = true,
  pagination,
  onPaginationChange,
  pageCount,
  manualPagination = false,

  // Sorting
  enableSorting = true,
  sorting,
  onSortingChange,
  manualSorting = false,
  enableMultiSort = true,

  // Filtering
  enableGlobalFilter = true,
  globalFilter,
  onGlobalFilterChange,
  columnFilters,
  onColumnFiltersChange,
  manualFiltering = false,

  // Column Visibility
  enableColumnVisibility = true,
  columnVisibility,
  onColumnVisibilityChange,

  // Row Selection
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
  enableMultiRowSelection = true,
  getRowId,

  // Layout
  enableHorizontalScroll = true,
  virtualized = false,
  tableHeight = 480,
  estimateRowHeight = 52,
  overscan = 8,
  stickyFirstColumn = false,
  stickyLeftColumnCount = 0,
  stickyLastColumn = false,
  stickyRightColumnCount = 0,

  // Advanced rows
  renderRowActions,
  renderSubComponent,
  expandOnRowClick = false,
  allowVirtualizedExpansion = false,

  // Styling
  className,
  tableClassName,

  // States
  isLoading = false,
  emptyMessage = 'Veri bulunamadı.',
  loadingMessage = 'Yükleniyor...',

  // Callbacks
  onRowClick,
  onRowDoubleClick,
  onTableReady,
}: DataTableProps<TData>) {
  const {
    state: internalState,
    setPagination,
    setSorting,
    setGlobalFilter,
    setColumnFilters,
    setColumnVisibility,
    setRowSelection,
    setExpanded,
  } = useDataTableState()

  const tableContainerRef = useRef<HTMLDivElement>(null)

  const paginationState = pagination ?? internalState.pagination
  const sortingState = sorting ?? internalState.sorting
  const globalFilterState = globalFilter ?? internalState.globalFilter
  const columnFiltersState = columnFilters ?? internalState.columnFilters
  const columnVisibilityState = columnVisibility ?? internalState.columnVisibility
  const rowSelectionState = rowSelection ?? internalState.rowSelection
  const expandedState = internalState.expanded
  const canRenderExpandedRows = !!renderSubComponent && (!virtualized || allowVirtualizedExpansion)

  const computedColumns = useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (!renderRowActions) {
      return columns as ColumnDef<TData, unknown>[]
    }

    return [
      ...(columns as ColumnDef<TData, unknown>[]),
      {
        id: '__inline_actions__',
        header: 'Actions',
        cell: ({ row }) => renderRowActions(row.original),
      },
    ]
  }, [columns, renderRowActions])

  const table = useReactTable<TData>({
    data,
    columns: computedColumns,
    defaultColumn: {
      minSize: 140,
      maxSize: 640,
    },

    getCoreRowModel: getCoreRowModel(),

    ...(enablePagination && {
      getPaginationRowModel: getPaginationRowModel(),
      manualPagination,
      pageCount,
    }),

    ...(enableSorting && {
      getSortedRowModel: getSortedRowModel(),
      manualSorting,
      enableMultiSort,
    }),

    ...(enableGlobalFilter && {
      getFilteredRowModel: getFilteredRowModel(),
      getFacetedRowModel: getFacetedRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues(),
      manualFiltering,
      globalFilterFn: 'includesString',
    }),

    ...(canRenderExpandedRows && {
      getExpandedRowModel: getExpandedRowModel(),
      enableExpanding: true,
      getRowCanExpand: () => true,
    }),

    state: {
      ...(enablePagination && { pagination: paginationState }),
      ...(enableSorting && { sorting: sortingState }),
      ...(enableGlobalFilter && { globalFilter: globalFilterState }),
      columnFilters: columnFiltersState,
      ...(enableColumnVisibility && { columnVisibility: columnVisibilityState }),
      ...(enableRowSelection && { rowSelection: rowSelectionState }),
      ...(canRenderExpandedRows && { expanded: expandedState }),
    },

    onPaginationChange: onPaginationChange ?? setPagination,
    onSortingChange: onSortingChange ?? setSorting,
    onGlobalFilterChange: onGlobalFilterChange ?? setGlobalFilter,
    onColumnFiltersChange: onColumnFiltersChange ?? setColumnFilters,
    onColumnVisibilityChange: onColumnVisibilityChange ?? setColumnVisibility,
    onRowSelectionChange: onRowSelectionChange ?? setRowSelection,
    ...(canRenderExpandedRows && { onExpandedChange: setExpanded }),

    enableRowSelection,
    enableMultiRowSelection,
    ...(getRowId && { getRowId }),
  })

  React.useEffect(() => {
    if (onTableReady) {
      onTableReady(table)
    }
  }, [table, onTableReady])

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && virtualized && renderSubComponent && !allowVirtualizedExpansion) {
      kitLogger.warn(
        'DataTable: expanded sub-rows are disabled while virtualization is enabled unless allowVirtualizedExpansion is explicitly set to true.'
      )
    }
  }, [allowVirtualizedExpansion, renderSubComponent, virtualized])

  const rows = table.getRowModel().rows

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => estimateRowHeight,
    overscan,
  })

  const virtualRows = virtualized ? rowVirtualizer.getVirtualItems() : []
  const totalVirtualSize = virtualized ? rowVirtualizer.getTotalSize() : 0
  const paddingTop = virtualized && virtualRows.length > 0 ? virtualRows[0].start : 0
  const paddingBottom =
    virtualized && virtualRows.length > 0
      ? totalVirtualSize - virtualRows[virtualRows.length - 1].end
      : 0

  const hasInteractiveRow = !!onRowClick || !!onRowDoubleClick || (expandOnRowClick && canRenderExpandedRows)

  const resolveStickyRightCount = (columnCount: number) => {
    if (stickyRightColumnCount > 0) {
      return Math.min(stickyRightColumnCount, columnCount)
    }

    return stickyLastColumn ? 1 : 0
  }

  const resolveStickyLeftCount = (columnCount: number) => {
    if (stickyLeftColumnCount > 0) {
      return Math.min(stickyLeftColumnCount, columnCount)
    }

    return stickyFirstColumn ? 1 : 0
  }

  const getStickyLeftOffset = (columnSizes: number[], index: number, stickyLeftCount: number) => {
    if (stickyLeftCount === 0 || index >= stickyLeftCount) {
      return null
    }

    return columnSizes.slice(0, index).reduce((sum, size) => sum + size, 0)
  }

  const getStickyRightOffset = (columnSizes: number[], index: number, stickyRightCount: number) => {
    const firstStickyIndex = columnSizes.length - stickyRightCount

    if (stickyRightCount === 0 || index < firstStickyIndex) {
      return null
    }

    return columnSizes.slice(index + 1).reduce((sum, nextSize) => sum + nextSize, 0)
  }

  const renderMainRow = (row: Row<TData>) => (
    <React.Fragment key={row.id}>
      <TableRow
        data-state={row.getIsSelected() && 'selected'}
        onClick={() => {
          if (canRenderExpandedRows && expandOnRowClick) {
            row.toggleExpanded()
          }
          onRowClick?.(row.original)
        }}
        onDoubleClick={() => onRowDoubleClick?.(row.original)}
        className={hasInteractiveRow ? 'cursor-pointer' : undefined}
      >
        {(() => {
          const visibleCells = row.getVisibleCells()
          const stickyLeftCount = resolveStickyLeftCount(visibleCells.length)
          const stickyRightCount = resolveStickyRightCount(visibleCells.length)
          const columnSizes = visibleCells.map((cell) => cell.column.getSize())

          return visibleCells.map((cell, index: number) => {
            const stickyLeftOffset = getStickyLeftOffset(columnSizes, index, stickyLeftCount)
            const stickyRightOffset = getStickyRightOffset(columnSizes, index, stickyRightCount)
            const columnSize = cell.column.getSize()

            return (
              <TableCell
                key={cell.id}
                style={{
                  width: columnSize,
                  minWidth: columnSize,
                  maxWidth: columnSize,
                  ...(stickyLeftOffset !== null || stickyRightOffset !== null
                    ? { position: 'sticky' as const }
                    : {}),
                  ...(stickyLeftOffset !== null ? { left: `${stickyLeftOffset}px` } : {}),
                  ...(stickyRightOffset !== null ? { right: `${stickyRightOffset}px` } : {}),
                }}
                className={cn(
                  // Sticky action columns need overflow visible so primary+overflow controls aren't clipped.
                  stickyRightOffset !== null ? 'overflow-visible' : 'overflow-hidden',
                  stickyLeftOffset !== null
                    ? 'z-20 bg-background'
                    : stickyRightOffset !== null
                      ? 'z-30 bg-background shadow-[-8px_0_12px_-10px_rgba(15,23,42,0.35)]'
                      : undefined
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            )
          })
        })()}
      </TableRow>

      {canRenderExpandedRows && row.getIsExpanded() && (
        <TableRow>
          <TableCell colSpan={row.getVisibleCells().length} className='bg-muted/40'>
            {renderSubComponent(row.original)}
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  )

  const hasStickyColumns =
    stickyFirstColumn || stickyLeftColumnCount > 0 || stickyLastColumn || stickyRightColumnCount > 0

  const tableContent = (
    <Table
      className={cn(hasStickyColumns && 'table-fixed', tableClassName)}
      style={
        hasStickyColumns
          ? { width: table.getTotalSize(), minWidth: table.getTotalSize() }
          : undefined
      }
    >
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {(() => {
              const headerSizes = headerGroup.headers.map((currentHeader) => currentHeader.getSize())
              const stickyLeftCount = resolveStickyLeftCount(headerGroup.headers.length)
              const stickyRightCount = resolveStickyRightCount(headerGroup.headers.length)

              return headerGroup.headers.map((header) => {
                const stickyLeftOffset = getStickyLeftOffset(headerSizes, header.index, stickyLeftCount)
                const stickyRightOffset = getStickyRightOffset(headerSizes, header.index, stickyRightCount)
                const headerSize = header.getSize()
                const isStickyHeader = stickyLeftOffset !== null || stickyRightOffset !== null

                return (
                  <TableHead
                    key={header.id}
                    style={{
                      width: headerSize,
                      minWidth: headerSize,
                      maxWidth: headerSize,
                      position: isStickyHeader ? 'sticky' : undefined,
                      ...(stickyLeftOffset !== null ? { left: `${stickyLeftOffset}px` } : {}),
                      ...(stickyRightOffset !== null ? { right: `${stickyRightOffset}px` } : {}),
                    }}
                    className={cn(
                      stickyRightOffset !== null ? 'overflow-visible' : 'overflow-hidden',
                      stickyLeftOffset !== null
                        ? 'z-30 bg-slate-50'
                        : stickyRightOffset !== null
                          ? 'z-40 bg-slate-50 shadow-[-8px_0_12px_-10px_rgba(15,23,42,0.35)]'
                          : undefined
                    )}
                  >
                    <div className='pr-2 whitespace-nowrap'>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  </TableHead>
                )
              })
            })()}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={computedColumns.length} className='h-24 text-center'>
              {loadingMessage}
            </TableCell>
          </TableRow>
        ) : rows?.length ? (
          virtualized ? (
            <>
              {paddingTop > 0 && (
                <TableRow>
                  <TableCell colSpan={computedColumns.length} style={{ height: `${paddingTop}px` }} />
                </TableRow>
              )}

              {virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index]
                return row ? renderMainRow(row) : null
              })}

              {paddingBottom > 0 && (
                <TableRow>
                  <TableCell colSpan={computedColumns.length} style={{ height: `${paddingBottom}px` }} />
                </TableRow>
              )}
            </>
          ) : (
            rows.map((row) => renderMainRow(row))
          )
        ) : (
          <TableRow>
            <TableCell colSpan={computedColumns.length} className='h-24 text-center'>
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )

  return (
      <div className={className}>
        {enableHorizontalScroll ? (
          <ScrollArea className='rounded-md border'>
            <div
              className={`relative min-w-max ${
                stickyFirstColumn || stickyLeftColumnCount > 0 || stickyLastColumn || stickyRightColumnCount > 0
                  ? '**:data-[slot=table-container]:overflow-visible'
                  : ''
              }`}
              ref={virtualized ? tableContainerRef : undefined}
              style={virtualized ? { maxHeight: tableHeight, overflowY: 'auto' } : undefined}
            >
              {tableContent}
            </div>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        ) : (
          <div
            className='rounded-md border'
            ref={virtualized ? tableContainerRef : undefined}
            style={virtualized ? { maxHeight: tableHeight, overflowY: 'auto' } : undefined}
          >
            {tableContent}
          </div>
        )}
      </div>
  )
}
