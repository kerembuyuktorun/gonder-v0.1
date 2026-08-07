import type { UserAsset } from "../../_types/user-asset"
import type { AuditLogEntry } from "../../_types/audit-log"
import type { UserDetail } from "../../_types"
import { getUserDetailById } from "../../_mock/users-mock-data"

// TODO: Remove mock when API is ready
export async function fetchUserDetail(id: string): Promise<UserDetail | undefined> {
  return getUserDetailById(id)
}

// TODO: Remove mock when API is ready
export async function fetchUserAssets(id: string): Promise<UserAsset | undefined> {
  const detail = getUserDetailById(id)
  return detail?.asset
}

// TODO: Remove mock when API is ready
export async function fetchUserAuditTrail(id: string): Promise<AuditLogEntry[]> {
  const detail = getUserDetailById(id)
  return detail?.auditLogs ?? []
}
