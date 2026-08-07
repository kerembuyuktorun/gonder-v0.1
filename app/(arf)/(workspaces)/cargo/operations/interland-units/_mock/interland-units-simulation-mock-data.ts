// TODO: Remove when API is ready

import { blockedInterlandStore, getInterlandDetailById, mockBranches, mockInterlands } from "../../../settings/interlands/_mock/interlands-mock-data"
import type { BlockedAddressScope, BranchSummary, CityOption, InterlandCoverageScope } from "../_types"

function parseBlockedName(name: string): { city: string; district: string; neighborhood: string } {
  const [locationPart, neighborhoodPart] = name.split("/").map((part) => part.trim())
  const [city = name, ...districtParts] = (locationPart ?? name).split(" ")
  const district = districtParts.join(" ") || "Merkez"
  const neighborhood = neighborhoodPart || "Genel"

  return {
    city,
    district,
    neighborhood,
  }
}

const branchCodeMap: Record<string, string> = {
  "1": "SB-001",
  "2": "SB-002",
  "3": "SB-003",
}

export const mockBranchDirectory: BranchSummary[] = mockBranches.map((branch) => ({
  branchId: branch.id,
  branchCode: branchCodeMap[branch.id] ?? `SB-${branch.id}`,
  branchName: branch.name,
  city: branch.name.split(" ")[0] ?? "-",
  district: "Merkez",
  transferCenterName: branch.transferCenterName,
}))

export const mockCoverageScopes: InterlandCoverageScope[] = mockInterlands.flatMap((interland) => {
  const detail = getInterlandDetailById(interland.id)
  const scopeRows = detail?.scopeRows ?? []

  return scopeRows.map((scopeRow, index) => ({
    id: `${interland.id}-${scopeRow.id}`,
    interlandId: interland.id,
    branchId: interland.branchId,
    city: scopeRow.city,
    district: scopeRow.district,
    neighborhood: scopeRow.neighborhood,
    priority: 100 - index,
    updatedAt: interland.updatedAt,
  }))
})

export const mockBlockedAddressScopes: BlockedAddressScope[] = blockedInterlandStore.map((record) => {
  const parsed = parseBlockedName(record.name)
  return {
    id: record.id,
    city: parsed.city,
    district: parsed.district,
    neighborhood: parsed.neighborhood,
    reason: "Bu adres yasaklı interland kapsamında.",
  }
})

export const mockCityOptions: CityOption[] = Object.values(
  mockCoverageScopes.reduce<Record<string, CityOption>>((accumulator, scope) => {
    const existingCity = accumulator[scope.city] ?? {
      name: scope.city,
      districts: [],
    }

    const districtIndex = existingCity.districts.findIndex((district) => district.name === scope.district)
    if (districtIndex === -1) {
      existingCity.districts.push({ name: scope.district, neighborhoods: [scope.neighborhood] })
    } else {
      const district = existingCity.districts[districtIndex]
      if (!district.neighborhoods.includes(scope.neighborhood)) {
        district.neighborhoods.push(scope.neighborhood)
      }
    }

    accumulator[scope.city] = {
      ...existingCity,
      districts: existingCity.districts
        .map((district) => ({
          ...district,
          neighborhoods: [...district.neighborhoods].sort((a, b) => a.localeCompare(b, "tr")),
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "tr")),
    }

    return accumulator
  }, {}),
).sort((a, b) => a.name.localeCompare(b.name, "tr"))
