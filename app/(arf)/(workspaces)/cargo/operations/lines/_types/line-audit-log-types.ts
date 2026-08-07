export type LineAuditAction =
  | "line_created"
  | "line_updated"
  | "line_status_changed"
  | "stop_added"
  | "stop_removed"
  | "schedule_updated"

export interface LineAuditLogEntry {
  id: string
  lineId: string
  actorName: string
  action: LineAuditAction
  description: string
  timestamp: string
  ipAddress?: string
}