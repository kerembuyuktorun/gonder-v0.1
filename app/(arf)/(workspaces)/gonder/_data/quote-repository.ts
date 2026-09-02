import type { CourierSpeed, PriceCalculationDraft, SearchQuote } from '../_types/price-calculation'
import { calcPiecesTotals } from '../_types/price-calculation'
import { SERVICE_TIMING_LABELS } from '../_lib/price-calculation-labels'
import { inferQuoteSource } from '../_lib/quote-offer-labels'
import { searchQuotesFromOrder } from '../_lib/siparis-draft-map'

export interface QuoteRepository {
  search(draft: PriceCalculationDraft): Promise<SearchQuote[]>
}

function logisticsCourierSpeed(draft: PriceCalculationDraft): CourierSpeed | null {
  if (draft.operationType === 'logistics' && draft.courierSpeed === 'express') return 'scheduled'
  return draft.courierSpeed
}

function timingFactor(speed: CourierSpeed | null): number {
  if (speed === 'same_day') return 1.35
  if (speed === 'scheduled') return 0.88
  return 1.12
}

function timingEta(speed: CourierSpeed | null, fallback: string): string {
  if (speed === 'same_day') return 'Aynı gün / ertesi gün'
  if (speed === 'scheduled') return 'Planlı teslim'
  if (speed === 'express') return 'Express teslim'
  return fallback
}

function logisticsVehicleLabel(draft: PriceCalculationDraft, isFtl: boolean): string {
  const parts = [draft.vehicleType, draft.bodyType].filter(Boolean)
  if (parts.length > 0) return parts.join(' · ')
  return isFtl ? 'FTL / Komple araç' : 'LTL / Parsiyel'
}

