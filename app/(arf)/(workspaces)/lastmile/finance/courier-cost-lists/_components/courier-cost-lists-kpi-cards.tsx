'use client'

import {
  Bike,
  CheckCircle2,
  ListTree,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { formatNumber } from '../../_lib/format'

export type CourierCostListsKpi = {
  activeCount: number
  salaryCount: number
  tariffCount: number
  assignedCourierCount: number
}

type Props = { kpi: CourierCostListsKpi }

const ITEMS: Array<{
  key: keyof CourierCostListsKpi
  label: string
  icon: LucideIcon
}> = [
  { key: 'activeCount', label: 'Aktif Liste', icon: CheckCircle2 },
  { key: 'tariffCount', label: 'Tarifeli', icon: ListTree },
  { key: 'salaryCount', label: 'Maaşlı / Hibrit', icon: Wallet },
  { key: 'assignedCourierCount', label: 'Atanan Kurye', icon: Bike },
]

export function CourierCostListsKpiCards({ kpi }: Props) {
  return (
    <div className='overflow-x-auto rounded-2xl border border-slate-200/80 bg-white'>
      <div className='grid min-w-[720px] grid-cols-4 divide-x divide-slate-100'>
        {ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.key}
              className='group relative min-w-0 px-3 py-3.5 transition-colors hover:bg-slate-50/70'
            >
              <div className='flex items-start justify-between gap-2'>
                <div className='min-w-0'>
                  <p className='truncate text-[10px] font-medium tracking-wide text-slate-400'>
                    {item.label}
                  </p>
                  <p className='mt-1.5 truncate text-lg font-semibold tabular-nums leading-none tracking-tight text-slate-900'>
                    {formatNumber(kpi[item.key])}
                  </p>
                </div>
                <span className='flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500'>
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
