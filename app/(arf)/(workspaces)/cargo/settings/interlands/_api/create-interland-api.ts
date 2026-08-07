import { mockInterlands } from "../_mock/interlands-mock-data"
import type { InterlandRecord, InterlandStatus } from "../_types"

interface CreateInterlandPayload {
  name: string
  branchId: string
  branchName: string
  status?: InterlandStatus
}

// TODO: Remove mock when API is ready
export async function createInterland(payload: CreateInterlandPayload): Promise<InterlandRecord> {
  const record: InterlandRecord = {
    id: `int-${Date.now()}`,
    name: payload.name,
    branchId: payload.branchId,
    branchName: payload.branchName,
    status: payload.status ?? "active",
    cityCount: 0,
    districtCount: 0,
    neighborhoodCount: 0,
    updatedAt: new Date().toISOString(),
  }

  mockInterlands.unshift(record)
  return record
}
