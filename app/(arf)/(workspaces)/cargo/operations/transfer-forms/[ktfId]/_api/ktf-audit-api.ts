import type { KtfAuditLogEntry } from "../../_types/ktf-audit-types"
import { mockKtfAuditByKtfId } from "../../_mock/ktf-audit-mock-data"

export async function fetchKtfAudit(ktfId: string): Promise<KtfAuditLogEntry[]> {
  return mockKtfAuditByKtfId[ktfId] ?? []
}
