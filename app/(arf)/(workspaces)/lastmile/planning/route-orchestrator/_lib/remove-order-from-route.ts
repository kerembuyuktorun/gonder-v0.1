import type {
  OptimizedRoute,
  OrchestratorActiveRoute,
  OrchestratorActiveRouteStop,
  OptimizedRouteStop,
} from '../_types/orchestrator'
import { withUpdatedRouteMetrics } from './route-geometry'

export type RemoveOrderFromPendingResult =
  | { kind: 'updated'; route: OptimizedRoute }
  | { kind: 'empty' }

export type RemoveOrderFromActiveResult =
  | { kind: 'updated'; route: OrchestratorActiveRoute }
  | { kind: 'empty' }
  | { kind: 'blocked'; reason: string }

function stripOrderFromStops(
  stops: OptimizedRouteStop[],
  orderId: string
): OptimizedRouteStop[] {
  return stops
    .map((stop) => {
      if (stop.kind !== 'pickup' && stop.kind !== 'delivery') return stop
      if (!stop.orderIds.includes(orderId)) return stop
      const orderIds = stop.orderIds.filter((id) => id !== orderId)
      return {
        ...stop,
        orderIds,
        orderId: orderIds.length === 1 ? orderIds[0]! : null,
      }
    })
    .filter((stop) => {
      if (stop.kind !== 'pickup' && stop.kind !== 'delivery') return true
      return stop.orderIds.length > 0
    })
}

export function removeOrderFromPendingRoute(
  route: OptimizedRoute,
  orderId: string
): RemoveOrderFromPendingResult {
  if (!route.orderIds.includes(orderId)) {
    return { kind: 'updated', route }
  }
  const nextStops = stripOrderFromStops(route.stops, orderId)
  const operationalLeft = nextStops.some(
    (stop) => stop.kind === 'pickup' || stop.kind === 'delivery'
  )
  if (!operationalLeft) return { kind: 'empty' }

  const volumePct = Math.max(
    0,
    Math.round(route.capacityVolumePct * (1 - 1 / Math.max(route.orderIds.length, 1)))
  )
  const weightPct = Math.max(
    0,
    Math.round(route.capacityWeightPct * (1 - 1 / Math.max(route.orderIds.length, 1)))
  )

  return {
    kind: 'updated',
    route: {
      ...withUpdatedRouteMetrics(route, nextStops),
      capacityVolumePct: volumePct,
      capacityWeightPct: weightPct,
    },
  }
}

export function removeOrderFromActiveRoute(
  route: OrchestratorActiveRoute,
  orderId: string
): RemoveOrderFromActiveResult {
  if (!route.orderIds.includes(orderId)) {
    return { kind: 'updated', route }
  }

  const lockedByCompleted = route.stops.some(
    (stop) =>
      stop.completed &&
      (stop.kind === 'pickup' || stop.kind === 'delivery') &&
      stop.orderIds.includes(orderId)
  )
  if (lockedByCompleted) {
    return {
      kind: 'blocked',
      reason: 'Alımı veya teslimi tamamlanan sipariş çıkarılamaz',
    }
  }

  const nextStops = stripOrderFromStops(
    route.stops,
    orderId
  ) as OrchestratorActiveRouteStop[]
  const operationalLeft = nextStops.some(
    (stop) => stop.kind === 'pickup' || stop.kind === 'delivery'
  )
  if (!operationalLeft) return { kind: 'empty' }

  const completedStopCount = nextStops.filter(
    (stop) =>
      stop.completed && (stop.kind === 'pickup' || stop.kind === 'delivery')
  ).length

  return {
    kind: 'updated',
    route: {
      ...withUpdatedRouteMetrics(route, nextStops),
      completedStopCount,
    },
  }
}
