'use client'

import { useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  Gauge,
  Info,
  MapPin,
  MapPinned,
  Package,
  Route,
  Truck,
  UserRound,
  X,
} from 'lucide-react'
import type {
  OptimizeResult,
  OptimizedRoute,
  OrchestratorOrder,
} from '../_types/orchestrator'
import {
  isUserFacingOptimizeWarning,
  summarizeUnmatchedReasons,
  unmatchedReasonBadgeClass,
  unmatchedReasonUi,
} from '../_lib/unmatched-reason'
import { PendingRouteDetail } from './pending-route-detail'

type Props = {
  result: OptimizeResult
  orders: OrchestratorOrder[]
  selectedRouteId: string | null
  onSelectRoute: (routeId: string | null) => void
  onApproveRoute: (routeId: string) => void
  onRejectRoute: (routeId: string) => void
  onRemoveOrder?: (routeId: string, orderId: string) => void
  onReorderStops?: (routeId: string, orderedStopIds: string[]) => void
}

const RESULT_PANEL_TOOLTIP =
  'Optimizasyon sonucunda oluşturulan rotalar onayınıza sunulmuştur. Durak sırası, mesafe ve kapasite bilgilerini incelemek için ilgili rota kartına tıklayın.'

function TotalMetricPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Route
  label: string
  value: string
}) {
  return (
    <div className='inline-flex min-w-0 shrink-0 items-center gap-1.5 rounded-lg bg-white px-2 py-1 ring-1 ring-border/50'>
      <Icon className='size-3 shrink-0 text-slate-400' aria-hidden />
      <span className='text-[10px] font-medium text-slate-500'>{label}</span>
      <span className='text-[11px] font-semibold tabular-nums text-slate-900'>{value}</span>
    </div>
  )
}

function ResultTotalsStrip({ result }: { result: OptimizeResult }) {
  return (
    <div className='flex min-w-0 flex-wrap gap-1.5'>
      <TotalMetricPill icon={Route} label='Rota' value={String(result.routes.length)} />
      <TotalMetricPill
        icon={Package}
        label='Sipariş'
        value={String(result.totals.orderCount)}
      />
      <TotalMetricPill icon={MapPin} label='Durak' value={String(result.totals.stopCount)} />
      <TotalMetricPill
        icon={MapPinned}
        label='Mesafe'
        value={`${result.totals.distanceKm} km`}
      />
      <TotalMetricPill icon={Clock3} label='Süre' value={`${result.totals.durationMin} dk`} />
    </div>
  )
}

function RouteCardMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className='rounded-md bg-slate-50/80 px-2 py-1 ring-1 ring-slate-200/50'>
      <p className='text-[9px] font-medium uppercase tracking-wide text-slate-400'>{label}</p>
      <p className='text-[11px] font-semibold tabular-nums text-slate-800'>{value}</p>
    </div>
  )
}

