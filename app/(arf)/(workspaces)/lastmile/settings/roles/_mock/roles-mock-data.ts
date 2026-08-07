// TODO: Remove when API is ready

import type {
  LastmileRole,
  RoleAuditLogEntry,
  RoleDetail,
  RoleListKpi,
  RolePermissions,
  RoleStatus,
  RoleStatusScope,
} from '../_types/role'
import { SYSTEM_ROLE_IDS } from '../_types/role'
import { PERMISSION_DEFINITIONS } from './permissions-catalog'

const now = new Date()
const daysAgo = (n: number) => new Date(now.valueOf() - n * 86_400_000).toISOString()

function makeAuditLog(entry: RoleAuditLogEntry): RoleAuditLogEntry {
  return entry
}

function allGranted(): RolePermissions {
  return Object.fromEntries(PERMISSION_DEFINITIONS.map((permission) => [permission.id, true]))
}

function readOnlyGranted(): RolePermissions {
  return Object.fromEntries(
    PERMISSION_DEFINITIONS.map((permission) => [
      permission.id,
      permission.permissionType === 'read',
    ])
  )
}

function basicGranted(): RolePermissions {
  return Object.fromEntries(
    PERMISSION_DEFINITIONS.map((permission) => [
      permission.id,
      permission.permissionType === 'read' || permission.permissionType === 'create',
    ])
  )
}

let mockRoles: LastmileRole[] = [
  {
    id: 'super_admin',
    name: 'Süper Admin',
    description: 'Tüm last mile ayarları, kaynaklar ve kullanıcı yönetimine tam erişim',
    roleType: 'system',
    status: 'active',
    userCount: 2,
    createdAt: daysAgo(300),
    createdBy: 'Sistem',
    updatedAt: daysAgo(3),
    updatedBy: 'Sistem',
  },
  {
    id: 'bolge_planlamacisi',
    name: 'Bölge Planlamacısı',
    description: 'Rota planlama, bölge atamaları ve operasyon takibi',
    roleType: 'system',
    status: 'active',
    userCount: 2,
    createdAt: daysAgo(260),
    createdBy: 'Sistem',
    updatedAt: daysAgo(5),
    updatedBy: 'Sistem',
  },
  {
    id: 'operasyon_yoneticisi',
    name: 'Operasyon Yöneticisi',
    description: 'Günlük operasyon, kurye/araç ve sipariş yönetimi',
    roleType: 'system',
    status: 'active',
    userCount: 2,
    createdAt: daysAgo(220),
    createdBy: 'Sistem',
    updatedAt: daysAgo(8),
    updatedBy: 'Sistem',
  },
  {
    id: 'musteri_depo_yoneticisi',
    name: 'Müşteri Depo Yöneticisi',
    description: 'Müşteri deposu sipariş ve sevkiyat yönetimi',
    roleType: 'custom',
    status: 'active',
    userCount: 3,
    createdAt: daysAgo(120),
    createdBy: 'Ayşe Demir',
    updatedAt: daysAgo(1),
    updatedBy: 'Ayşe Demir',
  },
  {
    id: 'musteri_izleyici',
    name: 'Müşteri İzleyici',
    description: 'Müşteri tarafında sipariş ve rota izleme',
    roleType: 'custom',
    status: 'active',
    userCount: 2,
    createdAt: daysAgo(100),
    createdBy: 'Ayşe Demir',
    updatedAt: daysAgo(6),
    updatedBy: 'Ayşe Demir',
  },
  {
    id: 'sadece_izleyici',
    name: 'Sadece İzleyici',
    description: 'Salt okunur erişim — değişiklik yapamaz',
    roleType: 'custom',
    status: 'passive',
    userCount: 1,
    createdAt: daysAgo(90),
    createdBy: 'Mert Can',
    updatedAt: daysAgo(4),
    updatedBy: 'Mert Can',
  },
  {
    id: 'role_saha_supervisor',
    name: 'Saha Supervizörü',
    description: 'Saha operasyonu denetimi, kurye ve canlı rota müdahalesi',
    roleType: 'custom',
    status: 'active',
    userCount: 0,
    createdAt: daysAgo(45),
    createdBy: 'Mert Can',
    updatedAt: daysAgo(2),
    updatedBy: 'Mert Can',
  },
]

