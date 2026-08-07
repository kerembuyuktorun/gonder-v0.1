'use client'

import {
  CalendarClock,
  CheckCircle2,
  History,
  Route,
  Truck,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import type { PlanningRouteListKpi } from '../_types/planning-route'
import { formatCount } from '../_lib/query-routes'

type Props = {
  kpi: PlanningRouteListKpi
}

const ITEMS: Array<{
  key: keyof PlanningRouteListKpi
  label: string
  icon: LucideIcon
}> = [
  { key: 'todayActive', label: 'Bugün Aktif', icon: Truck },
  { key: 'plannedToday', label: 'Bugün Planlandı', icon: Route },
  { key: 'carryover', label: 'Devreden', icon: History },
  { key: 'future', label: 'İleri Tarihli', icon: CalendarClock },
  { key: 'completedToday', label: 'Bugün Tamamlanan', icon: CheckCircle2 },
  { key: 'canceled', label: 'İptal', icon: XCircle },
]

export function RoutesKpiCards({ kpi }: Props) {
  return (
    <div className='overflow-x-auto rounded-2xl border border-slate-200/80 bg-white'>
      <div className='grid min-w-[780px] grid-cols-6 divide-x divide-slate-100'>
        {ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.key}
              className='group relative min-w-0 px-3 py-3.5 transition-colors hover:bg-slate-50/70'
            >
              <div className='flex items-start justify-between gap-2'>
                <div className='min-w-0'>
                  <p
                    className='truncate text-[10px] font-medium tracking-wide text-slate-400'
                    title={item.label}
                  >
                    {item.label}
                  </p>
                  <p className='mt-1.5 truncate text-lg font-semibold tabular-nums leading-none tracking-tight text-slate-900'>
                    {formatCount(kpi[item.key])}
                  </p>
                </div>
                <span className='flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-white group-hover:text-slate-700 group-hover:ring-1 group-hover:ring-slate-200'>
                  <Icon className='size-3.5' />
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
