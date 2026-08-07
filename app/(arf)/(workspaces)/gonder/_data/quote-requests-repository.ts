import type { PriceCalculationDraft, SearchQuote } from '../_types/price-calculation'
import { calcPiecesTotals } from '../_types/price-calculation'
import {
  ACTIONABLE_QUOTE_REQUEST_STATUSES,
  QUOTE_REQUEST_VIEW_STATUSES,
  type QuoteOffer,
  type QuoteOfferStatus,
  type QuoteRequest,
  type QuoteRequestStatus,
  type QuoteRequestView,
} from '../_types/quotes'
import { quoteRepository } from './quote-repository'

export type QuoteRequestsListQuery = {
  view?: QuoteRequestView
  status?: QuoteRequestStatus | null
  search?: string
}

export type QuoteRequestsListResult = {
  items: QuoteRequest[]
  total: number
  viewCounts: Record<QuoteRequestView, number>
  actionRequiredCount: number
}

export interface QuoteRequestsRepository {
  list(query?: QuoteRequestsListQuery): Promise<QuoteRequestsListResult>
  getById(id: string): Promise<QuoteRequest | null>
  countActionRequired(): Promise<number>
  createFromPriceDraft(draft: PriceCalculationDraft): Promise<QuoteRequest>
  selectOffer(requestId: string, offerId: string): Promise<QuoteRequest>
  markConverted(requestId: string, shipmentId: string): Promise<QuoteRequest>
}

function offerFromSearchQuote(requestId: string, quote: SearchQuote): QuoteOffer {
  const status: QuoteOfferStatus =
    quote.priceState === 'preparing'
      ? 'pending'
      : quote.badges?.includes('recommended')
        ? 'recommended'
        : 'received'

  return {
    id: quote.id,
    requestId,
    providerName: quote.providerName,
    serviceName: quote.serviceName,
    etaLabel: quote.etaLabel,
    pickupLabel: quote.pickupLabel,
    insuranceLabel: quote.insuranceLabel,
    score: quote.score,
    priceTry: quote.priceTry,
    status,
    badges: quote.badges,
    hasInstantPrice: quote.hasInstantPrice,
    hasPickupService: quote.hasPickupService,
    serviceType: quote.serviceType,
    receivedAt: new Date().toISOString(),
  }
}

