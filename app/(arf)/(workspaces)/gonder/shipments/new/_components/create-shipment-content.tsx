'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import { Bike, Package, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ARF_ROUTES } from '../../../../../_shared/routes'
import { PartyAddressCard } from '../../../_components/party-address-card'
import { PieceListEditor } from '../../../_components/piece-list-editor'
import { SelectionTile } from '../../../_components/selection-tile'
import { ordersRepository } from '../../../_data/orders-repository'
import { quoteRepository } from '../../../_data/quote-repository'
import { shipmentsListRepository } from '../../../_data/shipments-list-repository'
import { useCreateShipmentHydrated } from '../../../_hooks/use-create-shipment-hydrated'
import { usePriceDraftHydrated } from '../../../_hooks/use-price-draft-hydrated'
import { useCreateShipmentStore } from '../../../_stores/create-shipment-draft-store'
import { usePriceDraftStore } from '../../../_stores/price-calculation-draft-store'
import {
  canSubmitCreateShipment,
  isCreateShipmentStepReady,
  type CreateShipmentStep,
} from '../../../_types/create-shipment'
import {
  calcPiecesTotals,
  createPieceId,
  type OperationType,
} from '../../../_types/price-calculation'
import { COURIER_SPEED_LABELS, OPERATION_TYPE_LABELS } from '../../../_lib/price-calculation-labels'
import { CreateShipmentStepper } from './create-shipment-stepper'

const OPERATION_OPTIONS: Array<{ id: OperationType; title: string; icon: typeof Package }> = [
  { id: 'parcel', title: 'Kargo / Parcel', icon: Package },
  { id: 'courier', title: 'Kurye', icon: Bike },
  { id: 'logistics', title: 'Lojistik', icon: Truck },
]

const PAYMENT_OPTIONS = [
  { id: 'invoice' as const, label: 'Fatura / vadeli' },
  { id: 'wallet' as const, label: 'Cüzdan' },
  { id: 'card' as const, label: 'Kart' },
]

