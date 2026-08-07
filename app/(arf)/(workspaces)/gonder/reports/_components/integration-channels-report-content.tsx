'use client'

import { useMemo } from 'react'
import {
  DataTable,
  DataTableColumnHeader,
} from '@hascanb/arf-ui-kit/datatable-kit'
import type { ColumnDef } from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useIntegrationChannelsReport } from '../../_hooks/use-reports-analytics'
import type { ChannelVolumeRow } from '../../_types/reports'
import { ReportExcelExport } from './report-excel-export'
import { ReportKpiGrid } from './report-kpi-grid'
import { ReportPlannedState } from './report-planned-state'
import { useReportDateRangeQuery } from './report-date-range-toolbar'
import { ReportsShell } from './reports-shell'

/**
 * Planned rapor — hafif önizleme + roadmap.
 * Tam kanal attribution sonraki dilimde.
 */
export function IntegrationChannelsReportContent() {
  const { query } = useReportDateRangeQuery()
  const { data, isLoading } = useIntegrationChannelsReport(query)

  const columns = useMemo<ColumnDef<ChannelVolumeRow>[]>(
    () => [
      {
        accessorKey: 'channel',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Kanal' />,
      },
      {
        accessorKey: 'orders',
        header: 'Sipariş',
        cell: ({ row }) => <span className='tabular-nums'>{row.original.orders}</span>,
      },
      {
        accessorKey: 'shipments',
        header: 'Gönderi',
        cell: ({ row }) => <span className='tabular-nums'>{row.original.shipments}</span>,
      },
      {
        accessorKey: 'conversionRate',
        header: 'Dönüşüm',
        cell: ({ row }) => (
          <span className='tabular-nums'>%{row.original.conversionRate}</span>
        ),
      },
    ],
    []
  )

  return (
    <ReportsShell
      slug='integration-channels'
      title='Entegrasyon kanalları'
      description='Kanal bazında sipariş → gönderi dönüşümü (planlı genişleme)'
    >
      <ReportPlannedState
        title='İleri seviye kanal attribution planlandı'
        description='MVP önizleme aşağıda. Tam funnel attribution, kanal SLA ve entegrasyon sağlık skorları sonraki dilimde.'
        roadmap={[
          'Sipariş kaynağı → gönderi bağlama (order lineage)',
          'Kanal bazında OTD / maliyet kırılımı',
          'Entegrasyon hata / sync latency metrikleri',
        ]}
      />
      {isLoading || !data ? (
        <p className='text-sm text-muted-foreground'>Önizleme yükleniyor…</p>
      ) : (
        <>
          <ReportKpiGrid kpis={data.kpis} />
          <Card className='gap-0 py-0 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between gap-2 space-y-0 px-4 pt-4 pb-2'>
              <CardTitle className='text-sm font-semibold'>Kanal önizlemesi</CardTitle>
              <ReportExcelExport
                data={data.channels}
                filename='channels-preview'
                columns={columns}
              />
            </CardHeader>
            <CardContent className='px-2 pb-3'>
              <DataTable columns={columns} data={data.channels} emptyMessage='Veri yok' />
            </CardContent>
          </Card>
        </>
      )}
    </ReportsShell>
  )
}
