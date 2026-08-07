import { getPriceDefinitionById } from "../../_mock/price-definitions-mock-data"
import type { PriceDefinitionDetail } from "../../_types"

// TODO: Remove mock when API is ready
export async function fetchPriceDefinitionDetail(id: string): Promise<PriceDefinitionDetail | undefined> {
  return getPriceDefinitionById(id)
}
