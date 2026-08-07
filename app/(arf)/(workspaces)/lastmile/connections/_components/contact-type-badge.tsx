'use client'

import type { ComponentType } from 'react'
import { Badge } from '@/components/ui/badge'
import { Building2, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConnectionContactKind } from '../_types/connection'

const typeConfig: Record<
  ConnectionContactKind,
  { label: string; className: string; icon: ComponentType<{ className?: string }> }
> = {
  bireysel: {
    label: 'Bireysel',
    className: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
    icon: UserRound,
  },
  kurumsal: {
    label: 'Kurumsal',
    className: 'bg-secondary/10 text-secondary border-secondary/25',
    icon: Building2,
  },
}

export function ContactTypeBadge({ type }: { type: ConnectionContactKind }) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <Badge variant='outline' className={cn('whitespace-nowrap font-medium', config.className)}>
      <Icon className='mr-1.5 size-3 shrink-0' />
      {config.label}
    </Badge>
  )
}

export const contactTypeFilterOptions = (
  Object.entries(typeConfig) as [ConnectionContactKind, (typeof typeConfig)[ConnectionContactKind]][]
).map(([value, config]) => ({
  label: config.label,
  value,
}))
