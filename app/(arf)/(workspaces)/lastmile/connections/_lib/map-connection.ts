import type {
  ConnectionContactKind,
  ConnectionTypeScope,
  LastmileConnection,
} from '../_types/connection'

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

function asNullableNumber(input: unknown): number | null {
  if (input == null || input === '') return null
  const n = typeof input === 'number' ? input : Number(input)
  return Number.isFinite(n) ? n : null
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

function joinName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(' ').trim()
}

export function mapCompanyType(raw: unknown): ConnectionContactKind {
  const key = asString(raw).toUpperCase()
  if (key === 'CORPORATE' || key === 'KURUMSAL') return 'kurumsal'
  return 'bireysel'
}

export function typeScopeToContactType(
  scope: ConnectionTypeScope | undefined
): 'INDIVIDUAL' | 'CORPORATE' | undefined {
  if (!scope || scope === 'all') return undefined
  return scope === 'kurumsal' ? 'CORPORATE' : 'INDIVIDUAL'
}

export function mapTypeCounts(raw: unknown): Record<ConnectionTypeScope, number> {
  const row = asRecord(raw)
  const all = Number(row.all ?? 0)
  const individual = Number(row.INDIVIDUAL ?? row.individual ?? row.bireysel ?? 0)
  const corporate = Number(row.CORPORATE ?? row.corporate ?? row.kurumsal ?? 0)

  return {
    all: Number.isFinite(all) ? all : individual + corporate,
    bireysel: Number.isFinite(individual) ? individual : 0,
    kurumsal: Number.isFinite(corporate) ? corporate : 0,
  }
}

export function mapBackendConnection(raw: unknown): LastmileConnection | null {
  const row = asRecord(raw)
  const id = asString(row.id)
  if (!id) return null

  const address = asRecord(row.address)
  const companyType = mapCompanyType(row.companyType ?? row.contactType ?? row.muhatap_tipi)
  const firstName = asString(row.firstName)
  const lastName = asString(row.lastName)
  const displayName = asString(row.displayName)
  const contactName =
    asString(row.contactName) ||
    joinName(firstName, lastName) ||
    (companyType === 'bireysel' ? displayName : '') ||
    asString(row.muhatabi)
  const companyName =
    asString(row.companyName ?? row.firma_adi) ||
    (companyType === 'kurumsal' ? displayName : '') ||
    null

  const fullAddress = asString(
    address.fullAddress ?? address.full_address ?? row.fullAddress ?? row.full_address
  )
  // shortAddress geo snapshot yoksa null olabilir — FE satırında fullAddress’e düş
  const shortAddress = asString(
    address.shortAddress ?? address.short_address ?? row.shortAddress ?? row.adres
  )

  const lat = asNullableNumber(address.latitude ?? address.lat ?? row.latitude ?? row.lat)
  const lon = asNullableNumber(address.longitude ?? address.lon ?? row.longitude ?? row.lon)

  return {
    id,
    musteri_id: asString(row.customerId ?? row.musteri_id),
    musteri_kodu: asString(row.customerCode ?? row.musteri_kodu),
    musteri_adi: asString(row.customerShortName ?? row.customerName ?? row.musteri_adi),
    muhatap_tipi: companyType,
    muhatabi: contactName,
    tckn: asString(row.tckn) || null,
    firma_adi: companyName,
    vkn: asString(row.taxNumber ?? row.vkn) || null,
    vergi_dairesi: asString(row.taxOffice ?? row.vergi_dairesi) || null,
    telefon: asString(row.phone ?? row.telefon),
    adres_baslik: asString(address.title ?? row.title ?? row.adres_baslik, '—'),
    adres: shortAddress || fullAddress,
    full_address: fullAddress,
    bina_no: asString(address.buildingNo ?? address.no ?? row.buildingNo ?? row.bina_no),
    kat: asString(address.floor ?? row.floor ?? row.kat),
    daire_no: asString(address.door ?? address.apartmentNo ?? row.door ?? row.daire_no),
    lat,
    lon,
    kayit_tarihi: formatDateTime(row.createdAt ?? row.kayit_tarihi),
  }
}
