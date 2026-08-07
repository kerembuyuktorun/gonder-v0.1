import type {
  UserAccessStatus,
  UserDocumentType,
  UserGender,
  UserKind,
  UserMaritalStatus,
  UserPersonnelInfo,
  UserRole,
  UserStatusScope,
  LastmileUser,
} from '../_types/user'

export const USER_KIND_LABELS: Record<UserKind, string> = {
  ic_ekip: 'Merkez',
  musteri: 'Müşteri',
}

export const USER_STATUS_LABELS: Record<UserAccessStatus, string> = {
  aktif: 'Aktif',
  pasif: 'Pasif',
  davet: 'Davet Edildi',
  askida: 'Askıda',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Süper Admin',
  bolge_planlamacisi: 'Bölge Planlamacısı',
  operasyon_yoneticisi: 'Operasyon Yöneticisi',
  musteri_depo_yoneticisi: 'Müşteri Depo Yöneticisi',
  musteri_izleyici: 'Müşteri İzleyici',
  sadece_izleyici: 'Sadece İzleyici',
}

export const USER_DOCUMENT_TYPE_LABELS: Record<UserDocumentType, string> = {
  kimlik: 'Kimlik',
  ikametgah: 'İkametgâh',
  sozlesme: 'İş Sözleşmesi',
  sgk: 'SGK / İşe Giriş',
  diploma: 'Diploma / Mezuniyet',
  adli_sicil: 'Adli Sicil',
  saglik_raporu: 'Sağlık Raporu',
  diger: 'Diğer',
}

export const USER_GENDER_LABELS: Record<UserGender, string> = {
  kadin: 'Kadın',
  erkek: 'Erkek',
  belirtilmedi: 'Belirtilmedi',
}

export const USER_MARITAL_STATUS_LABELS: Record<UserMaritalStatus, string> = {
  bekar: 'Bekâr',
  evli: 'Evli',
  belirtilmedi: 'Belirtilmedi',
}

export function createEmptyPersonnel(): UserPersonnelInfo {
  return {
    tckn: null,
    dogum_tarihi: null,
    cinsiyet: null,
    medeni_hal: null,
    kan_grubu: null,
    ikamet_adresi: null,
    ise_giris_tarihi: null,
    unvan: null,
    acil_kisi: null,
    acil_telefon: null,
    egitim_durumu: null,
  }
}

export function formatTckn(value: string | null | undefined) {
  if (!value) return null
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 11) return value
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
}

export function formatUserDate(value: string | null | undefined) {
  if (!value) return null
  const normalized = value.includes('T') ? value : `${value}T00:00:00`
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatUserDateTime(value: string | null): string {
  if (!value) return '—'
  const normalized = value.includes('T') ? value : `${value}T00:00:00`
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return value
  const hasTime = value.includes('T') || /\d{2}:\d{2}/.test(value)
  if (!hasTime) {
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type QueryInput = {
  items: LastmileUser[]
  search: string
  statusScope: UserStatusScope
  kinds: UserKind[]
  roles: string[]
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  page: number
  pageSize: number
}

export function queryUsers({
  items,
  search,
  statusScope,
  kinds,
  roles,
  sortBy,
  sortDir = 'asc',
  page,
  pageSize,
}: QueryInput) {
  const q = search.trim().toLocaleLowerCase('tr-TR')

  let filtered = items.filter((user) => {
    if (statusScope !== 'all' && user.durum !== statusScope) return false
    if (kinds.length > 0 && !kinds.includes(user.kullanici_tipi)) return false
    if (roles.length > 0 && !roles.includes(String(user.rol))) return false

    if (!q) return true

    const haystack = [
      user.ad_soyad,
      user.email,
      user.telefon,
      user.bagli_kurum,
      user.olusturan ?? '',
      USER_KIND_LABELS[user.kullanici_tipi],
      USER_ROLE_LABELS[user.rol as UserRole] ?? String(user.rol),
      USER_STATUS_LABELS[user.durum],
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
  return { items: filtered.slice(start, start + pageSize), total }
}

function sortValue(user: LastmileUser, sortBy: string): string | number {
  switch (sortBy) {
    case 'ad_soyad':
      return user.ad_soyad
    case 'iletisim':
      return user.email
    case 'kullanici_tipi':
      return user.kullanici_tipi
    case 'bagli_kurum':
    case 'baglilik':
      return user.kullanici_tipi === 'musteri' ? user.bagli_kurum : ''
    case 'rol':
      return USER_ROLE_LABELS[user.rol as UserRole] ?? String(user.rol)
    case 'durum':
      return user.durum
    case 'son_giris':
      return user.son_giris ?? ''
    case 'olusturma_tarihi':
      return user.olusturma_tarihi
    case 'olusturan':
      return user.olusturan ?? ''
    default:
      return user.ad_soyad
  }
}
