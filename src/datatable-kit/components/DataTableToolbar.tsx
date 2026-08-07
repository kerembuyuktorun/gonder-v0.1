'use client'

/**
 * DataTableToolbar - Search, Filters & Actions
 * 
 * Global search, filter controls, ve toolbar actions
 */

import React from 'react'
import { SearchIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { DataTableToolbarProps } from '../types'
import { DataTableViewOptions } from './DataTableViewOptions'

function DataTableToolbarComponent<TData>({
  table,
  searchKey,
  searchValue,
  onSearchValueChange,
  isSearchPending = false,
  showColumnSelector = true,
  searchPlaceholder = 'Search...',
  resetLabel = 'Reset',
  viewLabel = 'View',
  columnsLabel = 'Columns',
  children,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || !!table.getState().globalFilter
  const resolvedSearchValue = searchKey
    ? searchValue ?? ((table.getColumn(searchKey)?.getFilterValue() as string) ?? '')
    : ''

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* Global Search */}
        {searchKey && (
          <div className="relative w-full max-w-sm">
            <SearchIcon
              className={`absolute left-2 top-2.5 h-4 w-4 text-muted-foreground ${isSearchPending ? 'animate-pulse' : ''}`}
            />
            <Input
              placeholder={searchPlaceholder}
              value={resolvedSearchValue}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                if (onSearchValueChange) {
                  onSearchValueChange(event.target.value)
                  return
                }

                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }}
              className="h-9 w-full pl-8"
            />
          </div>
        )}
        
        {/* Custom filters/actions slot */}
        {children}
        
        {/* Clear filters button */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              onSearchValueChange?.('')
              table.resetColumnFilters()
              table.setGlobalFilter('')
            }}
            className="h-8 px-2 lg:px-3"
          >
            {resetLabel}
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Right side: Column selector */}
      {showColumnSelector && <DataTableViewOptions table={table} label={viewLabel} columnsLabel={columnsLabel} />}
    </div>
  )
}

export const DataTableToolbar = React.memo(DataTableToolbarComponent) as typeof DataTableToolbarComponent
