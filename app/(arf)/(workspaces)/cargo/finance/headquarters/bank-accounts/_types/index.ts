import type { BankAccountAuditLog } from "./bank-account-audit"
import type { BankAccountTransaction } from "./bank-account-transaction"
import type { BankAccountRecord } from "./bank-account"

export type {
  AccountType,
  BankAccountRecord,
  BankAccountStatus,
  Currency,
  IntegrationStatus,
} from "./bank-account"
export type { BankAccountAction, BankAccountAuditLog } from "./bank-account-audit"
export type { BankAccountTransaction } from "./bank-account-transaction"

export interface BankAccountDetail extends BankAccountRecord {
  transactions: BankAccountTransaction[]
  auditLogs: BankAccountAuditLog[]
}
