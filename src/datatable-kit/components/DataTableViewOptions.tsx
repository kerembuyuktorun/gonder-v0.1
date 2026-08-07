'use client'

/**
 * DataTableViewOptions - Column visibility toggle
 */

import React from 'react'
import { Check, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { DataTableViewOptionsProps } from '../types'

const COLUMN_LABEL_OVERRIDES: Record<string, string> = {
  takip_no: 'Tracking No',
  gonderen_musteri: 'Sender Customer',
  gonderen_sube: 'Sender Branch',
  alici_sube: 'Receiver Branch',
  alici_musteri: 'Receiver Customer',
  alici_telefon: 'Receiver Phone',
  odeme_turu: 'Payment Type',
  fatura_turu: 'Invoice Type',
  matrah: 'Base Amount',
  kdv: 'VAT',
  toplam: 'Total',
  t_adet: 'Qty',
  t_desi: 'Volumetric Weight',
  parca_listesi: 'Piece List',
  irsaliye_no: 'Dispatch Note No',
  atf_no: 'ATF No',
  olusturulma_zamani: 'Created At',
  varis_zamani: 'Arrival Time',
  teslimat_zamani: 'Delivery Time',
  kargo_durumu: 'Shipment Status',
  fatura_durumu: 'Invoice Status',
  tahsilat_durumu: 'Collection Status',
  olusturan: 'Created By',
}

function prettifyColumnId(columnId: string) {
  return columnId
    .split('_')
    .filter(Boolean)
    .map((segment) => {
      const lower = segment.toLowerCase()
      if (lower === 'no') {
        return 'No'
      }
      if (lower === 'kdv' || lower === 'atf') {
        return lower.toUpperCase()
      }
      if (lower === 't') {
        return 'T.'
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(' ')
}

function resolveColumnLabel(
  columnId: string,
  header: unknown,
  metaLabel?: string
) {
  if (metaLabel && metaLabel.trim().length > 0) {
    return metaLabel
  }

  const overrideLabel = COLUMN_LABEL_OVERRIDES[columnId]
  if (overrideLabel) {
    return overrideLabel
  }

  if (typeof header === 'string' && header.trim().length > 0) {
    return header
  }

  return prettifyColumnId(columnId)
}

function DataTableViewOptionsComponent<TData>({
  table,
  label = 'View',
  columnsLabel = 'Columns',
  className,
}: DataTableViewOptionsProps<TData>) {
  const [localVisibility, setLocalVisibility] = React.useState<Record<string, boolean>>({})

  React.useEffect(() => {
    const nextVisibility: Record<string, boolean> = {}
    for (const column of table.getAllLeafColumns()) {
      nextVisibility[column.id] = column.getIsVisible()
    }
    setLocalVisibility(nextVisibility)
  }, [table])

  const toggleableColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide())

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('ml-auto hidden h-8 lg:flex', className)}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[220px] p-2">
        <p className="px-2 py-1 text-sm font-medium">{columnsLabel}</p>
        <div className="mt-1 max-h-80 space-y-1 overflow-y-auto pr-1 pb-1">
        {toggleableColumns.map((column) => {
            const isVisible = localVisibility[column.id] ?? column.getIsVisible()
            const columnLabel = resolveColumnLabel(
              column.id,
              column.columnDef.header,
              column.columnDef.meta?.label
            )
            return (
              <button
                key={column.id}
                type="button"
                className="hover:bg-accent hover:text-accent-foreground flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm"
                onClick={() => {
                  const nextVisibility = !isVisible
                  setLocalVisibility((prev) => ({
                    ...prev,
                    [column.id]: nextVisibility,
                  }))
                  column.toggleVisibility(nextVisibility)
                }}
              >
                <span className="mr-2 inline-flex w-4 items-center justify-center">
                  {isVisible ? <Check className="h-4 w-4" /> : null}
                </span>
                {columnLabel}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const DataTableViewOptions = React.memo(DataTableViewOptionsComponent) as typeof DataTableViewOptionsComponent
