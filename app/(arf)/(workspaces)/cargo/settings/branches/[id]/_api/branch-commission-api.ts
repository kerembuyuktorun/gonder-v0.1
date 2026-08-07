import { getBranchDetailById } from "../_mock/branch-detail-mock-data"
import type { BranchCommissionRecord } from "../_types"

// TODO: Remove mock when API is ready
export async function fetchBranchCommissionRecords(
  branchId: string,
): Promise<BranchCommissionRecord[]> {
  return getBranchDetailById(branchId)?.commissionRecords ?? []
}
