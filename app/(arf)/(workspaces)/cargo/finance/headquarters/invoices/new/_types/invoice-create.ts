export type TahsilatDurumu = "tahsil_edilecek" | "tahsil_edildi"
export type VadePreset = "same_day" | "d7" | "d14" | "d30" | "d60"
export type StokTakibi = "cikis_var" | "cikis_yok"
export type FaturaDovizi = "TRY" | "USD" | "EUR"

export interface CustomerOption {
  id: string
  name: string
  taxOffice: string
  taxNumber: string
  billingAddress: string
  customerType: "corporate" | "individual"
}

export interface TahsilatHesapOption {
  id: string
  label: string
  iban: string
  currency: FaturaDovizi
}

export interface FaturaKategoriOption {
  id: string
  label: string
}

export interface FaturaEtiketOption {
  id: string
  label: string
}

export interface IbanBilgisiOption {
  id: string
  label: string
  iban: string
}

export interface HizmetUrunOption {
  id: string
  label: string
  defaultUnit: string
  defaultPrice: number
  defaultTaxRate: number
}

export interface AcikKargoOption {
  id: string
  customerId: string
  trackingNo: string
  route: string
  amount: number
  baseAmount?: number
  pieceCount: number
  pieceList?: string
}

export interface InvoiceCreateInitData {
  customers: CustomerOption[]
  tahsilatHesaplari: TahsilatHesapOption[]
  kategoriler: FaturaKategoriOption[]
  etiketler: FaturaEtiketOption[]
  ibanBilgileri: IbanBilgisiOption[]
  hizmetUrunler: HizmetUrunOption[]
  acikKargolar: AcikKargoOption[]
  birimler: string[]
  vergiOranlari: number[]
}

export interface FaturaSatiri {
  id: string
  urunId?: string
  urunLabel?: string
  urunTipi?: "catalog" | "cargo" | "custom"
  aciklama?: string
  miktar: number
  birim: string
  birimFiyat: number
  birimFiyatKilidi?: boolean
  vergiOrani: number
  tevkifatOrani?: string
  indirimTutari?: number
  indirimTipi?: "amount" | "rate"
  otvOrani?: number
  otvTipi?: "amount" | "rate"
}

export type FaturaEkKalemTipi =
  | "subtotal_discount"
  | "withholding_20"
  | "withholding_17"
  | "withholding_15"
  | "withholding_10"
  | "withholding_5"
  | "withholding_3"
  | "vat_withholding_10_10"
  | "vat_withholding_9_10"
  | "vat_withholding_7_10"
  | "vat_withholding_5_10"
  | "vat_withholding_4_10"
  | "vat_withholding_3_10"
  | "vat_withholding_2_10"

export interface FaturaEkKalem {
  id: string
  type: FaturaEkKalemTipi
  label: string
  amount: number
}

export interface FaturaOlusturFormState {
  faturaIsmi: string
  musteriId?: string
  tahsilatDurumu: TahsilatDurumu
  tahsilTarihi?: string
  tahsilHesapId?: string
  tahsilAciklama?: string
  duzenlemeTarihi: string
  vadeTarihi?: string
  vadePreset: VadePreset
  faturaNoSeri?: string
  faturaNoSira?: string
  doviz: FaturaDovizi
  siparisNo?: string
  siparisTarihi?: string
  faturaNotu?: string
  notaBakiyeEkle: boolean
  ibanBilgisiId?: string
  stokTakibi: StokTakibi
  kategoriId?: string
  etiketIds: string[]
  satirlar: FaturaSatiri[]
  ekKalemler: FaturaEkKalem[]
}

export interface InvoiceComputedLine {
  id: string
  grossTotal: number
  discountTotal: number
  otvTotal: number
  subTotal: number
  vatTotal: number
  grandTotal: number
  tevkifatOrani?: string
  tevkifatTutari: number
}

export interface InvoiceComputedWithholdingRow {
  ratio: string
  label: string
  amount: number
}

export interface InvoiceComputedTotals {
  lineGrossTotal: number
  lineDiscountTotal: number
  lineOtvTotal: number
  lineSubTotal: number
  lineVatTotal: number
  adjustmentsTotal: number
  tevkifatTotal: number
  grandTotal: number
  lineTotals: InvoiceComputedLine[]
  withholdingRows: InvoiceComputedWithholdingRow[]
}

export interface CreateInvoiceDraftPayload {
  form: FaturaOlusturFormState
  totals: InvoiceComputedTotals
}