const mockRolePermissions: Record<string, RolePermissions> = {
  super_admin: allGranted(),
  bolge_planlamacisi: {
    ...basicGranted(),
    'orders.update': true,
    'planning.update': true,
    'planning.special.orchestrate': true,
    'planning.special.close': true,
    'live.update': true,
    'vehicles.update': true,
    'vehicles.special.assign': true,
    'couriers.update': true,
    'couriers.special.assign': true,
    'reports.special.ops': true,
    'settings.special.regions': true,
  },
  operasyon_yoneticisi: {
    ...basicGranted(),
    'orders.update': true,
    'orders.special.cancel': true,
    'live.update': true,
    'live.special.intervene': true,
    'vehicles.update': true,
    'vehicles.special.assign': true,
    'couriers.update': true,
    'couriers.special.assign': true,
    'reports.special.ops': true,
  },
  musteri_depo_yoneticisi: {
    ...readOnlyGranted(),
    'orders.create': true,
    'orders.update': true,
    'orders.special.export': true,
    'reports.special.ops': true,
  },
  musteri_izleyici: readOnlyGranted(),
  sadece_izleyici: readOnlyGranted(),
  role_saha_supervisor: {
    ...basicGranted(),
    'orders.update': true,
    'live.update': true,
    'live.special.intervene': true,
    'couriers.update': true,
    'vehicles.update': true,
    'reports.special.ops': true,
  },
}

const mockRoleAuditLogs: Record<string, RoleAuditLogEntry[]> = {
  super_admin: [
    makeAuditLog({
      id: 'role-audit-super-admin-1',
      action: 'Rol Güncellendi',
      description: 'Süper Admin rol açıklaması güncellendi.',
      actorName: 'Sistem',
      actorIpAddress: '192.168.1.10',
      timestamp: daysAgo(3),
    }),
  ],
  bolge_planlamacisi: [
    makeAuditLog({
      id: 'role-audit-bolge-planlamacisi-1',
      action: 'Yetki Güncellendi',
      description: 'Bölge Planlamacısı rolüne orkestratör çalıştırma yetkisi eklendi.',
      actorName: 'Sistem',
      actorIpAddress: '192.168.1.11',
      timestamp: daysAgo(5),
    }),
  ],
  operasyon_yoneticisi: [
    makeAuditLog({
      id: 'role-audit-operasyon-yoneticisi-1',
      action: 'Rol Oluşturuldu',
      description: 'Operasyon Yöneticisi rolü oluşturuldu.',
      actorName: 'Sistem',
      actorIpAddress: '192.168.1.12',
      timestamp: daysAgo(220),
    }),
  ],
  musteri_depo_yoneticisi: [
    makeAuditLog({
      id: 'role-audit-musteri-depo-1',
      action: 'Yetki Güncellendi',
      description: 'Müşteri Depo Yöneticisi rolü için sipariş oluşturma yetkisi açıldı.',
      actorName: 'Ayşe Demir',
      actorIpAddress: '10.0.0.21',
      timestamp: daysAgo(1),
    }),
    makeAuditLog({
      id: 'role-audit-musteri-depo-2',
      action: 'Rol Oluşturuldu',
      description: 'Müşteri deposu sipariş ve sevkiyat yönetimi rolü tanımlandı.',
      actorName: 'Ayşe Demir',
      actorIpAddress: '10.0.0.21',
      timestamp: daysAgo(120),
    }),
  ],
  musteri_izleyici: [
    makeAuditLog({
      id: 'role-audit-musteri-izleyici-1',
      action: 'Rol Oluşturuldu',
      description: 'Müşteri İzleyici rolü oluşturuldu.',
      actorName: 'Ayşe Demir',
      actorIpAddress: '10.0.0.21',
      timestamp: daysAgo(100),
    }),
  ],
  sadece_izleyici: [
    makeAuditLog({
      id: 'role-audit-sadece-izleyici-1',
      action: 'Durum Güncellendi',
      description: 'Sadece İzleyici rolü pasif duruma alındı.',
      actorName: 'Mert Can',
      actorIpAddress: '10.0.0.35',
      timestamp: daysAgo(4),
    }),
  ],
  role_saha_supervisor: [
    makeAuditLog({
      id: 'role-audit-saha-supervisor-1',
      action: 'Rol Oluşturuldu',
      description: 'Saha Supervizörü rolü tanımlandı.',
      actorName: 'Mert Can',
      actorIpAddress: '10.0.0.35',
      timestamp: daysAgo(45),
    }),
  ],
}

