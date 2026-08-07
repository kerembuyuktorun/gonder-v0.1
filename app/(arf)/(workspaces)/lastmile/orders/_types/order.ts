/**
 * Last Mile — Sipariş Listesi tipleri
 */

export type OrderType =
  | 'dagitim'
  | 'toplama'
  | 'iade'
  | 'transfer'
  | 'degisim'
  | 'gel_al'
  | 'kurulumlu_teslimat'

export type OrderStatus =
  | 'atama_bekliyor'
  | 'planlandi'
  | 'yolda'
  | 'teslim_edildi'
  | 'iptal_edildi'

/** Sipariş tipi kapsamı — tek seçim */
export type OrderTypeScope = 'all' | 'dagitim' | 'toplama' | 'iade' | 'transfer' | 'degisim'

/** Durum kapsamı — çoklu seçim (tip ile birleştirilebilir) */
export type OrderStatusScope = 'iptal' | 'atanmayan'

export type OrderListScope = {
  typeScope: OrderTypeScope
  statusScopes: OrderStatusScope[]
}

export type OrderVolumeClass = 'S' | 'M' | 'L' | 'XL'

export type RouteType = 'Standart Rota' | 'Ekspres Rota' | 'Toplama Ringi'

export type LastmileOrder = {
  id: string
  takip_no: string
  referans_no: string
  siparis_tipi: OrderType
  durum: OrderStatus
  /** BE aggregatedStatusLabel — badge metni için tercih edilir */
  durum_etiketi: string | null
  /** BE isRouteAssigned — rota ataması var mı */
  rota_atandi: boolean
  /** BE routeCode (örn. RT-0002) */
  rota_kodu: string | null
  /** Geriye uyum / arama; alım + teslim özeti */
  zaman_penceresi: string
  alim_zaman_penceresi: string
  teslim_zaman_penceresi: string
  eta: string
  eta_kalan_dk: number | null
  /** Alım tamamlandıysa ETA (teslimat süresi) anlamlıdır */
  eta_alim_yapildi: boolean
  gorev_suresi_dk: number
  oncelik_puani: number
  gereksinimler: string[]
  musteri: string
  /** BE müşteri id (sender/receiver customer snapshot) — liste filtreleri için */
  musteri_id: string | null
  alis_noktasi: string
  /** Açık adres — liste/rota detayında gösterim */
  alis_acik_adres: string
  alis_muhatabi: string
  alis_telefon: string
  varis_noktasi: string
  varis_acik_adres: string
  varis_muhatabi: string
  varis_telefon: string
  mesafe_m: number
  hacim_sinifi: OrderVolumeClass
  /** Liste gösterimi: farklı sizeClass satırları (örn. M + XL) */
  paket_satirlari?: Array<{ size: OrderVolumeClass; adet: number }>
  paket_sayisi: number
  toplam_hacim: number
  agirlik_kg: number
  giden_paket: number | null
  donen_paket: number | null
  rota_tipi: RouteType
  atanan_arac: string | null
  atanan_kurye: string | null
  etiketler: string[]
  olusturulma_zamani: string
  olusturan: string
  bolge: string
}
