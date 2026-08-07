'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { AuditLogSection } from '../../../orders/[id]/_components/audit-log-section'
import type { OrderAuditLogItem } from '../../../orders/[id]/_types/order-detail'
import type { LastmileOrder } from '../../../orders/_types/order'
import { removeOrdersFromActiveRouteApi } from '../../route-orchestrator/_api/orchestrator-client'
import { ActiveRouteDetail } from '../../route-orchestrator/_components/active-route-detail'
import { removeOrderFromActiveRoute } from '../../route-orchestrator/_lib/remove-order-from-route'
import { reorderActiveRouteStops } from '../../route-orchestrator/_lib/reorder-route-stops'
import type {
  OrchestratorActiveRoute,
  OrchestratorOrder,
} from '../../route-orchestrator/_types/orchestrator'
import {
  fetchOrdersByRouteId,
  fetchRouteActivity,
  fetchRouteDetail,
  fetchRouteEta,
  type RouteHeaderFields,
} from '../_api/routes-client'
import { RouteDetailHeader } from '../_components/route-detail-header'
import { RouteNotesSection } from '../_components/route-notes-section'
import { RouteOrdersPanel } from '../_components/route-orders-panel'
import { isRoutesDemoForced } from '../_lib/routes-demo-mode'
import {
  getPlanningRouteListExtras,
  getPlanningRouteMockMovements,
  getPlanningRouteMockOpsNotes,
  getPlanningRouteMockOrders,
} from '../_mock/route-detail-mock'
import { getPlanningRouteMockById } from '../_mock/routes-mock-data'
import type { PlanningRouteStatus } from '../_types/planning-route'

const ETA_POLL_MS = 20_000

function toOrchestratorOrders(orders: LastmileOrder[]): OrchestratorOrder[] {
  return orders.map((order) => ({
    ...order,
    pickup: { lat: 41.01, lng: 29.0 },
    delivery: { lat: 41.02, lng: 29.01 },
  }))
}

