'use client'

import type { ComponentType } from 'react'
import {
  Ban,
  CalendarClock,
  CheckCircle2,
  Clock3,
  History,
  LayoutList,
  Sun,
  Truck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  PlanningRouteDateScope,
  PlanningRouteStatusScope,
} from '../_types/planning-route'

const STATUS_OPTIONS: Array<{
  id: PlanningRouteStatusScope
  label: string
  icon: ComponentType<{ className?: string }>
}> = [
  { id: 'all', label: 'Tümü', icon: LayoutList },
  { id: 'planlandi', label: 'Planlandı', icon: Clock3 },
  { id: 'aktif', label: 'Aktif', icon: Truck },
  { id: 'tamamlandi', label: 'Tamamlandı', icon: CheckCircle2 },
  { id: 'iptal', label: 'İptal', icon: Ban },
]

const DATE_OPTIONS: Array<{
  id: PlanningRouteDateScope
  label: string
  icon: ComponentType<{ className?: string }>
}> = [
  { id: 'all', label: 'Tüm günler', icon: LayoutList },
  { id: 'bugun', label: 'Bugün', icon: Sun },
  { id: 'gecmis', label: 'Geçmiş', icon: History },
  { id: 'ileri', label: 'İleri', icon: CalendarClock },
]

type Props = {
  statusScope: PlanningRouteStatusScope
  dateScope: PlanningRouteDateScope
  statusCounts: Record<PlanningRouteStatusScope, number>
  dateCounts: Record<PlanningRouteDateScope, number>
  onStatusScopeChange: (scope: PlanningRouteStatusScope) => void
  onDateScopeChange: (scope: PlanningRouteDateScope) => void
}

export function RouteListTabs({
  statusScope,
  dateScope,
  statusCounts,
  dateCounts,
  onStatusScopeChange,
  onDateScopeChange,
}: Props) {
  return (
    <div className='rounded-2xl border border-slate-200/80 bg-linear-to-b from-slate-50/80 to-white p-3 shadow-sm'>
      <div className='flex flex-col gap-3 lg:flex-row lg:items-end'>
        <section className='min-w-0 flex-1'>
          <div className='mb-2 flex items-center gap-2 px-1'>
            <p className='text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500'>
              Durum
            </p>
            <span className='h-px flex-1 bg-slate-200/80' />
          </div>
          <div className='flex flex-wrap gap-1.5 rounded-xl bg-slate-100/70 p-1'>
            {STATUS_OPTIONS.map((option) => {
              const isActive = statusScope === option.id
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  type='button'
                  onClick={() => onStatusScopeChange(option.id)}
                  className={cn(
                    'inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                  )}
                >
                  <Icon className={cn('size-3.5 shrink-0', isActive ? 'opacity-90' : 'opacity-60')} />
                  <span>{option.label}</span>
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 text-[11px] tabular-nums',
                      isActive ? 'bg-white/15 text-white' : 'bg-white/70 text-slate-500'
                    )}
                  >
                    {statusCounts[option.id] ?? 0}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <div className='hidden w-px self-stretch bg-slate-200 lg:block' aria-hidden />

        <section className='min-w-0 shrink-0'>
          <div className='mb-2 flex items-center gap-2 px-1'>
            <p className='text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500'>
              Planlanan tarih
            </p>
            <span className='h-px flex-1 bg-slate-200/80' />
          </div>
          <div className='flex flex-wrap gap-1.5 rounded-xl bg-slate-100/70 p-1'>
            {DATE_OPTIONS.map((option) => {
              const isActive = dateScope === option.id
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  type='button'
                  onClick={() => onDateScopeChange(option.id)}
                  className={cn(
                    'inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                  )}
                >
                  <Icon className={cn('size-3.5 shrink-0', isActive ? 'opacity-90' : 'opacity-60')} />
                  <span>{option.label}</span>
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 text-[11px] tabular-nums',
                      isActive ? 'bg-white/15 text-white' : 'bg-white/70 text-slate-500'
                    )}
                  >
                    {dateCounts[option.id] ?? 0}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
