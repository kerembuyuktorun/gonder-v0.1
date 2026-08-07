'use client'

import type { ComponentType } from 'react'
import { LayoutList, PauseCircle, Radio, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CourierStatusScope } from '../_types/courier'

const STATUS_OPTIONS: Array<{
  id: CourierStatusScope
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
}> = [
  {
    id: 'all',
    label: 'Tümü',
    description: 'Tüm kuryeler',
    icon: LayoutList,
  },
  {
    id: 'yolda',
    label: 'Aktif',
    description: 'Aktif görevde olan kuryeler',
    icon: Truck,
  },
  {
    id: 'bos_ta',
    label: 'Boşta',
    description: 'Müsait / bekleyen kuryeler',
    icon: Radio,
  },
  {
    id: 'pasif',
    label: 'Pasif',
    description: 'Routing dışında bırakılan kuryeler',
    icon: PauseCircle,
  },
]

type Props = {
  statusScope: CourierStatusScope
  counts: Record<CourierStatusScope, number>
  onStatusScopeChange: (scope: CourierStatusScope) => void
  className?: string
}

export function CourierListTabs({
  statusScope,
  counts,
  onStatusScopeChange,
  className,
}: Props) {
  return (
    <div className={cn('inline-flex h-8 flex-wrap items-center gap-1', className)}>
      {STATUS_OPTIONS.map((option) => {
        const isActive = statusScope === option.id
        const Icon = option.icon

        return (
          <button
            key={option.id}
            type='button'
            title={option.description}
            onClick={() => onStatusScopeChange(option.id)}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors',
              isActive
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <Icon className='size-4 shrink-0' />
            <span>{option.label}</span>
            <span
              className={cn(
                'rounded-sm px-1.5 py-0.5 text-[11px] tabular-nums leading-none',
                isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
              )}
            >
              {counts[option.id] ?? 0}
            </span>
          </button>
        )
      })}
    </div>
  )
}
