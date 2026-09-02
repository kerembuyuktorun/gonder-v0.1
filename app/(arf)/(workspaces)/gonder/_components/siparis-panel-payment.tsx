'use client'

import { useMemo, useState } from 'react'
import { CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatTry } from '../../../../(marketing)/siparis/_lib/order-types'
import { buildBreakdown } from '../../../../(marketing)/siparis/_lib/pricing'
import { EstimateCard } from '../../../../(marketing)/siparis/_components/estimate-card'
import { OrderSummary } from '../../../../(marketing)/siparis/_components/order-summary'
import { StepHeader, StepNav } from '../../../../(marketing)/siparis/_components/step-shell'
import { useWizard } from '../../../../(marketing)/siparis/_components/wizard-context'
import { CardPaymentDialog } from './card-payment-dialog'
import { QuotePaymentReceipt } from './quote-payment-receipt'
import { quoteRequestsRepository } from '../_data/quote-requests-repository'
import { useCreateShipmentStore } from '../_stores/create-shipment-draft-store'
import { toQuotePaymentSummary, type CardPayment } from '../_types/payment'

const PAYMENT_OPTIONS = [
  { id: 'invoice' as const, label: 'Fatura / vadeli', hint: 'Dönem sonu fatura' },
  { id: 'wallet' as const, label: 'Cüzdan', hint: 'Gönder bakiyesinden tahsil' },
  { id: 'card' as const, label: 'Kart', hint: 'Kredi / banka kartı' },
]

