import { mockInterlands } from "../_mock/interlands-mock-data"
import type { InterlandRecord } from "../_types"

// TODO: Remove mock when API is ready
export async function fetchInterlands(): Promise<InterlandRecord[]> {
  return mockInterlands
}
