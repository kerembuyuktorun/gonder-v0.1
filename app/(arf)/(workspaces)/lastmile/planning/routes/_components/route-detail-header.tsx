'use client'

import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowRightLeft,
  Ban,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Clock3,
  Copy,
  Gauge,
  MapPinned,
  Navigation,
  Package,
  ParkingSquare,
  Pencil,
  Route,
  Timer,
  Truck,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OrchestratorActiveRoute } from '../../route-orchestrator/_types/orchestrator'
import { PlanningRouteTypeBadge } from './planning-route-type-badge'
import { RouteCapacity } from './route-capacity'
import { RouteDateChip } from './route-date-chip'
import { RouteStatusBadge } from './route-status-badge'
import {
  formatDurationMin,
  formatRouteDate,
  formatRouteDateTime,
  parseRouteDateTime,
} from '../_lib/query-routes'
import { resolveRouteDateChip } from '../_lib/map-planning-route'
import type { PlanningRouteStatus, PlanningRouteType } from '../_types/planning-route'

type Props = {
  route: OrchestratorActiveRoute
  status?: PlanningRouteStatus
  routeType?: PlanningRouteType
  onEdit?: () => void
  onTransfer?: () => void
  onCancel?: () => void
  shiftStart?: string | null
  shiftEnd?: string | null
  parkLabel?: string | null
  durationActualMin?: number | null
  durationPlannedMin?: number | null
  createdAt?: string | null
  createdBy?: string | null
}

const statusAccent: Record<
  PlanningRouteStatus,
  { line: string; glow: string }
