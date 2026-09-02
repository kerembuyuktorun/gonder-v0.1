'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ColumnDef, PaginationState, Table as TanStackTable, Updater } from '@tanstack/react-table'
import {
  DataTable,
  DataTableColumnHeader,
  DataTablePagination,
  DataTableViewOptions,
} from '@hascanb/arf-ui-kit/datatable-kit'
import { Eye } from 'lucide-react'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { DataWorkspace, RowQuickActions } from '../../_components/data-workspace'
import { useFinanceInvoices } from '../../_hooks/use-finance'
import {
  formatFinanceDate,
  formatMoney,
  type FinanceInvoice,
  type FinanceInvoiceStatus,
} from '../../_types/finance'
import { FinanceEntityLinks } from './finance-entity-links'
import { InvoiceKindBadge, InvoiceStatusBadge, SettlementBadge } from './finance-status-badge'

const VIEWS = ['all', 'issued', 'paid', 'draft'] as const
type View = (typeof VIEWS)[number]

const VIEW_LABELS: Record<View, string> = {
  all: 'Tümü',
  issued: 'Açık',
  paid: 'Ödendi',
  draft: 'Taslak',
}

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater

export function FinanceInvoicesContent() {
  const router = useRouter()
  const [view, setView] = useState<View>('all')
  const [search, setSearch] = useState('')
  const [table, setTable] = useState<TanStackTable<FinanceInvoice> | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const invoiceStatus: FinanceInvoiceStatus | null =
    view === 'all' ? null : (view as FinanceInvoiceStatus)

  const { data, isLoading } = useFinanceInvoices({
    search,
    invoiceStatus,
  })
  const items = data?.items ?? []
  const pageCount = Math.max(1, Math.ceil(items.length / pagination.pageSize) || 1)
  const pageItems = items.slice(
    pagination.pageIndex * pagination.pageSize,
    pagination.pageIndex * pagination.pageSize + pagination.pageSize
  )

  const columns = useMemo<ColumnDef<FinanceInvoice>[]>(
    () => [
      {
        accessorKey: 'number',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fatura' />,
        cell: ({ row }) => (
          <div className='flex flex-wrap items-center gap-1.5'>
            <span className='font-medium'>{row.original.number}</span>
            <InvoiceKindBadge kind={row.original.kind} />
          </div>
        ),
      },
      {
        accessorKey: 'issuedAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Kesim' />,
        cell: ({ row }) => formatFinanceDate(row.original.issuedAt),
      },
      {
        accessorKey: 'dueAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Vade' />,
        cell: ({ row }) => formatFinanceDate(row.original.dueAt),
      },
      {
        id: 'related',
        header: ({ column }) => <DataTableColumnHeader column={column} title='İlişkili' />,
        cell: ({ row }) => (
          <div className='flex flex-wrap items-center gap-1.5'>
            {row.original.relatedShipments.map((shipment) => (
              <FinanceEntityLinks key={shipment.id} shipment={shipment} />
            ))}
            {row.original.relatedOrders.map((order) => (
              <FinanceEntityLinks key={order.id} order={order} />
            ))}
            {!row.original.relatedShipments.length && !row.original.relatedOrders.length ? (
              <span className='text-muted-foreground'>—</span>
            ) : null}
          </div>
        ),
      },
      {
        id: 'settlement',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Kanal' />,
        cell: ({ row }) => <SettlementBadge settlement={row.original.settlement} />,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Durum' />,
        cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />,
      },
      {
        id: 'amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Tutar' />,
        cell: ({ row }) => (
          <span className='tabular-nums font-medium'>{formatMoney(row.original.amount)}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        size: 120,
        cell: ({ row }) => (
          <RowQuickActions
            actions={[
              {
                id: 'view',
                label: 'İncele',
                icon: Eye,
                priority: 'primary',
                variant: 'secondary',
                onClick: () =>
                  router.push(ARF_ROUTES.gonder.finance.invoices.detail(row.original.id)),
              },
            ]}
          />
        ),
      },
    ],
    [router]
  )

  return (
    <DataWorkspace
      breadcrumbs={[
        { label: 'Gönder', href: ARF_ROUTES.gonder.dashboard.root },
        { label: 'Finans', href: ARF_ROUTES.gonder.finance.root },
        { label: 'Faturalar' },
      ]}
      title='Faturalar'
      description='Geçmiş faturalar ve bağlı gönderi / sipariş hareketleri.'
      tabs={VIEWS.map((id) => ({ id, label: VIEW_LABELS[id] }))}
      view={view}
      onViewChange={(next) => {
        setView(next)
        setPagination((p) => ({ ...p, pageIndex: 0 }))
      }}
      search={search}
      onSearchChange={(value) => {
        setSearch(value)
        setPagination((p) => ({ ...p, pageIndex: 0 }))
      }}
      searchPlaceholder='Fatura no, sipariş veya gönderi ara…'
      onClearFilters={() => {
        setSearch('')
        setView('all')
      }}
      toolbarTrailing={table ? <DataTableViewOptions table={table} /> : null}
    >
      <DataTable
        data={pageItems}
        columns={columns}
        enablePagination
        pagination={pagination}
        onPaginationChange={(updater) => setPagination((prev) => resolveUpdater(updater, prev))}
        pageCount={pageCount}
        manualPagination
        getRowId={(row) => row.id}
        isLoading={isLoading}
        emptyMessage='Bu görünüm için fatura yok.'
        onTableReady={setTable}
      />
      {table ? (
        <DataTablePagination
          table={table as TanStackTable<unknown>}
          pageSizeOptions={[5, 10, 20]}
          totalRows={items.length}
        />
      ) : null}
    </DataWorkspace>
  )
}
