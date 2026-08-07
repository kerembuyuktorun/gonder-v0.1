export type ShipmentType = "koli" | "zarf" | "palet" | "mixed"

export type DistanceDefinitionType = "city_inner" | "city_outer"

export type PricingModel = "fixed" | "desi_dynamic"

export interface PriceListRule {
  id: string
  priceListId: string
  distanceDefinitionType: DistanceDefinitionType
  distanceDefinitionName: string
  shipmentType: ShipmentType
  desiStart: number
  desiEnd: number
  pricingModel: PricingModel
  basePrice: number
  dynamicIncrement?: number
}