> = {
  planlandi: { line: 'via-violet-400/70', glow: 'bg-violet-50/80' },
  aktif: { line: 'via-sky-400/70', glow: 'bg-sky-50/80' },
  tamamlandi: { line: 'via-emerald-400/70', glow: 'bg-emerald-50/80' },
  iptal: { line: 'via-rose-400/70', glow: 'bg-rose-50/80' },
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

function HeaderStat({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: LucideIcon
  label: string
  value?: string
  children?: ReactNode
}) {
  return (
    <div className='flex min-w-0 items-center gap-2.5 rounded-xl bg-slate-50/80 px-3 py-2.5'>
      <span className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200/70'>
        <Icon className='size-3.5' />
      </span>
      <div className='min-w-0'>
        <p className='truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400'>
          {label}
        </p>
        {children ? (
          <div className='mt-0.5'>{children}</div>
        ) : (
          <p className='mt-0.5 truncate text-sm font-semibold tracking-tight text-slate-900'>
            {value}
          </p>
        )}
      </div>
    </div>
  )
}

export function RouteDetailHeader({
  route,
  status,
  routeType = 'Karışık',
  onEdit,
  onTransfer,
  onCancel,
  shiftStart = null,
  shiftEnd = null,
  parkLabel = null,
  durationActualMin = null,
  durationPlannedMin = null,
  createdAt = null,
  createdBy = null,
}: Props) {
  const [showStats, setShowStats] = useState(true)
  const resolvedStatus: PlanningRouteStatus = status ?? route.status
  const accent = statusAccent[resolvedStatus]
  const dateChip = resolveRouteDateChip(route.operationDate)
  const pointCount = Math.max(route.stops.length, 0)
  const progressDone =
    route.stopCount > 0 && route.completedStopCount >= route.stopCount
  const progressPct =
    route.stopCount > 0
      ? Math.min(100, Math.round((route.completedStopCount / route.stopCount) * 100))
      : 0
  const shiftLabel =
    shiftStart || shiftEnd ? `${shiftStart ?? '—'} – ${shiftEnd ?? '—'}` : '—'
  const createdParsed = createdAt ? parseRouteDateTime(createdAt) : null
  const plannedDurationMin = durationPlannedMin ?? route.durationMin

  const handleCopy = async () => {
    const ok = await copyText(route.label)
    if (ok) toast.success(`${route.label} kopyalandı`)
    else toast.error('Kopyalanamadı')
  }

  return (
    <Card className='relative overflow-hidden rounded-[24px] border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03),0_16px_40px_rgba(15,23,42,0.05)]'>
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent',
          accent.line
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute -right-20 -top-24 size-64 rounded-full blur-3xl',
          accent.glow
        )}
      />
      <CardContent className='relative p-5 lg:p-6'>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
          <div className='min-w-0'>
            <p className='mb-2 text-sm font-semibold tracking-tight text-slate-500'>
              Rota Detayı
            </p>
            <button
              type='button'
              onClick={() => void handleCopy()}
              className='group inline-flex max-w-full items-center gap-2 rounded-lg text-left transition-colors hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30'
            >
              <h1 className='truncate text-2xl font-bold tracking-[-0.03em] text-slate-950 lg:text-[28px]'>
                {route.label}
              </h1>
              <span className='flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors group-hover:border-sky-200 group-hover:text-sky-600'>
                <Copy className='size-3.5' />
              </span>
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='h-9 gap-1.5'>
                İşlemler
                <ChevronDown className='size-3.5 opacity-60' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuItem
                onClick={() => {
                  if (onEdit) onEdit()
                  else toast.message('Rota düzenleme yakında')
                }}
              >
                <Pencil className='mr-2 size-3.5' />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (onTransfer) onTransfer()
                  else toast.message('Rota transfer yakında')
                }}
              >
                <ArrowRightLeft className='mr-2 size-3.5' />
                Transfer Et
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-rose-700 focus:text-rose-700'
                onClick={() => {
                  if (onCancel) onCancel()
                  else toast.message('Rota iptal yakında')
                }}
              >
                <Ban className='mr-2 size-3.5' />
                İptal Et
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 xl:flex-row xl:items-end xl:justify-between'>
          <div className='flex flex-wrap items-start gap-x-5 gap-y-3'>
            <BadgeGroup label='Durum'>
              <RouteStatusBadge status={resolvedStatus} />
            </BadgeGroup>
            <GroupDivider />
            <BadgeGroup label='Rota Tipi'>
              <PlanningRouteTypeBadge type={routeType} />
            </BadgeGroup>
            <GroupDivider />
            <BadgeGroup label='Planlanan Tarih'>
              <div className='flex flex-wrap items-center gap-1.5'>
                <span className='text-sm font-medium text-slate-800'>
                  {formatRouteDate(route.operationDate)}
                </span>
                <RouteDateChip chip={dateChip} />
              </div>
            </BadgeGroup>
            <GroupDivider />
            <BadgeGroup label='Araç'>
              <span className='inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800'>
                <Truck className='size-3.5 text-slate-400' />
                {route.vehiclePlate}
              </span>
            </BadgeGroup>
            <GroupDivider />
            <BadgeGroup label='Kurye'>
              <span className='inline-flex items-center gap-1.5 text-sm font-medium text-slate-800'>
                <UserRound className='size-3.5 text-slate-400' />
                {route.courierName ?? 'Atanmadı'}
              </span>
            </BadgeGroup>
          </div>

          <div className='flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 xl:justify-end'>
            <span className='inline-flex items-center gap-1.5'>
              <CalendarClock className='size-3.5 text-slate-400' />
              {createdParsed
                ? `${createdParsed.date} ${createdParsed.time}`
                : createdAt
                  ? formatRouteDateTime(createdAt)
                  : '—'}
            </span>
            <span className='inline-flex items-center gap-1.5'>
              <UserRound className='size-3.5 text-slate-400' />
              {createdBy?.trim() || '—'}
            </span>
          </div>
        </div>

        <div className='relative mt-5'>
          <div className='border-t border-slate-200/90' />
          <button
            type='button'
            aria-label={showStats ? 'Özeti gizle' : 'Özeti göster'}
            aria-expanded={showStats}
            onClick={() => setShowStats((previous) => !previous)}
            className='absolute left-1/2 top-0 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-slate-600 shadow-sm transition-colors hover:border-slate-400 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40'
          >
            {showStats ? (
              <ChevronUp className='size-4 stroke-[2.25]' />
            ) : (
              <ChevronDown className='size-4 stroke-[2.25]' />
            )}
          </button>

          {showStats ? (
            <div className='grid grid-cols-2 gap-2 pt-4 sm:grid-cols-3 xl:grid-cols-4'>
              <HeaderStat icon={MapPinned} label='Nokta' value={String(pointCount)} />
              <HeaderStat icon={Route} label='İlerleme'>
                <div className='min-w-[110px] space-y-1'>
                  <p
                    className={cn(
                      'text-sm font-semibold tracking-tight tabular-nums',
                      progressDone ? 'text-emerald-700' : 'text-slate-900'
                    )}
                  >
                    {progressDone
                      ? `Tamamlandı · ${route.stopCount} durak`
                      : `${route.completedStopCount}/${route.stopCount} durak`}
                  </p>
                  <div className='h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80'>
                    <div
                      className={cn(
                        'h-full rounded-full transition-[width]',
                        progressDone ? 'bg-emerald-500' : 'bg-sky-500'
                      )}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </HeaderStat>
              <HeaderStat icon={Package} label='Sipariş' value={`${route.orderCount} adet`} />
              <HeaderStat
                icon={Navigation}
                label='Toplam Mesafe'
                value={`${route.distanceKm} km`}
              />
              <HeaderStat icon={Gauge} label='Kapasite'>
                <RouteCapacity
                  volumePct={route.capacityVolumePct}
                  weightPct={route.capacityWeightPct}
                />
              </HeaderStat>
              <HeaderStat icon={Timer} label='Başlangıç–Bitiş' value={shiftLabel} />
              <HeaderStat icon={Clock3} label='Süre'>
                <div className='flex flex-col gap-0.5 leading-tight'>
                  <span className='text-sm font-semibold tabular-nums text-slate-900'>
                    {formatDurationMin(plannedDurationMin)}
                    <span className='ml-1 text-xs font-medium text-muted-foreground'>plan</span>
                  </span>
                  <span className='text-xs tabular-nums text-muted-foreground'>
                    {formatDurationMin(durationActualMin)}
                    <span className='ml-1'>gerçek</span>
                  </span>
                </div>
              </HeaderStat>
              <HeaderStat
                icon={ParkingSquare}
                label='Park / Başlangıç'
                value={parkLabel?.trim() || '—'}
              />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function BadgeGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='min-w-0 space-y-1.5'>
      <p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400'>
        {label}
      </p>
      {children}
    </div>
  )
}

function GroupDivider() {
  return <div className='hidden h-10 w-px self-center bg-slate-200 sm:block' aria-hidden />
}