export function getStoredRoles(): LastmileRole[] {
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

  const role: LastmileRole = {
    id,
    name: input.name,
    description: input.description,
    roleType: 'custom',
    status: 'active',
    userCount: 0,
    createdAt: ts,
    createdBy: input.updatedBy,
    updatedAt: ts,
    updatedBy: input.updatedBy,
  }

  mockRoles = [role, ...mockRoles]
  mockRolePermissions[id] = input.permissions ? { ...input.permissions } : { ...(source ?? basicGranted()) }
  mockRoleAuditLogs[id] = [
    makeAuditLog({
      id: `role-audit-${id}-created`,
      action: 'Rol Oluşturuldu',
      description: `${input.name} rolü oluşturuldu.`,
      actorName: input.updatedBy,
      actorIpAddress: '127.0.0.1',
      timestamp: ts,
    }),
  ]

  return {
    ...role,
    permissions: { ...mockRolePermissions[id] },
    auditLogs: [...mockRoleAuditLogs[id]],
  }
}

export function updateStoredRole(
  roleId: string,
  payload: { name?: string; description?: string; status?: RoleStatus; updatedBy: string }
): LastmileRole | undefined {
  const index = mockRoles.findIndex((item) => item.id === roleId)
  if (index < 0) return undefined

  const current = mockRoles[index]
  const next: LastmileRole = {
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
      action: payload.status && payload.status !== current.status ? 'Durum Güncellendi' : 'Rol Güncellendi',
      description:
        payload.status && payload.status !== current.status
          ? `${next.name} rol durumu ${payload.status === 'active' ? 'aktif' : 'pasif'} olarak güncellendi.`
          : `${next.name} rol bilgileri güncellendi.`,
      actorName: payload.updatedBy,
      actorIpAddress: '127.0.0.1',
      timestamp: next.updatedAt,
    }),
    ...(mockRoleAuditLogs[roleId] ?? []),
  ]
  return next
}

export function setStoredRolePermissions(
  roleId: string,
  permissions: RolePermissions
): RoleDetail | undefined {
  const role = mockRoles.find((item) => item.id === roleId)
  if (!role) return undefined
  mockRolePermissions[roleId] = { ...permissions }

  const updated = updateStoredRole(roleId, { updatedBy: 'UI Operator' })
  if (!updated) return undefined

  return {
    ...updated,
    permissions: { ...mockRolePermissions[roleId] },
    auditLogs: mockRoleAuditLogs[roleId] ? [...mockRoleAuditLogs[roleId]] : [],
  }
}

export function copyStoredRole(
  roleId: string,
  newName: string,
  updatedBy: string
): RoleDetail | undefined {
  const source = getStoredRoleById(roleId)
  if (!source) return undefined

  return insertStoredRole({
    name: newName,
    description: `${source.name} rolünden kopyalandı`,
    updatedBy,
    sourceRoleId: roleId,
  })
}

export function setStoredRoleStatus(
  roleId: string,
  status: RoleStatus,
  updatedBy: string
): LastmileRole | undefined {
  return updateStoredRole(roleId, { status, updatedBy })
}

export function deleteStoredRole(roleId: string): { ok: boolean; reason?: string } {
  const role = mockRoles.find((item) => item.id === roleId)
  if (!role) return { ok: false, reason: 'Rol bulunamadı.' }

  if (SYSTEM_ROLE_IDS.includes(role.id as (typeof SYSTEM_ROLE_IDS)[number])) {
    return { ok: false, reason: 'Sistem rolleri silinemez.' }
  }

  if (role.userCount > 0 && role.status === 'active') {
    return { ok: false, reason: 'Bu role atanmış aktif kullanıcılar var. Önce pasife çekin.' }
  }

  if (role.status === 'active') {
    return { ok: false, reason: 'Aktif rol doğrudan silinemez. Önce pasife çekin.' }
  }

  mockRoles = mockRoles.filter((item) => item.id !== roleId)
  delete mockRolePermissions[roleId]
  delete mockRoleAuditLogs[roleId]
  return { ok: true }
}

export function computeRoleKpi(roles: LastmileRole[]): RoleListKpi {
  return {
    total: roles.length,
    active: roles.filter((role) => role.status === 'active').length,
    passive: roles.filter((role) => role.status === 'passive').length,
    system: roles.filter((role) => role.roleType === 'system').length,
    custom: roles.filter((role) => role.roleType === 'custom').length,
    assignedUsers: roles.reduce((sum, role) => sum + role.userCount, 0),
  }
}

export function computeStatusCounts(
  roles: LastmileRole[]
): Record<RoleStatusScope, number> {
  return {
    all: roles.length,
    active: roles.filter((role) => role.status === 'active').length,
    passive: roles.filter((role) => role.status === 'passive').length,
  }
}
