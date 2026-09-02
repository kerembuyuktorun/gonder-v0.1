import type { QuotePaymentSummary } from './payment'

export type QuoteRequestStatus =
  | 'draft'
  | 'submitted'
  | 'collecting'
  | 'partially_received'
  | 'ready'
  | 'selected'
  | 'payment_pending'
  | 'paid'
  | 'converted'
  | 'expired'
  | 'cancelled'
  | 'rejected'

export type QuoteOfferStatus =
  | 'pending'
  | 'received'
  | 'recommended'
  | 'selected'
  | 'expired'
  | 'rejected'
  | 'withdrawn'

export type QuoteRequestView =
  | 'all'
  | 'open'
  | 'action_required'
  | 'ready'
  | 'converted'
  | 'closed'

export type QuoteSource = 'instant' | 'network' | 'specialist'

export type QuoteHighlight = 'recommended' | 'fastest' | 'best_price'

export type QuoteOffer = {
  id: string
  requestId: string
  providerName: string
  serviceName: string
  etaLabel: string
  pickupLabel: string
  insuranceLabel?: string
  score?: number
  priceTry: number | null
  status: QuoteOfferStatus
  badges?: QuoteHighlight[]
  quoteSource: QuoteSource
  /** Araç / hizmet tipi (ör. Tır · Tenteli, LTL Parsiyel) */
  vehicleLabel?: string
  hasInstantPrice: boolean
  hasPickupService: boolean
  serviceType: string
  receivedAt: string
}

export type QuoteRequest = {
  id: string
  reference: string
  status: QuoteRequestStatus
  operationType: 'parcel' | 'courier' | 'logistics'
  originLabel: string
  destinationLabel: string
  originCity?: string
  destinationCity?: string
  pieceCount: number
  totalDesi: number
  createdAt: string
  updatedAt: string
  selectedQuoteId: string | null
  shipmentId: string | null
  /** Kart ile ödeme tamamlandıysa tahsilat özeti */
  payment: QuotePaymentSummary | null
  offers: QuoteOffer[]
}

export const QUOTE_REQUEST_STATUS_LABELS: Record<QuoteRequestStatus, string> = {
  draft: 'Taslak',
  submitted: 'Gönderildi',
  collecting: 'Toplanıyor',
  partially_received: 'Kısmi alındı',
  ready: 'Hazır',
  selected: 'Seçildi',
  payment_pending: 'Ödeme bekliyor',
  paid: 'Ödendi',
  converted: 'Gönderiye dönüştü',
  expired: 'Süresi doldu',
  cancelled: 'İptal',
  rejected: 'Reddedildi',
}

export const QUOTE_OFFER_STATUS_LABELS: Record<QuoteOfferStatus, string> = {
  pending: 'Bekliyor',
  received: 'Alındı',
  recommended: 'Önerilen',
  selected: 'Seçildi',
  expired: 'Süresi doldu',
  rejected: 'Reddedildi',
  withdrawn: 'Geri çekildi',
}

export const QUOTE_REQUEST_VIEW_STATUSES: Record<QuoteRequestView, QuoteRequestStatus[] | null> = {
  all: null,
  open: ['draft', 'submitted', 'collecting', 'partially_received', 'ready'],
  action_required: ['ready', 'selected', 'payment_pending', 'paid', 'partially_received'],
  ready: ['ready', 'selected', 'payment_pending', 'paid', 'partially_received'],
  converted: ['converted'],
  closed: ['expired', 'cancelled', 'rejected'],
}

export const QUOTE_REQUEST_STATUS_BADGE: Record<QuoteRequestStatus, string> = {
  draft: 'border-slate-400/30 bg-slate-500/10 text-slate-700',
  submitted: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  collecting: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  partially_received: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  ready: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  selected: 'border-violet-500/20 bg-violet-500/10 text-violet-700',
  payment_pending: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  paid: 'border-teal-500/20 bg-teal-500/10 text-teal-700',
  converted: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  expired: 'border-slate-400/30 bg-slate-500/10 text-slate-700',
  cancelled: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
  rejected: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
}

export const ACTIONABLE_QUOTE_REQUEST_STATUSES: QuoteRequestStatus[] = [
  'ready',
  'selected',
  'payment_pending',
  'paid',
  'partially_received',
]

/** Seçilen teklif için kart tahsilatı beklenen durumlar */
export const PAYABLE_QUOTE_REQUEST_STATUSES: QuoteRequestStatus[] = [
  'selected',
  'payment_pending',
]
