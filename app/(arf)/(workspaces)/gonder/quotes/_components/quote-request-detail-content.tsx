'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { ArrowLeft, Check, PackagePlus, Star, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ARF_ROUTES } from '../../../../_shared/routes'
import { quoteRequestsRepository } from '../../_data/quote-requests-repository'
import { QUOTE_REQUESTS_KEY, useQuoteRequest } from '../../_hooks/use-quote-requests'
import { canGonder, GONDER_PERMISSIONS } from '../../_lib/gonder-permissions'
import { OPERATION_TYPE_LABELS } from '../../_lib/price-calculation-labels'
import { usePriceDraftStore } from '../../_stores/price-calculation-draft-store'
import {
  QUOTE_OFFER_STATUS_LABELS,
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

  function handleContinue(offer: QuoteOffer) {
    setSelectedQuoteId(offer.id)
    setMode('shipment')
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
                </div>
              </CardHeader>
            </Card>

            <div className='grid gap-2.5'>
              {data.offers.map((offer) => (
                <Card key={offer.id} className='gap-0 py-0 shadow-sm'>
                  <CardContent className='flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='min-w-0 space-y-1.5'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <p className='font-semibold'>{offer.providerName}</p>
                        <Badge variant='outline'>
                          {QUOTE_OFFER_STATUS_LABELS[offer.status]}
                        </Badge>
                        {offer.badges?.includes('recommended') ? (
                          <Badge className='gap-1 bg-primary/15 text-foreground hover:bg-primary/15'>
                            <Star className='size-3' />
                            Önerilen
                          </Badge>
                        ) : null}
                        {offer.badges?.includes('fastest') ? (
                          <Badge variant='secondary' className='gap-1'>
                            <Zap className='size-3' />
                            Hızlı
                          </Badge>
                        ) : null}
                      </div>
                      <p className='text-sm text-muted-foreground'>{offer.serviceName}</p>
                      <div className='flex flex-wrap gap-3 text-xs text-muted-foreground'>
                        <span>ETA: {offer.etaLabel}</span>
                        <span>Alma: {offer.pickupLabel}</span>
                        {offer.score ? <span>Skor: {offer.score}</span> : null}
                      </div>
                    </div>
                    <div className='flex flex-col items-stretch gap-2 sm:min-w-[180px] sm:items-end'>
                      <p className='text-lg font-semibold tabular-nums'>
                        {formatMoney(offer.priceTry)}
                      </p>
                      <div className='flex flex-wrap gap-1.5 sm:justify-end'>
                        {canManage && offer.status !== 'selected' && offer.priceTry != null ? (
                          <Button
                            size='sm'
                            variant='outline'
                            className='gap-1'
                            onClick={() => void handleSelect(offer)}
                          >
                            <Check className='size-3.5' />
                            Seç
                          </Button>
                        ) : null}
                        {(offer.status === 'selected' || data.selectedQuoteId === offer.id) &&
                        offer.priceTry != null ? (
                          <Button
                            size='sm'
                            className='gap-1'
                            onClick={() => handleContinue(offer)}
                          >
                            <PackagePlus className='size-3.5' />
                            Gönderiye devam
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
