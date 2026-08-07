/**
 * Last Mile — Kullanıcı Listesi tipleri
 *
 * Tenant (iç ekip) ve müşteri kullanıcılarını aynı listede gösterir.
 */

export type UserKind = 'ic_ekip' | 'musteri'

export type UserAccessStatus = 'aktif' | 'pasif' | 'davet' | 'askida'

export type UserStatusScope = 'all' | UserAccessStatus

export type UserRole =
  | 'super_admin'
  | 'bolge_planlamacisi'
  | 'operasyon_yoneticisi'
  | 'musteri_depo_yoneticisi'
  | 'musteri_izleyici'
  | 'sadece_izleyici'

export type UserDocumentType =
  | 'kimlik'
  | 'ikametgah'
  | 'sozlesme'
  | 'sgk'
  | 'diploma'
  | 'adli_sicil'
  | 'saglik_raporu'
  | 'diger'

export type UserDocumentMeta = {
  id: string
  name: string
  size: number
  mimeType: string
  type: UserDocumentType
  uploadedAt: string
  uploadedBy: string
  /** Demo / client-side önizleme için data URL */
  contentUrl?: string | null
}

export type UserGender = 'kadin' | 'erkek' | 'belirtilmedi'
export type UserMaritalStatus = 'bekar' | 'evli' | 'belirtilmedi'

export type UserPersonnelInfo = {
  tckn: string | null
  dogum_tarihi: string | null
  cinsiyet: UserGender | null
  medeni_hal: UserMaritalStatus | null
  kan_grubu: string | null
  ikamet_adresi: string | null
  ise_giris_tarihi: string | null
  unvan: string | null
  acil_kisi: string | null
  acil_telefon: string | null
  egitim_durumu: string | null
}

export type LastmileUser = {
  id: string
  ad_soyad: string
  email: string
  telefon: string
  profil_url: string | null
  kullanici_tipi: UserKind
  bagli_kurum: string
  /** Müşteri kullanıcılarda müşteri kaydı id'si */
  musteri_id: string | null
  rol: UserRole | string
  roleId?: string | null
  userType?: string | null
  facilityId?: string | null
  emailVerified?: boolean
  durum: UserAccessStatus
  /** ISO datetime; davet durumunda null olabilir */
  son_giris: string | null
  /** ISO datetime */
  olusturma_tarihi: string
  olusturan: string | null
  personel: UserPersonnelInfo
  evraklar: UserDocumentMeta[]
}

export type UserListKpi = {
  total: number
  active: number
  suspended: number
  invited: number
  internal: number
  customer: number
}
