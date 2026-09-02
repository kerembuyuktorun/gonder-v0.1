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
import { useFinanceTransactions } from '../../_hooks/use-finance'
import {
  formatFinanceDateTime,
  formatMoney,
  type FinanceSettlementChannel,
  type FinanceTransaction,
} from '../../_types/finance'
import { FinanceEntityLinks } from './finance-entity-links'
import { PaymentStatusBadge, SettlementBadge } from './finance-status-badge'

const VIEWS = ['all', 'wallet', 'cari', 'credit'] as const
type View = (typeof VIEWS)[number]

const VIEW_LABELS: Record<View, string> = {
  all: 'Tümü',
  wallet: 'Cüzdan',
  cari: 'Cari hesap',
  credit: 'İade / yükleme',
}

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater

export function FinanceTransactionsContent() {
  const router = useRouter()
  const [view, setView] = useState<View>('all')
  const [search, setSearch] = useState('')
  const [table, setTable] = useState<TanStackTable<FinanceTransaction> | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const query = useMemo(() => {
    const settlement: FinanceSettlementChannel | null =
      view === 'wallet' || view === 'cari' ? view : null
    return { search, settlement }
  }, [search, view])

  const { data, isLoading } = useFinanceTransactions(query)
  const items = (data?.items ?? []).filter((item) => (view === 'credit' ? item.direction === 'credit' : true))
  const pageCount = Math.max(1, Math.ceil(items.length / pagination.pageSize) || 1)
  const pageItems = items.slice(
    pagination.pageIndex * pagination.pageSize,
    pagination.pageIndex * pagination.pageSize + pagination.pageSize
  )

  const columns = useMemo<ColumnDef<FinanceTransaction>[]>(
    () => [
      {
        accessorKey: 'occurredAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Tarih' />,
        cell: ({ row }) => (
          <span className='whitespace-nowrap text-sm tabular-nums text-muted-foreground'>
            {formatFinanceDateTime(row.original.occurredAt)}
          </span>
        ),
      },
      {
        id: 'narrative',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Açıklama' />,
        cell: ({ row }) => (
          <div className='min-w-[18rem] max-w-[36rem] space-y-1.5'>
            <p className='text-sm leading-relaxed'>{row.original.narrative}</p>
            <FinanceEntityLinks
              order={row.original.order}
              shipment={row.original.shipment}
              invoice={row.original.invoice}
              quote={row.original.quote}
            />
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
        cell: ({ row }) => <PaymentStatusBadge status={row.original.status} />,
      },
      {
        id: 'amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Tutar' />,
        cell: ({ row }) => {
          const debit = row.original.direction === 'debit'
          return (
            <span className={debit ? 'tabular-nums font-medium' : 'tabular-nums font-medium text-emerald-700'}>
              {debit ? '−' : '+'}
              {formatMoney(row.original.amount)}
            </span>
          )
        },
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
                  router.push(ARF_ROUTES.gonder.finance.transactions.detail(row.original.id)),
              },
            ]}
          />
        ),
      },
    ],
    [router]
  )

  const tabs = VIEWS.map((id) => ({
    id,
    label: VIEW_LABELS[id],
  }))

  return (
    <DataWorkspace
      breadcrumbs={[
        { label: 'Gönder', href: ARF_ROUTES.gonder.dashboard.root },
        { label: 'Finans', href: ARF_ROUTES.gonder.finance.root },
        { label: 'Hareketler' },
      ]}
      title='Hareketler'
      description='Sipariş ve gönderilere bağlı cari hareketler — fatura veya cüzdan açıklamasıyla.'
      tabs={tabs}
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
      searchPlaceholder='Sipariş, gönderi veya fatura ara…'
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
        emptyMessage='Bu görünüm için hareket yok.'
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
