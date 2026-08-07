'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type {
  ColumnFiltersState,
  PaginationState,
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
  ChevronDown,
  ChevronUp,
  Filter,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  createCustomer,
  fetchCustomerStats,
  fetchCustomersList,
  patchCustomerStatus,
  updateCustomer,
} from './_api/customers'
import {
  createCustomerColumns,
  customerSectorFilterOptions,
} from './_columns/customers-columns'
import {
  CreateCustomerModal,
  type CustomerCreateFormValues,
} from './_components/create-customer-modal'
import { CustomerListTabs } from './_components/customer-list-tabs'
import { CustomersKpiCards } from './_components/customers-kpi-cards'
import { buildCustomerWritePayload, sectorLabelToCode, toBackendStatus } from './_lib/map-customer'
import {
  countCustomersByStatusScope,
  queryCustomers,
} from './_lib/query-customers'
import {
  getCustomerListKpiMock,
  mockCustomerList,
} from './_mock/customers-mock-data'
import { isLastmileDemoForced } from '../_lib/lastmile-demo-mode'
import type {
  CustomerListKpi,
  CustomerStatusScope,
  LastmileCustomer,
} from './_types/customer'
import { toNationalPhoneDigits } from '../orders/new/_lib/phone'

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater

const EMPTY_KPI: CustomerListKpi = {
  todayActiveOrders: 0,
  avgDailyVolume: 0,
  avgTaskDurationMin: 0,
  avgSuccessRate: 0,
  totalFacilities: 0,
  totalOrders: 0,
  totalDelivered: 0,
  totalCanceled: 0,
}

