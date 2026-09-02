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
import { Eye, RefreshCw, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { DataWorkspace, RowQuickActions } from '../../_components/data-workspace'
import { useQuoteRequestsList } from '../../_hooks/use-quote-requests'
import { useWorkspaceListUrlState } from '../../_hooks/use-workspace-list-url-state'
import { OPERATION_TYPE_LABELS } from '../../_lib/price-calculation-labels'
import {
  QUOTE_REQUEST_STATUS_BADGE,
  QUOTE_REQUEST_STATUS_LABELS,
  type QuoteRequest,
  type QuoteRequestStatus,
  type QuoteRequestView,
} from '../../_types/quotes'

const VIEWS = ['all', 'open', 'action_required', 'ready', 'converted', 'closed'] as const

const VIEW_LABELS: Record<QuoteRequestView, string> = {
  all: 'Tümü',
  open: 'Açık',
  action_required: 'Aksiyon bekleyen',
  ready: 'Hazır / yanıt bekleyen',
  converted: 'Dönüşenler',
  closed: 'Kapalı',
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

function bestPrice(request: QuoteRequest) {
  const prices = request.offers
    .map((offer) => offer.priceTry)
    .filter((value): value is number => typeof value === 'number')
  if (!prices.length) return null
  return Math.min(...prices)
}

export function QuotesContent() {
  const url = useWorkspaceListUrlState({
    defaultView: 'open',
    validViews: VIEWS,
  })
  const [searchInput, setSearchInput] = useState(url.search)
  const [table, setTable] = useState<TanStackTable<QuoteRequest> | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const listQuery = useMemo(
    () => ({
      view: url.view,
      status: (url.status as QuoteRequestStatus | null) ?? null,
      search: url.search,
    }),
    [url.search, url.status, url.view]
  )

  const { data, isLoading } = useQuoteRequestsList(listQuery)
  const items = data?.items ?? []
  const pageCount = Math.max(1, Math.ceil(items.length / pagination.pageSize) || 1)
  const pageItems = items.slice(
    pagination.pageIndex * pagination.pageSize,
    pagination.pageIndex * pagination.pageSize + pagination.pageSize
  )

  const columns = useMemo<ColumnDef<QuoteRequest>[]>(
    () => [
      createSelectionColumn<QuoteRequest>(),
      {
        accessorKey: 'reference',
        size: 148,
        minSize: 132,
        header: ({ column }) => <DataTableColumnHeader column={column} title='Talep No' />,
        cell: ({ row }) => (
          <Link
            href={ARF_ROUTES.gonder.quotes.detail(row.original.id)}
            className='block truncate font-medium hover:underline'
          >
            {row.original.reference}
          </Link>
        ),
      },
      {
        id: 'route',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Rota' />,
        cell: ({ row }) => (
          <span className='text-muted-foreground'>
            {row.original.originCity ?? row.original.originLabel} →{' '}
            {row.original.destinationCity ?? row.original.destinationLabel}
          </span>
        ),
      },
      {
        accessorKey: 'operationType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Operasyon' />,
        cell: ({ row }) => OPERATION_TYPE_LABELS[row.original.operationType],
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Durum' />,
        cell: ({ row }) => (
          <Badge variant='outline' className={QUOTE_REQUEST_STATUS_BADGE[row.original.status]}>
            {QUOTE_REQUEST_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        id: 'offers',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Teklif' />,
        cell: ({ row }) => {
          const received = row.original.offers.filter((o) => o.status !== 'pending').length
          return (
            <span className='tabular-nums text-sm'>
              {received}/{row.original.offers.length}
            </span>
          )
        },
      },
      {
        id: 'bestPrice',
        header: ({ column }) => <DataTableColumnHeader column={column} title='En iyi fiyat' />,
        cell: ({ row }) => {
          const price = bestPrice(row.original)
          return price == null
            ? '—'
            : new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                maximumFractionDigits: 0,
              }).format(price)
        },
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
          const canCancel =
            item.status === 'draft' ||
            item.status === 'submitted' ||
            item.status === 'collecting' ||
            item.status === 'partially_received' ||
            item.status === 'ready'
          const canRerequest =
            item.status === 'expired' ||
            item.status === 'cancelled' ||
            item.status === 'rejected'

          return (
            <RowQuickActions
              actions={[
                {
                  id: 'view',
                  labelKey: 'quotes.viewOffers',
                  shortLabelKey: 'quotes.viewOffersShort',
                  icon: Eye,
                  priority: 'primary',
                  variant: 'secondary',
                  onClick: () => {
                    window.location.href = ARF_ROUTES.gonder.quotes.detail(item.id)
                  },
                },
                ...(canCancel
                  ? [
                      {
                        id: 'cancel',
                        labelKey: 'quotes.cancelRequest',
                        icon: XCircle,
                        priority: 'overflow' as const,
                        variant: 'destructive' as const,
                        requiresConfirmation: true,
                        confirmation: {
                          titleKey: 'quotes.cancelConfirmTitle',
                          descriptionKey: 'quotes.cancelConfirmDescription',
                          confirmLabelKey: 'quotes.cancelConfirmAction',
                        },
                        onClick: () => toast.message('Talep iptali kaydedilecek'),
                      },
                    ]
                  : []),
                ...(canRerequest
                  ? [
                      {
                        id: 'rerequest',
                        labelKey: 'quotes.rerequest',
                        shortLabelKey: 'quotes.rerequestShort',
                        icon: RefreshCw,
                        priority: 'secondary' as const,
                        variant: 'secondary' as const,
                        onClick: () => {
                          toast.message('Yeniden talep için teklif al adımına yönlendiriliyor')
                          window.location.href = ARF_ROUTES.gonder.priceCalculation
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
      breadcrumbs={[{ label: 'Gönder' }, { label: 'Teklifler' }]}
      title='Teklifler'
      description='Talebiniz için oluşan taşıma seçeneklerini izleyin ve teklif seçin.'
      headerActions={
        <Button size='sm' asChild>
          <Link href={ARF_ROUTES.gonder.priceCalculation}>Teklif al</Link>
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
      searchPlaceholder='Talep no, rota veya taşıyıcı ara…'
      onClearFilters={() => {
        setSearchInput('')
        url.clearFilters()
      }}
      toolbarTrailing={table ? <DataTableViewOptions table={table} /> : null}
      selectedCount={Object.keys(rowSelection).filter((id) => rowSelection[id]).length}
      onClearSelection={() => setRowSelection({})}
      bulkActions={null}
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
        emptyMessage='Kayıt bulunamadı. Bu görünüm için teklif talebi yok.'
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
