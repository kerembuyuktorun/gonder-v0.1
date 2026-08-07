'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  ChevronDown,
  ChevronsUpDown,
  Clock3,
  Gauge,
  GripVertical,
  Info,
  MapPin,
  MapPinned,
  Navigation,
  Package,
  PackageOpen,
  Box,
  Store,
  Trash2,
  Truck,
  UserRound,
  Warehouse,
  Weight,
} from 'lucide-react'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { MetaChip } from '../../../orders/_components/meta-chip'
import { getOrderTypeVisual } from '../../../orders/_components/order-type-badge'
import { getRouteTypeVisual } from '../../../orders/_components/route-type-badge'
import {
  formatOrderCardPackageSummary,
  formatPriority,
  formatTaskDuration,
  getOrderRouteEndpointKinds,
} from '../../../orders/_lib/query-orders'
import type {
  LatLng,
  OptimizedRoute,
  OptimizedRouteStop,
  OrchestratorOrder,
} from '../_types/orchestrator'
import { RouteColorPicker } from './route-color-picker'

type Props = {
  route: OptimizedRoute
  orders: OrchestratorOrder[]
  /** Aktif rota detayında tamamlanan durak id'leri — yalnızca Tamamlandı rozeti */
  completedStopIds?: ReadonlySet<string>
  /** Aktif rota detayında renk değiştirme */
  usedColors?: string[]
  onChangeColor?: (color: string) => void
  /** Siparişi rotadan çıkar */
  onRemoveOrder?: (orderId: string) => void
  /** Verilirse yalnızca bu id'ler sürüklenir; yoksa tüm operasyonel duraklar */
  draggableStopIds?: ReadonlySet<string>
  onReorderOperationalStops?: (orderedStopIds: string[]) => void
  /** Rota detay sayfası — araç/metrik özet şeridini gizle */
  hideSummary?: boolean
}

type StopLegInfo = {
  distanceKm: number
  durationMin: number
  cumulativeKm: number
}

function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function estimateLegDurationMin(
  distanceKm: number,
  stop: OptimizedRouteStop
): number {
  const serviceMin =
    stop.kind === 'depot_start' || stop.kind === 'depot_end'
      ? 5
      : 8 + Math.max(stop.orderIds.length, 1) * 2
  return Math.max(3, Math.round(distanceKm * 2.8 + serviceMin))
}

function buildStopLegs(stops: OptimizedRouteStop[]): Map<string, StopLegInfo> {
  const legs = new Map<string, StopLegInfo>()
  let cumulative = 0

  for (let index = 1; index < stops.length; index += 1) {
    const prev = stops[index - 1]
    const curr = stops[index]
    const distanceKm =
      curr.legDistanceKm != null && curr.legDistanceKm > 0
        ? curr.legDistanceKm
        : haversineKm(prev.position, curr.position)
    cumulative += distanceKm
    legs.set(curr.id, {
      distanceKm: Math.round(distanceKm * 10) / 10,
      durationMin:
        curr.legDurationMin != null && curr.legDurationMin > 0
          ? curr.legDurationMin
          : estimateLegDurationMin(distanceKm, curr),
      cumulativeKm: Math.round(cumulative * 10) / 10,
    })
  }

  return legs
}

function RouteMetricCard({
  icon: Icon,
  label,
  value,
  accent,
  progress,
}: {
  icon: typeof Navigation
  label: string
  value: string
  accent?: string
  progress?: number
}) {
  return (
    <div className='min-w-0 flex-1 rounded-lg bg-white/90 px-2 py-1.5 ring-1 ring-border/50'>
      <div className='mb-0.5 flex min-w-0 items-center gap-1'>
        <Icon
          className='size-3 shrink-0 text-slate-400'
          style={accent ? { color: accent } : undefined}
          aria-hidden
        />
        <span className='truncate text-[10px] font-medium text-muted-foreground'>{label}</span>
      </div>
      <p className='truncate text-xs font-semibold tabular-nums text-slate-900'>{value}</p>
      {progress != null ? (
        <div className='mt-1 h-0.5 overflow-hidden rounded-full bg-slate-100'>
          <div
            className='h-full rounded-full transition-all'
            style={{
              width: `${Math.min(Math.max(progress, 0), 100)}%`,
              backgroundColor: accent ?? '#0284c7',
            }}
          />
        </div>
      ) : null}
    </div>
  )
}

function RouteDetailSummary({
  route,
  operationalStops,
  capacityPct,
  usedColors,
  onChangeColor,
}: {
  route: OptimizedRoute
  operationalStops: number
  capacityPct: number
  usedColors?: string[]
  onChangeColor?: (color: string) => void
}) {
  return (
    <div className='overflow-hidden rounded-xl border border-border/80 bg-linear-to-br from-slate-50/90 via-white to-white shadow-sm'>
      <div className='flex min-w-0'>
        <div
          className='w-1 shrink-0'
          style={{ backgroundColor: route.color }}
          aria-hidden
        />
        <div className='min-w-0 flex-1 p-3'>
          <div className='mb-3 flex flex-wrap items-start justify-between gap-2'>
            <div className='flex min-w-0 flex-1 flex-wrap items-center gap-2'>
              <span className='inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-border/60'>
                <Truck className='size-3.5 shrink-0 text-slate-500' aria-hidden />
                {route.vehiclePlate}
              </span>
              <span className='inline-flex min-w-0 items-center gap-1 rounded-lg bg-white/80 px-2 py-1 text-xs text-slate-600 ring-1 ring-border/50'>
                <UserRound className='size-3 shrink-0 text-slate-400' aria-hidden />
                <span className='truncate'>{route.courierName ?? 'Kurye atanmadı'}</span>
              </span>
            </div>
            {onChangeColor && usedColors ? (
              <RouteColorPicker
                color={route.color}
                usedColors={usedColors}
                onChange={onChangeColor}
                className='size-7'
              />
            ) : (
              <span
                className='inline-flex size-8 shrink-0 items-center justify-center rounded-full ring-2 ring-white shadow-sm'
                style={{ backgroundColor: `${route.color}22`, color: route.color }}
                title='Rota rengi'
                aria-hidden
              >
                <MapPinned className='size-3.5' />
              </span>
            )}
          </div>

          <div className='flex min-w-0 gap-1.5'>
            <RouteMetricCard
              icon={MapPinned}
              label='Nokta'
              value={String(route.stops.length)}
              accent={route.color}
            />
            <RouteMetricCard
              icon={MapPin}
              label='Durak'
              value={String(operationalStops)}
              accent={route.color}
            />
            <RouteMetricCard
              icon={Package}
              label='Sipariş'
              value={String(route.orderIds.length)}
              accent={route.color}
            />
            <RouteMetricCard
              icon={Gauge}
              label='Kapasite'
              value={`%${capacityPct}`}
              accent={route.color}
              progress={capacityPct}
            />
            <RouteMetricCard
              icon={Navigation}
              label='Mesafe'
              value={`${route.distanceKm} km`}
              accent={route.color}
            />
            <RouteMetricCard
              icon={Clock3}
              label='Süre'
              value={`${route.durationMin} dk`}
              accent={route.color}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StopKindBadge({ kind }: { kind: OptimizedRouteStop['kind'] }) {
  if (kind === 'depot_start') {
    return (
      <Badge variant='outline' className='h-5 rounded-md px-1.5 text-[10px] font-medium'>
        Başlangıç
      </Badge>
    )
  }
  if (kind === 'depot_end') {
    return (
      <Badge variant='outline' className='h-5 rounded-md px-1.5 text-[10px] font-medium'>
        Dönüş
      </Badge>
    )
  }
  if (kind === 'pickup') {
    return (
      <Badge className='h-5 rounded-md border-0 bg-sky-100 px-1.5 text-[10px] font-medium text-sky-800 hover:bg-sky-100'>
        Alım
      </Badge>
    )
  }
  return (
    <Badge className='h-5 rounded-md border-0 bg-emerald-100 px-1.5 text-[10px] font-medium text-emerald-800 hover:bg-emerald-100'>
      Teslim
    </Badge>
  )
}

function StopLegMetrics({
  leg,
  trailing,
  eta,
}: {
  leg: StopLegInfo | undefined
  trailing?: React.ReactNode
  eta?: string
}) {
  if (!leg && !trailing && !eta) return null

  return (
    <div className='mb-2 flex min-w-0 items-center gap-2'>
      {leg || eta ? (
        <div className='flex min-w-0 flex-1 flex-wrap items-center gap-1.5'>
          {eta ? (
            <span className='inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium tabular-nums text-slate-600'>
              <Clock3 className='size-3 shrink-0 text-slate-400' aria-hidden />
              {eta}
            </span>
          ) : null}
          {leg ? (
            <>
              <span className='inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium tabular-nums text-slate-600'>
                <Navigation className='size-3 shrink-0 text-slate-400' aria-hidden />
                {leg.distanceKm} km
              </span>
              <span className='inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium tabular-nums text-slate-600'>
                <Clock3 className='size-3 shrink-0 text-slate-400' aria-hidden />
                ~{leg.durationMin} dk
              </span>
              <span className='text-[10px] tabular-nums text-muted-foreground'>
                Kümülatif {leg.cumulativeKm} km
              </span>
            </>
          ) : null}
        </div>
      ) : (
        <div className='min-w-0 flex-1' />
      )}
      {trailing ? <div className='shrink-0'>{trailing}</div> : null}
    </div>
  )
}

function StopDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-px bg-linear-to-r from-transparent via-border/80 to-transparent', className)}
      aria-hidden
    />
  )
}

