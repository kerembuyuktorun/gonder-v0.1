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

export const COURIER_SPEED_LABELS = {
  express: 'Express',
  same_day: 'Aynı gün',
  scheduled: 'Planlı',
} as const
