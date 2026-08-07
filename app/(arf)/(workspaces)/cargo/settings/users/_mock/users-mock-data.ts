// TODO: Remove when API is ready
import type { AuditLogEntry, UserAsset, UserAssetDraft, UserDetail, UserDocument, UserRecord, UserRole, UserStatus } from "../_types"

function cloneAuditLog(entry: AuditLogEntry): AuditLogEntry {
  return { ...entry }
}

function cloneDetail(detail: UserDetail): UserDetail {
  return {
    ...detail,
    asset: detail.asset ? { ...detail.asset } : undefined,
    auditLogs: detail.auditLogs.map(cloneAuditLog),
  }
}

function toRecord(detail: UserDetail): UserRecord {
  return {
    id: detail.id,
    firstName: detail.firstName,
    lastName: detail.lastName,
    identityNumber: detail.identityNumber,
    email: detail.email,
    phoneNumber: detail.phoneNumber,
    role: detail.role,
    roleId: detail.roleId,
    locationId: detail.locationId,
    locationName: detail.locationName,
    locationType: detail.locationType,
    profilePhotoUrl: detail.profilePhotoUrl,
    documents: detail.documents,
    asset: detail.asset ? { ...detail.asset } : undefined,
    status: detail.status,
    lastLogin: detail.lastLogin,
    isTemporaryPassword: detail.isTemporaryPassword,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    createdBy: detail.createdBy,
    createdByName: detail.createdByName,
  }
}

function makeAuditLog(
  id: string,
  userId: string,
  action: AuditLogEntry["action"],
  resourceType: AuditLogEntry["resourceType"],
  description: string,
  timestamp: string,
  resourceId?: string,
  actorName?: string,
): AuditLogEntry {
  return {
    id,
    userId,
    actorName,
    action,
    resourceType,
    resourceId,
    description,
    timestamp,
    ipAddress: "192.168.1.5",
    userAgent: "Mozilla/5.0 Chrome/120",
  }
}

function makeAsset(
  userId: string,
  assignedAt: string,
  assignedByName: string,
  overrides?: Partial<UserAsset>,
): UserAsset {
  return {
    userId,
    assignedAt,
    assignedBy: assignedByName.toLowerCase().replace(/\s+/g, "-"),
    assignedByName,
    ...overrides,
  }
}

function makeDetail(input: {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: UserRole
  roleId?: string
  locationId: string | null
  locationName: string | null
  locationType: "branch" | "tm" | "hq" | null
  status: UserStatus
  lastLogin?: string
  isTemporaryPassword?: boolean
  createdAt: string
  updatedAt: string
  createdByName: string
  identityNumber?: string
  profilePhotoUrl?: string
  documents?: UserDocument[]
  asset?: UserAsset
  auditLogs?: AuditLogEntry[]
}): UserDetail {
  return {
    id: input.id,
    firstName: input.firstName,
    lastName: input.lastName,
    identityNumber: input.identityNumber,
    email: input.email,
    phoneNumber: input.phoneNumber,
    role: input.role,
    roleId: input.roleId,
    locationId: input.locationId,
    locationName: input.locationName,
    locationType: input.locationType,
    profilePhotoUrl: input.profilePhotoUrl,
    documents: input.documents,
    status: input.status,
    lastLogin: input.lastLogin,
    isTemporaryPassword: input.isTemporaryPassword ?? false,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    createdBy: input.createdByName.toLowerCase().replace(/\s+/g, "-"),
    createdByName: input.createdByName,
       asset: input.asset ? { ...input.asset, entries: input.asset.entries } : undefined,
    auditLogs: input.auditLogs ?? [],
  }
}

