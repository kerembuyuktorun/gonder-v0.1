import type { TransferFormStatus } from "../_types"
import type { KtfAuditAction } from "../_types/ktf-audit-types"
import type { CargoStatus, CargoType, ItemStatus, PaymentType } from "../[ktfId]/_types/detail"

export const KTF_STATUS_LABELS: Record<TransferFormStatus, string> = {
  OPEN: "Açık",
  CLOSED: "Kapalı",
}

export const KTF_STATUS_CLASSES: Record<TransferFormStatus, string> = {
  OPEN: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CLOSED: "border-rose-200 bg-rose-50 text-rose-700",
}

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  NAKİT: "Nakit",
  KART: "Kart",
  HAVALE: "Havale",
  ÖDEMESİZ: "Ödemesiz",
}

export const PAYMENT_TYPE_CLASSES: Record<PaymentType, string> = {
  NAKİT: "border-emerald-200 bg-emerald-50 text-emerald-700",
  KART: "border-blue-200 bg-blue-50 text-blue-700",
  HAVALE: "border-violet-200 bg-violet-50 text-violet-700",
  ÖDEMESİZ: "border-slate-200 bg-slate-100 text-slate-600",
}

export const CARGO_STATUS_LABELS: Record<CargoStatus, string> = {
  TESLİMATI_YAPILMADI: "Teslimatı Yapılmadı",
  KISMI: "Kısmen",
  TESLİM_EDİLDİ: "Teslim Edildi",
  İADE: "İade",
  İPTAL: "İptal",
}

export const CARGO_STATUS_CLASSES: Record<CargoStatus, string> = {
  TESLİMATI_YAPILMADI: "border-amber-200 bg-amber-50 text-amber-700",
  KISMI: "border-blue-200 bg-blue-50 text-blue-700",
  TESLİM_EDİLDİ: "border-emerald-200 bg-emerald-50 text-emerald-700",
  İADE: "border-violet-200 bg-violet-50 text-violet-700",
  İPTAL: "border-rose-200 bg-rose-50 text-rose-700",
}

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  BEKLEMEDE: "Beklemede",
  YOLDA: "Yolda",
  TESLİM_NOKTASINDA: "Teslim Noktasında",
  TESLİM_EDİLDİ: "Teslim Edildi",
  GERİ_DÖNDÜ: "Geri Döndü",
}

export const ITEM_STATUS_CLASSES: Record<ItemStatus, string> = {
  BEKLEMEDE: "border-slate-200 bg-slate-100 text-slate-700",
  YOLDA: "border-blue-200 bg-blue-50 text-blue-700",
  TESLİM_NOKTASINDA: "border-cyan-200 bg-cyan-50 text-cyan-700",
  TESLİM_EDİLDİ: "border-emerald-200 bg-emerald-50 text-emerald-700",
  GERİ_DÖNDÜ: "border-rose-200 bg-rose-50 text-rose-700",
}

export const CARGO_TYPE_LABELS: Record<CargoType, string> = {
  STANDART: "Standart",
  KOLİ: "Koli",
  SOĞUK_ZİNCİR: "Soğuk Zincir",
  KURU_TEMİZLEME: "Kuru Temizleme",
}

export function formatDateTime(value?: string | null) {
  if (!value) return "-"
  return new Date(value).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatNumber(value: number) {
  if (value == null || Number.isNaN(value)) return "0"
  return new Intl.NumberFormat("tr-TR").format(value)
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value)
}

export const KTF_AUDIT_ACTION_LABELS: Record<KtfAuditAction, string> = {
  ktf_created: "KTF Oluşturuldu",
  consignment_added: "Zimmet Eklendi",
  consignment_removed: "Zimmet Çıkarıldı",
  ktf_closed: "KTF Kapatıldı",
  barcode_scanned: "Barkod Tarandı",
  document_printed: "Belge Yazdırıldı",
}

export const KTF_AUDIT_ACTION_CLASSES: Partial<Record<KtfAuditAction, string>> = {
  ktf_created: "border-slate-200 bg-slate-100 text-slate-700",
  consignment_added: "border-emerald-200 bg-emerald-50 text-emerald-700",
  consignment_removed: "border-rose-200 bg-rose-50 text-rose-700",
  ktf_closed: "border-amber-200 bg-amber-50 text-amber-700",
  barcode_scanned: "border-blue-200 bg-blue-50 text-blue-700",
  document_printed: "border-violet-200 bg-violet-50 text-violet-700",
}
