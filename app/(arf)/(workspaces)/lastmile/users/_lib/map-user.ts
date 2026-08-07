import type {
  LastmileUser,
  UserAccessStatus,
  UserDocumentMeta,
  UserDocumentType,
  UserGender,
  UserKind,
  UserListKpi,
  UserMaritalStatus,
  UserPersonnelInfo,
  UserStatusScope,
} from '../_types/user'
import type { UserActivityEvent, UserSession } from '../[id]/_types/user-detail'

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

function asNullableString(input: unknown): string | null {
  const value = asString(input)
  return value || null
}

/** Read camelCase or snake_case field from API payloads */
function pickField(source: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }
  return undefined
}

function pickString(source: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = asString(source[key])
    if (value) return value
  }
  return ''
}

function pickNullableString(source: Record<string, unknown>, ...keys: string[]): string | null {
  const value = pickString(source, ...keys)
  return value || null
}

const STATUS_MAP: Record<string, UserAccessStatus> = {
  Active: 'aktif',
  Passive: 'pasif',
  PendingVerify: 'davet',
  Suspend: 'askida',
}

const STATUS_TO_BACKEND: Record<UserStatusScope, string | undefined> = {
  all: undefined,
  aktif: 'Active',
  pasif: 'Passive',
  davet: 'PendingVerify',
  askida: 'Suspend',
}

const CUSTOMER_USER_TYPES = new Set(['Customer'])

export function mapBackendUserStatus(status: unknown): UserAccessStatus {
  const key = asString(status)
  return STATUS_MAP[key] ?? 'pasif'
}

export function mapStatusScopeToBackend(scope: UserStatusScope): string | undefined {
  return STATUS_TO_BACKEND[scope]
}

export function mapBackendUserType(userType: unknown): UserKind {
  return CUSTOMER_USER_TYPES.has(asString(userType)) ? 'musteri' : 'ic_ekip'
}

export function mapKindToBackendUserType(kind: UserKind): string {
  return kind === 'musteri' ? 'Customer' : 'Manager'
}

function mapGender(value: unknown): UserGender | null {
  const raw = asString(value).toLowerCase().replace(/ı/g, 'i')
  if (!raw) return null
  if (['female', 'f', 'kadin', 'kadın', 'woman', 'w'].includes(raw)) return 'kadin'
  if (['male', 'm', 'erkek', 'man'].includes(raw)) return 'erkek'
  if (['unspecified', 'belirtilmedi', 'other', 'unknown'].includes(raw)) return 'belirtilmedi'
  return null
}

function mapGenderToBackend(value: UserGender | null | undefined): string | undefined {
  if (!value || value === 'belirtilmedi') return undefined
  return value === 'kadin' ? 'Female' : 'Male'
}

function mapMaritalStatus(value: unknown): UserMaritalStatus | null {
  const raw = asString(value).toLowerCase().replace(/ı/g, 'i')
  if (['single', 'bekar', 'unmarried'].includes(raw)) return 'bekar'
  if (['married', 'evli'].includes(raw)) return 'evli'
  if (['unspecified', 'belirtilmedi', 'other', 'unknown'].includes(raw)) return 'belirtilmedi'
  return null
}

function mapMaritalStatusToBackend(value: UserMaritalStatus | null | undefined): string | undefined {
  if (!value || value === 'belirtilmedi') return undefined
  return value === 'bekar' ? 'Single' : 'Married'
}

const DOCUMENT_TYPE_MAP: Record<string, UserDocumentType> = {
  IDENTITY: 'kimlik',
  ID: 'kimlik',
  RESIDENCE: 'ikametgah',
  CONTRACT: 'sozlesme',
  SGK: 'sgk',
  DIPLOMA: 'diploma',
  CRIMINAL_RECORD: 'adli_sicil',
  HEALTH_REPORT: 'saglik_raporu',
  OTHER: 'diger',
}

function mapDocumentType(value: unknown): UserDocumentType {
  const key = asString(value).toUpperCase().replace(/[\s-]+/g, '_')
  return DOCUMENT_TYPE_MAP[key] ?? 'diger'
}

