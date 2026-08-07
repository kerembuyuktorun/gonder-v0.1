export type PriceDefinitionStatus = "active" | "passive"
export type PriceDefinitionType = "b2b" | "b2c"

export interface PriceDefinitionRecord {
  id: string
  code: string
  name: string
  type: PriceDefinitionType
  isDefault: boolean
  validFrom: string
  validTo: string
  status: PriceDefinitionStatus
  ruleCount: number
  createdAt: string
  updatedAt: string
  createdBy: string
  createdByName: string
}
