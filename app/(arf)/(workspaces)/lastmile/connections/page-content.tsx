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
import { Filter, RefreshCw, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { fetchConnectionsList } from './_api/connections'
import {
  addressTitleFilterOptions,
  createConnectionColumns,
} from './_columns/connections-columns'
import { ConnectionListTabs } from './_components/connection-list-tabs'
import { contactTypeFilterOptions } from './_components/contact-type-badge'
import {
  countConnectionsByTypeScope,
  mockConnectionList,
} from './_mock/connections-mock-data'
import { isLastmileDemoForced } from '../_lib/lastmile-demo-mode'
import type { ConnectionTypeScope, LastmileConnection } from './_types/connection'

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater

const EMPTY_TYPE_COUNTS: Record<ConnectionTypeScope, number> = {
  all: 0,
  bireysel: 0,
  kurumsal: 0,
}

export default function ConnectionsListPage() {
  const searchParams = useSearchParams()
  const forceDemo = isLastmileDemoForced(searchParams)
  const [table, setTable] = useState<TanStackTable<LastmileConnection> | null>(null)
  const [data, setData] = useState<LastmileConnection[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [typeCounts, setTypeCounts] = useState(EMPTY_TYPE_COUNTS)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showSearch, setShowSearch] = useState(false)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)
  const [typeScope, setTypeScope] = useState<ConnectionTypeScope>('all')
  const [globalFilter, setGlobalFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'kayit_tarihi', desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const addressTitles = useMemo(() => {
    const filter = columnFilters.find((item) => item.id === 'adres_baslik')
    return Array.isArray(filter?.value) ? (filter?.value as string[]) : []
  }, [columnFilters])

  /** Sekme öncelikli; Tümü iken faceted Bağlantı Tipi tek seçimde API’ye gider */
  const effectiveTypeScope = useMemo((): ConnectionTypeScope => {
    if (typeScope !== 'all') return typeScope
    const filter = columnFilters.find((item) => item.id === 'muhatap_tipi')
    const values = Array.isArray(filter?.value) ? (filter?.value as string[]) : []
    if (values.length === 1 && (values[0] === 'bireysel' || values[0] === 'kurumsal')) {
      return values[0]
    }
    return 'all'
  }, [columnFilters, typeScope])

  const columns = useMemo(() => createConnectionColumns(), [])

  const handleTableReady = useCallback((instance: TanStackTable<LastmileConnection>) => {
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
        let rows = [...mockConnectionList]
        if (effectiveTypeScope !== 'all') {
          rows = rows.filter((r) => r.muhatap_tipi === effectiveTypeScope)
        }
        if (addressTitles.length > 0) {
          rows = rows.filter((r) => addressTitles.includes(r.adres_baslik))
        }
        const needle = globalFilter.trim().toLocaleLowerCase('tr-TR')
        if (needle) {
          rows = rows.filter((r) => {
            const hay = [
              r.musteri_adi,
              r.muhatabi,
              r.firma_adi,
              r.telefon,
              r.full_address,
              r.musteri_kodu,
            ]
              .filter(Boolean)
              .join(' ')
              .toLocaleLowerCase('tr-TR')
            return hay.includes(needle)
          })
        }
        const sort = sorting[0]
        if (sort?.id === 'kayit_tarihi') {
          rows.sort((a, b) =>
            sort.desc
              ? b.kayit_tarihi.localeCompare(a.kayit_tarihi, 'tr')
              : a.kayit_tarihi.localeCompare(b.kayit_tarihi, 'tr')
          )
        }
        const start = pagination.pageIndex * pagination.pageSize
        setData(rows.slice(start, start + pagination.pageSize))
        setTotalRows(rows.length)
        setTypeCounts(countConnectionsByTypeScope(mockConnectionList))
        setIsLoading(false)
        return
      }

      const sort = sorting[0]
      const result = await fetchConnectionsList({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        search: globalFilter,
        typeScope: effectiveTypeScope,
        addressTitles,
        sortBy: sort?.id,
        sortDir: sort?.desc === false ? 'asc' : 'desc',
      })

      if (cancelled) return

      if (!result.success) {
        setData([])
        setTotalRows(0)
        setTypeCounts(EMPTY_TYPE_COUNTS)
        toast.error(result.error || 'Bağlantı listesi alınamadı.')
        setIsLoading(false)
        return
      }

      setData(result.data.items)
      setTotalRows(result.data.total)
      setTypeCounts(result.data.typeCounts)
      setIsLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [
    addressTitles,
    effectiveTypeScope,
    forceDemo,
    globalFilter,
    pagination.pageIndex,
    pagination.pageSize,
    refreshKey,
    sorting,
  ])

  const handleTypeScopeChange = (scope: ConnectionTypeScope) => {
    setTypeScope(scope)
    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
  }

  const handleManualRefresh = () => {
    setRefreshKey((previous) => previous + 1)
    toast.success('Bağlantı listesi yenileniyor')
  }

  const pageCount = Math.max(1, Math.ceil(totalRows / pagination.pageSize))

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Bağlantı Listesi' },
        ]}
        searchPlaceholder='Lastmile ara...'
        searchShortcut={<>⌘K</>}
      />

      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div className='flex flex-wrap items-center gap-3'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {forceDemo ? 'Bağlantı Listesi (Demo)' : 'Bağlantı Listesi'}
          </h1>
          {forceDemo ? (
            <Badge className='bg-amber-100 text-amber-900 hover:bg-amber-100'>Demo veri</Badge>
          ) : null}
        </div>

        <Card>
          <CardContent className='space-y-4 px-6'>
            {table && (
              <div className='w-fit max-w-full space-y-4'>
                <div className='flex flex-wrap items-center justify-start gap-2'>
                  <ConnectionListTabs
                    typeScope={typeScope}
                    counts={typeCounts}
                    onTypeScopeChange={handleTypeScopeChange}
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
                        placeholder='Muhatap, firma, TCKN/VKN, telefon veya adres ara...'
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
                            column={table.getColumn('muhatap_tipi')}
                            title='Bağlantı Tipi'
                            options={contactTypeFilterOptions}
                          />
                          <DataTableFacetedFilter
                            column={table.getColumn('adres_baslik')}
                            title='Adres Başlığı'
                            options={addressTitleFilterOptions}
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
                              filename='baglanti-listesi'
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
              isLoading={isLoading}
              className='[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600'
              emptyMessage='Kayıtlı bağlantı bulunamadı.'
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
