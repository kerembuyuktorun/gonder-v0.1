'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@hascanb/arf-ui-kit/layout-kit'
import {
  Bike,
  Boxes,
  CalendarClock,
  Container,
  Package,
  Send,
  Truck,
  Warehouse,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ARF_ROUTES } from '../../../../_shared/routes'
import {
  COURIER_SPEED_LABELS,
  LOGISTICS_SUBTYPE_LABELS,
} from '../../_lib/price-calculation-labels'
import {
  isPriceDraftReady,
  usePriceDraftStore,
} from '../../_stores/price-calculation-draft-store'
import {
  calcPiecesTotals,
  type CourierSpeed,
  type LogisticsSubtype,
  type OperationType,
} from '../../_types/price-calculation'
import { PieceListEditor } from '../../_components/piece-list-editor'
import { PriceDraftSummaryPanel } from '../../_components/price-draft-summary-panel'
import { PriceRouteLocations } from '../../_components/price-route-locations'
import { SelectionTile } from '../../_components/selection-tile'
import { quoteRequestsRepository } from '../../_data/quote-requests-repository'

const OPERATION_OPTIONS: Array<{
  id: OperationType
  title: string
  icon: typeof Package
}> = [
  { id: 'parcel', title: 'Kargo / Parcel', icon: Package },
  { id: 'courier', title: 'Kurye', icon: Bike },
  { id: 'logistics', title: 'Lojistik', icon: Truck },
]

const COURIER_OPTIONS: Array<{
  id: CourierSpeed
  title: string
  icon: typeof Zap
}> = [
  { id: 'express', title: COURIER_SPEED_LABELS.express, icon: Zap },
  { id: 'same_day', title: COURIER_SPEED_LABELS.same_day, icon: Send },
  { id: 'scheduled', title: COURIER_SPEED_LABELS.scheduled, icon: CalendarClock },
]

const VEHICLE_TYPES = ['Kamyonet', 'Kamyon', 'Tır']
const BODY_TYPES = ['Tenteli', 'Kapalı Kasa', 'Frigorifik']
const LOAD_TYPES = ['Paletli', 'Dökme', 'Karışık']

