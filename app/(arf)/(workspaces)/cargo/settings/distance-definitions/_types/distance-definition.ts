export type DistanceDefinitionStatus = "active" | "passive"
export type DistanceSlaTarget = "24h" | "48h" | "72h"

export interface DistanceDefinitionRecord {
  id: string
  name: string
  description?: string
  minKm: number
  maxKm: number | null
  hasUpperLimit: boolean
  slaTarget: DistanceSlaTarget
  status: DistanceDefinitionStatus
  createdAt: string
  updatedAt: string
  createdBy: string
  createdByName: string
}

export interface RangeCollision {
  currentId?: string
  conflictingId: string
  conflictingName: string
}

export interface RangeValidationResult {
  isValid: boolean
  collisions: RangeCollision[]
  gapWarnings: string[]
}