function mapPersonnelProfile(profile: unknown): UserPersonnelInfo {
  const source = asRecord(profile)
  return {
    tckn: pickNullableString(source, 'tckn', 'identityNumber', 'identity_number'),
    dogum_tarihi: pickNullableString(source, 'birthDate', 'birth_date', 'dateOfBirth', 'date_of_birth'),
    cinsiyet: mapGender(pickField(source, 'gender', 'cinsiyet')),
    medeni_hal: mapMaritalStatus(pickField(source, 'maritalStatus', 'marital_status', 'medeniHal', 'medeni_hal')),
    kan_grubu: pickNullableString(source, 'bloodType', 'blood_type', 'kanGrubu', 'kan_grubu'),
    ikamet_adresi: pickNullableString(
      source,
      'residenceAddress',
      'residence_address',
      'ikametAdresi',
      'ikamet_adresi',
      'address'
    ),
    ise_giris_tarihi: pickNullableString(
      source,
      'employmentStartDate',
      'employment_start_date',
      'iseGirisTarihi',
      'ise_giris_tarihi',
      'startDate',
      'start_date'
    ),
    unvan: pickNullableString(source, 'title', 'unvan', 'jobTitle', 'job_title'),
    acil_kisi: pickNullableString(
      source,
      'emergencyContactName',
      'emergency_contact_name',
      'acilKisi',
      'acil_kisi',
      'emergencyContact',
      'emergency_contact'
    ),
    acil_telefon: pickNullableString(
      source,
      'emergencyContactPhone',
      'emergency_contact_phone',
      'acilTelefon',
      'acil_telefon',
      'emergencyPhone',
      'emergency_phone'
    ),
    egitim_durumu: pickNullableString(
      source,
      'educationLevel',
      'education_level',
      'egitimDurumu',
      'egitim_durumu',
      'education'
    ),
  }
}

function mergePersonnel(
  profile: UserPersonnelInfo,
  root: Record<string, unknown>
): UserPersonnelInfo {
  const merged = { ...profile }

  merged.tckn =
    pickNullableString(root, 'tckn', 'identityNumber', 'identity_number') ?? merged.tckn
  merged.dogum_tarihi =
    pickNullableString(root, 'birthDate', 'birth_date', 'dateOfBirth', 'date_of_birth') ??
    merged.dogum_tarihi
  merged.cinsiyet =
    merged.cinsiyet ?? mapGender(pickField(root, 'gender', 'cinsiyet'))
  merged.medeni_hal =
    merged.medeni_hal ?? mapMaritalStatus(pickField(root, 'maritalStatus', 'marital_status'))
  merged.kan_grubu =
    pickNullableString(root, 'bloodType', 'blood_type') ?? merged.kan_grubu
  merged.egitim_durumu =
    pickNullableString(root, 'educationLevel', 'education_level') ?? merged.egitim_durumu
  merged.ise_giris_tarihi =
    pickNullableString(root, 'employmentStartDate', 'employment_start_date') ??
    merged.ise_giris_tarihi
  merged.ikamet_adresi =
    pickNullableString(root, 'residenceAddress', 'residence_address', 'address') ??
    merged.ikamet_adresi
  merged.acil_kisi =
    pickNullableString(root, 'emergencyContactName', 'emergency_contact_name') ?? merged.acil_kisi
  merged.acil_telefon =
    pickNullableString(root, 'emergencyContactPhone', 'emergency_contact_phone') ??
    merged.acil_telefon

  return merged
}

function pickRoleName(source: Record<string, unknown>): string {
  const role = asRecord(source.role)
  return (
    pickString(source, 'roleName', 'role_name') ||
    pickString(role, 'name', 'roleName', 'role_name') ||
    ''
  )
}

function pickRoleId(source: Record<string, unknown>): string | null {
  const role = asRecord(source.role)
  return (
    pickNullableString(source, 'roleId', 'role_id') ||
    pickNullableString(role, 'id', 'roleId', 'role_id')
  )
}

function pickAffiliationLabel(source: Record<string, unknown>): string {
  const direct = pickString(
    source,
    'affiliationLabel',
    'affiliation_label',
    'bagliKurum',
    'bagli_kurum'
  )
  if (direct) return direct

  const facility = asRecord(source.facility)
  const facilityName = pickString(facility, 'name', 'label', 'title')
  if (facilityName) return facilityName

  const customer = asRecord(source.customer)
  const customerName = pickString(
    customer,
    'companyName',
    'company_name',
    'name',
    'shortName',
    'short_name'
  )
  if (customerName) return customerName

  const transferCenter = asRecord(source.transferCenter ?? source.transfer_center)
  const transferName = pickString(transferCenter, 'name', 'label', 'title')
  if (transferName) return transferName

  const facilityId = pickNullableString(source, 'facilityId', 'facility_id')
  if (facilityId) return `Tesis: ${facilityId}`

  const customerId = pickNullableString(source, 'customerId', 'customer_id')
  if (customerId) return `Müşteri: ${customerId}`

  return '—'
}

