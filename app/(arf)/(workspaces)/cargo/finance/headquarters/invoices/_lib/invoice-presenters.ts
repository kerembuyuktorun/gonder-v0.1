import type { InvoicePayment, InvoiceRecord, InvoiceStatus } from "../_types/invoice"

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  bekliyor: "Bekliyor",
  kismi: "Kısmi Ödeme",
  odendi: "Ödendi",
  gecikti: "Gecikti",
  reddedildi: "Reddedildi",
  iade: "İade",
  iptal: "İptal",
}

export const INVOICE_STATUS_BADGE_CLASSES: Record<InvoiceStatus, string> = {
  bekliyor: "border-amber-200 bg-amber-50 text-amber-700",
  kismi: "border-blue-200 bg-blue-50 text-blue-700",
  odendi: "border-emerald-200 bg-emerald-50 text-emerald-700",
  gecikti: "border-rose-200 bg-rose-50 text-rose-700",
  reddedildi: "border-red-200 bg-red-50 text-red-700",
  iade: "border-purple-200 bg-purple-50 text-purple-700",
  iptal: "border-slate-200 bg-slate-100 text-slate-500",
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatDate(iso: string): string {
  if (!iso) return "-"

  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function formatDateTime(iso: string): string {
  if (!iso) return "-"

  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getDueStatusMeta(invoice: Pick<InvoiceRecord, "dueDate" | "status">): {
  label: string
  className: string
} {
  if (invoice.status === "odendi") {
    return {
      label: "Tahsilat Tamamlandı",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    }
  }

  if (invoice.status === "iade") {
    return {
      label: "İade Süreci Tamamlandı",
      className: "border-purple-200 bg-purple-50 text-purple-700",
    }
  }

  if (invoice.status === "reddedildi") {
    return {
      label: "Müşteri Tarafından Reddedildi",
      className: "border-red-200 bg-red-50 text-red-700",
    }
  }

  if (invoice.status === "iptal") {
    return {
      label: "Fatura İptal Edildi",
      className: "border-slate-200 bg-slate-100 text-slate-600",
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(invoice.dueDate)
  dueDate.setHours(0, 0, 0, 0)

  const diffDays = Math.round((dueDate.getTime() - today.getTime()) / 86400000)

  if (diffDays > 0) {
    return {
      label: `Vadesine ${diffDays} Gün Var`,
      className: "border-sky-200 bg-sky-50 text-sky-700",
    }
  }

  if (diffDays === 0) {
    return {
      label: "Bugün Vade",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    }
  }

  return {
    label: `${Math.abs(diffDays)} Gün Gecikti`,
    className: "border-rose-200 bg-rose-50 text-rose-700",
  }
}

export function getPaymentBankAccountLabel(payment: InvoicePayment): string {
  if (payment.bankAccountLabel?.trim()) {
    return payment.bankAccountLabel
  }

  switch (payment.channel) {
    case "eft":
      return "İş Bankası - TR12 0006 4000 0012 3456 78"
    case "havale":
      return "Ziraat Bankası - TR44 0001 0000 2222 3333 44"
    case "nakit":
      return "Nakit Tahsilat Kasası"
    case "mahsup":
      return "Genel Merkez Mahsup Hesabı"
    default:
      return "Banka Hesabı Tanımsız"
  }
}

export function getPaymentMatchType(payment: InvoicePayment): string {
  if (payment.matchType === "bank_auto") {
    return "Banka Hareketi Eşleşmesi"
  }

  if (payment.matchType === "manual") {
    return "Manuel GM Eşleşmesi"
  }

  return payment.channel === "eft" || payment.channel === "havale"
    ? "Otomatik Havuz Eşleşmesi"
    : "Manuel GM Eşleşmesi"
}

export function getCollectionStatusLabel(
  status?: "tahsil_edildi" | "beklemede" | "iptal" | "musteri_tahsil_edildi" | "gm_gonderildi",
): string {
  switch (status) {
    case "tahsil_edildi":
      return "Tahsil Edildi"
    case "musteri_tahsil_edildi":
      return "Müşteri Tahsil Etti"
    case "gm_gonderildi":
      return "GM'ye Gönderildi"
    case "iptal":
      return "İptal"
    case "beklemede":
    default:
      return "Beklemede"
  }
}