'use client'

import type { ComponentType } from 'react'
import { Badge } from '@/components/ui/badge'
import { PauseCircle, Radio, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CourierOperationalStatus } from '../_types/courier'

const statusConfig: Record<
  CourierOperationalStatus,
  { label: string; className: string; icon: ComponentType<{ className?: string }> }
> = {
  yolda: {
    label: 'Aktif',
    className: 'border-emerald-200/80 bg-emerald-50 font-medium text-emerald-700 shadow-none',
    icon: Truck,
  },
  bos_ta: {
    label: 'Boşta',
    className: 'border-sky-200/80 bg-sky-50 font-medium text-sky-700 shadow-none',
    icon: Radio,
  },
  pasif: {
    label: 'Pasif',
    className: 'border-rose-200/80 bg-rose-50 font-medium text-rose-700 shadow-none',
    icon: PauseCircle,
  },
}

export function CourierStatusBadge({ status }: { status: CourierOperationalStatus }) {
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
