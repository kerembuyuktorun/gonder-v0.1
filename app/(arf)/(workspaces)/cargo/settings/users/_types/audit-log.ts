export type AuditAction =
  | "login"
  | "logout"
  | "shipment_status_updated"
  | "shipment_created"
  | "user_created"
  | "user_modified"
  | "user_suspended"
  | "password_changed"
  | "role_changed"

export interface AuditLogEntry {
  id: string
  userId: string
  actorName?: string
  action: AuditAction
  resourceType: "shipment" | "user" | "system" | "finance"
  resourceId?: string
  description: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
}
