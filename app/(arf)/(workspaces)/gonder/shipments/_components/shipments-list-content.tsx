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
  DataTableViewOptions,
  createSelectionColumn,
} from '@hascanb/arf-ui-kit/datatable-kit'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Bike, Eye, MapPinned, Package, Printer, Truck, Warehouse } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ARF_ROUTES } from '../../../../_shared/routes'
import {
  DataWorkspace,
  RowQuickActions,
  type ActiveFilterChip,
} from '../../_components/data-workspace'
import { shipmentsListRepository } from '../../_data/shipments-list-repository'
import { useWorkspaceListUrlState } from '../../_hooks/use-workspace-list-url-state'
import {
  LOGISTICS_MODE_LABELS,
  SHIPMENT_OPERATION_BADGE,
  SHIPMENT_OPERATION_LABELS,
  SHIPMENT_OPERATION_TAB_LABELS,
  SHIPMENT_SERVICE_TYPE_LABELS,
  SHIPMENT_STATUS_BADGE,
  SHIPMENT_STATUS_LABELS,
  type GonderShipmentListItem,
  type ShipmentListStatus,
  type ShipmentOperationTab,
  type ShipmentView,
} from '../../_types/shipments'

const OPERATION_TABS = ['all', 'parcel', 'courier', 'logistics'] as const

const OPERATION_ICONS = {
  all: Package,
  parcel: Package,
  courier: Bike,
  logistics: Warehouse,
} as const

const VIEWS = ['all', 'active', 'delivered', 'returned', 'issues', 'cancelled'] as const

const VIEW_LABELS: Record<ShipmentView, string> = {
  all: 'Tümü',
  active: 'Aktif',
  delivered: 'Teslim',
  returned: 'İade',
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
  const router = useRouter()
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
      operation: url.operation as ShipmentOperationTab,
      search: url.search,
      carrier: url.carrier,
    }),
    [url.carrier, url.operation, url.search, url.status, url.view]
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
        size: 148,
        minSize: 132,
        header: ({ column }) => <DataTableColumnHeader column={column} title='Gönderi No' />,
        cell: ({ row }) => (
          <Link
            href={ARF_ROUTES.gonder.shipments.detail(row.original.id)}
            className='block truncate font-medium hover:underline'
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
        accessorKey: 'operationType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Operasyon' />,
        cell: ({ row }) => (
          <div className='space-y-1'>
            <Badge
              variant='outline'
              className={SHIPMENT_OPERATION_BADGE[row.original.operationType]}
            >
              {SHIPMENT_OPERATION_LABELS[row.original.operationType]}
            </Badge>
            {row.original.logisticsMode ? (
              <div className='text-xs text-muted-foreground'>
                {LOGISTICS_MODE_LABELS[row.original.logisticsMode]}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: 'carrier',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Taşıyıcı' />,
      },
      {
        id: 'service',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Hizmet' />,
        cell: ({ row }) => (
          <div className='min-w-0'>
            <div className='truncate'>{row.original.serviceLabel}</div>
            <div className='truncate text-xs text-muted-foreground'>
              {SHIPMENT_SERVICE_TYPE_LABELS[row.original.serviceType]}
            </div>
          </div>
        ),
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
        enableHiding: false,
        size: 184,
        minSize: 176,
        maxSize: 220,
        cell: ({ row }) => {
          const item = row.original
          const canPickup = item.status === 'label_ready'
          return (
            <RowQuickActions
              actions={[
                {
                  id: 'print',
                  labelKey: 'shipments.printLabel',
                  shortLabelKey: 'shipments.printLabelShort',
                  icon: Printer,
                  priority: 'primary',
                  variant: 'primary',
                  onClick: () => toast.success('Etiket yazdırma kuyruğa alındı'),
                },
                ...(canPickup
                  ? [
                      {
                        id: 'pickup',
                        labelKey: 'shipments.markPickedUp',
                        icon: Truck,
                        priority: 'secondary' as const,
                        variant: 'secondary' as const,
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
                  : [
                      {
                        id: 'track',
                        labelKey: 'shipments.track',
                        icon: Eye,
                        priority: 'secondary' as const,
                        variant: 'secondary' as const,
                        onClick: () =>
                          router.push(
                            `${ARF_ROUTES.gonder.shipments.detail(item.id)}?tab=tracking`
                          ),
                      },
                    ]),
                {
                  id: 'view',
                  labelKey: 'shipments.inspect',
                  icon: Eye,
                  priority: 'overflow' as const,
                  variant: 'secondary',
                  onClick: () => router.push(ARF_ROUTES.gonder.shipments.detail(item.id)),
                },
                ...(item.status === 'out_for_delivery'
                  ? [
                      {
                        id: 'deliver',
                        labelKey: 'shipments.deliver',
                        icon: Truck,
                        priority: 'overflow' as const,
                        onClick: () => {
                          void shipmentsListRepository
                            .updateStatus(item.id, 'delivered')
                            .then(async () => {
                              toast.success('Teslim edildi olarak işaretlendi')
                              await queryClient.invalidateQueries({ queryKey: SHIPMENTS_KEY })
                            })
                        },
                      },
                    ]
                  : []),
                {
                  id: 'notify',
                  labelKey: 'shipments.notify',
                  icon: MapPinned,
                  priority: 'overflow' as const,
                  onClick: () => toast.message('Müşteri bilgilendirme kuyruğa alındı'),
                },
                {
                  id: 'issue',
                  labelKey: 'shipments.reportIssue',
                  icon: AlertTriangle,
                  priority: 'overflow' as const,
                  variant: 'destructive' as const,
                  onClick: () => toast.message('Sorun bildirimi açılacak'),
                },
              ]}
            />
          )
        },
      },
    ],
    [queryClient, router]
  )

  const primaryTabs = OPERATION_TABS.map((id) => ({
    id,
    label: SHIPMENT_OPERATION_TAB_LABELS[id],
    count: data?.operationCounts[id],
    icon: OPERATION_ICONS[id],
  }))

  const tabs = VIEWS.map((id) => ({
    id,
    label: VIEW_LABELS[id],
    count: data?.viewCounts[id],
  }))

  const filterChips = useMemo(() => {
    const chips: ActiveFilterChip[] = []
    if (url.operation !== 'all') {
      chips.push({
        id: 'operation',
        label: `Operasyon: ${SHIPMENT_OPERATION_LABELS[url.operation]}`,
        onRemove: () => url.setOperation('all'),
      })
    }
    if (url.status) {
      chips.push({
        id: 'status',
        label: `Durum: ${SHIPMENT_STATUS_LABELS[url.status as ShipmentListStatus] ?? url.status}`,
        onRemove: () => url.setStatus(null),
      })
    }
    return chips
  }, [url])

  return (
    <DataWorkspace
      breadcrumbs={[{ label: 'Gönder' }, { label: 'Gönderiler' }]}
      title='Gönderiler'
      description='Kargo, kurye ve lojistik gönderilerini operasyon tipine göre takip edin.'
      headerActions={
        <Button size='sm' asChild>
          <Link href={ARF_ROUTES.gonder.shipments.create}>Yeni gönderi</Link>
        </Button>
      }
      primaryTabs={primaryTabs}
      primaryView={url.operation}
      onPrimaryViewChange={(operation) => {
        setPagination((p) => ({ ...p, pageIndex: 0 }))
        setRowSelection({})
        url.setOperation(operation)
      }}
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
      filterChips={filterChips}
      onClearFilters={() => {
        setSearchInput('')
        url.clearFilters()
        url.setOperation('all')
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
