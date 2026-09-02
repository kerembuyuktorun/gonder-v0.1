'use client'

import { ArrowLeftRight, CalendarDays } from 'lucide-react'
import { AddressField } from './address-field'
import { RouteMap } from './route-map'
import { StepHeader, StepNav } from './step-shell'
import { useWizard } from './wizard-context'

export function StepRoute() {
  const { draft, patch, setDraft, next } = useWizard()

  const swap = () => {
    patch({ origin: draft.destination, destination: draft.origin })
  }

  const ready = Boolean(draft.origin && draft.destination)
  const sameSpot = Boolean(draft.origin && draft.destination && draft.origin.id === draft.destination.id)

  return (
    <div>
      <StepHeader
        title='Nereden nereye gidecek?'
        description='Çıkış ve varış adresini ara, listeden seç. Mesafe ve tahmini süre otomatik hesaplanır.'
      />

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
        <div className='space-y-4'>
          <AddressField
            label='Çıkış adresi'
            placeholder='Örn. Gebze, Tuzla, Ostim…'
            tone='origin'
            value={draft.origin}
            onChange={(place) => patch({ origin: place })}
          />

          <div className='flex justify-center'>
            <button
              type='button'
              onClick={swap}
              disabled={!draft.origin && !draft.destination}
              className='inline-flex items-center gap-2 rounded-full border border-[var(--gl-border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--gl-muted)] transition-colors hover:border-[var(--gl-ink)] hover:text-[var(--gl-ink)] disabled:opacity-40'
            >
              <ArrowLeftRight className='size-3.5' aria-hidden />
              Yönü değiştir
            </button>
          </div>

          <AddressField
            label='Varış adresi'
            placeholder='Örn. Bornova, Nilüfer, Çankaya…'
            tone='destination'
            value={draft.destination}
            onChange={(place) => patch({ destination: place })}
          />

          <div>
            <label className='gl-eyebrow' htmlFor='loading-date'>
              Yükleme tarihi
            </label>
            <div className='relative mt-2'>
              <CalendarDays
                className='pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--gl-muted)]'
                aria-hidden
              />
              <input
                id='loading-date'
                type='date'
                value={draft.extras.loadingDate}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, extras: { ...prev.extras, loadingDate: e.target.value } }))
                }
                className='w-full rounded-xl border-2 border-[var(--gl-border)] bg-white py-3 pl-10 pr-3 text-sm text-[var(--gl-ink)] outline-none transition-colors focus:border-[var(--gl-petrol)]'
              />
            </div>
            <p className='mt-1.5 text-xs text-[var(--gl-muted)]'>İstersen boş bırak, sonraki adımlarda da seçebilirsin.</p>
          </div>

          {sameSpot ? (
            <p className='rounded-xl bg-[var(--gl-accent-soft)] px-3 py-2 text-xs text-[var(--gl-accent)]'>
              Çıkış ve varış aynı adres. Farklı bir varış noktası seç.
            </p>
          ) : null}
        </div>

        <div className='lg:sticky lg:top-24'>
          <RouteMap origin={draft.origin} destination={draft.destination} />
        </div>
      </div>

      <StepNav hideBack onNext={next} nextDisabled={!ready || sameSpot} />
    </div>
  )
}
