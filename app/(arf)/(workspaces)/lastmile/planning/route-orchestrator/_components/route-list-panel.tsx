'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Clock3,
  ExternalLink,
  Gauge,
  Info,
  MapPin,
  MapPinned,
  Package,
  Route,
  Truck,
  UserRound,
} from 'lucide-react'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import type {
  ActiveRouteDateScope,
  OrchestratorActiveRoute,
  OrchestratorOrder,
} from '../_types/orchestrator'
import { ActiveRouteDetail } from './active-route-detail'
import { RouteColorPicker } from './route-color-picker'

type Props = {
  routes: OrchestratorActiveRoute[]
  orders: OrchestratorOrder[]
  dateScope: ActiveRouteDateScope
  dateScopeCounts: { today: number; carryover: number }
  onDateScopeChange: (scope: ActiveRouteDateScope) => void
  selectedRouteIds: Set<string>
  onToggleRoute: (routeId: string) => void
  onChangeRouteColor: (routeId: string, color: string) => void
  detailRouteId: string | null
  onOpenDetail: (routeId: string) => void
  onCloseDetail: () => void
  onRemoveOrder?: (routeId: string, orderId: string) => void
  onReorderStops?: (routeId: string, orderedStopIds: string[]) => void
}

const ROUTE_LIST_TOOLTIP =
  'Sahada aktif rotaların özeti. Checkbox ile haritada gösterin; karta tıklayarak rota detayına geçin.'

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

