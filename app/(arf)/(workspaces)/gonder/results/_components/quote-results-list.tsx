'use client'

import { QuoteOfferCard } from '../../_components/quote-offer-card'
import { QuoteNetworkNotice } from '../../_components/quote-network-notice'
import { Card, CardContent } from '@/components/ui/card'
import type { SearchQuote } from '../../_types/price-calculation'

type Props = {
  quotes: SearchQuote[]
  onSelect: (quote: SearchQuote) => void
  showNetworkNotice?: boolean
}

export function QuoteResultsList({ quotes, onSelect, showNetworkNotice = true }: Props) {
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
        <QuoteOfferCard
          key={quote.id}
          providerName={quote.providerName}
          serviceName={quote.serviceName}
          vehicleLabel={quote.vehicleLabel}
          etaLabel={quote.etaLabel}
          pickupLabel={quote.pickupLabel}
          insuranceLabel={quote.insuranceLabel}
          priceTry={quote.priceTry}
          preparing={quote.priceState === 'preparing'}
          quoteSource={quote.quoteSource}
          badges={quote.badges}
          onSelect={() => onSelect(quote)}
          selectDisabled={quote.priceState === 'preparing' || quote.priceTry == null}
          selectLabel='Teklifi Seç'
        />
      ))}
      {showNetworkNotice && quotes.some((quote) => quote.priceTry != null) ? (
        <QuoteNetworkNotice />
      ) : null}
    </div>
  )
}
