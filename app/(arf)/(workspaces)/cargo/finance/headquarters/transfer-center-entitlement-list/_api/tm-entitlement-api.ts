import type { TmEntitlementRow, TmEntitlementSummary } from "../_types"
import { getTmEntitlementRows, getTmEntitlementSummary } from "../_mock/tm-entitlement-mock-data"

// TODO: Remove mock when API is ready
export async function fetchTmEntitlementRows(): Promise<TmEntitlementRow[]> {
  return getTmEntitlementRows()
}

// TODO: Remove mock when API is ready
export async function fetchTmEntitlementSummary(): Promise<TmEntitlementSummary> {
  return getTmEntitlementSummary()
}
