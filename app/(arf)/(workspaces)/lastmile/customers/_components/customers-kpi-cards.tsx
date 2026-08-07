'use client'

import {
  Activity,
  CheckCircle2,
  Package,
  PackagePlus,
  Timer,
  TrendingUp,
  Warehouse,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import type { CustomerListKpi } from '../_types/customer'
import { formatCount, formatSuccessRate } from '../_lib/query-customers'

type Props = {
  kpi: CustomerListKpi
}

const ITEMS: Array<{
  key: keyof CustomerListKpi
  label: string
  format?: (value: number) => string
  icon: LucideIcon
}> = [
  {
    key: 'todayActiveOrders',
    label: 'Bugünkü Aktif Sipariş',
    format: formatCount,
    icon: PackagePlus,
  },
  {
    key: 'avgDailyVolume',
    label: 'Ort. Günlük Hacim',
    format: (value) => `${formatCount(value)} pkt`,
    icon: TrendingUp,
  },
  {
    key: 'avgTaskDurationMin',
    label: 'Ort. Görev Süresi',
    format: (value) => `${value.toLocaleString('tr-TR')} dk`,
    icon: Timer,
  },
  {
    key: 'avgSuccessRate',
    label: 'Ort. % SLA',
    format: formatSuccessRate,
    icon: Activity,
  },
  {
    key: 'totalFacilities',
    label: 'Toplam Tesis',
    format: formatCount,
    icon: Warehouse,
  },
  {
    key: 'totalOrders',
    label: 'Toplam Sipariş',
    format: formatCount,
    icon: Package,
  },
  {
    key: 'totalDelivered',
    label: 'Toplam Teslim',
    format: formatCount,
    icon: CheckCircle2,
  },
  {
    key: 'totalCanceled',
    label: 'Toplam İptal',
    format: formatCount,
    icon: XCircle,
  },
]

export function CustomersKpiCards({ kpi }: Props) {
  return (
    <div className='overflow-x-auto rounded-2xl border border-slate-200/80 bg-white'>
      <div className='grid min-w-[1040px] grid-cols-8 divide-x divide-slate-100'>
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
                  <p
                    className='truncate text-[10px] font-medium tracking-wide text-slate-400'
                    title={item.label}
                  >
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

export function CustomersKpiHint() {
  return (
    <div className='flex items-center gap-2 text-xs text-slate-500'>
      <Activity className='size-3.5' />
      KPI özeti listedeki müşterilerin güncel operasyon metriklerine göredir.
    </div>
  )
}