function baseQuotes(draft: PriceCalculationDraft): SearchQuote[] {
  const totals = calcPiecesTotals(draft.pieces)
  const desi = totals.desi > 0 ? totals.desi : draft.weightKg ?? 100
  const distanceFactor = draft.origin?.city === draft.destination?.city ? 0.75 : 1.15
  const speed = timingFactor(draft.courierSpeed)
  const timingLabel = draft.courierSpeed
    ? SERVICE_TIMING_LABELS[draft.courierSpeed]
    : SERVICE_TIMING_LABELS.express

  if (draft.operationType === 'parcel') {
    return [
      {
        id: 'q-parcel-arf-express',
        providerName: 'ARF Parcel',
        serviceName: `${timingLabel} Kapıdan Kapıya`,
        etaLabel: timingEta(draft.courierSpeed, '1-2 iş günü'),
        pickupLabel: draft.courierSpeed === 'scheduled' ? 'Planlı alma' : 'Aynı gün alma',
        insuranceLabel: 'Sigorta dahil',
        score: 4.8,
        priceTry: Math.round((89 * distanceFactor + desi * 4.2) * speed),
        priceState: 'ready',
        badges: ['recommended', 'fastest'],
        quoteSource: inferQuoteSource({ hasInstantPrice: true, quoteSource: 'instant' }),
        vehicleLabel: 'Koli / Paket',
        hasInstantPrice: true,
        hasPickupService: true,
        serviceType: draft.courierSpeed ?? 'express',
      },
      {
        id: 'q-parcel-hizli',
        providerName: 'HızlıKargo',
        serviceName: timingLabel,
        etaLabel: timingEta(draft.courierSpeed, '2-3 iş günü'),
        pickupLabel: draft.courierSpeed === 'scheduled' ? 'Randevulu alma' : 'Ertesi gün alma',
        insuranceLabel: 'Opsiyonel sigorta',
        score: 4.5,
        priceTry: Math.round((64 * distanceFactor + desi * 3.1) * speed),
        priceState: 'ready',
        quoteSource: 'network',
        vehicleLabel: 'Koli / Paket',
        hasInstantPrice: true,
        hasPickupService: true,
        serviceType: 'standard',
      },
      {
        id: 'q-parcel-eko',
        providerName: 'EkoGönder',
        serviceName: 'Ekonomik',
        etaLabel: draft.courierSpeed === 'same_day' ? 'Ertesi gün' : '3-5 iş günü',
        pickupLabel: 'Şube teslim',
        score: 4.1,
        priceTry: Math.round((49 * distanceFactor + desi * 2.4) * speed),
        priceState: 'ready',
        badges: ['best_price'],
        quoteSource: 'network',
        vehicleLabel: 'Koli / Paket',
        hasInstantPrice: true,
        hasPickupService: false,
        serviceType: 'economy',
      },
    ]
  }

  if (draft.operationType === 'courier') {
    return [
      {
        id: 'q-courier-city',
        providerName: 'CityKurye',
        serviceName:
          draft.courierSpeed === 'same_day'
            ? 'Aynı Gün / Ertesi Gün Teslim'
            : draft.courierSpeed === 'scheduled'
              ? 'Planlı Teslim'
              : 'Express Kurye',
        etaLabel:
          draft.courierSpeed === 'same_day'
            ? '2-6 saat / ertesi gün'
            : draft.courierSpeed === 'scheduled'
              ? 'Planlanan saatte'
              : 'Aynı gün',
        pickupLabel: draft.courierSpeed === 'scheduled' ? 'Randevulu alma' : '30 dk içinde alma',
        insuranceLabel: 'Temel sigorta',
        score: 4.7,
        priceTry: Math.round(120 * distanceFactor * speed + desi * 5),
        priceState: 'ready',
        badges: ['recommended', 'fastest'],
        quoteSource: 'instant',
        vehicleLabel: 'Kurye',
        hasInstantPrice: true,
        hasPickupService: true,
        serviceType: draft.courierSpeed ?? 'express',
      },
      {
        id: 'q-courier-moto',
        providerName: 'MotoJet',
        serviceName: 'Motokurye',
        etaLabel: draft.courierSpeed === 'scheduled' ? 'Planlanan saatte' : '1-3 saat',
        pickupLabel: draft.courierSpeed === 'scheduled' ? 'Randevulu alma' : 'Anında alma',
        score: 4.4,
        priceTry: Math.round(95 * distanceFactor * speed + desi * 4.2),
        priceState: 'ready',
        badges: ['best_price'],
        quoteSource: 'network',
        vehicleLabel: 'Motokurye',
        hasInstantPrice: true,
        hasPickupService: true,
        serviceType: 'moto',
      },
    ]
  }

  const isFtl = draft.logisticsSubtype === 'ftl'
  const vehicleLabel = logisticsVehicleLabel(draft, isFtl)
  const logisticsSpeed = logisticsCourierSpeed(draft)
  const logisticsFactor = timingFactor(logisticsSpeed)
  const logisticsTimingLabel = logisticsSpeed
    ? SERVICE_TIMING_LABELS[logisticsSpeed]
    : SERVICE_TIMING_LABELS.scheduled
  return [
    {
      id: 'q-log-instant',
      providerName: 'LojistikPro',
      serviceName: `${isFtl ? 'FTL Komple' : 'LTL Parsiyel'} · ${logisticsTimingLabel}`,
      etaLabel: timingEta(logisticsSpeed, isFtl ? '1-2 gün' : '2-4 gün'),
      pickupLabel: logisticsSpeed === 'scheduled' ? 'Planlı alma' : 'Aynı gün / ertesi gün alma',
      insuranceLabel: 'Yük sigortası',
      score: 4.6,
      priceTry: Math.round((isFtl ? 4200 : 980) * distanceFactor * logisticsFactor),
      priceState: 'ready',
      badges: ['recommended', 'fastest'],
      quoteSource: 'instant',
      vehicleLabel,
      hasInstantPrice: true,
      hasPickupService: true,
      serviceType: isFtl ? 'ftl' : 'ltl',
    },
    {
      id: 'q-log-network',
      providerName: 'Gönder Navlun Ağı',
      serviceName: isFtl ? 'Hat eşleşmesi · Komple' : 'Hat eşleşmesi · Parsiyel',
      etaLabel: timingEta(logisticsSpeed, isFtl ? '2-3 gün' : '3-5 gün'),
      pickupLabel: 'Eşleşme sonrası planlanır',
      score: 4.4,
      priceTry: Math.round((isFtl ? 3650 : 840) * distanceFactor * logisticsFactor),
      priceState: 'ready',
      badges: ['best_price'],
      quoteSource: 'network',
      vehicleLabel,
      hasInstantPrice: false,
      hasPickupService: true,
      serviceType: isFtl ? 'ftl' : 'ltl',
    },
    {
      id: 'q-log-specialist',
      providerName: 'Anadolu Filo',
      serviceName: isFtl ? 'Uzman değerlendirmesi · FTL' : 'Uzman değerlendirmesi · LTL',
      etaLabel: timingEta(logisticsSpeed, isFtl ? '2-3 gün' : '3-5 gün'),
      pickupLabel: 'Uzman değerlendirmesi sonrası planlanır',
      insuranceLabel: 'Yük sigortası',
      score: 4.3,
      priceTry: Math.round((isFtl ? 3900 : 910) * distanceFactor * logisticsFactor),
      priceState: 'ready',
      quoteSource: 'specialist',
      vehicleLabel,
      hasInstantPrice: false,
      hasPickupService: true,
      serviceType: isFtl ? 'ftl' : 'ltl',
    },
  ]
}

export class MockQuoteRepository implements QuoteRepository {
  async search(draft: PriceCalculationDraft): Promise<SearchQuote[]> {
    await new Promise((resolve) => setTimeout(resolve, 220))
    if (draft.siparis) {
      const siparisQuotes = searchQuotesFromOrder(draft.siparis)
      if (siparisQuotes.length > 0) return siparisQuotes
    }
    return baseQuotes(draft)
  }
}

export const quoteRepository: QuoteRepository = new MockQuoteRepository()
