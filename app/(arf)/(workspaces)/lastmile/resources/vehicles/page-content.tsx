'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  activateVehicle,
  createVehicle as createVehicleApi,
  fetchVehicleDetail,
  fetchVehicleStats,
  fetchVehiclesList,
  passiveVehicle,
  updateVehicle,
  updateVehicleAssignment,
} from './_api/vehicles'
import { useVehicleModalResources } from './_hooks/use-vehicle-modal-resources'
import { useVehiclePermissions } from './_hooks/use-vehicle-permissions'
import { getCourierAssignmentConflict } from '../_lib/assignment-validation'
import {
  createVehicleColumns,
  vehicleOwnershipFilterOptions,
} from './_columns/vehicles-columns'
import {
  CreateVehicleModal,
  type VehicleCreateFormValues,
} from './_components/create-vehicle-modal'
import { VehicleListTabs } from './_components/vehicle-list-tabs'
import { vehicleClassFilterOptions } from './_components/vehicle-type-label'
import { VehiclesKpiCards } from './_components/vehicles-kpi-cards'
import { vehicleToFormValuesWithScopes } from './_lib/map-vehicle'
import { isLastmileDemoForced } from '../../_lib/lastmile-demo-mode'
import {
  VEHICLES_MOCK,
  computeStatusCounts,
  computeVehicleKpi,
} from './_mock/vehicles-mock-data'
import type {
  LastmileVehicle,
  VehicleListKpi,
  VehicleOwnership,
  VehicleStatusScope,
} from './_types/vehicle'

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater

const EMPTY_KPI: VehicleListKpi = {
  total: 0,
  onRoad: 0,
  idle: 0,
  passive: 0,
  criticalOccupancy: 0,
  docWarnings: 0,
}

const EMPTY_STATUS_COUNTS: Record<VehicleStatusScope, number> = {
  all: 0,
  yolda: 0,
  bos_ta: 0,
  pasif: 0,
}

