'use client'

import type { ComponentType } from 'react'
import {
  ArrowLeftRight,
  ArrowRightLeft,
  Ban,
  LayoutList,
  Package,
  PackageOpen,
  RefreshCw,
  UserX,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OrderStatusScope, OrderTypeScope } from '../_types/order'

const TYPE_OPTIONS: Array<{
  id: OrderTypeScope
  label: string
  icon: ComponentType<{ className?: string }>
}> = [
  { id: 'all', label: 'Tümü', icon: LayoutList },
  { id: 'dagitim', label: 'Dağıtım', icon: Package },
  { id: 'toplama', label: 'Toplama', icon: PackageOpen },
  { id: 'iade', label: 'İade', icon: RefreshCw },
  { id: 'transfer', label: 'Transfer', icon: ArrowRightLeft },
  { id: 'degisim', label: 'Değişim', icon: ArrowLeftRight },
]

const STATUS_OPTIONS: Array<{
  id: OrderStatusScope
  label: string
  icon: ComponentType<{ className?: string }>
}> = [
  { id: 'iptal', label: 'İptal Edilenler', icon: Ban },
  { id: 'atanmayan', label: 'Atanmayanlar', icon: UserX },
]

type Props = {
  typeScope: OrderTypeScope
  statusScopes: OrderStatusScope[]
  typeCounts: Record<OrderTypeScope, number>
  statusCounts: Record<OrderStatusScope, number>
  onTypeScopeChange: (scope: OrderTypeScope) => void
  onStatusScopeToggle: (scope: OrderStatusScope) => void
}

export function OrderListTabs({
  typeScope,
  statusScopes,
  typeCounts,
  statusCounts,
  onTypeScopeChange,
  onStatusScopeToggle,
}: Props) {
  return (
    <div className='rounded-2xl border border-slate-200/80 bg-linear-to-b from-slate-50/80 to-white p-3 shadow-sm'>
      <div className='flex flex-col gap-3 lg:flex-row lg:items-end'>
        <section className='min-w-0 flex-1'>
          <div className='mb-2 flex items-center gap-2 px-1'>
            <p className='text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500'>
              Sekmeler
            </p>
            <span className='h-px flex-1 bg-slate-200/80' />
          </div>

          <div className='flex flex-wrap gap-1.5 rounded-xl bg-slate-100/70 p-1'>
            {TYPE_OPTIONS.map((option) => {
              const isActive = typeScope === option.id
              const Icon = option.icon

              return (
                <button
                  key={option.id}
                  type='button'
                  onClick={() => onTypeScopeChange(option.id)}
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
                    {typeCounts[option.id] ?? 0}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <div className='hidden w-px self-stretch bg-slate-200 lg:block' aria-hidden />

        <section className='shrink-0'>
          <div className='mb-2 flex items-center gap-2 px-1'>
            <p className='text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500'>
              Durum
            </p>
            <span className='h-px flex-1 bg-slate-200/80' />
          </div>

          <div className='flex flex-nowrap items-center gap-1.5 rounded-xl border border-dashed border-slate-200 bg-white p-1'>
            {STATUS_OPTIONS.map((option) => {
              const isActive = statusScopes.includes(option.id)
              const Icon = option.icon

              return (
                <button
                  key={option.id}
                  type='button'
                  onClick={() => onStatusScopeToggle(option.id)}
                  className={cn(
                    'inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-all',
                    isActive
                      ? option.id === 'iptal'
                        ? 'border border-rose-200 bg-rose-50 text-rose-700'
                        : 'border border-amber-200 bg-amber-50 text-amber-800'
                      : 'border border-transparent text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <Icon className='size-3.5 shrink-0 opacity-70' />
                  <span>{option.label}</span>
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 text-[11px] tabular-nums',
                      isActive
                        ? option.id === 'iptal'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {statusCounts[option.id] ?? 0}
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
