import type { UserRecord } from "./user"
import type { UserAsset } from "./user-asset"
import type { AuditLogEntry } from "./audit-log"

export type { UserRole, UserStatus, UserRecord, UserDocument, UserDocumentType, UserAssetDraft } from "./user"
export type { UserAsset, UserAssetAllocation, UserAssetEntry, UserAssetKind } from "./user-asset"
export type { AuditAction, AuditLogEntry } from "./audit-log"

export interface LocationOption {
  id: string
  name: string
  type: "branch" | "tm" | "hq"
  code: string
}

export interface UserDetail extends UserRecord {
  asset?: UserAsset
  auditLogs: AuditLogEntry[]
}

export const USER_ROLE_LABELS: Record<import("./user").UserRole, string> = {
  superadmin: "Süper Admin",
  hq_manager: "Genel Merkez",
  tm_manager: "TM Yöneticisi",
  branch_manager: "Şube Yöneticisisi",
  courier: "Kurye",
  operator: "Operatör",
}

export const USER_ROLE_REQUIRES_LOCATION: Record<import("./user").UserRole, boolean> = {
  superadmin: false,
  hq_manager: false,
  tm_manager: true,
  branch_manager: true,
  courier: true,
  operator: true,
}
