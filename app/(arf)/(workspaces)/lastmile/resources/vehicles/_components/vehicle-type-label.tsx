'use client'

import type { ComponentType } from 'react'
import { Bike, Box, Car, Truck, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VehicleBodyType, VehicleClass } from '../_types/vehicle'
import {
  VEHICLE_BODY_LABELS,
  VEHICLE_CLASS_LABELS,
} from '../_lib/query-vehicles'

const CLASS_CONFIG: Record<VehicleClass, { icon: LucideIcon; tone: string }> = {
  panelvan: { icon: Car, tone: 'text-slate-600 bg-slate-100' },
  motosiklet: { icon: Bike, tone: 'text-violet-700 bg-violet-50' },
  kamyonet: { icon: Truck, tone: 'text-amber-700 bg-amber-50' },
  minivan: { icon: Box, tone: 'text-indigo-700 bg-indigo-50' },
}

type Props = {
  aracTipi: VehicleClass
  kasaTipi: VehicleBodyType | null
  className?: string
}

export function VehicleTypeLabel({ aracTipi, kasaTipi, className }: Props) {
  const config = CLASS_CONFIG[aracTipi]
  const Icon = config.icon as ComponentType<{ className?: string }>
  const classLabel = VEHICLE_CLASS_LABELS[aracTipi]
  const bodyLabel = kasaTipi ? VEHICLE_BODY_LABELS[kasaTipi] : null

  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-lg',
          config.tone
        )}
      >
        <Icon className='size-3.5' />
      </span>
      <div className='flex min-w-0 flex-col gap-0.5 leading-tight'>
        <span className='truncate text-sm font-medium text-foreground' title={classLabel}>
          {classLabel}
        </span>
        {bodyLabel ? (
          <span className='truncate text-xs text-muted-foreground' title={bodyLabel}>
            {bodyLabel}
          </span>
        ) : null}
      </div>
    </div>
  )
}

export const vehicleClassFilterOptions = (
  Object.entries(VEHICLE_CLASS_LABELS) as [VehicleClass, string][]
).map(([value, label]) => ({ label, value }))
