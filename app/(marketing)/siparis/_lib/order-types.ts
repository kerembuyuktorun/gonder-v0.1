export type ServiceType = 'kargo' | 'lojistik'

export type LogisticsMode = 'ftl' | 'ltl'

export type PlaceResult = {
  id: string
  /** Kısa başlık: "Kadıköy Mahallesi" */
  title: string
  /** Tam adres satırı */
  subtitle: string
  city: string
  district: string
  lat: number
  lng: number
}

export type PackagePresetId = 'zarf' | 'kucuk' | 'orta' | 'buyuk' | 'xl' | 'custom'

export type CargoDetails = {
  preset: PackagePresetId | null
  widthCm: number
  lengthCm: number
  heightCm: number
  weightKg: number
  quantity: number
  contentNote: string
}

/** FTL'de her satır bir araç + kasa eşleşmesidir. */
export type VehicleRow = {
  id: string
  vehicleTypeId: string | null
  bodyTypeId: string | null
  count: number
}

export type FtlDetails = {
  rows: VehicleRow[]
}

export type LoadKindId = 'palet' | 'koli' | 'boru' | 'cuval' | 'varil' | 'diger'

export type LtlDetails = {
  loadKind: LoadKindId | null
  palletTypeId: string | null
  widthCm: number
  lengthCm: number
  heightCm: number
  weightKg: number
  quantity: number
  stackable: boolean
  description: string
}

export type OrderExtras = {
  loadingDate: string
  forklift: boolean
  temperatureControl: boolean
  fragile: boolean
  insurance: boolean
  declaredValue: number
}

export type ContactInfo = {
  name: string
  phone: string
  email: string
  company: string
}

export type OrderDraft = {
  origin: PlaceResult | null
  destination: PlaceResult | null
  service: ServiceType | null
  logisticsMode: LogisticsMode | null
  cargo: CargoDetails
  ftl: FtlDetails
  ltl: LtlDetails
  extras: OrderExtras
  contact: ContactInfo
}

export type OfferPlan = 'instant' | 'flexible' | 'backload' | 'express' | 'economy'

export type Offer = {
  id: string
  plan: OfferPlan
  title: string
  description: string
  carrier: string
  price: number
  /** Karşılaştırma için referans fiyat; indirim rozetinde kullanılır */
  comparePrice?: number
  etaLabel: string
  perks: string[]
  /** Anında onay yerine eşleşme beklenen planlar */
  requiresMatching?: boolean
  badge?: string
}

let idCounter = 0

/** SSR ile istemci arasında tutarlı, çakışmayan kimlik üretir. */
export function nextId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

export function createEmptyVehicleRow(): VehicleRow {
  return { id: nextId('veh'), vehicleTypeId: null, bodyTypeId: null, count: 1 }
}

export function createInitialOrder(): OrderDraft {
  return {
    origin: null,
    destination: null,
    service: null,
    logisticsMode: null,
    cargo: {
      preset: null,
      widthCm: 30,
      lengthCm: 40,
      heightCm: 30,
      weightKg: 5,
      quantity: 1,
      contentNote: '',
    },
    // Sabit kimlik: sunucu ve istemci render'ı aynı anahtarı üretsin
    ftl: { rows: [{ id: 'veh-0', vehicleTypeId: null, bodyTypeId: null, count: 1 }] },
    ltl: {
      loadKind: null,
      palletTypeId: null,
      widthCm: 80,
      lengthCm: 120,
      heightCm: 150,
      weightKg: 400,
      quantity: 2,
      stackable: true,
      description: '',
    },
    extras: {
      loadingDate: '',
      forklift: false,
      temperatureControl: false,
      fragile: false,
      insurance: false,
      declaredValue: 0,
    },
    contact: { name: '', phone: '', email: '', company: '' },
  }
}

export function formatTry(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value)
}