function StopLegMetricPill({
  icon: Icon,
  children,
}: {
  icon: typeof Navigation
  children: React.ReactNode
}) {
  return (
    <span className='inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium tabular-nums text-slate-600 ring-1 ring-slate-200/70'>
      <Icon className='size-3 shrink-0 text-slate-400' aria-hidden />
      {children}
    </span>
  )
}

function OrderTypeRouteLine({ order }: { order: OrchestratorOrder }) {
  const orderType = getOrderTypeVisual(order.siparis_tipi)
  const routeType = getRouteTypeVisual(order.rota_tipi)
  const OrderIcon = orderType.icon
  const RouteIcon = routeType.icon

  return (
    <div className='inline-flex flex-wrap items-center gap-1'>
      <span className='inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200/70'>
        <OrderIcon className='size-3 shrink-0 text-slate-400' aria-hidden />
        {orderType.label}
      </span>
      <span className='inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200/70'>
        <RouteIcon className='size-3 shrink-0 text-slate-400' aria-hidden />
        {routeType.label}
      </span>
    </div>
  )
}

function resolveStopAddressTitle(
  stop: OptimizedRouteStop,
  stopOrders: OrchestratorOrder[]
): string {
  if (stopOrders.length === 1) {
    const order = stopOrders[0]!
    return stop.kind === 'pickup' ? order.alis_noktasi : order.varis_noktasi
  }
  return stop.locationLabel ?? stop.label
}

function StopLocationLines({
  stop,
  stopOrders,
}: {
  stop: OptimizedRouteStop
  stopOrders: OrchestratorOrder[]
}) {
  const locationTitle = resolveStopAddressTitle(stop, stopOrders)
  const openAddresses = getStopOpenAddressLines(stop, stopOrders)
  const endpointKind =
    stopOrders[0] != null
      ? stop.kind === 'pickup'
        ? getOrderRouteEndpointKinds(stopOrders[0]).from
        : getOrderRouteEndpointKinds(stopOrders[0]).to
      : 'adres'
  const EndpointIcon =
    endpointKind === 'tesis' ? Warehouse : endpointKind === 'gel_al' ? Store : MapPin
  const tone =
    stop.kind === 'pickup'
      ? 'border-sky-100/80 bg-sky-50/30'
      : 'border-emerald-100/80 bg-emerald-50/30'

  return (
    <div className={cn('flex min-w-0 gap-2.5 rounded-lg border px-2.5 py-2', tone)}>
      <span
        className={cn(
          'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border/40',
          stop.kind === 'pickup' ? 'text-sky-600' : 'text-emerald-600'
        )}
      >
        <EndpointIcon className='size-3.5' aria-hidden />
      </span>
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-semibold leading-snug text-slate-900'>{locationTitle}</p>
        {openAddresses.map((address) => (
          <p key={address} className='mt-0.5 text-[11px] leading-relaxed text-slate-600'>
            {address}
          </p>
        ))}
      </div>
    </div>
  )
}

function StopContactLine({
  name,
  phone,
}: {
  name: string
  phone: string
}) {
  return (
    <div className='flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-slate-50/80 px-2.5 py-2 text-[11px] ring-1 ring-slate-200/60'>
      <span className='inline-flex min-w-0 items-center gap-1.5'>
        <UserRound className='size-3 shrink-0 text-slate-400' aria-hidden />
        <span className='shrink-0 text-slate-400'>Muhatap Bilgileri</span>
      </span>
      <span className='truncate font-medium text-slate-800'>{name}</span>
      <span className='text-slate-300' aria-hidden>
        |
      </span>
      <span className='tabular-nums text-slate-600'>{phone}</span>
    </div>
  )
}