export function PriceCalculationContent() {
  const router = useRouter()
  const draft = usePriceDraftStore((s) => s.draft)
  const {
    setOperationType,
    setOrigin,
    setDestination,
    swapLocations,
    setLogisticsSubtype,
    setVehicleType,
    setBodyType,
    setLoadType,
    setWeightKg,
    addPiece,
    removePiece,
    setCourierSpeed,
  } = usePriceDraftStore()

  const [attempted, setAttempted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const ready = isPriceDraftReady(draft)
  const totals = useMemo(() => calcPiecesTotals(draft.pieces), [draft.pieces])
  const canSubmit = useMemo(() => ready && !submitting, [ready, submitting])

  async function handleSubmit() {
    setAttempted(true)
    const current = usePriceDraftStore.getState().draft
    if (!isPriceDraftReady(current)) return
    setSubmitting(true)
    try {
      const request = await quoteRequestsRepository.createFromPriceDraft(current)
      router.push(ARF_ROUTES.gonder.quotes.detail(request.id))
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: 'Gönder' }, { label: 'Fiyat Hesaplama' }]}
        searchPlaceholder='Gönder ara...'
        searchShortcut={<>⌘K</>}
        notificationsLabel='Bildirimler'
      />

      <div className='flex min-w-0 flex-1 flex-col gap-2 p-3 sm:p-4'>
        <div className='min-w-0'>
          <h1 className='truncate text-xl font-semibold tracking-tight'>Fiyat Hesaplama</h1>
        </div>

        <div className='grid gap-2 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]'>
          <div className='min-w-0 space-y-2 pb-16 sm:pb-0'>
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
                    onClick={() => setOperationType(option.id)}
                  />
                ))}
              </CardContent>
              {attempted && !draft.operationType ? (
                <p className='px-3 pb-2.5 text-[11px] text-destructive'>Operasyon tipi seçin</p>
              ) : null}
            </Card>

            <PriceRouteLocations
              origin={draft.origin}
              destination={draft.destination}
              onOriginChange={setOrigin}
              onDestinationChange={setDestination}
              onSwap={swapLocations}
              originInvalid={attempted && !draft.origin}
              destinationInvalid={attempted && !draft.destination}
            />

            {draft.operationType === 'logistics' ? (
              <Card className='gap-0 py-0 shadow-sm'>
                <CardHeader className='space-y-0 px-3 pt-3 pb-1.5'>
                  <CardTitle className='text-sm font-semibold'>Lojistik alt tipi</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 px-3 pb-3 pt-0'>
                  <div className='grid gap-2 sm:grid-cols-2'>
                    {(
                      [
                        {
                          id: 'ftl' as LogisticsSubtype,
                          title: LOGISTICS_SUBTYPE_LABELS.ftl,
                          icon: Container,
                        },
                        {
                          id: 'ltl' as LogisticsSubtype,
                          title: LOGISTICS_SUBTYPE_LABELS.ltl,
                          icon: Boxes,
                        },
                      ] as const
                    ).map((option) => (
                      <SelectionTile
                        key={option.id}
                        title={option.title}
                        icon={option.icon}
                        compact
                        selected={draft.logisticsSubtype === option.id}
                        onClick={() => setLogisticsSubtype(option.id)}
                      />
                    ))}
                  </div>

                  {draft.logisticsSubtype === 'ftl' ? (
                    <div className='grid gap-2 sm:grid-cols-2'>
                      <SelectChipGroup
                        label='Araç tipi'
                        options={VEHICLE_TYPES}
                        value={draft.vehicleType}
                        onChange={setVehicleType}
                        icon={Truck}
                      />
                      <SelectChipGroup
                        label='Kasa tipi'
                        options={BODY_TYPES}
                        value={draft.bodyType}
                        onChange={setBodyType}
                        icon={Warehouse}
                      />
                    </div>
                  ) : null}

                  {draft.logisticsSubtype === 'ltl' ? (
                    <div className='grid gap-2 sm:grid-cols-2'>
                      <SelectChipGroup
                        label='Yük tipi'
                        options={LOAD_TYPES}
                        value={draft.loadType}
                        onChange={setLoadType}
                        icon={Boxes}
                      />
                      <div className='space-y-1'>
                        <Label className='text-xs'>Ağırlık (kg)</Label>
                        <Input
                          type='number'
                          min={1}
                          className='h-9'
                          value={draft.weightKg ?? ''}
                          onChange={(e) =>
                            setWeightKg(e.target.value ? Number(e.target.value) : null)
                          }
                        />
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {draft.operationType && draft.operationType !== 'logistics' ? (
              <>
                <PieceListEditor
                  pieces={draft.pieces}
                  onAdd={addPiece}
                  onRemove={removePiece}
                  invalid={attempted}
                  showLogisticsHint={totals.desi > 30}
                  onSwitchToLogistics={() => setOperationType('logistics')}
                />

                {draft.operationType === 'courier' ? (
                  <Card className='gap-0 py-0 shadow-sm'>
                    <CardHeader className='space-y-0 px-3 pt-3 pb-1.5'>
                      <CardTitle className='text-sm font-semibold'>Kurye hızı</CardTitle>
                    </CardHeader>
                    <CardContent className='grid gap-2 px-3 pb-3 pt-0 sm:grid-cols-3'>
                      {COURIER_OPTIONS.map((option) => (
                        <SelectionTile
                          key={option.id}
                          title={option.title}
                          icon={option.icon}
                          compact
                          selected={draft.courierSpeed === option.id}
                          onClick={() => setCourierSpeed(option.id)}
                        />
                      ))}
                    </CardContent>
                  </Card>
                ) : null}
              </>
            ) : null}

            <div className='sticky bottom-3 z-10 flex justify-end rounded-xl border bg-background/95 p-2 shadow-sm backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none'>
              <Button
                type='button'
                size='lg'
                className='h-10 w-full sm:w-auto'
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                Fiyatları Gör
              </Button>
            </div>
          </div>

          <div className='hidden xl:block'>
            <PriceDraftSummaryPanel draft={draft} />
          </div>
        </div>

        <div className='xl:hidden'>
          <PriceDraftSummaryPanel draft={draft} />
        </div>
      </div>
    </>
  )
}

function SelectChipGroup({
  label,
  options,
  value,
  onChange,
  icon: Icon,
}: {
  label: string
  options: string[]
  value: string | null
  onChange: (value: string) => void
  icon: typeof Truck
}) {
  return (
    <div className='space-y-1'>
      <Label className='inline-flex items-center gap-1.5 text-xs'>
        <Icon className='size-3.5 text-muted-foreground' />
        {label}
      </Label>
      <div className='flex flex-wrap gap-1.5'>
        {options.map((option) => (
          <button
            key={option}
            type='button'
            onClick={() => onChange(option)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
              value === option
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border text-muted-foreground hover:bg-muted/40'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
