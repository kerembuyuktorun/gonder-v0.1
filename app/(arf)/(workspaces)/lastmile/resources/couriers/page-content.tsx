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
  activateDriver,
  createDriver,
  fetchDriverDetail,
  fetchDriverStats,
  fetchDriversList,
  passiveDriver,
  sendDriverPasswordReset,
  updateDriver,
  updateDriverAssignment,
} from './_api/drivers'
import {
  courierEmploymentFilterOptions,
  createCourierColumns,
} from './_columns/couriers-columns'
import {
  CreateCourierModal,
  courierToFormValues,
  type CourierCreateFormValues,
} from './_components/create-courier-modal'
import { CourierListTabs } from './_components/courier-list-tabs'
import { CouriersKpiCards } from './_components/couriers-kpi-cards'
import { useCourierModalResources } from './_hooks/use-courier-modal-resources'
import { useCourierPermissions } from './_hooks/use-courier-permissions'
import { getVehicleAssignmentConflict } from '../_lib/assignment-validation'
import { isLastmileDemoForced } from '../../_lib/lastmile-demo-mode'
import {
  getCourierListKpiMock,
  mockCourierList,
} from './_mock/couriers-mock-data'
import type {
  CourierEmploymentType,
  CourierListKpi,
  CourierStatusScope,
  LastmileCourier,
} from './_types/courier'

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater

const EMPTY_KPI: CourierListKpi = {
  total: 0,
  onRoad: 0,
  idle: 0,
  passive: 0,
  unassigned: 0,
  docWarnings: 0,
}

const EMPTY_STATUS_COUNTS: Record<CourierStatusScope, number> = {
  all: 0,
  yolda: 0,
  bos_ta: 0,
  pasif: 0,
}

