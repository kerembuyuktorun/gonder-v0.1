import type { CustomerShipmentRecord } from "../../_data/customers"

/** Fatura/ekstre satırı durum enum'ı */
export type InvoicePaymentStatus = "odendi" | "bekliyor" | "kismi" | "gecikti" | "reddedildi" | "iade" | "iptal"

/** Genişletilmiş tahsilat durumu (sözleşmesiz müşteriler için) */
export type ExtendedCollectionStatus =
  | "musteri_tahsil_edildi"
  | "bekliyor"
  | "gm_gonderildi"

/** Ekstre işlem tipi */
export type ExstreTransactionType = "fatura" | "gelen_odeme"

/** Eşleştirme durumu */
export type TransactionMatchStatus = "unmatched" | "auto_matched" | "manual_matched"
export type TransactionMatchSource = "branch_transfer" | "customer_invoice" | "supplier_payment"

/** Açık Kargo satırı – mevcut CustomerShipmentRecord'dan türetilir */
export type OpenCargoRecord = CustomerShipmentRecord

/** Fatura/Ödeme ekstre kaydı – birleşik liste */
export interface FinancialExstreRecord {
  id: string
  type: ExstreTransactionType
  invoiceId?: string

  /* --- Ortak alanlar (her iki tip için) --- */
  invoiceNo: string
  description: string
  amount: number
  remainingBalance: number
  status: InvoicePaymentStatus
  createdAt: string

  /* --- Fatura'ya özel alanlar --- */
  invoiceName?: string
  customerName?: string
  issueDate?: string
  dueDate?: string
  subTotal?: number
  vatTotal?: number
  grandTotal?: number
  paidTotal?: number
  categoryLabel?: string
  tagLabels?: string[]
  relatedCargoCount?: number

  /* --- Tahsilat (banka hareketi) özel alanlar --- */
  senderName?: string
  senderIban?: string
  recipientName?: string
  recipientIban?: string
  referenceNumber?: string
  direction?: "credit" | "debit"
  matchStatus?: TransactionMatchStatus
  matchSource?: TransactionMatchSource
  matchedEntityLabel?: string
}

/** Finansal KPI verileri */
export interface FinancialKpi {
  openCargoAmount: number
  pendingInvoiceDebt: number
  overdueDebt: number
  lastCollectionDate: string
  lastCollectionAmount: number
  totalTransportCount: number
}

export interface InvoiceCustomerInfo {
  customerId: string
  customerType: "corporate" | "individual"
  tradeName: string
  taxOffice: string
  taxNumber: string
}

export interface CreateInvoicePayload {
  invoiceName: string
  issueDate: string
  dueDate: string
  note: string
  subTotal: number
  vatTotal: number
  grandTotal: number
}
