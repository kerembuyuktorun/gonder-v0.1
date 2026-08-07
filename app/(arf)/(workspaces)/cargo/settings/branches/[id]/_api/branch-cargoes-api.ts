import { mockBranchCargoes } from "../_mock/branch-detail-mock-data"
import type { BranchCargoRecord } from "../_types"

// TODO: Remove mock when API is ready
export async function fetchBranchCargoes(branchId: string): Promise<BranchCargoRecord[]> {
  return mockBranchCargoes.filter(
    (cargo) => cargo.gondericiSubeId === branchId || cargo.aliciSubeId === branchId,
  )
}
