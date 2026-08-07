import type {
  ActiveRouteDateScope,
  OptimizeResult,
  OrchestratorActiveRoute,
  OrchestratorOrder,
  OrchestratorStep,
  OrchestratorVehicle,
} from '../_types/orchestrator'

export const ORCHESTRATOR_UNDO_LIMIT = 20

export type OrchestratorUndoSnapshot = {
  label: string
  allOrders: OrchestratorOrder[]
  allVehicles: OrchestratorVehicle[]
  sessionActiveRoutes: OrchestratorActiveRoute[]
  hiddenActiveRouteIds: string[]
  selectedOrderIds: string[]
  selectedVehicleIds: string[]
  selectedActiveRouteIds: string[]
  activeRouteDateScope: ActiveRouteDateScope
  result: OptimizeResult | null
  step: OrchestratorStep
  selectedRouteId: string | null
  detailActiveRouteId: string | null
  leftOpen: boolean
  rightOpen: boolean
  resultPanelOpen: boolean
  resultPanelHeight: number
}

export type OrchestratorUndoEntry = {
  id: string
  label: string
  snapshot: OrchestratorUndoSnapshot
}

export function pushOrchestratorUndo(
  stack: OrchestratorUndoEntry[],
  entry: Omit<OrchestratorUndoEntry, 'id'> & { id?: string },
  limit = ORCHESTRATOR_UNDO_LIMIT
): OrchestratorUndoEntry[] {
  const nextEntry: OrchestratorUndoEntry = {
    id: entry.id ?? `undo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: entry.label,
    snapshot: entry.snapshot,
  }
  return [...stack, nextEntry].slice(-limit)
}