function PendingRouteCard({
  route,
  onOpen,
  onApprove,
  onReject,
}: {
  route: OptimizedRoute
  onOpen: () => void
  onApprove: () => void
  onReject: () => void
}) {
  const capacityPct = Math.max(route.capacityVolumePct, route.capacityWeightPct)
  const hasWarning = route.warnings.length > 0
  const capacityTone =
    capacityPct >= 95 ? 'bg-rose-500' : capacityPct >= 80 ? 'bg-amber-500' : route.color

  return (
    <div
      className={cn(
        'group relative w-[min(100%,272px)] shrink-0 overflow-hidden rounded-xl border border-border/70 bg-white text-left shadow-sm',
        'transition-all hover:border-slate-300 hover:shadow-md sm:w-2xs'
      )}
    >
      <span
        className='absolute inset-y-0 left-0 w-1'
        style={{ backgroundColor: route.color }}
        aria-hidden
      />

      <button
        type='button'
        onClick={onOpen}
        className='w-full pl-3.5 pr-3 pt-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40'
      >
        <div className='mb-2.5 flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            <div className='mb-1 flex items-center gap-1.5'>
              <span
                className='inline-flex size-5 shrink-0 items-center justify-center rounded-md ring-1 ring-black/4'
                style={{ backgroundColor: `${route.color}18`, color: route.color }}
                aria-hidden
              >
                <Truck className='size-3' />
              </span>
              <span className='truncate font-mono text-sm font-semibold tracking-tight text-slate-900'>
                {route.vehiclePlate}
              </span>
            </div>
            <p className='flex items-center gap-1 truncate text-[11px] text-slate-500'>
              <UserRound className='size-3 shrink-0 text-slate-400' aria-hidden />
              {route.courierName ?? 'Kurye atanmadı'}
            </p>
          </div>
          <ChevronRight
            className='mt-0.5 size-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500'
            aria-hidden
          />
        </div>

        <div className='mb-2.5 grid grid-cols-2 gap-1.5'>
          <RouteCardMetric label='Sipariş' value={String(route.orderIds.length)} />
          <RouteCardMetric label='Durak' value={String(route.stopCount)} />
          <RouteCardMetric label='Mesafe' value={`${route.distanceKm} km`} />
          <RouteCardMetric label='Süre' value={`${route.durationMin} dk`} />
        </div>

        <div className='mb-2.5 flex items-center justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <div className='mb-1 flex items-center justify-between gap-2 text-[10px] text-slate-500'>
              <span className='inline-flex items-center gap-1'>
                <Gauge className='size-3 shrink-0 text-slate-400' aria-hidden />
                Kapasite
              </span>
              <span className='font-semibold tabular-nums text-slate-700'>%{capacityPct}</span>
            </div>
            <div className='h-1 overflow-hidden rounded-full bg-slate-100'>
              <div
                className='h-full rounded-full transition-all'
                style={{ width: `${Math.min(capacityPct, 100)}%`, backgroundColor: capacityTone }}
              />
            </div>
          </div>
          {hasWarning ? (
            <span
              className='inline-flex shrink-0 items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 ring-1 ring-amber-200/70'
              title={route.warnings[0]}
            >
              <AlertTriangle className='size-3 shrink-0' aria-hidden />
              Uyarı
            </span>
          ) : null}
        </div>
      </button>

      <div className='flex gap-1.5 border-t border-border/60 px-3 py-2 pl-3.5'>
        <Button
          type='button'
          size='sm'
          variant='outline'
          className='h-7 flex-1 px-2 text-[11px]'
          onClick={(event) => {
            event.stopPropagation()
            onReject()
          }}
        >
          <X className='size-3' />
          Reddet
        </Button>
        <Button
          type='button'
          size='sm'
          className='h-7 flex-1 px-2 text-[11px]'
          onClick={(event) => {
            event.stopPropagation()
            onApprove()
          }}
        >
          <Check className='size-3' />
          Onayla
        </Button>
      </div>
    </div>
  )
}

