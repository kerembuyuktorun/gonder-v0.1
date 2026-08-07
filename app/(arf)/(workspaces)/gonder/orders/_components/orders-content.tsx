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
import { Check, Eye, PackagePlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { ChannelCell } from '../../_components/channel-logo'
import {
  DataWorkspace,
  RowQuickActions,
  type ActiveFilterChip,
} from '../../_components/data-workspace'
import { getOrderChannelById } from '../../_data/order-channels'
import { ordersRepository } from '../../_data/orders-repository'
import { ORDERS_KEY } from '../../_hooks/use-orders'
import { useWorkspaceListUrlState } from '../../_hooks/use-workspace-list-url-state'
import {
  ORDER_CHANNEL_LABELS,
  ORDER_STATUS_BADGE,
  ORDER_STATUS_LABELS,
  type GonderOrder,
  type OrderChannelType,
  type OrderStatus,
  type OrderView,
} from '../../_types/orders'
import { OrdersChannelChipStrip } from './orders-channel-chips'
import { OrdersChannelFilterSheet } from './orders-channel-filter'
import { OrdersKanbanBoard } from './orders-kanban-board'
import { OrdersLayoutToggle } from './orders-layout-toggle'

const VIEWS = [
  'all',
  'pending',
  'needs_shipment',
  'processing',
  'rejected',
  'issues',
  'completed',
] as const

const VIEW_LABELS: Record<OrderView, string> = {
  all: 'Tüm Siparişler',
  pending: 'Onay Bekleyenler',
  needs_shipment: 'Gönderi Bekleyenler',
  processing: 'İşlemdekiler',
  rejected: 'Reddedilenler',
  issues: 'Sorunlu',
  completed: 'Tamamlananlar',
}

const CHANNEL_TYPES = new Set(Object.keys(ORDER_CHANNEL_LABELS))

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater

function formatMoney(value: number) {
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

function parseChannelTypes(values: string[]): OrderChannelType[] {
  return values.filter((value): value is OrderChannelType => CHANNEL_TYPES.has(value))
}

export function OrdersContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const url = useWorkspaceListUrlState({
    defaultView: 'all',
    validViews: VIEWS,
  })
  const [searchInput, setSearchInput] = useState(url.search)
  const [table, setTable] = useState<TanStackTable<GonderOrder> | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [filtersOpen, setFiltersOpen] = useState(false)

  const selectedChannelTypes = useMemo(
    () => parseChannelTypes(url.channelList),
    [url.channelList]
  )

  const listQuery = useMemo(
    () => ({
      view: url.view,
      status: (url.status as OrderStatus | null) ?? null,
      search: url.search,
      channels: selectedChannelTypes.length ? selectedChannelTypes : null,
      channelId: url.channelId,
    }),
    [selectedChannelTypes, url.channelId, url.search, url.status, url.view]
  )

  const { data, isLoading } = useQuery({
    queryKey: [...ORDERS_KEY, listQuery],
    queryFn: () => ordersRepository.list(listQuery),
  })

  const items = data?.items ?? []
  const pageCount = Math.max(1, Math.ceil(items.length / pagination.pageSize) || 1)
  const pageItems = items.slice(
    pagination.pageIndex * pagination.pageSize,
    pagination.pageIndex * pagination.pageSize + pagination.pageSize
  )
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id])
  const isBoard = url.layout === 'board'

  async function updateOne(id: string, status: OrderStatus, message: string) {
    await ordersRepository.updateStatus(id, status)
    toast.success(message)
    await queryClient.invalidateQueries({ queryKey: ORDERS_KEY })
  }

  async function bulkApprove() {
    const eligible = items.filter(
      (item) => selectedIds.includes(item.id) && item.status === 'pending_review'
    )
    if (!eligible.length) {
      toast.message('Onaylanabilir sipariş seçilmedi')
      return
    }
    await ordersRepository.bulkUpdateStatus(
      eligible.map((item) => item.id),
      'approved'
    )
    toast.success(`${eligible.length} sipariş onaylandı`)
    setRowSelection({})
    await queryClient.invalidateQueries({ queryKey: ORDERS_KEY })
  }

  function createShipment(order: GonderOrder) {
    toast.success('Gönderi oluşturma akışına yönlendiriliyor')
    window.location.href = `${ARF_ROUTES.gonder.shipments.create}?orderId=${order.id}`
  }

  function inspectOrder(order: GonderOrder) {
    router.push(ARF_ROUTES.gonder.orders.detail(order.id))
  }

  const columns = useMemo<ColumnDef<GonderOrder>[]>(
    () => [
      createSelectionColumn<GonderOrder>(),
      {
        accessorKey: 'orderNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sipariş No' />,
        cell: ({ row }) => (
          <Link
            href={ARF_ROUTES.gonder.orders.detail(row.original.id)}
            className='font-medium hover:underline'
          >
            {row.original.orderNumber}
          </Link>
        ),
      },
      {
        accessorKey: 'channel',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Kanal' />,
        cell: ({ row }) => {
          const connection = getOrderChannelById(row.original.channelId)
          return (
            <ChannelCell
              type={row.original.channel}
              connection={connection}
              size='sm'
            />
          )
        },
      },
      {
        accessorKey: 'customerName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Müşteri' />,
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
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Durum' />,
        cell: ({ row }) => (
          <Badge variant='outline' className={ORDER_STATUS_BADGE[row.original.status]}>
            {ORDER_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: 'pieceCount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Parça' />,
      },
      {
        accessorKey: 'amountTry',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Tutar' />,
        cell: ({ row }) => formatMoney(row.original.amountTry),
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
        enableHiding: false,
        size: 184,
        minSize: 176,
        maxSize: 220,
        cell: ({ row }) => {
          const item = row.original
          const canApprove = item.status === 'pending_review'
          const canShip =
            item.status === 'approved' ||
            item.status === 'ready_for_shipment' ||
            item.status === 'payment_pending'

          return (
            <RowQuickActions
              actions={[
                ...(canApprove
                  ? [
                      {
                        id: 'approve',
                        labelKey: 'orders.approve',
                        icon: Check,
                        priority: 'primary' as const,
                        variant: 'primary' as const,
                        onClick: () =>
                          void updateOne(item.id, 'approved', 'Sipariş onaylandı'),
                      },
                      {
                        id: 'reject',
                        labelKey: 'orders.reject',
                        icon: X,
                        priority: 'overflow' as const,
                        variant: 'destructive' as const,
                        requiresConfirmation: true,
                        confirmation: {
                          titleKey: 'orders.rejectConfirmTitle',
                          descriptionKey: 'orders.rejectConfirmDescription',
                          confirmLabelKey: 'orders.rejectConfirmAction',
                        },
                        onClick: () =>
                          void updateOne(item.id, 'rejected', 'Sipariş reddedildi'),
                      },
                    ]
                  : []),
                ...(canShip
                  ? [
                      {
                        id: 'ship',
                        labelKey: 'orders.createShipment',
                        icon: PackagePlus,
                        priority: 'primary' as const,
                        variant: 'primary' as const,
                        onClick: () => createShipment(item),
                      },
                    ]
                  : []),
                {
                  id: 'view',
                  labelKey: 'orders.inspect',
                  icon: Eye,
                  priority: canApprove || canShip ? ('secondary' as const) : ('primary' as const),
                  variant: 'secondary' as const,
                  onClick: () => inspectOrder(item),
                },
              ]}
            />
          )
        },
      },
    ],
    []
  )

  const tabs = VIEWS.map((id) => ({
    id,
    label: VIEW_LABELS[id],
    count: data?.viewCounts[id],
  }))

  const filterChips = useMemo(() => {
    const chips: ActiveFilterChip[] = []
    if (url.status) {
      chips.push({
        id: 'status',
        label: `Durum: ${ORDER_STATUS_LABELS[url.status as OrderStatus] ?? url.status}`,
        onRemove: () => url.setStatus(null),
      })
    }
    if (url.channelId) {
      const connection = getOrderChannelById(url.channelId)
      chips.push({
        id: 'channelId',
        label: `Bağlantı: ${connection?.storeName ?? connection?.name ?? url.channelId}`,
        onRemove: () => url.setChannelId(null),
      })
    } else if (selectedChannelTypes.length) {
      chips.push({
        id: 'channels',
        label:
          selectedChannelTypes.length === 1
            ? `Kanal: ${ORDER_CHANNEL_LABELS[selectedChannelTypes[0]!]}`
            : `Kanallar: ${selectedChannelTypes.length}`,
        onRemove: () => url.setChannels([]),
      })
    }
    return chips
  }, [selectedChannelTypes, url])

  return (
    <>
      <DataWorkspace
        breadcrumbs={[{ label: 'Gönder' }, { label: 'Siparişler' }]}
        title='Siparişler'
        description='Entegrasyonlardan gelen siparişleri inceleyin ve gönderiye dönüştürün.'
        headerActions={
          <>
            <Button variant='outline' size='sm' asChild>
              <Link href={ARF_ROUTES.gonder.bulkCreate.root}>Siparişleri içe aktar</Link>
            </Button>
            <Button size='sm' asChild>
              <Link href={ARF_ROUTES.gonder.shipments.create}>Yeni sipariş</Link>
            </Button>
          </>
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
        searchPlaceholder='Sipariş no, müşteri veya şehir ara…'
        filterChips={filterChips}
        onClearFilters={() => {
          setSearchInput('')
          url.clearFilters()
        }}
        onOpenFilters={() => setFiltersOpen(true)}
        toolbarTrailing={
          <div className='flex items-center gap-1.5'>
            <OrdersLayoutToggle
              value={url.layout}
              onChange={(layout) => {
                setRowSelection({})
                url.setLayout(layout)
              }}
            />
            {!isBoard && table ? <DataTableViewOptions table={table} /> : null}
          </div>
        }
        selectedCount={isBoard ? 0 : selectedIds.length}
        onClearSelection={isBoard ? undefined : () => setRowSelection({})}
        bulkActions={
          isBoard ? null : (
            <>
              <Button size='sm' variant='outline' onClick={() => void bulkApprove()}>
                Seçilenleri onayla
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() => {
                  toast.message('Dışa aktarma hazırlanıyor')
                }}
              >
                Dışarı aktar
              </Button>
            </>
          )
        }
      >
        <OrdersChannelChipStrip
          selectedTypes={selectedChannelTypes}
          selectedChannelId={url.channelId}
          channelCounts={data?.channelCounts}
          onSelectType={(type) => {
            setPagination((p) => ({ ...p, pageIndex: 0 }))
            if (!type) {
              url.setChannels([])
              return
            }
            url.setChannel(type)
          }}
        />

        {isBoard ? (
          <OrdersKanbanBoard
            items={items}
            isLoading={isLoading}
            onUpdateStatus={(id, status, message) => void updateOne(id, status, message)}
            onInspect={inspectOrder}
            onCreateShipment={createShipment}
          />
        ) : (
          <>
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
              stickyFirstColumn
              stickyLeftColumnCount={2}
              isLoading={isLoading}
              emptyMessage='Kayıt bulunamadı. Bu görünüm için sipariş yok.'
              onTableReady={setTable}
            />
            {table ? (
              <DataTablePagination
                table={table as TanStackTable<unknown>}
                pageSizeOptions={[5, 10, 20, 50]}
                totalRows={items.length}
              />
            ) : null}
          </>
        )}
      </DataWorkspace>

      <OrdersChannelFilterSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        selectedTypes={selectedChannelTypes}
        selectedChannelId={url.channelId}
        channelCounts={data?.channelCounts}
        onApply={({ types, channelId }) => {
          setPagination((p) => ({ ...p, pageIndex: 0 }))
          if (channelId) {
            url.setChannelId(channelId)
          } else {
            url.setChannels(types)
          }
        }}
      />
    </>
  )
}