export default function PlanningRouteDetailPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const forceDemo = isRoutesDemoForced(searchParams)
  const routeId = typeof params?.id === 'string' ? params.id : ''

  const [route, setRoute] = useState<OrchestratorActiveRoute | null>(null)
  const [headerFields, setHeaderFields] = useState<RouteHeaderFields | null>(null)
  const [orders, setOrders] = useState<OrchestratorOrder[]>([])
  const [movements, setMovements] = useState<OrderAuditLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usingMock, setUsingMock] = useState(false)
  const [activeTab, setActiveTab] = useState('stops')
  const [colorById, setColorById] = useState<Record<string, string>>({})

  const listHref = usingMock || forceDemo
    ? `${ARF_ROUTES.lastmile.planning.routes}?demo=1`
    : ARF_ROUTES.lastmile.planning.routes

  const planHref = routeId
    ? ARF_ROUTES.lastmile.planning.orchestratorWithRoute(routeId)
    : ARF_ROUTES.lastmile.planning.orchestrator

  const listExtras = useMemo(
    () => (routeId ? getPlanningRouteListExtras(routeId) : null),
    [routeId]
  )

  const displayHeader = useMemo((): RouteHeaderFields | null => {
    if ((usingMock || forceDemo) && listExtras) {
      return {
        shiftStart: listExtras.shiftStart,
        shiftEnd: listExtras.shiftEnd,
        parkLabel: listExtras.parkLabel,
        durationPlannedMin: listExtras.durationPlannedMin,
        durationActualMin: listExtras.durationActualMin,
        createdAt: listExtras.createdAt,
        createdBy: listExtras.createdBy,
        routeType: listExtras.routeType,
        status: listExtras.status,
      }
    }
    return headerFields
  }, [forceDemo, headerFields, listExtras, usingMock])

  const resolvedStatus: PlanningRouteStatus =
    displayHeader?.status ?? route?.status ?? 'planlandi'

  const loadOrdersForRoute = useCallback(
    async (activeRoute: OrchestratorActiveRoute, mockMode: boolean) => {
      setOrdersLoading(true)

      if (mockMode) {
        const mockOrders = getPlanningRouteMockOrders(activeRoute)
        setOrders(mockOrders)
        setOrdersLoading(false)
        return
      }

      const result = await fetchOrdersByRouteId(activeRoute.id)
      if (!result.success) {
        toast.error(result.error || 'Rota siparişleri yüklenemedi.')
        setOrders([])
        setOrdersLoading(false)
        return
      }

      setOrders(toOrchestratorOrders(result.data.orders))
      setOrdersLoading(false)
    },
    []
  )

  const loadMovementsForRoute = useCallback(
    async (activeRoute: OrchestratorActiveRoute, mockMode: boolean) => {
      if (mockMode) {
        setMovements(getPlanningRouteMockMovements(activeRoute))
        return
      }

      const result = await fetchRouteActivity(activeRoute.id)
      if (!result.success) {
        toast.error(result.error || 'Rota hareketleri yüklenemedi.')
        setMovements([])
        return
      }

      setMovements(result.data.items)
    },
    []
  )

  const load = useCallback(async () => {
    if (!routeId) {
      setLoading(false)
      setError('Rota id eksik')
      return
    }
    setLoading(true)
    setError(null)

    if (forceDemo) {
      const mock = getPlanningRouteMockById(routeId)
      setRoute(mock)
      setHeaderFields(null)
      setUsingMock(true)
      setError(mock ? null : 'Demo rotası bulunamadı. Örnek: /routes/4120?demo=1')
      if (mock) {
        setMovements(getPlanningRouteMockMovements(mock))
        await loadOrdersForRoute(mock, true)
      }
      setLoading(false)
      return
    }

    const result = await fetchRouteDetail(routeId)
    if (!result.success) {
      setRoute(null)
      setHeaderFields(null)
      setUsingMock(false)
      setError(result.error || 'Rota yüklenemedi')
      setLoading(false)
      return
    }

    setRoute(result.data.route)
    setHeaderFields(result.data.header)
    setUsingMock(false)
    await Promise.all([
      loadMovementsForRoute(result.data.route, false),
      loadOrdersForRoute(result.data.route, false),
    ])
    setLoading(false)
  }, [forceDemo, loadMovementsForRoute, loadOrdersForRoute, routeId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!routeId || !route || usingMock) return

    let cancelled = false
    const tick = async () => {
      const eta = await fetchRouteEta(routeId)
      if (cancelled || !eta.success) return
      setRoute((prev) => {
        if (!prev || prev.id !== routeId) return prev
        const byId = new Map(
          eta.data.stops
            .filter((s) => s.stopId)
            .map((s) => [s.stopId!, s] as const)
        )
        const stops = prev.stops.map((stop) => {
          const match = byId.get(stop.id)
          if (!match) return stop
          return {
            ...stop,
            scheduledTime: match.etaAt ?? stop.scheduledTime,
          }
        })
        return { ...prev, stops }
      })
    }

    void tick()
    const timer = window.setInterval(() => void tick(), ETA_POLL_MS)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, Boolean(route), usingMock])

  const displayRoute = route
    ? colorById[route.id]
      ? { ...route, color: colorById[route.id]! }
      : route
    : null

  const handleTabChange = (value: string) => {
    if (value === 'map') {
      router.push(planHref)
      return
    }
    setActiveTab(value)
  }

  const handleRemoveOrdersFromRoute = useCallback(
    (orderIds: string[]) => {
      const uniqueIds = [...new Set(orderIds.filter(Boolean))]
      if (!route || uniqueIds.length === 0) return

      if (usingMock || forceDemo) {
        let nextRoute = route
        const removedIds: string[] = []

        for (const orderId of uniqueIds) {
          const outcome = removeOrderFromActiveRoute(nextRoute, orderId)
          if (outcome.kind === 'blocked') {
            toast.error(outcome.reason)
            continue
          }
          removedIds.push(orderId)
          if (outcome.kind === 'empty') {
            setOrders((prev) => prev.filter((order) => !removedIds.includes(order.id)))
            setRoute(null)
            toast.message(
              removedIds.length === 1
                ? 'Sipariş aktif rotadan çıkarıldı · havuza döndü'
                : `${removedIds.length} sipariş rotadan çıkarıldı · havuza döndü`
            )
            router.push(listHref)
            return
          }
          nextRoute = outcome.route
        }

        if (removedIds.length === 0) return

        setRoute(nextRoute)
        setOrders((prev) => prev.filter((order) => !removedIds.includes(order.id)))
        toast.message(
          removedIds.length === 1
            ? 'Sipariş aktif rotadan çıkarıldı · havuza döndü'
            : `${removedIds.length} sipariş rotadan çıkarıldı · havuza döndü`
        )
        return
      }

      void (async () => {
        const removed = await removeOrdersFromActiveRouteApi({
          routeId: route.id,
          orderIds: uniqueIds,
          version: route.version,
        })
        if (!removed.success) {
          toast.error(removed.error)
          return
        }
        toast.message(
          uniqueIds.length === 1
            ? 'Sipariş aktif rotadan çıkarıldı · havuza döndü'
            : `${uniqueIds.length} sipariş rotadan çıkarıldı · havuza döndü`
        )
        await load()
      })()
    },
    [forceDemo, listHref, load, route, router, usingMock]
  )

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Last Mile', href: ARF_ROUTES.lastmile.root },
          { label: 'Planlama' },
          { label: 'Rotalar', href: listHref },
          { label: displayRoute?.label ?? (routeId || 'Rota') },
        ]}
        searchPlaceholder='Lastmile ara...'
        searchShortcut={<>⌘K</>}
      />

      <div className='flex min-w-0 flex-1 flex-col gap-5 bg-slate-50/80 p-4 pb-10 pt-3 lg:px-6'>
        {loading ? (
          <div className='flex flex-1 items-center justify-center gap-2 py-20 text-sm text-muted-foreground'>
            <Loader2 className='size-4 animate-spin' aria-hidden />
            Rota detayı yükleniyor…
          </div>
        ) : error ? (
          <div className='flex flex-1 flex-col items-center justify-center gap-3 py-20 text-sm text-rose-800'>
            <p>{error}</p>
            <Button type='button' size='sm' variant='outline' onClick={() => void load()}>
              Tekrar dene
            </Button>
          </div>
        ) : displayRoute ? (
          <>
            <RouteDetailHeader
              route={displayRoute}
              status={resolvedStatus}
              routeType={displayHeader?.routeType ?? undefined}
              shiftStart={displayHeader?.shiftStart}
              shiftEnd={displayHeader?.shiftEnd}
              parkLabel={displayHeader?.parkLabel}
              durationPlannedMin={displayHeader?.durationPlannedMin}
              durationActualMin={displayHeader?.durationActualMin}
              createdAt={displayHeader?.createdAt}
              createdBy={displayHeader?.createdBy}
            />

            <Card className='rounded-[24px] border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03),0_12px_32px_rgba(15,23,42,0.04)]'>
              <CardContent className='p-5 lg:p-6'>
                <Tabs value={activeTab} onValueChange={handleTabChange} className='w-full'>
                  <TabsList className='mb-5 flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-slate-200/70 bg-slate-100/70 p-1'>
                    <TabsTrigger value='stops'>Duraklar</TabsTrigger>
                    <TabsTrigger value='orders'>Siparişler</TabsTrigger>
                    <TabsTrigger value='map'>Harita</TabsTrigger>
                    <TabsTrigger value='notes'>Notlar</TabsTrigger>
                    <TabsTrigger value='audit'>Hareketler</TabsTrigger>
                  </TabsList>

                  <TabsContent value='stops' className='mt-0'>
                    <div className='h-[min(72vh,860px)] w-full overflow-hidden rounded-xl border border-slate-200/80 bg-card'>
                      <ActiveRouteDetail
                        route={displayRoute}
                        orders={orders}
                        usedColors={[displayRoute.color]}
                        hideSummary
                        onChangeColor={(color) =>
                          setColorById((prev) => ({
                            ...prev,
                            [displayRoute.id]: color,
                          }))
                        }
                        onRemoveOrder={(orderId) => handleRemoveOrdersFromRoute([orderId])}
                        onReorderOperationalStops={(orderedStopIds) => {
                          setRoute((prev) =>
                            prev ? reorderActiveRouteStops(prev, orderedStopIds) : prev
                          )
                        }}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value='orders' className='mt-0'>
                    <RouteOrdersPanel
                      orders={orders}
                      isLoading={ordersLoading}
                      onRefresh={() => {
                        if (displayRoute) void loadOrdersForRoute(displayRoute, usingMock)
                      }}
                      onRemoveFromRoute={handleRemoveOrdersFromRoute}
                    />
                  </TabsContent>

                  <TabsContent value='map' className='mt-0'>
                    <p className='py-10 text-center text-sm text-slate-500'>
                      Orkestratöre yönlendiriliyor…
                    </p>
                  </TabsContent>

                  <TabsContent value='notes' className='mt-0'>
                    <RouteNotesSection
                      key={displayRoute.id}
                      routeId={displayRoute.id}
                      localOnly={usingMock || forceDemo}
                      demoNotes={
                        usingMock || forceDemo
                          ? getPlanningRouteMockOpsNotes(displayRoute)
                          : []
                      }
                    />
                  </TabsContent>

                  <TabsContent value='audit' className='mt-0'>
                    <AuditLogSection items={movements} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className='flex flex-1 items-center justify-center py-20 text-sm text-muted-foreground'>
            Bu rota bulunamadı veya erişim yok.
          </div>
        )}
      </div>
    </>
  )
}
