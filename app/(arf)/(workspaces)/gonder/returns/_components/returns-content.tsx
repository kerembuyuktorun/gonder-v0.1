'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { Check, Eye, FileText, MapPin, X } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { RowQuickActions } from '../../_components/data-workspace'
import {
  WorkspaceListHeader,
  WorkspaceListToolbar,
  WorkspaceViewTabs,
} from '../../_components/workspace-list'
import { returnsRepository } from '../../_data/returns-repository'
import { RETURNS_QUERY_KEY, useReturnsList } from '../../_hooks/use-returns'
import { useWorkspaceListUrlState } from '../../_hooks/use-workspace-list-url-state'
import { canGonder, GONDER_PERMISSIONS } from '../../_lib/gonder-permissions'
import {
  RETURN_STATUS_LABELS,
  type GonderReturn,
  type ReturnStatus,
  type ReturnView,
} from '../../_types/returns'

const VIEWS = ['all', 'in_progress', 'returned', 'completed', 'rejected_cancelled'] as const

const VIEW_LABELS: Record<ReturnView, string> = {
  all: 'Tümü',
  in_progress: 'Devam Edenler',
  returned: 'İade Edilenler',
  completed: 'Tamamlananlar',
  rejected_cancelled: 'Reddedilenler / İptal',
}

