// TODO: Remove when API is ready
import type {
  FaturaEkKalemTipi,
  FaturaOlusturFormState,
  FaturaSatiri,
  InvoiceCreateInitData,
  VadePreset,
} from "../_types"

export const SATIR_EK_AKSIYONLARI: Array<{ id: string; label: string }> = [
  { id: "aciklama", label: "Açıklama Ekle" },
  { id: "indirim", label: "İndirim Ekle" },
  { id: "otv", label: "ÖTV Ekle" },
  { id: "tevkifat", label: "Tevkifat Ekle" },
]

export const TEVKIFAT_ORANLARI = ["10/10", "9/10", "7/10", "5/10", "4/10", "3/10", "2/10"]

export const TOPLAM_EK_AKSIYONLARI: Array<{ type: FaturaEkKalemTipi; label: string }> = [
  { type: "subtotal_discount", label: "Ara Toplam İndirimi Ekle" },
  { type: "withholding_20", label: "%20 Stopaj Uygula" },
  { type: "withholding_17", label: "%17 Stopaj Uygula" },
  { type: "withholding_15", label: "%15 Stopaj Uygula" },
  { type: "withholding_10", label: "%10 Stopaj Uygula" },
  { type: "withholding_5", label: "%5 Stopaj Uygula" },
  { type: "withholding_3", label: "%3 Stopaj Uygula" },
  { type: "vat_withholding_10_10", label: "10/10 Tevkifat Uygula" },
  { type: "vat_withholding_9_10", label: "9/10 Tevkifat Uygula" },
  { type: "vat_withholding_7_10", label: "7/10 Tevkifat Uygula" },
  { type: "vat_withholding_5_10", label: "5/10 Tevkifat Uygula" },
  { type: "vat_withholding_4_10", label: "4/10 Tevkifat Uygula" },
  { type: "vat_withholding_3_10", label: "3/10 Tevkifat Uygula" },
  { type: "vat_withholding_2_10", label: "2/10 Tevkifat Uygula" },
]

export const VADE_PRESET_OPTIONS: Array<{ id: VadePreset; label: string; days: number }> = [
  { id: "same_day", label: "Aynı Gün", days: 0 },
  { id: "d7", label: "7 Gün", days: 7 },
  { id: "d14", label: "14 Gün", days: 14 },
  { id: "d30", label: "30 Gün", days: 30 },
  { id: "d60", label: "60 Gün", days: 60 },
]

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getInvoiceCreateBaseInitData(): Omit<InvoiceCreateInitData, "customers" | "tahsilatHesaplari"> {
  return {
    kategoriler: [
      { id: "standart", label: "Standart" },
      { id: "lojistik", label: "Lojistik" },
      { id: "tevkifatli", label: "Tevkifatlı" },
    ],
    etiketler: [
      { id: "kurumsal", label: "Kurumsal" },
      { id: "hizli-tahsilat", label: "Hızlı Tahsilat" },
      { id: "ay-sonu", label: "Ay Sonu" },
    ],
    ibanBilgileri: [
      { id: "iban-1", label: "Merkez TRY Hesabı", iban: "TR33 0006 2000 1000 0000 0001 23" },
      { id: "iban-2", label: "Merkez USD Hesabı", iban: "TR98 0006 2000 1000 0000 0002 34" },
      { id: "iban-3", label: "Tahsilat EUR Hesabı", iban: "TR45 0006 2000 1000 0000 0003 45" },
    ],
    hizmetUrunler: [
      { id: "srv-kargo", label: "Kargo Hizmeti", defaultUnit: "Adet", defaultPrice: 1250, defaultTaxRate: 20 },
      { id: "srv-depolama", label: "Depolama Hizmeti", defaultUnit: "Gün", defaultPrice: 380, defaultTaxRate: 20 },
      { id: "srv-ambalaj", label: "Ambalaj Malzemesi", defaultUnit: "Koli", defaultPrice: 95, defaultTaxRate: 10 },
      { id: "srv-dagitim", label: "Dağıtım Operasyonu", defaultUnit: "Adet", defaultPrice: 540, defaultTaxRate: 20 },
    ],
    acikKargolar: [],
    birimler: ["Adet", "Koli", "Gün", "Saat", "Kg", "Palet"],
    vergiOranlari: [0, 1, 8, 10, 18, 20],
  }
}

export function createInitialLine(): FaturaSatiri {
  return {
    id: `line-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    miktar: 1,
    birim: "Adet",
    birimFiyat: 0,
    vergiOrani: 20,
  }
}

export function createInitialFormState(): FaturaOlusturFormState {
  const issueDate = todayIso()

  return {
    faturaIsmi: "",
    musteriId: undefined,
    tahsilatDurumu: "tahsil_edilecek",
    tahsilTarihi: issueDate,
    tahsilHesapId: undefined,
    tahsilAciklama: "",
    duzenlemeTarihi: issueDate,
    vadeTarihi: issueDate,
    vadePreset: "same_day",
    faturaNoSeri: "FTR",
    faturaNoSira: "",
    doviz: "TRY",
    siparisNo: "",
    siparisTarihi: "",
    faturaNotu: "",
    notaBakiyeEkle: false,
    ibanBilgisiId: undefined,
    stokTakibi: "cikis_var",
    kategoriId: "standart",
    etiketIds: [],
    satirlar: [createInitialLine()],
    ekKalemler: [],
  }
}
