import { filterImplicitSkillCodes } from '../../../_lib/skill-catalog'
import type { OperationScopeRow } from '../../../customers/[id]/_types/customer-detail'
import { toScopePayload } from '../../../customers/_lib/map-customer'
import type { VehicleCreateFormValues } from '../_components/create-vehicle-modal'
import type {
  LastmileVehicle,
  VehicleBodyType,
  VehicleClass,
  VehicleDocWarning,
  VehicleDocumentMeta,
  VehicleDocumentType,
  VehicleListKpi,
  VehicleOperationalStatus,
  VehicleOwnership,
  VehicleSkill,
  VehicleStartStrategy,
  VehicleStatusScope,
} from '../_types/vehicle'
import {
  mapSkillCatalogItem,
  type SkillCatalogItem,
} from '../../../_lib/skill-catalog'

export type VehicleSkillCatalogItem = SkillCatalogItem
export { mapSkillCatalogItem }

const CURRENT_YEAR = new Date().getFullYear()

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

function asStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input.map((item) => asString(item)).filter(Boolean)
}

function formatVehicleCreatedAt(input: unknown): string {
  const raw = asString(input)
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

function mapCreatedByName(row: Record<string, unknown>): string {
  const creator = asRecord(row.createdByUser || row.createdUserSnapshot || row.createdBy)
  const fromCreator =
    asString(creator.fullName || creator.displayName || creator.name) ||
    `${asString(creator.firstName)} ${asString(creator.lastName)}`.trim()
  return (
    fromCreator ||
    asString(row.createdByName || row.olusturan || row.createdBy, '—')
  )
}

const VEHICLE_CLASS_TO_BE: Record<VehicleClass, string> = {
  motosiklet: 'MOTORCYCLE',
  minivan: 'MINIVAN',
  panelvan: 'PANELVAN',
  kamyonet: 'PICKUP',
}

const VEHICLE_CLASS_FROM_BE: Record<string, VehicleClass> = {
  MOTORCYCLE: 'motosiklet',
  MINIVAN: 'minivan',
  PANELVAN: 'panelvan',
  PICKUP: 'kamyonet',
  VAN: 'kamyonet',
  TRUCK: 'kamyonet',
  SEMI_TRUCK: 'kamyonet',
}

const BODY_TYPE_TO_BE: Record<VehicleBodyType, string> = {
  kapali_kasa: 'CLOSED_CASE',
  acik_kasa: 'OPEN_CASE',
  frigo: 'REFRIGERATION',
}

const BODY_TYPE_FROM_BE: Record<string, VehicleBodyType> = {
  CLOSED_CASE: 'kapali_kasa',
  OPEN_CASE: 'acik_kasa',
  REFRIGERATION: 'frigo',
  CANOPIED: 'acik_kasa',
  TENT: 'acik_kasa',
}

const OWNERSHIP_TO_BE: Record<VehicleOwnership, string> = {
  oz_mal: 'OWNED',
  kiralik: 'RENTED',
  esnaf_kurye: 'COURIER_OWNED',
}

const OWNERSHIP_FROM_BE: Record<string, VehicleOwnership> = {
  OWNED: 'oz_mal',
  RENTED: 'kiralik',
  COURIER_OWNED: 'esnaf_kurye',
}

const START_STRATEGY_TO_BE: Record<VehicleStartStrategy, string> = {
  ilk_gorev: 'FIRST_JOB',
  sabit_park: 'FIXED_PARK',
}

const START_STRATEGY_FROM_BE: Record<string, VehicleStartStrategy> = {
  FIRST_JOB: 'ilk_gorev',
  FIXED_PARK: 'sabit_park',
}

const DOC_WARNING_KINDS = new Set(['trafik_sigortasi', 'kasko', 'muayene'])

function mapOperationalStatus(raw: unknown): VehicleOperationalStatus {
  const key = asString(raw).toLowerCase()
  if (key === 'yolda' || key === 'on_road' || key === 'onroad') return 'yolda'
  if (key === 'bosta' || key === 'bos_ta' || key === 'idle' || key === 'available') {
    return 'bos_ta'
  }
  return 'pasif'
}

export function statusToApi(status: 'pasif' | 'bos_ta'): string {
  return status === 'bos_ta' ? 'bosta' : status
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

function mapDocument(raw: unknown, index: number): VehicleDocumentMeta | null {
  const row = asRecord(raw)
  const id = asString(row.id)
  const name = asString(row.name || row.fileName)
  if (!id || !name) return null

  const typeRaw = asString(row.type, 'diger') as VehicleDocumentType

  return {
    id,
    name,
    size: asNumber(row.size),
    mimeType: asString(row.mimeType || row.contentType, 'application/octet-stream'),
    type: typeRaw,
    uploadedAt: asString(row.uploadedAt || row.createdAt, new Date().toISOString()),
    uploadedBy: asString(row.uploadedBy || row.uploadedByName, '—'),
  }
}

function mapDocWarning(raw: unknown): VehicleDocWarning | null {
  const row = asRecord(raw)
  const kind = asString(row.kind) as VehicleDocWarning['kind']
  if (!DOC_WARNING_KINDS.has(kind)) return null
  return {
    kind,
    label: asString(row.label, kind),
    daysRemaining: asNumber(row.daysRemaining),
  }
}

export function mapBackendVehicle(raw: unknown): LastmileVehicle | null {
  const row = asRecord(raw)
  const id = asString(row.id)
  const plaka = asString(row.plaka || row.plate || row.plateNo)
  if (!id || !plaka) return null

  const typeKey = asString(row.type || row.vehicleClass || row.arac_tipi).toUpperCase()
  const aracTipi = VEHICLE_CLASS_FROM_BE[typeKey] ?? 'panelvan'

  const caseKey = asString(row.caseType || row.bodyType || row.kasa_tipi).toUpperCase()
  const kasaTipi = caseKey ? (BODY_TYPE_FROM_BE[caseKey] ?? null) : null

  const ownershipKey = asString(row.ownership || row.mulkiyet).toUpperCase()
  const mulkiyet = OWNERSHIP_FROM_BE[ownershipKey] ?? 'oz_mal'

  const strategyKey = asString(row.startStrategy || row.baslangic_stratejisi).toUpperCase()
  const baslangicStratejisi = START_STRATEGY_FROM_BE[strategyKey] ?? 'ilk_gorev'

  const parkLocation = asRecord(row.parkLocation)
  const parkLabel = asString(parkLocation.label || row.park_konumu)

  const skillsRaw = row.skills ?? row.yetenekler
  const yetenekler = filterImplicitSkillCodes(asStringArray(skillsRaw)) as VehicleSkill[]

  const warningsRaw = row.documentWarnings ?? row.evrak_uyarilari
  const evrakUyarilari = Array.isArray(warningsRaw)
    ? warningsRaw
        .map((item) => mapDocWarning(item))
        .filter((item): item is VehicleDocWarning => Boolean(item))
    : []

  const documentsRaw = row.documents ?? row.evraklar
  const evraklar = Array.isArray(documentsRaw)
    ? documentsRaw
        .map((item, index) => mapDocument(item, index))
        .filter((item): item is VehicleDocumentMeta => Boolean(item))
    : []

  const activeRoute = asRecord(row.activeRoute)
  const aktif_rota_id =
    asString(activeRoute.id || row.activeRouteId || row.aktif_rota_id) || null
  const aktif_rota_label =
    asString(
      activeRoute.name ||
        activeRoute.code ||
        row.activeRouteLabel ||
        row.aktif_rota_label
    ) || null
  const aktif_rota_durak_sayisi = (() => {
    const raw =
      activeRoute.stopCount ??
      activeRoute.stopsCount ??
      row.activeRouteStopCount ??
      row.aktif_rota_durak_sayisi
    if (raw == null || raw === '') return null
    const value = asNumber(raw, Number.NaN)
    return Number.isFinite(value) ? value : null
  })()
  const aktif_rota_siparis_sayisi = (() => {
    const raw =
      activeRoute.orderCount ??
      activeRoute.ordersCount ??
      row.activeRouteOrderCount ??
      row.aktif_rota_siparis_sayisi
    if (raw == null || raw === '') return null
    const value = asNumber(raw, Number.NaN)
    return Number.isFinite(value) ? value : null
  })()

  return {
    id,
    plaka,
    durum: mapOperationalStatus(row.operationalStatus ?? row.durum),
    arac_tipi: aracTipi,
    kasa_tipi: aracTipi === 'motosiklet' ? null : kasaTipi,
    marka: asString(row.brand || row.marka),
    model: asString(row.model),
    model_yili: asNumber(row.year ?? row.modelYear ?? row.model_yili, CURRENT_YEAR),
    zimmetli_surucu_id:
      asString(row.assignedCourierId || row.assignedDriverId || row.chargedDriverId) ||
      null,
    zimmetli_surucu: asString(row.assignedCourierName || row.assignedDriverName) || null,
    hizmet_bolgesi: asString(
      row.serviceRegionSummary || row.hizmet_bolgesi,
      'Tanımsız'
    ),
    vardiya_baslangic: asString(row.shiftStart || row.vardiya_baslangic, '09:00'),
    vardiya_bitis: asString(row.shiftEnd || row.vardiya_bitis, '18:00'),
    baslangic_stratejisi: baslangicStratejisi,
    park_konumu: parkLabel || null,
    park_lat: parkLocation.latitude != null ? asNumber(parkLocation.latitude) : null,
    park_lng: parkLocation.longitude != null ? asNumber(parkLocation.longitude) : null,
    doluluk_hacim_pct: asNumber(row.volumeOccupancyPct ?? row.doluluk_hacim_pct),
    doluluk_agirlik_pct: asNumber(row.weightOccupancyPct ?? row.doluluk_agirlik_pct),
    yetenekler,
    evrak_uyarilari: evrakUyarilari,
    mulkiyet,
    max_hacim_m3: asNumber(row.maxVolumeM3 ?? row.max_hacim_m3),
    max_agirlik_kg: asNumber(
      row.maxWeightKg ?? row.maxWeight ?? row.max_agirlik_kg
    ),
    kasko_police_no:
      asString(
        row.cascoPolicyNo ??
          row.comprehensiveInsuranceNo ??
          row.kasko_police_no
      ) || null,
    trafik_sigortasi_bitis:
      asString(
        row.trafficInsuranceExpiryDate ??
          row.trafficInsuranceExpirationDate ??
          row.trafik_sigortasi_bitis
      ) || null,
    kasko_bitis:
      asString(
        row.cascoExpiryDate ??
          row.comprehensiveInsuranceExpirationDate ??
          row.kasko_bitis
      ) || null,
    muayene_bitis:
      asString(
        row.inspectionExpiryDate ??
          row.vehicleInspectionExpirationDate ??
          row.muayene_bitis
      ) || null,
    evraklar,
    olusturan: mapCreatedByName(row),
    olusturulma_zamani: formatVehicleCreatedAt(
      row.createdAt || row.createdDate || row.olusturulma_zamani
    ),
    aktif_rota_id,
    aktif_rota_label,
    aktif_rota_durak_sayisi,
    aktif_rota_siparis_sayisi,
  }
}

export function mapVehicleOperationScopes(raw: unknown): OperationScopeRow[] {
  const scopes = Array.isArray(raw) ? raw : []
  return scopes
    .map((item, index) => mapScopeRow(item, index))
    .filter((item): item is OperationScopeRow => Boolean(item))
}

export function mapVehicleStats(raw: unknown): VehicleListKpi {
  const row = asRecord(raw)
  const nested = asRecord(row.data)
  const source = Object.keys(nested).length > 0 ? nested : row

  return {
    total: asNumber(source.total),
    onRoad: asNumber(source.onRoad),
    idle: asNumber(source.idle),
    passive: asNumber(source.passive),
    criticalOccupancy: asNumber(source.criticalOccupancy),
    docWarnings: asNumber(source.docWarnings),
  }
}

export function mapVehicleStatusCounts(
  raw: unknown,
  fallbackTotal = 0
): Record<VehicleStatusScope, number> {
  const row = asRecord(raw)
  const all = asNumber(row.all, fallbackTotal)
  return {
    all,
    yolda: asNumber(row.yolda ?? row.onRoad),
    bos_ta: asNumber(row.bosta ?? row.bos_ta ?? row.idle),
    pasif: asNumber(row.pasif ?? row.passive),
  }
}

export function statusScopeToParam(scope: VehicleStatusScope | undefined): string | undefined {
  if (!scope || scope === 'all') return undefined
  if (scope === 'bos_ta') return 'bosta'
  return scope
}

export function ownershipToParam(values: VehicleOwnership[]): string | undefined {
  if (values.length === 0) return undefined
  return values.map((value) => OWNERSHIP_TO_BE[value]).join(',')
}

export function vehicleClassToParam(values: string[]): string | undefined {
  if (values.length === 0) return undefined
  return values
    .map((value) => VEHICLE_CLASS_TO_BE[value as VehicleClass])
    .filter(Boolean)
    .join(',')
}

export function buildVehicleWritePayload(
  values: VehicleCreateFormValues,
  documentIds: string[],
  options?: { includeCourierAssignment?: boolean }
): Record<string, unknown> {
  const includeCourierAssignment = options?.includeCourierAssignment ?? false
  const isMotorcycle = values.arac_tipi === 'motosiklet'
  const isFixedPark = values.baslangic_stratejisi === 'sabit_park'

  const payload: Record<string, unknown> = {
    plateNo: values.plaka.trim(),
    brand: values.marka.trim(),
    model: values.model.trim(),
    year: Number(values.model_yili),
    ownership: OWNERSHIP_TO_BE[values.mulkiyet as VehicleOwnership],
    type: VEHICLE_CLASS_TO_BE[values.arac_tipi as VehicleClass],
    maxWeight: Number(values.max_agirlik_kg),
    maxVolumeM3: Number(values.max_hacim_m3),
    shiftStart: values.vardiya_baslangic,
    shiftEnd: values.vardiya_bitis,
    startStrategy: START_STRATEGY_TO_BE[values.baslangic_stratejisi],
    operationScopes: toScopePayload(values.hizmet_bolgesi_scopes),
    vehicleInspectionExpirationDate: values.muayene_bitis || null,
    trafficInsuranceExpirationDate: values.trafik_sigortasi_bitis || null,
    comprehensiveInsuranceNo: values.kasko_police_no.trim() || null,
    comprehensiveInsuranceExpirationDate: values.kasko_bitis || null,
    documentIds,
  }

  if (includeCourierAssignment && values.zimmetli_surucu_id) {
    payload.assignedCourierId = values.zimmetli_surucu_id
  }

  if (!isMotorcycle && values.kasa_tipi) {
    payload.caseType = BODY_TYPE_TO_BE[values.kasa_tipi as VehicleBodyType]
  }

  if (isFixedPark && values.park_konumu.trim()) {
    payload.parkLocation = {
      label: values.park_konumu.trim(),
      latitude: values.park_lat,
      longitude: values.park_lng,
    }
  } else {
    payload.parkLocation = null
  }

  const skills = filterImplicitSkillCodes(values.yetenekler)
  if (skills.length > 0) {
    payload.skills = skills
  }

  return payload
}

export function vehicleToFormValuesWithScopes(
  vehicle: LastmileVehicle,
  scopes: OperationScopeRow[]
): VehicleCreateFormValues {
  return {
    plaka: vehicle.plaka,
    marka: vehicle.marka,
    model: vehicle.model,
    model_yili: String(vehicle.model_yili),
    mulkiyet: vehicle.mulkiyet,
    zimmetli_surucu_id: vehicle.zimmetli_surucu_id ?? '',
    arac_tipi: vehicle.arac_tipi,
    kasa_tipi: vehicle.kasa_tipi ?? '',
    max_hacim_m3: String(vehicle.max_hacim_m3),
    max_agirlik_kg: String(vehicle.max_agirlik_kg),
    yetenekler: [...vehicle.yetenekler],
    hizmet_bolgesi_scopes: scopes,
    vardiya_baslangic: vehicle.vardiya_baslangic || '09:00',
    vardiya_bitis: vehicle.vardiya_bitis || '18:00',
    baslangic_stratejisi: vehicle.baslangic_stratejisi,
    park_konumu: vehicle.park_konumu ?? '',
    park_lat: vehicle.park_lat,
    park_lng: vehicle.park_lng,
    trafik_sigortasi_bitis: vehicle.trafik_sigortasi_bitis ?? '',
    kasko_police_no: vehicle.kasko_police_no ?? '',
    kasko_bitis: vehicle.kasko_bitis ?? '',
    muayene_bitis: vehicle.muayene_bitis ?? '',
    evraklar: vehicle.evraklar.map((doc) => ({
      ...doc,
      type: doc.type ?? 'diger',
      uploadedAt: doc.uploadedAt ?? new Date().toISOString(),
      uploadedBy: doc.uploadedBy ?? 'Mevcut Kullanıcı',
    })),
  }
}

export type CourierOption = {
  id: string
  name: string
  assignedVehicleId?: string | null
  assignedVehiclePlate?: string | null
}

const SORT_BY_TO_API: Record<string, string> = {
  kapasite_doluluk: 'occupancy',
}

export function sortByToApi(sortBy: string): string {
  return SORT_BY_TO_API[sortBy] ?? sortBy
}

export function enrichCourierOptionsWithVehicles(
  couriers: CourierOption[],
  vehicles: LastmileVehicle[]
): CourierOption[] {
  const assignmentByDriver = new Map<string, { vehicleId: string; plate: string }>()

  for (const vehicle of vehicles) {
    const driverId = vehicle.zimmetli_surucu_id
    if (driverId) {
      assignmentByDriver.set(driverId, { vehicleId: vehicle.id, plate: vehicle.plaka })
    }
  }

  return couriers.map((courier) => {
    const fromFleet = assignmentByDriver.get(courier.id)
    const assignedVehicleId =
      courier.assignedVehicleId ?? fromFleet?.vehicleId ?? null
    const assignedVehiclePlate =
      courier.assignedVehiclePlate ?? fromFleet?.plate ?? null

    return {
      ...courier,
      assignedVehicleId,
      assignedVehiclePlate,
    }
  })
}

export function mapDriverOption(raw: unknown): CourierOption | null {
  const row = asRecord(raw)
  const id = asString(row.id)
  if (!id) return null

  const snapshot = asRecord(row.userSnapshot)
  const name =
    asString(snapshot.name) ||
    `${asString(snapshot.firstName)} ${asString(snapshot.lastName)}`.trim() ||
    asString(row.name) ||
    asString(row.fullName) ||
    asString(row.ad_soyad)

  return {
    id,
    name: name || id,
    assignedVehicleId: asString(row.assignedVehicleId) || null,
    assignedVehiclePlate: asString(row.assignedVehiclePlate) || null,
  }
}
