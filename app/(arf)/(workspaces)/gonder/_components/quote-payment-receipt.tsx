'use client'

import { CheckCircle2, CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CARD_BRAND_LABELS, type QuotePaymentSummary } from '../_types/payment'

type Props = {
  payment: QuotePaymentSummary
  /** Kompakt varyant — form içi şeritler için */
  compact?: boolean
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function QuotePaymentReceipt({ payment, compact }: Props) {
  const installmentLabel =
    payment.installment === 1 ? 'Tek çekim' : `${payment.installment} taksit`

  if (compact) {
    return (
      <div className='flex flex-wrap items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-xs'>
        <span className='inline-flex items-center gap-1.5 font-medium text-emerald-700'>
          <CheckCircle2 className='size-3.5' />
          Ödeme alındı
        </span>
        <span className='font-mono tabular-nums'>{payment.maskedNumber}</span>
        <Badge variant='outline' className='font-normal'>
          {installmentLabel}
        </Badge>
        <span className='ml-auto font-semibold tabular-nums'>
          {formatMoney(payment.chargedTry)}
        </span>
      </div>
    )
  }

  return (
    <div className='space-y-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <p className='inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700'>
          <CheckCircle2 className='size-4' />
          Ödeme tamamlandı
        </p>
        <Badge variant='outline' className='font-normal'>
          {payment.threeDSecure ? '3D Secure' : 'Doğrudan çekim'}
        </Badge>
      </div>
      <dl className='grid gap-2 text-xs sm:grid-cols-3'>
        <Row label='Ödeme referansı' value={payment.reference} mono />
        <Row label='Onay kodu' value={payment.authCode ?? '—'} mono />
        <Row
          label='Kart'
          value={`${CARD_BRAND_LABELS[payment.brand]} ${payment.maskedNumber}`}
          mono
        />
        <Row label='Taksit' value={installmentLabel} />
        <Row label='Tahsil edilen' value={formatMoney(payment.chargedTry)} />
        <Row label='Tarih' value={formatDateTime(payment.paidAt)} />
      </dl>
      <p className='inline-flex items-center gap-1.5 text-[11px] text-muted-foreground'>
        <CreditCard className='size-3.5' />
        Demo tahsilat — gerçek bir kart hareketi oluşturulmaz.
      </p>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className='space-y-0.5'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className={mono ? 'font-mono font-medium tabular-nums' : 'font-medium'}>{value}</dd>
    </div>
  )
}