const storedUsers: UserDetail[] = [
  makeDetail({
    id: "usr-001",
    firstName: "Mehmet",
    lastName: "Kaya",
    email: "mehmet.kaya@kargosistemi.com",
    phoneNumber: "0532 111 22 33",
    role: "superadmin",
    roleId: "superadmin",
    locationId: null,
    locationName: null,
    locationType: null,
    status: "active",
    lastLogin: "2026-03-24T09:15:00Z",
    createdAt: "2025-01-15T08:00:00Z",
    updatedAt: "2026-03-24T09:15:00Z",
    createdByName: "Sistem",
    auditLogs: [
      makeAuditLog("al-001", "usr-001", "login", "system", "Sisteme giriş yaptı", "2026-03-24T09:15:00Z"),
      makeAuditLog("al-002", "usr-001", "user_modified", "user", "Yeni kullanıcı oluşturdu: Ahmet Yılmaz", "2026-03-23T14:30:00Z", "usr-002", "Mehmet Kaya"),
      makeAuditLog("al-003", "usr-001", "shipment_status_updated", "shipment", "TRF-1002 no'lu kargonun durumunu 'Teslim Edildi' yaptı", "2026-03-22T11:00:00Z", "TRF-1002", "Mehmet Kaya"),
    ],
  }),
  makeDetail({
    id: "usr-002",
    firstName: "Ahmet",
    lastName: "Yılmaz",
    email: "ahmet.yilmaz@kargosistemi.com",
    phoneNumber: "0541 222 33 44",
    role: "hq_manager",
    roleId: "hq_manager",
    locationId: "hq-001",
    locationName: "Genel Merkez",
    locationType: "hq",
    status: "active",
    lastLogin: "2026-03-24T08:45:00Z",
    createdAt: "2025-02-10T09:00:00Z",
    updatedAt: "2026-03-24T08:45:00Z",
    createdByName: "Mehmet Kaya",
    auditLogs: [
      makeAuditLog("al-010", "usr-002", "login", "system", "Sisteme giriş yaptı", "2026-03-24T08:45:00Z", undefined, "Ahmet Yılmaz"),
      makeAuditLog("al-011", "usr-002", "shipment_created", "shipment", "Yeni kargo oluşturdu: TRF-1010", "2026-03-23T10:00:00Z", "TRF-1010", "Ahmet Yılmaz"),
    ],
  }),
  makeDetail({
    id: "usr-003",
    firstName: "Fatma",
    lastName: "Demir",
    email: "fatma.demir@kargosistemi.com",
    phoneNumber: "0555 333 44 55",
    role: "tm_manager",
    roleId: "hq_manager",
    locationId: "tm-001",
    locationName: "İstanbul Transfer Merkezi",
    locationType: "tm",
    status: "active",
    lastLogin: "2026-03-23T17:30:00Z",
    createdAt: "2025-03-01T10:00:00Z",
    updatedAt: "2026-03-23T17:30:00Z",
    createdByName: "Mehmet Kaya",
    auditLogs: [
      makeAuditLog("al-020", "usr-003", "login", "system", "Sisteme giriş yaptı", "2026-03-23T17:30:00Z", undefined, "Fatma Demir"),
    ],
  }),
  makeDetail({
    id: "usr-004",
    firstName: "Ali",
    lastName: "Çelik",
    email: "ali.celik@kargosistemi.com",
    phoneNumber: "0544 444 55 66",
    role: "branch_manager",
    roleId: "role_branch_manager",
    locationId: "br-001",
    locationName: "Adana Şubesi",
    locationType: "branch",
    status: "active",
    lastLogin: "2026-03-24T07:00:00Z",
    createdAt: "2025-04-01T09:00:00Z",
    updatedAt: "2026-03-24T07:00:00Z",
    createdByName: "Fatma Demir",
    auditLogs: [
      makeAuditLog("al-030", "usr-004", "login", "system", "Sisteme giriş yaptı", "2026-03-24T07:00:00Z", undefined, "Ali Çelik"),
    ],
  }),
  makeDetail({
    id: "usr-005",
    firstName: "Zeynep",
    lastName: "Arslan",
    email: "zeynep.arslan@kargosistemi.com",
    phoneNumber: "0533 555 66 77",
    role: "courier",
    roleId: "role_courier",
    locationId: "br-001",
    locationName: "Adana Şubesi",
    locationType: "branch",
    status: "active",
    lastLogin: "2026-03-24T06:30:00Z",
    createdAt: "2025-05-10T08:00:00Z",
    updatedAt: "2026-03-24T06:30:00Z",
    createdByName: "Ali Çelik",
    asset: makeAsset("usr-005", "2025-05-10T08:00:00Z", "Ali Çelik", {
      vehiclePlate: "01 AKD 123",
      assignedTerritory: "Adana Seyhan İnterland",
      deviceId: "DEV-0042",
      deviceSerialNumber: "SN-MOTOROLA-042",
         entries: [
           {
             id: "asset-entry-usr-005-phone",
             kind: "phone",
             assetName: "Motorola TC27",
             brandModel: "Motorola / TC27",
             serialNumber: "SN-MOTOROLA-042",
             imei: "356789104200123",
             assignmentNumber: "ZMT-2025-0042",
             providedAt: "2025-05-10T08:00:00Z",
             notes: "Kurye teslim cihazı",
           },
           {
             id: "asset-entry-usr-005-car",
             kind: "car",
             assetName: "Dağıtım Aracı",
             brandModel: "Ford Courier",
             serialNumber: "01 AKD 123",
             assignmentNumber: "ZMT-2025-0043",
             providedAt: "2025-05-10T08:00:00Z",
             notes: "Seyhan dağıtım hattı",
           },
         ],
    }),
    auditLogs: [
      makeAuditLog("al-040", "usr-005", "login", "system", "Sisteme giriş yaptı", "2026-03-24T06:30:00Z", undefined, "Zeynep Arslan"),
      makeAuditLog("al-041", "usr-005", "shipment_status_updated", "shipment", "TRF-0999 no'lu kargonun durumunu 'Teslim Edildi' yaptı", "2026-03-24T10:45:00Z", "TRF-0999", "Zeynep Arslan"),
    ],
  }),
  makeDetail({
    id: "usr-006",
    firstName: "Kemal",
    lastName: "Şahin",
    email: "kemal.sahin@kargosistemi.com",
    phoneNumber: "0551 666 77 88",
    role: "courier",
    roleId: "role_courier",
    locationId: "br-002",
    locationName: "Bursa Şubesi",
    locationType: "branch",
    status: "passive",
    lastLogin: "2026-02-15T14:00:00Z",
    createdAt: "2025-06-20T09:00:00Z",
    updatedAt: "2026-02-20T11:00:00Z",
    createdByName: "Mehmet Kaya",
    asset: makeAsset("usr-006", "2025-06-20T09:00:00Z", "Mehmet Kaya", {
      vehiclePlate: "16 BRS 456",
      assignedTerritory: "Bursa Nilüfer İnterland",
      deviceId: "DEV-0075",
      deviceSerialNumber: "SN-ZEBRA-075",
         entries: [
           {
             id: "asset-entry-usr-006-device",
             kind: "computer",
             assetName: "Zebra El Terminali",
             brandModel: "Zebra / TC57",
             serialNumber: "SN-ZEBRA-075",
             assignmentNumber: "ZMT-2025-0075",
             providedAt: "2025-06-20T09:00:00Z",
           },
         ],
    }),
    auditLogs: [
      makeAuditLog("al-050", "usr-006", "login", "system", "Sisteme giriş yaptı", "2026-02-15T14:00:00Z", undefined, "Kemal Şahin"),
    ],
  }),
  makeDetail({
    id: "usr-007",
    firstName: "Havva",
    lastName: "Yıldız",
    identityNumber: "12345678901",
    email: "havva.yildiz@kargosistemi.com",
    phoneNumber: "0562 777 88 99",
    role: "operator",
    roleId: "system_admin",
    locationId: "tm-002",
    locationName: "Ankara Transfer Merkezi",
    locationType: "tm",
    status: "active",
    lastLogin: "2026-03-24T08:00:00Z",
    isTemporaryPassword: true,
    createdAt: "2026-03-20T10:00:00Z",
    updatedAt: "2026-03-20T10:00:00Z",
    createdByName: "Mehmet Kaya",
    auditLogs: [
      makeAuditLog("al-060", "usr-007", "user_created", "user", "Kullanıcı hesabı oluşturuldu", "2026-03-20T10:00:00Z", undefined, "Mehmet Kaya"),
    ],
  }),
  makeDetail({
    id: "usr-008",
    firstName: "Burak",
    lastName: "Öztürk",
    email: "burak.ozturk@kargosistemi.com",
    phoneNumber: "0545 888 99 00",
    role: "branch_manager",
    roleId: "role_branch_manager",
    locationId: "br-003",
    locationName: "Antalya Şubesi",
    locationType: "branch",
    status: "suspended",
    lastLogin: "2026-01-10T12:00:00Z",
    createdAt: "2025-08-01T09:00:00Z",
    updatedAt: "2026-01-15T09:00:00Z",
    createdByName: "Ahmet Yılmaz",
    auditLogs: [
      makeAuditLog("al-070", "usr-008", "login", "system", "Sisteme giriş yaptı", "2026-01-10T12:00:00Z", undefined, "Burak Öztürk"),
      makeAuditLog("al-071", "usr-008", "user_suspended", "user", "Kullanıcı askıya alındı", "2026-01-15T09:00:00Z", undefined, "Ahmet Yılmaz"),
    ],
  }),
]

