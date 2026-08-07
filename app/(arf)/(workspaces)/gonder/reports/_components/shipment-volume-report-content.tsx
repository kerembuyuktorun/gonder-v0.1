'use client'

import { useMemo } from 'react'
import {
  DataTable,
  DataTableColumnHeader,
} from '@hascanb/arf-ui-kit/datatable-kit'
import type { ColumnDef } from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useShipmentVolumeReport } from '../../_hooks/use-reports-analytics'
import type { RouteVolumeRow, ServiceMixRow } from '../../_types/reports'
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

export function ShipmentVolumeReportContent() {
  const { query } = useReportDateRangeQuery()
  const { data, isLoading } = useShipmentVolumeReport(query)

  const routeColumns = useMemo<ColumnDef<RouteVolumeRow>[]>(
    () => [
      {
        id: 'route',
        header: 'Rota',
        cell: ({ row }) => (
          <span className='font-medium'>
            {row.original.originCity} → {row.original.destinationCity}
          </span>
        ),
      },
      {
        accessorKey: 'shipments',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Hacim' />,
        cell: ({ row }) => <span className='tabular-nums'>{row.original.shipments}</span>,
      },
      {
        accessorKey: 'spendTry',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Harcama' />,
        cell: ({ row }) => (
          <span className='tabular-nums'>{formatTry(row.original.spendTry)}</span>
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
        accessorKey: 'onTimeRate',
        header: 'OTD %',
        cell: ({ row }) => (
          <span className='tabular-nums'>%{row.original.onTimeRate}</span>
        ),
      },
    ],
    []
  )

  const serviceColumns = useMemo<ColumnDef<ServiceMixRow>[]>(
    () => [
      { accessorKey: 'serviceType', header: 'Hizmet' },
      {
        accessorKey: 'shipments',
        header: 'Hacim',
        cell: ({ row }) => <span className='tabular-nums'>{row.original.shipments}</span>,
      },
      {
        accessorKey: 'sharePct',
        header: 'Pay',
        cell: ({ row }) => <span className='tabular-nums'>%{row.original.sharePct}</span>,
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

  return (
    <ReportsShell
      slug='shipment-volume'
      title='Gönderi hacmi'
      description='Rota ve hizmet bazında hacim / harcama dağılımı'
    >
      {isLoading || !data ? (
        <p className='text-sm text-muted-foreground'>Rapor yükleniyor…</p>
      ) : (
        <>
          <ReportKpiGrid kpis={data.kpis} />
          <ReportTrendChart title='Günlük hacim' data={data.series} variant='volume' />
          <div className='grid gap-3 xl:grid-cols-2'>
            <Card className='gap-0 py-0 shadow-sm'>
              <CardHeader className='flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2'>
                <CardTitle className='text-sm font-semibold'>Rota bazında</CardTitle>
                <ReportExcelExport
                  data={data.byRoute}
                  filename='volume-by-route'
                  columns={routeColumns}
                />
              </CardHeader>
              <CardContent className='px-2 pb-3'>
                <DataTable columns={routeColumns} data={data.byRoute} emptyMessage='Veri yok' />
              </CardContent>
            </Card>
            <Card className='gap-0 py-0 shadow-sm'>
              <CardHeader className='flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2'>
                <CardTitle className='text-sm font-semibold'>Hizmet karışımı</CardTitle>
                <ReportExcelExport
                  data={data.byService}
                  filename='volume-by-service'
                  columns={serviceColumns}
                />
              </CardHeader>
              <CardContent className='px-2 pb-3'>
                <DataTable
                  columns={serviceColumns}
                  data={data.byService}
                  emptyMessage='Veri yok'
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </ReportsShell>
  )
}
