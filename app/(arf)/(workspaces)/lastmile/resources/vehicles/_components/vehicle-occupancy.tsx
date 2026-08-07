'use client'

import { cn } from '@/lib/utils'
import { occupancyTone } from '../_lib/query-vehicles'

type Props = {
  volumePct: number
  weightPct: number
  maxVolumeM3: number
  maxWeightKg: number
}

function Meter({
  label,
  capacity,
  pct,
}: {
  label: string
  capacity: string
  pct: number
}) {
  const tone = occupancyTone(pct)

  return (
    <div className='min-w-0 space-y-1'>
      <div className='min-w-0 truncate text-xs leading-tight'>
        <span className='font-medium text-slate-700'>{label}</span>
        <span className='mx-1 text-slate-300'>·</span>
        <span className='tabular-nums text-muted-foreground'>{capacity}</span>
        <span className='mx-1 text-slate-300'>·</span>
        <span className='tabular-nums font-semibold text-foreground'>%{pct}</span>
      </div>
      <div className='h-1.5 w-32 overflow-hidden rounded-full bg-slate-100'>
        <div
          className={cn(
            'h-full rounded-full transition-[width]',
            tone === 'critical' && 'bg-rose-500',
            tone === 'warn' && 'bg-amber-400',
            tone === 'ok' && 'bg-emerald-500'
          )}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
    </div>
  )
}

export function VehicleOccupancy({
  volumePct,
  weightPct,
  maxVolumeM3,
  maxWeightKg,
}: Props) {
  return (
    <div className='flex min-w-[170px] flex-col gap-2 py-0.5'>
      <Meter
        label='Hacim'
        capacity={`${maxVolumeM3} m³`}
        pct={volumePct}
      />
      <Meter
        label='Ağırlık'
        capacity={`${maxWeightKg} kg`}
        pct={weightPct}
      />
    </div>
  )
}
