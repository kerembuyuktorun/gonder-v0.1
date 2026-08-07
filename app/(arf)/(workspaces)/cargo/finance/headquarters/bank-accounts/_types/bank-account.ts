export type BankAccountStatus = "active" | "closed"
export type IntegrationStatus = "active" | "passive"
export type AccountType = "collection" | "expense"
export type Currency = "TRY" | "USD" | "EUR"

export interface BankAccountRecord {
  id: string
  iban: string
  bankCode: string
  bankName: string
  branchName: string
  currency: Currency
  balance: number
  accountHolder: string
  label: string
  accountType: AccountType
  isOpenToAllBranches: boolean
  allowedBranchIds: string[]
  allowedBranchNames: string[]
  integrationStatus: IntegrationStatus
  status: BankAccountStatus
  createdAt: string
  updatedAt: string
  lastDataSyncAt?: string
  createdBy: string
  createdByName: string
}
