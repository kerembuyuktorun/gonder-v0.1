import type { PlannedOperation, SupplierType, TripAuditAction, TripLegStatus, TripStatus } from "../_types"

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  created: "Başladı",
  on_road: "Devam Ediyor",
  completed: "Bitti",
  cancelled: "İptal Edildi",
}

export const TRIP_STATUS_CLASSES: Record<TripStatus, string> = {
  created: "border-slate-200 bg-slate-100 text-slate-700",
  on_road: "border-blue-200 bg-blue-50 text-blue-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
}

export const SUPPLIER_TYPE_LABELS: Record<SupplierType, string> = {
  company: "Şirket",
  warehouse: "Ambar",
  truck_owner: "Kamyon Sahibi",
  logistics: "Lojistik",
}

export const LINE_TYPE_LABELS = {
  main: "Ana Hat",
  hub: "Merkez Hat",
  feeder: "Ara Hat",
} as const

export const TRIP_LEG_STATUS_LABELS: Record<TripLegStatus, string> = {
  pending: "Oluşturuldu",
  in_progress: "Yolda",
  done: "Bitti",
}

export const TRIP_LEG_STATUS_CLASSES: Record<TripLegStatus, string> = {
  pending: "bg-slate-200",
  in_progress: "bg-blue-500",
  done: "bg-emerald-500",
}

export const PLANNED_OPERATION_LABELS: Record<PlannedOperation, string> = {
  pickup_only: "Yükleme",
  dropoff_only: "İndirme",
  pickup_dropoff: "Yükleme + İndirme",
}

export const TRIP_AUDIT_ACTION_LABELS: Record<TripAuditAction, string> = {
  trip_created: "Sefer Oluşturuldu",
  trip_status_changed: "Sefer Statüsü Güncellendi",
  leg_departed: "Ayak Hareketi",
  manifest_loaded: "Kargo Yüklendi",
  manifest_unloaded: "Kargo İndirildi",
  document_printed: "Belge Üretildi",
}

export const TRIP_AUDIT_ACTION_CLASSES: Partial<Record<TripAuditAction, string>> = {
  trip_created: "border-slate-200 bg-slate-100 text-slate-700",
  trip_status_changed: "border-amber-200 bg-amber-50 text-amber-700",
  leg_departed: "border-blue-200 bg-blue-50 text-blue-700",
  manifest_loaded: "border-emerald-200 bg-emerald-50 text-emerald-700",
  manifest_unloaded: "border-cyan-200 bg-cyan-50 text-cyan-700",
  document_printed: "border-violet-200 bg-violet-50 text-violet-700",
}

export function formatDateTime(value?: string) {
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
  return new Intl.NumberFormat("tr-TR").format(value)
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value)
}