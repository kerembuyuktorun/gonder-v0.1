import type { AccountType, BankAccountDetail, BankAccountRecord, Currency, IntegrationStatus } from "../_types"
import {
  applyStoredManualTransactionMatch,
  findIncomingTransactionsByReferenceNumber,
  findBankAccountByIban,
  getBankAccountsList,
  type MappedCustomerForSender,
  type ManualTransactionMatchPayload,
  type IncomingBankTransactionMatchCandidate,
  insertBankAccount,
  resolveMappedCustomerForSenderIban as resolveMappedCustomerInfoForSenderIban,
  resolveMappedCustomerIdForSenderIban,
  setStoredBankAccountStatus,
  updateStoredBankAccount,
} from "../_mock/bank-accounts-mock-data"

export interface UpsertBankAccountPayload {
  iban: string
  bankName: string
  branchName: string
  currency: Currency
  accountHolder: string
  label: string
  accountType: AccountType
  isOpenToAllBranches: boolean
  allowedBranchIds: string[]
  integrationStatus: IntegrationStatus
  status?: import("../_types").BankAccountStatus
}

export type { IncomingBankTransactionMatchCandidate }
export type { MappedCustomerForSender }
export type { ManualTransactionMatchPayload }

// TODO: Remove mock when API is ready
export async function fetchBankAccounts(): Promise<BankAccountRecord[]> {
  return getBankAccountsList()
}

// TODO: Remove mock when API is ready
export async function createBankAccount(payload: UpsertBankAccountPayload): Promise<BankAccountRecord> {
  const detail = insertBankAccount(payload)
  return detail
}

// TODO: Remove mock when API is ready
export async function updateBankAccount(
  id: string,
  payload: UpsertBankAccountPayload,
): Promise<BankAccountDetail | undefined> {
  return updateStoredBankAccount(id, payload)
}

// TODO: Remove mock when API is ready
export async function setBankAccountStatus(
  id: string,
  status: BankAccountRecord["status"],
): Promise<BankAccountDetail | undefined> {
  return setStoredBankAccountStatus(id, status)
}

// TODO: Remove mock when API is ready
export async function findExistingBankAccountByIban(iban: string): Promise<BankAccountRecord | undefined> {
  return findBankAccountByIban(iban)
}

// TODO: Remove mock when API is ready
export async function fetchIncomingBankTransactionsByReference(
  referenceNumber: string,
): Promise<IncomingBankTransactionMatchCandidate[]> {
  return findIncomingTransactionsByReferenceNumber(referenceNumber)
}

export async function applyManualTransactionMatch(
  payload: ManualTransactionMatchPayload,
): Promise<import("../_types").BankAccountTransaction | undefined> {
  return applyStoredManualTransactionMatch(payload)
}

export async function resolveMappedCustomerForSenderIban(senderIban?: string): Promise<string | null> {
  return resolveMappedCustomerIdForSenderIban(senderIban)
}

export async function fetchMappedCustomerForSenderIban(
  senderIban?: string,
): Promise<MappedCustomerForSender | null> {
  return resolveMappedCustomerInfoForSenderIban(senderIban)
}