export function getUsersList(): UserRecord[] {
  return [...storedUsers]
    .sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf())
    .map(toRecord)
}

export function getUsersByRoleId(roleId: string): UserRecord[] {
  return [...storedUsers]
    .filter((u) => u.roleId === roleId)
    .sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf())
    .map(toRecord)
}

export function getUserDetailById(id: string): UserDetail | undefined {
  const found = storedUsers.find((u) => u.id === id)
  return found ? cloneDetail(found) : undefined
}

export function findUserByEmail(email: string): UserRecord | undefined {
  const found = storedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
  return found ? toRecord(found) : undefined
}

export function insertUser(payload: {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: UserRole
  locationId: string | null
  locationName: string | null
  locationType: "branch" | "tm" | "hq" | null
}): UserRecord {
  const now = new Date().toISOString()
  const newDetail = makeDetail({
    id: `usr-${Date.now()}`,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    role: payload.role,
    locationId: payload.locationId,
    locationName: payload.locationName,
    locationType: payload.locationType,
    status: "active",
    isTemporaryPassword: true,
    createdAt: now,
    updatedAt: now,
    createdByName: "Sistem",
    auditLogs: [
      makeAuditLog(
        `al-new-${Date.now()}`,
        `usr-${Date.now()}`,
        "user_created",
        "user",
        "Kullanıcı hesabı oluşturuldu",
        now,
      ),
    ],
  })
  storedUsers.unshift(newDetail)
  return toRecord(newDetail)
}

