import { getBranchDetailById } from "../_mock/branch-detail-mock-data"
import type { BranchDetail } from "../_types"

// TODO: Remove mock when API is ready
export async function fetchBranchDetail(id: string): Promise<BranchDetail | undefined> {
  return getBranchDetailById(id)
}
