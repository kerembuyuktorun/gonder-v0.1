'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import {
  fetchVehicleActivity,
  fetchVehicleAssignmentHistory,
  fetchVehicleDetail,
  updateVehicle,
  updateVehicleAssignment,
  updateVehicleOperationScopes,
  activateVehicle,
  passiveVehicle,
} from '../_api/vehicles'
import {
  CreateVehicleModal,
  type VehicleCreateFormValues,
} from '../_components/create-vehicle-modal'
import { useVehicleModalResources } from '../_hooks/use-vehicle-modal-resources'
import { useVehiclePermissions } from '../_hooks/use-vehicle-permissions'
import { getCourierAssignmentConflict } from '../../_lib/assignment-validation'
import { vehicleToFormValuesWithScopes } from '../_lib/map-vehicle'
import type { OperationScopeRow } from '../../../customers/[id]/_types/customer-detail'
import type { LastmileVehicle } from '../_types/vehicle'
import { TabAssignmentHistory } from './_components/tab-assignment-history'
import { TabDocuments } from './_components/tab-documents'
import { TabOperations } from './_components/tab-operations'
import { VehicleDetailHeader } from './_components/vehicle-detail-header'
import type {
  VehicleActivityEvent,
  VehicleAssignmentRecord,
  VehicleDetailTab,
} from './_types/vehicle-detail'

const TAB_ITEMS: Array<{ id: VehicleDetailTab; label: string }> = [
  { id: 'operations', label: 'Hizmet Bölgesi' },
  { id: 'documents', label: 'Yasal Belgeler' },
  { id: 'assignments', label: 'Zimmet Ve İşlem Geçmişi' },
]

const ROUTES_TAB = { id: 'routes', label: 'Geçmiş Rotalar' } as const

const HISTORY_PAGE_SIZE = 50

