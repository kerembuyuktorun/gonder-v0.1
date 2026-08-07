import type {
  ModuleCategory,
  PermissionDefinition,
  RoleDetail,
  RolePermissions,
  RoleRecord,
  RoleStatus,
} from "../_types"
import { getStoredRoleById } from "../_mock/roles-mock-data"
import {
  copyStoredRole,
  deleteStoredRole,
  getStoredRoles,
  insertStoredRole,
  setStoredRolePermissions,
  setStoredRoleStatus,
  updateStoredRole,
} from "../_mock/roles-mock-data"
import { mockModuleCategories } from "../_mock/module-categories-mock-data"
import { mockPermissionDefinitions } from "../_mock/permissions-mock-data"

const latency = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms))

export interface FetchRolesFilters {
  q?: string
  status?: RoleStatus | "all"
  type?: "system" | "custom" | "all"
}

export interface CreateRolePayload {
  name: string
  description?: string
  sourceRoleId?: string
  permissions?: RolePermissions
}

export interface UpdateRolePayload {
  name?: string
  description?: string
  status?: RoleStatus
  permissions?: RolePermissions
}

export async function fetchRoles(filters: FetchRolesFilters = {}): Promise<RoleRecord[]> {
  await latency()
  const q = (filters.q ?? "").trim().toLocaleLowerCase("tr-TR")

  return getStoredRoles()
    .filter((role) => {
      if (filters.status && filters.status !== "all" && role.status !== filters.status) return false
      if (filters.type && filters.type !== "all" && role.roleType !== filters.type) return false
      if (!q) return true
      return `${role.name} ${role.description ?? ""}`.toLocaleLowerCase("tr-TR").includes(q)
    })
    .sort((a, b) => b.userCount - a.userCount)
}

export async function fetchRoleDetail(id: string): Promise<RoleDetail | undefined> {
  await latency(120)
  return getStoredRoleById(id)
}

export async function createRole(payload: CreateRolePayload): Promise<RoleDetail> {
  await latency(180)
  return insertStoredRole({
    name: payload.name,
    description: payload.description,
    sourceRoleId: payload.sourceRoleId,
    permissions: payload.permissions,
    updatedBy: "UI Operator",
  })
}

export async function updateRole(id: string, payload: UpdateRolePayload): Promise<RoleDetail | undefined> {
  await latency(180)
  const updated = updateStoredRole(id, {
    name: payload.name,
    description: payload.description,
    status: payload.status,
    updatedBy: "UI Operator",
  })
  if (!updated) return undefined

  if (payload.permissions) {
    return setStoredRolePermissions(id, payload.permissions)
  }

  return {
    ...updated,
    permissions: fetchRolePermissions(id),
  }
}

export async function suspendRole(id: string): Promise<RoleRecord | undefined> {
  await latency(140)
  return setStoredRoleStatus(id, "passive", "UI Operator")
}

export async function activateRole(id: string): Promise<RoleRecord | undefined> {
  await latency(140)
  return setStoredRoleStatus(id, "active", "UI Operator")
}

export async function deleteRole(id: string): Promise<{ ok: boolean; reason?: string }> {
  await latency(140)
  return deleteStoredRole(id)
}

export async function copyRole(sourceRoleId: string, newRoleName: string): Promise<RoleDetail | undefined> {
  await latency(180)
  return copyStoredRole(sourceRoleId, newRoleName, "UI Operator")
}

export async function fetchPermissionDefinitions(): Promise<PermissionDefinition[]> {
  await latency(100)
  return [...mockPermissionDefinitions]
}

export async function fetchModuleCategories(): Promise<ModuleCategory[]> {
  await latency(100)
  return [...mockModuleCategories].sort((a, b) => a.order - b.order)
}

function fetchRolePermissions(roleId: string): RolePermissions {
  const detail = getStoredRoleById(roleId)
  return detail?.permissions ?? {}
}
