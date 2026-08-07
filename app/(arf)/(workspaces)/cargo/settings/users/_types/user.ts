import type { UserAsset, UserAssetAllocation, UserAssetEntry } from "./user-asset"

export type UserRole =
  | "superadmin"
  | "hq_manager"
  | "tm_manager"
  | "branch_manager"
  | "courier"
  | "operator"

export type UserStatus = "active" | "passive" | "suspended"

export type UserDocumentType = "employment_contract" | "cv" | "identity" | "other"

export interface UserDocument {
  id: string
  type: UserDocumentType
  fileName: string
  fileSize: number
  uploadedAt: string
  uploadedBy: string
  url: string
}

export interface UserAssetDraft {
  vehiclePlate?: string
  assignedTerritory?: string
  deviceId?: string
  deviceSerialNumber?: string
  allocations?: UserAssetAllocation[]
  entries?: UserAssetEntry[]
  assignedAt?: string
  assignedByName?: string
}

export interface UserRecord {
  id: string
  firstName: string
  lastName: string
  identityNumber?: string
  email: string
  phoneNumber: string
  role: UserRole
  roleId?: string
  locationId: string | null
  locationName: string | null
  locationType: "branch" | "tm" | "hq" | null
  profilePhotoUrl?: string
  documents?: UserDocument[]
  asset?: UserAsset
  status: UserStatus
  lastLogin?: string
  isTemporaryPassword: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  createdByName: string
}
