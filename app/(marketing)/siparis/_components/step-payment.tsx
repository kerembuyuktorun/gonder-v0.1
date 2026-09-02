'use client'

import { useMemo, useState } from 'react'
import { CreditCard, Info, Loader2, Lock, ShieldCheck } from 'lucide-react'
import { formatTry } from '../_lib/order-types'
import { buildBreakdown } from '../_lib/pricing'
import { OrderSummary } from './order-summary'
import { TextField } from './inputs'
import { StepHeader, StepNav } from './step-shell'
import { useWizard } from './wizard-context'

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function StepPayment() {
  const { draft, setDraft, back, next, selectedOffer, setOrderRef } = useWizard()
  const [card, setCard] = useState({ number: '', holder: '', expiry: '', cvc: '' })
  const [processing, setProcessing] = useState(false)

  const breakdown = useMemo(() => buildBreakdown(draft), [draft])
  const amount = selectedOffer?.price ?? breakdown?.total ?? 0
  const preAuthOnly = Boolean(selectedOffer?.requiresMatching)

  const setContact = (partial: Partial<typeof draft.contact>) => {
    setDraft((prev) => ({ ...prev, contact: { ...prev.contact, ...partial } }))
  }

  const contactValid =
    draft.contact.name.trim().length > 2 &&
    draft.contact.phone.replace(/\D/g, '').length >= 10 &&
    /.+@.+\..+/.test(draft.contact.email)

  const cardValid =
    card.number.replace(/\s/g, '').length === 16 &&
    card.holder.trim().length > 2 &&
    card.expiry.length === 5 &&
    card.cvc.length >= 3

  const submit = () => {
    setProcessing(true)
    setTimeout(() => {
      setOrderRef(`GND-${Math.floor(100000 + Math.random() * 899999)}`)
      setProcessing(false)
      next()
    }, 1600)
  }

  return (
    <div>
      <StepHeader
        title={preAuthOnly ? 'Bilgileri onayla' : 'Ödeme'}
        description={
          preAuthOnly
            ? 'Dönüş yükü eşleşmesi bulunana kadar tahsilat yapılmaz. Kart bilgisi yalnızca ön provizyon için alınır.'
            : 'Tüm bilgileri son bir kez kontrol et, ardından ödemeyi tamamla.'
        }
      />

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]'>
        <div className='space-y-6'>
          <section className='rounded-2xl border border-[var(--gl-border)] bg-white p-5'>
            <p className='gl-eyebrow'>İletişim bilgileri</p>
            <div className='mt-3 grid gap-3 sm:grid-cols-2'>
              <TextField
                label='Ad soyad'
                placeholder='Adınız ve soyadınız'
                autoComplete='name'
                value={draft.contact.name}
                onChange={(v) => setContact({ name: v })}
              />
              <TextField
                label='Firma (opsiyonel)'
                placeholder='Firma unvanı'
                autoComplete='organization'
                value={draft.contact.company}
                onChange={(v) => setContact({ company: v })}
              />
              <TextField
                label='Telefon'
                placeholder='05XX XXX XX XX'
                inputMode='tel'
                autoComplete='tel'
                value={draft.contact.phone}
                onChange={(v) => setContact({ phone: v })}
              />
              <TextField
                label='E-posta'
                placeholder='ornek@firma.com'
                type='email'
                inputMode='email'
                autoComplete='email'
                value={draft.contact.email}
                onChange={(v) => setContact({ email: v })}
              />
            </div>
            <p className='mt-4 flex items-start gap-2 text-xs leading-relaxed text-[var(--gl-muted)]'>
              <Info className='mt-0.5 size-3.5 shrink-0' aria-hidden />
              Bu e-postaya kayıtlı hesabınız varsa gönderi oraya düşer. Yoksa e-postanıza otomatik
              hesap oluşturulur; gelen link ile girip gönderiyi takip edebilirsiniz.
            </p>
          </section>

          <section className='rounded-2xl border border-[var(--gl-border)] bg-white p-5'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <p className='gl-eyebrow'>Kart bilgileri</p>
            </div>

            <div className='mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start'>
              <div className='grid gap-3 sm:grid-cols-2'>
                <div className='sm:col-span-2'>
                  <TextField
                    label='Kart numarası'
                    placeholder='0000 0000 0000 0000'
                    inputMode='numeric'
                    value={card.number}
                    onChange={(v) => setCard((c) => ({ ...c, number: formatCardNumber(v) }))}
                  />
                </div>
                <div className='sm:col-span-2'>
                  <TextField
                    label='Kart üzerindeki isim'
                    placeholder='AD SOYAD'
                    value={card.holder}
                    onChange={(v) => setCard((c) => ({ ...c, holder: v.toLocaleUpperCase('tr-TR') }))}
                  />
                </div>
                <TextField
                  label='Son kullanma'
                  placeholder='AA/YY'
                  inputMode='numeric'
                  value={card.expiry}
                  onChange={(v) => setCard((c) => ({ ...c, expiry: formatExpiry(v) }))}
                />
                <TextField
                  label='CVC'
                  placeholder='123'
                  inputMode='numeric'
                  maxLength={4}
                  value={card.cvc}
                  onChange={(v) => setCard((c) => ({ ...c, cvc: v.replace(/\D/g, '').slice(0, 4) }))}
                />
              </div>

              <div className='hidden w-64 min-w-0 @container rounded-2xl bg-[var(--gl-ink)] p-5 text-white lg:block'>
                <CreditCard className='size-7 opacity-70' aria-hidden />
                <p className='mt-6 flex w-full min-w-0 flex-nowrap items-center justify-start gap-x-[0.38em] font-mono text-[min(15px,calc(100cqi/14.5))] leading-none tracking-[0.05em] tabular-nums'>
                  {(card.number || '•••• •••• •••• ••••').split(/\s+/).map((group, index) => (
                    <span key={`${group}-${index}`} className='shrink-0'>
                      {group}
                    </span>
                  ))}
                </p>
                <div className='mt-5 flex items-end justify-between text-[11px] uppercase tracking-wider opacity-80'>
                  <span className='truncate pr-3'>{card.holder || 'AD SOYAD'}</span>
                  <span>{card.expiry || 'AA/YY'}</span>
                </div>
              </div>
            </div>

            <p className='mt-4 flex items-start gap-2 text-xs leading-relaxed text-[var(--gl-muted)]'>
              <Lock className='mt-0.5 size-3.5 shrink-0' aria-hidden />
              Kart bilgilerin 256-bit SSL ile şifrelenir.
            </p>
          </section>
        </div>

        <aside className='space-y-4 lg:sticky lg:top-24 lg:h-fit'>
          <OrderSummary />

          {selectedOffer ? (
            <div className='rounded-2xl border-2 border-[var(--gl-petrol)] bg-[var(--gl-petrol-soft)] p-5'>
              <p className='gl-eyebrow'>Seçilen plan</p>
              <p className='mt-1 text-base font-bold text-[var(--gl-ink)]'>{selectedOffer.title}</p>
              <p className='text-xs text-[var(--gl-muted)]'>{selectedOffer.etaLabel}</p>

              <div className='mt-4 flex items-end justify-between border-t border-[var(--gl-border)] pt-3'>
                <span className='text-sm text-[var(--gl-muted)]'>
                  {preAuthOnly ? 'Onay sonrası ödenecek' : 'Ödenecek tutar'}
                </span>
                <span className='text-2xl font-bold text-[var(--gl-ink)]'>{formatTry(amount)}</span>
              </div>

              <p className='mt-3 flex items-start gap-2 text-xs leading-relaxed text-[var(--gl-muted)]'>
                <ShieldCheck className='mt-0.5 size-3.5 shrink-0 text-[var(--gl-petrol)]' aria-hidden />
                {preAuthOnly
                  ? 'Talep alındığında onayın istenir; onaylamazsan ücret alınmaz.'
                  : 'Tutara KDV dahildir. Taşıma başlamadan 24 saat önce ücretsiz iptal edebilirsin.'}
              </p>
            </div>
          ) : null}
        </aside>
      </div>

      <StepNav
        onBack={back}
        onNext={submit}
        nextLabel={
          processing ? 'İşleniyor…' : preAuthOnly ? 'Talebi Oluştur' : `${formatTry(amount)} Öde`
        }
        nextDisabled={!contactValid || !cardValid || processing}
        helper={
          processing ? (
            <span className='inline-flex items-center gap-1.5'>
              <Loader2 className='size-3.5 animate-spin' aria-hidden />
              Banka onayı bekleniyor
            </span>
          ) : !contactValid ? (
            'İletişim bilgilerini tamamla'
          ) : !cardValid ? (
            'Kart bilgilerini tamamla'
          ) : undefined
        }
      />
    </div>
  )
}
