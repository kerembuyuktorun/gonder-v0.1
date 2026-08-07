import { getBranchDetailById, mockAssignableUsers } from "../_mock/branch-detail-mock-data"
import type { BranchUser } from "../_types"

// TODO: Remove mock when API is ready
export async function fetchBranchUsers(branchId: string): Promise<BranchUser[]> {
  return getBranchDetailById(branchId)?.users ?? []
}

// TODO: Remove mock when API is ready
export async function fetchAssignableUsers(): Promise<BranchUser[]> {
  return mockAssignableUsers
}
