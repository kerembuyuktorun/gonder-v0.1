import type {
  CustomerIntegrationType,
  CustomerListKpi,
  CustomerSector,
  CustomerStatus,
  LastmileCustomer,
} from '../_types/customer'
import type {
  CustomerAddress,
  CustomerDetail,
  OperationScopeRow,
} from '../[id]/_types/customer-detail'

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : {}
}

function asString(input: unknown, fallback = ''): string {
  if (typeof input === 'string') return input.trim()
  if (typeof input === 'number' && Number.isFinite(input)) return String(input)
  return fallback
}

function asNumber(input: unknown, fallback = 0): number {
  const n = typeof input === 'number' ? input : Number(input)
  return Number.isFinite(n) ? n : fallback
}

function asBool(input: unknown, fallback = false): boolean {
  if (typeof input === 'boolean') return input
  return fallback
}

function formatDateTime(iso: unknown): string {
  const raw = asString(iso)
  if (!raw) return '—'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const SECTOR_BY_CODE: Record<string, CustomerSector> = {
  ECOMMERCE: 'E-Ticaret',
  FOOD: 'Gıda',
  READY_MEAL: 'Hazır Yemek',
  HEALTH_MEDICAL: 'Sağlık/Medikal',
  SPARE_PARTS: 'Yedek Parça',
  RETAIL: 'Perakende',
  TECHNOLOGY: 'Teknoloji',
  OTHER: 'Diğer',
}

const SECTOR_CODE_BY_LABEL: Record<CustomerSector, string> = {
  'E-Ticaret': 'ECOMMERCE',
  Gıda: 'FOOD',
  'Hazır Yemek': 'READY_MEAL',
  'Sağlık/Medikal': 'HEALTH_MEDICAL',
  'Yedek Parça': 'SPARE_PARTS',
  Perakende: 'RETAIL',
  Teknoloji: 'TECHNOLOGY',
  Diğer: 'OTHER',
}

const SECTOR_LABELS = new Set<string>(Object.values(SECTOR_BY_CODE))

export function sectorLabelToCode(label: CustomerSector | string): string {
  if (label in SECTOR_CODE_BY_LABEL) {
    return SECTOR_CODE_BY_LABEL[label as CustomerSector]
  }
  const upper = label.toUpperCase().replace(/[\s/-]+/g, '_')
  if (upper in SECTOR_BY_CODE) return upper
  return 'OTHER'
}

export function mapSector(raw: unknown): CustomerSector {
  const sector = asRecord(raw)
  const code = asString(sector.code).toUpperCase()
  if (code && SECTOR_BY_CODE[code]) return SECTOR_BY_CODE[code]
  const label = asString(sector.label || raw)
  if (SECTOR_LABELS.has(label)) return label as CustomerSector
  return 'Diğer'
}

export function mapCustomerStatus(raw: unknown): CustomerStatus {
  const key = asString(raw).toUpperCase()
  if (key === 'ACTIVE' || key === 'AKTIF') return 'aktif'
  return 'pasif'
}

export function toBackendStatus(status: CustomerStatus): 'Active' | 'Passive' {
  return status === 'aktif' ? 'Active' : 'Passive'
}

function mapIntegrationType(raw: unknown): CustomerIntegrationType {
  const key = asString(raw).toUpperCase()
  if (key === 'API') return 'API'
  if (key === 'SHOPIFY') return 'Shopify'
  if (key === 'WOOCOMMERCE' || key === 'WOO') return 'WooCommerce'
  if (key === 'XML') return 'XML'
  return 'Manuel'
}

export function mapBackendCustomer(raw: unknown): LastmileCustomer | null {
  const row = asRecord(raw)
  const id = asString(row.id)
  if (!id) return null

  const owner = asRecord(row.owner)
  const billing = asRecord(row.billingAddress)
  const preferences = asRecord(row.preferences)
  const metrics = asRecord(row.metrics)
  const cityObj = asRecord(row.city)
  const districtObj = asRecord(row.district)
  const neighbourObj = asRecord(row.neighbour ?? row.neighborhood)

  const cityId = asString(row.cityId || cityObj.id)
  const districtId = asString(row.districtId || districtObj.id)
  const neighbourId = asString(row.neighbourId || neighbourObj.id)
  const il = asString(
    typeof row.city === 'string' ? row.city : cityObj.name || billing.city
  )
  const ilce = asString(
    typeof row.district === 'string' ? row.district : districtObj.name || billing.district
  )
  const mahalle = asString(
    typeof row.neighbour === 'string'
      ? row.neighbour
      : neighbourObj.name || billing.neighborhood || row.neighborhood
  )

  return {
    id,
    musteri_kodu: asString(row.code, id),
    firma_unvani: asString(row.companyName || row.name),
    marka_kisa_ad: asString(row.shortName || row.tradeName || row.companyName),
    vkn: asString(row.taxNumber || row.vkn),
    vergi_dairesi: asString(row.taxOffice),
    durum: mapCustomerStatus(row.status),
    sektor: mapSector(row.sector),
    entegrasyon_tipi: mapIntegrationType(row.integrationType),
    ana_yetkili: asString(owner.fullName || row.ownerFullName),
    ana_yetkili_unvan: asString(owner.title || row.ownerTitle),
    telefon: asString(owner.phone || row.phone),
    email: asString(owner.email || row.email || row.ownerEmail),
    fatura_merkez_adresi: asString(billing.fullAddress || row.billingAddress),
    bildirim_sms: asBool(preferences.smsNotification ?? row.smsNotification),
    bildirim_email: asBool(preferences.emailNotification ?? row.emailNotification),
    teslimat_kaniti_zorunlu: asBool(
      preferences.requireDeliveryProof ?? row.requireDeliveryProof
    ),
    guvenli_teslimat_otp: asBool(preferences.secureDeliveryOtp ?? row.secureDeliveryOtp),
    tesis_sayisi: asNumber(metrics.addressCount ?? row.addressCount),
    merkez_depo_sayisi: asNumber(metrics.hubDepotCount ?? row.hubDepotCount),
    son_senkronizasyon: formatDateTime(row.lastSyncedAt),
    bugunku_aktif_siparis: asNumber(metrics.todayActiveOrders),
    gunluk_ortalama_hacim: asNumber(metrics.avgDailyVolume),
    toplam_paket: asNumber(metrics.totalOrders),
    toplam_teslim: asNumber(metrics.totalDelivered),
    toplam_iptal: asNumber(metrics.totalCanceled),
    teslimat_basari_orani: asNumber(metrics.deliverySuccessRate),
    ortalama_gorev_suresi_dk: asNumber(metrics.avgTaskDurationMin),
    kayit_tarihi: formatDateTime(row.createdAt),
    il,
    ilce,
    mahalle,
    cityId: cityId || undefined,
    districtId: districtId || undefined,
    neighbourId: neighbourId || undefined,
  }
}

function mapScopeRow(raw: unknown, index: number): OperationScopeRow | null {
  const row = asRecord(raw)
  const il = asString(row.city || row.il)
  const ilce = asString(row.district || row.ilce)
  if (!il || !ilce) return null

  const allNeighborhoods = asBool(row.allNeighborhoods ?? row.tum_mahalleler)
  const neighborhoodsRaw = row.neighborhoods ?? row.mahalleler
  const mahalleler = Array.isArray(neighborhoodsRaw)
    ? neighborhoodsRaw.map((item) => asString(item)).filter(Boolean)
    : []

  return {
    id: asString(row.id, `scope-${index}`),
    il,
    ilce,
    mahalleler: allNeighborhoods ? [] : mahalleler,
    tum_mahalleler: allNeighborhoods,
  }
}

export function mapBackendAddress(raw: unknown): CustomerAddress | null {
  const row = asRecord(raw)
  const id = asString(row.id)
  if (!id) return null

  const outbound = Array.isArray(row.outboundScopes)
    ? row.outboundScopes
    : Array.isArray(row.giden_teslimat_scopes)
      ? row.giden_teslimat_scopes
      : []
  const inbound = Array.isArray(row.inboundScopes)
    ? row.inboundScopes
    : Array.isArray(row.gelen_teslimat_scopes)
      ? row.gelen_teslimat_scopes
      : []

  const giden = outbound
    .map((item, index) => mapScopeRow(item, index))
    .filter((item): item is OperationScopeRow => Boolean(item))
  const gelen = inbound
    .map((item, index) => mapScopeRow(item, index + 1000))
    .filter((item): item is OperationScopeRow => Boolean(item))

  return {
    id,
    baslik: asString(row.title || row.label || row.name),
    adres: asString(row.fullAddress || row.address || row.detailAddress),
    bina_no: asString(row.buildingNo || row.no || row.buildingNumber),
    kat_no: asString(row.floor || row.kat),
    daire_no: asString(row.apartmentNo || row.door || row.apartmentNumber),
    muhatap_ad_soyad: asString(
      row.contactName || row.authorizedPerson || row.contact_name
    ),
    muhatap_telefon: asString(row.phone || row.contactPhone),
    aktif: asBool(row.isActive ?? row.aktif, true),
    operasyon_bolgesi_tanimli: giden.length > 0 || gelen.length > 0 || asBool(row.hasOperationScope),
    giden_teslimat_scopes: giden,
    gelen_teslimat_scopes: gelen,
    lat: asNumber(row.latitude ?? row.lat),
    lng: asNumber(row.longitude ?? row.lng ?? row.lon),
  }
}

export function mapBackendCustomerDetail(raw: unknown): CustomerDetail | null {
  const customer = mapBackendCustomer(raw)
  if (!customer) return null

  const row = asRecord(raw)
  const addressesRaw = Array.isArray(row.addresses)
    ? row.addresses
    : Array.isArray(row.customerAddresses)
      ? row.customerAddresses
      : []

  const api = asRecord(row.apiCredentials || row.api)

  return {
    ...customer,
    addresses: addressesRaw
      .map((item) => mapBackendAddress(item))
      .filter((item): item is CustomerAddress => Boolean(item)),
    api: {
      api_key: asString(api.apiKey || api.api_key, '—'),
      secret_key: asString(api.secretKey || api.secret_key, '—'),
      olusturulma: formatDateTime(api.createdAt || api.olusturulma) || '—',
    },
    orders: [],
  }
}

export function mapCustomerStats(raw: unknown): CustomerListKpi {
  const row = asRecord(raw)
  const nested = asRecord(row.data)
  const source = Object.keys(nested).length > 0 ? nested : row

  return {
    todayActiveOrders: asNumber(source.todayActiveOrders),
    avgDailyVolume: asNumber(source.avgDailyVolume),
    avgTaskDurationMin: asNumber(source.avgTaskDurationMin),
    avgSuccessRate: asNumber(source.avgSuccessRate ?? source.deliverySuccessRate),
    totalFacilities: asNumber(source.totalFacilities ?? source.addressCount),
    totalOrders: asNumber(source.totalOrders),
    totalDelivered: asNumber(source.totalDelivered),
    totalCanceled: asNumber(source.totalCanceled),
  }
}

export function mapStatusCounts(raw: unknown): Record<'all' | 'aktif' | 'pasif', number> {
  const row = asRecord(raw)
  const all = asNumber(row.all ?? row.All)
  const active = asNumber(row.Active ?? row.active ?? row.aktif)
  const passive = asNumber(row.Passive ?? row.passive ?? row.pasif)
  const suspend = asNumber(row.Suspend ?? row.suspend)

  return {
    all: all || active + passive + suspend,
    aktif: active,
    pasif: passive + suspend,
  }
}

export type CreateCustomerPayload = {
  companyName: string
  shortName: string
  taxNumber: string
  taxOffice?: string
  sectorCode: string
  cityId?: string
  districtId?: string
  neighbourId?: string
  owner: {
    fullName: string
    title?: string
    phone: string
    email: string
  }
  billingAddress?: {
    fullAddress?: string
  }
  preferences: {
    smsNotification: boolean
    emailNotification: boolean
    requireDeliveryProof: boolean
    secureDeliveryOtp: boolean
  }
}

/** FE form → BE create/patch body */
export function buildCustomerWritePayload(input: {
  firma_unvani: string
  marka_kisa_ad: string
  vkn: string
  vergi_dairesi: string
  sektor: string
  ana_yetkili: string
  ana_yetkili_unvan: string
  telefon: string
  email: string
  fatura_merkez_adresi: string
  cityId?: string
  districtId?: string
  neighbourId?: string
  bildirim_sms: boolean
  bildirim_email: boolean
  teslimat_kaniti_zorunlu: boolean
  guvenli_teslimat_otp: boolean
  phoneE164: string
}): CreateCustomerPayload {
  const billingAddress = input.fatura_merkez_adresi.trim()
    ? { fullAddress: input.fatura_merkez_adresi.trim() }
    : undefined

  return {
    companyName: input.firma_unvani.trim(),
    shortName: input.marka_kisa_ad.trim(),
    taxNumber: input.vkn.replace(/\D/g, ''),
    taxOffice: input.vergi_dairesi.trim() || undefined,
    sectorCode: sectorLabelToCode(input.sektor),
    ...(input.cityId?.trim() ? { cityId: input.cityId.trim() } : {}),
    ...(input.districtId?.trim() ? { districtId: input.districtId.trim() } : {}),
    ...(input.neighbourId?.trim() ? { neighbourId: input.neighbourId.trim() } : {}),
    owner: {
      fullName: input.ana_yetkili.trim(),
      title: input.ana_yetkili_unvan.trim() || undefined,
      phone: input.phoneE164,
      email: input.email.trim(),
    },
    billingAddress,
    preferences: {
      smsNotification: input.bildirim_sms,
      emailNotification: input.bildirim_email,
      requireDeliveryProof: input.teslimat_kaniti_zorunlu,
      secureDeliveryOtp: input.guvenli_teslimat_otp,
    },
  }
}

export function toScopePayload(rows: OperationScopeRow[]) {
  return rows.map((row) => ({
    city: row.il,
    district: row.ilce,
    neighborhoods: row.tum_mahalleler ? [] : row.mahalleler,
    allNeighborhoods: row.tum_mahalleler,
  }))
}

export function toAddressPayload(address: Omit<CustomerAddress, 'id'> & { id?: string }, customerId: string) {
  return {
    customerId,
    title: address.baslik,
    fullAddress: address.adres,
    buildingNo: address.bina_no,
    floor: address.kat_no === '-' ? '' : address.kat_no,
    apartmentNo: address.daire_no === '-' ? '' : address.daire_no,
    contactName: address.muhatap_ad_soyad,
    phone: address.muhatap_telefon,
    latitude: address.lat,
    longitude: address.lng,
    isActive: address.aktif,
    outboundScopes: toScopePayload(address.giden_teslimat_scopes),
    inboundScopes: toScopePayload(address.gelen_teslimat_scopes),
  }
}
