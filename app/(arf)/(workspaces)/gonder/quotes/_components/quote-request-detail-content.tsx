'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { ArrowLeft, CreditCard, PackagePlus } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { CardPaymentDialog } from '../../_components/card-payment-dialog'
import { QuoteNetworkNotice, QuoteSpecialistBanner } from '../../_components/quote-network-notice'
import { QuoteOfferCard } from '../../_components/quote-offer-card'
import { QuotePaymentReceipt } from '../../_components/quote-payment-receipt'
import { quoteRequestsRepository } from '../../_data/quote-requests-repository'
import { QUOTE_REQUESTS_KEY, useQuoteRequest } from '../../_hooks/use-quote-requests'
import { canGonder, GONDER_PERMISSIONS } from '../../_lib/gonder-permissions'
import { OPERATION_TYPE_LABELS } from '../../_lib/price-calculation-labels'
import { needsLogisticsSpecialist } from '../../_lib/quote-specialist'
import { useCreateShipmentStore } from '../../_stores/create-shipment-draft-store'
import { usePriceDraftStore } from '../../_stores/price-calculation-draft-store'
import { toQuotePaymentSummary, type CardPayment } from '../../_types/payment'
import {
  QUOTE_REQUEST_STATUS_BADGE,
  QUOTE_REQUEST_STATUS_LABELS,
  type QuoteOffer,
} from '../../_types/quotes'

function formatMoney(value: number | null) {
  if (value == null) return 'Teklif hazırlanıyor'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value)
}

