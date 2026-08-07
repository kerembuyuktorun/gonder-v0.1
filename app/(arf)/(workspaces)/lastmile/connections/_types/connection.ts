export type ConnectionContactKind = 'bireysel' | 'kurumsal'

export type ConnectionTypeScope = 'all' | ConnectionContactKind

export type LastmileConnection = {
  id: string
  musteri_id: string
  musteri_kodu: string
  musteri_adi: string
  muhatap_tipi: ConnectionContactKind
  /** Bireysel: ad soyad. Kurumsal: varış muhatabı. */
  muhatabi: string
  tckn: string | null
  firma_adi: string | null
  vkn: string | null
  vergi_dairesi: string | null
  telefon: string
  adres_baslik: string
  adres: string
  full_address: string
  bina_no: string
  kat: string
  daire_no: string
  lat: number | null
  lon: number | null
  kayit_tarihi: string
}