export function OptimizationResultPanel({
  result,
  orders,
  selectedRouteId,
  onSelectRoute,
  onApproveRoute,
  onRejectRoute,
  onRemoveOrder,
  onReorderStops,
}: Props) {
  const ordersById = useMemo(
    () => new Map(orders.map((order) => [order.id, order])),
    [orders]
  )
  const selectedRoute =
    selectedRouteId != null
      ? result.routes.find((route) => route.id === selectedRouteId) ?? null
      : null

  const unmatchedOrders = result.unmatchedOrders ?? []
  const unmatchedCount = unmatchedOrders.length
  const unmatchedSummary = summarizeUnmatchedReasons(unmatchedOrders)
  const userWarnings = useMemo(
    () => result.warnings.filter(isUserFacingOptimizeWarning),
    [result.warnings]
  )
  const debugWarnings = useMemo(
    () =>
      result.warnings.filter((warning) => !isUserFacingOptimizeWarning(warning)),
    [result.warnings]
  )
  const hasAlerts = unmatchedCount > 0 || userWarnings.length > 0
  const noRoutesWithUnmatched =
    result.routes.length === 0 && unmatchedCount > 0

  useEffect(() => {
    if (debugWarnings.length === 0) return
    console.debug('[optimize] unmatched/debug warnings', debugWarnings)
  }, [debugWarnings])

  if (selectedRoute) {
    return (
      <div className='flex h-full min-h-0 flex-col overflow-hidden'>
        <div className='relative flex shrink-0 items-center border-b border-border bg-white px-3 py-2 sm:px-4'>
          <button
            type='button'
            onClick={() => onSelectRoute(null)}
            className='relative z-10 inline-flex shrink-0 items-center gap-1 rounded-lg px-1.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900'
          >
            <ArrowLeft className='size-3.5' aria-hidden />
            Rota Optimizasyon Sonucuna Dön
          </button>
          <h2 className='pointer-events-none absolute inset-x-0 text-center text-sm font-semibold tracking-tight text-slate-900'>
            Onay Bekleyen Rota Detay
          </h2>
        </div>
        <div className='min-h-0 flex-1 overflow-hidden'>
          <PendingRouteDetail
            route={selectedRoute}
            orders={orders}
            onRemoveOrder={
              onRemoveOrder
                ? (orderId) => onRemoveOrder(selectedRoute.id, orderId)
                : undefined
            }
            onReorderOperationalStops={
              onReorderStops
                ? (orderedStopIds) =>
                    onReorderStops(selectedRoute.id, orderedStopIds)
                : undefined
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className='flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain'>
      <div className='shrink-0 border-b border-border/60 bg-slate-50/50 px-4 py-3'>
        <div className='mb-2.5 flex min-w-0 items-center gap-2.5'>
          <span className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border/50'>
            <Route className='size-4 text-sky-600' aria-hidden />
          </span>
          <h2 className='flex min-w-0 items-center gap-1.5 text-sm font-semibold leading-none tracking-tight text-slate-900'>
            <span>Rota Optimizasyon Sonucu</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type='button'
                  className='inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40'
                  aria-label={RESULT_PANEL_TOOLTIP}
                >
                  <Info className='size-3.5' aria-hidden />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side='top'
                sideOffset={6}
                className='max-w-xs text-left leading-relaxed'
              >
                {RESULT_PANEL_TOOLTIP}
              </TooltipContent>
            </Tooltip>
          </h2>
        </div>
        <ResultTotalsStrip result={result} />
        {unmatchedSummary ? (
          <p className='mt-2 text-[10px] font-medium uppercase tracking-wide text-slate-500'>
            Eşleşmeyen: {unmatchedSummary}
          </p>
        ) : null}
      </div>

      {noRoutesWithUnmatched ? (
        <div className='shrink-0 border-b border-rose-200/70 bg-rose-50/80 px-4 py-2.5'>
          <p className='flex items-start gap-1.5 text-[11px] leading-relaxed text-rose-900'>
            <AlertTriangle className='mt-0.5 size-3.5 shrink-0' aria-hidden />
            <span>
              <strong className='font-semibold'>Rota oluşturulamadı.</strong>
              {' '}
              Seçili siparişler kısıtlar nedeniyle hiçbir araca yerleştirilemedi.
            </span>
          </p>
        </div>
      ) : null}

      {hasAlerts ? (
        <div className='shrink-0 space-y-2 border-b border-border/60 px-4 py-2.5'>
          {unmatchedCount > 0 ? (
            <div className='rounded-lg border border-amber-200/80 bg-amber-50/80 px-2.5 py-2'>
              <p className='mb-2 flex min-w-0 items-start gap-1.5 text-[11px] leading-relaxed text-amber-900'>
                <AlertTriangle className='mt-0.5 size-3.5 shrink-0' aria-hidden />
                <span>
                  <strong className='font-semibold'>
                    {unmatchedCount} sipariş eşleşmedi
                  </strong>
                  {unmatchedSummary ? (
                    <>
                      {' — '}
                      {unmatchedSummary}
                    </>
                  ) : null}
                </span>
              </p>
              <ul className='space-y-1'>
                {unmatchedOrders.map((item) => {
                  const order = ordersById.get(item.orderId)
                  const ui = unmatchedReasonUi(item.reasonCode)
                  const Icon = ui.icon
                  return (
                    <li
                      key={item.orderId}
                      className='min-w-0 rounded-md bg-white/80 px-2 py-1.5 text-[11px] ring-1 ring-amber-200/60'
                    >
                      <div className='flex min-w-0 items-center gap-2'>
                        <span className='min-w-0 flex-1 truncate font-mono font-semibold text-slate-800'>
                          {order?.takip_no ?? item.orderId}
                        </span>
                        <span
                          className={cn(
                            'inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1',
                            unmatchedReasonBadgeClass(item.reasonCode)
                          )}
                        >
                          <Icon className='size-3' aria-hidden />
                          {ui.shortLabel}
                        </span>
                      </div>
                      <span className='mt-0.5 block truncate text-amber-900/80'>
                        {item.reason}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}
          {userWarnings.map((warning) => (
            <p
              key={warning}
              className='flex items-start gap-1.5 rounded-lg border border-amber-200/80 bg-amber-50/80 px-2.5 py-2 text-[11px] leading-relaxed text-amber-900'
            >
              <AlertTriangle className='mt-0.5 size-3.5 shrink-0' aria-hidden />
              {warning}
            </p>
          ))}
        </div>
      ) : null}

      <div className='shrink-0 px-4 py-3'>
        {result.routes.length > 0 ? (
          <div className='flex gap-3 overflow-x-auto overscroll-contain pb-0.5'>
            {result.routes.map((route) => (
              <PendingRouteCard
                key={route.id}
                route={route}
                onOpen={() => onSelectRoute(route.id)}
                onApprove={() => onApproveRoute(route.id)}
                onReject={() => onRejectRoute(route.id)}
              />
            ))}
          </div>
        ) : (
          <p className='rounded-lg border border-dashed border-border/70 bg-slate-50/50 px-3 py-4 text-center text-xs text-slate-500'>
            {noRoutesWithUnmatched
              ? 'Rota oluşturulamadı. Eşleşmeyen siparişlerin nedenlerini yukarıda inceleyin veya kısıtları değiştirip yeniden optimize edin.'
              : 'Onay bekleyen rota kalmadı. Eşleşmeyen siparişler için yeniden optimize edebilirsiniz.'}
          </p>
        )}
      </div>
    </div>
  )
}
