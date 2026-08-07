import type {
  AddressSelection,
  BlockedAddressScope,
  BranchSummary,
  InterlandAddressMatchResult,
  InterlandCoverageScope,
  InterlandUnitsSimulationInput,
  InterlandUnitsSimulationResult,
  MatchLevel,
  MatchStatus,
} from "../_types"

interface MatchEnginePayload {
  input: InterlandUnitsSimulationInput
  scopes: InterlandCoverageScope[]
  branches: BranchSummary[]
  blockedScopes: BlockedAddressScope[]
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("tr-TR")
}

function matchLevelForAddress(scope: InterlandCoverageScope, address: AddressSelection): MatchLevel {
  const sameCity = normalize(scope.city) === normalize(address.city)
  const sameDistrict = normalize(scope.district) === normalize(address.district)
  const sameNeighborhood = normalize(scope.neighborhood) === normalize(address.neighborhood)

  if (sameCity && sameDistrict && sameNeighborhood) {
    return "city_neighborhood"
  }

  if (sameCity && sameDistrict) {
    return "city_district"
  }

  if (sameCity) {
    return "city"
  }

  return "none"
}

function statusFromLevel(level: MatchLevel): MatchStatus {
  if (level === "city_neighborhood") return "matched"
  if (level === "city_district" || level === "city") return "partial"
  return "not_found"
}

function findBlockedScope(address: AddressSelection, blockedScopes: BlockedAddressScope[]) {
  return blockedScopes.find((scope) => {
    const sameCity = normalize(scope.city) === normalize(address.city)
    const sameDistrict = normalize(scope.district) === normalize(address.district)
    const sameNeighborhood = normalize(scope.neighborhood) === normalize(address.neighborhood)

    return sameCity && sameDistrict && sameNeighborhood
  })
}

function matchAddress(
  address: AddressSelection,
  scopes: InterlandCoverageScope[],
  branches: BranchSummary[],
  blockedScopes: BlockedAddressScope[],
): InterlandAddressMatchResult {
  const blocked = findBlockedScope(address, blockedScopes)
  if (blocked) {
    return {
      meta: {
        status: "blocked",
        matchedLevel: "none",
        reason: blocked.reason,
      },
    }
  }

  const candidates = scopes
    .map((scope) => ({
      scope,
      level: matchLevelForAddress(scope, address),
    }))
    .filter((item) => item.level !== "none")

  if (candidates.length === 0) {
    return {
      meta: {
        status: "not_found",
        matchedLevel: "none",
        reason: "Adres için kapsam eşleşmesi bulunamadı.",
      },
    }
  }

  const levelRank: Record<Exclude<MatchLevel, "none">, number> = {
    city_neighborhood: 3,
    city_district: 2,
    city: 1,
  }

  const winner = [...candidates].sort((left, right) => {
    const levelDiff = levelRank[right.level as Exclude<MatchLevel, "none">] - levelRank[left.level as Exclude<MatchLevel, "none">]
    if (levelDiff !== 0) return levelDiff

    const priorityDiff = right.scope.priority - left.scope.priority
    if (priorityDiff !== 0) return priorityDiff

    return right.scope.updatedAt.localeCompare(left.scope.updatedAt)
  })[0]

  const branch = branches.find((item) => item.branchId === winner.scope.branchId)

  if (!branch) {
    return {
      meta: {
        scopeId: winner.scope.id,
        status: "not_found",
        matchedLevel: winner.level,
        reason: "Eşleşen kapsam için bağlı şube kaydı bulunamadı.",
      },
    }
  }

  return {
    branch,
    meta: {
      scopeId: winner.scope.id,
      matchedLevel: winner.level,
      status: statusFromLevel(winner.level),
      reason: winner.level === "city_neighborhood" ? "Tam mahalle eşleşmesi." : "Fallback eşleşme (il/ilçe düzeyi).",
    },
  }
}

export function simulateInterlandBranchMatching({ input, scopes, branches, blockedScopes }: MatchEnginePayload): InterlandUnitsSimulationResult {
  return {
    sender: matchAddress(input.senderAddress, scopes, branches, blockedScopes),
    receiver: matchAddress(input.receiverAddress, scopes, branches, blockedScopes),
  }
}
