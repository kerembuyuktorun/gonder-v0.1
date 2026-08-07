export type RoleStatus = 'active' | 'passive'
export type RoleType = 'system' | 'custom'
export type RoleStatusScope = 'all' | RoleStatus

export type PermissionType = 'read' | 'create' | 'update' | 'delete' | 'special'

export type ModuleCategory = {
  id: string
  name: string
  code: string
  order: number
}

export type PermissionDefinition = {
  id: string
  moduleCategoryId: string
  moduleName: string
  moduleCode: string
  permissionType: PermissionType
  label: string
  description?: string
}

export type RolePermissions = Record<string, boolean>

export type RoleAuditLogEntry = {
  id: string
  action: string
  description: string
  actorName: string
  actorIpAddress?: string
  timestamp: string
}

export type LastmileRole = {
  id: string
  name: string
  description?: string
  roleType: RoleType
  status: RoleStatus
  userCount: number
  createdAt: string
  createdBy?: string
  updatedAt: string
  updatedBy: string
}

export type RoleDetail = LastmileRole & {
  permissions: RolePermissions
  auditLogs?: RoleAuditLogEntry[]
}

export type RoleListKpi = {
  total: number
  active: number
  passive: number
  system: number
  custom: number
  assignedUsers: number
}

export const SYSTEM_ROLE_IDS = [
  'super_admin',
  'bolge_planlamacisi',
  'operasyon_yoneticisi',
] as const

export const ROLE_STATUS_LABELS: Record<RoleStatus, string> = {
  active: 'Aktif',
  passive: 'Pasif',
}

export const ROLE_TYPE_LABELS: Record<RoleType, string> = {
  system: 'Sistem',
  custom: 'Özel',
}
