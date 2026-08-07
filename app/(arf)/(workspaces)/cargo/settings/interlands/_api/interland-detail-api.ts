import { getInterlandDetailById, withDerivedCounts } from "../_mock/interlands-mock-data"
import type { InterlandDetail } from "../_types"

// TODO: Remove mock when API is ready
export async function fetchInterlandDetail(id: string): Promise<InterlandDetail | undefined> {
  const detail = getInterlandDetailById(id)
  return detail ? withDerivedCounts(detail) : undefined
}
