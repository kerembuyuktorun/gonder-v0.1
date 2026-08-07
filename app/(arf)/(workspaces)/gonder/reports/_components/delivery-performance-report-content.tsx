'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import {
  DataTable,
  DataTableColumnHeader,
} from '@hascanb/arf-ui-kit/datatable-kit'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDeliveryPerformanceReport } from '../../_hooks/use-reports-analytics'
import type { DrilldownShipmentRef } from '../../_types/reports'
import { ReportExcelExport } from './report-excel-export'
import { ReportKpiGrid } from './report-kpi-grid'
import { ReportTrendChart } from './report-trend-chart'
import { useReportDateRangeQuery } from './report-date-range-toolbar'
import { ReportsShell } from './reports-shell'

export function DeliveryPerformanceReportContent() {
  const { query } = useReportDateRangeQuery()
  const { data, isLoading } = useDeliveryPerformanceReport(query)

  const lateColumns = useMemo<ColumnDef<DrilldownShipmentRef>[]>(
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
      { accessorKey: 'carrier', header: 'Taşıyıcı' },
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
        accessorKey: 'transitHours',
        header: 'Transit',
        cell: ({ row }) => (
          <span className='tabular-nums'>{row.original.transitHours ?? '—'} sa</span>
        ),
      },
      {
        accessorKey: 'deliveredOnTime',
        header: 'OTD',
        cell: ({ row }) => (
          <Badge
            variant='outline'
            className={
              row.original.deliveredOnTime
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'
                : 'border-rose-500/20 bg-rose-500/10 text-rose-700'
            }
          >
            {row.original.deliveredOnTime ? 'Zamanında' : 'Gecikmeli'}
          </Badge>
        ),
      },
    ],
    []
  )

  return (
    <ReportsShell
      slug='delivery-performance'
      title='Teslim performansı'
      description='On-time delivery ve transit süre P50 / P85 / P95 dağılımı'
    >
      {isLoading || !data ? (
        <p className='text-sm text-muted-foreground'>Rapor yükleniyor…</p>
      ) : (
        <>
          <ReportKpiGrid kpis={data.kpis} />
          <div className='grid gap-3 xl:grid-cols-2'>
            <ReportTrendChart
              title='Transit süre dağılımı'
              description='Ortalama yerine yüzdelik / bucket yaklaşımı'
              data={data.transitBuckets}
              variant='bars'
              barKey='count'
              barLabel='Gönderi'
            />
            <ReportTrendChart
              title='Taşıyıcı OTD'
              data={data.onTimeByCarrier.map((row) => ({
                label: row.carrier.split(' ')[0] ?? row.carrier,
                count: row.onTimeRate,
              }))}
              variant='bars'
              barKey='count'
              barLabel='OTD %'
            />
          </div>
          <Card className='gap-0 py-0 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2'>
              <div>
                <CardTitle className='text-sm font-semibold'>Gecikmeli / istisna gönderiler</CardTitle>
                <p className='text-xs text-muted-foreground'>
                  P50 {data.percentiles.p50}sa · P85 {data.percentiles.p85}sa · P95{' '}
                  {data.percentiles.p95}sa
                </p>
              </div>
              <ReportExcelExport
                data={data.lateShipments}
                filename='late-shipments'
                columns={lateColumns}
              />
            </CardHeader>
            <CardContent className='px-2 pb-3'>
              <DataTable
                columns={lateColumns}
                data={data.lateShipments}
                emptyMessage='Kayıt yok'
              />
            </CardContent>
          </Card>
        </>
      )}
    </ReportsShell>
  )
}
