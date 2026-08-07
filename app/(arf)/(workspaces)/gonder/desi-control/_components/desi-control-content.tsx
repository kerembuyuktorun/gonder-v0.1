'use client'

import { useMemo, useState } from 'react'
import type {
  ColumnDef,
  PaginationState,
  RowSelectionState,
  Table as TanStackTable,
  Updater,
} from '@tanstack/react-table'
import {
  DataTable,
  DataTableColumnHeader,
  DataTablePagination,
  createSelectionColumn,
} from '@hascanb/arf-ui-kit/datatable-kit'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Eye, MessageSquareWarning, Scale } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { desiAdjustmentsRepository } from '../../_data/desi-adjustments-repository'
import { DESI_QUERY_KEY, useDesiAdjustmentsList } from '../../_hooks/use-desi-adjustments'
import { useWorkspaceListUrlState } from '../../_hooks/use-workspace-list-url-state'
import {
  DESI_STATUS_LABELS,
  type DesiAdjustmentStatus,
  type DesiAdjustmentView,
  type GonderDesiAdjustment,
} from '../../_types/desi-adjustments'
import { canGonder, GONDER_PERMISSIONS } from '../../_lib/gonder-permissions'
import {
  WorkspaceListHeader,
  WorkspaceViewTabs,
} from '../../_components/workspace-list/workspace-view-tabs'
import { WorkspaceListToolbar } from '../../_components/workspace-list/workspace-list-toolbar'

const VIEWS = ['all', 'unreviewed', 'in_review', 'charge', 'resolved'] as const

const VIEW_LABELS: Record<DesiAdjustmentView, string> = {
  all: 'Tümü',
  unreviewed: 'İncelenmeyenler',
  in_review: 'İncelemede',
  charge: 'Ücret farkı',
  resolved: 'Çözülenler',
}

const STATUS_BADGE: Record<DesiAdjustmentStatus, string> = {
  unreviewed: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  acknowledged: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  disputed: 'border-violet-500/20 bg-violet-500/10 text-violet-700',
  charge_pending: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  charge_accepted: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  charge_waived: 'border-slate-400/30 bg-slate-500/10 text-slate-700',
  resolved: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
}

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function formatMoney(value: number | null) {
  if (value == null) return '—'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value)
}

