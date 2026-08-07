'use client'

import {
  Box,
  Package,
  PackageOpen,
  Ruler,
  Truck,
  Warehouse,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  COURIER_SPEED_LABELS,
  LOGISTICS_SUBTYPE_LABELS,
  OPERATION_TYPE_LABELS,
} from '../_lib/price-calculation-labels'
import {
  calcPiecesTotals,
  type PriceCalculationDraft,
} from '../_types/price-calculation'

type Props = {
  draft: PriceCalculationDraft
}

export function PriceDraftSummaryPanel({ draft }: Props) {
  const totals = calcPiecesTotals(draft.pieces)
  const showLogisticsHint =
    draft.operationType !== 'logistics' && draft.pieces.length > 0 && totals.desi > 30

  return (
    <div className='sticky top-4 space-y-2'>
      <Card className='gap-0 py-0 shadow-sm'>
        <CardHeader className='space-y-0 px-3 pt-3 pb-1.5'>
          <CardTitle className='text-sm font-semibold'>Canlı özet</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 px-3 pb-3 pt-0 text-sm'>
          <SummaryRow
            icon={Truck}
            label='Rota'
            value={
              draft.origin?.label && draft.destination?.label
                ? `${draft.origin.city ?? draft.origin.label} → ${draft.destination.city ?? draft.destination.label}`
                : 'Adres seçilmedi'
            }
          />
          <SummaryRow
            icon={Package}
            label='Operasyon'
            value={
              draft.operationType
                ? OPERATION_TYPE_LABELS[draft.operationType]
                : 'Seçilmedi'
            }
          />
          {draft.operationType === 'logistics' && draft.logisticsSubtype ? (
            <SummaryRow
              icon={Warehouse}
              label='Taşıma'
              value={LOGISTICS_SUBTYPE_LABELS[draft.logisticsSubtype]}
            />
          ) : null}
          {draft.operationType === 'courier' && draft.courierSpeed ? (
            <SummaryRow
              icon={Box}
              label='Kurye hızı'
              value={COURIER_SPEED_LABELS[draft.courierSpeed]}
            />
          ) : null}
          {draft.pieces.length > 0 ? (
            <SummaryRow
              icon={PackageOpen}
              label='Parça'
              value={`${draft.pieces.length} kalem · ${totals.quantity} adet`}
            />
          ) : null}
          {draft.pieces.length > 0 ? (
            <div className='rounded-lg border bg-muted/30 p-2.5'>
              <div className='flex items-center justify-between'>
                <span className='inline-flex items-center gap-1.5 text-muted-foreground'>
                  <Ruler className='size-3.5' />
                  Toplam desi
                </span>
                <span className='text-base font-semibold tabular-nums'>
                  {Math.round(totals.desi * 100) / 100}
                </span>
              </div>
            </div>
          ) : null}
          {showLogisticsHint ? (
            <div className='rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs text-amber-700'>
              Desi 30’un üzerinde. Daha uygun fiyat için Lojistik operasyonunu
              değerlendirebilirsiniz.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className='gap-0 py-0 shadow-sm'>
        <CardHeader className='space-y-0 px-3 pt-3 pb-1.5'>
          <CardTitle className='text-sm font-semibold'>Harita</CardTitle>
        </CardHeader>
        <CardContent className='px-3 pb-3 pt-0'>
          <div className='flex h-32 items-center justify-center rounded-lg border border-dashed bg-muted/20 px-3 text-center text-xs text-muted-foreground'>
            {draft.origin || draft.destination
              ? 'Harita önizleme (Places mock) — gerçek Maps tile sonraki entegrasyonda'
              : 'Adres seçildiğinde rota haritası burada görünecek'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Truck
  label: string
  value: string
}) {
  return (
    <div className='flex items-start gap-2'>
      <div className='mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted'>
        <Icon className='size-3.5 text-muted-foreground' />
      </div>
      <div className='min-w-0'>
        <p className='text-xs text-muted-foreground'>{label}</p>
        <p className='truncate font-medium'>{value}</p>
      </div>
    </div>
  )
}