export default function VehicleDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [vehicle, setVehicle] = useState<LastmileVehicle | null>(null)
  const [operationScopes, setOperationScopes] = useState<OperationScopeRow[]>([])
  const [assignments, setAssignments] = useState<VehicleAssignmentRecord[]>([])
  const [activities, setActivities] = useState<VehicleActivityEvent[]>([])
  const [assignmentTotal, setAssignmentTotal] = useState(0)
  const [activityTotal, setActivityTotal] = useState(0)
  const [assignmentPage, setAssignmentPage] = useState(1)
  const [activityPage, setActivityPage] = useState(1)
  const [loadingMoreAssignments, setLoadingMoreAssignments] = useState(false)
  const [loadingMoreActivities, setLoadingMoreActivities] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [tab, setTab] = useState<VehicleDetailTab>('operations')
  const [editOpen, setEditOpen] = useState(false)
  const [editFormValues, setEditFormValues] = useState<VehicleCreateFormValues | null>(null)
  const { courierOptions, skillOptions, isSkillCatalogLoading, skillLabelMap } =
    useVehicleModalResources()
  const permissions = useVehiclePermissions()
  const readOnly = !permissions.canUpdate

  const loadDetail = useCallback(async () => {
    setIsLoading(true)

    const [detailResult, historyResult, activityResult] = await Promise.all([
      fetchVehicleDetail(id),
      fetchVehicleAssignmentHistory(id),
      fetchVehicleActivity(id),
    ])

    setIsLoading(false)

    if (!detailResult.success) {
      setVehicle(null)
      toast.error(detailResult.error)
      return
    }

    setVehicle(detailResult.data.vehicle)
    setOperationScopes(detailResult.data.operationScopes)
    setAssignments(historyResult.success ? historyResult.data.items : [])
    setAssignmentTotal(historyResult.success ? historyResult.data.total : 0)
    setAssignmentPage(historyResult.success ? historyResult.data.page : 1)
    setActivities(activityResult.success ? activityResult.data.items : [])
    setActivityTotal(activityResult.success ? activityResult.data.total : 0)
    setActivityPage(activityResult.success ? activityResult.data.page : 1)
  }, [id])

  const handleLoadMoreAssignments = useCallback(async () => {
    if (loadingMoreAssignments || assignments.length >= assignmentTotal) return

    setLoadingMoreAssignments(true)
    const result = await fetchVehicleAssignmentHistory(id, assignmentPage + 1, HISTORY_PAGE_SIZE)
    setLoadingMoreAssignments(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setAssignments((previous) => [...previous, ...result.data.items])
    setAssignmentPage(result.data.page)
    setAssignmentTotal(result.data.total)
  }, [
    assignmentPage,
    assignmentTotal,
    assignments.length,
    id,
    loadingMoreAssignments,
  ])

  const handleLoadMoreActivities = useCallback(async () => {
    if (loadingMoreActivities || activities.length >= activityTotal) return

    setLoadingMoreActivities(true)
    const result = await fetchVehicleActivity(id, activityPage + 1, HISTORY_PAGE_SIZE)
    setLoadingMoreActivities(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    setActivities((previous) => [...previous, ...result.data.items])
    setActivityPage(result.data.page)
    setActivityTotal(result.data.total)
  }, [activities.length, activityPage, activityTotal, id, loadingMoreActivities])

  useEffect(() => {
    void loadDetail()
  }, [loadDetail])

  const handleScopesChange = useCallback(
    async (scopes: OperationScopeRow[]) => {
      if (!permissions.canUpdate || !vehicle) return

      const result = await updateVehicleOperationScopes(vehicle.id, scopes)
      if (!result.success) {
        toast.error(result.error)
        return
      }

      setVehicle(result.data.vehicle)
      setOperationScopes(result.data.operationScopes)
      toast.success('Hizmet bölgesi güncellendi')
    },
    [permissions.canUpdate, vehicle]
  )

  const handleDocumentsChange = (evraklar: LastmileVehicle['evraklar']) => {
    if (!permissions.canUpdate) return
    setVehicle((previous) => (previous ? { ...previous, evraklar } : previous))
  }

  const handleEdit = useCallback(() => {
    if (!permissions.canUpdate) {
      toast.error('Araç düzenleme yetkiniz yok.')
      return
    }
    if (!vehicle) return
    setEditFormValues(vehicleToFormValuesWithScopes(vehicle, operationScopes))
    setEditOpen(true)
  }, [operationScopes, permissions.canUpdate, vehicle])

  const handleCourierAssign = useCallback(
    async (courierId: string | null) => {
      if (!permissions.canChangeDriver) {
        toast.error('Sürücü değiştirme yetkiniz yok.')
        return
      }
      if (!vehicle) return

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

      setVehicle(result.data)
      const historyResult = await fetchVehicleAssignmentHistory(vehicle.id)
      if (historyResult.success) {
        setAssignments(historyResult.data.items)
        setAssignmentTotal(historyResult.data.total)
        setAssignmentPage(historyResult.data.page)
      }

      toast.success(
        courierId
          ? `${result.data.plaka} zimmeti güncellendi`
          : `${result.data.plaka} zimmeti kaldırıldı`
      )
    },
    [courierOptions, permissions.canChangeDriver, vehicle]
  )

  const handleToggleStatus = useCallback(async () => {
    if (!vehicle) return

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
          ? 'Zimmetli sürücü veya aktif rota varken araç pasife alınamaz.'
          : result.error
      )
      return
    }

    setVehicle(result.data)
    toast.success(
      vehicle.durum === 'pasif'
        ? `${result.data.plaka} aktif edildi`
        : `${result.data.plaka} pasife alındı`
    )
  }, [permissions.canActivate, permissions.canPassive, vehicle])

  const handleLiveTrack = useCallback(() => {
    if (!vehicle) return
    const searchParams = new URLSearchParams({ vehicle: vehicle.id })
    router.push(`${ARF_ROUTES.lastmile.dashboard.live}?${searchParams.toString()}`)
    toast.message(`${vehicle.plaka} canlı izleme açılıyor`)
  }, [router, vehicle])

  const handleRouteHistory = useCallback(() => {
    if (!vehicle) return
    router.push(ARF_ROUTES.lastmile.planning.routesByVehicle(vehicle.id))
    toast.message(`${vehicle.plaka} rota geçmişi açılıyor`)
  }, [router, vehicle])

  if (isLoading) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
            { label: 'Araç Listesi', href: ARF_ROUTES.lastmile.resources.vehicles.list },
            { label: 'Yükleniyor…' },
          ]}
        />
        <div className='flex flex-1 items-center justify-center p-6 text-sm text-slate-500'>
          Araç bilgileri yükleniyor…
        </div>
      </>
    )
  }

  if (!vehicle) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
            { label: 'Araç Listesi', href: ARF_ROUTES.lastmile.resources.vehicles.list },
            { label: 'Bulunamadı' },
          ]}
        />
        <div className='flex flex-1 flex-col items-center justify-center gap-3 p-6'>
          <p className='text-sm text-slate-600'>Araç bulunamadı.</p>
          <Button asChild size='sm'>
            <Link href={ARF_ROUTES.lastmile.resources.vehicles.list}>Listeye Dön</Link>
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Araç Listesi', href: ARF_ROUTES.lastmile.resources.vehicles.list },
          { label: vehicle.plaka },
        ]}
        searchPlaceholder='Lastmile ara...'
        searchShortcut={<>⌘K</>}
      />

      <div className='flex flex-1 flex-col gap-4 p-6'>
        <div className='sticky top-0 z-20 -mx-6 space-y-4 bg-background/95 px-6 py-1 backdrop-blur supports-backdrop-filter:bg-background/80'>
          <VehicleDetailHeader
            vehicle={vehicle}
            courierOptions={courierOptions}
            skillLabelMap={skillLabelMap}
            permissions={permissions}
            onEdit={handleEdit}
            onCourierAssign={handleCourierAssign}
            onToggleStatus={handleToggleStatus}
            onLiveTrack={handleLiveTrack}
          />
        </div>

        <CreateVehicleModal
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open)
            if (!open) setEditFormValues(null)
          }}
          mode='edit'
          initialVehicle={vehicle}
          initialFormValues={editFormValues}
          courierOptions={courierOptions}
          skillOptions={skillOptions}
          isSkillCatalogLoading={isSkillCatalogLoading}
          onSubmit={async (values) => {
            if (!permissions.canUpdate) {
              toast.error('Araç düzenleme yetkiniz yok.')
              return
            }

            const documentIds = values.evraklar.map((doc) => doc.id)
            const result = await updateVehicle(vehicle.id, values, documentIds)
            if (!result.success) {
              throw new Error(result.error)
            }

            setVehicle(result.data)
            setOperationScopes(values.hizmet_bolgesi_scopes)
            setEditFormValues(null)
            toast.success(`${result.data.plaka} güncellendi`)
          }}
        />

        <Card className='rounded-[24px] border-slate-200/80 shadow-none'>
          <CardContent className='p-4 lg:p-5'>
            <Tabs
              value={tab}
              onValueChange={(value) => {
                if (value === ROUTES_TAB.id) {
                  handleRouteHistory()
                  return
                }
                setTab(value as VehicleDetailTab)
              }}
              className='gap-4'
            >
              <TabsList className='h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-slate-100/80 p-1'>
                {TAB_ITEMS.map((item) => (
                  <TabsTrigger
                    key={item.id}
                    value={item.id}
                    className='rounded-lg px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm'
                  >
                    {item.label}
                  </TabsTrigger>
                ))}
                <TabsTrigger
                  value={ROUTES_TAB.id}
                  className='rounded-lg px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm'
                >
                  {ROUTES_TAB.label}
                </TabsTrigger>
              </TabsList>

              <TabsContent value='operations' className='mt-0'>
                <TabOperations
                  scopes={operationScopes}
                  onScopesChange={handleScopesChange}
                  readOnly={readOnly}
                  startLocation={{
                    baslangic_stratejisi: vehicle.baslangic_stratejisi,
                    park_konumu: vehicle.park_konumu ?? '',
                    park_lat: vehicle.park_lat,
                    park_lng: vehicle.park_lng,
                  }}
                />
              </TabsContent>
              <TabsContent value='documents' className='mt-0'>
                <TabDocuments
                  vehicle={vehicle}
                  onDocumentsChange={handleDocumentsChange}
                  readOnly={readOnly}
                />
              </TabsContent>
              <TabsContent value='assignments' className='mt-0'>
                <TabAssignmentHistory
                  assignments={assignments}
                  activities={activities}
                  assignmentTotal={assignmentTotal}
                  activityTotal={activityTotal}
                  onLoadMoreAssignments={handleLoadMoreAssignments}
                  onLoadMoreActivities={handleLoadMoreActivities}
                  loadingMoreAssignments={loadingMoreAssignments}
                  loadingMoreActivities={loadingMoreActivities}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
