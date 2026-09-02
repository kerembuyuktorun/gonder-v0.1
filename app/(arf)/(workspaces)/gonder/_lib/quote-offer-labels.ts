import type { QuoteHighlight, QuoteSource } from '../_types/quotes'

export type { QuoteHighlight, QuoteSource }

export const QUOTE_SOURCE_LABELS: Record<QuoteSource, string> = {
  instant: 'Anlık Teklif',
  network: 'Gönder Eşleşmesi',
  specialist: 'Uzman Teklifi',
}

export const QUOTE_SOURCE_BADGE: Record<QuoteSource, string> = {
  instant: 'border-sky-500/20 bg-sky-500/10 text-sky-800',
  network: 'border-violet-500/20 bg-violet-500/10 text-violet-800',
  specialist: 'border-amber-500/20 bg-amber-500/10 text-amber-800',
}

export const QUOTE_HIGHLIGHT_LABELS: Record<QuoteHighlight, string> = {
  recommended: 'Önerilen',
  fastest: 'En Hızlı',
  best_price: 'En Uygun',
}

export function inferQuoteSource(input: {
  hasInstantPrice: boolean
  quoteSource?: QuoteSource | null
  specialist?: boolean
}): QuoteSource {
  if (input.quoteSource) return input.quoteSource
  if (input.specialist) return 'specialist'
  return input.hasInstantPrice ? 'instant' : 'network'
}