export function DesiControlContent() {
  const queryClient = useQueryClient()
  const canManage = canGonder(GONDER_PERMISSIONS.desiManage)
  const canDispute = canGonder(GONDER_PERMISSIONS.desiDispute)
  const url = useWorkspaceListUrlState({
    defaultView: 'unreviewed',
    validViews: VIEWS,
  })
  const [searchInput, setSearchInput] = useState(url.search)
  const [table, setTable] = useState<TanStackTable<GonderDesiAdjustment> | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const listQuery = useMemo(
    () => ({
      view: url.view,
      status: (url.status as DesiAdjustmentStatus | null) ?? null,
      search: url.search,
      carrier: url.carrier,
    }),
    [url.carrier, url.search, url.status, url.view]
  )

  const { data, isLoading } = useDesiAdjustmentsList(listQuery)
  const items = data?.items ?? []
  const pageCount = Math.max(1, Math.ceil(items.length / pagination.pageSize) || 1)
  const pageItems = items.slice(
    pagination.pageIndex * pagination.pageSize,
    pagination.pageIndex * pagination.pageSize + pagination.pageSize
  )

  async function mutateStatus(
    id: string,
    status: DesiAdjustmentStatus,
    successMessage: string
  ) {
    try {
      await desiAdjustmentsRepository.updateStatus(id, status)
      toast.success(successMessage)
      await queryClient.invalidateQueries({ queryKey: DESI_QUERY_KEY })
    } catch {
      toast.error('İşlem tamamlanamadı')
    }
  }

  const columns = useMemo<ColumnDef<GonderDesiAdjustment>[]>(
    () => [
      createSelectionColumn<GonderDesiAdjustment>(),
      {
        accessorKey: 'shipmentRef',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Gönderi' />,
        cell: ({ row }) => (
          <div>
            <p className='font-medium'>{row.original.shipmentRef}</p>
            {row.original.orderNumber ? (
              <p className='text-xs text-muted-foreground'>{row.original.orderNumber}</p>
            ) : null}
          </div>
        ),
      },
      {
        id: 'declared',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Beyan' />,
        cell: ({ row }) => (
          <span className='tabular-nums text-sm'>
            {row.original.declaredDesi} desi · {row.original.declaredWeightKg} kg
          </span>
        ),
      },
      {
        id: 'measured',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Ölçülen' />,
        cell: ({ row }) => (
          <span className='tabular-nums text-sm'>
            {row.original.measuredDesi} desi · {row.original.measuredWeightKg} kg
          </span>
        ),
      },
      {
        id: 'delta',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fark' />,
        cell: ({ row }) => (
          <span className='tabular-nums text-sm font-medium text-amber-700'>
            +{row.original.deltaDesi} desi · +{row.original.deltaWeightKg} kg
          </span>
        ),
      },
      {
        accessorKey: 'chargeTry',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Ücret farkı' />,
        cell: ({ row }) => formatMoney(row.original.chargeTry),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Durum' />,
        cell: ({ row }) => (
          <Badge variant='outline' className={STATUS_BADGE[row.original.status]}>
            {DESI_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: 'carrier',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Taşıyıcı' />,
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Tarih' />,
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className='flex justify-end gap-1'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-8'
                aria-label='İncele'
                onClick={() => toast.message(`${item.shipmentRef} incelenecek`)}
              >
                <Eye className='size-3.5' />
              </Button>
              {canManage && item.status === 'unreviewed' ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='size-8'
                  aria-label='Bilgilendir'
                  onClick={() =>
                    void mutateStatus(item.id, 'acknowledged', 'Müşteri bilgilendirildi')
                  }
                >
                  <Scale className='size-3.5' />
                </Button>
              ) : null}
              {canDispute && (item.status === 'unreviewed' || item.status === 'acknowledged') ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='size-8 text-violet-700'
                  aria-label='İtiraz et'
                  onClick={() => void mutateStatus(item.id, 'disputed', 'İtiraz kaydedildi')}
                >
                  <MessageSquareWarning className='size-3.5' />
                </Button>
              ) : null}
            </div>
          )
        },
      },
    ],
    [canDispute, canManage]
  )

  const tabs = VIEWS.map((id) => ({
    id,
    label: VIEW_LABELS[id],
    count: data?.viewCounts[id],
  }))

  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: 'Gönder' }, { label: 'Desi Kontrol' }]}
        searchPlaceholder='Gönder ara...'
        searchShortcut={<>⌘K</>}
        notificationsLabel='Bildirimler'
      />

      <div className='flex flex-1 flex-col gap-3 p-3 sm:p-4'>
        <WorkspaceListHeader
          title='Desi Kontrol'
          description='Taşıyıcı ölçümü ile beyan edilen desi/ağırlık farklarını yönetin. Beyan değerleri otomatik üzerine yazılmaz.'
        />

        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='space-y-3 p-3'>
            <WorkspaceViewTabs
              tabs={tabs}
              value={url.view}
              onChange={(v) => {
                setPagination((p) => ({ ...p, pageIndex: 0 }))
                url.setView(v)
              }}
            />
            <WorkspaceListToolbar
              search={searchInput}
              onSearchChange={(value) => {
                setSearchInput(value)
                setPagination((p) => ({ ...p, pageIndex: 0 }))
                url.setSearch(value)
              }}
              searchPlaceholder='Gönderi, sipariş veya taşıyıcı ara…'
              activeFilterCount={url.activeFilterCount}
              onClearFilters={() => {
                setSearchInput('')
                url.clearFilters()
              }}
            />

            <DataTable
              data={pageItems}
              columns={columns}
              enablePagination
              pagination={pagination}
              onPaginationChange={(updater) =>
                setPagination((prev) => resolveUpdater(updater, prev))
              }
              pageCount={pageCount}
              manualPagination
              enableRowSelection
              enableMultiRowSelection
              getRowId={(row) => row.id}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              stickyLastColumn
              isLoading={isLoading}
              emptyMessage='Kayıt bulunamadı. Bu görünüm için desi farkı kaydı yok.'
              onTableReady={setTable}
            />

            {table ? (
              <DataTablePagination
                table={table as TanStackTable<unknown>}
                pageSizeOptions={[5, 10, 20, 50]}
                totalRows={items.length}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
