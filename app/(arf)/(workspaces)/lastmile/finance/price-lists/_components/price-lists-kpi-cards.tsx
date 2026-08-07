'use client'

import {
  CheckCircle2,
  ListTree,
  Tags,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { formatNumber } from '../../_lib/format'

export type PriceListsKpi = {
  activeCount: number
  defaultName: string
  ruleCount: number
  assignedCustomerCount: number
}

type Props = { kpi: PriceListsKpi }

const ITEMS: Array<{
  key: keyof PriceListsKpi
  label: string
  format?: (value: string | number) => string
  icon: LucideIcon
}> = [
  { key: 'activeCount', label: 'Aktif Liste', format: (v) => formatNumber(Number(v)), icon: CheckCircle2 },
  { key: 'defaultName', label: 'Varsayılan Liste', icon: Tags },
  { key: 'ruleCount', label: 'Toplam Kural', format: (v) => formatNumber(Number(v)), icon: ListTree },
  {
    key: 'assignedCustomerCount',
    label: 'Atanan Müşteri',
    format: (v) => formatNumber(Number(v)),
    icon: Users,
  },
]

export function PriceListsKpiCards({ kpi }: Props) {
  return (
    <div className='overflow-x-auto rounded-2xl border border-slate-200/80 bg-white'>
      <div className='grid min-w-[720px] grid-cols-4 divide-x divide-slate-100'>
        {ITEMS.map((item) => {
          const Icon = item.icon
          const raw = kpi[item.key]
          const display = item.format ? item.format(raw) : String(raw)
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
                    {display}
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