export default function CustomersListPage() {
  const searchParams = useSearchParams()
  const forceDemo = isLastmileDemoForced(searchParams)
  const [table, setTable] = useState<TanStackTable<LastmileCustomer> | null>(null)
  const [data, setData] = useState<LastmileCustomer[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [statusCounts, setStatusCounts] = useState<Record<CustomerStatusScope, number>>({
    all: 0,
    aktif: 0,
    pasif: 0,
  })
  const [kpi, setKpi] = useState<CustomerListKpi>(EMPTY_KPI)
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showSearch, setShowSearch] = useState(false)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [statusScope, setStatusScope] = useState<CustomerStatusScope>('all')
  const [globalFilter, setGlobalFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'kayit_tarihi', desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [customerModalOpen, setCustomerModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<LastmileCustomer | null>(null)

  const sectorFilter = useMemo(() => {
    const filter = columnFilters.find((item) => item.id === 'sektor')
    const values = Array.isArray(filter?.value) ? (filter?.value as string[]) : []
    return values.map((label) => sectorLabelToCode(label))
  }, [columnFilters])

  const handleEdit = useCallback((customer: LastmileCustomer) => {
    setEditingCustomer(customer)
    setCustomerModalOpen(true)
  }, [])

  const handleCustomerSubmit = useCallback(
    async (values: CustomerCreateFormValues) => {
      const national = toNationalPhoneDigits(values.telefon)
      const payload = buildCustomerWritePayload({
        ...values,
        sektor: values.sektor || 'Diğer',
        phoneE164: national ? `+90${national}` : values.telefon.trim(),
      })

      const result = editingCustomer
        ? await updateCustomer(editingCustomer.id, payload)
        : await createCustomer(payload)

      if (!result.success) {
        if (result.code === 'TAX_NUMBER_EXISTS') {
          throw new Error('Bu VKN / T.C. kimlik numarası zaten kayıtlı')
        }
        throw new Error(result.error)
      }

      toast.success(
        editingCustomer
          ? `${result.data.musteri_kodu} güncellendi`
          : `${result.data.musteri_kodu} listeye eklendi`
      )
      setEditingCustomer(null)
      setPagination((previous) => ({ ...previous, pageIndex: 0 }))
      setRefreshKey((previous) => previous + 1)
    },
    [editingCustomer]
  )

  const handleToggleStatus = useCallback(async (customer: LastmileCustomer) => {
    const nextStatus = toBackendStatus(customer.durum === 'aktif' ? 'pasif' : 'aktif')
    const result = await patchCustomerStatus(customer.id, nextStatus)
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(
      nextStatus === 'Passive'
        ? `${result.data.musteri_kodu} pasife alındı`
        : `${result.data.musteri_kodu} aktifleştirildi`
    )
    setRefreshKey((previous) => previous + 1)
  }, [])

  const columns = useMemo(
    () =>
      createCustomerColumns({
        onEdit: handleEdit,
        onToggleStatus: handleToggleStatus,
        demo: forceDemo,
      }),
    [handleEdit, handleToggleStatus, forceDemo]
  )

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setGlobalFilter(searchInput)
      setPagination((previous) => ({ ...previous, pageIndex: 0 }))
    }, 250)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)

      if (forceDemo) {
        if (cancelled) return
        const result = queryCustomers({
          rows: mockCustomerList,
          statusScope,
          pagination,
          sorting,
          columnFilters,
          globalFilter,
        })
        setData(result.rows)
        setTotalRows(result.totalRows)
        setStatusCounts(countCustomersByStatusScope(mockCustomerList))
        setKpi(getCustomerListKpiMock())
        setIsLoading(false)
        return
      }

      const sort = sorting[0]
      const result = await fetchCustomersList({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        search: globalFilter,
        statusScope,
        sector: sectorFilter,
        sortBy: sort?.id,
        sortDir: sort?.desc === false ? 'asc' : 'desc',
      })

      if (cancelled) return

      if (!result.success) {
        toast.error(result.error)
        setData([])
        setTotalRows(0)
        setIsLoading(false)
        return
      }

      setData(result.data.items)
      setTotalRows(result.data.total)
      setStatusCounts(result.data.statusCounts)
      setIsLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [
    columnFilters,
    forceDemo,
    globalFilter,
    pagination,
    refreshKey,
    sectorFilter,
    sorting,
    statusScope,
  ])

  useEffect(() => {
    if (forceDemo) return
    let cancelled = false

    async function loadStats() {
      const result = await fetchCustomerStats()
      if (cancelled) return
      if (result.success) setKpi(result.data)
    }

    void loadStats()
    return () => {
      cancelled = true
    }
  }, [forceDemo, refreshKey])

  const handleTableReady = useCallback((instance: TanStackTable<LastmileCustomer>) => {
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

  const handleStatusScopeChange = (scope: CustomerStatusScope) => {
    setStatusScope(scope)
    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
  }

  const handleManualRefresh = () => {
    setRefreshKey((previous) => previous + 1)
    toast.success('Müşteri listesi yenileniyor')
  }

  const pageCount = Math.max(1, Math.ceil(totalRows / pagination.pageSize))

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Müşteriler', href: ARF_ROUTES.lastmile.customers.list },
          { label: 'Müşteri Listesi' },
        ]}
        searchPlaceholder='Lastmile ara...'
        searchShortcut={<>⌘K</>}
      />

      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex min-w-0 items-center gap-3'>
            <h1 className='truncate text-2xl font-semibold tracking-tight'>
              {forceDemo ? 'Müşteri Listesi (Demo)' : 'Müşteri Listesi'}
            </h1>
            {forceDemo ? (
              <Badge className='bg-amber-100 text-amber-900 hover:bg-amber-100'>Demo veri</Badge>
            ) : null}
          </div>
          <div className='flex shrink-0 flex-wrap items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 rounded-full'
              onClick={() => setShowSummary((previous) => !previous)}
            >
              {showSummary ? (
                <ChevronUp className='mr-2 size-4' />
              ) : (
                <ChevronDown className='mr-2 size-4' />
              )}
              {showSummary ? 'Özeti Gizle' : 'Özeti Göster'}
            </Button>
            <Button
              size='sm'
              type='button'
              onClick={() => {
                setEditingCustomer(null)
                setCustomerModalOpen(true)
              }}
            >
              <Plus className='mr-2 size-4' />
              Müşteri Ekle
            </Button>
          </div>
        </div>

        {showSummary && <CustomersKpiCards kpi={kpi} />}

        <CreateCustomerModal
          open={customerModalOpen}
          onOpenChange={(open) => {
            setCustomerModalOpen(open)
            if (!open) setEditingCustomer(null)
          }}
          mode={editingCustomer ? 'edit' : 'create'}
          initialCustomer={editingCustomer}
          onSubmit={handleCustomerSubmit}
        />

        <Card>
          <CardContent className='space-y-4 px-6'>
            {table && (
              <div className='w-fit max-w-full space-y-4'>
                <div className='flex flex-wrap items-center justify-start gap-2'>
                  <CustomerListTabs
                    statusScope={statusScope}
                    counts={statusCounts}
                    onStatusScopeChange={handleStatusScopeChange}
                  />

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
                    <div className='relative min-w-[280px] max-w-md flex-1'>
                      <Search className='absolute left-2.5 top-2.5 size-4 text-muted-foreground' />
                      <Input
                        autoFocus
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder='Ünvan, müşteri kodu, VKN veya yetkili ara...'
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
                            column={table.getColumn('sektor')}
                            title='Sektör'
                            options={customerSectorFilterOptions}
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
                              filename='musteri-listesi'
                              exportSelected={false}
                              exportLabel='Dışarı Aktar'
                            />
                          </div>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            className='h-8'
                            onClick={handleManualRefresh}
                          >
                            <RefreshCw className='mr-2 size-4' />
                            Yenile
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>

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
              enableHorizontalScroll
              stickyFirstColumn
              stickyLeftColumnCount={1}
              stickyLastColumn
              isLoading={isLoading}
              className='[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600'
              emptyMessage='Gösterilecek müşteri bulunamadı.'
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
