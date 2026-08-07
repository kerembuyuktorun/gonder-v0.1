import type { DistanceDefinitionType, PriceListRule, ShipmentType } from "./price-list-rule"

export interface AddressOption {
  id: string
  name: string
  cityId?: string
  districtId?: string
}

export interface PieceTypeOption {
  value: Exclude<ShipmentType, "mixed">
  label: string
}

export interface AddressSelection {
  cityId: string
  districtId: string
  neighborhoodId: string
}

export interface CargoPieceInput {
  id: string
  pieceType: Exclude<ShipmentType, "mixed">
  length: number
  width: number
  height: number
  kg: number
  quantity: number
  desi: number
}

export interface PriceListSimulationInput {
  senderAddress: AddressSelection
  receiverAddress: AddressSelection
  cargoPieces: CargoPieceInput[]
  totalDesi: number
  extraServices?: {
    pickup?: boolean
    mobileDelivery?: boolean
    cod?: boolean
  }
}

export interface PriceListSummary {
  id: string
  code: string
  name: string
  status: "active" | "passive"
  type: "b2b" | "b2c"
  validFrom: string
  validTo: string
}

export interface MatchedPriceRule {
  id: string
  distanceDefinitionId: string
  distanceDefinitionName: string
  originLabel: string
  destinationLabel: string
  shipmentType: ShipmentType
  desiStart: number
  desiEnd: number
  pricingModel: PriceListRule["pricingModel"]
  basePrice: number
  dynamicIncrement?: number
  distanceDefinitionType: DistanceDefinitionType
}

export interface PriceBreakdownRow {
  label: string
  amount: number
  highlight?: boolean
}

export interface PriceListSimulationResult {
  matchedPriceList: PriceListSummary
  matchedRule: MatchedPriceRule
  input: PriceListSimulationInput
  transportFee: number
  kdvRate: number
  kdvAmount: number
  extraServiceTotal: number
  grandTotal: number
  breakdown: PriceBreakdownRow[]
  notes: string[]
}

export interface SimulationLookups {
  cityOptions: AddressOption[]
  districtOptions: AddressOption[]
  neighborhoodOptions: AddressOption[]
  pieceTypeOptions: PieceTypeOption[]
}
