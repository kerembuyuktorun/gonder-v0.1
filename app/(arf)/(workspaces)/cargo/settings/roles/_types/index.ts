export * from "./role"
export * from "./permission"
export * from "./permission-matrix"

import type { RoleStatus, RoleType } from "./role"

export const ROLE_STATUS_LABELS: Record<RoleStatus, string> = {
  active: "Aktif",
  passive: "Pasif",
}

export const ROLE_TYPE_LABELS: Record<RoleType, string> = {
  system: "Sistem",
  custom: "Özel",
}
