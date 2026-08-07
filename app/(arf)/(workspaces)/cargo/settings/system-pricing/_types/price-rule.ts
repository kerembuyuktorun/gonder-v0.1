export type UnitType = "desi" | "kg"
export type ShipmentType = "koli" | "zarf" | "palet"
export type RegionType = "city_inner" | "city_outer" | "all_turkey" | "line_based"

export interface PriceRuleRow {
  id: string
  unitType: UnitType
  shipmentType: ShipmentType
  regionType: RegionType
  regionLabel: string
  rangeStart: number
  rangeEnd: number
  basePrice: number
  incrementalPrice: number
  sortOrder: number
}
