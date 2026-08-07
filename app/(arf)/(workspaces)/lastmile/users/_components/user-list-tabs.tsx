'use client'

import type { ComponentType } from 'react'
import { LayoutList, Mail, PauseCircle, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserStatusScope } from '../_types/user'

const STATUS_OPTIONS: Array<{
  id: UserStatusScope
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
}> = [
  {
    id: 'all',
    label: 'Tümü',
    description: 'Tüm kullanıcılar',
    icon: LayoutList,
  },
  {
    id: 'aktif',
    label: 'Aktif',
    description: 'Sisteme erişimi olan kullanıcılar',
    icon: ShieldCheck,
  },
  {
    id: 'pasif',
    label: 'Pasif',
    description: 'Pasife alınan kullanıcılar',
    icon: PauseCircle,
  },
  {
    id: 'davet',
    label: 'Davet',
    description: 'Davet edilmiş, henüz giriş yapmamış kullanıcılar',
    icon: Mail,
  },
]

type Props = {
  statusScope: UserStatusScope
  counts: Record<UserStatusScope, number>
  onStatusScopeChange: (scope: UserStatusScope) => void
  className?: string
}

export function UserListTabs({
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
