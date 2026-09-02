'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Cloud } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { ORDERS_KEY } from '../../../_hooks/use-orders'
import { QUOTE_REQUESTS_KEY } from '../../../_hooks/use-quote-requests'
import { ordersRepository } from '../../../_data/orders-repository'
import { quoteRepository } from '../../../_data/quote-repository'
import { quoteRequestsRepository } from '../../../_data/quote-requests-repository'
import {
  shipmentsListRepository,
  SHIPMENTS_LIST_KEY,
} from '../../../_data/shipments-list-repository'
import { useCreateShipmentHydrated } from '../../../_hooks/use-create-shipment-hydrated'
import { usePriceDraftHydrated } from '../../../_hooks/use-price-draft-hydrated'
import {
  createInitialOrder,
  orderToShipmentPatch,
  reconstructOrderFromPriceDraft,
  reconstructOrderFromShipmentDraft,
  resolvePlaceFromCity,
  sanitizeDistinctPlaces,
  shipmentEstimateFromOrder,
  type Offer,
  type OrderDraft,
} from '../../../_lib/siparis-draft-map'
import { useCreateShipmentStore } from '../../../_stores/create-shipment-draft-store'
import { usePriceDraftStore } from '../../../_stores/price-calculation-draft-store'
import {
  canSubmitCreateShipment,
  getCreateShipmentMissingFields,
} from '../../../_types/create-shipment'
import { resolveShipmentServiceType } from '../../../_types/shipments'
import { CreateShipmentPageForm } from './create-shipment-page-form'
import type { WizardSnapshot } from '../../../_components/siparis-panel-wizard'

