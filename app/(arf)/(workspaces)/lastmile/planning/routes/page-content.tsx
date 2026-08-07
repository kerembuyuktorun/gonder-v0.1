'use client'

import Link from 'next/link'
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
import { ARF_ROUTES } from '../../../../_shared/routes'
import {
  ChevronDown,
  ChevronUp,
  Filter,
  MapPinned,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { fetchPlanningRoutesList, fetchPlanningRoutesSummary, exportPlanningRoutes, downloadExportedFile } from './_api/routes-client'
import { createRouteColumns } from './_columns/routes-columns'
import { planningRouteTypeFilterOptions } from './_components/planning-route-type-badge'
import { RouteListTabs } from './_components/route-list-tabs'
import { routeStatusFilterOptions } from './_components/route-status-badge'
import { RoutesKpiCards } from './_components/routes-kpi-cards'
import { isRoutesDemoForced } from './_lib/routes-demo-mode'
import {
  buildRoutesKpi,
  countRoutesByDate,
  countRoutesByStatus,
} from './_lib/query-routes'
import { getPlanningRoutesListMock } from './_mock/routes-mock-data'
import type {
  PlanningRouteDateScope,
  PlanningRouteListItem,
  PlanningRouteStatusScope,
} from './_types/planning-route'

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater

const EMPTY_KPI = {
  todayActive: 0,
  plannedToday: 0,
  carryover: 0,
  future: 0,
  completedToday: 0,
  canceled: 0,
}

export default function PlanningRoutesPage() {
  const searchParams = useSearchParams()
  const forceDemo = isRoutesDemoForced(searchParams)
  const demoQuery = forceDemo ? '?demo=1' : ''

  const [table, setTable] = useState<TanStackTable<PlanningRouteListItem> | null>(null)
  const [allRoutes, setAllRoutes] = useState<PlanningRouteListItem[]>([])
  const [data, setData] = useState<PlanningRouteListItem[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showSearch, setShowSearch] = useState(false)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [showTabs, setShowTabs] = useState(false)
  const [statusScope, setStatusScope] = useState<PlanningRouteStatusScope>('all')
  const [dateScope, setDateScope] = useState<PlanningRouteDateScope>('all')
  const [globalFilter, setGlobalFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'operationDate', desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns = useMemo(() => createRouteColumns({ demoQuery }), [demoQuery])

  const kpi = useMemo(
    () => (allRoutes.length ? buildRoutesKpi(allRoutes) : EMPTY_KPI),
    [allRoutes]
  )
  const statusCounts = useMemo(() => countRoutesByStatus(allRoutes), [allRoutes])
  const dateCounts = useMemo(() => countRoutesByDate(allRoutes), [allRoutes])

  const courierFilterOptions = useMemo(() => {
    const names = Array.from(
      new Set(allRoutes.map((route) => route.courierName).filter(Boolean) as string[])
    ).sort((a, b) => a.localeCompare(b, 'tr'))

    return [
      { label: 'Atanmadı', value: 'Atanmadı' },
      ...names.map((value) => ({ label: value, value })),
    ]
  }, [allRoutes])

  const getRowId = useCallback((route: PlanningRouteListItem) => route.id, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setGlobalFilter(searchInput)
      setPagination((previous) => ({ ...previous, pageIndex: 0 }))
    }, 250)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    let cancelled = false

    async function loadSummary() {
      if (forceDemo) {
        if (cancelled) return
        setAllRoutes(getPlanningRoutesListMock())
        return
      }

      const result = await fetchPlanningRoutesSummary()
      if (cancelled) return
      if (result.success) {
        setAllRoutes(result.data.routes)
        return
      }
      toast.error(result.error || 'Rota özeti yüklenemedi.')
    }

    void loadSummary()
    return () => {
      cancelled = true
    }
  }, [forceDemo, refreshKey])

  useEffect(() => {
    let cancelled = false

    async function loadTable() {
      setIsLoading(true)

      if (forceDemo) {
        if (cancelled) return
        const mock = getPlanningRoutesListMock()
        const filtered = mock.filter((row) => {
          if (statusScope !== 'all' && row.status !== statusScope) return false
          if (dateScope !== 'all' && row.dateChip !== dateScope) return false
          if (globalFilter) {
            const q = globalFilter.toLocaleLowerCase('tr-TR')
            const haystack = [
              row.label,
              row.id,
              row.vehiclePlate,
              row.courierName ?? '',
              row.region,
            ]
              .join(' ')
              .toLocaleLowerCase('tr-TR')
            if (!haystack.includes(q)) return false
          }
          return true
        })
        const start = pagination.pageIndex * pagination.pageSize
        setData(filtered.slice(start, start + pagination.pageSize))
        setTotalRows(filtered.length)
        setIsLoading(false)
        return
      }

      const result = await fetchPlanningRoutesList({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        search: globalFilter,
        statusScope,
        dateScope,
        sorting,
        columnFilters,
      })

      if (cancelled) return

      if (!result.success) {
        toast.error(result.error || 'Rota listesi yüklenemedi.')
        setData([])
        setTotalRows(0)
        setIsLoading(false)
        return
      }

      if (result.data.routes.length === 0 && result.data.total > 0) {
        toast.warning('Rotalar alındı ancak tabloya dönüştürülemedi. BE yanıt formatını kontrol edin.')
      }

      setData(result.data.routes)
      setTotalRows(result.data.total)
      setIsLoading(false)
    }

    void loadTable()
    return () => {
      cancelled = true
    }
  }, [
    forceDemo,
    globalFilter,
    refreshKey,
    statusScope,
    dateScope,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    columnFilters,
  ])

  const handleTableReady = useCallback((instance: TanStackTable<PlanningRouteListItem>) => {
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

  const handleStatusScopeChange = (scope: PlanningRouteStatusScope) => {
    setStatusScope(scope)
    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
  }

  const handleDateScopeChange = (scope: PlanningRouteDateScope) => {
    setDateScope(scope)
    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
  }

  const handleManualRefresh = () => {
    setRefreshKey((previous) => previous + 1)
    toast.success('Rota listesi yenileniyor')
  }

  const handleServerExport = () => {
    if (forceDemo) {
      toast.message('Demo modunda sunucu dışa aktarım kullanılamaz.')
      return
    }

    setIsExporting(true)
    void (async () => {
      const result = await exportPlanningRoutes({
        search: globalFilter,
        statusScope,
        dateScope,
        sorting,
        columnFilters,
      })
      setIsExporting(false)
      if (!result.success) {
        toast.error(result.error || 'Dışa aktarım başarısız.')
        return
      }
      if (!result.data.base64) {
        toast.error('Dışa aktarım dosyası boş.')
        return
      }
      downloadExportedFile(result.data)
      toast.success(`${result.data.rowCount || 'Rota'} satır dışa aktarıldı`)
    })()
  }

  const pageCount = Math.max(1, Math.ceil(totalRows / pagination.pageSize))

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Planlama' },
          { label: 'Rotalar', href: ARF_ROUTES.lastmile.planning.routes },
          { label: 'Rota Listesi' },
        ]}
        searchPlaceholder='Lastmile ara...'
        searchShortcut={<>⌘K</>}
      />

      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <h1 className='text-2xl font-semibold tracking-tight'>Rota Listesi</h1>
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
            <Button size='sm' type='button' asChild>
              <Link href={ARF_ROUTES.lastmile.planning.orchestrator}>
                <MapPinned className='mr-2 size-4' />
                Planla
              </Link>
            </Button>
          </div>
        </div>

        {forceDemo ? (
          <div className='rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950'>
            <span className='font-medium'>Demo modu aktif</span>
            {' — '}
            Tablo mock veri gösteriyor (RT-4120 vb.). Canlı rotalar için URL&apos;den{' '}
            <code className='rounded bg-amber-100 px-1'>?demo=1</code> parametresini kaldırın.
          </div>
        ) : null}

        {showSummary && <RoutesKpiCards kpi={kpi} />}

        {showTabs && (
          <RouteListTabs
            statusScope={statusScope}
            dateScope={dateScope}
            statusCounts={statusCounts}
            dateCounts={dateCounts}
            onStatusScopeChange={handleStatusScopeChange}
            onDateScopeChange={handleDateScopeChange}
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
                    <div className='relative min-w-[280px] max-w-md flex-1'>
                      <Search className='absolute left-2.5 top-2.5 size-4 text-muted-foreground' />
                      <Input
                        autoFocus
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder='Rota kodu, plaka, kurye, müşteri veya bölge ara...'
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
                            column={table.getColumn('status')}
                            title='Durum'
                            options={routeStatusFilterOptions}
                          />
                          <DataTableFacetedFilter
                            column={table.getColumn('routeType')}
                            title='Rota Tipi'
                            options={planningRouteTypeFilterOptions}
                          />
                          <DataTableFacetedFilter
                            column={table.getColumn('courierName')}
                            title='Kurye'
                            options={courierFilterOptions}
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
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              className='h-8'
                              disabled={isExporting}
                              onClick={handleServerExport}
                            >
                              {isExporting ? 'Aktarılıyor…' : 'Sunucudan Dışa Aktar'}
                            </Button>
                            <DataTableExcelActions
                              table={table}
                              filename='rota-listesi'
                              exportSelected={false}
                              exportLabel='Tabloyu Dışa Aktar'
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
              getRowId={getRowId}
              enableColumnVisibility
              enableHorizontalScroll
              stickyFirstColumn
              stickyLeftColumnCount={1}
              stickyLastColumn
              isLoading={isLoading}
              className='[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600'
              emptyMessage='Gösterilecek rota bulunamadı.'
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
