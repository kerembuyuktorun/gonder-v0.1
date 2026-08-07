'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableViewOptions,
} from '@hascanb/arf-ui-kit/datatable-kit'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ARF_ROUTES } from '../../../_shared/routes'
import {
  ArrowLeft,
  Ban,
  ChevronDown,
  ChevronUp,
  FileText,
  Filter,
  PackagePlus,
  Printer,
  RefreshCw,
  Search,
  UserPlus,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { fetchOrdersPool } from './_api/list-orders'
import { createOrderColumns } from './_columns/orders-columns'
import { OrderListTabs } from './_components/order-list-tabs'
import { orderStatusFilterOptions } from './_components/order-status-badge'
import { orderTypeFilterOptions } from './_components/order-type-badge'
import {
  countOrdersByStatusScope,
  countOrdersByTypeScope,
  queryOrders,
} from './_lib/query-orders'
import { mockOrderList } from './_mock/orders-mock-data'
import {
  applyInstantCancel,
  createCancelRequest,
  mergeOrdersWithOps,
} from './_mock/order-ops-store'
import { canInstantCancel, canRequestCancel } from './_lib/order-ops-policy'
import { isLastmileDemoForced } from '../_lib/lastmile-demo-mode'
import type { LastmileOrder, OrderStatusScope, OrderTypeScope } from './_types/order'

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater

function activeOrdersOnly(orders: LastmileOrder[]) {
  return orders.filter((order) => order.durum !== 'iptal_edildi')
}

function matchesCustomerFilter(
  order: LastmileOrder,
  customerId: string | null,
  customerName: string | null
) {
  if (!customerId && !customerName) return true

  // orderOwner ile API filtresi uygulanıyorsa istemci tarafında tekrar filtreleme yapma
  if (customerId && !customerName) return true

  if (customerId && order.musteri_id && order.musteri_id === customerId) return true

  if (customerName) {
    const needle = customerName.trim().toLocaleLowerCase('tr-TR')
    if (!needle) return true
    return order.musteri.toLocaleLowerCase('tr-TR').includes(needle)
  }

  return false
}

export default function OrdersListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const forceDemo = isLastmileDemoForced(searchParams)
  const [demoFallback, setDemoFallback] = useState(false)
  const useDemo = forceDemo || demoFallback
  const customerIdFilter = searchParams.get('customer')?.trim() || null
  const customerNameFilter = searchParams.get('customerName')?.trim() || null
  const customerScoped = Boolean(customerIdFilter || customerNameFilter)
  const pageTitle = customerNameFilter
    ? `${customerNameFilter} Sipariş Listesi`
    : useDemo
      ? 'Sipariş Listesi (Demo)'
      : 'Sipariş Listesi'
  const customerDetailHref = customerIdFilter
    ? ARF_ROUTES.lastmile.customers.detail(customerIdFilter)
    : null

  const [table, setTable] = useState<TanStackTable<LastmileOrder> | null>(null)
  const [allOrders, setAllOrders] = useState<LastmileOrder[]>([])
  const [data, setData] = useState<LastmileOrder[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showSearch, setShowSearch] = useState(false)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)
  const [showTabs, setShowTabs] = useState(true)
  const [typeScope, setTypeScope] = useState<OrderTypeScope>('all')
  const [statusScopes, setStatusScopes] = useState<OrderStatusScope[]>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'olusturulma_zamani', desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const loadDemoOrders = useCallback((search: string) => {
    const needle = search.trim().toLocaleLowerCase('tr-TR')
    const pool = mergeOrdersWithOps(mockOrderList)
    if (!needle) return pool
    return pool.filter((order) => {
      const hay = [
        order.takip_no,
        order.referans_no,
        order.musteri,
        order.atanan_kurye,
        order.alis_noktasi,
        order.varis_noktasi,
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('tr-TR')
      return hay.includes(needle)
    })
  }, [])

  const customerScopedOrders = useMemo(
    () =>
      allOrders.filter((order) =>
        matchesCustomerFilter(order, customerIdFilter, customerNameFilter)
      ),
    [allOrders, customerIdFilter, customerNameFilter]
  )

  const typeCounts = useMemo(
    () => countOrdersByTypeScope(activeOrdersOnly(customerScopedOrders), []),
    [customerScopedOrders]
  )
  const statusCounts = useMemo(
    () => countOrdersByStatusScope(customerScopedOrders, 'all'),
    [customerScopedOrders]
  )

  const courierFilterOptions = useMemo(() => {
    const names = Array.from(
      new Set(
        allOrders
          .map((order) => order.atanan_kurye)
          .filter(Boolean) as string[]
      )
    ).sort((a, b) => a.localeCompare(b, 'tr'))

    return [
      { label: 'Atanmadı', value: 'Atanmadı' },
      ...names.map((value) => ({ label: value, value })),
    ]
  }, [allOrders])

  const columns = useMemo(
    () =>
      createOrderColumns({
        demo: useDemo,
        onCancelOrder: (order) => {
          void (async () => {
            if (order.durum === 'iptal_edildi') return
            if (canInstantCancel(order.durum, order.rota_atandi)) {
              await applyInstantCancel(order.id)
              setAllOrders((prev) => mergeOrdersWithOps(prev))
              toast.success(`${order.takip_no} iptal edildi`)
              return
            }
            if (canRequestCancel(order.durum)) {
              await createCancelRequest({
                orderId: order.id,
                orderTakipNo: order.takip_no,
                customerName: order.musteri,
                reasonCode: 'r-5',
                reasonLabel: 'Müşteri iptal etti',
              })
              toast.success('İptal talebi oluşturuldu')
              return
            }
            toast.message('Bu durumda iptal mümkün değil')
          })()
        },
      }),
    [useDemo]
  )

  const selectedOrders = useMemo(() => {
    const selectedIds = Object.keys(rowSelection).filter((rowId) => rowSelection[rowId])
    if (selectedIds.length === 0) return []

    const byId = new Map(allOrders.map((order) => [order.id, order]))
    return selectedIds
      .map((id) => byId.get(id))
      .filter((order): order is LastmileOrder => Boolean(order))
  }, [allOrders, rowSelection])

  const getOrderRowId = useCallback((order: LastmileOrder) => order.id, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setGlobalFilter(searchInput)
      setPagination((previous) => ({ ...previous, pageIndex: 0 }))
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [searchInput])

  // Tek havuz isteği — sekme geçişleri network atmaz
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)

      if (forceDemo) {
        if (cancelled) return
        setDemoFallback(false)
        setAllOrders(loadDemoOrders(globalFilter))
        setIsLoading(false)
        return
      }

      const result = await fetchOrdersPool({
        search: globalFilter,
        orderOwner: customerIdFilter ?? undefined,
      })

      if (cancelled) return

      if (!result.success) {
        // API yok / hata → demo siparişler
        setDemoFallback(true)
        setAllOrders(loadDemoOrders(globalFilter))
        setIsLoading(false)
        toast.message('API erişilemedi · demo siparişler gösteriliyor')
        return
      }

      setDemoFallback(false)
      setAllOrders(result.data.orders)
      setIsLoading(false)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [globalFilter, refreshKey, customerIdFilter, forceDemo, loadDemoOrders])

  // Sekme / sayfa / kolon filtresi — istemci tarafı (ek istek yok)
  useEffect(() => {
    const pool =
      statusScopes.length === 0 ? activeOrdersOnly(customerScopedOrders) : customerScopedOrders

    const result = queryOrders({
      rows: pool,
      scope: { typeScope, statusScopes },
      pagination,
      sorting,
      columnFilters,
      globalFilter: '',
    })

    setData(result.rows)
    setTotalRows(result.totalRows)
  }, [
    customerScopedOrders,
    typeScope,
    statusScopes,
    pagination,
    sorting,
    columnFilters,
  ])

  const handleTableReady = useCallback((instance: TanStackTable<LastmileOrder>) => {
    setTable(instance)
  }, [])

  const handlePaginationChange = useCallback((updater: Updater<PaginationState>) => {
    setPagination((previous) => resolveUpdater(updater, previous))
  }, [])

  const handleSortingChange = useCallback((updater: Updater<SortingState>) => {
    setSorting((previous) => resolveUpdater(updater, previous))
    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
  }, [])

  const handleColumnFiltersChange = useCallback((updater: Updater<ColumnFiltersState>) => {
    setColumnFilters((previous) => resolveUpdater(updater, previous))
    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
  }, [])

  const handleTypeScopeChange = (scope: OrderTypeScope) => {
    setTypeScope(scope)
    setRowSelection({})
    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
  }

  const handleStatusScopeToggle = (scope: OrderStatusScope) => {
    setStatusScopes((previous) =>
      previous.includes(scope) ? previous.filter((item) => item !== scope) : [...previous, scope]
    )
    setRowSelection({})
    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
  }

  const handleManualRefresh = () => {
    setRowSelection({})
    setRefreshKey((previous) => previous + 1)
    toast.success('Sipariş listesi yenilendi')
  }

  const handleImport = (imported: LastmileOrder[]) => {
    setAllOrders((previous) => [...imported, ...previous])
    toast.success(`${imported.length} sipariş içeri aktarıldı`)
  }

  const handleBulkAssign = (selected: LastmileOrder[]) => {
    toast.message(`${selected.length} sipariş için toplu atama hazırlanıyor`)
  }

  const handleBulkCancel = (selected: LastmileOrder[]) => {
    void (async () => {
      let instant = 0
      let requests = 0
      for (const order of selected) {
        if (order.durum === 'iptal_edildi') continue
        if (canInstantCancel(order.durum, order.rota_atandi)) {
          await applyInstantCancel(order.id)
          instant += 1
        } else if (canRequestCancel(order.durum)) {
          await createCancelRequest({
            orderId: order.id,
            orderTakipNo: order.takip_no,
            customerName: order.musteri,
            reasonCode: 'r-5',
            reasonLabel: 'Müşteri iptal etti',
          })
          requests += 1
        }
      }
      setAllOrders((previous) => mergeOrdersWithOps(previous))
      setRowSelection({})
      if (instant || requests) {
        toast.success(
          [
            instant ? `${instant} anında iptal` : null,
            requests ? `${requests} iptal talebi` : null,
          ]
            .filter(Boolean)
            .join(' · ')
        )
      } else {
        toast.message('Seçimde iptal edilebilir sipariş yok')
      }
    })()
  }

  const handleBulkPrint = (selected: LastmileOrder[]) => {
    toast.message(`${selected.length} sipariş için etiket yazdırma kuyruğa alındı`)
  }

  const handleBulkInvoice = (selected: LastmileOrder[]) => {
    const eligible = selected.filter((order) => order.durum !== 'iptal_edildi')
    if (eligible.length === 0) {
      toast.error('Faturalamak için iptal edilmemiş sipariş seçin')
      return
    }
    const customerIds = Array.from(
      new Set(
        eligible
          .map((order) => order.musteri_id)
          .filter((id): id is string => Boolean(id))
      )
    )
    const resolvedCustomerId =
      customerIds.length === 1
        ? customerIds[0]
        : customerIds.length === 0 && customerIdFilter
          ? customerIdFilter
          : null

    if (!resolvedCustomerId) {
      if (customerIds.length > 1) {
        toast.error('Faturalama için seçilen siparişler aynı müşteriye ait olmalı')
      } else {
        toast.error('Seçilen siparişlerde müşteri bilgisi yok')
      }
      return
    }
    if (customerIds.length > 1) {
      toast.error('Faturalama için seçilen siparişler aynı müşteriye ait olmalı')
      return
    }
    const params = new URLSearchParams({
      mode: 'orders',
      customerId: resolvedCustomerId,
      orderIds: eligible.map((order) => order.id).join(','),
    })
    router.push(`${ARF_ROUTES.lastmile.finance.invoices.create}?${params.toString()}`)
  }

  const pageCount = Math.max(1, Math.ceil(totalRows / pagination.pageSize))

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Sipariş Yönetimi', href: ARF_ROUTES.lastmile.orders.list },
          { label: pageTitle },
        ]}
        searchPlaceholder='Lastmile ara...'
        searchShortcut={<>⌘K</>}
      />

      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex min-w-0 items-center gap-3'>
            {customerScoped ? (
              customerDetailHref ? (
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className='size-9 shrink-0 rounded-xl'
                  asChild
                >
                  <Link href={customerDetailHref} aria-label='Müşteri detaya geri dön'>
                    <ArrowLeft className='size-4' />
                  </Link>
                </Button>
              ) : (
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className='size-9 shrink-0 rounded-xl'
                  aria-label='Geri dön'
                  onClick={() => router.back()}
                >
                  <ArrowLeft className='size-4' />
                </Button>
              )
            ) : null}
            <h1 className='truncate text-2xl font-semibold tracking-tight'>{pageTitle}</h1>
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            {useDemo ? (
              <Badge className='bg-amber-100 text-amber-900 hover:bg-amber-100'>Demo veri</Badge>
            ) : null}
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 rounded-full'
              onClick={() => setShowTabs((previous) => !previous)}
            >
              {showTabs ? (
                <ChevronUp className='mr-2 size-4' />
              ) : (
                <ChevronDown className='mr-2 size-4' />
              )}
              {showTabs ? 'Sekmeleri Gizle' : 'Sekmeleri Göster'}
            </Button>
            <Button size='sm' variant='outline' asChild>
              <Link href={ARF_ROUTES.lastmile.orders.cancelRequests}>
                <Ban className='mr-2 size-4' />
                İptal Talepleri
              </Link>
            </Button>
            <Button size='sm' asChild>
              <Link href={ARF_ROUTES.lastmile.orders.create}>
                <PackagePlus className='mr-2 size-4' />
                Sipariş Oluştur
              </Link>
            </Button>
          </div>
        </div>

        {showTabs && (
          <OrderListTabs
            typeScope={typeScope}
            statusScopes={statusScopes}
            typeCounts={typeCounts}
            statusCounts={statusCounts}
            onTypeScopeChange={handleTypeScopeChange}
            onStatusScopeToggle={handleStatusScopeToggle}
          />
        )}

        <Card>
          <CardContent className='space-y-4 px-6'>
            {table && (
              <div className='w-fit max-w-full space-y-4'>
                <div className='flex flex-wrap items-center justify-start gap-2'>
                  <Button
                    type='button'
                    variant={showSearch ? 'default' : 'outline'}
                    size='sm'
                    className='h-8'
                    onClick={() => {
                      setShowSearch((previous) => {
                        const next = !previous
                        if (next) setShowFacetedFilters(false)
                        return next
                      })
                    }}
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
                    <div className='relative min-w-[240px] flex-1 max-w-md'>
                      <Search className='absolute left-2.5 top-2.5 size-4 text-muted-foreground' />
                      <Input
                        autoFocus
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder='Takip no, alıcı adı veya telefon ara...'
                        className='h-8 pl-8'
                      />
                    </div>
                  ) : (
                    <>
                      <Button
                        type='button'
                        variant={showFacetedFilters ? 'default' : 'outline'}
                        size='sm'
                        className='h-8'
                        onClick={() => {
                          setShowFacetedFilters((previous) => {
                            const next = !previous
                            if (next) setShowSearch(false)
                            return next
                          })
                        }}
                      >
                        <Filter className='mr-2 size-4' />
                        Filtreler
                        {columnFilters.length > 0 && (
                          <Badge variant='secondary' className='ml-2 rounded-sm px-1 font-normal'>
                            {columnFilters.length}
                          </Badge>
                        )}
                      </Button>

                      {showFacetedFilters ? (
                        <>
                          <DataTableFacetedFilter
                            column={table.getColumn('durum')}
                            title='Durum'
                            options={orderStatusFilterOptions}
                          />
                          <DataTableFacetedFilter
                            column={table.getColumn('atanan_kurye')}
                            title='Atanan Kurye'
                            options={courierFilterOptions}
                          />
                          <DataTableFacetedFilter
                            column={table.getColumn('siparis_tipi')}
                            title='Sipariş Tipi'
                            options={orderTypeFilterOptions}
                          />
                          {columnFilters.length > 0 && (
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              className='h-8 px-2 lg:px-3'
                              onClick={() => {
                                setColumnFilters([])
                                table.resetColumnFilters()
                                setPagination((previous) => ({ ...previous, pageIndex: 0 }))
                              }}
                            >
                              Sıfırla
                              <X className='ml-2 size-4' />
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          <DataTableViewOptions
                            table={table}
                            label='Görünüm'
                            columnsLabel='Sütunlar'
                            className='ml-0 flex h-8'
                          />

                          <div className='flex flex-row-reverse items-center gap-2'>
                            <DataTableExcelActions
                              table={table}
                              filename='siparis-listesi'
                              exportSelected={false}
                              exportLabel='Dışarı Aktar'
                              enableImport
                              importLabel='İçeri Aktar'
                              onImport={handleImport}
                            />
                          </div>

                          <Button type='button' variant='outline' size='sm' className='h-8' onClick={handleManualRefresh}>
                            <RefreshCw className='mr-2 size-4' />
                            Yenile
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>

                {selectedOrders.length > 0 && (
                  <div className='flex w-full flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/50 px-4 py-2'>
                    {(() => {
                      const selectedCount = selectedOrders.length
                      const isSingle = selectedCount === 1
                      const selectionLabel = isSingle
                        ? `${selectedOrders[0]?.takip_no ?? ''} Seçildi`
                        : `${selectedCount} sipariş seçildi`

                      return (
                        <>
                          <div className='flex flex-wrap items-center gap-2'>
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              className='h-8'
                              onClick={() => handleBulkAssign(selectedOrders)}
                            >
                              <UserPlus className='mr-2 size-4' />
                              {isSingle ? 'Ata' : 'Toplu Ata'}
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              className='h-8'
                              onClick={() => handleBulkPrint(selectedOrders)}
                            >
                              <Printer className='mr-2 size-4' />
                              {isSingle ? 'Etiket Yazdır' : 'Toplu Etiket Yazdır'}
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              className='h-8'
                              onClick={() => handleBulkCancel(selectedOrders)}
                            >
                              <Ban className='mr-2 size-4' />
                              {isSingle ? 'İptal' : 'Toplu İptal'}
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              className='h-8'
                              onClick={() => handleBulkInvoice(selectedOrders)}
                            >
                              <FileText className='mr-2 size-4' />
                              Faturalamaya gönder
                            </Button>
                          </div>
                          <div className='flex items-center gap-2'>
                            <p className='text-sm font-medium text-muted-foreground'>
                              {selectionLabel}
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
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}

            <DataTable
              data={data}
              columns={columns}
              enablePagination
              pagination={pagination}
              onPaginationChange={handlePaginationChange}
              pageCount={pageCount}
              manualPagination
              enableSorting
              sorting={sorting}
              onSortingChange={handleSortingChange}
              manualSorting
              enableGlobalFilter
              globalFilter={globalFilter}
              onGlobalFilterChange={setGlobalFilter}
              columnFilters={columnFilters}
              onColumnFiltersChange={handleColumnFiltersChange}
              manualFiltering
              enableColumnVisibility
              enableRowSelection
              enableMultiRowSelection
              getRowId={getOrderRowId}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              enableHorizontalScroll
              stickyFirstColumn
              stickyLeftColumnCount={2}
              stickyLastColumn
              isLoading={isLoading}
              className='[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600'
              emptyMessage='Gösterilecek sipariş bulunamadı.'
              onTableReady={handleTableReady}
            />

            {table && (
              <DataTablePagination
                table={table as TanStackTable<unknown>}
                pageSizeOptions={[5, 10, 20, 50]}
                totalRows={totalRows}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