const seed: QuoteRequest[] = [
  {
    id: 'qr-1001',
    reference: 'TKF-1001',
    status: 'ready',
    operationType: 'parcel',
    originLabel: 'İstanbul, Kadıköy',
    destinationLabel: 'Ankara, Çankaya',
    originCity: 'İstanbul',
    destinationCity: 'Ankara',
    pieceCount: 2,
    totalDesi: 12,
    createdAt: '2026-08-06T10:00:00.000Z',
    updatedAt: '2026-08-07T08:20:00.000Z',
    selectedQuoteId: null,
    shipmentId: null,
    offers: [
      {
        id: 'qo-1001-a',
        requestId: 'qr-1001',
        providerName: 'ARF Parcel',
        serviceName: 'Express Kapıdan Kapıya',
        etaLabel: '1-2 iş günü',
        pickupLabel: 'Aynı gün alma',
        insuranceLabel: 'Sigorta dahil',
        score: 4.8,
        priceTry: 189,
        status: 'recommended',
        badges: ['recommended'],
        hasInstantPrice: true,
        hasPickupService: true,
        serviceType: 'express',
        receivedAt: '2026-08-06T10:05:00.000Z',
      },
      {
        id: 'qo-1001-b',
        requestId: 'qr-1001',
        providerName: 'HızlıKargo',
        serviceName: 'Standart',
        etaLabel: '2-3 iş günü',
        pickupLabel: 'Ertesi gün alma',
        score: 4.5,
        priceTry: 142,
        status: 'received',
        badges: ['fastest'],
        hasInstantPrice: true,
        hasPickupService: true,
        serviceType: 'standard',
        receivedAt: '2026-08-06T10:06:00.000Z',
      },
      {
        id: 'qo-1001-c',
        requestId: 'qr-1001',
        providerName: 'EkoGönder',
        serviceName: 'Ekonomik',
        etaLabel: '3-5 iş günü',
        pickupLabel: 'Şube teslim',
        score: 4.1,
        priceTry: 118,
        status: 'received',
        hasInstantPrice: true,
        hasPickupService: false,
        serviceType: 'economy',
        receivedAt: '2026-08-06T10:08:00.000Z',
      },
    ],
  },
  {
    id: 'qr-1002',
    reference: 'TKF-1002',
    status: 'collecting',
    operationType: 'courier',
    originLabel: 'İzmir, Konak',
    destinationLabel: 'İzmir, Bornova',
    originCity: 'İzmir',
    destinationCity: 'İzmir',
    pieceCount: 1,
    totalDesi: 3,
    createdAt: '2026-08-07T09:00:00.000Z',
    updatedAt: '2026-08-07T09:10:00.000Z',
    selectedQuoteId: null,
    shipmentId: null,
    offers: [
      {
        id: 'qo-1002-a',
        requestId: 'qr-1002',
        providerName: 'Şehir İçi Express',
        serviceName: 'Aynı Gün',
        etaLabel: 'Bugün 18:00',
        pickupLabel: '30 dk içinde alma',
        score: 4.7,
        priceTry: 95,
        status: 'received',
        hasInstantPrice: true,
        hasPickupService: true,
        serviceType: 'same_day',
        receivedAt: '2026-08-07T09:05:00.000Z',
      },
      {
        id: 'qo-1002-b',
        requestId: 'qr-1002',
        providerName: 'Lojistik Merkez',
        serviceName: 'Planlı Kurye',
        etaLabel: 'Teklif hazırlanıyor',
        pickupLabel: 'Randevulu',
        priceTry: null,
        status: 'pending',
        hasInstantPrice: false,
        hasPickupService: true,
        serviceType: 'scheduled',
        receivedAt: '2026-08-07T09:06:00.000Z',
      },
    ],
  },
  {
    id: 'qr-1003',
    reference: 'TKF-1003',
    status: 'converted',
    operationType: 'parcel',
    originLabel: 'Ankara',
    destinationLabel: 'Antalya',
    originCity: 'Ankara',
    destinationCity: 'Antalya',
    pieceCount: 3,
    totalDesi: 22,
    createdAt: '2026-08-02T14:00:00.000Z',
    updatedAt: '2026-08-03T11:20:00.000Z',
    selectedQuoteId: 'qo-1003-a',
    shipmentId: 'sh-1003',
    offers: [
      {
        id: 'qo-1003-a',
        requestId: 'qr-1003',
        providerName: 'ARF Parcel',
        serviceName: 'Standart',
        etaLabel: '2-3 iş günü',
        pickupLabel: 'Aynı gün alma',
        score: 4.6,
        priceTry: 240,
        status: 'selected',
        badges: ['recommended'],
        hasInstantPrice: true,
        hasPickupService: true,
        serviceType: 'standard',
        receivedAt: '2026-08-02T14:10:00.000Z',
      },
    ],
  },
  {
    id: 'qr-1004',
    reference: 'TKF-1004',
    status: 'payment_pending',
    operationType: 'logistics',
    originLabel: 'İstanbul',
    destinationLabel: 'Gaziantep',
    originCity: 'İstanbul',
    destinationCity: 'Gaziantep',
    pieceCount: 1,
    totalDesi: 40,
    createdAt: '2026-08-05T16:00:00.000Z',
    updatedAt: '2026-08-06T12:00:00.000Z',
    selectedQuoteId: 'qo-1004-a',
    shipmentId: null,
    offers: [
      {
        id: 'qo-1004-a',
        requestId: 'qr-1004',
        providerName: 'Express Lojistik',
        serviceName: 'LTL Teklif',
        etaLabel: '3-4 iş günü',
        pickupLabel: 'Depodan alma',
        score: 4.3,
        priceTry: 1850,
        status: 'selected',
        hasInstantPrice: true,
        hasPickupService: true,
        serviceType: 'ltl',
        receivedAt: '2026-08-05T17:00:00.000Z',
      },
    ],
  },
]

function matches(item: QuoteRequest, query: QuoteRequestsListQuery = {}) {
  const view = query.view ?? 'all'
  const statuses = QUOTE_REQUEST_VIEW_STATUSES[view]
  if (statuses && !statuses.includes(item.status)) return false
  if (query.status && item.status !== query.status) return false
  if (query.search?.trim()) {
    const needle = query.search.trim().toLocaleLowerCase('tr-TR')
    const hay = `${item.reference} ${item.originLabel} ${item.destinationLabel} ${item.offers
      .map((o) => o.providerName)
      .join(' ')}`.toLocaleLowerCase('tr-TR')
    if (!hay.includes(needle)) return false
  }
  return true
}

