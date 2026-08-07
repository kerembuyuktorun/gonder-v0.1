import type {
  OptimizedRoute,
  OptimizedRouteStop,
  OrchestratorActiveRoute,
  OrchestratorActiveRouteStop,
  RouteStopKind,
} from '../_types/orchestrator'
import { withUpdatedRouteMetrics } from './route-geometry'

function splitAnchors<T extends { kind: RouteStopKind }>(stops: T[]) {
  const start = stops.find((stop) => stop.kind === 'depot_start') ?? null
  const end = stops.find((stop) => stop.kind === 'depot_end') ?? null
  const middle = stops.filter(
    (stop) => stop.kind !== 'depot_start' && stop.kind !== 'depot_end'
  )
  return { start, end, middle }
}

/** Onay bekleyen: tüm operasyonel duraklar yeniden sıralanır */
export function reorderPendingRouteStops(
  route: OptimizedRoute,
  orderedOperationalStopIds: string[]
): OptimizedRoute {
  const { start, end, middle } = splitAnchors(route.stops)
  const byId = new Map(middle.map((stop) => [stop.id, stop]))
  const reordered: OptimizedRouteStop[] = []
  for (const id of orderedOperationalStopIds) {
    const stop = byId.get(id)
    if (stop) {
      reordered.push(stop)
      byId.delete(id)
    }
  }
  for (const leftover of byId.values()) reordered.push(leftover)

  const nextStops = [
    ...(start ? [start] : []),
    ...reordered,
    ...(end ? [end] : []),
  ]
  return withUpdatedRouteMetrics(route, nextStops)
}

/**
 * Aktif rota: completed operasyonel + depot_start kilitli önde;
 * yalnızca incomplete operasyoneller sürüklenir; depot_end sonda.
 */
export function reorderActiveRouteStops(
  route: OrchestratorActiveRoute,
  orderedIncompleteStopIds: string[]
): OrchestratorActiveRoute {
  const { start, end, middle } = splitAnchors(route.stops)
  const locked = middle.filter((stop) => stop.completed)
  const movable = middle.filter((stop) => !stop.completed)
  const byId = new Map(movable.map((stop) => [stop.id, stop]))
  const reordered: OrchestratorActiveRouteStop[] = []
  for (const id of orderedIncompleteStopIds) {
    const stop = byId.get(id)
    if (stop) {
      reordered.push(stop)
      byId.delete(id)
    }
  }
  for (const leftover of byId.values()) reordered.push(leftover)

  const nextStops: OrchestratorActiveRouteStop[] = [
    ...(start ? [start] : []),
    ...locked,
    ...reordered,
    ...(end ? [end] : []),
  ]

  return {
    ...withUpdatedRouteMetrics(route, nextStops),
    completedStopCount: locked.length,
  }
}
