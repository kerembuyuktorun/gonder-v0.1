/* ------------------------------------------------------------------ */
/*  Taşıma Detay – Tip Tanımları                                      */
/* ------------------------------------------------------------------ */

export type TasimaDetayDurum =
  | "tasima_olusturuldu"
  | "surucu_atandi"
  | "surucu_alim_adresine_gidiyor"
  | "yukleme_yapiliyor"
  | "yolda"
  | "teslimatta"
  | "teslim_edildi"
  | "iptal"

export type GonderiTipi = "FTL" | "LTL"

/* ─── Genel Bilgiler ─── */

export type MusteriTipi = "corporate" | "individual"

export interface MusteriDetay {
  customerId?: string
  customerType: MusteriTipi
  displayName: string
  companyName?: string
  contactName: string
  taxNumber?: string
  taxOffice?: string
  tcIdentityNumber?: string
  phone: string
  email?: string
  branch: string
  city: string
  district: string
  neighborhood: string
  fullAddress: string
}

export interface TedarikciDetay {
  supplierId?: string
  firmaAdi: string
  sehir?: string
  yetkili?: string
  unvan?: string
  telefon?: string
  email?: string
  /* Araç Bilgileri */
  aracPlaka?: string
  aracTipi?: string
  kasaTipi?: string
  maxAgirlikKapasitesi?: number
  maxHacimKapasitesi?: number
  /* Sürücü Bilgileri */
  surucuAd?: string
  surucuSoyad?: string
  surucuTelefon?: string
}

export interface PersonelDetay {
  userId?: string
  adSoyad: string
  rol: string
  telefon: string
  email?: string
}

/* ─── Taşıma Durumu ─── */

export interface TasimaDurumAdim {
  adimNo: number
  baslik: string
  aciklama: string
  tamamlandi: boolean
  aktif: boolean
  zaman?: string
}

/* ─── FTL / LTL ─── */

export interface FtlOperasyonBilgisi {
  tarih: string
  gondericiMusteri: string
  aliciMusteri: string
  cikisAdresi: string
  varisAdresi: string
}

export interface YukDetaySatiri {
  id: string
  yukTipi: string
  adet: number
  en: number        // cm
  boy: number       // cm
  genislik: number  // cm
  agirlik: number   // kg
}

/* ─── Fiyatlandırma ─── */

export interface FiyatDetay {
  birimFiyat: number
  araToplam: number
  tevfikatTutari: number
  ekHizmetTutari: number
  kdvTutari: number
  toplamFiyat: number
}

export interface FiyatlandirmaBilgisi {
  satisFiyat: number
  satisKdvOran: number
  satisFiyatDetay: FiyatDetay
  alisFiyat: number
  alisKdvOran: number
  alisFiyatDetay: FiyatDetay
  ozet: {
    birimFiyat: number
    araToplam: number
    tevfikatTutari: number
  }
}

/* ─── Finans & Muhasebe ─── */

export type GelirGiderDurum = "tahsil_edildi" | "odendi" | "bekliyor" | "gecikti"
export type GelirFaturaDurumu = "olusturuldu" | "olusturulmadi"
export type GiderFaturaDurumu = "eslestirildi" | "eslestirilmedi"

export interface GelirKalemi {
  id: string
  aciklama: string
  musteri: string
  tarih: string
  birimFiyat: number
  tevkifat: string
  tevfikatTutar: number
  kdvOran: number
  kdvTutar: number
  toplamTutar: number
  faturaDurumu: GelirFaturaDurumu
  tahsilatDurumu: GelirGiderDurum
}

export interface GiderKalemi {
  id: string
  aciklama: string
  tedarikci: string
  tarih: string
  birimFiyat: number
  tevkifat: string           // "2/10" | "yok" vb.
  tevfikatTutar: number
  kdvOran: number
  kdvTutar: number
  toplamTutar: number
  faturaDurumu: GiderFaturaDurumu
  odemeDurumu: GelirGiderDurum
}

export type FaturaTipi = "satis" | "alis" | "tedarikci"
export type FaturaDurum = "bekliyor" | "kismi" | "odendi" | "gecikti" | "iptal"

export interface TasimaFatura {
  id: string
  faturaTipi: FaturaTipi
  faturaIsmi: string
  faturaNo: string
  kesimTarihi: string
  vadeTarihi: string
  mulesteri: string         // müşteri veya tedarikçi adı
  matrah: number
  tevkifat: number
  kdvTutar: number
  toplamTutar: number
  odenenTutar: number
  kalanTutar: number
  kategori: string
  etiketler: string[]
  durum: FaturaDurum
}

/* ─── Teklifler ─── */

export type TeklifSonuc = "beklemede" | "kabul_edildi" | "reddedildi"

export interface TeklifKalem {
  id: string
  musteri: string
  oncekiTeklif: number
  yeniTeklif: number
  sonuc: TeklifSonuc
}

/* ─── Ana Detay Kayıt ─── */

export interface TasimaDetayRecord {
  tasimaNo: string
  tarih: string
  rota: string
  olusturan: string
  gondericiLokasyon: string // "Adem ÇORUM"
  gondericiSube: string // "Adana V Şube"
  gonderiTipi: GonderiTipi
  aracTipi: string // "10 Teker Kamyon"
  surucuAdi: string
  aracPlaka: string
  durum: TasimaDetayDurum
  durumLabel: string

  // Genel Bilgiler
  gondericiMusteri: MusteriDetay
  aliciMusteri: MusteriDetay
  tedarikci: TedarikciDetay
  operasyonSorumlusu: PersonelDetay
  satisSorumlusu: PersonelDetay

  // Taşıma Durumu
  mevcutAdim: number
  toplamAdim: number
  adimlar: TasimaDurumAdim[]

  // FTL / LTL bilgisi
  ftlOperasyon?: FtlOperasyonBilgisi
  yukler: YukDetaySatiri[]

  // Fiyatlandırma
  fiyatlandirma: FiyatlandirmaBilgisi

  // Finans & Muhasebe
  gelirler: GelirKalemi[]
  giderler: GiderKalemi[]
  faturalar: TasimaFatura[]

  // Teklifler
  musteriTeklifler: TeklifKalem[]
  tasimaTeklifler: TeklifKalem[]
}
