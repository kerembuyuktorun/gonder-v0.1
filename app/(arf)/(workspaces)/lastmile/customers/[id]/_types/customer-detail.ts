import type { LastmileCustomer } from '../../_types/customer'

export type OperationScopeRow = {
  id: string
  il: string
  ilce: string
  /** Seçili mahalleler; tum_mahalleler true ise boş kalabilir */
  mahalleler: string[]
  tum_mahalleler: boolean
}

export type CustomerAddress = {
  id: string
  baslik: string
  adres: string
  bina_no: string
  kat_no: string
  daire_no: string
  muhatap_ad_soyad: string
  muhatap_telefon: string
  aktif: boolean
  /** Operasyon bölgesi (il-ilçe-mahalle) tanımlandı mı */
  operasyon_bolgesi_tanimli: boolean
  /** Bu adresten alım sonrası teslim edilebilecek mahalleler */
  giden_teslimat_scopes: OperationScopeRow[]
  /** Başka noktalardan alınıp bu adrese/operasyonuna teslim edilebilecek mahalleler */
  gelen_teslimat_scopes: OperationScopeRow[]
  lat: number
  lng: number
}

/** @deprecated Use CustomerAddress */
export type CustomerFacility = CustomerAddress

export type CustomerApiCredentials = {
  api_key: string
  secret_key: string
  olusturulma: string
}

export type CustomerDetailOrder = {
  id: string
  takip_no: string
  siparis_tipi: string
  durum: string
  alis_noktasi: string
  varis_noktasi: string
  olusturulma: string
}

export type CustomerDetail = LastmileCustomer & {
  addresses: CustomerAddress[]
  api: CustomerApiCredentials
  orders: CustomerDetailOrder[]
}

export type CustomerDetailTab =
  | 'overview'
  | 'facilities'
  | 'orders'
  | 'pricing'
  | 'integrations'
