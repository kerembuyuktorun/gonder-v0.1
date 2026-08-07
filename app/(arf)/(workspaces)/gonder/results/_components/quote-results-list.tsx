'use client'

import {
  ArrowRight,
  Clock3,
  Loader2,
  Package,
  Shield,
  Star,
  Truck,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatMoneyTry } from '../../_lib/price-calculation-labels'
import type { SearchQuote } from '../../_types/price-calculation'

type Props = {
  quotes: SearchQuote[]
  onSelect: (quote: SearchQuote) => void
}

export function QuoteResultsList({ quotes, onSelect }: Props) {
  if (quotes.length === 0) {
    return (
      <Card>
        <CardContent className='py-6 text-center text-sm text-muted-foreground'>
          Filtrelerinize uygun teklif bulunamadı.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-3'>
      {quotes.map((quote) => (
        <Card key={quote.id} className='overflow-hidden'>
          <CardContent className='flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex min-w-0 flex-1 items-start gap-2.5'>
              <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted'>
                <Truck className='size-4 text-muted-foreground' />
              </div>
              <div className='min-w-0 space-y-1.5'>
                <div className='flex flex-wrap items-center gap-2'>
                  <p className='font-semibold'>{quote.providerName}</p>
                  {quote.badges?.includes('recommended') ? (
                    <Badge className='bg-primary text-primary-foreground hover:bg-primary'>
                      Önerilen
                    </Badge>
                  ) : null}
                  {quote.badges?.includes('fastest') ? (
                    <Badge
                      variant='outline'
                      className='border-sky-500/20 bg-sky-500/10 text-sky-700'
                    >
                      <Zap className='mr-1 size-3' />
                      En hızlı
                    </Badge>
                  ) : null}
                  {quote.priceState === 'preparing' ? (
                    <Badge
                      variant='outline'
                      className='border-amber-500/20 bg-amber-500/10 text-amber-700'
                    >
                      <Loader2 className='mr-1 size-3 animate-spin' />
                      Teklif hazırlanıyor
                    </Badge>
                  ) : null}
                </div>
                <p className='text-sm text-muted-foreground'>{quote.serviceName}</p>
                <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'>
                  <span className='inline-flex items-center gap-1'>
                    <Clock3 className='size-3.5' />
                    {quote.etaLabel}
                  </span>
                  <span className='inline-flex items-center gap-1'>
                    <Package className='size-3.5' />
                    {quote.pickupLabel}
                  </span>
                  {quote.insuranceLabel ? (
                    <span className='inline-flex items-center gap-1'>
                      <Shield className='size-3.5' />
                      {quote.insuranceLabel}
                    </span>
                  ) : null}
                  {quote.score != null ? (
                    <span className='inline-flex items-center gap-1'>
                      <Star className='size-3.5' />
                      {quote.score.toFixed(1)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className='flex shrink-0 flex-col items-stretch gap-2 sm:items-end'>
              {quote.priceState === 'ready' && quote.priceTry != null ? (
                <p className='text-right text-xl font-semibold tabular-nums'>
                  {formatMoneyTry(quote.priceTry)}
                </p>
              ) : (
                <p className='text-sm font-medium text-muted-foreground'>Teklif hazırlanıyor</p>
              )}
              <Button
                type='button'
                disabled={quote.priceState === 'preparing'}
                onClick={() => onSelect(quote)}
                className='gap-1.5'
              >
                Seç ve devam et
                <ArrowRight className='size-4' />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
