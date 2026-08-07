import {
  buildOrchestratorOrders,
  buildOrchestratorVehicles,
} from '../_mock/orchestrator-mock'
import type { OrchestratorOrder, OrchestratorVehicle } from '../_types/orchestrator'
import type { OrchestratorMode } from './orchestrator-mode'

export type OrchestratorCatalogBootstrap = {
  orders: OrchestratorOrder[]
  vehicles: OrchestratorVehicle[]
}

/** İlk render katalogu — demo mock seed, live boş (API hydrate edecek). */
export function bootstrapOrchestratorCatalog(
  mode: OrchestratorMode
): OrchestratorCatalogBootstrap {
  if (mode === 'demo') {
    return {
      orders: buildOrchestratorOrders(),
      vehicles: buildOrchestratorVehicles(),
    }
  }

  return {
    orders: [],
    vehicles: [],
  }
}
