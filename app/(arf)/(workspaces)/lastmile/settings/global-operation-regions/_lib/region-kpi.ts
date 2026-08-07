import type { OperationScopeRow } from '../../../customers/[id]/_types/customer-detail'
import type { GlobalRegionKpi } from '../_types/global-regions'

export function countScopeCities(rows: OperationScopeRow[]): number {
  return new Set(rows.map((row) => row.il)).size
}

export function countScopeNeighborhoods(rows: OperationScopeRow[]): number {
  return rows.reduce((sum, row) => {
    if (row.tum_mahalleler) return sum + 1
    return sum + row.mahalleler.length
  }, 0)
}

export function computeGlobalRegionKpi(rows: OperationScopeRow[]): GlobalRegionKpi {
  return {
    cityCount: countScopeCities(rows),
    districtCount: new Set(rows.map((row) => `${row.il}::${row.ilce}`)).size,
    neighborhoodSelectionCount: countScopeNeighborhoods(rows),
    rowCount: rows.length,
  }
}