function mapDocuments(documents: unknown): UserDocumentMeta[] {
  if (!Array.isArray(documents)) return []
  return documents.map((item) => {
    const doc = asRecord(item)
    return {
      id: asString(doc.id, `doc-${Date.now()}`),
      name: pickString(doc, 'originalFileName', 'original_file_name', 'fileName', 'file_name', 'name') || 'belge',
      size: Number(doc.sizeBytes ?? doc.size_bytes ?? doc.size ?? 0) || 0,
      mimeType: pickString(doc, 'mimeType', 'mime_type', 'contentType', 'content_type') || 'application/octet-stream',
      type: mapDocumentType(pickField(doc, 'type', 'documentType', 'document_type')),
      uploadedAt: pickString(doc, 'uploadedAt', 'uploaded_at', 'createdAt', 'created_at') || new Date().toISOString(),
      uploadedBy: pickString(doc, 'uploadedByName', 'uploaded_by_name', 'uploadedBy', 'uploaded_by') || '—',
    }
  })
}

/** Normalize GraphQL user object or REST GET /users/:id payload */
export function normalizeBackendUserPayload(raw: unknown): Record<string, unknown> {
  const root = asRecord(raw)
  const nested = asRecord(root.data)
  const user = asRecord(root.user ?? nested.user ?? nested)

  if (Object.keys(user).length > 0 && pickField(user, 'id')) {
    return user
  }

  if (pickField(root, 'id')) {
    return root
  }

  return user
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const normalized = fullName.trim().replace(/\s+/g, ' ')
  if (!normalized) return { firstName: '', lastName: '' }
  const parts = normalized.split(' ')
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] }
  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1],
  }
}

export function mapBackendUser(raw: unknown): LastmileUser | null {
  const source = normalizeBackendUserPayload(raw)
  const id = pickString(source, 'id')
  if (!id) return null

  const firstName = pickString(source, 'firstName', 'first_name', 'givenName', 'given_name')
  const lastName = pickString(source, 'lastName', 'last_name', 'familyName', 'family_name')
  const ad_soyad =
    [firstName, lastName].filter(Boolean).join(' ') ||
    pickString(source, 'name', 'fullName', 'full_name', 'displayName', 'display_name')

  const userType = pickString(source, 'userType', 'user_type')
  const kullanici_tipi = mapBackendUserType(userType)
  const customerId = pickNullableString(source, 'customerId', 'customer_id', 'musteriId', 'musteri_id')

  const profileRaw =
    pickField(source, 'personnelProfile', 'personnel_profile', 'personel') ?? {}
  const personel = mergePersonnel(mapPersonnelProfile(profileRaw), source)

  const roleName = pickRoleName(source)
  const bagli_kurum = pickAffiliationLabel(source)

  return {
    id,
    ad_soyad,
    email: pickString(source, 'email', 'mail'),
    telefon: pickString(source, 'phone', 'phoneNumber', 'phone_number', 'mobile', 'telefon'),
    profil_url: pickNullableString(source, 'profileImage', 'profile_image', 'avatar', 'picture'),
    kullanici_tipi,
    bagli_kurum,
    musteri_id: customerId,
    rol: roleName || '—',
    roleId: pickRoleId(source),
    userType: userType || null,
    facilityId: pickNullableString(source, 'facilityId', 'facility_id'),
    emailVerified: Boolean(pickField(source, 'emailVerified', 'email_verified')),
    durum: mapBackendUserStatus(pickField(source, 'userStatus', 'user_status', 'status')),
    son_giris: pickNullableString(source, 'lastLoginAt', 'last_login_at', 'lastLogin', 'last_login'),
    olusturma_tarihi: pickString(source, 'createdAt', 'created_at'),
    olusturan: pickNullableString(source, 'createdByName', 'created_by_name', 'createdBy', 'created_by'),
    personel,
    evraklar: mapDocuments(
      pickField(source, 'documents', 'userDocuments', 'user_documents', 'evraklar') ?? []
    ),
  }
}