export default function CouriersListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const forceDemo = isLastmileDemoForced(searchParams)
  const { vehicleOptions, skillOptions, isSkillCatalogLoading, skillLabelMap } =
    useCourierModalResources()
  const permissions = useCourierPermissions()
  const [table, setTable] = useState<TanStackTable<LastmileCourier> | null>(null)
  const [data, setData] = useState<LastmileCourier[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showSearch, setShowSearch] = useState(false)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [statusScope, setStatusScope] = useState<CourierStatusScope>('all')
  const [globalFilter, setGlobalFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'ad_soyad', desc: false }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [courierModalOpen, setCourierModalOpen] = useState(false)
  const [editingCourier, setEditingCourier] = useState<LastmileCourier | null>(null)
  const [editFormValues, setEditFormValues] = useState<CourierCreateFormValues | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [kpi, setKpi] = useState<CourierListKpi>(EMPTY_KPI)
  const [statusCounts, setStatusCounts] =
    useState<Record<CourierStatusScope, number>>(EMPTY_STATUS_COUNTS)

  const employmentFilter = useMemo(() => {
    const filter = columnFilters.find((item) => item.id === 'istihdam')
    return Array.isArray(filter?.value) ? (filter?.value as CourierEmploymentType[]) : []
  }, [columnFilters])

  const loadStats = useCallback(async () => {
    if (forceDemo) {
      const kpiData = getCourierListKpiMock()
      setKpi(kpiData)
      setStatusCounts({
        all: kpiData.total,
        yolda: kpiData.onRoad,
        bos_ta: kpiData.idle,
        pasif: kpiData.passive,
      })
      return
    }
    const result = await fetchDriverStats()
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setKpi(result.data.kpi)
    setStatusCounts(result.data.statusCounts)
  }, [forceDemo])

  const handleLiveTrack = useCallback(
    (courier: LastmileCourier) => {
      const params = new URLSearchParams({ courier: courier.id })
      router.push(`${ARF_ROUTES.lastmile.dashboard.live}?${params.toString()}`)
      toast.message(`${courier.ad_soyad} canlı izleme açılıyor`)
    },
    [router]
  )

  const handleEdit = useCallback(
    async (courier: LastmileCourier) => {
      if (!permissions.canUpdate) {
        toast.error('Kurye düzenleme yetkiniz yok.')
        return
      }

      setEditingCourier(courier)
      setEditFormValues(null)
      setCourierModalOpen(true)
      setIsDetailLoading(true)

      const result = await fetchDriverDetail(courier.id)
      setIsDetailLoading(false)

      if (!result.success) {
        toast.error(result.error)
        setCourierModalOpen(false)
        setEditingCourier(null)
        return
      }

      setEditingCourier(result.data)
      setEditFormValues(courierToFormValues(result.data))
    },
    [permissions.canUpdate]
  )

  const handleCourierSubmit = useCallback(
    async (values: CourierCreateFormValues) => {
      const documentIds = values.evraklar.map((doc) => doc.id)

      if (editingCourier) {
        const result = await updateDriver(editingCourier.id, values, documentIds)
        if (!result.success) {
          throw new Error(
            result.code === 'PHONE_ALREADY_EXISTS' || result.code === 'EMAIL_ALREADY_EXISTS'
              ? result.error
              : result.error
          )
        }
        toast.success(`${result.data.ad_soyad} güncellendi`)
      } else {
        const result = await createDriver(values, documentIds)
        if (!result.success) {
          throw new Error(result.error)
        }
        toast.success(`${result.data.ad_soyad} listeye eklendi`)
      }

      setEditingCourier(null)
      setEditFormValues(null)
      setPagination((previous) => ({ ...previous, pageIndex: 0 }))
      setRefreshKey((previous) => previous + 1)
      await loadStats()
    },
    [editingCourier, loadStats]
  )

  const handleVehicleAssign = useCallback(
    async (courier: LastmileCourier, vehicleId: string | null) => {
      if (!permissions.canChangeVehicle) {
        toast.error('Araç zimmeti değiştirme yetkiniz yok.')
        return
      }

      if (vehicleId) {
        const assignedVehicle = vehicleOptions.find((item) => item.id === vehicleId)
        if (assignedVehicle) {
          const conflict = getVehicleAssignmentConflict(
            {
              plaka: assignedVehicle.plaka,
              assignedCourierId: assignedVehicle.assignedCourierId,
              assignedCourierName: assignedVehicle.assignedCourierName,
            },
            courier.id
          )
          if (conflict) {
            toast.error(conflict)
            return
          }
        }
      }

      const result = await updateDriverAssignment(courier.id, vehicleId)
      if (!result.success) {
        toast.error(
          result.code === 'DRIVER_ALREADY_ASSIGNED' ||
            result.code === 'VEHICLE_ALREADY_ASSIGNED' ||
            result.code === 'ACTIVE_ROUTE_EXISTS'
            ? result.error
            : result.error
        )
        return
      }

      toast.success(
        vehicleId
          ? `${result.data.ad_soyad} için ${result.data.zimmetli_arac_plaka ?? 'araç'} atandı`
          : `${result.data.ad_soyad} zimmeti kaldırıldı`
      )
      setRefreshKey((previous) => previous + 1)
      await loadStats()
    },
    [loadStats, permissions.canChangeVehicle, vehicleOptions]
  )

  const handleToggleStatus = useCallback(
    async (courier: LastmileCourier) => {
      const isPassive = courier.durum === 'pasif'
      if (isPassive ? !permissions.canActivate : !permissions.canPassive) {
        toast.error('Kurye durumu değiştirme yetkiniz yok.')
        return
      }

      const result =
        courier.durum === 'pasif'
          ? await activateDriver(courier.id)
          : await passiveDriver(courier.id)

      if (!result.success) {
        toast.error(
          result.code === 'ACTIVE_ROUTE_EXISTS'
            ? 'Aktif rota varken kurye pasife alınamaz.'
            : result.error
        )
        return
      }

      toast.success(
        courier.durum === 'pasif'
          ? `${result.data.ad_soyad} aktif edildi`
          : `${result.data.ad_soyad} pasife alındı`
      )
      setRefreshKey((previous) => previous + 1)
      await loadStats()
    },
    [loadStats, permissions.canActivate, permissions.canPassive]
  )

  const handleSendPasswordReset = useCallback(
    async (courier: LastmileCourier) => {
      if (!permissions.canUpdate) {
        toast.error('Bu işlem için yetkiniz yok.')
        return
      }
      if (!courier.eposta) {
        toast.error('Kurye için tanımlı bir e-posta adresi yok.')
        return
      }

      const result = await sendDriverPasswordReset(courier.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success(`Şifre sıfırlama bağlantısı ${courier.eposta} adresine gönderildi`)
    },
    [permissions.canUpdate]
  )

  const columns = useMemo(
    () =>
      createCourierColumns({
        onEdit: handleEdit,
        onToggleStatus: handleToggleStatus,
        onLiveTrack: handleLiveTrack,
        onSendPasswordReset: handleSendPasswordReset,
        onVehicleAssign: handleVehicleAssign,
        vehicleOptions,
        skillLabelMap,
        permissions: {
          canUpdate: permissions.canUpdate,
          canActivate: permissions.canActivate,
          canPassive: permissions.canPassive,
          canChangeVehicle: permissions.canChangeVehicle,
        },
        demo: forceDemo,
      }),
    [
      handleEdit,
      handleLiveTrack,
      handleSendPasswordReset,
      handleToggleStatus,
      handleVehicleAssign,
      permissions.canChangeVehicle,
      permissions.canActivate,
      permissions.canPassive,
      permissions.canUpdate,
      skillLabelMap,
      vehicleOptions,
      forceDemo,
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
        let rows = [...mockCourierList]
        if (statusScope !== 'all') {
          rows = rows.filter((c) => c.durum === statusScope)
        }
        if (employmentFilter.length > 0) {
          rows = rows.filter((c) => employmentFilter.includes(c.istihdam))
        }
        const needle = globalFilter.trim().toLocaleLowerCase('tr-TR')
        if (needle) {
          rows = rows.filter((c) => {
            const hay = [c.ad_soyad, c.telefon, c.eposta, c.zimmetli_arac_plaka]
              .filter(Boolean)
              .join(' ')
              .toLocaleLowerCase('tr-TR')
            return hay.includes(needle)
          })
        }
        if (sort?.id === 'ad_soyad') {
          rows.sort((a, b) =>
            sort.desc
              ? b.ad_soyad.localeCompare(a.ad_soyad, 'tr')
              : a.ad_soyad.localeCompare(b.ad_soyad, 'tr')
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
        fetchDriversList({
          page: pagination.pageIndex + 1,
          pageSize: pagination.pageSize,
          search: globalFilter,
          statusScope,
          employment: employmentFilter,
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
    employmentFilter,
    forceDemo,
    globalFilter,
    loadStats,
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

  const handleTableReady = useCallback((instance: TanStackTable<LastmileCourier>) => {
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

  const handleStatusScopeChange = (scope: CourierStatusScope) => {
    setStatusScope(scope)
    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
  }

  const handleManualRefresh = () => {
    setRefreshKey((previous) => previous + 1)
    toast.success('Kurye listesi yenilendi')
  }

  const pageCount = Math.max(1, Math.ceil(totalRows / pagination.pageSize))

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Kaynaklar', href: ARF_ROUTES.lastmile.resources.couriers.list },
          { label: 'Kurye Listesi' },
        ]}
        searchPlaceholder='Lastmile ara...'
        searchShortcut={<>⌘K</>}
      />

      <div className='flex flex-1 flex-col gap-6 p-6'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <h1 className='text-2xl font-semibold tracking-tight'>Kurye Listesi</h1>
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
                setEditingCourier(null)
                setEditFormValues(null)
                setCourierModalOpen(true)
              }}
            >
              <Plus className='mr-2 size-4' />
              Kurye Ekle
            </Button>
          </div>
        </div>

        {showSummary && <CouriersKpiCards kpi={kpi} />}

        <CreateCourierModal
          open={courierModalOpen}
          onOpenChange={(open) => {
            setCourierModalOpen(open)
            if (!open) {
              setEditingCourier(null)
              setEditFormValues(null)
            }
          }}
          mode={editingCourier ? 'edit' : 'create'}
          initialCourier={editingCourier}
          initialFormValues={editFormValues}
          isDetailLoading={isDetailLoading}
          vehicleOptions={vehicleOptions}
          skillOptions={skillOptions}
          isSkillCatalogLoading={isSkillCatalogLoading}
          onSubmit={handleCourierSubmit}
        />

        <Card>
          <CardContent className='space-y-4 px-6'>
            {table && (
              <div className='w-fit max-w-full space-y-4'>
                <div className='flex flex-wrap items-center justify-start gap-2'>
                  <CourierListTabs
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
                        placeholder='Ad, telefon, e-posta veya plaka ara...'
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
                            column={table.getColumn('istihdam')}
                            title='İstihdam'
                            options={courierEmploymentFilterOptions}
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
                              filename='kurye-listesi'
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
              emptyMessage='Gösterilecek kurye bulunamadı.'
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
