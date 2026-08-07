/**
 * Gönder Wallet — domain types (Dilim 1 foundation).
 */

import type { Money, PaymentMethod } from './finance'

export type WalletAccountStatus = 'active' | 'frozen' | 'closed'

export type WalletAccount = {
  id: string
  displayName: string
  status: WalletAccountStatus
  balance: Money
  currency: Money['currency']
  updatedAt: string
}

export type WalletLedgerEntryType =
  | 'top_up'
  | 'payment'
  | 'refund'
  | 'adjustment'
  | 'transfer_in'
  | 'transfer_out'

export type WalletLedgerEntry = {
  id: string
  occurredAt: string
  type: WalletLedgerEntryType
  description: string
  amount: Money
  /** Pozitif = bakiye artışı, negatif = düşüş */
  signedAmount: number
  balanceAfter: Money
  method: PaymentMethod | null
  relatedPaymentId: string | null
}

export type WalletTopUpMethod = 'card' | 'transfer'

export type WalletTopUpDraft = {
  amountTry: number | null
  method: WalletTopUpMethod | null
  note: string
}

export const EMPTY_WALLET_TOP_UP_DRAFT: WalletTopUpDraft = {
  amountTry: null,
  method: null,
  note: '',
}

export const WALLET_ACCOUNT_STATUS_LABELS: Record<WalletAccountStatus, string> = {
  active: 'Aktif',
  frozen: 'Donduruldu',
  closed: 'Kapatıldı',
}

export const WALLET_LEDGER_TYPE_LABELS: Record<WalletLedgerEntryType, string> = {
  top_up: 'Yükleme',
  payment: 'Ödeme',
  refund: 'İade',
  adjustment: 'Düzeltme',
  transfer_in: 'Gelen transfer',
  transfer_out: 'Giden transfer',
}

export const WALLET_TOP_UP_METHOD_LABELS: Record<WalletTopUpMethod, string> = {
  card: 'Kart',
  transfer: 'Havale / EFT',
}
