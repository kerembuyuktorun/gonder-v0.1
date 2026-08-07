'use client'

import { useMemo } from 'react'
import {
  DataTable,
  DataTableColumnHeader,
} from '@hascanb/arf-ui-kit/datatable-kit'
import type { ColumnDef } from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuotesReport } from '../../_hooks/use-reports-analytics'
import type { QuoteFunnelRow } from '../../_types/reports'
import { ReportExcelExport } from './report-excel-export'
import { ReportKpiGrid } from './report-kpi-grid'
import { ReportTrendChart } from './report-trend-chart'
import { useReportDateRangeQuery } from './report-date-range-toolbar'
import { ReportsShell } from './reports-shell'

export function QuotesReportContent() {
  const { query } = useReportDateRangeQuery()
  const { data, isLoading } = useQuotesReport(query)

  const columns = useMemo<ColumnDef<QuoteFunnelRow>[]>(
    () => [
      {
        accessorKey: 'stage',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Aşama' />,
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
    ],
    []
  )

  return (
    <ReportsShell
      slug='quotes'
      title='Teklifler'
      description='Teklif hunisi ve kazanılan fiyat özeti'
    >
      {isLoading || !data ? (
        <p className='text-sm text-muted-foreground'>Rapor yükleniyor…</p>
      ) : (
        <>
          <ReportKpiGrid kpis={data.kpis} />
          <ReportTrendChart
            title='Huni dağılımı'
            data={data.funnel.map((row) => ({ label: row.stage, count: row.count }))}
            variant='bars'
            barKey='count'
            barLabel='Teklif'
          />
          <Card className='gap-0 py-0 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2'>
              <CardTitle className='text-sm font-semibold'>Funnel tablosu</CardTitle>
              <ReportExcelExport
                data={data.funnel}
                filename='quotes-funnel'
                columns={columns}
              />
            </CardHeader>
            <CardContent className='px-2 pb-3'>
              <DataTable columns={columns} data={data.funnel} emptyMessage='Veri yok' />
            </CardContent>
          </Card>
        </>
      )}
    </ReportsShell>
  )
}
