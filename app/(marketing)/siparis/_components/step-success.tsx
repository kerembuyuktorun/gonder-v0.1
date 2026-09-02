'use client'

import Link from 'next/link'
import { BellRing, CheckCircle2, Copy, Home } from 'lucide-react'
import { useState } from 'react'
import { formatTry } from '../_lib/order-types'
import { OrderSummary } from './order-summary'
import { useWizard } from './wizard-context'

export function StepSuccess() {
  const { orderRef, selectedOffer, draft } = useWizard()
  const [copied, setCopied] = useState(false)
  const preAuthOnly = Boolean(selectedOffer?.requiresMatching)

  const copyRef = async () => {
    if (!orderRef) return
    try {
      await navigator.clipboard.writeText(orderRef)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className='mx-auto max-w-2xl text-center'>
      <span className='mx-auto flex size-16 items-center justify-center rounded-full bg-[var(--gl-petrol-soft)]'>
        <CheckCircle2 className='size-8 text-[var(--gl-petrol)]' aria-hidden />
      </span>

      <h2 className='mt-5 text-2xl font-bold text-[var(--gl-ink)] sm:text-3xl'>
        {preAuthOnly ? 'Talebin oluşturuldu' : 'Siparişin alındı'}
      </h2>
      <p className='mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--gl-muted)]'>
        {preAuthOnly
          ? 'Bu hatta dönüş yükü çıkar çıkmaz sana bildirim göndereceğiz. Onayladığında araç planlanır.'
          : `${draft.origin?.city} – ${draft.destination?.city} taşıman planlamaya alındı. Detaylar e-posta ve SMS ile paylaşılacak.`}
      </p>

      {orderRef ? (
        <div className='mx-auto mt-6 inline-flex items-center gap-3 rounded-xl border border-[var(--gl-border)] bg-white px-4 py-3'>
          <span className='text-xs text-[var(--gl-muted)]'>Sipariş no</span>
          <span className='font-mono text-sm font-semibold text-[var(--gl-ink)]'>{orderRef}</span>
          <button
            type='button'
            onClick={copyRef}
            className='rounded-lg p-1.5 text-[var(--gl-muted)] transition-colors hover:bg-[var(--gl-subtle)] hover:text-[var(--gl-ink)]'
            aria-label='Sipariş numarasını kopyala'
          >
            <Copy className='size-4' aria-hidden />
          </button>
          {copied ? <span className='text-xs font-medium text-[var(--gl-petrol)]'>Kopyalandı</span> : null}
        </div>
      ) : null}

      {selectedOffer ? (
        <div className='mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl bg-[var(--gl-subtle)] px-5 py-4 text-sm'>
          <span className='text-[var(--gl-muted)]'>
            Plan: <span className='font-semibold text-[var(--gl-ink)]'>{selectedOffer.title}</span>
          </span>
          <span className='text-[var(--gl-muted)]'>
            {preAuthOnly ? 'Beklenen tutar' : 'Ödenen'}:{' '}
            <span className='font-semibold text-[var(--gl-ink)]'>{formatTry(selectedOffer.price)}</span>
          </span>
          <span className='text-[var(--gl-muted)]'>
            Teslim: <span className='font-semibold text-[var(--gl-ink)]'>{selectedOffer.etaLabel}</span>
          </span>
        </div>
      ) : null}

      {preAuthOnly ? (
        <p className='mt-4 inline-flex items-center gap-2 text-xs text-[var(--gl-muted)]'>
          <BellRing className='size-3.5 text-[var(--gl-accent)]' aria-hidden />
          Eşleşme genelde 1–3 gün içinde bulunuyor.
        </p>
      ) : null}

      <div className='mt-8 text-left'>
        <OrderSummary editable={false} />
      </div>

      <div className='mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center'>
        <Link href='/landing' className='gl-btn-secondary'>
          <Home className='size-4' aria-hidden />
          Ana sayfaya dön
        </Link>
        <Link href='/siparis' className='gl-btn-primary'>
          Yeni sipariş oluştur
        </Link>
      </div>
    </div>
  )
}
