export type BankAccountAction =
  | "create"
  | "edit"
  | "status_change"
  | "integration_toggle"
  | "branch_scope_update"

export interface BankAccountAuditLog {
  id: string
  bankAccountId: string
  action: BankAccountAction
  actor: string
  actorName: string
  timestamp: string
  previousValue?: string
  newValue?: string
}
