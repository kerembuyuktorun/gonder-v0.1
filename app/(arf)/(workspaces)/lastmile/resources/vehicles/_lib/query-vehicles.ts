import type {
  LastmileVehicle,
  VehicleBodyType,
  VehicleClass,
  VehicleDocumentType,
  VehicleOwnership,
  VehicleSkill,
  VehicleStartStrategy,
  VehicleStatusScope,
} from '../_types/vehicle'
import { vehicleMatchesStatusScope } from '../_lib/vehicle-status-helpers'

export function resolveSkillLabel(code: string, catalog: Record<string, string> = {}): string {
  return catalog[code] ?? VEHICLE_SKILL_LABELS[code] ?? code
}

export function buildSkillLabelMap(options: Array<{ code: string; name: string }>): Record<string, string> {
  return Object.fromEntries(options.map((item) => [item.code, item.name]))
}

/** Liste tablosu için kısa hizmet bölgesi özeti (tam metin tooltip’te). */
export function formatServiceRegionCompact(summary: string): string {
  const value = summary.trim()
  if (!value || value === 'Tanımsız') return 'Tanımsız'
  if (/kapsam satırı/i.test(value)) return value

  const parts = value
    .split('·')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length >= 3) {
    return `${parts[0]} · ${parts[1]}`
  }

  if (value.length > 28) {
    return `${value.slice(0, 26)}…`
  }

  return value
}

export const VEHICLE_CLASS_LABELS: Record<VehicleClass, string> = {
  motosiklet: 'Motosiklet',
  minivan: 'Minivan',
  panelvan: 'Panelvan',
  kamyonet: 'Kamyonet',
}

export const VEHICLE_BODY_LABELS: Record<VehicleBodyType, string> = {
  kapali_kasa: 'Kapalı Kasa',
  acik_kasa: 'Açık Kasa',
  frigo: 'Frigo (Soğutuculu)',
}

export const VEHICLE_SKILL_LABELS: Record<string, string> = {
  soguk_zincir: 'Soğuk Zincir',
  montaj_ekibi: 'Montaj Ekibi',
  iki_kurye: 'İki Kurye',
  asansorlu: 'Asansörlü Kasa',
  adr: 'ADR',
  elektrikli: 'Elektrikli',
  buyuk_hacim: 'Büyük Hacim',
  hizli_teslimat: 'Hızlı Teslimat',
}

export const VEHICLE_OWNERSHIP_LABELS: Record<VehicleOwnership, string> = {
  oz_mal: 'Öz Mal (Şirket Aracı)',
  kiralik: 'Kiralık',
  esnaf_kurye: 'Kurye Kendi Aracı (Esnaf Kurye)',
}

export const VEHICLE_START_STRATEGY_LABELS: Record<VehicleStartStrategy, string> = {
  ilk_gorev: 'İlk Görevden Başla',
  sabit_park: 'Varsayılan Park Konumu',
}

export const VEHICLE_DOCUMENT_TYPE_LABELS: Record<VehicleDocumentType, string> = {
  ruhsat: 'Ruhsat',
  trafik_sigortasi: 'Trafik Sigortası',
  kasko: 'Kasko',
  muayene: 'Muayene',
  diger: 'Diğer',
}

export const SERVICE_REGION_OPTIONS = [
  'İstanbul — Şişli / Fulya',
  'İstanbul — Şişli / Osmanbey',
  'İstanbul — Beşiktaş / Levent',
  'İstanbul — Kadıköy / Moda',
  'İstanbul — Ataşehir / Barbaros',
  'İstanbul — Ümraniye / Çakmak',
  'İstanbul — Bakırköy / Ataköy',
  'Ankara — Çankaya / Kızılay',
  'İzmir — Bornova / Erzene',
  'Bursa — Nilüfer / Özlüce',
  'Kocaeli — Gebze / Dilovası',
  'Antalya — Muratpaşa / Lara',
] as const

export const COURIER_OPTIONS = [
  { id: 'c-001', name: 'Mehmet Yılmaz' },
  { id: 'c-002', name: 'Ayşe Demir' },
  { id: 'c-003', name: 'Can Öztürk' },
  { id: 'c-004', name: 'Burak Kaya' },
  { id: 'c-005', name: 'Elif Şahin' },
  { id: 'c-006', name: 'Deniz Arslan' },
  { id: 'c-007', name: 'Hakan Çelik' },
  { id: 'c-008', name: 'Serkan Aydın' },
  { id: 'c-009', name: 'Zeynep Aksoy' },
  { id: 'c-010', name: 'Onur Yıldız' },
] as const

