'use client'

import { CalendarClock, Send, Zap } from 'lucide-react'
import {
  DELIVERY_SPEED_HINTS,
  DELIVERY_SPEED_LABELS,
  type DeliverySpeed,
} from '../_lib/order-types'
import { SelectionCard } from './selection-card'
import { useWizard } from './wizard-context'

const OPTIONS: Array<{
  id: DeliverySpeed
  icon: typeof Zap
}> = [
  { id: 'express', icon: Zap },
  { id: 'same_day', icon: Send },
  { id: 'scheduled', icon: CalendarClock },
]

export function SpeedTimingBlock() {
  const { draft, patch } = useWizard()

  return (
    <div>
      <p className='gl-eyebrow'>Teslimat zamanı</p>
      <p className='mt-1 text-xs text-[var(--gl-muted)]'>
        Tüm gönderi tiplerinde Express, aynı gün/ertesi gün veya planlı teslim seçebilirsin.
      </p>
      <div className='mt-3 grid gap-3 sm:grid-cols-3'>
        {OPTIONS.map((option) => {
          const Icon = option.icon
          return (
            <SelectionCard
              key={option.id}
              selected={draft.deliverySpeed === option.id}
              onSelect={() => patch({ deliverySpeed: option.id })}
              title={DELIVERY_SPEED_LABELS[option.id]}
              hint={DELIVERY_SPEED_HINTS[option.id]}
              art={
                <span className='flex size-14 items-center justify-center rounded-xl bg-[var(--gl-subtle)]'>
                  <Icon className='size-6 text-[var(--gl-petrol)]' aria-hidden />
                </span>
              }
            />
          )
        })}
      </div>
    </div>
  )
}
