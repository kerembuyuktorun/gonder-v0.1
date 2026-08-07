'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
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
  DataTableViewOptions,
  createSelectionColumn,
} from '@hascanb/arf-ui-kit/datatable-kit'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, Printer, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ARF_ROUTES } from '../../../../_shared/routes'
import {
  DataWorkspace,
  RowQuickActions,
} from '../../_components/data-workspace'
import { shipmentsListRepository } from '../../_data/shipments-list-repository'
import { useWorkspaceListUrlState } from '../../_hooks/use-workspace-list-url-state'
import {
  SHIPMENT_STATUS_BADGE,
  SHIPMENT_STATUS_LABELS,
  type GonderShipmentListItem,
  type ShipmentListStatus,
  type ShipmentView,
} from '../../_types/shipments'

const VIEWS = ['all', 'active', 'delivered', 'returned', 'issues', 'cancelled'] as const

const VIEW_LABELS: Record<ShipmentView, string> = {
  all: 'Tüm Gönderiler',
  active: 'Aktif',
  delivered: 'Teslim Edilenler',
  returned: 'İadeler',
  issues: 'Sorunlu',
  cancelled: 'İptal',
}

const SHIPMENTS_KEY = ['gonder', 'shipments-list'] as const

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater

function formatMoney(value: number | null) {
  if (value == null) return '—'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function ShipmentsListContent() {
  const queryClient = useQueryClient()
  const url = useWorkspaceListUrlState({
    defaultView: 'active',
    validViews: VIEWS,
  })
  const [searchInput, setSearchInput] = useState(url.search)
  const [table, setTable] = useState<TanStackTable<GonderShipmentListItem> | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const listQuery = useMemo(
    () => ({
      view: url.view,
      status: (url.status as ShipmentListStatus | null) ?? null,
      search: url.search,
      carrier: url.carrier,
    }),
    [url.carrier, url.search, url.status, url.view]
  )

  const { data, isLoading } = useQuery({
    queryKey: [...SHIPMENTS_KEY, listQuery],
    queryFn: () => shipmentsListRepository.list(listQuery),
  })

  const items = data?.items ?? []
  const pageCount = Math.max(1, Math.ceil(items.length / pagination.pageSize) || 1)
  const pageItems = items.slice(
    pagination.pageIndex * pagination.pageSize,
    pagination.pageIndex * pagination.pageSize + pagination.pageSize
  )
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])

  const columns = useMemo<ColumnDef<GonderShipmentListItem>[]>(
    () => [
      createSelectionColumn<GonderShipmentListItem>(),
      {
        accessorKey: 'reference',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Gönderi No' />,
        cell: ({ row }) => (
          <Link
            href={ARF_ROUTES.gonder.shipments.detail(row.original.id)}
            className='font-medium hover:underline'
          >
            {row.original.reference}
          </Link>
        ),
      },
      {
        accessorKey: 'orderNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sipariş' />,
        cell: ({ row }) => row.original.orderNumber ?? '—',
      },
      {
        id: 'route',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Rota' />,
        cell: ({ row }) => (
          <span className='text-muted-foreground'>
            {row.original.originCity} → {row.original.destinationCity}
          </span>
        ),
      },
      {
        accessorKey: 'carrier',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Taşıyıcı' />,
      },
      {
        accessorKey: 'serviceType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Hizmet' />,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Durum' />,
        cell: ({ row }) => (
          <Badge variant='outline' className={SHIPMENT_STATUS_BADGE[row.original.status]}>
            {SHIPMENT_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        id: 'dims',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Desi / Kg' />,
        cell: ({ row }) => (
          <span className='tabular-nums text-sm'>
            {row.original.desi} / {row.original.weightKg}
          </span>
        ),
      },
      {
        accessorKey: 'amountTry',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Ücret' />,
        cell: ({ row }) => formatMoney(row.original.amountTry),
      },
      {
        accessorKey: 'updatedAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Güncelleme' />,
        cell: ({ row }) => formatDate(row.original.updatedAt),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const item = row.original
          const canPickup = item.status === 'label_ready'
          return (
            <RowQuickActions
              actions={[
                {
                  id: 'view',
                  label: 'İncele',
                  icon: Eye,
                  onClick: () => toast.message(`${item.reference} incelenecek`),
                },
                {
                  id: 'print',
                  label: 'Etiket yazdır',
                  icon: Printer,
                  onClick: () => toast.success('Etiket yazdırma kuyruğa alındı'),
                },
                ...(canPickup
                  ? [
                      {
                        id: 'pickup',
                        label: 'Alındı işaretle',
                        icon: Truck,
                        tone: 'success' as const,
                        onClick: () => {
                          void shipmentsListRepository
                            .updateStatus(item.id, 'picked_up')
                            .then(async () => {
                              toast.success('Gönderi alındı olarak işaretlendi')
                              await queryClient.invalidateQueries({ queryKey: SHIPMENTS_KEY })
                            })
                        },
                      },
                    ]
                  : []),
              ]}
            />
          )
        },
      },
    ],
    [queryClient]
  )

  const tabs = VIEWS.map((id) => ({
    id,
    label: VIEW_LABELS[id],
    count: data?.viewCounts[id],
  }))

  return (
    <DataWorkspace
      breadcrumbs={[{ label: 'Gönder' }, { label: 'Gönderiler' }]}
      title='Gönderiler'
      description='Onaylanmış siparişlerden oluşan operasyonel gönderileri takip edin.'
      headerActions={
        <Button size='sm' asChild>
          <Link href={ARF_ROUTES.gonder.shipments.create}>Yeni gönderi</Link>
        </Button>
      }
      tabs={tabs}
      view={url.view}
      onViewChange={(view) => {
        setPagination((p) => ({ ...p, pageIndex: 0 }))
        setRowSelection({})
        url.setView(view)
      }}
      search={searchInput}
      onSearchChange={(value) => {
        setSearchInput(value)
        setPagination((p) => ({ ...p, pageIndex: 0 }))
        url.setSearch(value)
      }}
      searchPlaceholder='Gönderi no, sipariş veya taşıyıcı ara…'
      filterChips={
        url.status
          ? [
              {
                id: 'status',
                label: `Durum: ${SHIPMENT_STATUS_LABELS[url.status as ShipmentListStatus] ?? url.status}`,
                onRemove: () => url.setStatus(null),
              },
            ]
          : []
      }
      onClearFilters={() => {
        setSearchInput('')
        url.clearFilters()
      }}
      toolbarTrailing={table ? <DataTableViewOptions table={table} /> : null}
      selectedCount={selectedIds.length}
      onClearSelection={() => setRowSelection({})}
      bulkActions={
        <Button
          size='sm'
          variant='outline'
          onClick={() => toast.success(`${selectedIds.length} etiket yazdırma kuyruğa alındı`)}
        >
          Etiket yazdır
        </Button>
      }
    >
      <DataTable
        data={pageItems}
        columns={columns}
        enablePagination
        pagination={pagination}
        onPaginationChange={(updater) => setPagination((prev) => resolveUpdater(updater, prev))}
        pageCount={pageCount}
        manualPagination
        enableRowSelection
        enableMultiRowSelection
        getRowId={(row) => row.id}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        stickyLastColumn
        stickyFirstColumn
        stickyLeftColumnCount={2}
        isLoading={isLoading}
        emptyMessage='Kayıt bulunamadı. Bu görünüm için gönderi yok.'
        onTableReady={setTable}
      />
      {table ? (
        <DataTablePagination
          table={table as TanStackTable<unknown>}
          pageSizeOptions={[5, 10, 20, 50]}
          totalRows={items.length}
        />
      ) : null}
    </DataWorkspace>
  )
}
