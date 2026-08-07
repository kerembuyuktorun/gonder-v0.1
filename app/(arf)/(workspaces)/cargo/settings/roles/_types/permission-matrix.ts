import type { PermissionDefinition } from "./permission"
import type { RoleRecord } from "./role"

export type RolePermissions = Record<string, boolean>

export interface RoleAuditLogEntry {
  id: string
  action: string
  description: string
  actorName: string
  actorIpAddress?: string
  timestamp: string
}

export interface RolePermissionMatrix {
  roleId: string
  permissions: Map<string, boolean>
  createdAt: string
  updatedAt: string
}

export interface RoleDetail extends RoleRecord {
  permissions: RolePermissions
  auditLogs?: RoleAuditLogEntry[]
}

export interface RolePermissionGroup {
  categoryId: string
  categoryName: string
  modules: Array<{
    moduleCode: string
    moduleName: string
    permissions: PermissionDefinition[]
  }>
}
