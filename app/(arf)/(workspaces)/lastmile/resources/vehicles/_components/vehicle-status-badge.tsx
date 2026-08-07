'use client'

import type { ComponentType } from 'react'
import { Badge } from '@/components/ui/badge'
import { PauseCircle, Radio, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VehicleOperationalStatus } from '../_types/vehicle'

const statusConfig: Record<
  VehicleOperationalStatus,
  { label: string; className: string; icon: ComponentType<{ className?: string }> }
> = {
  yolda: {
    label: 'Aktif Rotada',
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

export function VehicleStatusBadge({
  status,
  routeLabel,
}: {
  status: VehicleOperationalStatus
  /** Aktif rota etiketi — örn. RT-4011 → "Aktif RT-4011 Rotada" */
  routeLabel?: string | null
}) {
  const config = statusConfig[status]
  const Icon = config.icon
  const label =
    status === 'yolda' && routeLabel
      ? `Aktif ${routeLabel} Rotada`
      : config.label

  return (
    <Badge
      variant='outline'
      className={cn('gap-1 whitespace-nowrap px-2.5 py-0.5', config.className)}
    >
      <Icon className='size-3 shrink-0 opacity-90' />
      {label}
    </Badge>
  )
}

export const vehicleStatusFilterOptions = (
  Object.entries(statusConfig) as [
    VehicleOperationalStatus,
    (typeof statusConfig)[VehicleOperationalStatus],
  ][]
).map(([value, config]) => ({
  label: config.label,
  value,
}))
