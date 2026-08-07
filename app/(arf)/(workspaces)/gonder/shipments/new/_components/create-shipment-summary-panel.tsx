'use client'

import { AlertCircle, Box, CheckCircle2, Package, PackageOpen, Ruler, Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { COURIER_SPEED_LABELS, OPERATION_TYPE_LABELS } from '../../../_lib/price-calculation-labels'
import {
  getCreateShipmentMissingFields,
  type CreateShipmentDraft,
} from '../../../_types/create-shipment'
import { calcPiecesTotals } from '../../../_types/price-calculation'

type Props = {
  draft: CreateShipmentDraft
  sourceLabel: string
  submitting?: boolean
  onSubmit: () => void
}

function formatMoney(value: number | null) {
  if (value == null) return '—'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value)
}

export function CreateShipmentSummaryPanel({
  draft,
  sourceLabel,
  submitting,
  onSubmit,
}: Props) {
  const totals = calcPiecesTotals(draft.pieces)
  const missing = getCreateShipmentMissingFields(draft)
  const ready = missing.length === 0

  return (
    <div className='space-y-3 lg:sticky lg:top-4'>
      <Card className='gap-0 py-0 shadow-sm'>
        <CardHeader className='space-y-0 px-3 pt-3 pb-1.5'>
          <div className='flex items-center justify-between gap-2'>
            <CardTitle className='text-sm font-semibold'>Canlı gönderi özeti</CardTitle>
            <Badge variant='outline' className='font-normal'>
              {sourceLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-2 px-3 pb-3 pt-0 text-sm'>
          <SummaryRow
            icon={Package}
            label='Operasyon'
            value={
              draft.operationType ? OPERATION_TYPE_LABELS[draft.operationType] : 'Seçilmedi'
            }
          />
          <SummaryRow
            icon={Truck}
            label='Rota'
            value={
              draft.origin?.label && draft.destination?.label
                ? `${draft.origin.city ?? draft.origin.label} → ${draft.destination.city ?? draft.destination.label}`
                : 'Adres seçilmedi'
            }
          />
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
                  Desi / kg
                </span>
                <span className='tabular-nums font-semibold'>
                  {Math.round(totals.desi * 100) / 100} ·{' '}
                  {Math.round(totals.weightKg * 100) / 100}
                </span>
              </div>
            </div>
          ) : null}
          <SummaryRow
            icon={Truck}
            label='Hizmet'
            value={
              draft.providerName && draft.serviceName
                ? `${draft.providerName} · ${draft.serviceName}`
                : 'Seçilmedi'
            }
          />
        </CardContent>
      </Card>

      <Card className='gap-0 py-0 shadow-sm'>
        <CardHeader className='space-y-0 px-3 pt-3 pb-1.5'>
          <CardTitle className='text-sm font-semibold'>Eksik alanlar</CardTitle>
        </CardHeader>
        <CardContent className='px-3 pb-3 pt-0'>
          {ready ? (
            <p className='inline-flex items-center gap-1.5 text-sm text-emerald-700'>
              <CheckCircle2 className='size-3.5' />
              Form gönderime hazır
            </p>
          ) : (
            <ul className='space-y-1.5'>
              {missing.map((item) => (
                <li
                  key={item}
                  className='inline-flex w-full items-start gap-1.5 text-xs text-amber-800'
                >
                  <AlertCircle className='mt-0.5 size-3.5 shrink-0' />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className='gap-0 py-0 shadow-sm'>
        <CardHeader className='space-y-0 px-3 pt-3 pb-1.5'>
          <CardTitle className='text-sm font-semibold'>Fiyat / teklif</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 px-3 pb-3 pt-0'>
          <div className='flex items-end justify-between gap-2'>
            <span className='text-sm text-muted-foreground'>Tahmini ücret</span>
            <span className='text-xl font-semibold tabular-nums'>
              {formatMoney(draft.priceTry)}
            </span>
          </div>
          <Button
            type='button'
            className='w-full'
            disabled={submitting || !ready}
            onClick={onSubmit}
          >
            {submitting ? 'Oluşturuluyor…' : 'Gönderiyi oluştur'}
          </Button>
          {!ready ? (
            <p className='text-[11px] text-muted-foreground'>
              Eksik alanları tamamladıktan sonra oluşturabilirsiniz.
            </p>
          ) : null}
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
  icon: typeof Package
  label: string
  value: string
}) {
  return (
    <div className='flex items-start justify-between gap-3'>
      <span className='inline-flex items-center gap-1.5 text-muted-foreground'>
        <Icon className='size-3.5 shrink-0' />
        {label}
      </span>
      <span className='max-w-[60%] text-right font-medium'>{value}</span>
    </div>
  )
}