const STATUS_BADGE: Record<ReturnStatus, string> = {
  requested: 'border-slate-400/30 bg-slate-500/10 text-slate-700',
  awaiting_approval: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  approved: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  rejected: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
  label_ready: 'border-violet-500/20 bg-violet-500/10 text-violet-700',
  awaiting_handover: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  handed_to_carrier: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  in_transit: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  delivered: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  completed: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  cancelled: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
  exception: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
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

export function ReturnsContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const canManage = canGonder(GONDER_PERMISSIONS.returnsManage)
  const url = useWorkspaceListUrlState({
    defaultView: 'in_progress',
    validViews: VIEWS,
  })
  const [searchInput, setSearchInput] = useState(url.search)
  const [table, setTable] = useState<TanStackTable<GonderReturn> | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const listQuery = useMemo(
    () => ({
      view: url.view,
      status: (url.status as ReturnStatus | null) ?? null,
      search: url.search,
      carrier: url.carrier,
    }),
    [url.carrier, url.search, url.status, url.view]
  )

  const { data, isLoading } = useReturnsList(listQuery)
  const items = data?.items ?? []
  const pageCount = Math.max(1, Math.ceil(items.length / pagination.pageSize) || 1)
  const pageItems = items.slice(
    pagination.pageIndex * pagination.pageSize,
    pagination.pageIndex * pagination.pageSize + pagination.pageSize
  )

  async function mutateStatus(id: string, status: ReturnStatus, successMessage: string) {
    try {
      await returnsRepository.updateStatus(id, status)
      toast.success(successMessage)
      await queryClient.invalidateQueries({ queryKey: RETURNS_QUERY_KEY })
    } catch {
      toast.error('İşlem tamamlanamadı')
    }
  }

  const columns = useMemo<ColumnDef<GonderReturn>[]>(
    () => [
      createSelectionColumn<GonderReturn>(),
      {
        accessorKey: 'orderNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sipariş No' />,
        cell: ({ row }) => (
          <Link
            href={ARF_ROUTES.gonder.returns.detail(row.original.id)}
            className='font-medium hover:underline'
          >
            {row.original.orderNumber}
          </Link>
        ),
      },
      {
        accessorKey: 'customerName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Müşteri' />,
      },
      {
        accessorKey: 'requestedAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Talep Tarihi' />,
        cell: ({ row }) => formatDate(row.original.requestedAt),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Durum' />,
        cell: ({ row }) => (
          <Badge variant='outline' className={STATUS_BADGE[row.original.status]}>
            {RETURN_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: 'handoverPoint',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='İade Teslim Noktası' />
        ),
        cell: ({ row }) => row.original.handoverPoint ?? '—',
      },
      {
        accessorKey: 'carrierRef',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Kargo Ref / Barkod' />
        ),
        cell: ({ row }) => row.original.carrierRef ?? '—',
      },
      {
        accessorKey: 'carrier',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Kargo Şirketi' />,
      },
      {
        accessorKey: 'returnMethod',
        header: ({ column }) => <DataTableColumnHeader column={column} title='İade Metodu' />,
      },
      {
        id: 'documents',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Belgeler' />,
        cell: ({ row }) => {
          const docs = row.original.documents
          const bits = [
            docs.labelReady ? 'Etiket' : null,
            docs.hasProofOfDelivery ? 'POD' : null,
            docs.hasPhotos ? 'Foto' : null,
          ].filter(Boolean)
          return bits.length ? (
            <span className='text-xs text-muted-foreground'>{bits.join(' · ')}</span>
          ) : (
            '—'
          )
        },
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        enableHiding: false,
        size: 184,
        minSize: 176,
        maxSize: 220,
        cell: ({ row }) => {
          const item = row.original
          const canApprove = canManage && item.status === 'awaiting_approval'
          const canComplete = canManage && item.status === 'delivered'
          const canSetHandover =
            canManage &&
            (item.status === 'approved' ||
              item.status === 'label_ready' ||
              item.status === 'awaiting_handover')

          return (
            <RowQuickActions
              actions={[
                ...(canApprove
                  ? [
                      {
                        id: 'approve',
                        labelKey: 'returns.approve',
                        icon: Check,
                        priority: 'primary' as const,
                        variant: 'primary' as const,
                        onClick: () => void mutateStatus(item.id, 'approved', 'İade onaylandı'),
                      },
                      {
                        id: 'reject',
                        labelKey: 'returns.reject',
                        icon: X,
                        priority: 'overflow' as const,
                        variant: 'destructive' as const,
                        requiresConfirmation: true,
                        confirmation: {
                          titleKey: 'returns.rejectConfirmTitle',
                          descriptionKey: 'returns.rejectConfirmDescription',
                          confirmLabelKey: 'returns.rejectConfirmAction',
                        },
                        onClick: () => void mutateStatus(item.id, 'rejected', 'İade reddedildi'),
                      },
                    ]
                  : []),
                ...(canComplete
                  ? [
                      {
                        id: 'complete',
                        labelKey: 'returns.complete',
                        shortLabelKey: 'returns.completeShort',
                        icon: Check,
                        priority: 'primary' as const,
                        variant: 'primary' as const,
                        onClick: () =>
                          void mutateStatus(item.id, 'completed', 'İade tamamlandı'),
                      },
                    ]
                  : []),
                {
                  id: 'view',
                  labelKey: 'returns.inspect',
                  icon: Eye,
                  priority: canApprove || canComplete ? ('secondary' as const) : ('primary' as const),
                  variant: 'secondary' as const,
                  onClick: () => router.push(ARF_ROUTES.gonder.returns.detail(item.id)),
                },
                ...(canSetHandover
                  ? [
                      {
                        id: 'handover',
                        labelKey: 'returns.handover',
                        shortLabelKey: 'returns.handoverShort',
                        icon: MapPin,
                        priority: 'overflow' as const,
                        onClick: () =>
                          void mutateStatus(
                            item.id,
                            'awaiting_handover',
                            'Teslim noktası bekleniyor'
                          ),
                      },
                    ]
                  : []),
                ...(item.documents.labelReady
                  ? [
                      {
                        id: 'docs',
                        labelKey: 'returns.printLabel',
                        shortLabelKey: 'returns.printLabelShort',
                        icon: FileText,
                        priority: 'overflow' as const,
                        onClick: () => toast.success('İade etiketi yazdırma kuyruğa alındı'),
                      },
                    ]
                  : []),
              ]}
            />
          )
        },
      },
    ],
    [canManage, router]
  )

  const tabs = VIEWS.map((id) => ({
    id,
    label: VIEW_LABELS[id],
    count: data?.viewCounts[id],
  }))

  const statusFilter = url.status as ReturnStatus | null

  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: 'Gönder' }, { label: 'İadeler' }]}
        searchPlaceholder='Gönder ara...'
        searchShortcut={<>⌘K</>}
        notificationsLabel='Bildirimler'
      />

      <div className='flex flex-1 flex-col gap-3 p-3 sm:p-4'>
        <WorkspaceListHeader
          title='İadeler'
          description='Taşıyıcıdan gelen veya başlattığınız iadeleri yönetin.'
          actions={
            <Button
              size='sm'
              variant='outline'
              onClick={() => {
                void returnsRepository
                  .simulateWebhook({ status: 'requested' })
                  .then(async () => {
                    toast.success('Yeni iade webhook’u simüle edildi')
                    await queryClient.invalidateQueries({ queryKey: RETURNS_QUERY_KEY })
                  })
              }}
            >
              Webhook simüle
            </Button>
          }
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
              searchPlaceholder='Sipariş, müşteri veya ref ara…'
              activeFilterCount={url.activeFilterCount}
              onClearFilters={() => {
                setSearchInput('')
                url.clearFilters()
              }}
              filterSummary={
                statusFilter ? (
                  <Badge variant='secondary' className='gap-1 font-normal'>
                    Durum: {RETURN_STATUS_LABELS[statusFilter]}
                    <button
                      type='button'
                      className='ml-1 hover:underline'
                      onClick={() => url.setStatus(null)}
                    >
                      ×
                    </button>
                  </Badge>
                ) : null
              }
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
              emptyMessage='Kayıt bulunamadı. Bu görünüm için herhangi bir iade kaydınız yok.'
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
