'use client'

import {
  Building2,
  MapPinned,
  type LucideIcon,
} from 'lucide-react'
import type { GlobalRegionKpi } from '../_types/global-regions'

type Props = {
  kpi: GlobalRegionKpi
}

const ITEMS: Array<{
  key: keyof GlobalRegionKpi
  label: string
  hint: string
  icon: LucideIcon
}> = [
  {
    key: 'cityCount',
    label: 'Şehir',
    hint: 'Kapsama dahil il sayısı',
    icon: Building2,
  },
  {
    key: 'districtCount',
    label: 'İlçe',
    hint: 'Kapsama dahil ilçe sayısı',
    icon: MapPinned,
  },
  {
    key: 'neighborhoodSelectionCount',
    label: 'Mahalle Seçimi',
    hint: 'Seçili mahalle + tam ilçe kapsaması',
    icon: MapPinned,
  },
  {
    key: 'rowCount',
    label: 'Kapsam Satırı',
    hint: 'İlçe bazlı satır sayısı',
    icon: MapPinned,
  },
]

export function GlobalRegionsKpiCards({ kpi }: Props) {
  return (
    <div className='overflow-x-auto rounded-2xl border border-slate-200/80 bg-white'>
      <div className='grid min-w-[640px] grid-cols-4 divide-x divide-slate-100'>
        {ITEMS.map((item) => {
          const Icon = item.icon
          const display = kpi[item.key].toLocaleString('tr-TR')

          return (
            <div
              key={item.key}
              className='group relative min-w-0 px-3 py-3.5 transition-colors hover:bg-slate-50/70'
              title={item.hint}
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
