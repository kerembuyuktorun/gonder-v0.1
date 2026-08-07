export type UserAssetKind = "phone" | "computer" | "tablet" | "simcard" | "car" | "house"

export interface UserAssetAllocation {
  kind: UserAssetKind
  quantity: number
}

export interface UserAssetEntry {
  id: string
  kind: UserAssetKind
  assetName: string
  brandModel?: string
  serialNumber?: string
  imei?: string
  assignmentNumber?: string
  providedAt?: string
  notes?: string
}

export interface UserAsset {
  userId: string
  vehiclePlate?: string
  assignedTerritory?: string
  deviceId?: string
  deviceSerialNumber?: string
  allocations?: UserAssetAllocation[]
  entries?: UserAssetEntry[]
  assignedAt: string
  assignedBy: string
  assignedByName: string
}
