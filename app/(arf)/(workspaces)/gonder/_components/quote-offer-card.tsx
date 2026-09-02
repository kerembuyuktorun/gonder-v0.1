'use client'

import { Check, Clock3, Loader2, Star, Truck, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatMoneyTry } from '../_lib/price-calculation-labels'
import {
  QUOTE_HIGHLIGHT_LABELS,
  QUOTE_SOURCE_BADGE,
  QUOTE_SOURCE_LABELS,
  type QuoteHighlight,
  type QuoteSource,
} from '../_lib/quote-offer-labels'
import { CarrierLogo } from './carrier-logo'

export type QuoteOfferCardProps = {
  providerName: string
  serviceName: string
  vehicleLabel?: string
  etaLabel: string
  pickupLabel?: string
  insuranceLabel?: string
  priceTry: number | null
  preparing?: boolean
  quoteSource: QuoteSource
  badges?: QuoteHighlight[]
  selected?: boolean
  selectDisabled?: boolean
  onSelect?: () => void
  selectLabel?: string
}

const HIGHLIGHT_CLASS: Record<QuoteHighlight, string> = {
  recommended: 'border-primary/20 bg-primary/12 text-foreground',
  fastest: 'border-sky-500/20 bg-sky-500/10 text-sky-800',
  best_price: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-800',
}

function HighlightIcon({ highlight }: { highlight: QuoteHighlight }) {
  if (highlight === 'fastest') return <Zap className='size-3' />
  if (highlight === 'best_price') return <span className='text-[10px] font-bold'>₺</span>
  return <Star className='size-3' />
}

export function QuoteOfferCard({
  providerName,
  serviceName,
  vehicleLabel,
  etaLabel,
  pickupLabel,
  insuranceLabel,
  priceTry,
  preparing = false,
  quoteSource,
  badges = [],
  selected = false,
  selectDisabled,
  onSelect,
  selectLabel = 'Teklifi Seç',
}: QuoteOfferCardProps) {
  const serviceType = vehicleLabel || serviceName
  const disabled = selectDisabled || preparing || priceTry == null || !onSelect

  return (
    <Card
      className={cn(
        'gap-0 overflow-hidden py-0 shadow-sm',
        selected && 'border-2 border-primary ring-2 ring-primary/20'
      )}
    >
      <CardContent className='flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex min-w-0 flex-1 items-start gap-3'>
          <CarrierLogo name={providerName} />
          <div className='min-w-0 space-y-1.5'>
            <div className='flex flex-wrap items-center gap-1.5'>
              <p className='font-semibold'>{providerName}</p>
              <Badge variant='outline' className={QUOTE_SOURCE_BADGE[quoteSource]}>
                {QUOTE_SOURCE_LABELS[quoteSource]}
              </Badge>
              {badges.map((badge) => (
                <Badge key={badge} variant='outline' className={cn('gap-1', HIGHLIGHT_CLASS[badge])}>
                  <HighlightIcon highlight={badge} />
                  {QUOTE_HIGHLIGHT_LABELS[badge]}
                </Badge>
              ))}
              {preparing ? (
                <Badge
                  variant='outline'
                  className='border-amber-500/20 bg-amber-500/10 text-amber-800'
                >
                  <Loader2 className='mr-1 size-3 animate-spin' />
                  Hazırlanıyor
                </Badge>
              ) : null}
              {selected ? (
                <Badge
                  variant='outline'
                  className='border-violet-500/20 bg-violet-500/10 text-violet-700'
                >
                  Onaylanan teklif
                </Badge>
              ) : null}
            </div>
            <p className='text-sm text-muted-foreground'>{serviceName}</p>
            <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'>
              <span className='inline-flex items-center gap-1'>
                <Clock3 className='size-3.5' />
                {etaLabel}
              </span>
              <span className='inline-flex items-center gap-1'>
                <Truck className='size-3.5' />
                {serviceType}
              </span>
              {pickupLabel ? <span>Alma: {pickupLabel}</span> : null}
              {insuranceLabel ? <span>{insuranceLabel}</span> : null}
            </div>
          </div>
        </div>

        <div className='flex shrink-0 flex-col items-stretch gap-2 sm:min-w-[168px] sm:items-end'>
          {preparing || priceTry == null ? (
            <p className='text-sm font-medium text-muted-foreground'>Teklif hazırlanıyor</p>
          ) : (
            <p className='text-right text-xl font-semibold tabular-nums'>
              {formatMoneyTry(priceTry)}
            </p>
          )}
          {onSelect ? (
            <Button
              type='button'
              size='sm'
              disabled={disabled}
              variant={selected ? 'outline' : 'default'}
              onClick={onSelect}
              className='gap-1.5'
            >
              <Check className='size-3.5' />
              {selectLabel}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
