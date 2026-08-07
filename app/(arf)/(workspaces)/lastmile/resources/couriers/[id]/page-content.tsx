'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { isLastmileDemoForced } from '../../../_lib/lastmile-demo-mode'
import {
  getCourierActivityMock,
  getCourierAssignmentsMock,
  getCourierDetailMock,
} from '../_mock/couriers-mock-data'
import { getVehicleAssignmentConflict } from '../../_lib/assignment-validation'
import {
  activateDriver,
  fetchDriverActivity,
  fetchDriverAssignmentHistory,
  fetchDriverDetail,
  passiveDriver,
  sendDriverPasswordReset,
  updateDriver,
  updateDriverAssignment,
} from '../_api/drivers'
import {
  CreateCourierModal,
  courierToFormValues,
  type CourierCreateFormValues,
} from '../_components/create-courier-modal'
import { useCourierModalResources } from '../_hooks/use-courier-modal-resources'
import { useCourierPermissions } from '../_hooks/use-courier-permissions'
import type { CourierDocumentMeta, LastmileCourier } from '../_types/courier'
import { CourierDetailHeader } from './_components/courier-detail-header'
import { TabAssignmentHistory } from './_components/tab-assignment-history'
import { TabCostPayout } from './_components/tab-cost-payout'
import { TabDocuments } from './_components/tab-documents'
import { TabInfo } from './_components/tab-info'
import type {
  CourierActivityEvent,
  CourierDetailTab,
  CourierVehicleAssignment,
} from './_types/courier-detail'

const TAB_ITEMS: Array<{ id: CourierDetailTab; label: string }> = [
  { id: 'info', label: 'Bilgi' },
  { id: 'documents', label: 'Yasal Belgeler' },
  { id: 'assignments', label: 'Zimmet Ve İşlem Geçmişi' },
  { id: 'cost', label: 'Ücret & Ödeme' },
]

const ROUTES_TAB = { id: 'routes', label: 'Geçmiş Rotalar' } as const
const HISTORY_PAGE_SIZE = 50

