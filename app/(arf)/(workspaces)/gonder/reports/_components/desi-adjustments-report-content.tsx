'use client'

import { useMemo } from 'react'
import {
  DataTable,
  DataTableColumnHeader,
} from '@hascanb/arf-ui-kit/datatable-kit'
import type { ColumnDef } from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDesiAdjustmentsReport } from '../../_hooks/use-reports-analytics'
import type { DesiAuditRow } from '../../_types/reports'
import { ReportExcelExport } from './report-excel-export'
import { ReportKpiGrid } from './report-kpi-grid'
import { useReportDateRangeQuery } from './report-date-range-toolbar'
import { ReportsShell } from './reports-shell'

function formatTry(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value)
}

export function DesiAdjustmentsReportContent() {
  const { query } = useReportDateRangeQuery()
  const { data, isLoading } = useDesiAdjustmentsReport(query)

  const columns = useMemo<ColumnDef<DesiAuditRow>[]>(
    () => [
      {
        accessorKey: 'carrier',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Taşıyıcı' />,
      },
      {
        accessorKey: 'adjustments',
        header: 'Düzeltme',
        cell: ({ row }) => <span className='tabular-nums'>{row.original.adjustments}</span>,
      },
      {
        accessorKey: 'avgDeltaDesi',
        header: 'Ort. Δ desi',
        cell: ({ row }) => <span className='tabular-nums'>{row.original.avgDeltaDesi}</span>,
      },
      {
        accessorKey: 'billedWeightGapKg',
        header: 'Billed gap',
        cell: ({ row }) => (
          <span className='tabular-nums'>{row.original.billedWeightGapKg} kg</span>
        ),
      },
      {
        accessorKey: 'surchargeTry',
        header: 'Ek ücret',
        cell: ({ row }) => (
          <span className='tabular-nums'>{formatTry(row.original.surchargeTry)}</span>
        ),
      },
      {
        accessorKey: 'disputeRate',
        header: 'İtiraz %',
        cell: ({ row }) => (
          <span className='tabular-nums'>%{row.original.disputeRate}</span>
        ),
      },
    ],
    []
  )

  return (
    <ReportsShell
      slug='desi-adjustments'
      title='Desi farkları'
      description='Declared vs measured desi, billed weight gap ve ek ücret audit'
    >
      {isLoading || !data ? (
        <p className='text-sm text-muted-foreground'>Rapor yükleniyor…</p>
      ) : (
        <>
          <ReportKpiGrid kpis={data.kpis} />
          <Card className='gap-0 py-0 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2'>
              <CardTitle className='text-sm font-semibold'>Taşıyıcı desi audit</CardTitle>
              <ReportExcelExport
                data={data.byCarrier}
                filename='desi-audit'
                columns={columns}
              />
            </CardHeader>
            <CardContent className='px-2 pb-3'>
              <DataTable columns={columns} data={data.byCarrier} emptyMessage='Veri yok' />
            </CardContent>
          </Card>
        </>
      )}
    </ReportsShell>
  )
}
