'use client'

import { ArrowLeftRight, CalendarDays } from 'lucide-react'
import { AddressField } from '../../../../../../(marketing)/siparis/_components/address-field'
import { RouteMap } from '../../../../../../(marketing)/siparis/_components/route-map'
import { useWizard } from '../../../../../../(marketing)/siparis/_components/wizard-context'
import type { PlaceResult } from '../../../../../../(marketing)/siparis/_lib/order-types'
import { PartyAddressCard } from '../../../_components/party-address-card'
import { locationToPlace, placeToAddressDraft, placesAreSame } from '../../../_lib/siparis-draft-map'
import type { AddressDraft } from '../../../_types/price-calculation'

function draftFromPlace(place: PlaceResult | null): AddressDraft | null {
  return place ? placeToAddressDraft(place) : null
}

export function CreateShipmentAddressSection() {
  const { draft, patch, setDraft } = useWizard()

  const swap = () => {
    patch({ origin: draft.destination, destination: draft.origin })
  }

  const sameSpot = placesAreSame(draft.origin, draft.destination)

  function applyPlace(side: 'origin' | 'destination', place: PlaceResult | null) {
    patch({ [side]: place })
  }

  function applyCustomerAddress(side: 'origin' | 'destination', value: AddressDraft | null) {
    applyPlace(side, value ? locationToPlace(value) : null)
  }

  return (
    <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
      <div className='space-y-4'>
        <AddressField
          label='Çıkış adresi'
          placeholder='Örn. Gebze, Tuzla, Ostim…'
          tone='origin'
          value={draft.origin}
          onChange={(place) => applyPlace('origin', place)}
        />
        <PartyAddressCard
          title='Kayıtlı müşteri seç'
          customerLabel='Gönderici müşteri'
          pinLabel='Göndericiyi sabitle'
          value={draftFromPlace(draft.origin)}
          onChange={(value) => applyCustomerAddress('origin', value)}
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
          onChange={(place) => applyPlace('destination', place)}
        />
        <PartyAddressCard
          title='Kayıtlı müşteri seç'
          customerLabel='Alıcı müşteri'
          pinLabel='Alıcıyı sabitle'
          value={draftFromPlace(draft.destination)}
          onChange={(value) => applyCustomerAddress('destination', value)}
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
                setDraft((prev) => ({
                  ...prev,
                  extras: { ...prev.extras, loadingDate: e.target.value },
                }))
              }
              className='w-full rounded-xl border-2 border-[var(--gl-border)] bg-white py-3 pl-10 pr-3 text-sm text-[var(--gl-ink)] outline-none transition-colors focus:border-[var(--gl-petrol)]'
            />
          </div>
          <p className='mt-1.5 text-xs text-[var(--gl-muted)]'>
            İstersen boş bırak, operasyon planlarken de seçebilirsin.
          </p>
        </div>

        {sameSpot ? (
          <p className='rounded-xl bg-[var(--gl-accent-soft)] px-3 py-2 text-xs text-[var(--gl-accent)]'>
            Çıkış ve varış aynı adres. Farklı bir varış noktası seç.
          </p>
        ) : null}
      </div>

      <div className='lg:sticky lg:top-24 lg:h-fit'>
        <RouteMap origin={draft.origin} destination={draft.destination} />
      </div>
    </div>
  )
}
