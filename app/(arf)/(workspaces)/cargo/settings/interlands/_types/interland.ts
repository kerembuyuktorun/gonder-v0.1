import type { InterlandAuditLog } from "./interland-audit"
import type { InterlandNote } from "./interland-note"
import type { InterlandScopeRow } from "./interland-scope"

export type InterlandStatus = "active" | "passive"

export interface InterlandRecord {
  id: string
  name: string
  branchId: string
  branchName: string
  status: InterlandStatus
  cityCount: number
  districtCount: number
  neighborhoodCount: number
  updatedAt: string
}

export interface InterlandDetail extends InterlandRecord {
  branchManagerName?: string
  branchManagerPhone?: string
  transferCenterId?: string
  transferCenterName?: string
  notes: InterlandNote[]
  auditLogs: InterlandAuditLog[]
  scopeRows: InterlandScopeRow[]
}

export interface BlockedInterlandPayload {
  name: string
  branchId: string
  branchName: string
}

export interface BlockedInterlandRecord extends BlockedInterlandPayload {
  id: string
}
