import type { BranchEntitlementRow, BranchEntitlementSummary } from "../_types"
import { getBranchEntitlementRows, getBranchEntitlementSummary } from "../_mock/branch-entitlement-mock-data"

// TODO: Remove mock when API is ready
export async function fetchBranchEntitlementRows(): Promise<BranchEntitlementRow[]> {
  return getBranchEntitlementRows()
}

// TODO: Remove mock when API is ready
export async function fetchBranchEntitlementSummary(): Promise<BranchEntitlementSummary> {
  return getBranchEntitlementSummary()
}
