'use client'

import { useMemo } from 'react'
import {
  DataTable,
  DataTableColumnHeader,
} from '@hascanb/arf-ui-kit/datatable-kit'
import type { ColumnDef } from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCostRevenueReport } from '../../_hooks/use-reports-analytics'
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

type CarrierCostRow = {
  carrier: string
  costTry: number
  revenueTry: number
  costToRevenuePct: number
}

export function CostRevenueReportContent() {
  const { query } = useReportDateRangeQuery()
  const { data, isLoading } = useCostRevenueReport(query)

  const columns = useMemo<ColumnDef<CarrierCostRow>[]>(
    () => [
      {
        accessorKey: 'carrier',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Taşıyıcı' />,
      },
      {
        accessorKey: 'costTry',
        header: 'Maliyet',
        cell: ({ row }) => (
          <span className='tabular-nums'>{formatTry(row.original.costTry)}</span>
        ),
      },
      {
        accessorKey: 'revenueTry',
        header: 'Ciro',
        cell: ({ row }) => (
          <span className='tabular-nums'>{formatTry(row.original.revenueTry)}</span>
        ),
      },
      {
        accessorKey: 'costToRevenuePct',
        header: 'Kargo / ciro',
        cell: ({ row }) => (
          <span className='tabular-nums'>%{row.original.costToRevenuePct}</span>
        ),
      },
    ],
    []
  )

  return (
    <ReportsShell
      slug='cost-revenue'
      title='Maliyet & ciro'
      description='Gönderi başına maliyet ve kargo maliyetinin sipariş cirosuna oranı'
    >
      {isLoading || !data ? (
        <p className='text-sm text-muted-foreground'>Rapor yükleniyor…</p>
      ) : (
        <>
          <ReportKpiGrid kpis={data.kpis} />
          <ReportTrendChart title='Maliyet vs ciro' data={data.series} variant='cost' />
          <Card className='gap-0 py-0 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2'>
              <div>
                <CardTitle className='text-sm font-semibold'>Taşıyıcı bazında</CardTitle>
                <p className='text-xs text-muted-foreground'>
                  Ort. gönderi maliyeti: {formatTry(data.costPerShipmentTry)}
                </p>
              </div>
              <ReportExcelExport
                data={data.byCarrier}
                filename='cost-revenue-by-carrier'
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
