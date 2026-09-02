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
import { CreditCard, Eye } from 'lucide-react'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { DataWorkspace, RowQuickActions } from '../../_components/data-workspace'
import { useUpcomingPayments } from '../../_hooks/use-finance'
import {
  formatFinanceDate,
  formatMoney,
  type UpcomingPayment,
} from '../../_types/finance'
import { FinanceEntityLinks } from './finance-entity-links'
import { FinancePayDialog } from './finance-pay-dialog'
import { InvoiceKindBadge, PaymentStatusBadge, SettlementBadge } from './finance-status-badge'

const VIEWS = ['all', 'open', 'due_soon'] as const
type View = (typeof VIEWS)[number]

const VIEW_LABELS: Record<View, string> = {
  all: 'Tümü',
  open: 'Açık faturalar',
  due_soon: '7 gün içinde',
}

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater

function isOpen(item: UpcomingPayment) {
  return ['unpaid', 'partial', 'pending'].includes(item.status)
}

function isDueSoon(item: UpcomingPayment, now = Date.now()) {
  if (!isOpen(item)) return false
  const due = new Date(item.dueAt).getTime()
  return due <= now + 7 * 24 * 60 * 60 * 1000
}

export function FinanceUpcomingContent() {
  const router = useRouter()
  const [view, setView] = useState<View>('open')
  const [search, setSearch] = useState('')
  const [table, setTable] = useState<TanStackTable<UpcomingPayment> | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [paying, setPaying] = useState<UpcomingPayment | null>(null)

  const { data, isLoading } = useUpcomingPayments({ search })
  const items = (data?.items ?? []).filter((item) => {
    if (view === 'open') return isOpen(item)
    if (view === 'due_soon') return isDueSoon(item)
    return true
  })
  const pageCount = Math.max(1, Math.ceil(items.length / pagination.pageSize) || 1)
  const pageItems = items.slice(
    pagination.pageIndex * pagination.pageSize,
    pagination.pageIndex * pagination.pageSize + pagination.pageSize
  )

  const columns = useMemo<ColumnDef<UpcomingPayment>[]>(
    () => [
      {
        accessorKey: 'dueAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Vade' />,
        cell: ({ row }) => (
          <span className='whitespace-nowrap text-sm tabular-nums'>
            {formatFinanceDate(row.original.dueAt)}
          </span>
        ),
      },
      {
        accessorKey: 'invoiceNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fatura' />,
        cell: ({ row }) => (
          <div className='space-y-1'>
            <div className='flex flex-wrap items-center gap-1.5'>
              <span className='font-medium'>{row.original.invoiceNumber ?? '—'}</span>
              <InvoiceKindBadge kind={row.original.invoiceKind} />
            </div>
            <p className='max-w-[24rem] text-xs text-muted-foreground'>{row.original.narrative}</p>
          </div>
        ),
      },
      {
        id: 'related',
        header: ({ column }) => <DataTableColumnHeader column={column} title='İlişki' />,
        cell: ({ row }) => (
          <FinanceEntityLinks
            order={row.original.order}
            shipment={row.original.shipment}
            invoice={row.original.invoice}
          />
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
        cell: ({ row }) => (
          <span className='tabular-nums font-medium'>{formatMoney(row.original.amount)}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        size: 160,
        cell: ({ row }) => {
          const open = isOpen(row.original)
          return (
            <RowQuickActions
              actions={[
                ...(open
                  ? [
                      {
                        id: 'pay',
                        label: 'Öde',
                        icon: CreditCard,
                        priority: 'primary' as const,
                        variant: 'primary' as const,
                        onClick: () => setPaying(row.original),
                      },
                    ]
                  : []),
                {
                  id: 'view',
                  label: 'İncele',
                  icon: Eye,
                  priority: open ? 'overflow' : 'primary',
                  variant: 'secondary',
                  onClick: () =>
                    router.push(ARF_ROUTES.gonder.finance.upcoming.detail(row.original.id)),
                },
              ]}
            />
          )
        },
      },
    ],
    [router]
  )

  return (
    <>
      <DataWorkspace
        breadcrumbs={[
          { label: 'Gönder', href: ARF_ROUTES.gonder.dashboard.root },
          { label: 'Finans', href: ARF_ROUTES.gonder.finance.root },
          { label: 'Yaklaşan ödemeler' },
        ]}
        title='Yaklaşan ödemeler'
        description='Vadesi gelen fatura ödemeleri. Gönder fatura bazlı çalışır; açık hesap ve cüzdan burada kapanır.'
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
        searchPlaceholder='Fatura no veya gönderi ara…'
        onClearFilters={() => {
          setSearch('')
          setView('open')
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
          emptyMessage='Bu görünüm için yaklaşan fatura ödemesi yok.'
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
      <FinancePayDialog
        payment={paying}
        open={paying != null}
        onOpenChange={(open) => {
          if (!open) setPaying(null)
        }}
      />
    </>
  )
}