function RouteListTotals({ routes }: { routes: OrchestratorActiveRoute[] }) {
  const totals = routes.reduce(
    (acc, route) => ({
      stopCount: acc.stopCount + route.stopCount,
      orderCount: acc.orderCount + route.orderCount,
      distanceKm: acc.distanceKm + route.distanceKm,
      durationMin: acc.durationMin + route.durationMin,
    }),
    { stopCount: 0, orderCount: 0, distanceKm: 0, durationMin: 0 }
  )

  return (
    <div className='flex min-w-0 flex-wrap gap-1.5'>
      <TotalMetricPill icon={Route} label='Rota' value={String(routes.length)} />
      <TotalMetricPill icon={Package} label='Sipariş' value={String(totals.orderCount)} />
      <TotalMetricPill icon={MapPin} label='Durak' value={String(totals.stopCount)} />
      <TotalMetricPill
        icon={MapPinned}
        label='Mesafe'
        value={`${Math.round(totals.distanceKm * 10) / 10} km`}
      />
      <TotalMetricPill icon={Clock3} label='Süre' value={`${totals.durationMin} dk`} />
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

function ActiveRouteCard({
  route,
  selected,
  usedColors,
  onToggle,
  onOpen,
  onChangeColor,
}: {
  route: OrchestratorActiveRoute
  selected: boolean
  usedColors: string[]
  onToggle: () => void
  onOpen: () => void
  onChangeColor: (color: string) => void
}) {
  const capacityPct = Math.max(route.capacityVolumePct, route.capacityWeightPct)
  const progressPct =
    route.stopCount > 0
      ? Math.round((route.completedStopCount / route.stopCount) * 100)
      : 0
  const capacityTone =
    capacityPct >= 95 ? 'bg-rose-500' : capacityPct >= 80 ? 'bg-amber-500' : route.color

  return (
    <div
      className={cn(
        'group relative w-[min(100%,272px)] shrink-0 overflow-hidden rounded-xl border bg-white text-left shadow-sm sm:w-2xs',
        'transition-all hover:border-slate-300 hover:shadow-md',
        selected ? 'border-sky-300 ring-2 ring-sky-200/60' : 'border-border/70'
      )}
    >
      <span
        className='absolute inset-y-0 left-0 w-1'
        style={{ backgroundColor: route.color }}
        aria-hidden
      />

      <div className='pl-3.5 pr-3 py-3'>
        <div className='mb-2.5 flex items-start justify-between gap-2'>
          <div className='flex min-w-0 items-start gap-2'>
            <Checkbox
              checked={selected}
              onCheckedChange={() => onToggle()}
              aria-label={`${route.label} rotasını haritada göster`}
              className='mt-0.5 shrink-0'
              onClick={(event) => event.stopPropagation()}
            />
            <button type='button' onClick={onOpen} className='min-w-0 text-left'>
              <div className='mb-1 flex flex-wrap items-center gap-1.5'>
                <span
                  className='inline-flex size-5 shrink-0 items-center justify-center rounded-md ring-1 ring-black/4'
                  style={{ backgroundColor: `${route.color}18`, color: route.color }}
                  aria-hidden
                >
                  <Route className='size-3' />
                </span>
                <span className='truncate font-mono text-sm font-semibold tracking-tight text-slate-900'>
                  {route.label}
                </span>
                <Badge
                  variant='outline'
                  className='h-5 border-emerald-200/80 bg-emerald-50 px-1.5 text-[10px] font-medium text-emerald-700 shadow-none'
                >
                  Aktif
                </Badge>
              </div>
              <p className='flex items-center gap-1 truncate text-[11px] text-slate-500'>
                <Truck className='size-3 shrink-0 text-slate-400' aria-hidden />
                <span className='font-mono'>{route.vehiclePlate}</span>
                <span className='text-slate-300'>·</span>
                <UserRound className='size-3 shrink-0 text-slate-400' aria-hidden />
                {route.courierName ?? 'Kurye atanmadı'}
              </p>
            </button>
          </div>
          <div className='mt-0.5 flex shrink-0 items-center gap-1'>
            <RouteColorPicker
              color={route.color}
              usedColors={usedColors}
              onChange={onChangeColor}
            />
            <button
              type='button'
              onClick={onOpen}
              className='inline-flex rounded-md p-0.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600'
              aria-label={`${route.label} detayını aç`}
            >
              <ChevronRight
                className='size-4 transition-transform group-hover:translate-x-0.5'
                aria-hidden
              />
            </button>
          </div>
        </div>

        <button type='button' onClick={onOpen} className='w-full text-left'>
          <div className='mb-2.5 grid grid-cols-2 gap-1.5'>
            <RouteCardMetric label='Sipariş' value={String(route.orderCount)} />
            <RouteCardMetric label='Durak' value={String(route.stopCount)} />
            <RouteCardMetric label='Mesafe' value={`${route.distanceKm} km`} />
            <RouteCardMetric label='Süre' value={`${route.durationMin} dk`} />
          </div>

          <div className='space-y-2'>
            <div>
              <div className='mb-1 flex items-center justify-between gap-2 text-[10px] text-slate-500'>
                <span>İlerleme</span>
                <span className='font-semibold tabular-nums text-slate-700'>
                  {route.completedStopCount}/{route.stopCount} durak · %{progressPct}
                </span>
              </div>
              <div className='h-1 overflow-hidden rounded-full bg-slate-100'>
                <div
                  className='h-full rounded-full transition-all'
                  style={{ width: `${progressPct}%`, backgroundColor: route.color }}
                />
              </div>
            </div>

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
                  style={{
                    width: `${Math.min(capacityPct, 100)}%`,
                    backgroundColor: capacityTone,
                  }}
                />
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

export function RouteListPanel({
  routes,
  orders,
  dateScope,
  dateScopeCounts,
  onDateScopeChange,
  selectedRouteIds,
  onToggleRoute,
  onChangeRouteColor,
  detailRouteId,
  onOpenDetail,
  onCloseDetail,
  onRemoveOrder,
  onReorderStops,
}: Props) {
  const usedColors = routes.map((route) => route.color)
  const detailRoute =
    detailRouteId != null
      ? routes.find((route) => route.id === detailRouteId) ?? null
      : null

  if (detailRoute) {
    return (
      <div className='flex h-full min-h-0 flex-col overflow-hidden'>
        <div className='relative flex shrink-0 items-center justify-between gap-2 border-b border-border bg-white px-3 py-2 sm:px-4'>
          <button
            type='button'
            onClick={onCloseDetail}
            className='relative z-10 inline-flex shrink-0 items-center gap-1 rounded-lg px-1.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900'
          >
            <ArrowLeft className='size-3.5' aria-hidden />
            Aktif Rota Listesine Dön
          </button>
          <h2 className='pointer-events-none absolute inset-x-0 text-center text-sm font-semibold tracking-tight text-slate-900'>
            Aktif {detailRoute.label} Rota Detay
          </h2>
          <Link
            href={ARF_ROUTES.lastmile.planning.routeDetail(detailRoute.id)}
            className='relative z-10 inline-flex shrink-0 items-center gap-1 rounded-lg px-1.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900'
          >
            Rota Detay Sayfasında görüntüle
            <ArrowRight className='size-3.5' aria-hidden />
          </Link>
        </div>
        <div className='min-h-0 flex-1 overflow-hidden'>
          <ActiveRouteDetail
            route={detailRoute}
            orders={orders}
            usedColors={usedColors}
            onChangeColor={(color) => onChangeRouteColor(detailRoute.id, color)}
            onRemoveOrder={
              onRemoveOrder
                ? (orderId) => onRemoveOrder(detailRoute.id, orderId)
                : undefined
            }
            onReorderOperationalStops={
              onReorderStops
                ? (orderedStopIds) => onReorderStops(detailRoute.id, orderedStopIds)
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
        <div className='mb-2.5 flex min-w-0 items-center justify-between gap-2'>
          <div className='flex min-w-0 items-center gap-2.5'>
            <span className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border/50'>
              <Route className='size-4 text-emerald-600' aria-hidden />
            </span>
            <h2 className='flex min-w-0 items-center gap-1.5 text-sm font-semibold leading-none tracking-tight text-slate-900'>
              <span>Aktif Rota Listesi</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type='button'
                    className='inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40'
                    aria-label={ROUTE_LIST_TOOLTIP}
                  >
                    <Info className='size-3.5' aria-hidden />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side='top'
                  sideOffset={6}
                  className='max-w-xs text-left leading-relaxed'
                >
                  {ROUTE_LIST_TOOLTIP}
                </TooltipContent>
              </Tooltip>
            </h2>
          </div>
          <Link
            href={ARF_ROUTES.lastmile.planning.routes}
            className='inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900'
          >
            Tümünü gör
            <ExternalLink className='size-3' aria-hidden />
          </Link>
        </div>
        <RouteListTotals routes={routes} />
        <div
          className='mt-2.5 flex w-fit items-center gap-0.5 rounded-lg bg-white p-0.5 ring-1 ring-border/60'
          role='tablist'
          aria-label='Aktif rota zaman dilimi'
        >
          {(
            [
              {
                id: 'today' as const,
                label: 'Bugün',
                count: dateScopeCounts.today,
              },
              {
                id: 'carryover' as const,
                label: 'Geçmişten kalan',
                count: dateScopeCounts.carryover,
              },
            ] as const
          ).map((item) => {
            const active = dateScope === item.id
            return (
              <button
                key={item.id}
                type='button'
                role='tab'
                aria-selected={active}
                onClick={() => onDateScopeChange(item.id)}
                className={cn(
                  'inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-colors',
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {item.label}
                <span
                  className={cn(
                    'tabular-nums',
                    active ? 'text-white/80' : 'text-slate-400'
                  )}
                >
                  {item.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className='shrink-0 px-4 py-3'>
        {routes.length > 0 ? (
          <div className='flex gap-3 overflow-x-auto overscroll-contain pb-0.5'>
            {routes.map((route) => (
              <ActiveRouteCard
                key={route.id}
                route={route}
                selected={selectedRouteIds.has(route.id)}
                usedColors={usedColors}
                onToggle={() => onToggleRoute(route.id)}
                onOpen={() => onOpenDetail(route.id)}
                onChangeColor={(color) => onChangeRouteColor(route.id, color)}
              />
            ))}
          </div>
        ) : (
          <p className='rounded-lg border border-dashed border-border/70 bg-slate-50/50 px-3 py-4 text-center text-xs text-slate-500'>
            {dateScope === 'today'
              ? 'Bugün için aktif rota yok.'
              : 'Geçmişten kalan aktif rota yok.'}
          </p>
        )}
      </div>
    </div>
  )
}
