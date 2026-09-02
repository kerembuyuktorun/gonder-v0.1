'use client'

import { useEffect } from 'react'
import { CalendarClock, Send, Zap } from 'lucide-react'
import {
  CARGO_DELIVERY_SPEEDS,
  DELIVERY_SPEED_HINTS,
  DELIVERY_SPEED_LABELS,
  LOGISTICS_DELIVERY_SPEEDS,
  coerceDeliverySpeed,
  type DeliverySpeed,
} from '../_lib/order-types'
import { SelectionCard } from './selection-card'
import { useWizard } from './wizard-context'

const OPTION_META: Record<DeliverySpeed, { icon: typeof Zap }> = {
  express: { icon: Zap },
  same_day: { icon: Send },
  scheduled: { icon: CalendarClock },
}

export function SpeedTimingBlock() {
  const { draft, patch } = useWizard()
  const isLogistics = draft.service === 'lojistik'
  const options = isLogistics ? LOGISTICS_DELIVERY_SPEEDS : CARGO_DELIVERY_SPEEDS

  useEffect(() => {
    const next = coerceDeliverySpeed(draft.service, draft.deliverySpeed)
    if (next !== draft.deliverySpeed) patch({ deliverySpeed: next })
  }, [draft.deliverySpeed, draft.service, patch])

  return (
    <div>
      <p className='gl-eyebrow'>Teslimat zamanı</p>
      <p className='mt-1 text-xs text-[var(--gl-muted)]'>
        {isLogistics
          ? 'Aynı gün / ertesi gün veya planlı teslim seçebilirsin.'
          : 'Express, aynı gün/ertesi gün veya planlı teslim seçebilirsin.'}
      </p>
      <div className={`mt-3 grid gap-3 ${isLogistics ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
        {options.map((id) => {
          const Icon = OPTION_META[id].icon
          return (
            <SelectionCard
              key={id}
              selected={draft.deliverySpeed === id}
              onSelect={() => patch({ deliverySpeed: id })}
              title={DELIVERY_SPEED_LABELS[id]}
              hint={DELIVERY_SPEED_HINTS[id]}
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
