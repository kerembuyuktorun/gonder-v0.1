import type { ModuleCategory, PermissionDefinition, RoleDetail } from "../../_types"
import { fetchModuleCategories, fetchPermissionDefinitions, fetchRoleDetail } from "../../_api/roles-api"

export async function fetchRoleDetailForPage(roleId: string): Promise<RoleDetail | undefined> {
  return fetchRoleDetail(roleId)
}

export async function fetchRolePermissionDefinitionsForPage(): Promise<PermissionDefinition[]> {
  return fetchPermissionDefinitions()
}

export async function fetchRoleCategoriesForPage(): Promise<ModuleCategory[]> {
  return fetchModuleCategories()
}
