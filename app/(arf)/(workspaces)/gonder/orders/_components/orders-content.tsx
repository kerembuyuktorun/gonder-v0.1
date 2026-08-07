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
import { Check, Eye, PackagePlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ARF_ROUTES } from '../../../../_shared/routes'
import {
  DataWorkspace,
  RowQuickActions,
} from '../../_components/data-workspace'
import { ordersRepository } from '../../_data/orders-repository'
import { useWorkspaceListUrlState } from '../../_hooks/use-workspace-list-url-state'
import {
  ORDER_CHANNEL_LABELS,
  ORDER_STATUS_BADGE,
  ORDER_STATUS_LABELS,
  type GonderOrder,
  type OrderStatus,
  type OrderView,
} from '../../_types/orders'

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

const ORDERS_KEY = ['gonder', 'orders'] as const

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

export function OrdersContent() {
  const queryClient = useQueryClient()
  const url = useWorkspaceListUrlState({
    defaultView: 'all',
    validViews: VIEWS,
  })
  const [searchInput, setSearchInput] = useState(url.search)
  const [table, setTable] = useState<TanStackTable<GonderOrder> | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const listQuery = useMemo(
    () => ({
      view: url.view,
      status: (url.status as OrderStatus | null) ?? null,
      search: url.search,
    }),
    [url.search, url.status, url.view]
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
        cell: ({ row }) => ORDER_CHANNEL_LABELS[row.original.channel],
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
                {
                  id: 'view',
                  label: 'İncele',
                  icon: Eye,
                  onClick: () => toast.message(`${item.orderNumber} incelenecek`),
                },
                ...(canApprove
                  ? [
                      {
                        id: 'approve',
                        label: 'Onayla',
                        icon: Check,
                        tone: 'success' as const,
                        onClick: () =>
                          void updateOne(item.id, 'approved', 'Sipariş onaylandı'),
                      },
                      {
                        id: 'reject',
                        label: 'Reddet',
                        icon: X,
                        tone: 'danger' as const,
                        onClick: () =>
                          void updateOne(item.id, 'rejected', 'Sipariş reddedildi'),
                      },
                    ]
                  : []),
                ...(canShip
                  ? [
                      {
                        id: 'ship',
                        label: 'Gönderi oluştur',
                        icon: PackagePlus,
                        onClick: () => {
                          toast.success('Gönderi oluşturma akışına yönlendiriliyor')
                          window.location.href = `${ARF_ROUTES.gonder.shipments.create}?orderId=${item.id}`
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
    []
  )

  const tabs = VIEWS.map((id) => ({
    id,
    label: VIEW_LABELS[id],
    count: data?.viewCounts[id],
  }))

  return (
    <DataWorkspace
      breadcrumbs={[{ label: 'Gönder' }, { label: 'Siparişler' }]}
      title='Siparişler'
      description='Entegrasyonlardan gelen siparişleri inceleyin ve gönderiye dönüştürün.'
      headerActions={
        <>
          <Button variant='outline' size='sm'>
            Siparişleri içe aktar
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
      filterChips={
        url.status
          ? [
              {
                id: 'status',
                label: `Durum: ${ORDER_STATUS_LABELS[url.status as OrderStatus] ?? url.status}`,
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
    </DataWorkspace>
  )
}
