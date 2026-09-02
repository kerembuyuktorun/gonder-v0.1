/**
 * Gönder Finance Center — domain types.
 */

export type MoneyCurrency = 'TRY'

export type Money = {
  amount: number
  currency: MoneyCurrency
}

/** Ödeme durumu — sipariş / gönderi / yaklaşan ödeme */
export type PaymentStatus =
  | 'unpaid'
  | 'partial'
  | 'paid'
  | 'refunded'
  | 'failed'
  | 'pending'

export type PaymentMethod = 'wallet' | 'invoice' | 'card' | 'transfer'

/** Cüzdan çekimi vs açık hesap (cari) */
export type FinanceSettlementChannel = 'wallet' | 'cari'

export type FinanceInvoiceKind = 'single' | 'batch'

export type FinanceSummaryPeriod = '7d' | '30d' | '90d'

export type FinanceEntityType = 'order' | 'shipment' | 'quote' | 'invoice' | 'wallet'

export type FinanceEntityRef = {
  type: FinanceEntityType
  id: string
  label?: string | null
}

export type FinanceTransactionDirection = 'debit' | 'credit'

export type FinanceTransaction = {
  id: string
  occurredAt: string
  /** Kısa satır başlığı */
  description: string
  /** İnsan dilinde açıklama — sipariş / fatura / cüzdan vs cari */
  narrative: string
  amount: Money
  direction: FinanceTransactionDirection
  status: PaymentStatus
  method: PaymentMethod | null
  settlement: FinanceSettlementChannel | null
  entity: FinanceEntityRef | null
  order: FinanceEntityRef | null
  shipment: FinanceEntityRef | null
  invoice: FinanceEntityRef | null
  invoiceKind: FinanceInvoiceKind | null
  quote: FinanceEntityRef | null
  remainingBalance: Money | null
}

export type UpcomingPayment = {
  id: string
  dueAt: string
  description: string
  narrative: string
  amount: Money
  paidAmount: Money
  status: PaymentStatus
  method: PaymentMethod | null
  settlement: FinanceSettlementChannel | null
  entity: FinanceEntityRef | null
  order: FinanceEntityRef | null
  shipment: FinanceEntityRef | null
  invoice: FinanceEntityRef | null
  invoiceKind: FinanceInvoiceKind | null
  invoiceNumber: string | null
}

export type FinanceInvoiceStatus = 'draft' | 'issued' | 'paid' | 'cancelled' | 'void'

export type FinanceInvoice = {
  id: string
  number: string
  kind: FinanceInvoiceKind
  issuedAt: string | null
  dueAt: string | null
  amount: Money
  status: FinanceInvoiceStatus
  settlement: FinanceSettlementChannel | null
  entity: FinanceEntityRef | null
  relatedOrders: FinanceEntityRef[]
  relatedShipments: FinanceEntityRef[]
  relatedTransactionIds: string[]
  /** Stub — PDF/görüntüleme sonraki dilimde */
  documentReady: boolean
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Ödenmedi',
  partial: 'Kısmi',
  paid: 'Ödendi',
  refunded: 'İade edildi',
  failed: 'Başarısız',
  pending: 'Beklemede',
}

export const PAYMENT_STATUS_BADGE: Record<PaymentStatus, string> = {
  unpaid: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
  partial: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  paid: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  refunded: 'border-violet-500/20 bg-violet-500/10 text-violet-700',
  failed: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
  pending: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  wallet: 'Cüzdan',
  invoice: 'Fatura / vadeli',
  card: 'Kart',
  transfer: 'Havale / EFT',
}

export const FINANCE_INVOICE_STATUS_LABELS: Record<FinanceInvoiceStatus, string> = {
  draft: 'Taslak',
  issued: 'Kesildi',
  paid: 'Ödendi',
  cancelled: 'İptal',
  void: 'Geçersiz',
}

export const FINANCE_INVOICE_STATUS_BADGE: Record<FinanceInvoiceStatus, string> = {
  draft: 'border-slate-400/30 bg-slate-500/10 text-slate-700',
  issued: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  paid: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  cancelled: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
  void: 'border-slate-400/30 bg-slate-500/10 text-slate-700',
}

export const FINANCE_SETTLEMENT_LABELS: Record<FinanceSettlementChannel, string> = {
  wallet: 'Cüzdan',
  cari: 'Cari hesap',
}

export const FINANCE_INVOICE_KIND_LABELS: Record<FinanceInvoiceKind, string> = {
  single: 'Fatura',
  batch: 'Toplu fatura',
}

export const FINANCE_SUMMARY_PERIOD_LABELS: Record<FinanceSummaryPeriod, string> = {
  '7d': 'Son 7 gün',
  '30d': 'Son 30 gün',
  '90d': 'Son 3 ay',
}

export const FINANCE_SUMMARY_PERIODS: FinanceSummaryPeriod[] = ['7d', '30d', '90d']

export function formatMoneyTry(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return '—'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatMoney(money: Money | null | undefined): string {
  if (!money) return '—'
  return formatMoneyTry(money.amount)
}

export function moneyTry(amount: number): Money {
  return { amount, currency: 'TRY' }
}

export function formatFinanceDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatFinanceDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
