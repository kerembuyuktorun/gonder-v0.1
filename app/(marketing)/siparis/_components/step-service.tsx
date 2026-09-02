'use client'

import { Check, Package, Truck } from 'lucide-react'
import { StepHeader, StepNav } from './step-shell'
import { useWizard } from './wizard-context'
import type { ServiceType } from '../_lib/order-types'

const OPTIONS: Array<{
  id: ServiceType
  title: string
  tagline: string
  bullets: string[]
  icon: typeof Package
}> = [
  {
    id: 'kargo',
    title: 'Kargo',
    tagline: 'Koli ve paket gönderileri',
    bullets: ['Kapıdan kapıya teslim', 'Desi/kg üzerinden anlık fiyat', 'Tek parçadan başlar'],
    icon: Package,
  },
  {
    id: 'lojistik',
    title: 'Lojistik',
    tagline: 'Palet, parsiyel ve komple araç',
    bullets: ['Komple (FTL) ve parsiyel (LTL)', 'Araç ve kasa tipi seçimi', 'Esnek tarihte daha uygun navlun'],
    icon: Truck,
  },
]

export function StepService() {
  const { draft, patch, next, back } = useWizard()

  return (
    <div>
      <StepHeader
        title='Nasıl taşıyalım?'
        description='Gönderinin boyutuna göre uygun hizmeti seç. Sonraki adımda detayları isteyeceğiz.'
      />

      <div className='grid gap-4 sm:grid-cols-2'>
        {OPTIONS.map((option) => {
          const Icon = option.icon
          const selected = draft.service === option.id
          return (
            <button
              key={option.id}
              type='button'
              onClick={() => patch({ service: option.id, logisticsMode: null })}
              aria-pressed={selected}
              className={`relative rounded-2xl border-2 p-5 text-left transition-all ${
                selected
                  ? 'border-[var(--gl-petrol)] bg-[var(--gl-petrol-soft)] shadow-[0_20px_44px_-28px_rgb(25_91_85_/_0.5)]'
                  : 'border-[var(--gl-border)] bg-white hover:border-[var(--gl-border-strong)]'
              }`}
            >
              <span
                className={`flex size-11 items-center justify-center rounded-xl ${
                  selected ? 'bg-[var(--gl-petrol)] text-white' : 'bg-[var(--gl-subtle)] text-[var(--gl-petrol)]'
                }`}
              >
                <Icon className='size-5' aria-hidden />
              </span>

              <p className='mt-4 text-lg font-bold text-[var(--gl-ink)]'>{option.title}</p>
              <p className='text-sm text-[var(--gl-muted)]'>{option.tagline}</p>

              <ul className='mt-4 space-y-2'>
                {option.bullets.map((bullet) => (
                  <li key={bullet} className='flex items-start gap-2 text-sm text-[var(--gl-muted)]'>
                    <Check className='mt-0.5 size-4 shrink-0 text-[var(--gl-petrol)]' aria-hidden />
                    {bullet}
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>

      <StepNav onBack={back} onNext={next} nextDisabled={!draft.service} />
    </div>
  )
}
