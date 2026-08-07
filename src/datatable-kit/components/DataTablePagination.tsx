'use client'

/**
 * DataTablePagination - Pagination Controls
 * 
 * Sayfa navigasyonu ve sayfa boyutu seçici
 */

import React from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DataTablePaginationProps } from '../types'

function DataTablePaginationComponent<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  showPageInfo = true,
  showPageSizeSelector = true,
  totalRows,
}: DataTablePaginationProps<TData>) {
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount()
  const pageSize = table.getState().pagination.pageSize
  const resolvedTotalRows = totalRows ?? table.getFilteredRowModel().rows.length
  const startRow = resolvedTotalRows === 0 ? 0 : currentPage * pageSize - pageSize + 1
  const endRow = Math.min(currentPage * pageSize, resolvedTotalRows)

  return (
    <div className="flex items-center justify-between px-2 py-4">
      {/* Left: Page info & size selector */}
      <div className="flex items-center space-x-6">
        {showPageInfo && (
          <div className="flex-1 text-sm text-muted-foreground">
            {startRow} - {endRow} / {resolvedTotalRows} satır
          </div>
        )}
        
        {showPageSizeSelector && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Sayfa başına satır</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value: string) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Right: Navigation buttons */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center justify-center text-sm font-medium">
          Sayfa {currentPage} / {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">İlk sayfaya git</span>
            <ChevronsLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Önceki sayfaya git</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Sonraki sayfaya git</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Son sayfaya git</span>
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export const DataTablePagination = React.memo(DataTablePaginationComponent) as typeof DataTablePaginationComponent
