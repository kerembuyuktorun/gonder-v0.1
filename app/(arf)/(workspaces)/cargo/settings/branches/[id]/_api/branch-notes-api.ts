import { getBranchDetailById } from "../_mock/branch-detail-mock-data"
import type { BranchNote } from "../_types"

// TODO: Remove mock when API is ready
export async function fetchBranchNotes(branchId: string): Promise<BranchNote[]> {
  return getBranchDetailById(branchId)?.notes ?? []
}
