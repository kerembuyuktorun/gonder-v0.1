'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, BellRing, CalendarClock, Check, Loader2, PiggyBank, Zap } from 'lucide-react'
import { buildBreakdown, buildOffers } from '../_lib/pricing'
import { formatTry, type Offer } from '../_lib/order-types'
import { OrderSummary } from './order-summary'
import { StepHeader, StepNav } from './step-shell'
import { useWizard } from './wizard-context'

const PLAN_ICON = {
  instant: Zap,
  flexible: CalendarClock,
  backload: PiggyBank,
  express: Zap,
  economy: PiggyBank,
} as const

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
  const cheapest = offers.reduce((min, offer) => (offer.price < min.price ? offer : min), offers[0])
  const instant = offers.find((offer) => offer.plan === 'instant')
  const maxSaving = instant && cheapest ? instant.price - cheapest.price : 0

  const planDelta = selectedOffer ? selectedOffer.price - breakdown.total : 0

  return (
    <div>
      <StepHeader
        title='Teklifini seç'
        description='Bilgilerini kontrol et, sana en uygun planı seç. Ödeme öncesinde her şeyi bir kez daha göreceksin.'
      />

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]'>
        <div className='space-y-4'>
          {isLogistics && !loading && maxSaving > 0 ? (
            <div className='flex items-start gap-3 rounded-2xl border border-[var(--gl-yellow)] bg-[var(--gl-yellow-soft)] p-4'>
              <BellRing className='mt-0.5 size-5 shrink-0 text-[var(--gl-accent)]' aria-hidden />
              <div>
                <p className='text-sm font-semibold text-[var(--gl-ink)]'>
                  Bu hatta beklersen {formatTry(maxSaving)} tasarruf edebilirsin
                </p>
                <p className='mt-1 text-sm leading-relaxed text-[var(--gl-muted)]'>
                  {draft.origin?.city} – {draft.destination?.city} hattında sık dönüş yükü çıkıyor. Yükleme tarihini
                  esnetir ya da dönüş yükü eşleşmesini beklersen navlun belirgin şekilde düşüyor. Acelen varsa anında
                  onay planı tarihini garanti eder.
                </p>
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className='space-y-4'>
              <div className='flex items-center gap-2.5 text-sm text-[var(--gl-muted)]'>
                <Loader2 className='size-4 animate-spin' aria-hidden />
                Taşıyıcı ağı taranıyor, teklifin hazırlanıyor…
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
            </div>
          )}

          {isLogistics && !loading ? (
            <p className='flex items-start gap-2 rounded-xl bg-[var(--gl-subtle)] p-3 text-xs leading-relaxed text-[var(--gl-muted)]'>
              <AlertCircle className='mt-0.5 size-3.5 shrink-0' aria-hidden />
              Dönüş yükü planında araç eşleşmesi garanti değildir. Eşleşme bulunduğunda sana bildirim gelir; onaylamazsan
              herhangi bir ücret tahakkuk etmez.
            </p>
          ) : null}
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
                    {planDelta < 0 ? `${selectedOffer?.title} indirimi` : `${selectedOffer?.title} farkı`}
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
        nextLabel={selectedOffer?.requiresMatching ? 'Talebi Onayla' : 'Teklifi Onayla ve Öde'}
        nextDisabled={loading || !selectedOffer}
        helper={selectedOffer ? `${selectedOffer.title} · ${selectedOffer.etaLabel}` : undefined}
      />
    </div>
  )
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
  const Icon = PLAN_ICON[offer.plan]
  const saving = offer.comparePrice ? offer.comparePrice - offer.price : 0

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
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
          selected ? 'bg-[var(--gl-petrol)] text-white' : 'bg-[var(--gl-subtle)] text-[var(--gl-petrol)]'
        }`}
      >
        <Icon className='size-5' aria-hidden />
      </span>

      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-2'>
          <p className='text-base font-bold text-[var(--gl-ink)]'>{offer.title}</p>
          {offer.badge ? (
            <span className='rounded-full bg-[var(--gl-yellow-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--gl-ink)]'>
              {offer.badge}
            </span>
          ) : null}
        </div>
        <p className='mt-1 text-sm leading-relaxed text-[var(--gl-muted)]'>{offer.description}</p>
        <ul className='mt-2 flex flex-wrap gap-x-4 gap-y-1'>
          {offer.perks.map((perk) => (
            <li key={perk} className='inline-flex items-center gap-1.5 text-xs text-[var(--gl-muted)]'>
              <Check className='size-3 text-[var(--gl-petrol)]' aria-hidden />
              {perk}
            </li>
          ))}
        </ul>
      </div>

      <div className='shrink-0 text-left sm:text-right'>
        {saving > 0 ? (
          <p className='text-xs text-[var(--gl-muted)] line-through'>{formatTry(offer.comparePrice ?? 0)}</p>
        ) : null}
        <p className='text-xl font-bold text-[var(--gl-ink)]'>{formatTry(offer.price)}</p>
        <p className='text-xs text-[var(--gl-muted)]'>{offer.etaLabel}</p>
        {saving > 0 ? (
          <p className='mt-1 text-xs font-semibold text-[var(--gl-petrol)]'>{formatTry(saving)} tasarruf</p>
        ) : null}
      </div>
    </button>
  )
}
