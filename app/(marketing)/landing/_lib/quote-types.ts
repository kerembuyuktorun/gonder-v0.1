export type TransportMode = 'kargo' | 'lojistik'

export type KargoSizePreset = 'small' | 'medium' | 'large' | 'custom'

export type LogisticsSubtype = 'ftl' | 'ltl'

export type LoadUnit = 'palet' | 'koli' | 'diger'

export type QuotePiece = {
  id: string
  widthCm: number
  lengthCm: number
  heightCm: number
  weightKg: number
  quantity: number
}

export type LocationDraft = {
  city: string
  district: string
  postalCode?: string
}

export type ExtraNeeds = {
  lift: boolean
  forklift: boolean
  temperatureControl: boolean
  fragile: boolean
  hazmat: boolean
}

export type KargoDraft = {
  sizePreset: KargoSizePreset | null
  pieces: QuotePiece[]
  origin: LocationDraft
  destination: LocationDraft
}

export type LogisticsDraft = {
  subtype: LogisticsSubtype | null
  vehicleType: string | null
  bodyType: string | null
  unsureVehicle: boolean
  loadUnit: LoadUnit
  loadDescription: string
  stackable: boolean
  pieceCount: number
  widthCm: number
  lengthCm: number
  heightCm: number
  weightKg: number
  loadingDate: string
  origin: LocationDraft
  destination: LocationDraft
  extras: ExtraNeeds
}

export type QuoteDraft = {
  mode: TransportMode
  kargo: KargoDraft
  lojistik: LogisticsDraft
}

export type QuoteOffer = {
  id: string
  carrierName: string
  serviceName: string
  totalPrice: number
  currency: 'TRY'
  includesVat: boolean
  includedServices: string[]
  estimatedDays: string
  badge?: 'lowest_price' | 'fastest'
  extraFeeNote?: string
}

export type QuoteResultState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'offers'; offers: QuoteOffer[] }
  | { kind: 'special_request'; reference?: string }
  | { kind: 'no_service'; message: string }
  | { kind: 'error'; message: string; retryable: boolean }

export type ContactDraft = {
  name: string
  company: string
  email: string
  phone: string
  note: string
}

export const KARGO_PRESETS: Record<
  Exclude<KargoSizePreset, 'custom'>,
  { label: string; widthCm: number; lengthCm: number; heightCm: number; weightKg: number }
> = {
  small: { label: 'Küçük Paket', widthCm: 20, lengthCm: 30, heightCm: 10, weightKg: 1 },
  medium: { label: 'Orta Koli', widthCm: 30, lengthCm: 40, heightCm: 30, weightKg: 5 },
  large: { label: 'Büyük Koli', widthCm: 40, lengthCm: 60, heightCm: 40, weightKg: 15 },
}

export const VEHICLE_OPTIONS = [
  { id: 'kamyonet', label: 'Kamyonet', capacity: '1–1,5 t' },
  { id: 'kamyon', label: 'Kamyon', capacity: '3–8 t' },
  { id: 'tir', label: 'Tır', capacity: '20–26 t' },
]

export const BODY_OPTIONS = ['Tenteli', 'Kapalı Kasa', 'Frigorifik', 'Açık Kasa']

export function calcDesi(piece: Pick<QuotePiece, 'widthCm' | 'lengthCm' | 'heightCm' | 'quantity'>): number {
  const unit = (piece.widthCm * piece.lengthCm * piece.heightCm) / 3000
  return Math.round(unit * piece.quantity * 100) / 100
}

export function calcPieceTotals(pieces: QuotePiece[]) {
  const quantity = pieces.reduce((s, p) => s + p.quantity, 0)
  const weightKg = pieces.reduce((s, p) => s + p.weightKg * p.quantity, 0)
  const desi = pieces.reduce((s, p) => s + calcDesi(p), 0)
  return { quantity, weightKg: Math.round(weightKg * 100) / 100, desi: Math.round(desi * 100) / 100 }
}

export function createEmptyPiece(): QuotePiece {
  return {
    id: crypto.randomUUID(),
    widthCm: 30,
    lengthCm: 40,
    heightCm: 30,
    weightKg: 5,
    quantity: 1,
  }
}

export function createInitialDraft(): QuoteDraft {
  return {
    mode: 'kargo',
    kargo: {
      sizePreset: null,
      pieces: [createEmptyPiece()],
      origin: { city: '', district: '' },
      destination: { city: '', district: '' },
    },
    lojistik: {
      subtype: null,
      vehicleType: null,
      bodyType: null,
      unsureVehicle: false,
      loadUnit: 'palet',
      loadDescription: '',
      stackable: true,
      pieceCount: 1,
      widthCm: 120,
      lengthCm: 80,
      heightCm: 150,
      weightKg: 500,
      loadingDate: '',
      origin: { city: '', district: '' },
      destination: { city: '', district: '' },
      extras: {
        lift: false,
        forklift: false,
        temperatureControl: false,
        fragile: false,
        hazmat: false,
      },
    },
  }
}
