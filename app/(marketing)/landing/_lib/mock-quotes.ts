import type { QuoteDraft, QuoteOffer, QuoteResultState } from './quote-types'
import { calcPieceTotals } from './quote-types'

const SERVICED_ROUTES = new Set([
  'İstanbul|Ankara',
  'Ankara|İstanbul',
  'İstanbul|İzmir',
  'İzmir|İstanbul',
  'Bursa|Ankara',
  'Ankara|Bursa',
  'İstanbul|Bursa',
  'Bursa|İstanbul',
])

function routeKey(origin: string, dest: string) {
  return `${origin}|${dest}`
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchMockQuotes(draft: QuoteDraft): Promise<QuoteResultState> {
  await delay(900 + Math.random() * 600)

  const origin =
    draft.mode === 'kargo' ? draft.kargo.origin.city : draft.lojistik.origin.city
  const dest =
    draft.mode === 'kargo' ? draft.kargo.destination.city : draft.lojistik.destination.city

  if (!origin || !dest) {
    return { kind: 'error', message: 'Çıkış ve varış ili zorunludur.', retryable: true }
  }

  if (origin === dest) {
    return {
      kind: 'no_service',
      message: 'Aynı il içi taşımalar için henüz anlık fiyat sunamıyoruz. Özel teklif talebi oluşturabilirsiniz.',
    }
  }

  if (draft.mode === 'lojistik' && draft.lojistik.extras.hazmat) {
    return { kind: 'special_request' }
  }

  const key = routeKey(origin, dest)
  if (!SERVICED_ROUTES.has(key)) {
    return {
      kind: 'no_service',
      message: `${origin} → ${dest} hattında anlık fiyat bulunamadı. Bilgilerinizle özel teklif talebi oluşturabilirsiniz.`,
    }
  }

  if (Math.random() < 0.08) {
    return {
      kind: 'error',
      message: 'Fiyat servisine şu an ulaşılamıyor. Bilgileriniz kaydedildi, tekrar deneyebilirsiniz.',
      retryable: true,
    }
  }

  if (draft.mode === 'kargo') {
    const totals = calcPieceTotals(draft.kargo.pieces)
    const base = 85 + totals.desi * 4.2 + totals.weightKg * 1.1
    const offers: QuoteOffer[] = [
      {
        id: 'off-1',
        carrierName: 'Hızlı Kargo',
        serviceName: 'Standart',
        totalPrice: Math.round(base),
        currency: 'TRY',
        includesVat: true,
        includedServices: ['Kapıdan alım', 'Takip numarası', 'Sigorta (temel)'],
        estimatedDays: '2–3 iş günü',
        badge: 'lowest_price',
        extraFeeNote: 'Desi/ağırlık farkı oluşursa taşıyıcı kuralları uygulanır.',
      },
      {
        id: 'off-2',
        carrierName: 'Express Line',
        serviceName: 'Hızlı',
        totalPrice: Math.round(base * 1.35),
        currency: 'TRY',
        includesVat: true,
        includedServices: ['Öncelikli sevk', 'SMS bildirim', 'Kapıdan teslim'],
        estimatedDays: '1–2 iş günü',
        badge: 'fastest',
      },
      {
        id: 'off-3',
        carrierName: 'Ekonomi Post',
        serviceName: 'Ekonomik',
        totalPrice: Math.round(base * 0.92),
        currency: 'TRY',
        includesVat: false,
        includedServices: ['Ambar teslim', 'Online takip'],
        estimatedDays: '3–5 iş günü',
      },
    ]
    return { kind: 'offers', offers }
  }

  const subtype = draft.lojistik.subtype
  const weight = draft.lojistik.weightKg
  const base = subtype === 'ftl' ? 8200 + weight * 0.8 : 2400 + weight * 2.4 + draft.lojistik.pieceCount * 120

  const offers: QuoteOffer[] = [
    {
      id: 'log-1',
      carrierName: 'Anadolu Navlun',
      serviceName: subtype === 'ftl' ? 'Komple Araç' : 'Parsiyel Hat',
      totalPrice: Math.round(base),
      currency: 'TRY',
      includesVat: true,
      includedServices: ['Yükleme randevusu', 'Aktarma bilgisi', 'Teslimat bildirimi'],
      estimatedDays: subtype === 'ftl' ? '1–2 gün' : '2–4 gün',
      badge: 'lowest_price',
    },
    {
      id: 'log-2',
      carrierName: 'Marmara Taşıma',
      serviceName: subtype === 'ftl' ? 'Komple · Tenteli' : 'Parsiyel · Palet',
      totalPrice: Math.round(base * 1.12),
      currency: 'TRY',
      includesVat: true,
      includedServices: ['Forklift desteği (talep)', 'İrsaliye kopyası', 'Hat takibi'],
      estimatedDays: subtype === 'ftl' ? '1 gün' : '2–3 gün',
      badge: 'fastest',
    },
  ]

  return { kind: 'offers', offers }
}

export function createSpecialRequestRef() {
  const n = Math.floor(100000 + Math.random() * 900000)
  return `GDR-${n}`
}
