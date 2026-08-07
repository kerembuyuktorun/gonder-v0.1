import type { InterlandAuditLog } from "../../_types"

// TODO: Remove mock when API is ready
export async function addInterlandAuditLog(
  logs: InterlandAuditLog[],
  payload: Omit<InterlandAuditLog, "id" | "createdAt">,
): Promise<InterlandAuditLog[]> {
  return [
    {
      ...payload,
      id: `audit-${Date.now()}`,
      createdAt: new Date().toISOString(),
    },
    ...logs,
  ]
}