export function setStoredUserStatus(
  id: string,
  status: UserRecord["status"],
): UserRecord | undefined {
  const index = storedUsers.findIndex((u) => u.id === id)
  if (index === -1) return undefined
  storedUsers[index] = { ...storedUsers[index], status, updatedAt: new Date().toISOString() }
  return toRecord(storedUsers[index])
}

export function updateStoredUser(
  id: string,
  payload: {
    firstName: string
    lastName: string
    identityNumber?: string
    email: string
    phoneNumber: string
    role: UserRole
    locationId: string | null
    locationName: string | null
    locationType: "branch" | "tm" | "hq" | null
    profilePhotoUrl?: string
    documents?: UserDocument[]
    asset?: UserAssetDraft
  },
): UserRecord | undefined {
  const index = storedUsers.findIndex((u) => u.id === id)
  if (index === -1) return undefined
  storedUsers[index] = {
    ...storedUsers[index],
    ...payload,
    asset: payload.asset
      ? {
          ...storedUsers[index].asset,
          userId: storedUsers[index].id,
          assignedAt: payload.asset.assignedAt ?? storedUsers[index].asset?.assignedAt ?? new Date().toISOString(),
          assignedBy: (payload.asset.assignedByName ?? storedUsers[index].asset?.assignedByName ?? "Sistem")
            .toLowerCase()
            .replace(/\s+/g, "-"),
          assignedByName: payload.asset.assignedByName ?? storedUsers[index].asset?.assignedByName ?? "Sistem",
          vehiclePlate: payload.asset.vehiclePlate,
          assignedTerritory: payload.asset.assignedTerritory,
          deviceId: payload.asset.deviceId,
          deviceSerialNumber: payload.asset.deviceSerialNumber,
          allocations: payload.asset.allocations,
           entries: payload.asset.entries,
        }
      : storedUsers[index].asset,
    updatedAt: new Date().toISOString(),
  }
  return toRecord(storedUsers[index])
}

export function deleteStoredUser(id: string): boolean {
  const index = storedUsers.findIndex((u) => u.id === id)
  if (index === -1) return false
  storedUsers.splice(index, 1)
  return true
}
