import type { PriceDefinitionRecord } from "./price-definition"
import type { PriceRuleRow } from "./price-rule"
import type { PriceSurcharge } from "./price-surcharge"

export type { PriceDefinitionStatus, PriceDefinitionType, PriceDefinitionRecord } from "./price-definition"
export type { PriceRuleRow, RegionType, ShipmentType, UnitType } from "./price-rule"
export type { CustomSurchargeService, PriceSurcharge, SurchargeValueType } from "./price-surcharge"

export interface PriceDefinitionDetail extends PriceDefinitionRecord {
  rules: PriceRuleRow[]
  surcharges: PriceSurcharge
}

export interface PriceMatrixValidationResult {
  overlapErrors: string[]
  gapWarnings: string[]
}
