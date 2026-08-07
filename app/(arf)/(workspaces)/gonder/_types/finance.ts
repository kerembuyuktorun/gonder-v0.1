/**
 * Gönder Finance Center — domain types (Dilim 1 foundation).
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
  description: string
  amount: Money
  direction: FinanceTransactionDirection
  status: PaymentStatus
  method: PaymentMethod | null
  entity: FinanceEntityRef | null
  remainingBalance: Money | null
}

export type UpcomingPayment = {
  id: string
  dueAt: string
  description: string
  amount: Money
  paidAmount: Money
  status: PaymentStatus
  method: PaymentMethod | null
  entity: FinanceEntityRef | null
}

export type FinanceInvoiceStatus = 'draft' | 'issued' | 'paid' | 'cancelled' | 'void'

export type FinanceInvoice = {
  id: string
  number: string
  issuedAt: string | null
  dueAt: string | null
  amount: Money
  status: FinanceInvoiceStatus
  entity: FinanceEntityRef | null
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