export function formatDocWarningText(daysRemaining: number, label: string): string {
  if (daysRemaining < 0) {
    return `${label} ${Math.abs(daysRemaining)} gün gecikti`
  }
  if (daysRemaining === 0) {
    return `${label} bugün bitiyor`
  }
  return `${label} ${daysRemaining} gün kaldı`
}

export function occupancyTone(pct: number): 'ok' | 'warn' | 'critical' {
  if (pct >= 80) return 'critical'
  if (pct >= 60) return 'warn'
  return 'ok'
}

export function occupancyLabel(pct: number): string | null {
  const tone = occupancyTone(pct)
  if (tone === 'critical') return 'Kritik'
  if (tone === 'warn') return 'Yüksek'
  return null
}

type QueryInput = {
  items: LastmileVehicle[]
  search: string
  statusScope: VehicleStatusScope
  ownership: VehicleOwnership[]
  bodyTypes: string[]
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  page: number
  pageSize: number
}

export function queryVehicles({
  items,
  search,
  statusScope,
  ownership,
  bodyTypes,
  sortBy,
  sortDir = 'asc',
  page,
  pageSize,
}: QueryInput) {
  const q = search.trim().toLocaleLowerCase('tr-TR')

  let filtered = items.filter((vehicle) => {
    if (!vehicleMatchesStatusScope(vehicle, statusScope)) return false
    if (ownership.length > 0 && !ownership.includes(vehicle.mulkiyet)) return false
    if (bodyTypes.length > 0 && !bodyTypes.includes(vehicle.arac_tipi)) return false

    if (!q) return true

    const haystack = [
      vehicle.plaka,
      vehicle.marka,
      vehicle.model,
      VEHICLE_CLASS_LABELS[vehicle.arac_tipi],
      vehicle.kasa_tipi ? VEHICLE_BODY_LABELS[vehicle.kasa_tipi] : '',
      vehicle.zimmetli_surucu ?? '',
      vehicle.hizmet_bolgesi,
      ...vehicle.yetenekler.map((skill) => VEHICLE_SKILL_LABELS[skill]),
    ]
      .join(' ')
      .toLocaleLowerCase('tr-TR')

    return haystack.includes(q)
  })

  if (sortBy) {
    const dir = sortDir === 'desc' ? -1 : 1
    filtered = [...filtered].sort((a, b) => {
      const left = sortValue(a, sortBy)
      const right = sortValue(b, sortBy)
      if (left < right) return -1 * dir
      if (left > right) return 1 * dir
      return 0
    })
  }

  const total = filtered.length
  const start = (page - 1) * pageSize
  const pageItems = filtered.slice(start, start + pageSize)

  return { items: pageItems, total }
}

function sortValue(vehicle: LastmileVehicle, sortBy: string): string | number {
  switch (sortBy) {
    case 'plaka':
      return vehicle.plaka
    case 'durum':
      return vehicle.durum
    case 'marka_model':
      return `${vehicle.marka} ${vehicle.model} ${vehicle.model_yili}`
    case 'zimmetli_surucu':
      return vehicle.zimmetli_surucu ?? ''
    case 'hizmet_bolgesi':
      return vehicle.hizmet_bolgesi
    case 'kapasite_doluluk':
    case 'doluluk':
      return Math.max(vehicle.doluluk_hacim_pct, vehicle.doluluk_agirlik_pct)
    case 'mulkiyet':
      return vehicle.mulkiyet
    case 'arac_tipi':
      return `${VEHICLE_CLASS_LABELS[vehicle.arac_tipi]} ${
        vehicle.kasa_tipi ? VEHICLE_BODY_LABELS[vehicle.kasa_tipi] : ''
      }`
    case 'vardiya':
      return `${vehicle.vardiya_baslangic}-${vehicle.vardiya_bitis}`
    case 'muayene_bitis':
      return vehicle.muayene_bitis ?? ''
    case 'trafik_sigortasi_bitis':
      return vehicle.trafik_sigortasi_bitis ?? ''
    case 'kasko_bitis':
      return vehicle.kasko_bitis ?? ''
    default:
      return vehicle.plaka
  }
}
