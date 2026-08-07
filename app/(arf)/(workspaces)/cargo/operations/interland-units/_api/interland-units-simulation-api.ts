import { mockBlockedAddressScopes, mockBranchDirectory, mockCityOptions, mockCoverageScopes } from "../_mock/interland-units-simulation-mock-data"
import { simulateInterlandBranchMatching } from "../_lib/interland-branch-matching-engine"
import type {
  BlockedAddressScope,
  BranchSummary,
  InterlandCoverageScope,
  InterlandSimulationInitialData,
  InterlandUnitsSimulationInput,
  InterlandUnitsSimulationResult,
} from "../_types"

// TODO: Remove mock when API is ready
export async function fetchInterlandCoverageScopes(): Promise<InterlandCoverageScope[]> {
  return [...mockCoverageScopes]
}

// TODO: Remove mock when API is ready
export async function fetchBranchDirectory(): Promise<BranchSummary[]> {
  return [...mockBranchDirectory]
}

// TODO: Remove mock when API is ready
export async function fetchBlockedInterlands(): Promise<BlockedAddressScope[]> {
  return [...mockBlockedAddressScopes]
}

// TODO: Remove mock when API is ready
export async function fetchInterlandSimulationInitialData(): Promise<InterlandSimulationInitialData> {
  return {
    cityOptions: [...mockCityOptions],
  }
}

// TODO: Remove mock when API is ready
export async function simulateInterlandUnits(
  input: InterlandUnitsSimulationInput,
): Promise<InterlandUnitsSimulationResult> {
  const [scopes, branches, blockedScopes] = await Promise.all([
    fetchInterlandCoverageScopes(),
    fetchBranchDirectory(),
    fetchBlockedInterlands(),
  ])

  return simulateInterlandBranchMatching({
    input,
    scopes,
    branches,
    blockedScopes,
  })
}