export function CreateShipmentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const hydrated = useCreateShipmentHydrated()
  const priceHydrated = usePriceDraftHydrated()
  const draft = useCreateShipmentStore((s) => s.draft)
  const { hydrateFromSources, resetDraft } = useCreateShipmentStore()

  const [submitting, setSubmitting] = useState(false)
  const [bootstrapped, setBootstrapped] = useState(false)
  const [autosaveFlash, setAutosaveFlash] = useState(false)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    if (!hydrated || !bootstrapped) return
    setAutosaveFlash(true)
    const timer = window.setTimeout(() => setAutosaveFlash(false), 1200)
    return () => window.clearTimeout(timer)
  }, [bootstrapped, draft.siparis, draft.selectedOffer, draft.paymentMethod, draft.note, hydrated])

  useEffect(() => {
    if (!hydrated || bootstrapped) return
    if (searchParams.get('quoteId') && !priceHydrated) return

    const orderId = searchParams.get('orderId')
    const quoteId = searchParams.get('quoteId')
    const templateId = searchParams.get('templateId')
    const repeat = searchParams.get('repeat')
    const current = useCreateShipmentStore.getState().draft

    async function bootstrap() {
      if (orderId) {
        const order = await ordersRepository.getById(orderId)
        if (order) {
          const siparis = sanitizeDistinctPlaces({
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
          })
          hydrateFromSources({
            source: 'order',
            orderId: order.id,
            ...orderToShipmentPatch(siparis, null),
            siparis,
            siparisStep: 'route',
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
          const siparis = sanitizeDistinctPlaces({
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
          })
          hydrateFromSources({
            source: 'repeat',
            repeatShipmentId: shipment.id,
            ...orderToShipmentPatch(siparis, null),
            siparis,
            siparisStep: 'route',
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
          origin: null,
          destination: null,
          siparis: { ...createInitialOrder(), service: 'kargo' },
          siparisStep: 'route',
          providerName: 'ARF Parcel',
          serviceName: 'Şablon Express',
          priceTry: 149,
        })
        setBootstrapped(true)
        return
      }

      if (quoteId) {
        const priceDraft = usePriceDraftStore.getState().draft
        const siparis = sanitizeDistinctPlaces(
          current.siparis?.origin
            ? { ...createInitialOrder(), ...current.siparis }
            : reconstructOrderFromPriceDraft(priceDraft)
        )
        let offer: Offer | null = current.selectedOffer ?? priceDraft.selectedOffer
        let providerName = offer?.carrier ?? current.providerName ?? 'ARF Parcel'
        let serviceName = offer?.title ?? current.serviceName ?? 'Express Kapıdan Kapıya'
        let priceTry = offer?.price ?? current.priceTry ?? 189

        const quotes = await quoteRepository.search(priceDraft)
        const selected = quotes.find((quote) => quote.id === quoteId) ?? quotes[0] ?? null
        if (selected && !offer) {
          providerName = selected.providerName
          serviceName = selected.serviceName
          priceTry = selected.priceTry ?? priceTry
        }

        const linkedQuote =
          current.quoteRequestId
            ? await quoteRequestsRepository.getById(current.quoteRequestId)
            : await quoteRequestsRepository.findByOfferOrId(quoteId)

        hydrateFromSources({
          source: 'quote',
          quoteId,
          quoteRequestId: current.quoteRequestId ?? linkedQuote?.id ?? null,
          linkedOrderIds: current.linkedOrderIds,
          ...orderToShipmentPatch(siparis, offer),
          siparis,
          siparisStep: 'route',
          selectedOffer: offer,
          providerName,
          serviceName,
          priceTry,
        })
        setBootstrapped(true)
        return
      }

      const restored = sanitizeDistinctPlaces(
        current.siparis
          ? { ...createInitialOrder(), ...current.siparis }
          : reconstructOrderFromShipmentDraft({
              ...current,
              operationType: current.origin || current.destination ? current.operationType : null,
            })
      )
      const blank = !restored.origin && !restored.destination
      const siparis = blank ? createInitialOrder() : restored
      hydrateFromSources({
        siparis,
        ...orderToShipmentPatch(siparis, current.selectedOffer),
        siparisStep: 'route',
      })

      setBootstrapped(true)
    }

    void bootstrap()
  }, [bootstrapped, hydrateFromSources, hydrated, priceHydrated, searchParams])

  const persistSnapshot = useCallback((snapshot: WizardSnapshot) => {
    const { draft: order, selectedOffer } = snapshot
    const estimate = selectedOffer ? null : shipmentEstimateFromOrder(order)
    useCreateShipmentStore.getState().patchDraft({
      ...orderToShipmentPatch(order, selectedOffer),
      ...(estimate ?? {}),
      siparis: order,
      siparisStep: 'route',
      selectedOffer,
      quoteId: selectedOffer?.id ?? useCreateShipmentStore.getState().draft.quoteId,
    })
  }, [])

  async function handleSubmit() {
    const current = useCreateShipmentStore.getState().draft
    const order = current.siparis ?? reconstructOrderFromShipmentDraft(current)
    const fromOrder = orderToShipmentPatch(order, current.selectedOffer)
    const estimate = current.selectedOffer ? null : shipmentEstimateFromOrder(order)
    const readyDraft = {
      ...current,
      ...fromOrder,
      ...(estimate ?? {}),
      siparis: order,
    }
    useCreateShipmentStore.getState().patchDraft({
      ...fromOrder,
      ...(estimate ?? {}),
      siparis: order,
    })

    if (!canSubmitCreateShipment(readyDraft)) {
      const missing = getCreateShipmentMissingFields(readyDraft)
      toast.message(`Eksik alanlar: ${missing.slice(0, 3).join(', ')}`)
      return
    }
    setSubmitting(true)
    try {
      const totalsPieces = readyDraft.pieces
      const desi = totalsPieces.reduce((sum, piece) => sum + piece.desi * piece.quantity, 0)
      const weightKg = totalsPieces.reduce((sum, piece) => sum + piece.weightKg * piece.quantity, 0)
      const quoteRequest =
        readyDraft.quoteRequestId
          ? await quoteRequestsRepository.getById(readyDraft.quoteRequestId)
          : readyDraft.quoteId
            ? await quoteRequestsRepository.findByOfferOrId(readyDraft.quoteId)
            : null

      const linkedOrderIds =
        Array.isArray(readyDraft.linkedOrderIds) && readyDraft.linkedOrderIds.length > 0
          ? readyDraft.linkedOrderIds
          : readyDraft.orderId
            ? [readyDraft.orderId]
            : []
      const primaryOrder = linkedOrderIds[0]
        ? await ordersRepository.getById(linkedOrderIds[0])
        : readyDraft.orderId
          ? await ordersRepository.getById(readyDraft.orderId)
          : null

      const created = await shipmentsListRepository.create({
        reference: `GND-${Math.floor(Math.random() * 9000 + 1000)}`,
        orderNumber: primaryOrder?.orderNumber ?? null,
        quoteId: quoteRequest?.id ?? null,
        quoteReference: quoteRequest?.reference ?? null,
        carrier: readyDraft.providerName ?? 'Gönder Kargo',
        serviceLabel: readyDraft.serviceName ?? 'Standart',
        serviceType: resolveShipmentServiceType(readyDraft.operationType),
        operationType: readyDraft.operationType ?? 'parcel',
        logisticsMode: readyDraft.operationType === 'logistics' ? 'spot' : null,
        originCity: readyDraft.origin?.city ?? readyDraft.origin?.label ?? '—',
        destinationCity: readyDraft.destination?.city ?? readyDraft.destination?.label ?? '—',
        status: 'label_ready',
        desi,
        weightKg,
        amountTry: readyDraft.priceTry,
      })

      if (linkedOrderIds.length) {
        await ordersRepository.bulkUpdateStatus(linkedOrderIds, 'shipment_created')
      }

      if (quoteRequest) {
        await quoteRequestsRepository.markConverted(
          quoteRequest.id,
          created.id,
          created.reference
        )
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: SHIPMENTS_LIST_KEY }),
        queryClient.invalidateQueries({ queryKey: QUOTE_REQUESTS_KEY }),
        queryClient.invalidateQueries({ queryKey: ORDERS_KEY }),
      ])

      resetDraft()
      toast.success(`${created.reference} oluşturuldu`)
      router.push(ARF_ROUTES.gonder.shipments.list)
    } catch {
      toast.error('Gönderi oluşturulamadı')
    } finally {
      setSubmitting(false)
    }
  }

  if (!hydrated || !bootstrapped) {
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

  const initialOrder = sanitizeDistinctPlaces(
    draft.siparis ?? reconstructOrderFromShipmentDraft(draft)
  )

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
              <span>Adres, hizmet ve detayı tek sayfada doldur. Kaynak: {sourceLabel(draft.source)}</span>
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
                setFormKey((key) => key + 1)
              }}
            >
              Taslağı sıfırla
            </Button>
          </div>
        </div>

        <CreateShipmentPageForm
          formKey={formKey}
          initialDraft={initialOrder}
          initialOffer={draft.selectedOffer}
          submitting={submitting}
          onChange={persistSnapshot}
          onSubmit={() => void handleSubmit()}
        />
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
