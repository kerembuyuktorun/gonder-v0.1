export type InterlandAuditActionType =
  | "scope_add"
  | "scope_update"
  | "scope_delete"
  | "status_change"
  | "edit"

export interface InterlandAuditLog {
  id: string
  createdAt: string
  actionType: InterlandAuditActionType
  oldValue?: string
  newValue?: string
  actorId: string
  actorName: string
}
