// TODO: Remove when API is ready

import type {
  AddressOption,
  PieceTypeOption,
  PriceListRule,
  PriceListSummary,
  SimulationLookups,
} from "../_types"

export const mockCities: AddressOption[] = [
  { id: "city-34", name: "İstanbul" },
  { id: "city-06", name: "Ankara" },
]

export const mockDistricts: AddressOption[] = [
  { id: "district-3401", cityId: "city-34", name: "Kadıköy" },
  { id: "district-3402", cityId: "city-34", name: "Ümraniye" },
  { id: "district-0601", cityId: "city-06", name: "Çankaya" },
]

export const mockNeighborhoods: AddressOption[] = [
  { id: "neighborhood-340101", cityId: "city-34", districtId: "district-3401", name: "Fenerbahçe" },
  { id: "neighborhood-340102", cityId: "city-34", districtId: "district-3401", name: "Kozyatağı" },
  { id: "neighborhood-340201", cityId: "city-34", districtId: "district-3402", name: "Atatürk" },
  { id: "neighborhood-060101", cityId: "city-06", districtId: "district-0601", name: "Yıldız" },
]

export const mockPieceTypes: PieceTypeOption[] = [
  { value: "koli", label: "Koli" },
  { value: "zarf", label: "Zarf" },
  { value: "palet", label: "Palet" },
]

export const mockSimulationLookups: SimulationLookups = {
  cityOptions: mockCities,
  districtOptions: mockDistricts,
  neighborhoodOptions: mockNeighborhoods,
  pieceTypeOptions: mockPieceTypes,
}

export const mockPriceLists: PriceListSummary[] = [
  {
    id: "pl-1",
    code: "PL-2026-STD",
    name: "Standart B2C 2026",
    status: "active",
    type: "b2c",
    validFrom: "2026-01-01T00:00:00.000Z",
    validTo: "2026-12-31T23:59:59.000Z",
  },
]

export const mockPriceRules: PriceListRule[] = [
  {
    id: "rule-city-inner-1",
    priceListId: "pl-1",
    distanceDefinitionType: "city_inner",
    distanceDefinitionName: "Şehir İçi",
    shipmentType: "mixed",
    desiStart: 1,
    desiEnd: 5,
    pricingModel: "fixed",
    basePrice: 50,
  },
  {
    id: "rule-city-inner-2",
    priceListId: "pl-1",
    distanceDefinitionType: "city_inner",
    distanceDefinitionName: "Şehir İçi",
    shipmentType: "mixed",
    desiStart: 5.01,
    desiEnd: 10,
    pricingModel: "fixed",
    basePrice: 90,
  },
  {
    id: "rule-city-outer-1",
    priceListId: "pl-1",
    distanceDefinitionType: "city_outer",
    distanceDefinitionName: "Şehirler Arası",
    shipmentType: "mixed",
    desiStart: 1,
    desiEnd: 10,
    pricingModel: "fixed",
    basePrice: 140,
  },
]

export const mockExtraServiceCatalog = {
  pickup: 25,
  mobileDelivery: 30,
  cod: 20,
}
