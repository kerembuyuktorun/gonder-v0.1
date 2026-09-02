'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Headset, Loader2 } from 'lucide-react'
import { CarrierLogo } from '../../../(arf)/(workspaces)/gonder/_components/carrier-logo'
import { buildBreakdown, buildOffers } from '../_lib/pricing'
import { formatTry, type Offer, type OfferQuoteSource } from '../_lib/order-types'
import { OrderSummary } from './order-summary'
import { StepHeader, StepNav } from './step-shell'
import { useWizard } from './wizard-context'

export function StepOffers() {
  const { draft, next, back, selectedOffer, setSelectedOffer } = useWizard()
  const [loading, setLoading] = useState(true)

  const breakdown = useMemo(() => buildBreakdown(draft), [draft])
  const offers = useMemo(() => (breakdown ? buildOffers(draft, breakdown) : []), [breakdown, draft])

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 1100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (loading || offers.length === 0) return
    setSelectedOffer((current) => {
      if (current && offers.some((offer) => offer.id === current.id)) {
        return offers.find((offer) => offer.id === current.id) ?? current
      }
      return offers.find((offer) => offer.plan === 'instant') ?? offers[0]
    })
  }, [loading, offers, setSelectedOffer])

  if (!breakdown) {
    return (
      <div>
        <StepHeader title='Teklif hesaplanamadı' description='Önceki adımlara dönüp bilgileri tamamla.' />
        <StepNav onBack={back} />
      </div>
    )
  }

  const isLogistics = draft.service === 'lojistik'
  const planDelta = selectedOffer ? selectedOffer.price - breakdown.total : 0

  return (
    <div>
      <StepHeader
        title='Teklifini seç'
        description='Talebin için oluşan taşıma seçeneklerini hemen değerlendirebilirsin. Gönder ağı uygun alternatifleri senin için oluşturur.'
      />

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]'>
        <div className='space-y-4'>
          {isLogistics && !loading ? (
            <div className='flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-50/80 p-4'>
              <Headset className='mt-0.5 size-5 shrink-0 text-amber-800' aria-hidden />
              <div>
                <p className='text-sm font-semibold text-[var(--gl-ink)]'>
                  Lojistik uzmanımız talebinizi inceliyor.
                </p>
                <p className='mt-1 text-sm leading-relaxed text-[var(--gl-muted)]'>
                  Talebiniz için uygun taşıyıcı ve araç alternatifleri değerlendiriliyor. Mevcut
                  teklifleriniz varsa bunları kullanmaya devam edebilirsiniz.
                </p>
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className='space-y-4'>
              <div className='flex items-center gap-2.5 text-sm text-[var(--gl-muted)]'>
                <Loader2 className='size-4 animate-spin' aria-hidden />
                Gönder ağı talebiniz için uygun seçenekleri oluşturuyor…
              </div>
              {[0, 1, 2].map((index) => (
                <div key={index} className='h-32 animate-pulse rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-subtle)]' />
              ))}
            </div>
          ) : (
            <div className='space-y-3'>
              {offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  selected={selectedOffer?.id === offer.id}
                  onSelect={() => setSelectedOffer(offer)}
                />
              ))}
              <div className='rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-subtle)] p-4'>
                <p className='text-sm font-semibold text-[var(--gl-ink)]'>Teklifleriniz hazır.</p>
                <p className='mt-1 text-sm leading-relaxed text-[var(--gl-muted)]'>
                  Kullanılabilir seçenekleri hemen değerlendirebilirsiniz. Gönder ağı talebinizi
                  işlemeye devam ederken farklı bir taşıyıcı veya daha uygun bir teklif oluşması da
                  mümkün olabilir.
                </p>
              </div>
            </div>
          )}
        </div>

        <aside className='space-y-4 lg:sticky lg:top-24 lg:h-fit'>
          <OrderSummary />

          <div className='rounded-2xl border border-[var(--gl-border)] bg-white p-4'>
            <p className='gl-eyebrow'>Fiyat dökümü</p>
            <dl className='mt-3 space-y-2 text-sm'>
              {breakdown.lines.map((line) => (
                <div key={line.label} className='flex items-start justify-between gap-3'>
                  <dt className='text-[var(--gl-muted)]'>
                    {line.label}
                    {line.detail ? <span className='block text-xs opacity-80'>{line.detail}</span> : null}
                  </dt>
                  <dd className='shrink-0 font-medium tabular-nums'>{formatTry(line.amount)}</dd>
                </div>
              ))}
              <div className='flex items-center justify-between border-t border-[var(--gl-border)] pt-2'>
                <dt className='text-[var(--gl-muted)]'>KDV (%20)</dt>
                <dd className='font-medium tabular-nums'>{formatTry(breakdown.vat)}</dd>
              </div>
              {planDelta !== 0 ? (
                <div className='flex items-center justify-between'>
                  <dt className='text-[var(--gl-muted)]'>
                    {planDelta < 0 ? `${selectedOffer?.carrier} farkı` : `${selectedOffer?.carrier} farkı`}
                  </dt>
                  <dd
                    className={`font-medium tabular-nums ${planDelta < 0 ? 'text-[var(--gl-petrol)]' : 'text-[var(--gl-ink)]'}`}
                  >
                    {planDelta < 0 ? '−' : '+'}
                    {formatTry(Math.abs(planDelta))}
                  </dd>
                </div>
              ) : null}
              <div className='flex items-center justify-between border-t border-[var(--gl-border)] pt-2.5'>
                <dt className='text-sm font-semibold text-[var(--gl-ink)]'>Toplam</dt>
                <dd className='text-lg font-bold tabular-nums text-[var(--gl-ink)]'>
                  {selectedOffer ? formatTry(selectedOffer.price) : formatTry(breakdown.total)}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <StepNav
        onBack={back}
        onNext={next}
        nextLabel='Teklifi Seç'
        nextDisabled={loading || !selectedOffer}
        helper={selectedOffer ? `${selectedOffer.carrier} · ${selectedOffer.etaLabel}` : undefined}
      />
    </div>
  )
}

