/**
 * Last Mile — Araç Listesi tipleri
 */

export type VehicleOperationalStatus = 'yolda' | 'bos_ta' | 'pasif'

export type VehicleStatusScope = 'all' | VehicleOperationalStatus

/** Rotalama profil tipi */
export type VehicleClass = 'motosiklet' | 'minivan' | 'panelvan' | 'kamyonet'

/** Kasa / gövde özelliği (motosiklette yok) */
export type VehicleBodyType = 'kapali_kasa' | 'acik_kasa' | 'frigo'

export type VehicleOwnership = 'oz_mal' | 'kiralik' | 'esnaf_kurye'

export type VehicleStartStrategy = 'ilk_gorev' | 'sabit_park'

export type VehicleSkill = string

export type VehicleSkillOption = {
  code: string
  name: string
  vroomId?: number | null
  appliesTo?: string[]
}

export type VehicleDocWarningKind = 'trafik_sigortasi' | 'kasko' | 'muayene'

export type VehicleDocWarning = {
  kind: VehicleDocWarningKind
  label: string
  /** Negatif = geçmiş, 0 = bugün, pozitif = kalan gün */
  daysRemaining: number
}

export type VehicleDocumentType =
  | 'ruhsat'
  | 'trafik_sigortasi'
  | 'kasko'
  | 'muayene'
  | 'diger'

export type VehicleDocumentMeta = {
  id: string
  name: string
  size: number
  mimeType: string
  type: VehicleDocumentType
  uploadedAt: string
  uploadedBy: string
}

export type LastmileVehicle = {
  id: string
  plaka: string
  durum: VehicleOperationalStatus
  arac_tipi: VehicleClass
  kasa_tipi: VehicleBodyType | null
  marka: string
  model: string
  model_yili: number
  zimmetli_surucu_id: string | null
  zimmetli_surucu: string | null
  hizmet_bolgesi: string
  vardiya_baslangic: string
  vardiya_bitis: string
  baslangic_stratejisi: VehicleStartStrategy
  park_konumu: string | null
  park_lat: number | null
  park_lng: number | null
  doluluk_hacim_pct: number
  doluluk_agirlik_pct: number
  yetenekler: VehicleSkill[]
  evrak_uyarilari: VehicleDocWarning[]
  mulkiyet: VehicleOwnership
  max_hacim_m3: number
  max_agirlik_kg: number
  kasko_police_no: string | null
  trafik_sigortasi_bitis: string | null
  kasko_bitis: string | null
  muayene_bitis: string | null
  evraklar: VehicleDocumentMeta[]
  olusturan: string
  olusturulma_zamani: string
  /** Aktif rota ataması varsa rota kimliği */
  aktif_rota_id: string | null
  /** Görüntüleme etiketi (ör. RT-4092) */
  aktif_rota_label: string | null
  aktif_rota_durak_sayisi: number | null
  aktif_rota_siparis_sayisi: number | null
}

export type VehicleListKpi = {
  total: number
  onRoad: number
  idle: number
  passive: number
  criticalOccupancy: number
  docWarnings: number
}
