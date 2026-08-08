/** Last Mile fiyatlandırma domain tipleri (mock → BE taşınabilir). */

export type PriceListStatus = 'active' | 'passive'

/** Liste ölçü birimi: desi bandı veya paket adedi. */
export type QuantityBasis = 'desi' | 'package'

/** Liste başına tek mesafe kurgusu. */
export type DistanceStructure = 'km' | 'zone' | 'od'

/** Her kural satırında desi/paket ücret tipi. */
export type DesiPricingType = 'fixed' | 'dynamic'

/**
 * Snapshot / legacy uyumu için türetilmiş mod.
 * UI'da seçilmez; distanceStructure'dan yazılır.
 */
export type PricingMode =
  | 'base_plus_km'
  | 'od_district'
  | 'zone_flat'
  | 'desi_band_fixed'
  | 'desi_dynamic'

export type GeoPointRef = {
  cityId: string
  cityName: string
  districtId?: string
  districtName?: string
}

export type PriceZoneScope = {
  cityId: string
  cityName: string
  districtIds: string[]
  districtNames: string[]
  neighborhoodIds?: string[]
  neighborhoodNames?: string[]
}

export type PriceZone = {
  id: string
  name: string
  code?: string
  scopes: PriceZoneScope[]
  createdAt: string
  updatedAt: string
}

export type PriceRule = {
  id: string
  priceListId: string
  name?: string
  priority: number
  status: PriceListStatus
  /** distanceStructure'tan türetilir */
  pricingMode: PricingMode
  desiPricing: DesiPricingType
  desiStart: number
  desiEnd: number
  /** quantityBasis === 'package' iken bant */
  packageStart?: number
  packageEnd?: number
  baseFee?: number
  perKm?: number
  perDesi?: number
  /** Paket birim ücreti (dynamic + package) */
  perPackage?: number
  flatFee?: number
  origin?: GeoPointRef
  destination?: GeoPointRef
  zoneId?: string
  minFee?: number
  maxFee?: number
  notes?: string
}

/** Fiyat listesinde tanımlı paket şablonu (katalog). */
export type PricePackageDefinition = {
  id: string
  code: string
  name: string
  /** Bilgi / sipariş eşlemesi için varsayılan desi */
  defaultDesi?: number
  /** Paket kataloğunda birim fiyat (quantityBasis=package için zorunlu) */
  unitPrice?: number
}

export type PriceList = {
  id: string
  code: string
  name: string
  description?: string
  isDefault: boolean
  status: PriceListStatus
  currency: 'TRY'
  distanceStructure: DistanceStructure
  /** Desi veya paket adedi üzerinden tarife */
  quantityBasis: QuantityBasis
  /** Paket kataloğu (quantityBasis=package ile birlikte kullanılır) */
  packages?: PricePackageDefinition[]
  /** İade ücreti = gönderi bedelinin yüzdesi (örn. 50) */
  returnFeePercent?: number
  /** İade için taban minimum ücret (₺) */
  returnFeeMin?: number
  validFrom?: string
  validTo?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  rules: PriceRule[]
}

export type CustomerPricingAssignment = {
  customerId: string
  priceListId: string
  effectiveFrom?: string
  effectiveTo?: string
  updatedAt: string
}

export type QuotePackageLine = {
  packageId: string
  quantity: number
}

export type QuoteInput = {
  customerId?: string
  priceListId?: string
  origin: { cityId: string; districtId?: string }
  destination: { cityId: string; districtId?: string }
  desi: number
  /** quantityBasis === 'package' için toplam paket adedi (bant kuralları) */
  packageCount?: number
  /**
   * Paket kataloğundan satır satır ücretlendirme.
   * Verildiğinde birim fiyatlar katalogdan okunur (Σ unitPrice × quantity).
   */
  packageLines?: QuotePackageLine[]
  distanceKm?: number
  orderDate?: string
  includeKdv?: boolean
  kdvRate?: number
  /** Manuel override tutarı (KDV hariç ara toplam yerine) */
  manualSubtotalOverride?: number
  /** delivery (varsayılan) | return → iade % kuralı */
  purpose?: 'delivery' | 'return'
  /** İade için orijinal gönderi ara toplamı (KDV hariç) */
  originalSubtotal?: number
}

export type QuoteAdjustment = {
  label: string
  amount: number
}

export type QuoteBreakdown = {
  baseFee: number
  distanceFee: number
  desiFee: number
  flatFee: number
  adjustments: QuoteAdjustment[]
  subtotal: number
  kdvRate?: number
  kdvAmount?: number
  total: number
}

export type QuoteResult =
  | {
      ok: true
      priceListId: string
      priceListName: string
      matchedRuleId: string
      matchedRuleLabel: string
      pricingMode: PricingMode
      distanceStructure: DistanceStructure
      quantityBasis: QuantityBasis
      inputs: {
        distanceKm?: number
        desi: number
        packageCount?: number
        packageLines?: QuotePackageLine[]
        originCityId: string
        originDistrictId?: string
        destCityId: string
        destDistrictId?: string
        zoneName?: string
      }
      breakdown: QuoteBreakdown
      currency: 'TRY'
      calculatedAt: string
    }
  | {
      ok: false
      error: string
      priceListId?: string
      priceListName?: string
    }

export type OrderPricingSnapshot = {
  priceListId: string
  priceListName: string
  matchedRuleId: string
  matchedRuleLabel: string
  pricingMode: PricingMode
  inputs: {
    distanceKm?: number
    desi?: number
    originDistrict?: string
    destDistrict?: string
    zoneName?: string
  }
  breakdown: QuoteBreakdown
  currency: 'TRY'
  calculatedAt: string
  manualOverride?: boolean
}

export const DISTANCE_STRUCTURE_LABELS: Record<DistanceStructure, string> = {
  km: 'Km bazlı',
  zone: 'Varış bölgesi',
  od: 'Çıkış → Varış (İl/İlçe)',
}

export const DESI_PRICING_LABELS: Record<DesiPricingType, string> = {
  fixed: 'Sabit (bant)',
  dynamic: 'Dinamik (birim)',
}

export const QUANTITY_BASIS_LABELS: Record<QuantityBasis, string> = {
  desi: 'Desi',
  package: 'Paket',
}

/** @deprecated UI'da kullanılmaz; snapshot etiketleri için */
export const PRICING_MODE_LABELS: Record<PricingMode, string> = {
  base_plus_km: 'Km bazlı',
  od_district: 'Çıkış → Varış (İl/İlçe)',
  zone_flat: 'Varış bölgesi',
  desi_band_fixed: 'Desi Bant (Sabit)',
  desi_dynamic: 'Desi Dinamik',
}

export function pricingModeFromDistanceStructure(structure: DistanceStructure): PricingMode {
  switch (structure) {
    case 'km':
      return 'base_plus_km'
    case 'zone':
      return 'zone_flat'
    case 'od':
      return 'od_district'
  }
}

export function slugCodeFromName(name: string): string {
  const slug = name
    .trim()
    .toLocaleUpperCase('tr-TR')
    .replace(/[^A-Z0-9ÇĞİÖŞÜ]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
  return slug || `PL-${Date.now().toString(36).toUpperCase()}`
}
