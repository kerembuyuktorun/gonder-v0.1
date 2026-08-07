import { blockedInterlandStore } from "../_mock/interlands-mock-data"
import type { BlockedInterlandPayload, BlockedInterlandRecord } from "../_types"

// TODO: Remove mock when API is ready
export async function createBlockedInterland(payload: BlockedInterlandPayload): Promise<BlockedInterlandRecord> {
  const id = `blocked-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const created: BlockedInterlandRecord = {
    id,
    ...payload,
  }

  blockedInterlandStore.unshift(created)
  return created
}
