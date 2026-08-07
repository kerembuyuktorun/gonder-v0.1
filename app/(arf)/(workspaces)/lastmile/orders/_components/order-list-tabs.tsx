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
    <div className='overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-100/70 p-1 shadow-sm'>
      <div className='flex w-max min-w-full flex-nowrap items-center gap-1'>
        {TYPE_OPTIONS.map((option) => {
          const isActive = typeScope === option.id
          const Icon = option.icon

          return (
            <button
              key={option.id}
              type='button'
              onClick={() => onTypeScopeChange(option.id)}
              className={cn(
                'inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-all',
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

        <span className='mx-0.5 h-5 w-px shrink-0 bg-slate-300/80' aria-hidden />

        {STATUS_OPTIONS.map((option) => {
          const isActive = statusScopes.includes(option.id)
          const Icon = option.icon

          return (
            <button
              key={option.id}
              type='button'
              onClick={() => onStatusScopeToggle(option.id)}
              className={cn(
                'inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-all',
                isActive
                  ? option.id === 'iptal'
                    ? 'border border-rose-200 bg-rose-50 text-rose-700'
                    : 'border border-amber-200 bg-amber-50 text-amber-800'
                  : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
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
                    : 'bg-white/70 text-slate-500'
                )}
              >
                {statusCounts[option.id] ?? 0}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
