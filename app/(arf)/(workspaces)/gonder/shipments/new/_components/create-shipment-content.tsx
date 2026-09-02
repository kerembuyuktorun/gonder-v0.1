'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Cloud } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { SiparisPanelPayment } from '../../../_components/siparis-panel-payment'
import {
  SiparisPanelScope,
  SiparisPanelWizard,
  type WizardSnapshot,
} from '../../../_components/siparis-panel-wizard'
import { ordersRepository } from '../../../_data/orders-repository'
import { quoteRepository } from '../../../_data/quote-repository'
import { quoteRequestsRepository } from '../../../_data/quote-requests-repository'
import { shipmentsListRepository } from '../../../_data/shipments-list-repository'
import { useCreateShipmentHydrated } from '../../../_hooks/use-create-shipment-hydrated'
import { usePriceDraftHydrated } from '../../../_hooks/use-price-draft-hydrated'
import {
  clampSiparisStep,
  createInitialOrder,
  isOrderReadyForOffers,
  numericStepFromSiparis,
  orderToPricePatch,
  orderToShipmentPatch,
  reconstructOrderFromPriceDraft,
  reconstructOrderFromShipmentDraft,
  resolvePlaceFromCity,
  type Offer,
  type OrderDraft,
} from '../../../_lib/siparis-draft-map'
import { useCreateShipmentStore } from '../../../_stores/create-shipment-draft-store'
import { usePriceDraftStore } from '../../../_stores/price-calculation-draft-store'
import {
  canSubmitCreateShipment,
  getCreateShipmentMissingFields,
} from '../../../_types/create-shipment'
import {
  toAddressDraftFromLocation,
  type OperationType,
} from '../../../_types/price-calculation'
import { resolveShipmentServiceType } from '../../../_types/shipments'

