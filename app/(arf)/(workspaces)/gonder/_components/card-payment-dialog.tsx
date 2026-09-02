'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BadgeCheck,
  CheckCircle2,
  Info,
  Lock,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { quotePaymentsRepository } from '../_data/quote-payments-repository'
import {
  DEMO_THREEDS_CODE,
  buildInstallmentOptions,
  detectCardBrand,
  findInstallmentOption,
  validateCardForm,
} from '../_lib/payment-card'
import {
  CARD_BRAND_LABELS,
  CARD_PAYMENT_FAILURE_LABELS,
  EMPTY_CARD_FORM,
  type CardFormErrors,
  type CardFormValue,
  type CardPayment,
} from '../_types/payment'
import { CreditCardForm } from './credit-card-form'

/** KDV oranı — demo faturalandırma için sabit */
const VAT_RATE = 0.2

/** 3D Secure doğrulama süresi (saniye) */
const THREEDS_TIMEOUT_SECONDS = 180

type Stage = 'form' | 'authorizing' | 'threeds' | 'success' | 'failed'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
  offerId?: string | null
  amountTry: number
  /** Talep referansı — örn. TKF-1001 */
  reference?: string | null
  /** Taşıyıcı ve servis özeti */
  serviceLabel?: string | null
  onPaid: (payment: CardPayment) => void | Promise<void>
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function CardPaymentDialog({
  open,
  onOpenChange,
  requestId,
  offerId,
  amountTry,
  reference,
  serviceLabel,
  onPaid,
}: Props) {
  const [stage, setStage] = useState<Stage>('form')
  const [card, setCard] = useState<CardFormValue>(EMPTY_CARD_FORM)
  const [errors, setErrors] = useState<CardFormErrors>({})
  const [payment, setPayment] = useState<CardPayment | null>(null)
  const [otp, setOtp] = useState('')
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(THREEDS_TIMEOUT_SECONDS)
  const [failureMessage, setFailureMessage] = useState<string | null>(null)

  const brand = detectCardBrand(card.number)
  const installmentOptions = useMemo(
    () => buildInstallmentOptions(amountTry, brand),
    [amountTry, brand]
  )
  const selectedInstallment = findInstallmentOption(installmentOptions, card.installment)
  const chargedTry = selectedInstallment.totalTry
  const netTry = Math.round((chargedTry / (1 + VAT_RATE)) * 100) / 100
  const vatTry = Math.round((chargedTry - netTry) * 100) / 100

  useEffect(() => {
    if (!open) return
    setStage('form')
    setCard(EMPTY_CARD_FORM)
    setErrors({})
    setPayment(null)
    setOtp('')
    setOtpSecondsLeft(THREEDS_TIMEOUT_SECONDS)
    setFailureMessage(null)
  }, [open])

  // Seçilen taksit, kart markası değişince geçersiz kalabilir (örn. Amex).
  useEffect(() => {
    if (installmentOptions.some((option) => option.count === card.installment)) return
    setCard((prev) => ({ ...prev, installment: 1 }))
  }, [card.installment, installmentOptions])

  useEffect(() => {
    if (stage !== 'threeds') return
    const timer = window.setInterval(() => {
      setOtpSecondsLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [stage])

  useEffect(() => {
    if (stage !== 'threeds' || otpSecondsLeft > 0) return
    setStage('failed')
    setFailureMessage('3D Secure doğrulama süresi doldu. Ödemeyi yeniden başlatın.')
  }, [otpSecondsLeft, stage])

  async function handleAuthorize() {
    const validation = validateCardForm(card)
    setErrors(validation)
    if (Object.keys(validation).length > 0) {
      toast.error('Kart bilgilerini kontrol edin')
      return
    }

    setStage('authorizing')
    try {
      const result = await quotePaymentsRepository.authorize({
        requestId,
        offerId: offerId ?? null,
        amountTry,
        card,
      })
      setPayment(result)

      if (result.status === 'threeds_required') {
        setOtp('')
        setOtpSecondsLeft(THREEDS_TIMEOUT_SECONDS)
        setStage('threeds')
        return
      }
      await finish(result)
    } catch {
      setStage('failed')
      setFailureMessage('Ödeme servisine ulaşılamadı. Lütfen tekrar deneyin.')
    }
  }

  async function handleConfirmThreeDS() {
    if (!payment || otp.length < 6) return
    setStage('authorizing')
    try {
      const result = await quotePaymentsRepository.confirmThreeDSecure(payment.id, otp)
      setPayment(result)
      await finish(result)
    } catch {
      setStage('failed')
      setFailureMessage('3D Secure doğrulaması tamamlanamadı.')
    }
  }

  async function finish(result: CardPayment) {
    if (result.status === 'succeeded') {
      setStage('success')
      setFailureMessage(null)
      await onPaid(result)
      return
    }
    setStage('failed')
    setFailureMessage(
      result.failureCode
        ? CARD_PAYMENT_FAILURE_LABELS[result.failureCode]
        : 'Ödeme alınamadı.'
    )
  }

  function retry() {
    setStage('form')
    setOtp('')
    setOtpSecondsLeft(THREEDS_TIMEOUT_SECONDS)
    setFailureMessage(null)
    setPayment(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[92vh] gap-3 overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <ShieldCheck className='size-4 text-primary' />
            Kredi kartı ile ödeme
          </DialogTitle>
          <DialogDescription>
            {reference ? `${reference} · ` : ''}
            {serviceLabel ?? 'Seçilen teklif'} için tahsilat yapılacak.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-2 rounded-xl border bg-muted/30 p-3 text-sm'>
          <div className='flex items-center justify-between text-muted-foreground'>
            <span>Hizmet bedeli (KDV hariç)</span>
            <span className='tabular-nums'>{formatMoney(netTry)}</span>
          </div>
          <div className='flex items-center justify-between text-muted-foreground'>
            <span>KDV %{VAT_RATE * 100}</span>
            <span className='tabular-nums'>{formatMoney(vatTry)}</span>
          </div>
          {chargedTry > amountTry ? (
            <div className='flex items-center justify-between text-amber-700'>
              <span>Vade farkı ({selectedInstallment.count} taksit)</span>
              <span className='tabular-nums'>{formatMoney(chargedTry - amountTry)}</span>
            </div>
          ) : null}
          <Separator />
          <div className='flex items-center justify-between font-semibold'>
            <span>Tahsil edilecek</span>
            <span className='text-lg tabular-nums'>{formatMoney(chargedTry)}</span>
          </div>
          {selectedInstallment.count > 1 ? (
            <p className='text-[11px] text-muted-foreground'>
              {selectedInstallment.count} × {formatMoney(selectedInstallment.monthlyTry)} olarak
              yansıtılır.
            </p>
          ) : null}
        </div>

        {stage === 'form' ? (
          <CreditCardForm
            value={card}
            onChange={(patch) => setCard((prev) => ({ ...prev, ...patch }))}
            errors={errors}
            installmentOptions={installmentOptions}
          />
        ) : null}

        {stage === 'authorizing' ? (
          <div className='flex flex-col items-center gap-2 py-8 text-center'>
            <Spinner className='size-6' />
            <p className='text-sm font-medium'>Banka ile iletişim kuruluyor…</p>
            <p className='text-xs text-muted-foreground'>
              Bu sırada sayfayı kapatmayın veya yenilemeyin.
            </p>
          </div>
        ) : null}

        {stage === 'threeds' ? (
          <div className='space-y-3 rounded-xl border p-3'>
            <div className='flex items-center justify-between gap-2'>
              <p className='inline-flex items-center gap-1.5 text-sm font-medium'>
                <Lock className='size-4' />
                3D Secure doğrulaması
              </p>
              <Badge variant='outline' className='tabular-nums'>
                {formatSeconds(otpSecondsLeft)}
              </Badge>
            </div>
            <p className='text-xs text-muted-foreground'>
              {payment ? `${CARD_BRAND_LABELS[payment.brand]} ${payment.maskedNumber}` : ''} kartına
              tanımlı telefona gönderilen 6 haneli kodu girin.
            </p>
            <InputOTP maxLength={6} value={otp} onChange={setOtp} containerClassName='justify-center'>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <p className='text-center text-[11px] text-muted-foreground'>
              Demo doğrulama kodu: <span className='font-mono'>{DEMO_THREEDS_CODE}</span>
            </p>
          </div>
        ) : null}

        {stage === 'success' && payment ? (
          <div className='space-y-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3'>
            <p className='inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700'>
              <CheckCircle2 className='size-4' />
              Ödeme başarıyla alındı
            </p>
            <dl className='grid gap-1.5 text-xs sm:grid-cols-2'>
              <ReceiptRow label='Ödeme referansı' value={payment.reference} mono />
              <ReceiptRow label='Onay kodu' value={payment.authCode ?? '—'} mono />
              <ReceiptRow
                label='Kart'
                value={`${CARD_BRAND_LABELS[payment.brand]} ${payment.maskedNumber}`}
                mono
              />
              <ReceiptRow
                label='Taksit'
                value={payment.installment === 1 ? 'Tek çekim' : `${payment.installment} taksit`}
              />
              <ReceiptRow label='Tutar' value={formatMoney(payment.chargedTry)} />
              <ReceiptRow
                label='Doğrulama'
                value={payment.threeDSecure ? '3D Secure' : 'Doğrudan çekim'}
              />
            </dl>
            <p className='inline-flex items-center gap-1.5 text-[11px] text-muted-foreground'>
              <BadgeCheck className='size-3.5' />
              Fatura, Finans Merkezi altında işlem kaydı olarak listelenir.
            </p>
          </div>
        ) : null}

        {stage === 'failed' ? (
          <div className='space-y-1.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3'>
            <p className='inline-flex items-center gap-1.5 text-sm font-semibold text-destructive'>
              <TriangleAlert className='size-4' />
              Ödeme alınamadı
            </p>
            <p className='text-xs text-muted-foreground'>{failureMessage}</p>
            {payment?.reference ? (
              <p className='font-mono text-[11px] text-muted-foreground'>
                İşlem no: {payment.reference}
              </p>
            ) : null}
          </div>
        ) : null}

        {stage === 'form' ? (
          <p className='flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground'>
            <Info className='mt-0.5 size-3.5 shrink-0' aria-hidden />
            Bu e-postaya kayıtlı hesabınız varsa gönderi oraya düşer. Yoksa e-postanıza otomatik
            hesap oluşturulur; gelen link ile girip gönderiyi takip edebilirsiniz.
          </p>
        ) : null}

        {stage === 'form' || stage === 'threeds' ? (
          <p className='inline-flex items-center gap-1.5 text-[11px] text-muted-foreground'>
            <Lock className='size-3' />
            Demo ödeme ortamı — girilen kart bilgileri kaydedilmez, gerçek tahsilat yapılmaz.
          </p>
        ) : null}

        <DialogFooter>
          {stage === 'form' ? (
            <>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Vazgeç
              </Button>
              <Button type='button' onClick={() => void handleAuthorize()}>
                {formatMoney(chargedTry)} öde
              </Button>
            </>
          ) : null}

          {stage === 'threeds' ? (
            <>
              <Button type='button' variant='outline' onClick={retry}>
                Kart bilgilerine dön
              </Button>
              <Button
                type='button'
                disabled={otp.length < 6}
                onClick={() => void handleConfirmThreeDS()}
              >
                Doğrula ve öde
              </Button>
            </>
          ) : null}

          {stage === 'failed' ? (
            <>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Kapat
              </Button>
              <Button type='button' onClick={retry}>
                Tekrar dene
              </Button>
            </>
          ) : null}

          {stage === 'success' ? (
            <Button type='button' onClick={() => onOpenChange(false)}>
              Tamam
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ReceiptRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className='flex items-center justify-between gap-2 sm:flex-col sm:items-start sm:gap-0'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className={mono ? 'font-mono font-medium tabular-nums' : 'font-medium'}>{value}</dd>
    </div>
  )
}
