import type { PriceCalculationDraft, SearchQuote } from '../_types/price-calculation'
import { calcPiecesTotals } from '../_types/price-calculation'

export interface QuoteRepository {
  search(draft: PriceCalculationDraft): Promise<SearchQuote[]>
}

function baseQuotes(draft: PriceCalculationDraft): SearchQuote[] {
  const totals = calcPiecesTotals(draft.pieces)
  const desi = totals.desi > 0 ? totals.desi : draft.weightKg ?? 100
  const distanceFactor = draft.origin?.city === draft.destination?.city ? 0.75 : 1.15

  if (draft.operationType === 'parcel') {
    return [
      {
        id: 'q-parcel-arf-express',
        providerName: 'ARF Parcel',
        serviceName: 'Express Kapıdan Kapıya',
        etaLabel: '1-2 iş günü',
        pickupLabel: 'Aynı gün alma',
        insuranceLabel: 'Sigorta dahil',
        score: 4.8,
        priceTry: Math.round(89 * distanceFactor + desi * 4.2),
        priceState: 'ready',
        badges: ['recommended'],
        hasInstantPrice: true,
        hasPickupService: true,
        serviceType: 'express',
      },
      {
        id: 'q-parcel-hizli',
        providerName: 'HızlıKargo',
        serviceName: 'Standart',
        etaLabel: '2-3 iş günü',
        pickupLabel: 'Ertesi gün alma',
        insuranceLabel: 'Opsiyonel sigorta',
        score: 4.5,
        priceTry: Math.round(64 * distanceFactor + desi * 3.1),
        priceState: 'ready',
        badges: ['fastest'],
        hasInstantPrice: true,
        hasPickupService: true,
        serviceType: 'standard',
      },
      {
        id: 'q-parcel-eko',
        providerName: 'EkoGönder',
        serviceName: 'Ekonomik',
        etaLabel: '3-5 iş günü',
        pickupLabel: 'Şube teslim',
        score: 4.1,
        priceTry: Math.round(49 * distanceFactor + desi * 2.4),
        priceState: 'ready',
        hasInstantPrice: true,
        hasPickupService: false,
        serviceType: 'economy',
      },
    ]
  }

  if (draft.operationType === 'courier') {
    const speedFactor =
      draft.courierSpeed === 'same_day' ? 1.45 : draft.courierSpeed === 'scheduled' ? 0.9 : 1.2
    return [
      {
        id: 'q-courier-city',
        providerName: 'CityKurye',
        serviceName:
          draft.courierSpeed === 'same_day'
            ? 'Aynı Gün Teslim'
            : draft.courierSpeed === 'scheduled'
              ? 'Planlı Teslim'
              : 'Express Kurye',
        etaLabel: draft.courierSpeed === 'same_day' ? '2-6 saat' : 'Aynı gün',
        pickupLabel: '30 dk içinde alma',
        insuranceLabel: 'Temel sigorta',
        score: 4.7,
        priceTry: Math.round(120 * distanceFactor * speedFactor + desi * 5),
        priceState: 'ready',
        badges: ['recommended', 'fastest'],
        hasInstantPrice: true,
        hasPickupService: true,
        serviceType: draft.courierSpeed ?? 'express',
      },
      {
        id: 'q-courier-moto',
        providerName: 'MotoJet',
        serviceName: 'Motokurye',
        etaLabel: '1-3 saat',
        pickupLabel: 'Anında alma',
        score: 4.4,
        priceTry: Math.round(95 * distanceFactor * speedFactor + desi * 4.2),
        priceState: 'ready',
        hasInstantPrice: true,
        hasPickupService: true,
        serviceType: 'moto',
      },
    ]
  }

  // logistics
  const isFtl = draft.logisticsSubtype === 'ftl'
  return [
    {
      id: 'q-log-instant',
      providerName: 'LojistikPro',
      serviceName: isFtl ? 'FTL Komple Taşıma' : 'LTL Parsiyel',
      etaLabel: isFtl ? '1-2 gün' : '2-4 gün',
      pickupLabel: 'Planlı alma',
      insuranceLabel: 'Yük sigortası',
      score: 4.6,
      priceTry: Math.round((isFtl ? 4200 : 980) * distanceFactor),
      priceState: 'ready',
      badges: ['recommended'],
      hasInstantPrice: true,
      hasPickupService: true,
      serviceType: isFtl ? 'ftl' : 'ltl',
    },
    {
      id: 'q-log-preparing',
      providerName: 'Anadolu Filo',
      serviceName: isFtl ? 'FTL Teklif' : 'LTL Teklif',
      etaLabel: 'Teklif hazırlanıyor',
      pickupLabel: 'Onay sonrası planlanır',
      score: 4.3,
      priceTry: null,
      priceState: 'preparing',
      hasInstantPrice: false,
      hasPickupService: true,
      serviceType: isFtl ? 'ftl' : 'ltl',
    },
  ]
}

export class MockQuoteRepository implements QuoteRepository {
  async search(draft: PriceCalculationDraft): Promise<SearchQuote[]> {
    await new Promise((resolve) => setTimeout(resolve, 220))
    return baseQuotes(draft)
  }
}

export const quoteRepository: QuoteRepository = new MockQuoteRepository()
