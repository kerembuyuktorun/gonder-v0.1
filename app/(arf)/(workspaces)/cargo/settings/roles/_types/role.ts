export type RoleStatus = "active" | "passive"

export type RoleType = "system" | "custom"

export interface RoleRecord {
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

export const SYSTEM_ROLE_IDS = ["superadmin", "system_admin", "hq_manager"] as const
