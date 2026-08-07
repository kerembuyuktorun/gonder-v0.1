export type KtfAuditAction =
  | "ktf_created"
  | "consignment_added"
  | "consignment_removed"
  | "ktf_closed"
  | "barcode_scanned"
  | "document_printed"

export interface KtfAuditLogEntry {
  id: string
  ktfId: string
  action: KtfAuditAction
  description: string
  actorName: string
  timestamp: string
  ipAddress?: string
}
