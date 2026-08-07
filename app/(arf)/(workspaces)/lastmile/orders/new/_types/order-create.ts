import type { OrderType, OrderVolumeClass, RouteType } from '../../_types/order'

/** Sipariş oluştur formunda seçilebilir tipler */
export type CreateOrderType = OrderType

/** Serbest adres (contact) tarafında muhatap tipi */
export type AddressContactKind = 'bireysel' | 'kurumsal'

export type OrderCreateStep = 1 | 2 | 3 | 4 | 5

export type MetaField = {
  id: string
  key: string
  value: string
}

export type OrderPackageItem = {
  id: string
  hacim_sinifi: OrderVolumeClass
  adet: string
  /** Birim hacim, opsiyonel */
  hacim: string
  agirlik_kg: string
}

export type OrderCreateFormState = {
  musteriId: string
  referans_no: string
  siparis_tipi: CreateOrderType | ''
  rota_tipi: RouteType | ''
  alim_tarih: string
  alim_baslangic: string
  alim_bitis: string
  teslim_tarih: string
  teslim_baslangic: string
  teslim_bitis: string
  gorev_suresi_dk: string
  oncelik_puani: string
  gereksinimler: string[]
  etiketler: string[]
  kurye_notu: string
  // Lokasyon
  alis_tesis_id: string
  alis_adres: string
  alis_full_address: string
  alis_lat: number | null
  alis_lon: number | null
  alis_place_id: string
  alis_bina_no: string
  alis_kat: string
  alis_daire_no: string
  alis_contact_tipi: AddressContactKind | ''
  alis_firma_adi: string
  alis_vkn: string
  alis_vergi_dairesi: string
  alis_tckn: string
  alis_muhatabi: string
  alis_telefon: string
  alis_adres_baslik: string
  varis_tesis_id: string
  varis_gel_al_id: string
  varis_adres: string
  varis_full_address: string
  varis_lat: number | null
  varis_lon: number | null
  varis_place_id: string
  varis_bina_no: string
  varis_kat: string
  varis_daire_no: string
  varis_contact_tipi: AddressContactKind | ''
  varis_firma_adi: string
  varis_vkn: string
  varis_vergi_dairesi: string
  varis_tckn: string
  varis_muhatabi: string
  varis_telefon: string
  varis_adres_baslik: string
  // Paket
  paketler: OrderPackageItem[]
  // Atama & güvenlik
  teslimat_kaniti_zorunlu: boolean
  bildirim_sms: boolean
  bildirim_email: boolean
  guvenli_teslimat_otp: boolean
  yakin_kuryelere_dagit: boolean
  aninda_sahaya_ilet: boolean
  aktif_rota_id: string
  // Meta
  meta_fields: MetaField[]
}

export type FacilityOption = {
  id: string
  label: string
  customerId: string
  address: string
  contactName: string
  contactPhone: string
  latitude?: number | null
  longitude?: number | null
}

/** Gel-Al nokta seçenekleri — BE kaynak yapısı henüz net değil; mock ile aynı şekil korunur */
export type GelAlOption = {
  id: string
  label: string
  address: string
  contactName: string
  contactPhone: string
  latitude?: number | null
  longitude?: number | null
}

export type CustomerOption = {
  id: string
  label: string
}

export type ActiveRouteOption = {
  id: string
  label: string
  courier: string
  distanceKm: number
  costMinutes: number
}

export type AddressSuggestion = {
  id: string
  primary: string
  secondary: string
}

export type LocationMode = 'facility' | 'address' | 'gel_al' | 'hidden'

export type OrderTypeFieldConfig = {
  alisMode: LocationMode
  varisMode: LocationMode
  showGidenPaket: boolean
  requireGorevSuresi: boolean
  requireGereksinimler: boolean
  /** BE same-day schedule: pickup window required */
  requirePickupWindow: boolean
  /** BE same-day schedule: delivery window required */
  requireDeliveryWindow: boolean
}