export function CreateShipmentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hydrated = useCreateShipmentHydrated()
  const priceHydrated = usePriceDraftHydrated()
  const draft = useCreateShipmentStore((s) => s.draft)
  const { hydrateFromSources, resetDraft } = useCreateShipmentStore()

  const [submitting, setSubmitting] = useState(false)
  const [bootstrapped, setBootstrapped] = useState(false)
  const [autosaveFlash, setAutosaveFlash] = useState(false)
  const [wizardKey, setWizardKey] = useState(0)

  useEffect(() => {
    if (!hydrated || !bootstrapped) return
    setAutosaveFlash(true)
    const timer = window.setTimeout(() => setAutosaveFlash(false), 1200)
    return () => window.clearTimeout(timer)
  }, [bootstrapped, draft.siparis, draft.selectedOffer, draft.paymentMethod, draft.note, hydrated])

  useEffect(() => {
    if (!hydrated || !priceHydrated || bootstrapped) return

    const orderId = searchParams.get('orderId')
    const quoteId = searchParams.get('quoteId')
    const templateId = searchParams.get('templateId')
    const repeat = searchParams.get('repeat')
    const priceDraft = usePriceDraftStore.getState().draft
    const current = useCreateShipmentStore.getState().draft

    async function bootstrap() {
      if (orderId) {
        const order = await ordersRepository.getById(orderId)
        if (order) {
          const siparis: OrderDraft = {
            ...createInitialOrder(),
            service: 'kargo',
            origin: resolvePlaceFromCity(order.originCity, `${order.originCity} çıkış`),
            destination: resolvePlaceFromCity(
              order.destinationCity,
              `${order.destinationCity} varış · ${order.customerName}`
            ),
            cargo: {
              preset: 'custom',
              widthCm: 30,
              lengthCm: 40,
              heightCm: 20,
              quantity: Math.max(1, order.pieceCount),
              weightKg: 2,
              contentNote: '',
            },
          }
          hydrateFromSources({
            source: 'order',
            orderId: order.id,
            ...orderToShipmentPatch(siparis, null),
            siparis,
            siparisStep: 'details',
            providerName: current.providerName ?? 'ARF Parcel',
            serviceName: current.serviceName ?? 'Standart Kapıdan Kapıya',
            priceTry: current.priceTry ?? Math.round(order.amountTry * 0.15),
          })
          setBootstrapped(true)
          return
        }
      }

      if (repeat) {
        const shipment = await shipmentsListRepository.getById(repeat)
        if (shipment) {
          const siparis: OrderDraft = {
            ...createInitialOrder(),
            service: shipment.operationType === 'logistics' ? 'lojistik' : 'kargo',
            origin: resolvePlaceFromCity(shipment.originCity),
            destination: resolvePlaceFromCity(shipment.destinationCity),
            cargo: {
              preset: 'custom',
              widthCm: 30,
              lengthCm: 40,
              heightCm: 20,
              quantity: 1,
              weightKg: shipment.weightKg,
              contentNote: '',
            },
          }
          hydrateFromSources({
            source: 'repeat',
            repeatShipmentId: shipment.id,
            ...orderToShipmentPatch(siparis, null),
            siparis,
            siparisStep: 'details',
            providerName: shipment.carrier,
            serviceName: shipment.serviceLabel,
            priceTry: shipment.amountTry,
          })
          setBootstrapped(true)
          return
        }
      }

      if (templateId) {
        hydrateFromSources({
          source: 'template',
          templateId,
          operationType: 'parcel',
          siparis: { ...createInitialOrder(), service: 'kargo' },
          siparisStep: 'route',
          providerName: 'ARF Parcel',
          serviceName: 'Şablon Express',
          priceTry: 149,
        })
        setBootstrapped(true)
        return
      }

      const effectiveQuoteId = quoteId || priceDraft.selectedQuoteId
      if (effectiveQuoteId || priceDraft.mode === 'shipment' || priceDraft.origin || priceDraft.siparis) {
        const siparis = reconstructOrderFromPriceDraft(priceDraft)
        let offer: Offer | null = priceDraft.selectedOffer
        let providerName = offer?.carrier ?? 'ARF Parcel'
        let serviceName = offer?.title ?? 'Express Kapıdan Kapıya'
        let priceTry = offer?.price ?? 189

        if (priceDraft.origin && priceDraft.destination && isPriceLikeReady(priceDraft)) {
          const quotes = await quoteRepository.search(priceDraft)
          const selected =
            quotes.find((quote) => quote.id === effectiveQuoteId) ?? quotes[0] ?? null
          if (selected && !offer) {
            providerName = selected.providerName
            serviceName = selected.serviceName
            priceTry = selected.priceTry ?? priceTry
          }
        }

        hydrateFromSources({
          source: effectiveQuoteId || priceDraft.selectedQuoteId ? 'quote' : current.source,
          quoteId: effectiveQuoteId,
          ...orderToShipmentPatch(siparis, offer),
          siparis,
          siparisStep: offer
            ? 'payment'
            : isOrderReadyForOffers(siparis)
              ? 'offers'
              : siparis.origin && siparis.destination
                ? 'details'
                : 'route',
          selectedOffer: offer,
          providerName,
          serviceName,
          priceTry,
          origin: priceDraft.origin
            ? toAddressDraftFromLocation(priceDraft.origin)
            : siparis.origin
              ? {
                  label: siparis.origin.subtitle,
                  city: siparis.origin.city,
                  district: siparis.origin.district,
                  lat: siparis.origin.lat,
                  lng: siparis.origin.lng,
                  placeId: siparis.origin.id,
                }
              : current.origin,
        })
        setBootstrapped(true)
        return
      }

      if (!current.siparis) {
        hydrateFromSources({
          siparis: reconstructOrderFromShipmentDraft(current),
          siparisStep: current.siparisStep || 'route',
        })
      }

      setBootstrapped(true)
    }

    void bootstrap()
  }, [
    bootstrapped,
    hydrateFromSources,
    hydrated,
    priceHydrated,
    searchParams,
  ])

  const persistSnapshot = useCallback((snapshot: WizardSnapshot) => {
    const { draft: order, step, selectedOffer } = snapshot
    useCreateShipmentStore.getState().patchDraft({
      ...orderToShipmentPatch(order, selectedOffer),
      siparis: order,
      siparisStep: step,
      selectedOffer,
      step: numericStepFromSiparis(step),
      quoteId: selectedOffer?.id ?? useCreateShipmentStore.getState().draft.quoteId,
    })
    usePriceDraftStore.getState().patchDraft({
      ...orderToPricePatch(order),
      siparisStep: step,
      selectedOffer,
      selectedQuoteId: selectedOffer?.id ?? null,
      mode: 'shipment',
    })
  }, [])

  async function handleSubmit() {
    const current = useCreateShipmentStore.getState().draft
    if (!canSubmitCreateShipment(current)) {
      const missing = getCreateShipmentMissingFields(current)
      toast.message(`Eksik alanlar: ${missing.slice(0, 3).join(', ')}`)
      return
    }
    setSubmitting(true)
    try {
      const totalsPieces = current.pieces
      const desi = totalsPieces.reduce((sum, piece) => sum + piece.desi * piece.quantity, 0)
      const weightKg = totalsPieces.reduce((sum, piece) => sum + piece.weightKg * piece.quantity, 0)
      const created = await shipmentsListRepository.create({
        reference: `GND-${Math.floor(Math.random() * 9000 + 1000)}`,
        orderNumber: current.orderId
          ? ((await ordersRepository.getById(current.orderId))?.orderNumber ?? null)
          : null,
        carrier: current.providerName ?? 'ARF Parcel',
        serviceLabel: current.serviceName ?? 'Standart',
        serviceType: resolveShipmentServiceType(current.operationType),
        operationType: current.operationType ?? 'parcel',
        logisticsMode: current.operationType === 'logistics' ? 'spot' : null,
        originCity: current.origin?.city ?? current.origin?.label ?? '—',
        destinationCity: current.destination?.city ?? current.destination?.label ?? '—',
        status: 'label_ready',
        desi,
        weightKg,
        amountTry: current.priceTry,
      })

      if (current.orderId) {
        await ordersRepository.updateStatus(current.orderId, 'shipment_created')
      }

      if (current.quoteRequestId) {
        await quoteRequestsRepository.markConverted(current.quoteRequestId, created.id)
      }

      resetDraft()
      usePriceDraftStore.getState().setMode('quote')
      toast.success(`${created.reference} oluşturuldu`)
      router.push(ARF_ROUTES.gonder.shipments.list)
    } catch {
      toast.error('Gönderi oluşturulamadı')
    } finally {
      setSubmitting(false)
    }
  }

  if (!hydrated || !priceHydrated || !bootstrapped) {
    return (
      <>
        <AppHeader
          breadcrumbs={[{ label: 'Gönder' }, { label: 'Yeni gönderi' }]}
          searchPlaceholder='Gönder ara...'
          notificationsLabel='Bildirimler'
        />
        <div className='p-4 text-sm text-muted-foreground'>Taslak yükleniyor…</div>
      </>
    )
  }

  const initialOrder = draft.siparis ?? reconstructOrderFromShipmentDraft(draft)

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Gönder' },
          { label: 'Gönderiler', href: ARF_ROUTES.gonder.shipments.list },
          { label: 'Gönderi oluştur' },
        ]}
        searchPlaceholder='Gönder ara...'
        notificationsLabel='Bildirimler'
      />

      <div className='flex flex-1 flex-col gap-3 p-3 sm:p-4'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
          <div className='min-w-0'>
            <h1 className='truncate text-xl font-semibold tracking-tight'>Gönderi oluştur</h1>
            <p className='mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
              <span>
                Talebini oluştur, Gönder uygun taşıma seçeneklerini bulsun. Kaynak: {sourceLabel(draft.source)}
              </span>
              <Badge
                variant='outline'
                className={cn(
                  'gap-1 font-normal transition-opacity',
                  autosaveFlash ? 'opacity-100' : 'opacity-70'
                )}
              >
                <Cloud className='size-3' />
                Taslak kaydedildi
              </Badge>
            </p>
          </div>
          <div className='flex shrink-0 flex-wrap gap-2'>
            <Button variant='outline' size='sm' asChild>
              <Link href={ARF_ROUTES.gonder.shipments.list}>Listeye dön</Link>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                resetDraft()
                setWizardKey((key) => key + 1)
              }}
            >
              Taslağı sıfırla
            </Button>
          </div>
        </div>

        <SiparisPanelScope>
          <SiparisPanelWizard
            key={wizardKey}
            variant='shipment'
            initialDraft={initialOrder}
            initialStep={clampSiparisStep(draft.siparisStep, 'route', 'shipment')}
            initialOffer={draft.selectedOffer}
            offersNextLabel='Teklifi Seç'
            onChange={persistSnapshot}
            payment={
              <SiparisPanelPayment
                submitting={submitting}
                onSubmit={() => void handleSubmit()}
              />
            }
          />
        </SiparisPanelScope>
      </div>
    </>
  )
}

function sourceLabel(source: string) {
  switch (source) {
    case 'quote':
      return 'Tekliften'
    case 'order':
      return 'Siparişten'
    case 'template':
      return 'Şablondan'
    case 'repeat':
      return 'Tekrar gönderi'
    case 'excel':
      return 'Excel'
    default:
      return 'Manuel'
  }
}

function isPriceLikeReady(draft: {
  operationType: OperationType | null
  origin: { label?: string } | null
  destination: { label?: string } | null
}) {
  return Boolean(
    draft.operationType && draft.origin?.label?.trim() && draft.destination?.label?.trim()
  )
}