export function SiparisPanelPayment({
  submitting,
  onSubmit,
}: {
  submitting: boolean
  onSubmit: () => void
}) {
  const { draft, back, selectedOffer, hideStepChrome } = useWizard()
  const paymentMethod = useCreateShipmentStore((s) => s.draft.paymentMethod)
  const cardPayment = useCreateShipmentStore((s) => s.draft.cardPayment)
  const quoteRequestId = useCreateShipmentStore((s) => s.draft.quoteRequestId)
  const quoteId = useCreateShipmentStore((s) => s.draft.quoteId)
  const note = useCreateShipmentStore((s) => s.draft.note)
  const priceTry = useCreateShipmentStore((s) => s.draft.priceTry)
  const { setPaymentMethod, setCardPayment, setNote } = useCreateShipmentStore()
  const [paymentOpen, setPaymentOpen] = useState(false)

  const breakdown = useMemo(() => buildBreakdown(draft), [draft])
  const amount = selectedOffer?.price ?? breakdown?.total ?? priceTry ?? 0
  const priceChangedAfterPayment = Boolean(cardPayment && amount !== cardPayment.amountTry)

  const canSubmit =
    Boolean(paymentMethod) &&
    (paymentMethod !== 'card' || cardPayment != null) &&
    !submitting &&
    amount > 0

  async function handleCardPaid(payment: CardPayment) {
    const summary = toQuotePaymentSummary(payment)
    setCardPayment(summary)
    if (quoteRequestId) {
      try {
        await quoteRequestsRepository.attachPayment(quoteRequestId, summary)
      } catch {
        // Teklif kaydı güncellenemese de taslaktaki tahsilat geçerli kalır.
      }
    }
    toast.success(`Ödeme alındı · ${payment.reference}`)
  }

  return (
    <div>
      <StepHeader
        title='Ödemeyi onayla'
        description='Özeti kontrol et, paneldeki ödeme yöntemini seç ve gönderiyi oluştur.'
      />

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]'>
        <div className='space-y-5'>
          <section className='rounded-2xl border border-[var(--gl-border)] bg-white p-5'>
            <p className='gl-eyebrow'>Ödeme yöntemi</p>
            <div className='mt-3 grid gap-3 sm:grid-cols-3'>
              {PAYMENT_OPTIONS.map((option) => {
                const selected = paymentMethod === option.id
                return (
                  <button
                    key={option.id}
                    type='button'
                    onClick={() => setPaymentMethod(option.id)}
                    aria-pressed={selected}
                    className={`rounded-2xl border-2 p-4 text-left transition-all ${
                      selected
                        ? 'border-[var(--gl-petrol)] bg-[var(--gl-petrol-soft)]'
                        : 'border-[var(--gl-border)] bg-white hover:border-[var(--gl-border-strong)]'
                    }`}
                  >
                    <p className='text-sm font-semibold text-[var(--gl-ink)]'>{option.label}</p>
                    <p className='mt-1 text-xs text-[var(--gl-muted)]'>{option.hint}</p>
                  </button>
                )
              })}
            </div>
          </section>

          {paymentMethod === 'card' ? (
            <section className='space-y-3 rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-subtle)] p-5'>
              {cardPayment ? (
                <>
                  <QuotePaymentReceipt payment={cardPayment} compact />
                  {priceChangedAfterPayment ? (
                    <p className='text-xs text-amber-800'>
                      Fiyat ödeme sonrasında değişti. Farkı tahsil etmek için ödemeyi yenileyin.
                    </p>
                  ) : null}
                </>
              ) : (
                <p className='text-xs text-amber-800'>
                  Kart ile ödeme henüz alınmadı. Gönderiyi oluşturmak için tahsilatı tamamlayın.
                </p>
              )}
              <Button
                type='button'
                size='sm'
                variant={cardPayment ? 'outline' : 'default'}
                className='gap-1.5'
                disabled={amount <= 0}
                onClick={() => setPaymentOpen(true)}
              >
                <CreditCard className='size-3.5' />
                {cardPayment ? 'Ödemeyi yenile' : 'Kredi kartı ile öde'}
              </Button>
            </section>
          ) : null}

          <section>
            <p className='gl-eyebrow'>Operasyon notu</p>
            <Textarea
              className='mt-2 rounded-xl border-2 border-[var(--gl-border)] bg-white'
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder='Opsiyonel operasyon notu'
              rows={3}
            />
          </section>
        </div>

        <aside className='space-y-4 lg:sticky lg:top-24 lg:h-fit'>
          <OrderSummary editable={!hideStepChrome} />
          <div className='rounded-2xl border border-[var(--gl-border)] bg-[var(--gl-subtle)] p-4'>
            <p className='gl-eyebrow'>Tahsilat</p>
            {selectedOffer ? (
              <>
                <p className='mt-2 text-2xl font-bold tabular-nums text-[var(--gl-ink)]'>
                  {formatTry(amount)}
                </p>
                <p className='mt-1 text-xs text-[var(--gl-muted)]'>
                  {selectedOffer.carrier} · {selectedOffer.etaLabel}
                </p>
              </>
            ) : (
              <EstimateCard
                total={amount > 0 ? amount : null}
                signature={`${draft.service}-${draft.logisticsMode}-${draft.deliverySpeed}-${amount}`}
                hint='Kesin tutar operasyon sırasında netleşir'
              />
            )}
          </div>
        </aside>
      </div>

      {hideStepChrome ? (
        <div className='sticky bottom-0 z-10 mt-8 flex flex-col gap-3 border-t border-[var(--gl-border)] bg-white/95 pt-6 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-end'>
          {paymentMethod === 'card' && !cardPayment ? (
            <span className='text-xs text-[var(--gl-muted)]'>Önce kart tahsilatını tamamla</span>
          ) : amount > 0 ? (
            <span className='text-xs text-[var(--gl-muted)]'>{formatTry(amount)}</span>
          ) : null}
          <button
            type='button'
            onClick={onSubmit}
            disabled={!canSubmit}
            className='inline-flex items-center justify-center gap-2 rounded-full bg-[var(--gl-accent)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--gl-accent-hover)] disabled:cursor-not-allowed disabled:bg-[var(--gl-border-strong)] disabled:text-white'
          >
            {submitting ? 'Oluşturuluyor…' : 'Gönderiyi oluştur'}
          </button>
        </div>
      ) : (
        <StepNav
          onBack={back}
          onNext={onSubmit}
          nextLabel={submitting ? 'Oluşturuluyor…' : 'Gönderiyi oluştur'}
          nextDisabled={!canSubmit}
          helper={
            paymentMethod === 'card' && !cardPayment
              ? 'Önce kart tahsilatını tamamla'
              : selectedOffer
                ? `${selectedOffer.carrier} · ${formatTry(amount)}`
                : undefined
          }
        />
      )}

      <CardPaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        requestId={quoteRequestId ?? 'shipment-draft'}
        offerId={quoteId}
        amountTry={amount}
        reference={quoteRequestId ? 'Seçilen teklif' : 'Yeni gönderi'}
        serviceLabel={
          selectedOffer ? `${selectedOffer.carrier} · ${selectedOffer.title}` : null
        }
        onPaid={handleCardPaid}
      />
    </div>
  )
}