function OrderOperationMetrics({ order }: { order: OrchestratorOrder }) {
  const priorityScore = order.oncelik_puani
  const priorityClass =
    priorityScore >= 90
      ? 'font-semibold text-rose-600'
      : priorityScore >= 70
        ? 'font-medium text-amber-700'
        : 'font-medium text-slate-700'
  const metricIconClass = 'size-3 shrink-0 text-slate-400'

  const items = [
    {
      key: 'priority',
      node: (
        <span className='inline-flex items-center gap-1'>
          <Gauge className={metricIconClass} aria-hidden />
          <span className={priorityClass}>{formatPriority(order.oncelik_puani)}</span>
        </span>
      ),
    },
    {
      key: 'duration',
      node: (
        <span className='inline-flex items-center gap-1'>
          <Clock3 className={metricIconClass} aria-hidden />
          <span>{formatTaskDuration(order.gorev_suresi_dk)}</span>
        </span>
      ),
    },
    {
      key: 'package',
      node: (
        <span className='inline-flex items-center gap-1'>
          <Package className={metricIconClass} aria-hidden />
          {formatOrderCardPackageSummary(order)}
        </span>
      ),
    },
    {
      key: 'volume',
      node: (
        <span className='inline-flex items-center gap-1'>
          <Box className={metricIconClass} aria-hidden />
          <span>{order.toplam_hacim} hacim</span>
        </span>
      ),
    },
    {
      key: 'weight',
      node: (
        <span className='inline-flex items-center gap-1'>
          <Weight className={metricIconClass} aria-hidden />
          <span>{order.agirlik_kg} kg</span>
        </span>
      ),
    },
  ]

  return (
    <div className='flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-slate-50/80 px-2.5 py-2 text-[11px] text-slate-600 ring-1 ring-slate-200/60'>
      {items.map((item, index) => (
        <span key={item.key} className='inline-flex items-center gap-2'>
          {index > 0 ? <span className='h-3 w-px bg-slate-200' aria-hidden /> : null}
          {item.node}
        </span>
      ))}
    </div>
  )
}

