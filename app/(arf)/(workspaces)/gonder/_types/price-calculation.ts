export type OperationType = 'parcel' | 'courier' | 'logistics'
export type LogisticsSubtype = 'ftl' | 'ltl'
export type CourierSpeed = 'express' | 'same_day' | 'scheduled'
export type DraftMode = 'quote' | 'shipment'

export type AddressDraft = {
  label: string
  line1?: string
  district?: string
  city?: string
  lat?: number
  lng?: number
  placeId?: string
}

/** Lightweight origin/destination for price calculation (no customer/party). */
export type PriceCalculationLocation = {
  label: string
  city: string
  district?: string
  country: string
  placeId?: string
  lat?: number
  lng?: number
  savedAddressId?: string
}

export type DraftPiece = {
  id: string
  type: string
  widthCm: number
  lengthCm: number
  heightCm: number
  quantity: number
  desi: number
  weightKg: number
}

export type PriceCalculationDraft = {
  mode: DraftMode
  operationType: OperationType | null
  origin: PriceCalculationLocation | null
  destination: PriceCalculationLocation | null
  logisticsSubtype: LogisticsSubtype | null
  vehicleType: string | null
  bodyType: string | null
  loadType: string | null
  weightKg: number | null
  pieces: DraftPiece[]
  courierSpeed: CourierSpeed | null
  selectedQuoteId: string | null
}

export type AddressSuggestion = {
  id: string
  primary: string
  secondary?: string
  line1?: string
  district?: string
  city?: string
  lat?: number
  lng?: number
  placeId?: string
}

export type LocationSuggestionGroup = 'recent' | 'saved' | 'search'

export type LocationSuggestion = {
  id: string
  label: string
  city: string
  district?: string
  country: string
  placeId?: string
  lat?: number
  lng?: number
  savedAddressId?: string
  /** Short tag like Depo, Şube, Merkez when from a saved address */
  savedTag?: string
  customerName?: string
  group: LocationSuggestionGroup
}

export type LocationSuggestResult = {
  recent: LocationSuggestion[]
  saved: LocationSuggestion[]
  search: LocationSuggestion[]
}

export function toAddressDraftFromLocation(
  location: PriceCalculationLocation
): AddressDraft {
  return {
    label: location.label,
    line1: location.label,
    district: location.district,
    city: location.city,
    lat: location.lat,
    lng: location.lng,
    placeId: location.placeId,
  }
}

export function normalizePriceLocation(
  value: Partial<PriceCalculationLocation> | Partial<AddressDraft> | null | undefined
): PriceCalculationLocation | null {
  if (!value) return null
  const label = typeof value.label === 'string' ? value.label.trim() : ''
  if (!label) return null

  const city =
    typeof value.city === 'string' && value.city.trim()
      ? value.city.trim()
      : label.split(',').at(-1)?.trim() || label

  return {
    label,
    city,
    district: typeof value.district === 'string' ? value.district : undefined,
    country:
      typeof (value as PriceCalculationLocation).country === 'string' &&
      (value as PriceCalculationLocation).country.trim()
        ? (value as PriceCalculationLocation).country
        : 'TR',
    placeId: typeof value.placeId === 'string' ? value.placeId : undefined,
    lat: typeof value.lat === 'number' ? value.lat : undefined,
    lng: typeof value.lng === 'number' ? value.lng : undefined,
    savedAddressId:
      typeof (value as PriceCalculationLocation).savedAddressId === 'string'
        ? (value as PriceCalculationLocation).savedAddressId
        : undefined,
  }
}

export type QuotePriceState = 'ready' | 'preparing'

export type SearchQuote = {
  id: string
  providerName: string
  serviceName: string
  etaLabel: string
  pickupLabel: string
  insuranceLabel?: string
  score?: number
  priceTry: number | null
  priceState: QuotePriceState
  badges?: Array<'recommended' | 'fastest'>
  hasInstantPrice: boolean
  hasPickupService: boolean
  serviceType: string
}

export const PIECE_TYPE_OPTIONS = [
  'Paket',
  'Koli',
  'Sandık',
  'Evrak',
  'Palet',
  'Diğer',
] as const

export function calcPieceDesi(widthCm: number, lengthCm: number, heightCm: number): number {
  if (widthCm <= 0 || lengthCm <= 0 || heightCm <= 0) return 0
  return Math.round(((widthCm * lengthCm * heightCm) / 3000) * 100) / 100
}

export function calcPiecesTotals(pieces: DraftPiece[]) {
  return pieces.reduce(
    (acc, piece) => {
      const qty = Math.max(1, piece.quantity || 0)
      acc.quantity += qty
      acc.desi += (piece.desi || 0) * qty
      acc.weightKg += (piece.weightKg || 0) * qty
      return acc
    },
    { quantity: 0, desi: 0, weightKg: 0 }
  )
}

export function createPieceId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `piece-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const EMPTY_PRICE_DRAFT: PriceCalculationDraft = {
  mode: 'quote',
  operationType: null,
  origin: null,
  destination: null,
  logisticsSubtype: null,
  vehicleType: null,
  bodyType: null,
  loadType: null,
  weightKg: null,
  pieces: [],
  courierSpeed: 'express',
  selectedQuoteId: null,
}
