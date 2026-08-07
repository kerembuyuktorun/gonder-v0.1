'use client'

import Link from 'next/link'
import {
  DataTable,
  DataTableColumnHeader,
} from '@hascanb/arf-ui-kit/datatable-kit'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useReportsOverview } from '../../_hooks/use-reports-analytics'
import type { CarrierPerformanceRow, DrilldownShipmentRef } from '../../_types/reports'
import { ReportCatalogGrid } from './report-catalog-grid'
import { ReportExcelExport } from './report-excel-export'
import { ReportKpiGrid } from './report-kpi-grid'
import { ReportTrendChart } from './report-trend-chart'
import { useReportDateRangeQuery } from './report-date-range-toolbar'
import { ReportsShell } from './reports-shell'

export function ReportsOverviewContent() {
  const { query } = useReportDateRangeQuery()
  const { data, isLoading } = useReportsOverview(query)

  const carrierColumns = useMemo<ColumnDef<CarrierPerformanceRow>[]>(
    () => [
      {
        accessorKey: 'carrier',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Taşıyıcı' />,
      },
      {
        accessorKey: 'shipments',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Hacim' />,
        cell: ({ row }) => (
          <span className='tabular-nums'>{row.original.shipments}</span>
        ),
      },
      {
        accessorKey: 'onTimeRate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='OTD %' />,
        cell: ({ row }) => (
          <span className='tabular-nums'>%{row.original.onTimeRate.toFixed(1)}</span>
        ),
      },
      {
        accessorKey: 'otifRate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='OTIF %' />,
        cell: ({ row }) => (
          <span className='tabular-nums'>%{row.original.otifRate.toFixed(1)}</span>
        ),
      },
      {
        accessorKey: 'p85TransitHours',
        header: ({ column }) => <DataTableColumnHeader column={column} title='P85 sa' />,
        cell: ({ row }) => (
          <span className='tabular-nums'>{row.original.p85TransitHours}</span>
        ),
      },
      {
        accessorKey: 'spendTry',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Harcama' />,
        cell: ({ row }) => (
          <span className='tabular-nums'>
            {new Intl.NumberFormat('tr-TR', {
              style: 'currency',
              currency: 'TRY',
              maximumFractionDigits: 0,
            }).format(row.original.spendTry)}
          </span>
        ),
      },
    ],
    []
  )

  const exceptionColumns = useMemo<ColumnDef<DrilldownShipmentRef>[]>(
    () => [
      {
        accessorKey: 'reference',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Referans' />,
        cell: ({ row }) => (
          <Link href={row.original.href} className='font-medium hover:underline'>
            {row.original.reference}
          </Link>
        ),
      },
      {
        accessorKey: 'carrier',
        header: 'Taşıyıcı',
      },
      {
        id: 'route',
        header: 'Rota',
        cell: ({ row }) => (
          <span className='text-muted-foreground'>
            {row.original.originCity} → {row.original.destinationCity}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Durum',
        cell: ({ row }) => (
          <Badge variant='outline' className='border-rose-500/20 bg-rose-500/10 text-rose-700'>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'transitHours',
        header: 'Transit',
        cell: ({ row }) => (
          <span className='tabular-nums text-muted-foreground'>
            {row.original.transitHours ?? '—'} sa
          </span>
        ),
      },
    ],
    []
  )

  return (
    <ReportsShell
      slug='overview'
      title='Genel bakış'
      description='Hacim, OTD, maliyet ve istisna özeti. Kartlar ilgili rapora drill-down eder.'
    >
      {isLoading || !data ? (
        <p className='text-sm text-muted-foreground'>Rapor yükleniyor…</p>
      ) : (
        <>
          <ReportKpiGrid kpis={data.kpis} />

          <div className='grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]'>
            <ReportTrendChart
              title='Gönderi & teslim trendi'
              description='Aggregate günlük seri (backend query kontratı)'
              data={data.series}
              variant='volume'
            />
            <Card className='gap-0 py-0 shadow-sm'>
              <CardHeader className='flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2'>
                <CardTitle className='text-sm font-semibold'>Taşıyıcı özeti</CardTitle>
                <ReportExcelExport
                  data={data.topCarriers}
                  filename='carrier-overview'
                  columns={carrierColumns}
                />
              </CardHeader>
              <CardContent className='px-2 pb-3'>
                <DataTable
                  columns={carrierColumns}
                  data={data.topCarriers}
                  emptyMessage='Veri yok'
                />
              </CardContent>
            </Card>
          </div>

          <Card className='gap-0 py-0 shadow-sm'>
            <CardHeader className='space-y-0.5 px-4 pt-4 pb-2'>
              <CardTitle className='text-sm font-semibold'>Son istisnalar</CardTitle>
              <p className='text-xs text-muted-foreground'>
                Özetten gönderi listesine drill-down
              </p>
            </CardHeader>
            <CardContent className='px-2 pb-3'>
              <DataTable
                columns={exceptionColumns}
                data={data.recentExceptions}
                emptyMessage='İstisna yok'
              />
            </CardContent>
          </Card>

          <div className='space-y-2'>
            <p className='text-sm font-semibold'>Tüm raporlar</p>
            <ReportCatalogGrid />
          </div>
        </>
      )}
    </ReportsShell>
  )
}
