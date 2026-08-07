import type { OperationScopeRow } from '../../../customers/[id]/_types/customer-detail'

export type { OperationScopeRow }

export type GlobalOperationScopeStatus = 'active' | 'passive'

export type GlobalOperationScopeRow = OperationScopeRow & {
  status: GlobalOperationScopeStatus
}

/** Tenant geneli hizmet verilebilir coğrafya */
export type GlobalOperationRegionsState = {
  scopes: GlobalOperationScopeRow[]
  updatedAt: string | null
  updatedBy: string | null
}

export type GlobalRegionKpi = {
  cityCount: number
  districtCount: number
  neighborhoodSelectionCount: number
  rowCount: number
}