export default function CourierDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const forceDemo = isLastmileDemoForced(searchParams)
  const [courier, setCourier] = useState<LastmileCourier | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [assignments, setAssignments] = useState<CourierVehicleAssignment[]>([])
  const [activities, setActivities] = useState<CourierActivityEvent[]>([])
  const [assignmentTotal, setAssignmentTotal] = useState(0)
  const [activityTotal, setActivityTotal] = useState(0)
  const [assignmentPage, setAssignmentPage] = useState(1)
  const [activityPage, setActivityPage] = useState(1)
  const [loadingMoreAssignments, setLoadingMoreAssignments] = useState(false)
  const [loadingMoreActivities, setLoadingMoreActivities] = useState(false)
  const [tab, setTab] = useState<CourierDetailTab>('info')
  const [editOpen, setEditOpen] = useState(false)
  const { vehicleOptions, skillOptions, isSkillCatalogLoading, skillLabelMap } =
    useCourierModalResources()
  const permissions = useCourierPermissions()
  const readOnly = !permissions.canUpdate

  const loadDetail = useCallback(async () => {
    setIsLoading(true)

    if (forceDemo) {
      const mock = getCourierDetailMock(id)
      setIsLoading(false)
      if (!mock) {
        setCourier(null)
        toast.error('Demo kurye bulunamadı')
        return
      }
      setCourier(mock)
      const assignments = getCourierAssignmentsMock(id)
      const activities = getCourierActivityMock(id)
      setAssignments(assignments)
      setAssignmentTotal(assignments.length)
      setAssignmentPage(1)
      setActivities(activities)
      setActivityTotal(activities.length)
      setActivityPage(1)
      return
    }

    const [detailResult, historyResult, activityResult] = await Promise.all([
      fetchDriverDetail(id),
      fetchDriverAssignmentHistory(id),
      fetchDriverActivity(id),
    ])

    setIsLoading(false)

    if (!detailResult.success) {
      const mock = getCourierDetailMock(id)
      if (mock) {
        setCourier(mock)
        const assignments = getCourierAssignmentsMock(id)
        const activities = getCourierActivityMock(id)
        setAssignments(assignments)
        setAssignmentTotal(assignments.length)
        setAssignmentPage(1)
        setActivities(activities)
        setActivityTotal(activities.length)
        setActivityPage(1)
        return
      }
      setCourier(null)
      toast.error(detailResult.error)
      return
    }

    setCourier(detailResult.data)
    setAssignments(historyResult.success ? historyResult.data.items : [])
    setAssignmentTotal(historyResult.success ? historyResult.data.total : 0)
    setAssignmentPage(historyResult.success ? historyResult.data.page : 1)
    setActivities(activityResult.success ? activityResult.data.items : [])
    setActivityTotal(activityResult.success ? activityResult.data.total : 0)
    setActivityPage(activityResult.success ? activityResult.data.page : 1)
  }, [id, forceDemo])

  const handleLoadMoreAssignments = useCallback(async () => {
    if (loadingMoreAssignments || assignments.length >= assignmentTotal) return

    setLoadingMoreAssignments(true)
    const result = await fetchDriverAssignmentHistory(id, assignmentPage + 1, HISTORY_PAGE_SIZE)
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
    const result = await fetchDriverActivity(id, activityPage + 1, HISTORY_PAGE_SIZE)
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

  const handleEdit = useCallback(() => {
    if (!permissions.canUpdate) {
      toast.error('Kurye düzenleme yetkiniz yok.')
      return
    }
    setEditOpen(true)
  }, [permissions.canUpdate])

  const handleVehicleAssign = useCallback(
    async (vehicleId: string | null) => {
      if (!permissions.canChangeVehicle) {
        toast.error('Araç zimmeti değiştirme yetkiniz yok.')
        return
      }
      if (!courier) return

      if (vehicleId) {
        const vehicle = vehicleOptions.find((item) => item.id === vehicleId)
        if (vehicle) {
          const conflict = getVehicleAssignmentConflict(
            {
              plaka: vehicle.plaka,
              assignedCourierId: vehicle.assignedCourierId,
              assignedCourierName: vehicle.assignedCourierName,
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
        toast.error(result.error)
        return
      }

      setCourier(result.data)
      const historyResult = await fetchDriverAssignmentHistory(courier.id)
      if (historyResult.success) {
        setAssignments(historyResult.data.items)
        setAssignmentTotal(historyResult.data.total)
        setAssignmentPage(historyResult.data.page)
      }

      toast.success(
        vehicleId
          ? `${result.data.ad_soyad} için ${result.data.zimmetli_arac_plaka ?? 'araç'} atandı`
          : `${result.data.ad_soyad} zimmeti kaldırıldı`
      )
    },
    [courier, permissions.canChangeVehicle, vehicleOptions]
  )

  const handleToggleStatus = useCallback(async () => {
    if (!courier) return

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

    setCourier(result.data)
    toast.success(
      courier.durum === 'pasif'
        ? `${result.data.ad_soyad} aktif edildi`
        : `${result.data.ad_soyad} pasife alındı`
    )
  }, [courier, permissions.canActivate, permissions.canPassive])

  const handleLiveTrack = useCallback(() => {
    if (!courier) return
    const searchParams = new URLSearchParams({ courier: courier.id })
    router.push(`${ARF_ROUTES.lastmile.dashboard.live}?${searchParams.toString()}`)
    toast.message(`${courier.ad_soyad} canlı izleme açılıyor`)
  }, [courier, router])

  const handleSendPasswordReset = useCallback(async () => {
    if (!permissions.canUpdate) {
      toast.error('Bu işlem için yetkiniz yok.')
      return
    }
    if (!courier?.eposta) {
      toast.error('Kurye için tanımlı bir e-posta adresi yok.')
      return
    }

    const result = await sendDriverPasswordReset(courier.id)
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success(`Şifre sıfırlama bağlantısı ${courier.eposta} adresine gönderildi`)
  }, [courier, permissions.canUpdate])

  const handleRouteHistory = useCallback(() => {
    if (!courier) return
    router.push(ARF_ROUTES.lastmile.planning.routesByDriver(courier.id))
    toast.message(`${courier.ad_soyad} rota geçmişi açılıyor`)
  }, [courier, router])

  const handleDocumentsChange = useCallback((evraklar: CourierDocumentMeta[]) => {
    if (!permissions.canUpdate) return
    setCourier((previous) => (previous ? { ...previous, evraklar } : previous))
  }, [permissions.canUpdate])

  if (isLoading) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
            { label: 'Kurye Listesi', href: ARF_ROUTES.lastmile.resources.couriers.list },
            { label: 'Yükleniyor…' },
          ]}
        />
        <div className='flex flex-1 items-center justify-center p-6 text-sm text-slate-500'>
          Kurye bilgileri yükleniyor…
        </div>
      </>
    )
  }

  if (!courier) {
    return (
      <>
        <AppHeader
          breadcrumbs={[
            { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
            { label: 'Kurye Listesi', href: ARF_ROUTES.lastmile.resources.couriers.list },
            { label: 'Bulunamadı' },
          ]}
        />
        <div className='flex flex-1 flex-col items-center justify-center gap-3 p-6'>
          <p className='text-sm text-slate-600'>Kurye bulunamadı.</p>
          <Button asChild size='sm'>
            <Link href={ARF_ROUTES.lastmile.resources.couriers.list}>Listeye Dön</Link>
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
          { label: 'Kurye Listesi', href: ARF_ROUTES.lastmile.resources.couriers.list },
          { label: courier.ad_soyad },
        ]}
        searchPlaceholder='Lastmile ara...'
        searchShortcut={<>⌘K</>}
      />

      <div className='flex flex-1 flex-col gap-4 p-6'>
        <div className='sticky top-0 z-20 -mx-6 space-y-4 bg-background/95 px-6 py-1 backdrop-blur supports-backdrop-filter:bg-background/80'>
          <CourierDetailHeader
            courier={courier}
            vehicleOptions={vehicleOptions}
            skillLabelMap={skillLabelMap}
            permissions={permissions}
            onEdit={handleEdit}
            onVehicleAssign={handleVehicleAssign}
            onToggleStatus={handleToggleStatus}
            onSendPasswordReset={handleSendPasswordReset}
            onLiveTrack={handleLiveTrack}
          />
        </div>

        <CreateCourierModal
          open={editOpen}
          onOpenChange={setEditOpen}
          mode='edit'
          initialCourier={courier}
          initialFormValues={courierToFormValues(courier)}
          vehicleOptions={vehicleOptions}
          skillOptions={skillOptions}
          isSkillCatalogLoading={isSkillCatalogLoading}
          onSubmit={async (values) => {
            if (!permissions.canUpdate) {
              toast.error('Kurye düzenleme yetkiniz yok.')
              return
            }

            const documentIds = values.evraklar.map((doc) => doc.id)
            const result = await updateDriver(courier.id, values, documentIds)
            if (!result.success) {
              throw new Error(result.error)
            }

            setCourier(result.data)
            toast.success(`${result.data.ad_soyad} güncellendi`)
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
                setTab(value as CourierDetailTab)
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

              <TabsContent value='info' className='mt-0'>
                <TabInfo courier={courier} />
              </TabsContent>
              <TabsContent value='documents' className='mt-0'>
                <TabDocuments
                  courier={courier}
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
              <TabsContent value='cost' className='mt-0'>
                <TabCostPayout
                  courierId={courier.id}
                  courierName={courier.ad_soyad}
                  readOnly={readOnly}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
