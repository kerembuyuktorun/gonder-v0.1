import type { AddressSelection, CityOption } from "./address-selection"

export type MatchLevel = "city_neighborhood" | "city_district" | "city" | "none"
export type MatchStatus = "matched" | "partial" | "not_found" | "blocked"

export interface BranchSummary {
  branchId: string
  branchCode: string
  branchName: string
  city: string
  district: string
  transferCenterName?: string
}

export interface InterlandCoverageScope {
  id: string
  interlandId: string
  branchId: string
  city: string
  district: string
  neighborhood: string
  priority: number
  updatedAt: string
}

export interface BlockedAddressScope {
  id: string
  city: string
  district: string
  neighborhood: string
  reason: string
}

export interface MatchMeta {
  scopeId?: string
  matchedLevel: MatchLevel
  status: MatchStatus
  reason?: string
}

export interface InterlandUnitsSimulationInput {
  senderAddress: AddressSelection
  receiverAddress: AddressSelection
}

export interface InterlandAddressMatchResult {
  branch?: BranchSummary
  meta: MatchMeta
}

export interface InterlandUnitsSimulationResult {
  sender: InterlandAddressMatchResult
  receiver: InterlandAddressMatchResult
}

export interface InterlandSimulationInitialData {
  cityOptions: CityOption[]
}