function countViews(items: QuoteRequest[]): Record<QuoteRequestView, number> {
  return {
    all: items.length,
    open: items.filter((i) => QUOTE_REQUEST_VIEW_STATUSES.open!.includes(i.status)).length,
    action_required: items.filter((i) =>
      QUOTE_REQUEST_VIEW_STATUSES.action_required!.includes(i.status)
    ).length,
    converted: items.filter((i) => QUOTE_REQUEST_VIEW_STATUSES.converted!.includes(i.status))
      .length,
    closed: items.filter((i) => QUOTE_REQUEST_VIEW_STATUSES.closed!.includes(i.status)).length,
  }
}

export class MockQuoteRequestsRepository implements QuoteRequestsRepository {
  private items: QuoteRequest[] = [...seed]

  async list(query: QuoteRequestsListQuery = {}): Promise<QuoteRequestsListResult> {
    await delay(70)
    const filtered = this.items.filter((item) => matches(item, query))
    return {
      items: filtered,
      total: filtered.length,
      viewCounts: countViews(this.items),
      actionRequiredCount: this.items.filter((item) =>
        ACTIONABLE_QUOTE_REQUEST_STATUSES.includes(item.status)
      ).length,
    }
  }

  async getById(id: string): Promise<QuoteRequest | null> {
    await delay(40)
    return this.items.find((item) => item.id === id) ?? null
  }

  async countActionRequired(): Promise<number> {
    await delay(30)
    return this.items.filter((item) =>
      ACTIONABLE_QUOTE_REQUEST_STATUSES.includes(item.status)
    ).length
  }

  async createFromPriceDraft(draft: PriceCalculationDraft): Promise<QuoteRequest> {
    const quotes = await quoteRepository.search(draft)
    const totals = calcPiecesTotals(draft.pieces)
    const id = `qr-${Date.now()}`
    const offers = quotes.map((quote) => offerFromSearchQuote(id, quote))
    const readyCount = offers.filter((o) => o.status !== 'pending').length
    const status: QuoteRequestStatus =
      readyCount === 0
        ? 'collecting'
        : readyCount < offers.length
          ? 'partially_received'
          : 'ready'

    const created: QuoteRequest = {
      id,
      reference: `TKF-${Math.floor(Math.random() * 9000 + 1000)}`,
      status,
      operationType: draft.operationType ?? 'parcel',
      originLabel: draft.origin?.label ?? '—',
      destinationLabel: draft.destination?.label ?? '—',
      originCity: draft.origin?.city,
      destinationCity: draft.destination?.city,
      pieceCount: totals.quantity || draft.pieces.length || 1,
      totalDesi: totals.desi,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      selectedQuoteId: null,
      shipmentId: null,
      offers,
    }
    this.items = [created, ...this.items]
    return created
  }

  async selectOffer(requestId: string, offerId: string): Promise<QuoteRequest> {
    await delay(50)
    const index = this.items.findIndex((item) => item.id === requestId)
    if (index < 0) throw new Error('Teklif talebi bulunamadı')
    const current = this.items[index]!
    const next: QuoteRequest = {
      ...current,
      status: 'selected',
      selectedQuoteId: offerId,
      updatedAt: new Date().toISOString(),
      offers: current.offers.map((offer) => ({
        ...offer,
        status: offer.id === offerId ? 'selected' : offer.status === 'selected' ? 'received' : offer.status,
      })),
    }
    this.items[index] = next
    return next
  }

  async markConverted(requestId: string, shipmentId: string): Promise<QuoteRequest> {
    await delay(40)
    const index = this.items.findIndex((item) => item.id === requestId)
    if (index < 0) throw new Error('Teklif talebi bulunamadı')
    const next = {
      ...this.items[index]!,
      status: 'converted' as const,
      shipmentId,
      updatedAt: new Date().toISOString(),
    }
    this.items[index] = next
    return next
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const quoteRequestsRepository: QuoteRequestsRepository =
  new MockQuoteRequestsRepository()
