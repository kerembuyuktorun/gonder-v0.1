/**
 * Last Mile — Kurye Listesi tipleri
 */

export type CourierOperationalStatus = 'yolda' | 'bos_ta' | 'pasif'

export type CourierStatusScope = 'all' | CourierOperationalStatus

/** İstihdam / sözleşme tipi */
export type CourierEmploymentType = 'sirket' | 'esnaf'

export type CourierBloodType =
  | 'A Rh+'
  | 'A Rh-'
  | 'B Rh+'
  | 'B Rh-'
  | 'AB Rh+'
  | 'AB Rh-'
  | '0 Rh+'
  | '0 Rh-'

export type CourierSkill =
  | 'soguk_zincir'
  | 'hizli_teslimat'
  | 'adr'
  | 'agir_yuk'
  | 'motosiklet'
  | 'panelvan'

export type CourierDocWarningKind = 'ehliyet' | 'src' | 'saglik'

export type CourierDocWarning = {
  kind: CourierDocWarningKind
  label: string
  daysRemaining: number
}

export type CourierDocumentType = 'ehliyet' | 'src' | 'saglik' | 'diger'

export type CourierDocumentMeta = {
  id: string
  name: string
  size: number
  mimeType: string
  type: CourierDocumentType
  uploadedAt: string
  uploadedBy: string
}

export type CourierSkillOption = {
  code: string
  name: string
  vroomId?: number | null
  appliesTo?: string[]
}

export type LastmileCourier = {
  id: string
  ad_soyad: string
  telefon: string
  tckn: string | null
  kan_grubu: CourierBloodType
  eposta: string | null
  /** false ise davet gönderilmiş ama henüz kabul edilmemiş */
  davet_kabul_edildi: boolean
  durum: CourierOperationalStatus
  istihdam: CourierEmploymentType
  zimmetli_arac_id: string | null
  zimmetli_arac_plaka: string | null
  vardiya_baslangic: string
  vardiya_bitis: string
  aktif_rota_id: string | null
  aktif_rota_durak_sayisi: number | null
  aktif_rota_siparis_sayisi: number | null
  yetenekler: CourierSkill[]
  evrak_uyarilari: CourierDocWarning[]
  ehliyet_bitis: string | null
  src_bitis: string | null
  saglik_bitis: string | null
  evraklar: CourierDocumentMeta[]
  olusturan: string
  olusturulma_zamani: string
}

export type CourierListKpi = {
  total: number
  onRoad: number
  idle: number
  passive: number
  unassigned: number
  docWarnings: number
}
