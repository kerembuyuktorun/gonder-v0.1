'use client'

import type { ComponentType } from 'react'
import { Building2, LayoutList, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConnectionTypeScope } from '../_types/connection'

const TYPE_OPTIONS: Array<{
  id: ConnectionTypeScope
  label: string
  icon: ComponentType<{ className?: string }>
}> = [
  { id: 'all', label: 'Tümü', icon: LayoutList },
  { id: 'bireysel', label: 'Bireysel', icon: UserRound },
  { id: 'kurumsal', label: 'Kurumsal', icon: Building2 },
]

type Props = {
  typeScope: ConnectionTypeScope
  counts: Record<ConnectionTypeScope, number>
  onTypeScopeChange: (scope: ConnectionTypeScope) => void
  className?: string
}

/** Toolbar: Tümü / Bireysel / Kurumsal — müşteri listesi sekmeleriyle aynı stil */
export function ConnectionListTabs({
  typeScope,
  counts,
  onTypeScopeChange,
  className,
}: Props) {
  return (
    <div className={cn('inline-flex h-8 items-center gap-1', className)}>
      {TYPE_OPTIONS.map((option) => {
        const isActive = typeScope === option.id
        const Icon = option.icon

        return (
          <button
            key={option.id}
            type='button'
            onClick={() => onTypeScopeChange(option.id)}
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
