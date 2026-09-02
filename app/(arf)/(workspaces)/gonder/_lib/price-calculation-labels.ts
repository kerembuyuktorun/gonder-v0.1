export function formatMoneyTry(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export const OPERATION_TYPE_LABELS = {
  parcel: 'Kargo / Parcel',
  courier: 'Kurye',
  logistics: 'Lojistik',
} as const

export const LOGISTICS_SUBTYPE_LABELS = {
  ftl: 'FTL / Komple',
  ltl: 'LTL / Parsiyel',
} as const

/** Teslimat zamanı — kargo, kurye ve lojistikte ortak */
export const SERVICE_TIMING_LABELS = {
  express: 'Express',
  same_day: 'Aynı gün / Ertesi gün',
  scheduled: 'Planlı',
} as const

export const SERVICE_TIMING_HINTS = {
  express: 'Öncelikli hat, en kısa teslim',
  same_day: 'Bugün veya ertesi iş günü teslim',
  scheduled: 'Tarih planlayarak gönder',
} as const

/** @deprecated Use SERVICE_TIMING_LABELS — kurye hızı artık tüm operasyon tiplerinde ortak */
export const COURIER_SPEED_LABELS = SERVICE_TIMING_LABELS
