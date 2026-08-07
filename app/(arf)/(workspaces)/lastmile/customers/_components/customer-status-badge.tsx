'use client'

import type { ComponentType } from 'react'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, PauseCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CustomerStatus } from '../_types/customer'

const statusConfig: Record<
  CustomerStatus,
  { label: string; className: string; icon: ComponentType<{ className?: string }> }
> = {
  aktif: {
    label: 'Aktif',
    className:
      'border-emerald-200/80 bg-emerald-50 font-medium text-emerald-700 shadow-none',
    icon: CheckCircle2,
  },
  pasif: {
    label: 'Pasif',
    className:
      'border-amber-200/80 bg-amber-50 font-medium text-amber-800 shadow-none',
    icon: PauseCircle,
  },
}

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge
      variant='outline'
      className={cn('gap-1 whitespace-nowrap px-2.5 py-0.5', config.className)}
    >
      <Icon className='size-3 shrink-0 opacity-90' />
      {config.label}
    </Badge>
  )
}

export const customerStatusFilterOptions = (
  Object.entries(statusConfig) as [CustomerStatus, (typeof statusConfig)[CustomerStatus]][]
).map(([value, config]) => ({
  label: config.label,
  value,
}))
