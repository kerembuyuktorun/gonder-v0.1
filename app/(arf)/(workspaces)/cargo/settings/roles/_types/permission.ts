export type PermissionType = "read" | "create" | "update" | "delete" | "special"

export interface ModuleCategory {
  id: string
  name: string
  code: string
  order: number
}

export interface PermissionDefinition {
  id: string
  moduleCategoryId: string
  moduleName: string
  moduleCode: string
  permissionType: PermissionType
  label: string
  description?: string
}
