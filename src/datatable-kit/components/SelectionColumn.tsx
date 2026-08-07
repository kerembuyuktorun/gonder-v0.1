'use client'

/**
 * SelectionColumn - Row Selection Column Helper
 * 
 * Checkbox column oluşturma helper'ı
 * Header checkbox: Select all on page
 * Cell checkbox: Individual row selection
 */

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import type { ColumnDef } from '@tanstack/react-table'

export function createSelectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: 'select',
    size: 48,
    minSize: 48,
    maxSize: 48,
    meta: {
      headerClassName: 'w-12 px-2',
      cellClassName: 'w-12 px-2',
    },
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  }
}
