/* ------------------------------------------------------------------ */
/*  Taşıma Oluştur – Tip Tanımları                                    */
/* ------------------------------------------------------------------ */

/** 4 adımlık wizard step */
export type TransportStep = 1 | 2 | 3 | 4

/* ─── Step 1 – Operasyon Bilgileri ─── */

export interface PartyInfo {
  customerId: string | null
  addressId: string | null
}

export type FaturaKesimTipi = 'sender' | 'receiver' | 'other'

export interface OperasyonBilgileri {
  yuklemeTarihi: string
  gondericiMusteri: PartyInfo
  aliciMusteri: PartyInfo
  cikisAdresi: PartyInfo
  varisAdresi: PartyInfo
  faturaKesimYeri: FaturaKesimTipi
  faturaKesimMusteriId: string | null
}

/* ─── Step 2 – Sevk Bilgileri ─── */

export interface SevkBilgileri {
  tasimaciFirmaId: string | null
  aracPlakaId: string | null
  surucuId: string | null
}

/** Taşımacı firmaya bağlı araç kaydı */
export interface VehicleRecord {
  id: string
  carrierId: string
  plaka: string
  aracTipi: string
  kasaTipi: string
  kapasite: number // ton
}

/** Taşımacı firmaya bağlı sürücü kaydı */
export interface DriverRecord {
  id: string
  carrierId: string
  fullName: string
  phone: string
}

/* ─── Step 3 – Taşıma Seç ─── */

export type GonderiTipi = 'FTL' | 'LTL'

/** FTL – Komple Gönderi yük satırı */
export interface FtlYukSatir {
  id: string
  yukTipiId: string | null
  yukTipiLabel: string
  adet: number
  en: number          // cm
  boy: number         // cm
  genislik: number    // cm
  agirlik: number    // kg
}

/** FTL – Komple Gönderi */
export interface FtlBilgileri {
  yukler: FtlYukSatir[]
}

/** LTL – Parsiyel Gönderi satırı */
export interface LtlSatir {
  id: string
  yukTipiId: string | null
  yukTipiLabel: string
  adet: number
  en: number          // cm
  boy: number         // cm
  genislik: number    // cm
  agirlik: number     // kg
  istiflenebilir: boolean
}

export interface TasimaSecBilgileri {
  gonderiTipi: GonderiTipi
  ftl: FtlBilgileri
  ltl: LtlSatir[]
}

/* ─── Step 4 – Fiyatlandırma ─── */

export interface FiyatDetaylari {
  birimFiyat: number
  araToplam: number
  tevfikatTutari: number
  kdvTutari: number
  toplamFiyat: number
}

export interface FiyatlandirmaBilgileri {
  satisFiyat: number
  satisKdvOran: number
  satisTevfikat: boolean
  satisFiyatDetay: FiyatDetaylari

  alisFiyat: number
  alisKdvOran: number
  alisTevfikat: boolean
  alisFiyatDetay: FiyatDetaylari
}

/* ─── Tüm Wizard verisi ─── */

export interface TransportFormData {
  operasyon: OperasyonBilgileri
  sevk: SevkBilgileri
  tasimaSec: TasimaSecBilgileri
  fiyatlandirma: FiyatlandirmaBilgileri
}

/* ─── Müşteri & Adres Kayıtları ─── */

export interface CustomerRecord {
  id: string
  customerType: 'corporate' | 'individual'
  tradeName: string
  customerName: string
  taxNumber: string
  taxOffice: string
  firstName: string
  lastName: string
  email: string
  contactName: string
  phone: string
  city: string
  district: string
  neighborhood: string
  branch: string
}

export interface AddressRecord {
  id: string
  customerId: string
  label: string
  line1: string
  city: string
  district: string
  neighborhood: string
  phone: string
  contactName: string
  branch: string
}

export interface ComboboxOption {
  id: string
  label: string
  description?: string
  keywords?: string
}

/* ─── Select option tipleri ─── */

export interface SelectOption {
  value: string
  label: string
  icon?: string
}
