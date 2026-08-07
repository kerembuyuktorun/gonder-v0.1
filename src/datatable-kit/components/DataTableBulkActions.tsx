'use client'

/**
 * DataTableBulkActions - Multi-Row Actions Bar
 * 
 * Seçili satırlar için toplu işlemler
 */

import React from 'react'
import { Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DataTableBulkActionsProps } from '../types'

function DataTableBulkActionsComponent<TData>({
  table,
  onDelete,
  children,
}: DataTableBulkActionsProps<TData>) {
  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length

  if (selectedRowCount === 0) {
    return null
  }

  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/50 px-4 py-2">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium text-muted-foreground">
          {selectedRowCount} row(s) selected
        </p>
        
        {/* Custom bulk actions */}
        {children}
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Delete action */}
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const selectedRows = table.getFilteredSelectedRowModel().rows
              onDelete(selectedRows.map((row) => row.original))
              table.resetRowSelection()
            }}
            className="h-8"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
        
        {/* Clear selection */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => table.resetRowSelection()}
          className="h-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export const DataTableBulkActions = React.memo(DataTableBulkActionsComponent) as typeof DataTableBulkActionsComponent
