'use client'

import { useMemo } from 'react'
import {
  DataTable,
  DataTableColumnHeader,
} from '@hascanb/arf-ui-kit/datatable-kit'
import type { ColumnDef } from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCarrierPerformanceReport } from '../../_hooks/use-reports-analytics'
import type { CarrierPerformanceRow } from '../../_types/reports'
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

export function CarrierPerformanceReportContent() {
  const { query } = useReportDateRangeQuery()
  const { data, isLoading } = useCarrierPerformanceReport(query)

  const columns = useMemo<ColumnDef<CarrierPerformanceRow>[]>(
    () => [
      {
        accessorKey: 'carrier',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Taşıyıcı' />,
        cell: ({ row }) => <span className='font-medium'>{row.original.carrier}</span>,
      },
      {
        accessorKey: 'shipments',
        header: 'Hacim',
        cell: ({ row }) => <span className='tabular-nums'>{row.original.shipments}</span>,
      },
      {
        accessorKey: 'onTimeRate',
        header: 'OTD %',
        cell: ({ row }) => <span className='tabular-nums'>%{row.original.onTimeRate}</span>,
      },
      {
        accessorKey: 'otifRate',
        header: 'OTIF %',
        cell: ({ row }) => <span className='tabular-nums'>%{row.original.otifRate}</span>,
      },
      {
        accessorKey: 'p50TransitHours',
        header: 'P50',
        cell: ({ row }) => (
          <span className='tabular-nums'>{row.original.p50TransitHours} sa</span>
        ),
      },
      {
        accessorKey: 'p85TransitHours',
        header: 'P85',
        cell: ({ row }) => (
          <span className='tabular-nums'>{row.original.p85TransitHours} sa</span>
        ),
      },
      {
        accessorKey: 'p95TransitHours',
        header: 'P95',
        cell: ({ row }) => (
          <span className='tabular-nums'>{row.original.p95TransitHours} sa</span>
        ),
      },
      {
        accessorKey: 'exceptionRate',
        header: 'İstisna %',
        cell: ({ row }) => (
          <span className='tabular-nums'>%{row.original.exceptionRate}</span>
        ),
      },
      {
        accessorKey: 'avgCostTry',
        header: 'Ort. maliyet',
        cell: ({ row }) => (
          <span className='tabular-nums'>{formatTry(row.original.avgCostTry)}</span>
        ),
      },
      {
        accessorKey: 'spendTry',
        header: 'Harcama',
        cell: ({ row }) => (
          <span className='tabular-nums'>{formatTry(row.original.spendTry)}</span>
        ),
      },
    ],
    []
  )

  const barData =
    data?.carriers.map((row) => ({
      label: row.carrier.split(' ')[0] ?? row.carrier,
      count: row.onTimeRate,
    })) ?? []

  return (
    <ReportsShell
      slug='carrier-performance'
      title='Taşıyıcı performansı'
      description='Normalize OTD/OTIF, transit yüzdelikleri ve harcama karşılaştırması'
    >
      {isLoading || !data ? (
        <p className='text-sm text-muted-foreground'>Rapor yükleniyor…</p>
      ) : (
        <>
          <ReportKpiGrid kpis={data.kpis} />
          <ReportTrendChart
            title='OTD karşılaştırması'
            description='Taşıyıcılar aynı ölçütlerle normalize edilir'
            data={barData}
            variant='bars'
            barKey='count'
            barLabel='OTD %'
          />
          <Card className='gap-0 py-0 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2'>
              <CardTitle className='text-sm font-semibold'>Taşıyıcı skor kartı</CardTitle>
              <ReportExcelExport
                data={data.carriers}
                filename='carrier-performance'
                columns={columns}
              />
            </CardHeader>
            <CardContent className='px-2 pb-3'>
              <DataTable columns={columns} data={data.carriers} emptyMessage='Veri yok' />
            </CardContent>
          </Card>
        </>
      )}
    </ReportsShell>
  )
}