export function mapSummaryToKpi(
  summary: Record<string, unknown> | null | undefined,
  items: LastmileUser[] = []
): UserListKpi {
  const root = asRecord(summary)
  const internal = items.filter((item) => item.kullanici_tipi === 'ic_ekip').length
  const customer = items.filter((item) => item.kullanici_tipi === 'musteri').length

  return {
    total: Number(root.total ?? items.length),
    active: Number(root.active ?? 0),
    suspended: Number(root.passive ?? 0),
    invited: Number(root.invited ?? 0),
    internal: internal || 0,
    customer: customer || 0,
  }
}

export function mapSummaryToStatusCounts(
  summary: Record<string, unknown> | null | undefined
): Record<UserStatusScope, number> {
  const root = asRecord(summary)
  const total = Number(root.total ?? 0)
  const active = Number(root.active ?? 0)
  const passive = Number(root.passive ?? 0)
  const invited = Number(root.invited ?? 0)

  return {
    all: total,
    aktif: active,
    pasif: passive,
    davet: invited,
    askida: 0,
  }
}

export function buildUpdateUserInput(values: {
  ad_soyad: string
  email: string
  telefon: string
  musteri_id: string | null
  personel: UserPersonnelInfo
}) {
  const { firstName, lastName } = splitFullName(values.ad_soyad)
  return {
    firstName,
    lastName,
    phone: values.telefon.trim() || undefined,
    tckn: values.personel.tckn ?? undefined,
    birthDate: values.personel.dogum_tarihi ?? undefined,
    customerId: values.musteri_id ?? undefined,
  }
}

export function buildPersonnelProfileInput(personel: UserPersonnelInfo) {
  return {
    gender: mapGenderToBackend(personel.cinsiyet),
    maritalStatus: mapMaritalStatusToBackend(personel.medeni_hal),
    bloodType: personel.kan_grubu ?? undefined,
    educationLevel: personel.egitim_durumu ?? undefined,
    employmentStartDate: personel.ise_giris_tarihi ?? undefined,
    residenceAddress: personel.ikamet_adresi ?? undefined,
    emergencyContactName: personel.acil_kisi ?? undefined,
    emergencyContactPhone: personel.acil_telefon ?? undefined,
  }
}

export function buildInviteUserInput(values: {
  ad_soyad: string
  email: string
  telefon: string
  kullanici_tipi: UserKind
  musteri_id: string | null
  roleId: string
  facilityId?: string | null
}) {
  const { firstName, lastName } = splitFullName(values.ad_soyad)
  return {
    firstName,
    lastName,
    email: values.email.trim().toLowerCase(),
    phone: values.telefon.trim() || undefined,
    userType: mapKindToBackendUserType(values.kullanici_tipi),
    roleId: values.roleId,
    customerId: values.kullanici_tipi === 'musteri' ? values.musteri_id ?? undefined : undefined,
    facilityId: values.facilityId ?? undefined,
  }
}

export function mapBackendActivity(raw: unknown): UserActivityEvent | null {
  const source = asRecord(raw)
  const id = asString(source.id)
  if (!id) return null

  return {
    id,
    kind: 'profile_update',
    title: asString(source.activity, 'Aktivite'),
    detail: asString(source.description) || undefined,
    at: asString(source.createdAt),
    actor: undefined,
    ip: asString(source.ip) || undefined,
  }
}

export function mapBackendSession(raw: unknown): UserSession | null {
  const source = asRecord(raw)
  const id = asString(source.id)
  if (!id) return null

  const client = asString(source.client, 'Bilinmeyen istemci')

  return {
    id,
    device: client,
    browser: client,
    location: '—',
    ip: asString(source.ipAddress),
    lastActiveAt: asString(source.lastAccessAt || source.startedAt),
    current: false,
  }
}

export type RoleOption = {
  id: string
  name: string
  keys: string[]
  isDefault: boolean
}

export function mapBackendRole(raw: unknown): RoleOption | null {
  const source = asRecord(raw)
  const id = asString(source.id)
  const name = asString(source.name)
  if (!id || !name) return null

  const keys = Array.isArray(source.keys)
    ? source.keys.filter((item): item is string => typeof item === 'string')
    : []

  return {
    id,
    name,
    keys,
    isDefault: Boolean(source.isDefault),
  }
}
