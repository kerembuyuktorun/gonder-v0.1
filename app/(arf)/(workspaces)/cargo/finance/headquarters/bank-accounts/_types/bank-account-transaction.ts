import type { Currency } from "./bank-account"

export type TransactionMatchStatus = "unmatched" | "auto_matched" | "manual_matched"
export type TransactionMatchSource = "branch_transfer" | "customer_invoice" | "supplier_payment"

export interface BankAccountTransaction {
  id: string
  date: string
  description: string
  senderName?: string
  senderIban?: string
  recipientName?: string
  recipientIban?: string
  referenceNumber?: string
  amount: number
  balanceAfter: number
  direction: "credit" | "debit"
  currency: Currency
  matchStatus: TransactionMatchStatus
  matchSource?: TransactionMatchSource
  matchedEntityId?: string
  matchedEntityLabel?: string
  matchedAt?: string
  matchedBy?: string
}