export function CreateShipmentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hydrated = useCreateShipmentHydrated()
  const priceHydrated = usePriceDraftHydrated()
  const draft = useCreateShipmentStore((s) => s.draft)
  const {
    setStep,
    setSource,
    setOperationType,
    setOrigin,
    setDestination,
    addPiece,
    removePiece,
    setCourierSpeed,
    setQuoteSummary,
    setPaymentMethod,
    setNote,
    hydrateFromSources,
    resetDraft,
  } = useCreateShipmentStore()

  const [attempted, setAttempted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bootstrapped, setBootstrapped] = useState(false)

  const totals = useMemo(() => calcPiecesTotals(draft.pieces), [draft.pieces])

  useEffect(() => {
    if (!hydrated || !priceHydrated || bootstrapped) return

    const orderId = searchParams.get('orderId')
    const quoteId = searchParams.get('quoteId')
    const templateId = searchParams.get('templateId')
    const repeat = searchParams.get('repeat')
    const priceDraft = usePriceDraftStore.getState().draft

    async function bootstrap() {
      if (orderId) {
        const order = await ordersRepository.getById(orderId)
        if (order) {
          hydrateFromSources({
            source: 'order',
            orderId: order.id,
            operationType: 'parcel',
            origin: {
              label: `${order.originCity} çıkış`,
              city: order.originCity,
            },
            destination: {
              label: `${order.destinationCity} varış · ${order.customerName}`,
              city: order.destinationCity,
            },
            pieces:
              draft.pieces.length > 0
                ? draft.pieces
                : [
                    {
                      id: createPieceId(),
                      type: 'Paket',
                      widthCm: 30,
                      lengthCm: 40,
                      heightCm: 20,
                      quantity: Math.max(1, order.pieceCount),
                      desi: 8,
                      weightKg: 2,
                    },
                  ],
            providerName: draft.providerName ?? 'ARF Parcel',
            serviceName: draft.serviceName ?? 'Standart Kapıdan Kapıya',
            priceTry: draft.priceTry ?? Math.round(order.amountTry * 0.15),
            step: 2,
          })
          setBootstrapped(true)
          return
        }
      }

      if (repeat) {
        const shipment = await shipmentsListRepository.getById(repeat)
        if (shipment) {
          hydrateFromSources({
            source: 'repeat',
            repeatShipmentId: shipment.id,
            operationType: 'parcel',
            origin: { label: shipment.originCity, city: shipment.originCity },
            destination: {
              label: shipment.destinationCity,
              city: shipment.destinationCity,
            },
            pieces: [
              {
                id: createPieceId(),
                type: 'Paket',
                widthCm: 30,
                lengthCm: 40,
                heightCm: 20,
                quantity: 1,
                desi: shipment.desi,
                weightKg: shipment.weightKg,
              },
            ],
            providerName: shipment.carrier,
            serviceName: shipment.serviceType,
            priceTry: shipment.amountTry,
            step: 2,
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
          providerName: 'ARF Parcel',
          serviceName: 'Şablon Express',
          priceTry: 149,
          step: 1,
        })
        setBootstrapped(true)
        return
      }

      const effectiveQuoteId = quoteId || priceDraft.selectedQuoteId
      if (effectiveQuoteId || priceDraft.mode === 'shipment' || priceDraft.origin) {
        let providerName = 'ARF Parcel'
        let serviceName = 'Express Kapıdan Kapıya'
        let priceTry = 189

        if (priceDraft.origin && priceDraft.destination && isPriceLikeReady(priceDraft)) {
          const quotes = await quoteRepository.search(priceDraft)
          const selected =
            quotes.find((quote) => quote.id === effectiveQuoteId) ?? quotes[0] ?? null
          if (selected) {
            providerName = selected.providerName
            serviceName = selected.serviceName
            priceTry = selected.priceTry ?? priceTry
          }
        }

        hydrateFromSources({
          source: effectiveQuoteId || priceDraft.selectedQuoteId ? 'quote' : 'manual',
          quoteId: effectiveQuoteId,
          operationType: priceDraft.operationType ?? 'parcel',
          origin: priceDraft.origin,
          destination: priceDraft.destination,
          pieces: priceDraft.pieces.length ? priceDraft.pieces : draft.pieces,
          courierSpeed: priceDraft.courierSpeed,
          providerName,
          serviceName,
          priceTry,
          step: priceDraft.origin && priceDraft.destination ? 3 : 1,
        })
        setBootstrapped(true)
        return
      }

      setBootstrapped(true)
    }

    void bootstrap()
  }, [
    bootstrapped,
    draft.pieces,
    draft.priceTry,
    draft.providerName,
    draft.serviceName,
    hydrateFromSources,
    hydrated,
    priceHydrated,
    searchParams,
  ])

  function goNext() {
    setAttempted(true)
    if (!isCreateShipmentStepReady(draft, draft.step)) return
    setAttempted(false)
    setStep(Math.min(5, draft.step + 1) as CreateShipmentStep)
  }

  function goBack() {
    setAttempted(false)
    setStep(Math.max(1, draft.step - 1) as CreateShipmentStep)
  }

  async function handleSubmit() {
    setAttempted(true)
    if (!canSubmitCreateShipment(draft)) return
    setSubmitting(true)
    try {
      const created = await shipmentsListRepository.create({
        reference: `GND-${Math.floor(Math.random() * 9000 + 1000)}`,
        orderNumber: draft.orderId
          ? (await ordersRepository.getById(draft.orderId))?.orderNumber ?? null
          : null,
        carrier: draft.providerName ?? 'ARF Parcel',
        serviceType: draft.serviceName ?? 'Standart',
        originCity: draft.origin?.city ?? draft.origin?.label ?? '—',
        destinationCity: draft.destination?.city ?? draft.destination?.label ?? '—',
        status: 'label_ready',
        desi: totals.desi,
        weightKg: totals.weightKg,
        amountTry: draft.priceTry,
      })

      if (draft.orderId) {
        await ordersRepository.updateStatus(draft.orderId, 'shipment_created')
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

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Gönder' },
          { label: 'Gönderiler', href: ARF_ROUTES.gonder.shipments.list },
          { label: 'Yeni gönderi' },
        ]}
        searchPlaceholder='Gönder ara...'
        notificationsLabel='Bildirimler'
      />

      <div className='flex flex-1 flex-col gap-3 p-3 sm:p-4'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <h1 className='text-xl font-semibold tracking-tight'>Yeni gönderi</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Taslak otomatik kaydedilir. Kaynak: {sourceLabel(draft.source)}
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' asChild>
              <Link href={ARF_ROUTES.gonder.shipments.list}>Listeye dön</Link>
            </Button>
            <Button variant='ghost' size='sm' onClick={() => resetDraft()}>
              Taslağı sıfırla
            </Button>
          </div>
        </div>

        <Card className='gap-0 py-0 shadow-sm'>
          <CardContent className='p-3'>
            <CreateShipmentStepper
              currentStep={draft.step}
              onStepClick={(step) => {
                if (step <= draft.step) setStep(step)
              }}
            />
          </CardContent>
        </Card>

        {draft.step === 1 ? (
          <Card className='gap-0 py-0 shadow-sm'>
            <CardHeader className='space-y-0 px-3 pt-3 pb-1.5'>
              <CardTitle className='text-sm font-semibold'>Operasyon tipi</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-2 px-3 pb-3 pt-0 sm:grid-cols-3'>
              {OPERATION_OPTIONS.map((option) => (
                <SelectionTile
                  key={option.id}
                  title={option.title}
                  icon={option.icon}
                  compact
                  selected={draft.operationType === option.id}
                  onClick={() => {
                    setSource(draft.source === 'manual' ? 'manual' : draft.source)
                    setOperationType(option.id)
                  }}
                />
              ))}
              {attempted && !draft.operationType ? (
                <p className='text-[11px] text-destructive sm:col-span-3'>Operasyon tipi seçin</p>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {draft.step === 2 ? (
          <div className='grid gap-2 md:grid-cols-2'>
            <PartyAddressCard
              title='Gönderici'
              customerLabel='Gönderici müşteri'
              pinLabel='Sabitle'
              value={draft.origin}
              onChange={setOrigin}
              invalid={attempted && !draft.origin}
            />
            <PartyAddressCard
              title='Alıcı'
              customerLabel='Alıcı müşteri'
              pinLabel='Sabitle'
              value={draft.destination}
              onChange={setDestination}
              invalid={attempted && !draft.destination}
            />
          </div>
        ) : null}

        {draft.step === 3 ? (
          <PieceListEditor
            pieces={draft.pieces}
            onAdd={addPiece}
            onRemove={removePiece}
            invalid={attempted}
          />
        ) : null}

        {draft.step === 4 ? (
          <Card className='gap-0 py-0 shadow-sm'>
            <CardHeader className='space-y-0 px-3 pt-3 pb-1.5'>
              <CardTitle className='text-sm font-semibold'>Teklif / hizmet özeti</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 px-3 pb-3 pt-0'>
              <div className='grid gap-2 sm:grid-cols-2'>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>Taşıyıcı</Label>
                  <Input
                    value={draft.providerName ?? ''}
                    onChange={(e) =>
                      setQuoteSummary({
                        providerName: e.target.value || null,
                        serviceName: draft.serviceName,
                        priceTry: draft.priceTry,
                      })
                    }
                    placeholder='Örn. ARF Parcel'
                  />
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>Servis</Label>
                  <Input
                    value={draft.serviceName ?? ''}
                    onChange={(e) =>
                      setQuoteSummary({
                        providerName: draft.providerName,
                        serviceName: e.target.value || null,
                        priceTry: draft.priceTry,
                      })
                    }
                    placeholder='Örn. Express'
                  />
                </div>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>Fiyat (TRY)</Label>
                  <Input
                    type='number'
                    min={0}
                    value={draft.priceTry ?? ''}
                    onChange={(e) =>
                      setQuoteSummary({
                        providerName: draft.providerName,
                        serviceName: draft.serviceName,
                        priceTry: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  />
                </div>
                {draft.operationType === 'courier' ? (
                  <div className='space-y-1'>
                    <Label className='text-xs text-muted-foreground'>Kurye hızı</Label>
                    <div className='flex flex-wrap gap-1.5'>
                      {(Object.keys(COURIER_SPEED_LABELS) as Array<keyof typeof COURIER_SPEED_LABELS>).map(
                        (speed) => (
                          <button
                            key={speed}
                            type='button'
                            onClick={() => setCourierSpeed(speed)}
                            className={`rounded-full border px-2.5 py-1 text-xs ${
                              draft.courierSpeed === speed
                                ? 'border-primary bg-primary/10'
                                : 'border-border text-muted-foreground'
                            }`}
                          >
                            {COURIER_SPEED_LABELS[speed]}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              {attempted && !isCreateShipmentStepReady(draft, 4) ? (
                <p className='text-[11px] text-destructive'>Taşıyıcı, servis ve fiyat girin</p>
              ) : null}
              <div className='rounded-lg border bg-muted/20 p-2.5 text-sm'>
                <p>
                  Operasyon:{' '}
                  <strong>
                    {draft.operationType
                      ? OPERATION_TYPE_LABELS[draft.operationType]
                      : '—'}
                  </strong>
                </p>
                <p>
                  Toplam: {totals.quantity} adet · {Math.round(totals.desi * 100) / 100} desi ·{' '}
                  {Math.round(totals.weightKg * 100) / 100} kg
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {draft.step === 5 ? (
          <Card className='gap-0 py-0 shadow-sm'>
            <CardHeader className='space-y-0 px-3 pt-3 pb-1.5'>
              <CardTitle className='text-sm font-semibold'>Onay</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 px-3 pb-3 pt-0'>
              <div className='flex flex-wrap gap-2'>
                <Badge variant='outline'>{sourceLabel(draft.source)}</Badge>
                {draft.orderId ? <Badge variant='secondary'>Sipariş bağlı</Badge> : null}
                {draft.quoteId ? <Badge variant='secondary'>Teklif bağlı</Badge> : null}
              </div>
              <div className='rounded-lg border p-3 text-sm space-y-1'>
                <p>
                  Rota:{' '}
                  <strong>
                    {draft.origin?.label} → {draft.destination?.label}
                  </strong>
                </p>
                <p>
                  Hizmet:{' '}
                  <strong>
                    {draft.providerName} · {draft.serviceName}
                  </strong>
                </p>
                <p>
                  Ücret: <strong>{draft.priceTry != null ? `₺${draft.priceTry}` : '—'}</strong>
                </p>
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs text-muted-foreground'>Ödeme yöntemi</Label>
                <div className='flex flex-wrap gap-1.5'>
                  {PAYMENT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type='button'
                      onClick={() => setPaymentMethod(option.id)}
                      className={`rounded-full border px-2.5 py-1 text-xs ${
                        draft.paymentMethod === option.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className='space-y-1'>
                <Label className='text-xs text-muted-foreground'>Not</Label>
                <Textarea
                  value={draft.note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder='Opsiyonel operasyon notu'
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className='sticky bottom-3 z-10 flex justify-between gap-2 rounded-xl border bg-background/95 p-2 shadow-sm backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none'>
          <Button type='button' variant='outline' disabled={draft.step === 1} onClick={goBack}>
            Geri
          </Button>
          {draft.step < 5 ? (
            <Button type='button' onClick={goNext}>
              Devam
            </Button>
          ) : (
            <Button type='button' disabled={submitting} onClick={() => void handleSubmit()}>
              {submitting ? 'Oluşturuluyor…' : 'Gönderiyi oluştur'}
            </Button>
          )}
        </div>
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
