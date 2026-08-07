import type { BankAccountDetail } from "../../_types"
import { getBankAccountDetailById } from "../../_mock/bank-accounts-mock-data"

// TODO: Remove mock when API is ready
export async function fetchBankAccountDetail(id: string): Promise<BankAccountDetail | undefined> {
  return getBankAccountDetailById(id)
}
