'use client'

import { useMemo } from 'react'
import {
  DataTable,
  DataTableColumnHeader,
} from '@hascanb/arf-ui-kit/datatable-kit'
import type { ColumnDef } from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useReturnsReport } from '../../_hooks/use-reports-analytics'
import type { ReturnReasonRow } from '../../_types/reports'
import { ReportExcelExport } from './report-excel-export'
import { ReportKpiGrid } from './report-kpi-grid'
import { ReportTrendChart } from './report-trend-chart'
import { useReportDateRangeQuery } from './report-date-range-toolbar'
import { ReportsShell } from './reports-shell'

function formatTry(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value)
}

export function ReturnsReportContent() {
  const { query } = useReportDateRangeQuery()
  const { data, isLoading } = useReturnsReport(query)

  const columns = useMemo<ColumnDef<ReturnReasonRow>[]>(
    () => [
      {
        accessorKey: 'reason',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Neden' />,
      },
      {
        accessorKey: 'count',
        header: 'Adet',
        cell: ({ row }) => <span className='tabular-nums'>{row.original.count}</span>,
      },
      {
        accessorKey: 'sharePct',
        header: 'Pay',
        cell: ({ row }) => <span className='tabular-nums'>%{row.original.sharePct}</span>,
      },
      {
        accessorKey: 'costTry',
        header: 'Maliyet',
        cell: ({ row }) => (
          <span className='tabular-nums'>{formatTry(row.original.costTry)}</span>
        ),
      },
    ],
    []
  )

  return (
    <ReportsShell
      slug='returns'
      title='İadeler'
      description='İade oranı, neden dağılımı ve iade başına maliyet'
    >
      {isLoading || !data ? (
        <p className='text-sm text-muted-foreground'>Rapor yükleniyor…</p>
      ) : (
        <>
          <ReportKpiGrid kpis={data.kpis} />
          <ReportTrendChart title='İade trendi' data={data.series} variant='returns' />
          <Card className='gap-0 py-0 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2'>
              <CardTitle className='text-sm font-semibold'>İade nedenleri</CardTitle>
              <ReportExcelExport
                data={data.reasons}
                filename='return-reasons'
                columns={columns}
              />
            </CardHeader>
            <CardContent className='px-2 pb-3'>
              <DataTable columns={columns} data={data.reasons} emptyMessage='Veri yok' />
            </CardContent>
          </Card>
        </>
      )}
    </ReportsShell>
  )
}
