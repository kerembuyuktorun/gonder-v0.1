import {
  clonePriceDefinition,
  createPriceDefinition,
  exportPriceDefinition,
  getPriceDefinitionById,
  getPriceDefinitionsList,
  setPriceDefinitionStatus,
  updatePriceDefinition,
  validatePriceRuleMatrix,
  type UpsertPriceDefinitionInput,
} from "../_mock/price-definitions-mock-data"
import type {
  PriceDefinitionDetail,
  PriceDefinitionRecord,
  PriceMatrixValidationResult,
  PriceRuleRow,
} from "../_types"

export type { UpsertPriceDefinitionInput }

// TODO: Remove mock when API is ready
export async function fetchPriceDefinitions(): Promise<PriceDefinitionRecord[]> {
  return getPriceDefinitionsList()
}

// TODO: Remove mock when API is ready
export async function fetchPricingDefinitionDetail(id: string): Promise<PriceDefinitionDetail | undefined> {
  return getPriceDefinitionById(id)
}

// TODO: Remove mock when API is ready
export async function createPricingDefinition(payload: UpsertPriceDefinitionInput): Promise<PriceDefinitionDetail> {
  return createPriceDefinition(payload)
}

// TODO: Remove mock when API is ready
export async function updatePricingDefinition(
  id: string,
  payload: UpsertPriceDefinitionInput,
): Promise<PriceDefinitionDetail | undefined> {
  return updatePriceDefinition(id, payload)
}

// TODO: Remove mock when API is ready
export async function clonePricingDefinition(id: string): Promise<PriceDefinitionDetail | undefined> {
  return clonePriceDefinition(id)
}

// TODO: Remove mock when API is ready
export async function setPricingDefinitionStatus(
  id: string,
  status: PriceDefinitionRecord["status"],
): Promise<PriceDefinitionDetail | undefined> {
  return setPriceDefinitionStatus(id, status)
}

// TODO: Remove mock when API is ready
export async function exportPricingDefinition(id: string, format: "pdf" | "excel"): Promise<{ url: string }> {
  return exportPriceDefinition(id, format)
}

// TODO: Remove mock when API is ready
export async function validatePricingRules(rules: PriceRuleRow[]): Promise<PriceMatrixValidationResult> {
  return validatePriceRuleMatrix(rules)
}