const SOURCE_LABELS: Record<OfferQuoteSource, string> = {
  instant: 'Anlık Teklif',
  network: 'Gönder Eşleşmesi',
  specialist: 'Uzman Teklifi',
}

const SOURCE_CLASS: Record<OfferQuoteSource, string> = {
  instant: 'bg-sky-50 text-sky-800',
  network: 'bg-violet-50 text-violet-800',
  specialist: 'bg-amber-50 text-amber-800',
}

function OfferCard({
  offer,
  selected,
  onSelect,
}: {
  offer: Offer
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type='button'
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full flex-col gap-4 rounded-2xl border-2 p-4 text-left transition-all sm:flex-row sm:items-center ${
        selected
          ? 'border-[var(--gl-petrol)] bg-[var(--gl-petrol-soft)] shadow-[0_20px_44px_-28px_rgb(25_91_85_/_0.5)]'
          : 'border-[var(--gl-border)] bg-white hover:border-[var(--gl-border-strong)]'
      }`}
    >
      <CarrierLogo name={offer.carrier} />

      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-2'>
          <p className='text-base font-bold text-[var(--gl-ink)]'>{offer.carrier}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${SOURCE_CLASS[offer.quoteSource]}`}
          >
            {SOURCE_LABELS[offer.quoteSource]}
          </span>
          {offer.badge ? (
            <span className='rounded-full bg-[var(--gl-yellow-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--gl-ink)]'>
              {offer.badge}
            </span>
          ) : null}
        </div>
        <p className='mt-1 text-sm leading-relaxed text-[var(--gl-muted)]'>{offer.description}</p>
        <ul className='mt-2 flex flex-wrap gap-x-4 gap-y-1'>
          <li className='inline-flex items-center gap-1.5 text-xs text-[var(--gl-muted)]'>
            <Check className='size-3 text-[var(--gl-petrol)]' aria-hidden />
            {offer.serviceLabel}
          </li>
          <li className='inline-flex items-center gap-1.5 text-xs text-[var(--gl-muted)]'>
            <Check className='size-3 text-[var(--gl-petrol)]' aria-hidden />
            {offer.etaLabel}
          </li>
          {offer.perks.map((perk) => (
            <li key={perk} className='inline-flex items-center gap-1.5 text-xs text-[var(--gl-muted)]'>
              <Check className='size-3 text-[var(--gl-petrol)]' aria-hidden />
              {perk}
            </li>
          ))}
        </ul>
      </div>

      <div className='flex shrink-0 flex-col items-start gap-2 sm:items-end'>
        <p className='text-xl font-bold text-[var(--gl-ink)]'>{formatTry(offer.price)}</p>
        <p className='text-xs text-[var(--gl-muted)]'>{offer.etaLabel}</p>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            selected
              ? 'bg-[var(--gl-petrol)] text-white'
              : 'bg-[var(--gl-subtle)] text-[var(--gl-ink)]'
          }`}
        >
          Teklifi Seç
        </span>
      </div>
    </button>
  )
}
