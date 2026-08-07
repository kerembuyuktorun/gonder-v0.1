import { filterImplicitSkillCodes, isImplicitSkill } from '../../../_lib/skill-catalog'
import type { CourierCreateFormValues } from '../_components/create-courier-modal'
import type {
  CourierBloodType,
  CourierDocWarning,
  CourierDocumentMeta,
  CourierDocumentType,
  CourierEmploymentType,
  CourierListKpi,
  CourierOperationalStatus,
  CourierSkill,
  CourierStatusScope,
  LastmileCourier,
} from '../_types/courier'
import type { CourierActivityEvent, CourierVehicleAssignment } from '../[id]/_types/courier-detail'

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

function asStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input.map((item) => asString(item)).filter(Boolean)
}

function formatCreatedAt(input: unknown): string {
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

const EMPLOYMENT_TO_BE: Record<CourierEmploymentType, string> = {
  sirket: 'COMPANY',
  esnaf: 'CONTRACTOR',
}

const EMPLOYMENT_FROM_BE: Record<string, CourierEmploymentType> = {
  COMPANY: 'sirket',
  CONTRACTOR: 'esnaf',
  sirket: 'sirket',
  esnaf: 'esnaf',
}

const DOC_WARNING_KINDS = new Set(['ehliyet', 'src', 'saglik'])

export function mapOperationalStatus(raw: unknown): CourierOperationalStatus {
  const key = asString(raw).toLowerCase()
  if (key === 'yolda' || key === 'on_road' || key === 'onroad') return 'yolda'
  if (key === 'bosta' || key === 'bos_ta' || key === 'idle' || key === 'available') {
    return 'bos_ta'
  }
  return 'pasif'
}

export function statusScopeToParam(scope: CourierStatusScope | undefined): string | undefined {
  if (!scope || scope === 'all') return undefined
  if (scope === 'bos_ta') return 'bosta'
  return scope
}

export function statusToApi(status: 'pasif' | 'bos_ta'): string {
  return status === 'bos_ta' ? 'bosta' : status
}

export function employmentToParam(values: CourierEmploymentType[]): string | undefined {
  if (values.length === 0) return undefined
  return values.map((value) => EMPLOYMENT_TO_BE[value]).join(',')
}

const SORT_BY_TO_API: Record<string, string> = {
  ad_soyad: 'ad_soyad',
  durum: 'durum',
  telefon: 'telefon',
  tckn: 'tckn',
  eposta: 'eposta',
  kan_grubu: 'kan_grubu',
  istihdam: 'istihdam',
  zimmetli_arac: 'zimmetli_arac',
  vardiya: 'vardiya',
}

export function sortByToApi(sortBy: string): string {
  return SORT_BY_TO_API[sortBy] ?? sortBy
}

function mapDocWarning(raw: unknown): CourierDocWarning | null {
  const row = asRecord(raw)
  const kind = asString(row.kind) as CourierDocWarning['kind']
  if (!DOC_WARNING_KINDS.has(kind)) return null
  return {
    kind,
    label: asString(row.label, kind),
    daysRemaining: asNumber(row.daysRemaining),
  }
}

export function mapCourierDocument(raw: unknown, index = 0): CourierDocumentMeta | null {
  return mapDocument(raw, index)
}

function mapDocument(raw: unknown, _index: number): CourierDocumentMeta | null {
  const row = asRecord(raw)
  const id = asString(row.id)
  const name = asString(row.name || row.fileName)
  if (!id || !name) return null

  const typeRaw = asString(row.type, 'diger') as CourierDocumentType

  return {
    id,
    name,
    size: asNumber(row.size),
    mimeType: asString(row.mimeType || row.contentType, 'application/octet-stream'),
    type: typeRaw,
    uploadedAt: asString(row.uploadedAt, new Date().toISOString()),
    uploadedBy: asString(row.uploadedBy, '—'),
  }
}

export function mapBackendCourier(raw: unknown): LastmileCourier | null {
  const row = asRecord(raw)
  const id = asString(row.id)
  if (!id) return null

  const employmentKey = asString(row.employmentType || row.istihdam).toUpperCase()
  const istihdam = EMPLOYMENT_FROM_BE[employmentKey] ?? EMPLOYMENT_FROM_BE[asString(row.employmentType)] ?? 'sirket'

  const bloodType = asString(row.bloodType || row.kan_grubu, 'A Rh+') as CourierBloodType

  const skillsRaw = row.skills ?? row.yetenekler
  const yetenekler = filterImplicitSkillCodes(asStringArray(skillsRaw)) as CourierSkill[]

  const warningsRaw = row.documentWarnings ?? row.evrak_uyarilari
  const evrakUyarilari = Array.isArray(warningsRaw)
    ? warningsRaw
        .map((item) => mapDocWarning(item))
        .filter((item): item is CourierDocWarning => Boolean(item))
    : []

  const documentsRaw = row.documents ?? row.evraklar
  const evraklar = Array.isArray(documentsRaw)
    ? documentsRaw
        .map((item, index) => mapDocument(item, index))
        .filter((item): item is CourierDocumentMeta => Boolean(item))
    : []

  const activeRoute = asRecord(row.activeRoute)
  const aktif_rota_id = asString(activeRoute.id || row.activeRouteId) || null
  const aktif_rota_durak_sayisi = (() => {
    const rawCount = activeRoute.stopCount ?? row.activeRouteStopCount
    if (rawCount == null || rawCount === '') return null
    const value = asNumber(rawCount, Number.NaN)
    return Number.isFinite(value) ? value : null
  })()
  const aktif_rota_siparis_sayisi = (() => {
    const rawCount = activeRoute.orderCount ?? row.activeRouteOrderCount
    if (rawCount == null || rawCount === '') return null
    const value = asNumber(rawCount, Number.NaN)
    return Number.isFinite(value) ? value : null
  })()

  return {
    id,
    ad_soyad: asString(row.fullName || row.ad_soyad, '—'),
    telefon: asString(row.phone || row.telefon),
    tckn: asString(row.nationalId || row.tckn) || null,
    kan_grubu: bloodType,
    eposta: asString(row.email || row.eposta) || null,
    davet_kabul_edildi: Boolean(row.inviteAccepted ?? row.davet_kabul_edildi ?? row.emailVerified),
    durum: mapOperationalStatus(row.operationalStatus ?? row.durum),
    istihdam,
    zimmetli_arac_id: asString(row.assignedVehicleId || row.zimmetli_arac_id) || null,
    zimmetli_arac_plaka: asString(row.assignedVehiclePlate || row.zimmetli_arac_plaka) || null,
    vardiya_baslangic: asString(row.shiftStart || row.vardiya_baslangic, '09:00'),
    vardiya_bitis: asString(row.shiftEnd || row.vardiya_bitis, '18:00'),
    aktif_rota_id,
    aktif_rota_durak_sayisi,
    aktif_rota_siparis_sayisi,
    yetenekler,
    evrak_uyarilari: evrakUyarilari,
    ehliyet_bitis:
      asString(row.drivingLicenseExpirationDate || row.ehliyet_bitis) || null,
    src_bitis: asString(row.srcCertificateExpirationDate || row.src_bitis) || null,
    saglik_bitis: asString(row.healthReportExpirationDate || row.saglik_bitis) || null,
    evraklar,
    olusturan: asString(row.createdByName || row.olusturan, '—'),
    olusturulma_zamani: formatCreatedAt(row.createdAt || row.olusturulma_zamani),
  }
}

export function mapCourierStats(raw: unknown): CourierListKpi {
  const row = asRecord(raw)
  const nested = asRecord(row.data)
  const source = Object.keys(nested).length > 0 ? nested : row

  return {
    total: asNumber(source.total),
    onRoad: asNumber(source.onRoad),
    idle: asNumber(source.idle),
    passive: asNumber(source.passive),
    unassigned: asNumber(source.unassigned),
    docWarnings: asNumber(source.docWarnings),
  }
}

export function mapCourierStatusCounts(
  raw: unknown,
  fallbackTotal = 0
): Record<CourierStatusScope, number> {
  const row = asRecord(raw)
  const all = asNumber(row.all, fallbackTotal)
  return {
    all,
    yolda: asNumber(row.yolda ?? row.onRoad),
    bos_ta: asNumber(row.bosta ?? row.bos_ta ?? row.idle),
    pasif: asNumber(row.pasif ?? row.passive),
  }
}

export function buildCourierWritePayload(
  values: CourierCreateFormValues,
  documentIds: string[]
): Record<string, unknown> {
  const tckn = values.tckn.replace(/\D/g, '')
  const skills = filterImplicitSkillCodes(values.yetenekler)

  return {
    fullName: values.ad_soyad.trim(),
    phone: values.telefon.trim(),
    email: values.eposta.trim(),
    nationalId: tckn || null,
    bloodType: values.kan_grubu,
    employmentType: values.istihdam ? EMPLOYMENT_TO_BE[values.istihdam as CourierEmploymentType] : undefined,
    shiftStart: values.vardiya_baslangic,
    shiftEnd: values.vardiya_bitis,
    ...(skills.length > 0 ? { skills } : {}),
    assignedVehicleId: values.zimmetli_arac_id || null,
    drivingLicenseExpirationDate: values.ehliyet_bitis || null,
    srcCertificateExpirationDate: values.src_bitis || null,
    healthReportExpirationDate: values.saglik_bitis || null,
    documentIds,
  }
}

export function mapAssignmentHistoryItem(raw: unknown): CourierVehicleAssignment | null {
  const row = asRecord(raw)
  const id = asString(row.id)
  const vehicleId = asString(row.vehicleId)
  if (!id || !vehicleId) return null

  return {
    id,
    vehicleId,
    vehiclePlate: asString(row.vehiclePlate, '—'),
    startedAt: asString(row.startedAt),
    endedAt: asString(row.endedAt) || null,
    note: asString(row.note) || undefined,
  }
}

export function mapActivityEvent(raw: unknown): CourierActivityEvent | null {
  const row = asRecord(raw)
  const id = asString(row.id)
  if (!id) return null

  const meta = asRecord(row.meta)
  const detail =
    asString(meta.detail) ||
    asString(meta.message) ||
    (Object.keys(meta).length > 0 ? JSON.stringify(meta) : undefined)

  return {
    id,
    kind: asString(row.kind, 'updated') as CourierActivityEvent['kind'],
    title: asString(row.summary || row.title, 'Güncelleme'),
    detail,
    at: asString(row.createdAt || row.at, new Date().toISOString()),
    actor: asString(row.createdByName || row.actor) || undefined,
    ip: asString(meta.ip) || null,
  }
}

export type DriverSkillCatalogItem = {
  code: string
  name: string
  vroomId?: number | null
  appliesTo?: string[]
}

export function mapDriverSkillCatalogItem(raw: unknown): DriverSkillCatalogItem | null {
  const row = asRecord(raw)
  const code = asString(row.code ?? row.slug ?? row.id)
  if (!code) return null

  const name = asString(row.name ?? row.label) || code
  const vroomRaw = row.vroomId ?? row.vroomSkillId
  const vroomId =
    typeof vroomRaw === 'number' && Number.isFinite(vroomRaw) ? vroomRaw : null
  const appliesTo = asStringArray(row.appliesTo)

  if (isImplicitSkill(code) || (vroomId != null && isImplicitSkill(vroomId))) {
    return null
  }

  return {
    code,
    name,
    vroomId,
    appliesTo: appliesTo.length > 0 ? appliesTo : undefined,
  }
}