export function QuoteRequestDetailContent() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const canManage = canGonder(GONDER_PERMISSIONS.quotesManage)
  const { data, isLoading, isError } = useQuoteRequest(params.id)
  const setSelectedQuoteId = usePriceDraftStore((s) => s.setSelectedQuoteId)
  const setMode = usePriceDraftStore((s) => s.setMode)
  const patchShipmentDraft = useCreateShipmentStore((s) => s.patchDraft)
  const [paymentOpen, setPaymentOpen] = useState(false)

  const selectedOffer =
    data?.offers.find((offer) => offer.id === data.selectedQuoteId) ?? null
  const isPaid = Boolean(data?.payment)

  async function handleSelect(offer: QuoteOffer) {
    if (!data || !canManage) return
    try {
      await quoteRequestsRepository.selectOffer(data.id, offer.id)
      setSelectedQuoteId(offer.id)
      setMode('shipment')
      toast.success(`${offer.providerName} seçildi`)
      await queryClient.invalidateQueries({ queryKey: QUOTE_REQUESTS_KEY })
    } catch {
      toast.error('Teklif seçilemedi')
    }
  }

  async function handleOpenPayment() {
    if (!data || !selectedOffer) return
    try {
      await quoteRequestsRepository.markPaymentPending(data.id)
      await queryClient.invalidateQueries({ queryKey: QUOTE_REQUESTS_KEY })
    } catch {
      // Durum güncellenemese de ödeme ekranı açılabilir.
    }
    setPaymentOpen(true)
  }

  async function handlePaid(payment: CardPayment) {
    if (!data) return
    try {
      await quoteRequestsRepository.attachPayment(data.id, toQuotePaymentSummary(payment))
      await queryClient.invalidateQueries({ queryKey: QUOTE_REQUESTS_KEY })
      toast.success(`Ödeme alındı · ${payment.reference}`)
    } catch {
      toast.error('Ödeme kaydedilemedi')
    }
  }

  function handleContinue(offer: QuoteOffer) {
    setSelectedQuoteId(offer.id)
    setMode('shipment')
    patchShipmentDraft(
      data?.payment
        ? {
            quoteRequestId: data.id,
            quoteId: offer.id,
            paymentMethod: 'card',
            cardPayment: data.payment,
          }
        : { quoteRequestId: data?.id ?? null, quoteId: offer.id }
    )
    router.push(`${ARF_ROUTES.gonder.shipments.create}?quoteId=${offer.id}`)
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Gönder' },
          { label: 'Teklifler', href: ARF_ROUTES.gonder.quotes.list },
          { label: data?.reference ?? 'Detay' },
        ]}
        searchPlaceholder='Gönder ara...'
        notificationsLabel='Bildirimler'
      />

      <div className='flex flex-1 flex-col gap-3 p-3 sm:p-4'>
        <div className='flex flex-wrap items-center gap-2'>
          <Button variant='outline' size='sm' asChild>
            <Link href={ARF_ROUTES.gonder.quotes.list} className='gap-1.5'>
              <ArrowLeft className='size-4' />
              Listeye dön
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <p className='text-sm text-muted-foreground'>Yükleniyor…</p>
        ) : isError || !data ? (
          <Card className='gap-0 py-0 shadow-sm'>
            <CardContent className='p-4 text-sm text-muted-foreground'>
              Teklif talebi bulunamadı.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className='gap-0 py-0 shadow-sm'>
              <CardHeader className='space-y-2 px-3 pt-3 pb-3'>
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <div>
                    <CardTitle className='text-lg'>{data.reference}</CardTitle>
                    <p className='mt-1 text-sm text-muted-foreground'>
                      {data.originLabel} → {data.destinationLabel}
                    </p>
                  </div>
                  <Badge variant='outline' className={QUOTE_REQUEST_STATUS_BADGE[data.status]}>
                    {QUOTE_REQUEST_STATUS_LABELS[data.status]}
                  </Badge>
                </div>
                <div className='flex flex-wrap gap-2 text-xs text-muted-foreground'>
                  <Badge variant='secondary'>{OPERATION_TYPE_LABELS[data.operationType]}</Badge>
                  <span>
                    {data.pieceCount} parça · {Math.round(data.totalDesi * 100) / 100} desi
                  </span>
                  <span>
                    {data.offers.filter((o) => o.status !== 'pending').length}/{data.offers.length}{' '}
                    teklif alındı
                  </span>
                  {data.shipmentId ? (
                    <Link
                      href={ARF_ROUTES.gonder.shipments.detail(data.shipmentId)}
                      className='font-medium text-foreground hover:underline'
                    >
                      Gönderi: {data.shipmentReference ?? data.shipmentId}
                    </Link>
                  ) : null}
                </div>
              </CardHeader>
            </Card>

            <div className='grid gap-2.5'>
              {needsLogisticsSpecialist({
                operationType: data.operationType,
                totalDesi: data.totalDesi,
              }) ? (
                <QuoteSpecialistBanner />
              ) : null}
              {data.offers.map((offer) => (
                <QuoteOfferCard
                  key={offer.id}
                  providerName={offer.providerName}
                  serviceName={offer.serviceName}
                  vehicleLabel={offer.vehicleLabel}
                  etaLabel={offer.etaLabel}
                  pickupLabel={offer.pickupLabel}
                  insuranceLabel={offer.insuranceLabel}
                  priceTry={offer.priceTry}
                  preparing={offer.status === 'pending' || offer.priceTry == null}
                  quoteSource={offer.quoteSource}
                  badges={offer.badges}
                  selected={data.selectedQuoteId === offer.id}
                  selectDisabled={!canManage || offer.priceTry == null || offer.status === 'pending'}
                  selectLabel='Teklifi Seç'
                  onSelect={canManage ? () => void handleSelect(offer) : undefined}
                />
              ))}
              {data.offers.some((offer) => offer.priceTry != null) ? (
                <QuoteNetworkNotice />
              ) : null}
            </div>

            {selectedOffer && selectedOffer.priceTry != null ? (
              <Card className='gap-0 py-0 shadow-sm'>
                <CardHeader className='space-y-0 px-3 pt-3 pb-1.5'>
                  <CardTitle className='text-sm font-semibold'>
                    Onay ve ödeme
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 px-3 pb-3 pt-0'>
                  <div className='flex flex-wrap items-end justify-between gap-2'>
                    <div className='min-w-0'>
                      <p className='text-sm font-medium'>
                        {selectedOffer.providerName} · {selectedOffer.serviceName}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {selectedOffer.etaLabel} · {selectedOffer.pickupLabel}
                      </p>
                    </div>
                    <p className='text-xl font-semibold tabular-nums'>
                      {formatMoney(selectedOffer.priceTry)}
                    </p>
                  </div>

                  {data.payment ? (
                    <QuotePaymentReceipt payment={data.payment} />
                  ) : (
                    <div className='space-y-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3'>
                      <p className='text-sm font-medium text-amber-800'>
                        Teklif onaylandı, tahsilat bekleniyor
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Gönderiyi oluşturmak için kredi kartı ile ödemeyi tamamlayın.
                        Vadeli / cüzdan ödemesi kullanacaksanız gönderi adımında yöntemi
                        değiştirebilirsiniz.
                      </p>
                    </div>
                  )}

                  <div className='flex flex-wrap gap-2'>
                    {canManage ? (
                      <Button
                        className='gap-1.5'
                        variant={isPaid ? 'outline' : 'default'}
                        onClick={() => void handleOpenPayment()}
                      >
                        <CreditCard className='size-4' />
                        {isPaid ? 'Yeni ödeme al' : 'Kredi kartı ile öde'}
                      </Button>
                    ) : null}
                    <Button
                      variant={isPaid ? 'default' : 'outline'}
                      className='gap-1.5'
                      onClick={() => handleContinue(selectedOffer)}
                    >
                      <PackagePlus className='size-4' />
                      Gönderiye devam
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <CardPaymentDialog
              open={paymentOpen}
              onOpenChange={setPaymentOpen}
              requestId={data.id}
              offerId={selectedOffer?.id ?? null}
              amountTry={selectedOffer?.priceTry ?? 0}
              reference={data.reference}
              serviceLabel={
                selectedOffer
                  ? `${selectedOffer.providerName} · ${selectedOffer.serviceName}`
                  : null
              }
              onPaid={handlePaid}
            />
          </>
        )}
      </div>
    </>
  )
}
