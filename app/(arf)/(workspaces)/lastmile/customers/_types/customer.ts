/**
 * Last Mile — Müşteri Listesi tipleri
 */

export type CustomerStatus = 'aktif' | 'pasif'

export type CustomerStatusScope = 'all' | 'aktif' | 'pasif'

export type CustomerSector =
  | 'E-Ticaret'
  | 'Gıda'
  | 'Hazır Yemek'
  | 'Sağlık/Medikal'
  | 'Yedek Parça'
  | 'Perakende'
  | 'Teknoloji'
  | 'Diğer'

export type CustomerIntegrationType = 'API' | 'Manuel' | 'Shopify' | 'WooCommerce' | 'XML'

export type LastmileCustomer = {
  id: string
  musteri_kodu: string
  /** Resmi / fatura ünvanı */
  firma_unvani: string
  /** Arayüzlerde gösterilen kısa ad */
  marka_kisa_ad: string
  vkn: string
  vergi_dairesi: string
  durum: CustomerStatus
  sektor: CustomerSector
  entegrasyon_tipi: CustomerIntegrationType
  ana_yetkili: string
  ana_yetkili_unvan: string
  telefon: string
  email: string
  fatura_merkez_adresi: string
  /** Sipariş oluştur ile aynı varsayılan tercihler */
  bildirim_sms: boolean
  bildirim_email: boolean
  teslimat_kaniti_zorunlu: boolean
  guvenli_teslimat_otp: boolean
  tesis_sayisi: number
  merkez_depo_sayisi: number
  son_senkronizasyon: string
  bugunku_aktif_siparis: number
  gunluk_ortalama_hacim: number
  toplam_paket: number
  toplam_teslim: number
  toplam_iptal: number
  teslimat_basari_orani: number
  ortalama_gorev_suresi_dk: number
  kayit_tarihi: string
  il: string
  ilce: string
  /** BE geo UUID’leri (create/PATCH root) */
  cityId?: string
  districtId?: string
  neighbourId?: string
  mahalle?: string
}

export type CustomerListKpi = {
  todayActiveOrders: number
  avgDailyVolume: number
  avgTaskDurationMin: number
  avgSuccessRate: number
  totalFacilities: number
  totalOrders: number
  totalDelivered: number
  totalCanceled: number
}
