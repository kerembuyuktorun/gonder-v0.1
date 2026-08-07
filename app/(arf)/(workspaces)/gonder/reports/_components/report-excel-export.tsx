'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Download } from 'lucide-react'
import { exportToExcel } from '@hascanb/arf-ui-kit/datatable-kit'
import { Button } from '@/components/ui/button'

type Props<TData> = {
  data: TData[]
  filename: string
  columns?: ColumnDef<TData, unknown>[]
  label?: string
}

export function ReportExcelExport<TData>({
  data,
  filename,
  columns,
  label = 'Excel',
}: Props<TData>) {
  return (
    <Button
      type='button'
      size='sm'
      variant='outline'
      className='h-8 gap-1.5'
      disabled={!data.length}
      onClick={() =>
        exportToExcel(data, {
          filename,
          sheetName: 'Rapor',
          columns,
        })
      }
    >
      <Download className='size-3.5' />
      {label}
    </Button>
  )
}