function StopAggregateSummary({ orders }: { orders: OrchestratorOrder[] }) {
  const totalPackages = orders.reduce((sum, order) => sum + order.paket_sayisi, 0)
  const totalHacim = orders.reduce((sum, order) => sum + order.toplam_hacim, 0)
  const totalKg = orders.reduce((sum, order) => sum + order.agirlik_kg, 0)
  const requirements = Array.from(new Set(orders.flatMap((order) => order.gereksinimler)))

  return (
    <div className='border-t border-border/60 pt-2.5'>
      <div className='mb-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] tabular-nums text-slate-600'>
        <span>{orders.length} sipariş</span>
        <span>{totalPackages} paket</span>
        <span>{Math.round(totalHacim * 1000) / 1000} hacim</span>
        <span>{Math.round(totalKg * 10) / 10} kg</span>
      </div>
      {requirements.length > 0 ? (
        <div className='flex flex-wrap gap-1'>
          {requirements.map((req) => (
            <MetaChip key={req} variant='requirement'>
              {req}
            </MetaChip>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function StopTimeWindow({
  stop,
  order,
}: {
  stop: OptimizedRouteStop
  order: OrchestratorOrder
}) {
  if (stop.kind === 'pickup') {
    return (
      <div className='flex min-w-0 items-center gap-2 rounded-lg border border-sky-200/70 bg-sky-50/50 px-2.5 py-2 text-[11px] text-sky-950 ring-1 ring-sky-100/80'>
        <span className='flex size-7 shrink-0 items-center justify-center rounded-md bg-white text-sky-600 shadow-sm ring-1 ring-sky-100'>
          <PackageOpen className='size-3.5' aria-hidden />
        </span>
        <div className='min-w-0'>
          <p className='text-[10px] font-medium uppercase tracking-wide text-sky-700/80'>
            Alım penceresi
          </p>
          <p className='truncate tabular-nums font-medium'>{order.alim_zaman_penceresi}</p>
        </div>
      </div>
    )
  }

  if (stop.kind === 'delivery') {
    return (
      <div className='flex min-w-0 items-center gap-2 rounded-lg border border-emerald-200/70 bg-emerald-50/50 px-2.5 py-2 text-[11px] text-emerald-950 ring-1 ring-emerald-100/80'>
        <span className='flex size-7 shrink-0 items-center justify-center rounded-md bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100'>
          <Clock3 className='size-3.5' aria-hidden />
        </span>
        <div className='min-w-0'>
          <p className='text-[10px] font-medium uppercase tracking-wide text-emerald-700/80'>
            Teslim penceresi
          </p>
          <p className='truncate tabular-nums font-medium'>{order.teslim_zaman_penceresi}</p>
        </div>
      </div>
    )
  }

  return null
}

function getStopOpenAddressLines(
  stop: OptimizedRouteStop,
  stopOrders: OrchestratorOrder[]
): string[] {
  if (stop.kind !== 'pickup' && stop.kind !== 'delivery') return []

  const addresses = stopOrders
    .map((order) =>
      stop.kind === 'pickup' ? order.alis_acik_adres.trim() : order.varis_acik_adres.trim()
    )
    .filter(Boolean)

  return Array.from(new Set(addresses))
}

function OrderRequirementBadges({ order }: { order: OrchestratorOrder }) {
  if (order.gereksinimler.length === 0) return null

  return (
    <div className='flex flex-wrap gap-1'>
      {order.gereksinimler.map((req) => (
        <MetaChip key={req} variant='requirement'>
          {req}
        </MetaChip>
      ))}
    </div>
  )
}

function RemoveOrderButton({
  onRemove,
  label,
}: {
  onRemove: () => void
  label: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-7 shrink-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700'
          aria-label={label}
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
        >
          <Trash2 className='size-3.5' aria-hidden />
        </Button>
      </TooltipTrigger>
      <TooltipContent side='top' sideOffset={6} className='max-w-[220px] text-left leading-relaxed'>
        Siparişi rotadan çıkarır (alım ve teslim birlikte)
      </TooltipContent>
    </Tooltip>
  )
}

type ExpandAllSignal = {
  version: number
  expanded: boolean
}

function useSyncedCardExpanded(signal: ExpandAllSignal | undefined) {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!signal) return
    setExpanded(signal.expanded)
  }, [signal?.version, signal?.expanded])

  return [expanded, setExpanded] as const
}

function StopCardExpandToggle({
  expanded,
  onToggle,
}: {
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <Button
      type='button'
      variant='outline'
      size='icon'
      className={cn(
        'size-8 shrink-0 justify-self-center border-slate-300 bg-white text-slate-700 shadow-sm',
        'hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900',
        expanded && 'border-slate-400 bg-slate-50'
      )}
      aria-expanded={expanded}
      aria-label={expanded ? 'Durak detayını gizle' : 'Durak detayını göster'}
      onClick={onToggle}
    >
      <ChevronDown
        className={cn(
          'size-4 stroke-[2.5] transition-transform duration-200',
          !expanded && '-rotate-90'
        )}
        aria-hidden
      />
    </Button>
  )
}

function SingleOrderStopPanel({
  stop,
  order,
  stopOrders,
  leg,
  onRemove,
  expandAllSignal,
}: {
  stop: OptimizedRouteStop
  order: OrchestratorOrder
  stopOrders: OrchestratorOrder[]
  leg: StopLegInfo | undefined
  onRemove?: () => void
  expandAllSignal?: ExpandAllSignal
}) {
  const [expanded, setExpanded] = useSyncedCardExpanded(expandAllSignal)
  const contactName = stop.kind === 'pickup' ? order.alis_muhatabi : order.varis_muhatabi
  const contactPhone = stop.kind === 'pickup' ? order.alis_telefon : order.varis_telefon
  const isPickup = stop.kind === 'pickup'

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm',
        isPickup ? 'ring-1 ring-sky-100/60' : 'ring-1 ring-emerald-100/60'
      )}
    >
      <div
        className={cn(
          'grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 px-3 py-2.5',
          expanded && 'border-b border-border/50',
          isPickup ? 'bg-sky-50/35' : 'bg-emerald-50/35'
        )}
      >
        <div className='flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1'>
          <Link
            href={ARF_ROUTES.lastmile.orders.detail(order.id)}
            className='shrink-0 font-mono text-xs font-semibold tracking-tight text-sky-800 transition-colors hover:text-sky-900 hover:underline'
            onClick={(e) => e.stopPropagation()}
          >
            {order.takip_no}
          </Link>
          <span className='shrink-0 text-slate-300' aria-hidden>
            |
          </span>
          <span className='min-w-0 truncate text-xs font-medium text-slate-800'>{order.musteri}</span>
          <span className='shrink-0 text-slate-300' aria-hidden>
            |
          </span>
          <OrderTypeRouteLine order={order} />
        </div>
        <StopCardExpandToggle
          expanded={expanded}
          onToggle={() => setExpanded((prev) => !prev)}
        />
        <div className='flex min-w-0 items-center justify-end gap-1'>
          {stop.scheduledTime ? (
            <StopLegMetricPill icon={Clock3}>{stop.scheduledTime}</StopLegMetricPill>
          ) : null}
          {leg ? (
            <div className='flex flex-wrap items-center justify-end gap-1.5 text-right'>
              <StopLegMetricPill icon={Navigation}>{leg.distanceKm} km</StopLegMetricPill>
              <StopLegMetricPill icon={Clock3}>~{leg.durationMin} dk</StopLegMetricPill>
              <span className='text-[10px] tabular-nums text-slate-500'>
                Kümülatif {leg.cumulativeKm} km
              </span>
            </div>
          ) : null}
          {onRemove ? (
            <RemoveOrderButton
              onRemove={onRemove}
              label={`${order.takip_no} siparişini rotadan çıkar`}
            />
          ) : null}
        </div>
      </div>

      {expanded ? (
        <>
          <StopDivider className='mx-3' />
          <div className='space-y-2.5 px-3 pb-2 pt-3'>
            <StopTimeWindow stop={stop} order={order} />
            <StopLocationLines stop={stop} stopOrders={stopOrders} />
            <StopContactLine name={contactName} phone={contactPhone} />
            <OrderOperationMetrics order={order} />
            <OrderRequirementBadges order={order} />
          </div>
        </>
      ) : null}
    </div>
  )
}

function RouteStopOrderDetail({
  order,
  stop,
  withDivider = false,
  showIdentity = true,
  onRemove,
}: {
  order: OrchestratorOrder
  stop: OptimizedRouteStop
  withDivider?: boolean
  showIdentity?: boolean
  onRemove?: () => void
}) {
  const orderType = getOrderTypeVisual(order.siparis_tipi)
  const routeType = getRouteTypeVisual(order.rota_tipi)
  const OrderIcon = orderType.icon
  const RouteIcon = routeType.icon
  const priorityScore = order.oncelik_puani
  const priorityClass =
    priorityScore >= 90
      ? 'font-semibold text-rose-600'
      : priorityScore >= 70
        ? 'font-medium text-amber-700'
        : 'font-medium text-slate-700'

  const contactName =
    stop.kind === 'pickup' ? order.alis_muhatabi : order.varis_muhatabi
  const contactPhone =
    stop.kind === 'pickup' ? order.alis_telefon : order.varis_telefon

  return (
    <div className={cn(withDivider && 'border-t border-border/60 pt-2.5')}>
      {showIdentity ? (
        <div className='mb-2 flex items-start justify-between gap-2'>
          <Link
            href={ARF_ROUTES.lastmile.orders.detail(order.id)}
            className='text-xs font-semibold text-sky-700 hover:underline'
            onClick={(e) => e.stopPropagation()}
          >
            {order.takip_no}
          </Link>
          {onRemove ? (
            <RemoveOrderButton
              onRemove={onRemove}
              label={`${order.takip_no} siparişini rotadan çıkar`}
            />
          ) : null}
        </div>
      ) : onRemove ? (
        <div className='mb-2 flex justify-end'>
          <RemoveOrderButton
            onRemove={onRemove}
            label={`${order.takip_no} siparişini rotadan çıkar`}
          />
        </div>
      ) : null}

      <p className={cn('mb-2 flex flex-wrap items-center gap-x-1.5 text-[11px] text-slate-500', !showIdentity && 'mt-0')}>
        <span className='inline-flex items-center gap-1'>
          <OrderIcon className='size-3 shrink-0 text-slate-400' aria-hidden />
          {orderType.label}
        </span>
        <span className='text-slate-300' aria-hidden>
          ·
        </span>
        <span className='inline-flex items-center gap-1'>
          <RouteIcon className='size-3 shrink-0 text-slate-400' aria-hidden />
          {routeType.label}
        </span>
      </p>

      <div className='mb-2 space-y-1.5'>
        <StopTimeWindow stop={stop} order={order} />
        <StopContactLine name={contactName} phone={contactPhone} />
      </div>

      <p className='mb-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500'>
        <span className='inline-flex items-center gap-1'>
          <Gauge className='size-3 shrink-0 text-slate-400' aria-hidden />
          <span className={priorityClass}>{formatPriority(order.oncelik_puani)}</span>
        </span>
        <span className='text-slate-300' aria-hidden>
          ·
        </span>
        <span className='inline-flex items-center gap-1'>
          <Clock3 className='size-3 shrink-0 text-slate-400' aria-hidden />
          <span>{formatTaskDuration(order.gorev_suresi_dk)}</span>
        </span>
        <span className='text-slate-300' aria-hidden>
          ·
        </span>
        <span className='inline-flex items-center gap-1'>
          <Package className='size-3 shrink-0 text-slate-400' aria-hidden />
          {formatOrderCardPackageSummary(order)}
        </span>
        <span className='text-slate-300' aria-hidden>
          ·
        </span>
        <span className='inline-flex items-center gap-1'>
          <Box className='size-3 shrink-0 text-slate-400' aria-hidden />
          <span>{order.toplam_hacim} hacim</span>
        </span>
        <span className='text-slate-300' aria-hidden>
          ·
        </span>
        <span className='inline-flex items-center gap-1'>
          <Weight className='size-3 shrink-0 text-slate-400' aria-hidden />
          <span>{order.agirlik_kg} kg</span>
        </span>
      </p>

      {order.gereksinimler.length > 0 ? (
        <div className='flex flex-wrap gap-1'>
          {order.gereksinimler.map((req) => (
            <MetaChip key={req} variant='requirement'>
              {req}
            </MetaChip>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function LocationTooltipIcon({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          className='inline-flex shrink-0 rounded-sm text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40'
          aria-label={text}
        >
          <Info className='size-3.5' aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent side='top' sideOffset={6} className='max-w-xs text-left leading-relaxed'>
        {text}
      </TooltipContent>
    </Tooltip>
  )
}

function StopLegMetricsRow({
  leg,
  eta,
}: {
  leg: StopLegInfo | undefined
  eta?: string
}) {
  if (!leg && !eta) return <div className='min-w-0 flex-1' />

  return (
    <div className='flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5 text-right'>
      {eta ? (
        <StopLegMetricPill icon={Clock3}>{eta}</StopLegMetricPill>
      ) : null}
      {leg ? (
        <>
          <StopLegMetricPill icon={Navigation}>{leg.distanceKm} km</StopLegMetricPill>
          <StopLegMetricPill icon={Clock3}>~{leg.durationMin} dk</StopLegMetricPill>
          <span className='text-[10px] tabular-nums text-slate-500'>
            Kümülatif {leg.cumulativeKm} km
          </span>
        </>
      ) : null}
    </div>
  )
}

function AnchorStopLocationBlock({
  locationLabel,
  openAddress,
  hint,
  tooltip,
  tone,
}: {
  locationLabel?: string
  openAddress?: string
  hint?: string
  tooltip?: string
  tone: 'sky' | 'slate'
}) {
  const toneClass =
    tone === 'sky'
      ? 'border-sky-100/80 bg-sky-50/30'
      : 'border-slate-200/70 bg-slate-50/30'
  const iconClass = tone === 'sky' ? 'text-sky-600' : 'text-slate-600'

  if (!locationLabel && !openAddress && !hint) return null

  return (
    <div className={cn('flex min-w-0 gap-2.5 rounded-lg border px-2.5 py-2', toneClass)}>
      <span
        className={cn(
          'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border/40',
          iconClass
        )}
      >
        <MapPinned className='size-3.5' aria-hidden />
      </span>
      <div className='min-w-0 flex-1'>
        {locationLabel ? (
          <p className='flex items-center gap-1.5 text-sm font-semibold leading-snug text-slate-900'>
            <span>{locationLabel}</span>
            {tooltip ? <LocationTooltipIcon text={tooltip} /> : null}
          </p>
        ) : null}
        {openAddress ? (
          <p
            className={cn(
              'text-[11px] leading-relaxed text-slate-600',
              locationLabel && 'mt-0.5'
            )}
          >
            {openAddress}
          </p>
        ) : null}
        {hint ? (
          <p
            className={cn(
              'text-[11px] leading-relaxed text-slate-600',
              (locationLabel || openAddress) && 'mt-0.5'
            )}
          >
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function DepotStartTimeBlock({ scheduledTime }: { scheduledTime: string }) {
  return (
    <div className='flex min-w-0 items-center gap-2 rounded-lg border border-sky-200/70 bg-sky-50/50 px-2.5 py-2 text-[11px] text-sky-950 ring-1 ring-sky-100/80'>
      <span className='flex size-7 shrink-0 items-center justify-center rounded-md bg-white text-sky-600 shadow-sm ring-1 ring-sky-100'>
        <Clock3 className='size-3.5' aria-hidden />
      </span>
      <div className='min-w-0'>
        <p className='text-[10px] font-medium uppercase tracking-wide text-sky-700/80'>
          Başlangıç zamanı
        </p>
        <p className='truncate tabular-nums font-medium'>{scheduledTime}</p>
      </div>
    </div>
  )
}

function DepotStartStopPanel({
  stop,
  leg,
  expandAllSignal,
}: {
  stop: OptimizedRouteStop
  leg: StopLegInfo | undefined
  expandAllSignal?: ExpandAllSignal
}) {
  const [expanded, setExpanded] = useSyncedCardExpanded(expandAllSignal)

  return (
    <div className='overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm ring-1 ring-sky-100/60'>
      <div
        className={cn(
          'grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 bg-sky-50/35 px-3 py-2.5',
          expanded && 'border-b border-border/50'
        )}
      >
        <div className='flex min-w-0 items-center gap-2'>
          <span className='text-xs font-semibold text-slate-800'>{stop.label}</span>
        </div>
        <StopCardExpandToggle
          expanded={expanded}
          onToggle={() => setExpanded((prev) => !prev)}
        />
        <div className='flex min-w-0 items-center justify-end'>
          <StopLegMetricsRow leg={leg} eta={stop.scheduledTime} />
        </div>
      </div>

      {expanded ? (
        <>
          <StopDivider className='mx-3' />
          <div className='space-y-2.5 px-3 pb-2 pt-3'>
            {stop.scheduledTime ? (
              <DepotStartTimeBlock scheduledTime={stop.scheduledTime} />
            ) : null}
            <AnchorStopLocationBlock
              locationLabel={stop.locationLabel}
              openAddress={stop.openAddress}
              hint={stop.locationHint}
              tooltip={stop.locationTooltip}
              tone='sky'
            />
          </div>
        </>
      ) : null}
    </div>
  )
}

function ReturnStopPanel({
  stop,
  leg,
  expandAllSignal,
}: {
  stop: OptimizedRouteStop
  leg: StopLegInfo | undefined
  expandAllSignal?: ExpandAllSignal
}) {
  const [expanded, setExpanded] = useSyncedCardExpanded(expandAllSignal)

  return (
    <div className='overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm ring-1 ring-slate-100/60'>
      <div
        className={cn(
          'grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 bg-slate-50/35 px-3 py-2.5',
          expanded && 'border-b border-border/50'
        )}
      >
        <div className='flex min-w-0 items-center gap-2'>
          <span className='text-xs font-semibold text-slate-800'>{stop.label}</span>
        </div>
        <StopCardExpandToggle
          expanded={expanded}
          onToggle={() => setExpanded((prev) => !prev)}
        />
        <div className='flex min-w-0 items-center justify-end'>
          <StopLegMetricsRow leg={leg} eta={stop.scheduledTime} />
        </div>
      </div>

      {expanded ? (
        <>
          <StopDivider className='mx-3' />
          <div className='space-y-2.5 px-3 pb-2 pt-3'>
            <AnchorStopLocationBlock
              locationLabel={stop.locationLabel}
              openAddress={stop.openAddress}
              tooltip={stop.locationTooltip}
              tone='slate'
            />
          </div>
        </>
      ) : null}
    </div>
  )
}

function StopLocationHeader({
  stop,
  stopOrders,
}: {
  stop: OptimizedRouteStop
  stopOrders: OrchestratorOrder[]
}) {
  const locationTitle = resolveStopAddressTitle(stop, stopOrders)
  const openAddresses = getStopOpenAddressLines(stop, stopOrders)
  const endpointKind =
    stopOrders[0] != null
      ? stop.kind === 'pickup'
        ? getOrderRouteEndpointKinds(stopOrders[0]).from
        : getOrderRouteEndpointKinds(stopOrders[0]).to
      : 'adres'
  const EndpointIcon =
    endpointKind === 'tesis' ? Warehouse : endpointKind === 'gel_al' ? Store : MapPin

  return (
    <div className='flex min-w-0 items-start gap-2'>
      <div className='mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-border/60'>
        <EndpointIcon
          className={cn(
            'size-3.5',
            stop.kind === 'pickup' ? 'text-sky-600' : 'text-emerald-600'
          )}
          aria-hidden
        />
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-semibold text-slate-900'>{locationTitle}</p>
        {openAddresses.map((address) => (
          <p key={address} className='text-[11px] leading-relaxed text-slate-600'>
            {address}
          </p>
        ))}
      </div>
    </div>
  )
}

function OperationalStopPanel({
  stop,
  stopOrders,
  leg,
  removableOrderIds,
  onRemoveOrder,
  expandAllSignal,
}: {
  stop: OptimizedRouteStop
  stopOrders: OrchestratorOrder[]
  leg: StopLegInfo | undefined
  removableOrderIds?: ReadonlySet<string>
  onRemoveOrder?: (orderId: string) => void
  expandAllSignal?: ExpandAllSignal
}) {
  const isConsolidated = stopOrders.length > 1
  const singleOrder = stopOrders.length === 1 ? stopOrders[0] : null
  const canRemoveOrder = (orderId: string) =>
    Boolean(onRemoveOrder) && (removableOrderIds?.has(orderId) ?? false)

  if (singleOrder) {
    return (
      <SingleOrderStopPanel
        stop={stop}
        order={singleOrder}
        stopOrders={stopOrders}
        leg={leg}
        expandAllSignal={expandAllSignal}
        onRemove={
          canRemoveOrder(singleOrder.id)
            ? () => onRemoveOrder?.(singleOrder.id)
            : undefined
        }
      />
    )
  }

  return (
    <div className='rounded-lg border border-border/80 bg-card p-2.5'>
      <StopLegMetrics leg={leg} eta={stop.scheduledTime} />
      <StopLocationHeader stop={stop} stopOrders={stopOrders} />
      {isConsolidated ? <StopAggregateSummary orders={stopOrders} /> : null}
      <div className={cn('space-y-2.5', isConsolidated ? 'pt-0.5' : 'mt-2.5 border-t border-border/60 pt-2.5')}>
        {stopOrders.map((order, index) => (
          <RouteStopOrderDetail
            key={order.id}
            order={order}
            stop={stop}
            withDivider={index > 0}
            showIdentity
            onRemove={
              canRemoveOrder(order.id) ? () => onRemoveOrder?.(order.id) : undefined
            }
          />
        ))}
      </div>
    </div>
  )
}

function RouteStopRow({
  stop,
  stopOrders,
  leg,
  isLast,
  completed,
  draggable,
  keyboardGrabbed,
  lockInnerFocus,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onKeyDown,
  removableOrderIds,
  onRemoveOrder,
  expandAllSignal,
}: {
  stop: OptimizedRouteStop
  stopOrders: OrchestratorOrder[]
  leg: StopLegInfo | undefined
  isLast: boolean
  completed?: boolean
  draggable?: boolean
  keyboardGrabbed?: boolean
  /** Düzenleme modunda kart içi link/chevron Tab’a girmez */
  lockInnerFocus?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
  onDragOver?: (event: React.DragEvent) => void
  onDrop?: () => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLLIElement>) => void
  removableOrderIds?: ReadonlySet<string>
  onRemoveOrder?: (orderId: string) => void
  expandAllSignal?: ExpandAllSignal
}) {
  const isDepot = stop.kind === 'depot_start' || stop.kind === 'depot_end'
  const isConsolidated = stopOrders.length > 1
  const showKindBadge = !isDepot
  const showStatusRow = showKindBadge || isConsolidated || completed

  return (
    <li
      className={cn(
        'relative flex gap-3 pb-5 last:pb-0',
        draggable &&
          'rounded-lg ring-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50',
        keyboardGrabbed && 'rounded-lg bg-sky-50/80 ring-2 ring-sky-400'
      )}
      draggable={draggable}
      tabIndex={draggable ? 0 : -1}
      aria-grabbed={draggable ? Boolean(keyboardGrabbed) : undefined}
      aria-roledescription={draggable ? 'Sıralanabilir durak' : undefined}
      data-reorder-stop={draggable ? stop.id : undefined}
      onDragStart={draggable ? onDragStart : undefined}
      onDragEnd={draggable ? onDragEnd : undefined}
      onDragOver={onDragOver}
      onDrop={draggable ? onDrop : undefined}
      onKeyDown={draggable ? onKeyDown : undefined}
    >
      {!isLast ? (
        <span
          className='absolute top-7 bottom-0 left-[13px] w-px bg-slate-200'
          aria-hidden
        />
      ) : null}

      <div className='relative z-10 flex shrink-0 flex-col items-center gap-1'>
        <div
          className={cn(
            'flex size-7 items-center justify-center rounded-full border-2 bg-card text-[10px] font-semibold tabular-nums',
            completed
              ? 'border-emerald-300 bg-emerald-600 text-white'
              : isDepot
                ? 'border-slate-200 text-slate-500'
                : 'border-sky-200 text-sky-700'
          )}
        >
          {stop.sequence}
        </div>
        {draggable ? (
          <span
            className='cursor-grab text-slate-300 active:cursor-grabbing'
            title='Sürükleyin veya Space + ↑↓'
            aria-hidden
          >
            <GripVertical className='size-3.5' />
          </span>
        ) : null}
      </div>

      <div className='min-w-0 flex-1 pt-0.5' inert={lockInnerFocus || undefined}>
        {showStatusRow ? (
          <div className='mb-2 flex flex-wrap items-center gap-2'>
            {showKindBadge ? <StopKindBadge kind={stop.kind} /> : null}
            {isConsolidated ? (
              <span className='text-xs font-medium text-slate-600'>
                {stopOrders.length} sipariş
              </span>
            ) : null}
            {completed ? (
              <Badge
                variant='outline'
                className='h-5 border-emerald-200/80 bg-emerald-50 px-1.5 text-[10px] font-medium text-emerald-700 shadow-none'
              >
                Tamamlandı
              </Badge>
            ) : null}
          </div>
        ) : null}

        {stop.kind === 'depot_end' ? (
          <ReturnStopPanel
            stop={stop}
            leg={leg}
            expandAllSignal={expandAllSignal}
          />
        ) : stop.kind === 'depot_start' ? (
          <DepotStartStopPanel
            stop={stop}
            leg={leg}
            expandAllSignal={expandAllSignal}
          />
        ) : (
          <OperationalStopPanel
            stop={stop}
            stopOrders={stopOrders}
            leg={leg}
            expandAllSignal={expandAllSignal}
            removableOrderIds={
              completed || isDepot ? undefined : removableOrderIds
            }
            onRemoveOrder={completed || isDepot ? undefined : onRemoveOrder}
          />
        )}
      </div>
    </li>
  )
}

function applyDraftStopOrder(
  stops: OptimizedRouteStop[],
  draftOrderedIds: string[],
  completedStopIds?: ReadonlySet<string>
): OptimizedRouteStop[] {
  const start = stops.find((stop) => stop.kind === 'depot_start')
  const end = stops.find((stop) => stop.kind === 'depot_end')
  const middle = stops.filter(
    (stop) => stop.kind !== 'depot_start' && stop.kind !== 'depot_end'
  )
  const locked = completedStopIds?.size
    ? middle.filter((stop) => completedStopIds.has(stop.id))
    : []
  const movable = completedStopIds?.size
    ? middle.filter((stop) => !completedStopIds.has(stop.id))
    : middle
  const byId = new Map(movable.map((stop) => [stop.id, stop]))
  const reordered: OptimizedRouteStop[] = []
  for (const id of draftOrderedIds) {
    const stop = byId.get(id)
    if (!stop) continue
    reordered.push(stop)
    byId.delete(id)
  }
  for (const leftover of byId.values()) reordered.push(leftover)
  return [
    ...(start ? [start] : []),
    ...locked,
    ...reordered,
    ...(end ? [end] : []),
  ]
}

export function PendingRouteDetail({
  route,
  orders,
  completedStopIds,
  usedColors,
  onChangeColor,
  onRemoveOrder,
  draggableStopIds,
  onReorderOperationalStops,
  hideSummary = false,
}: Props) {
  const [draftOrderedStopIds, setDraftOrderedStopIds] = useState<string[] | null>(
    null
  )
  const [keyboardGrabbedStopId, setKeyboardGrabbedStopId] = useState<string | null>(
    null
  )
  const [hideCompletedWhileEditing, setHideCompletedWhileEditing] = useState(true)
  const [hideAnchorsWhileEditing, setHideAnchorsWhileEditing] = useState(true)
  const [expandAllSignal, setExpandAllSignal] = useState<ExpandAllSignal>({
    version: 0,
    expanded: false,
  })
  const allCardsExpanded = expandAllSignal.expanded
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const stopListRef = useRef<HTMLOListElement>(null)
  const autoScrollRafRef = useRef<number | null>(null)
  const dragPointerYRef = useRef<number | null>(null)
  const dragStopIdRef = useRef<string | null>(null)
  const isReordering = draftOrderedStopIds != null
  const reorderControlTabIndex = isReordering ? -1 : undefined
  const ordersById = new Map(orders.map((order) => [order.id, order]))
  const capacityPct = Math.max(route.capacityVolumePct, route.capacityWeightPct)
  const operationalStops = route.stops.filter(
    (stop) => stop.kind === 'pickup' || stop.kind === 'delivery'
  ).length

  const lockedOrderIds = new Set<string>()
  if (completedStopIds?.size) {
    for (const stop of route.stops) {
      if (stop.kind !== 'pickup' && stop.kind !== 'delivery') continue
      if (!completedStopIds.has(stop.id)) continue
      for (const orderId of stop.orderIds) lockedOrderIds.add(orderId)
    }
  }

  const removableOrderIds = onRemoveOrder
    ? new Set(route.orderIds.filter((orderId) => !lockedOrderIds.has(orderId)))
    : undefined

  const movableStops = route.stops.filter((stop) => {
    if (stop.kind !== 'pickup' && stop.kind !== 'delivery') return false
    if (completedStopIds?.has(stop.id)) return false
    if (draggableStopIds) return draggableStopIds.has(stop.id)
    return Boolean(onReorderOperationalStops)
  })
  const movableIds = movableStops.map((stop) => stop.id)
  const canReorder =
    Boolean(onReorderOperationalStops) && movableIds.length >= 2
  const hasCompletedStops = Boolean(completedStopIds?.size)
  const hasAnchorStops = route.stops.some(
    (stop) => stop.kind === 'depot_start' || stop.kind === 'depot_end'
  )

  const displayStops =
    draftOrderedStopIds != null
      ? applyDraftStopOrder(route.stops, draftOrderedStopIds, completedStopIds)
      : route.stops
  const visibleStops = isReordering
    ? displayStops.filter((stop) => {
        if (
          hideAnchorsWhileEditing &&
          (stop.kind === 'depot_start' || stop.kind === 'depot_end')
        ) {
          return false
        }
        if (hideCompletedWhileEditing && completedStopIds?.has(stop.id)) {
          return false
        }
        return true
      })
    : displayStops
  const stopLegs = buildStopLegs(displayStops)

  const hasDraftChanges =
    draftOrderedStopIds != null &&
    (draftOrderedStopIds.length !== movableIds.length ||
      draftOrderedStopIds.some((id, index) => id !== movableIds[index]))

  const stopAutoScroll = () => {
    if (autoScrollRafRef.current != null) {
      cancelAnimationFrame(autoScrollRafRef.current)
      autoScrollRafRef.current = null
    }
    dragPointerYRef.current = null
  }

  const tickAutoScroll = () => {
    const container = scrollContainerRef.current
    const pointerY = dragPointerYRef.current
    if (!container || pointerY == null) {
      autoScrollRafRef.current = null
      return
    }

    const rect = container.getBoundingClientRect()
    const edge = 72
    const maxSpeed = 22
    let delta = 0

    if (pointerY < rect.top + edge) {
      const intensity = Math.min(1, (rect.top + edge - pointerY) / edge)
      delta = -Math.ceil(maxSpeed * intensity)
    } else if (pointerY > rect.bottom - edge) {
      const intensity = Math.min(1, (pointerY - (rect.bottom - edge)) / edge)
      delta = Math.ceil(maxSpeed * intensity)
    }

    if (delta !== 0) container.scrollTop += delta
    autoScrollRafRef.current = requestAnimationFrame(tickAutoScroll)
  }

  const updateAutoScrollFromPointer = (clientY: number) => {
    dragPointerYRef.current = clientY
    if (autoScrollRafRef.current == null) {
      autoScrollRafRef.current = requestAnimationFrame(tickAutoScroll)
    }
  }

  useEffect(() => {
    setDraftOrderedStopIds(null)
    setKeyboardGrabbedStopId(null)
    dragStopIdRef.current = null
    setHideCompletedWhileEditing(true)
    setHideAnchorsWhileEditing(true)
    setExpandAllSignal({ version: 0, expanded: false })
    stopAutoScroll()
  }, [route.id])

  useEffect(() => () => stopAutoScroll(), [])

  const focusFirstReorderStop = () => {
    requestAnimationFrame(() => {
      const first = stopListRef.current?.querySelector<HTMLElement>(
        'li[data-reorder-stop]'
      )
      first?.focus()
    })
  }

  const handleStartReorder = () => {
    setDraftOrderedStopIds([...movableIds])
    setHideCompletedWhileEditing(true)
    setHideAnchorsWhileEditing(true)
    setKeyboardGrabbedStopId(null)
    dragStopIdRef.current = null
    focusFirstReorderStop()
  }

  const handleCancelReorder = () => {
    stopAutoScroll()
    setDraftOrderedStopIds(null)
    setKeyboardGrabbedStopId(null)
    dragStopIdRef.current = null
  }

  const handleSaveReorder = () => {
    if (!onReorderOperationalStops || draftOrderedStopIds == null) return
    if (hasDraftChanges) onReorderOperationalStops(draftOrderedStopIds)
    stopAutoScroll()
    setDraftOrderedStopIds(null)
    setKeyboardGrabbedStopId(null)
    dragStopIdRef.current = null
  }

  const moveDraftStopByKeyboard = (stopId: string, direction: -1 | 1) => {
    if (draftOrderedStopIds == null) return
    const from = draftOrderedStopIds.indexOf(stopId)
    if (from < 0) return
    const to = from + direction
    if (to < 0 || to >= draftOrderedStopIds.length) return
    const next = [...draftOrderedStopIds]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setDraftOrderedStopIds(next)
  }

  const handleStopKeyboardReorder = (
    event: React.KeyboardEvent<HTMLLIElement>,
    stopId: string
  ) => {
    if (!isReordering || draftOrderedStopIds == null) return
    if (!draftOrderedStopIds.includes(stopId)) return

    if (event.key === 'Escape') {
      if (keyboardGrabbedStopId == null) return
      event.preventDefault()
      setKeyboardGrabbedStopId(null)
      return
    }

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      setKeyboardGrabbedStopId((prev) => (prev === stopId ? null : stopId))
      return
    }

    if (keyboardGrabbedStopId !== stopId) return

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveDraftStopByKeyboard(stopId, -1)
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveDraftStopByKeyboard(stopId, 1)
    }
  }

  const handleDropOnStop = (targetStopId: string) => {
    const activeDragStopId = dragStopIdRef.current
    if (draftOrderedStopIds == null || activeDragStopId == null) return
    if (activeDragStopId === targetStopId) {
      dragStopIdRef.current = null
      stopAutoScroll()
      return
    }
    const from = draftOrderedStopIds.indexOf(activeDragStopId)
    const to = draftOrderedStopIds.indexOf(targetStopId)
    if (from < 0 || to < 0) {
      dragStopIdRef.current = null
      stopAutoScroll()
      return
    }
    const next = [...draftOrderedStopIds]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setDraftOrderedStopIds(next)
    dragStopIdRef.current = null
    stopAutoScroll()
  }

  const handleReorderDragStart = (stopId: string) => {
    dragStopIdRef.current = stopId
  }

  const handleReorderDragOver = (event: React.DragEvent) => {
    if (!isReordering || dragStopIdRef.current == null) return
    event.preventDefault()
    updateAutoScrollFromPointer(event.clientY)
  }

  const handleReorderDragEnd = () => {
    stopAutoScroll()
    dragStopIdRef.current = null
  }

  const showSummaryBlock = !hideSummary || route.warnings.length > 0

  return (
    <div className='flex h-full min-h-0 flex-col overflow-hidden'>
      <div
        ref={scrollContainerRef}
        className='min-h-0 flex-1 overflow-y-auto overscroll-contain'
        onDragOver={isReordering ? handleReorderDragOver : undefined}
      >
        {showSummaryBlock ? (
          <div
            className='border-b border-border px-4 py-3'
            inert={isReordering || undefined}
          >
            {!hideSummary ? (
              <RouteDetailSummary
                route={route}
                operationalStops={operationalStops}
                capacityPct={capacityPct}
                usedColors={usedColors}
                onChangeColor={onChangeColor}
              />
            ) : null}

            {route.warnings.length > 0 ? (
              <div className={hideSummary ? 'space-y-1.5' : 'mt-3 space-y-1.5'}>
                {route.warnings.map((warning) => (
                  <p
                    key={warning}
                    className='flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] text-amber-800'
                  >
                    <AlertTriangle className='mt-0.5 size-3.5 shrink-0' />
                    {warning}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className='px-4 py-3'>
          <div className='mb-3 flex flex-col gap-2'>
            <div className='flex items-center justify-between gap-2'>
              <h3 className='text-[11px] font-semibold uppercase tracking-wider text-slate-400'>
                Durak sırası
                {isReordering ? (
                  <span className='ml-2 font-normal normal-case tracking-normal text-slate-400'>
                    · sürükleyin veya Space + ↑↓
                  </span>
                ) : null}
              </h3>
              <div className='flex shrink-0 flex-wrap items-center justify-end gap-1.5'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='h-7 px-2.5 text-[11px]'
                  tabIndex={reorderControlTabIndex}
                  aria-pressed={allCardsExpanded}
                  onClick={() =>
                    setExpandAllSignal((prev) => ({
                      version: prev.version + 1,
                      expanded: !prev.expanded,
                    }))
                  }
                >
                  <ChevronsUpDown className='size-3.5' aria-hidden />
                  {allCardsExpanded ? 'Hepsini kapa' : 'Hepsini aç'}
                </Button>
                {canReorder ? (
                  isReordering ? (
                    <>
                      {hasCompletedStops ? (
                        <Button
                          type='button'
                          variant={
                            hideCompletedWhileEditing ? 'secondary' : 'outline'
                          }
                          size='sm'
                          className='h-7 px-2.5 text-[11px]'
                          tabIndex={-1}
                          aria-pressed={hideCompletedWhileEditing}
                          onClick={() =>
                            setHideCompletedWhileEditing((prev) => !prev)
                          }
                        >
                          Tamamlananları Gizle
                        </Button>
                      ) : null}
                      {hasAnchorStops ? (
                        <Button
                          type='button'
                          variant={
                            hideAnchorsWhileEditing ? 'secondary' : 'outline'
                          }
                          size='sm'
                          className='h-7 px-2.5 text-[11px]'
                          tabIndex={-1}
                          aria-pressed={hideAnchorsWhileEditing}
                          onClick={() =>
                            setHideAnchorsWhileEditing((prev) => !prev)
                          }
                        >
                          Başlangıç Ve Son Gizle
                        </Button>
                      ) : null}
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        className='h-7 px-2.5 text-[11px]'
                        tabIndex={-1}
                        onClick={handleCancelReorder}
                      >
                        Vazgeç
                      </Button>
                      <Button
                        type='button'
                        size='sm'
                        className='h-7 px-2.5 text-[11px]'
                        tabIndex={-1}
                        disabled={!hasDraftChanges}
                        onClick={handleSaveReorder}
                      >
                        Düzenlemeyi kaydet
                      </Button>
                    </>
                  ) : (
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='h-7 shrink-0 px-2.5 text-[11px]'
                      onClick={handleStartReorder}
                    >
                      <GripVertical className='size-3.5' aria-hidden />
                      Durakları düzenle
                    </Button>
                  )
                ) : null}
              </div>
            </div>
          </div>
          <ol
            ref={stopListRef}
            className='list-none'
            aria-label='Durak sırası'
            {...(isReordering
              ? {
                  'aria-dropeffect': 'move' as const,
                }
              : {})}
          >
            {visibleStops.map((stop, index) => {
              const stopOrders = stop.orderIds
                .map((id) => ordersById.get(id))
                .filter((order): order is OrchestratorOrder => order != null)
              const isDraggable =
                isReordering && (draftOrderedStopIds?.includes(stop.id) ?? false)

              return (
                <RouteStopRow
                  key={stop.id}
                  stop={stop}
                  stopOrders={stopOrders}
                  leg={stopLegs.get(stop.id)}
                  isLast={index === visibleStops.length - 1}
                  completed={completedStopIds?.has(stop.id)}
                  draggable={isDraggable}
                  keyboardGrabbed={keyboardGrabbedStopId === stop.id}
                  lockInnerFocus={isReordering}
                  onDragStart={() => handleReorderDragStart(stop.id)}
                  onDragEnd={handleReorderDragEnd}
                  onDragOver={isReordering ? handleReorderDragOver : undefined}
                  onDrop={() => handleDropOnStop(stop.id)}
                  onKeyDown={(event) => handleStopKeyboardReorder(event, stop.id)}
                  removableOrderIds={isReordering ? undefined : removableOrderIds}
                  onRemoveOrder={isReordering ? undefined : onRemoveOrder}
                  expandAllSignal={expandAllSignal}
                />
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}
