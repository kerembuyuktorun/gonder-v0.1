'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ColumnDef, PaginationState, Table as TanStackTable, Updater } from '@tanstack/react-table'
import {
  DataTable,
  DataTableColumnHeader,
  DataTablePagination,
} from '@hascanb/arf-ui-kit/datatable-kit'
import { Eye } from 'lucide-react'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { DataWorkspace, RowQuickActions } from '../../_components/data-workspace'
import { useWalletLedger } from '../../_hooks/use-wallet'
import { formatFinanceDateTime, formatMoney } from '../../_types/finance'
import { WALLET_LEDGER_TYPE_LABELS, type WalletLedgerEntry } from '../../_types/wallet'

const VIEWS = ['all', 'top_up', 'payment', 'refund'] as const
type View = (typeof VIEWS)[number]

const VIEW_LABELS: Record<View, string> = {
  all: 'Tümü',
  top_up: 'Yükleme',
  payment: 'Ödeme',
  refund: 'İade',
}

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater

export function FinanceWalletHistoryContent() {
  const router = useRouter()
  const [view, setView] = useState<View>('all')
  const [search, setSearch] = useState('')
  const [table, setTable] = useState<TanStackTable<WalletLedgerEntry> | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const { data, isLoading } = useWalletLedger({
    search,
    type: view === 'all' ? null : view,
  })
  const items = data?.items ?? []
  const pageCount = Math.max(1, Math.ceil(items.length / pagination.pageSize) || 1)
  const pageItems = items.slice(
    pagination.pageIndex * pagination.pageSize,
    pagination.pageIndex * pagination.pageSize + pagination.pageSize
  )

  const columns = useMemo<ColumnDef<WalletLedgerEntry>[]>(
    () => [
      {
        accessorKey: 'occurredAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Tarih' />,
        cell: ({ row }) => formatFinanceDateTime(row.original.occurredAt),
      },
      {
        accessorKey: 'description',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Açıklama' />,
        cell: ({ row }) => (
          <div>
            <p className='text-sm'>{row.original.description}</p>
            <p className='text-[11px] text-muted-foreground'>
              {WALLET_LEDGER_TYPE_LABELS[row.original.type]}
            </p>
          </div>
        ),
      },
      {
        id: 'amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Tutar' />,
        cell: ({ row }) => (
          <span
            className={
              row.original.signedAmount < 0
                ? 'tabular-nums font-medium'
                : 'tabular-nums font-medium text-emerald-700'
            }
          >
            {row.original.signedAmount < 0 ? '−' : '+'}
            {formatMoney(row.original.amount)}
          </span>
        ),
      },
      {
        id: 'balance',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Bakiye' />,
        cell: ({ row }) => (
          <span className='tabular-nums text-muted-foreground'>
            {formatMoney(row.original.balanceAfter)}
          </span>
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
                  router.push(ARF_ROUTES.gonder.finance.wallet.historyDetail(row.original.id)),
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
        { label: 'Cüzdan', href: ARF_ROUTES.gonder.finance.wallet.root },
        { label: 'Geçmiş' },
      ]}
      title='Cüzdan geçmişi'
      description='Cüzdan ledger kayıtları — yükleme, ödeme ve iade.'
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
      searchPlaceholder='Açıklama ara…'
      onClearFilters={() => {
        setSearch('')
        setView('all')
      }}
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
        emptyMessage='Cüzdan hareketi yok.'
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
