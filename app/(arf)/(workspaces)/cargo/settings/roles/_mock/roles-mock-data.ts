// TODO: Remove when API is ready

import type { RoleAuditLogEntry, RoleDetail, RolePermissions, RoleRecord, RoleStatus } from "../_types"
import { SYSTEM_ROLE_IDS } from "../_types"
import { mockPermissionDefinitions } from "./permissions-mock-data"

const now = new Date()
const daysAgo = (n: number) => new Date(now.valueOf() - n * 86_400_000).toISOString()

function makeAuditLog(entry: RoleAuditLogEntry): RoleAuditLogEntry {
  return entry
}

let mockRoles: RoleRecord[] = [
  {
    id: "superadmin",
    name: "Super Admin",
    description: "Tüm sistem yetkilerine sahip çekirdek rol",
    roleType: "system",
    status: "active",
    userCount: 3,
    createdAt: daysAgo(300),
    createdBy: "Sistem",
    updatedAt: daysAgo(3),
    updatedBy: "Sistem",
  },
  {
    id: "system_admin",
    name: "Sistem Yöneticisi",
    description: "Sistem konfigürasyonları ve ayarların yönetimi",
    roleType: "system",
    status: "active",
    userCount: 7,
    createdAt: daysAgo(260),
    createdBy: "Sistem",
    updatedAt: daysAgo(5),
    updatedBy: "Sistem",
  },
  {
    id: "hq_manager",
    name: "Merkez Operasyon Yöneticisi",
    description: "Merkez operasyon ve rapor yönetimi",
    roleType: "system",
    status: "active",
    userCount: 12,
    createdAt: daysAgo(220),
    createdBy: "Sistem",
    updatedAt: daysAgo(8),
    updatedBy: "Sistem",
  },
  {
    id: "role_branch_manager",
    name: "Şube Yöneticisi",
    description: "Şube operasyon sorumlusu",
    roleType: "custom",
    status: "active",
    userCount: 45,
    createdAt: daysAgo(120),
    createdBy: "Ayşe Demir",
    updatedAt: daysAgo(1),
    updatedBy: "Ayşe Demir",
  },
  {
    id: "role_courier",
    name: "Kurye",
    description: "Dağıtım ve teslimat operasyonları",
    roleType: "custom",
    status: "passive",
    userCount: 0,
    createdAt: daysAgo(90),
    createdBy: "Mert Can",
    updatedAt: daysAgo(4),
    updatedBy: "Mert Can",
  },
]

function allGranted(): RolePermissions {
  return Object.fromEntries(mockPermissionDefinitions.map((permission) => [permission.id, true]))
}

function basicGranted(): RolePermissions {
  return Object.fromEntries(
    mockPermissionDefinitions.map((permission) => [
      permission.id,
      permission.permissionType === "read" || permission.permissionType === "create",
    ]),
  )
}

const mockRolePermissions: Record<string, RolePermissions> = {
  superadmin: allGranted(),
  system_admin: allGranted(),
  hq_manager: {
    ...allGranted(),
    "finance.delete": false,
  },
  role_branch_manager: {
    ...basicGranted(),
    "cargo.update": true,
    "route.update": true,
    "users.update": true,
  },
  role_courier: {
    ...basicGranted(),
    "cargo.create": false,
    "cargo.update": false,
    "cargo.delete": false,
    "users.read": false,
    "roles.read": false,
  },
}

export function getStoredRoles(): RoleRecord[] {
  return [...mockRoles].sort((a, b) => b.userCount - a.userCount)
}

export function getStoredRoleById(id: string): RoleDetail | undefined {
  const role = mockRoles.find((item) => item.id === id)
  if (!role) return undefined
  return {
    ...role,
    permissions: { ...(mockRolePermissions[id] ?? {}) },
    auditLogs: mockRoleAuditLogs[id] ? [...mockRoleAuditLogs[id]] : [],
  }
}

const mockRoleAuditLogs: Record<string, RoleAuditLogEntry[]> = {
  superadmin: [
    makeAuditLog({
      id: "role-audit-superadmin-1",
      action: "Rol Güncellendi",
      description: "Süper admin rol açıklaması güncellendi.",
      actorName: "Sistem",
      actorIpAddress: "192.168.1.10",
      timestamp: daysAgo(3),
    }),
  ],
  system_admin: [
    makeAuditLog({
      id: "role-audit-system-admin-1",
      action: "Yetki Güncellendi",
      description: "Sistem Yöneticisi rolüne finans modülü görüntüleme yetkisi eklendi.",
      actorName: "Sistem",
      actorIpAddress: "192.168.1.11",
      timestamp: daysAgo(5),
    }),
  ],
  hq_manager: [
    makeAuditLog({
      id: "role-audit-hq-manager-1",
      action: "Rol Oluşturuldu",
      description: "Merkez Operasyon Yöneticisi rolü oluşturuldu.",
      actorName: "Sistem",
      actorIpAddress: "192.168.1.12",
      timestamp: daysAgo(220),
    }),
  ],
  role_branch_manager: [
    makeAuditLog({
      id: "role-audit-branch-manager-1",
      action: "Yetki Güncellendi",
      description: "Şube Yöneticisi rolü için kullanıcı güncelleme yetkisi açıldı.",
      actorName: "Ayşe Demir",
      actorIpAddress: "10.0.0.21",
      timestamp: daysAgo(1),
    }),
    makeAuditLog({
      id: "role-audit-branch-manager-2",
      action: "Rol Oluşturuldu",
      description: "Şube operasyon sorumlusu rolü tanımlandı.",
      actorName: "Ayşe Demir",
      actorIpAddress: "10.0.0.21",
      timestamp: daysAgo(120),
    }),
  ],
  role_courier: [
    makeAuditLog({
      id: "role-audit-courier-1",
      action: "Durum Güncellendi",
      description: "Kurye rolü pasif duruma alındı.",
      actorName: "Mert Can",
      actorIpAddress: "10.0.0.35",
      timestamp: daysAgo(4),
    }),
  ],
}

