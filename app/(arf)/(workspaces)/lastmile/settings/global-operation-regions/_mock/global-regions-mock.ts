import type {
  GlobalOperationRegionsState,
  GlobalOperationScopeRow,
} from '../_types/global-regions'

const INITIAL_SCOPES: GlobalOperationScopeRow[] = [
  {
    id: 'gor-1',
    il: 'İstanbul',
    ilce: 'Beşiktaş',
    mahalleler: [],
    tum_mahalleler: true,
    status: 'active',
  },
  {
    id: 'gor-2',
    il: 'İstanbul',
    ilce: 'Şişli',
    mahalleler: [],
    tum_mahalleler: true,
    status: 'active',
  },
  {
    id: 'gor-3',
    il: 'İstanbul',
    ilce: 'Kadıköy',
    mahalleler: ['Caferağa', 'Moda', 'Osmanağa'],
    tum_mahalleler: false,
    status: 'active',
  },
  {
    id: 'gor-4',
    il: 'Ankara',
    ilce: 'Çankaya',
    mahalleler: [],
    tum_mahalleler: true,
    status: 'passive',
  },
]

let store: GlobalOperationRegionsState = {
  scopes: INITIAL_SCOPES.map((row) => ({ ...row, mahalleler: [...row.mahalleler] })),
  updatedAt: '2026-07-15T11:20:00',
  updatedBy: 'Ayşe Demir',
}

export function getGlobalOperationRegions(): GlobalOperationRegionsState {
  return {
    scopes: store.scopes.map((row) => ({ ...row, mahalleler: [...row.mahalleler] })),
    updatedAt: store.updatedAt,
    updatedBy: store.updatedBy,
  }
}

export function saveGlobalOperationRegions(
  scopes: GlobalOperationScopeRow[],
  updatedBy = 'UI Operator'
): GlobalOperationRegionsState {
  store = {
    scopes: scopes.map((row) => ({ ...row, mahalleler: [...row.mahalleler] })),
    updatedAt: new Date().toISOString(),
    updatedBy,
  }
  return getGlobalOperationRegions()
}
