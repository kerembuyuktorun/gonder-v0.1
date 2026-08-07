'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Table as TanStackTable,
  Updater,
} from '@tanstack/react-table'
import {
  DataTable,
  DataTableExcelActions,
  DataTablePagination,
  DataTableViewOptions,
} from '@hascanb/arf-ui-kit/datatable-kit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Search, Trash2, X } from 'lucide-react'
import { createOrderColumns } from '../../../orders/_columns/orders-columns'
import { queryOrders } from '../../../orders/_lib/query-orders'
import type { LastmileOrder } from '../../../orders/_types/order'

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater

type Props = {
  orders: LastmileOrder[]
  isLoading?: boolean
  onRefresh?: () => void
  onRemoveFromRoute?: (orderIds: string[]) => void
}

/** Sipariş listesiyle aynı DataTable — yalnızca rota siparişleri */
export function RouteOrdersPanel({
  orders,
  isLoading = false,
  onRefresh,
  onRemoveFromRoute,
}: Props) {
  const [table, setTable] = useState<TanStackTable<LastmileOrder> | null>(null)
  const [data, setData] = useState<LastmileOrder[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [showSearch, setShowSearch] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'olusturulma_zamani', desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const columns = useMemo(
    () =>
      createOrderColumns({
        onRemoveFromRoute: onRemoveFromRoute
          ? (order) => onRemoveFromRoute([order.id])
          : undefined,
      }),
    [onRemoveFromRoute]
  )
  const getRowId = useCallback((order: LastmileOrder) => order.id, [])

  const selectedOrders = useMemo(() => {
    const selectedIds = Object.keys(rowSelection).filter((rowId) => rowSelection[rowId])
    if (selectedIds.length === 0) return []
    const byId = new Map(orders.map((order) => [order.id, order]))
    return selectedIds
      .map((id) => byId.get(id))
      .filter((order): order is LastmileOrder => Boolean(order))
  }, [orders, rowSelection])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setGlobalFilter(searchInput)
      setPagination((previous) => ({ ...previous, pageIndex: 0 }))
    }, 250)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    const result = queryOrders({
      rows: orders,
      scope: { typeScope: 'all', statusScopes: [] },
      pagination,
      sorting,
      columnFilters,
      globalFilter,
    })
    setData(result.rows)
    setTotalRows(result.totalRows)
  }, [orders, pagination, sorting, columnFilters, globalFilter])

  const pageCount = Math.max(1, Math.ceil(totalRows / pagination.pageSize))

  return (
    <div className='space-y-4'>
      {table && (
        <div className='w-fit max-w-full space-y-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              type='button'
              variant={showSearch ? 'default' : 'outline'}
              size='sm'
              className='h-8'
              onClick={() => setShowSearch((previous) => !previous)}
            >
              <Search className='mr-2 size-4' />
              Ara
              {searchInput.trim().length > 0 && (
                <Badge variant='secondary' className='ml-2 rounded-sm px-1 font-normal'>
                  1
                </Badge>
              )}
            </Button>

            {showSearch ? (
              <div className='relative min-w-[280px] max-w-md flex-1'>
                <Search className='absolute left-2.5 top-2.5 size-4 text-muted-foreground' />
                <Input
                  autoFocus
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder='Takip no, müşteri, muhatap ara...'
                  className='h-8 pl-8'
                />
                {searchInput ? (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute right-0 top-0 h-8 px-2'
                    onClick={() => setSearchInput('')}
                  >
                    <X className='size-4' />
                  </Button>
                ) : null}
              </div>
            ) : (
              <>
                <DataTableViewOptions
                  table={table}
                  label='Görünüm'
                  columnsLabel='Sütunlar'
                  className='ml-0 flex h-8'
                />
                <DataTableExcelActions
                  table={table}
                  filename='rota-siparisleri'
                  exportSelected={false}
                  exportLabel='Dışarı Aktar'
                />
                {onRefresh ? (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='h-8'
                    onClick={onRefresh}
                  >
                    <RefreshCw className='mr-2 size-4' />
                    Yenile
                  </Button>
                ) : null}
              </>
            )}
          </div>

          {selectedOrders.length > 0 && onRemoveFromRoute ? (
            <div className='flex w-full flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/50 px-4 py-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='h-8 text-rose-700 hover:bg-rose-50 hover:text-rose-800'
                onClick={() => {
                  onRemoveFromRoute(selectedOrders.map((order) => order.id))
                  setRowSelection({})
                }}
              >
                <Trash2 className='mr-2 size-4' />
                {selectedOrders.length === 1 ? 'Rotadan Çıkar' : 'Toplu Rotadan Çıkar'}
              </Button>
              <div className='flex items-center gap-2'>
                <p className='text-sm font-medium text-muted-foreground'>
                  {selectedOrders.length === 1
                    ? `${selectedOrders[0]?.takip_no ?? ''} Seçildi`
                    : `${selectedOrders.length} sipariş seçildi`}
                </p>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700'
                  onClick={() => setRowSelection({})}
                  aria-label='Seçimi temizle'
                >
                  <X className='size-4' />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <DataTable
        data={data}
        columns={columns}
        enablePagination
        pagination={pagination}
        onPaginationChange={(updater) =>
          setPagination((previous) => resolveUpdater(updater, previous))
        }
        pageCount={pageCount}
        manualPagination
        enableSorting
        sorting={sorting}
        onSortingChange={(updater) => {
          setSorting((previous) => resolveUpdater(updater, previous))
          setPagination((previous) => ({ ...previous, pageIndex: 0 }))
        }}
        manualSorting
        enableGlobalFilter
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        columnFilters={columnFilters}
        onColumnFiltersChange={(updater) => {
          setColumnFilters((previous) => resolveUpdater(updater, previous))
          setPagination((previous) => ({ ...previous, pageIndex: 0 }))
        }}
        manualFiltering
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={(updater) =>
          setRowSelection((previous) => resolveUpdater(updater, previous))
        }
        getRowId={getRowId}
        enableColumnVisibility
        enableHorizontalScroll
        stickyFirstColumn
        stickyLeftColumnCount={2}
        stickyLastColumn
        isLoading={isLoading}
        className='[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600'
        emptyMessage='Bu rotada sipariş yok.'
        onTableReady={setTable}
      />

      {table && (
        <DataTablePagination
          table={table as TanStackTable<unknown>}
          pageSizeOptions={[5, 10, 20, 50]}
          totalRows={totalRows}
        />
      )}
    </div>
  )
}