export function insertStoredRole(input: {
  name: string
  description?: string
  updatedBy: string
  sourceRoleId?: string
  permissions?: RolePermissions
}): RoleDetail {
  const ts = new Date().toISOString()
  const id = `role_${Math.random().toString(36).slice(2, 10)}`
  const source = input.sourceRoleId ? mockRolePermissions[input.sourceRoleId] : undefined

  const role: RoleRecord = {
    id,
    name: input.name,
    description: input.description,
    roleType: "custom",
    status: "active",
    userCount: 0,
    createdAt: ts,
    updatedAt: ts,
    updatedBy: input.updatedBy,
  }

  mockRoles = [role, ...mockRoles]
  mockRolePermissions[id] = input.permissions ? { ...input.permissions } : { ...(source ?? basicGranted()) }
  mockRoleAuditLogs[id] = [
    makeAuditLog({
      id: `role-audit-${id}-created`,
      action: "Rol Oluşturuldu",
      description: `${input.name} rolü oluşturuldu.`,
      actorName: input.updatedBy,
      actorIpAddress: "127.0.0.1",
      timestamp: ts,
    }),
  ]

  return { ...role, permissions: { ...mockRolePermissions[id] } }
}

export function updateStoredRole(
  roleId: string,
  payload: { name?: string; description?: string; status?: RoleStatus; updatedBy: string },
): RoleRecord | undefined {
  const index = mockRoles.findIndex((item) => item.id === roleId)
  if (index < 0) return undefined

  const current = mockRoles[index]
  const next: RoleRecord = {
    ...current,
    name: payload.name ?? current.name,
    description: payload.description ?? current.description,
    status: payload.status ?? current.status,
    updatedAt: new Date().toISOString(),
    updatedBy: payload.updatedBy,
  }
  mockRoles[index] = next
  mockRoleAuditLogs[roleId] = [
    makeAuditLog({
      id: `role-audit-${roleId}-${Date.now()}`,
      action: payload.status && payload.status !== current.status ? "Durum Güncellendi" : "Rol Güncellendi",
      description:
        payload.status && payload.status !== current.status
          ? `${next.name} rol durumu ${payload.status === "active" ? "aktif" : "pasif"} olarak güncellendi.`
          : `${next.name} rol bilgileri güncellendi.`,
      actorName: payload.updatedBy,
      actorIpAddress: "127.0.0.1",
      timestamp: next.updatedAt,
    }),
    ...(mockRoleAuditLogs[roleId] ?? []),
  ]
  return next
}

export function setStoredRolePermissions(roleId: string, permissions: RolePermissions): RoleDetail | undefined {
  const role = mockRoles.find((item) => item.id === roleId)
  if (!role) return undefined
  mockRolePermissions[roleId] = { ...permissions }

  const updated = updateStoredRole(roleId, { updatedBy: "UI Operator" })
  if (!updated) return undefined

  return {
    ...updated,
    permissions: { ...mockRolePermissions[roleId] },
  }
}

export function copyStoredRole(roleId: string, newRoleName: string, updatedBy: string): RoleDetail | undefined {
  const source = getStoredRoleById(roleId)
  if (!source) return undefined

  return insertStoredRole({
    name: newRoleName,
    description: `${source.name} rolünden kopyalandı`,
    updatedBy,
    sourceRoleId: roleId,
  })
}

export function setStoredRoleStatus(roleId: string, status: RoleStatus, updatedBy: string): RoleRecord | undefined {
  return updateStoredRole(roleId, { status, updatedBy })
}

export function deleteStoredRole(roleId: string): { ok: boolean; reason?: string } {
  const role = mockRoles.find((item) => item.id === roleId)
  if (!role) return { ok: false, reason: "Rol bulunamadı." }

  if (SYSTEM_ROLE_IDS.includes(role.id as (typeof SYSTEM_ROLE_IDS)[number])) {
    return { ok: false, reason: "Sistem rolleri silinemez." }
  }

  if (role.userCount > 0 && role.status === "active") {
    return { ok: false, reason: "Bu role atanmış aktif kullanıcılar var. Önce pasife çekin." }
  }

  if (role.status === "active") {
    return { ok: false, reason: "Aktif rol doğrudan silinemez. Önce pasife çekin." }
  }

  mockRoles = mockRoles.filter((item) => item.id !== roleId)
  delete mockRolePermissions[roleId]
  delete mockRoleAuditLogs[roleId]
  return { ok: true }
}