export default function VehiclesListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const forceDemo = isLastmileDemoForced(searchParams)
  const [table, setTable] = useState<TanStackTable<LastmileVehicle> | null>(null)
  const [data, setData] = useState<LastmileVehicle[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showSearch, setShowSearch] = useState(false)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [statusScope, setStatusScope] = useState<VehicleStatusScope>('all')
  const [globalFilter, setGlobalFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'plaka', desc: false }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<LastmileVehicle | null>(null)
  const [editFormValues, setEditFormValues] = useState<VehicleCreateFormValues | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const { courierOptions, skillOptions, isSkillCatalogLoading, skillLabelMap } =
    useVehicleModalResources()
  const [kpi, setKpi] = useState<VehicleListKpi>(EMPTY_KPI)
  const [statusCounts, setStatusCounts] =
    useState<Record<VehicleStatusScope, number>>(EMPTY_STATUS_COUNTS)

  const permissions = useVehiclePermissions()

  const ownershipFilter = useMemo(() => {
    const filter = columnFilters.find((item) => item.id === 'mulkiyet')
    return Array.isArray(filter?.value) ? (filter?.value as VehicleOwnership[]) : []
  }, [columnFilters])

  const bodyTypeFilter = useMemo(() => {
    const filter = columnFilters.find((item) => item.id === 'arac_tipi')
    return Array.isArray(filter?.value) ? (filter?.value as string[]) : []
  }, [columnFilters])

  const loadStats = useCallback(async () => {
    if (forceDemo) {
      setKpi(computeVehicleKpi(VEHICLES_MOCK))
      setStatusCounts(computeStatusCounts(VEHICLES_MOCK))
      return
    }
    const result = await fetchVehicleStats()
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setKpi(result.data.kpi)
    setStatusCounts(result.data.statusCounts)
  }, [forceDemo])

  const handleLiveTrack = useCallback(
    (vehicle: LastmileVehicle) => {
      router.push(ARF_ROUTES.lastmile.resources.vehicles.detail(vehicle.id))
      toast.message(`${vehicle.plaka} canlı izleme açılıyor`)
    },
    [router]
  )

  const handleEdit = useCallback(async (vehicle: LastmileVehicle) => {
    if (!permissions.canUpdate) {
      toast.error('Araç düzenleme yetkiniz yok.')
      return
    }

    setEditingVehicle(vehicle)
    setEditFormValues(null)
    setVehicleModalOpen(true)
    setIsDetailLoading(true)

    const result = await fetchVehicleDetail(vehicle.id)
    setIsDetailLoading(false)

    if (!result.success) {
      toast.error(result.error)
      setVehicleModalOpen(false)
      setEditingVehicle(null)
      return
    }

    setEditFormValues(
      vehicleToFormValuesWithScopes(result.data.vehicle, result.data.operationScopes)
    )
  }, [permissions.canUpdate])

  const handleVehicleSubmit = useCallback(
    async (values: VehicleCreateFormValues) => {
      const documentIds = values.evraklar.map((doc) => doc.id)

      if (editingVehicle) {
        const result = await updateVehicle(editingVehicle.id, values, documentIds)
        if (!result.success) {
          throw new Error(result.error)
        }
        toast.success(`${result.data.plaka} güncellendi`)
      } else {
        const result = await createVehicleApi(values, documentIds)
        if (!result.success) {
          throw new Error(result.error)
        }
        toast.success(`${result.data.plaka} listeye eklendi`)
      }

      setEditingVehicle(null)
      setEditFormValues(null)
      setPagination((previous) => ({ ...previous, pageIndex: 0 }))
      setRefreshKey((previous) => previous + 1)
      await loadStats()
    },
    [editingVehicle, loadStats]
  )

  const handleCourierAssign = useCallback(
    async (vehicle: LastmileVehicle, courierId: string | null) => {
      if (!permissions.canChangeDriver) {
        toast.error('Sürücü değiştirme yetkiniz yok.')
        return
      }

      if (courierId) {
        const courier = courierOptions.find((item) => item.id === courierId)
        if (courier) {
          const conflict = getCourierAssignmentConflict(courier, vehicle.id)
          if (conflict) {
            toast.error(conflict)
            return
          }
        }
      }

      const result = await updateVehicleAssignment(vehicle.id, courierId)
      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success(
        courierId
          ? `${result.data.plaka} zimmeti güncellendi`
          : `${result.data.plaka} zimmeti kaldırıldı`
      )
      setRefreshKey((previous) => previous + 1)
      await loadStats()
    },
    [courierOptions, loadStats, permissions.canChangeDriver]
  )

  const handleToggleStatus = useCallback(
    async (vehicle: LastmileVehicle) => {
      const isPassive = vehicle.durum === 'pasif'
      if (isPassive ? !permissions.canActivate : !permissions.canPassive) {
        toast.error('Araç durumu değiştirme yetkiniz yok.')
        return
      }

      const result =
        vehicle.durum === 'pasif'
          ? await activateVehicle(vehicle.id)
          : await passiveVehicle(vehicle.id)

      if (!result.success) {
        toast.error(
          result.code === 'ACTIVE_ROUTE_EXISTS'
            ? 'Zimmetli sürücü varken araç pasife alınamaz.'
            : result.error
        )
        return
      }

      toast.success(
        vehicle.durum === 'pasif'
          ? `${result.data.plaka} aktif edildi`
          : `${result.data.plaka} pasife alındı`
      )
      setRefreshKey((previous) => previous + 1)
      await loadStats()
    },
    [loadStats, permissions.canActivate, permissions.canPassive]
  )

  const columns = useMemo(
    () =>
      createVehicleColumns({
        onLiveTrack: handleLiveTrack,
        onEdit: handleEdit,
        onCourierAssign: handleCourierAssign,
        onToggleStatus: handleToggleStatus,
        courierOptions,
        skillLabels: skillLabelMap,
        demo: forceDemo,
        permissions: {
          canUpdate: permissions.canUpdate,
          canActivate: permissions.canActivate,
          canPassive: permissions.canPassive,
          canChangeDriver: permissions.canChangeDriver,
        },
      }),
    [
      courierOptions,
      forceDemo,
      handleCourierAssign,
      handleEdit,
      handleLiveTrack,
      handleToggleStatus,
      permissions.canChangeDriver,
      permissions.canActivate,
      permissions.canPassive,
      permissions.canUpdate,
      skillLabelMap,
    ]
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
      const sort = sorting[0]

      if (forceDemo) {
        if (cancelled) return
        let rows = [...VEHICLES_MOCK]
        if (statusScope !== 'all') {
          rows = rows.filter((v) => v.durum === statusScope)
        }
        if (ownershipFilter.length > 0) {
          rows = rows.filter((v) => ownershipFilter.includes(v.mulkiyet))
        }
        if (bodyTypeFilter.length > 0) {
          rows = rows.filter((v) => bodyTypeFilter.includes(v.arac_tipi))
        }
        const needle = globalFilter.trim().toLocaleLowerCase('tr-TR')
        if (needle) {
          rows = rows.filter((v) => {
            const hay = [v.plaka, v.marka, v.model, v.zimmetli_surucu, v.hizmet_bolgesi]
              .filter(Boolean)
              .join(' ')
              .toLocaleLowerCase('tr-TR')
            return hay.includes(needle)
          })
        }
        if (sort?.id === 'plaka') {
          rows.sort((a, b) =>
            sort.desc
              ? b.plaka.localeCompare(a.plaka, 'tr')
              : a.plaka.localeCompare(b.plaka, 'tr')
          )
        }
        const start = pagination.pageIndex * pagination.pageSize
        setData(rows.slice(start, start + pagination.pageSize))
        setTotalRows(rows.length)
        await loadStats()
        setIsLoading(false)
        return
      }

      const [listResult] = await Promise.all([
        fetchVehiclesList({
          page: pagination.pageIndex + 1,
          pageSize: pagination.pageSize,
          search: globalFilter,
          statusScope,
          ownership: ownershipFilter,
          vehicleClass: bodyTypeFilter,
          sortBy: sort?.id,
          sortDir: sort?.desc ? 'desc' : 'asc',
        }),
        refreshKey === 0 ? loadStats() : Promise.resolve(),
      ])

      if (cancelled) return

      if (!listResult.success) {
        toast.error(listResult.error)
        setData([])
        setTotalRows(0)
        setIsLoading(false)
        return
      }

      setData(listResult.data.items)
      setTotalRows(listResult.data.total)
      setIsLoading(false)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [
    bodyTypeFilter,
    forceDemo,
    globalFilter,
    loadStats,
    ownershipFilter,
    pagination.pageIndex,
    pagination.pageSize,
    refreshKey,
    sorting,
    statusScope,
  ])

  useEffect(() => {
    if (refreshKey === 0) return
    void loadStats()
  }, [loadStats, refreshKey])

  const handleTableReady = useCallback((instance: TanStackTable<LastmileVehicle>) => {
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

  const handleStatusScopeChange = (scope: VehicleStatusScope) => {
    setStatusScope(scope)
    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
  }

  const handleManualRefresh = () => {
    setRefreshKey((previous) => previous + 1)
    toast.success('Araç listesi yenilendi')
  }

  const pageCount = Math.max(1, Math.ceil(totalRows / pagination.pageSize))

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Kaynaklar', href: ARF_ROUTES.lastmile.resources.vehicles.list },
          { label: 'Araç Listesi' },
        ]}
        searchPlaceholder='Lastmile ara...'
        searchShortcut={<>⌘K</>}
      />

      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex min-w-0 items-center gap-3'>
            <h1 className='truncate text-2xl font-semibold tracking-tight'>
              {forceDemo ? 'Araç Listesi (Demo)' : 'Araç Listesi'}
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
              disabled={!permissions.canCreate}
              onClick={() => {
                setEditingVehicle(null)
                setEditFormValues(null)
                setVehicleModalOpen(true)
              }}
            >
              <Plus className='mr-2 size-4' />
              Araç Ekle
            </Button>
          </div>
        </div>

        {showSummary && <VehiclesKpiCards kpi={kpi} />}

        <CreateVehicleModal
          open={vehicleModalOpen}
          onOpenChange={(open) => {
            setVehicleModalOpen(open)
            if (!open) {
              setEditingVehicle(null)
              setEditFormValues(null)
            }
          }}
          mode={editingVehicle ? 'edit' : 'create'}
          initialVehicle={editingVehicle}
          initialFormValues={editFormValues}
          isDetailLoading={isDetailLoading}
          courierOptions={courierOptions}
          skillOptions={skillOptions}
          isSkillCatalogLoading={isSkillCatalogLoading}
          onSubmit={handleVehicleSubmit}
        />

        <Card>
          <CardContent className='space-y-4 px-6'>
            {table && (
              <div className='w-fit max-w-full space-y-4'>
                <div className='flex flex-wrap items-center justify-start gap-2'>
                  <VehicleListTabs
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
                        placeholder='Plaka, marka, sürücü veya bölge ara...'
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
                            column={table.getColumn('arac_tipi')}
                            title='Araç Tipi'
                            options={vehicleClassFilterOptions}
                          />
                          <DataTableFacetedFilter
                            column={table.getColumn('mulkiyet')}
                            title='Mülkiyet'
                            options={vehicleOwnershipFilterOptions}
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
                              filename='arac-listesi'
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
              emptyMessage='Gösterilecek araç bulunamadı.'
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
