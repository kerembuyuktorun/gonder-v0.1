import {
  mockCities,
  mockDistricts,
  mockExtraServiceCatalog,
  mockNeighborhoods,
  mockPriceLists,
  mockPriceRules,
  mockSimulationLookups,
} from "../_mock/price-list-simulation-mock-data"
import { simulatePriceWithEngine } from "../_lib/price-simulation-engine"
import type { PriceListSimulationInput, PriceListSimulationResult, SimulationLookups } from "../_types"

// TODO: Remove mock when API is ready
export async function fetchSimulationLookups(): Promise<SimulationLookups> {
  return mockSimulationLookups
}

// TODO: Remove mock when API is ready
export async function simulatePrice(
  input: PriceListSimulationInput,
): Promise<PriceListSimulationResult | null> {
  return simulatePriceWithEngine(input, {
    priceLists: mockPriceLists,
    rules: mockPriceRules,
    cities: mockCities,
    districts: mockDistricts,
    neighborhoods: mockNeighborhoods,
    extraServiceCatalog: mockExtraServiceCatalog,
  })
}
