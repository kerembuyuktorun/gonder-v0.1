'use client'

import type {
  OptimizedRoute,
  OrchestratorActiveRoute,
  OrchestratorOrder,
} from '../_types/orchestrator'
import { PendingRouteDetail } from './pending-route-detail'

type Props = {
  route: OrchestratorActiveRoute
  orders: OrchestratorOrder[]
  usedColors: string[]
  onChangeColor: (color: string) => void
  onRemoveOrder?: (orderId: string) => void
  onReorderOperationalStops?: (orderedStopIds: string[]) => void
  hideSummary?: boolean
}

function toOptimizedRoute(route: OrchestratorActiveRoute): OptimizedRoute {
  return {
    id: route.id,
    vehicleId: route.vehicleId,
    vehiclePlate: route.vehiclePlate,
    courierName: route.courierName,
    color: route.color,
    orderIds: route.orderIds,
    stops: route.stops.map(({ completed: _completed, ...stop }) => stop),
    polyline: route.polyline,
    stopCount: route.stopCount,
    distanceKm: route.distanceKm,
    durationMin: route.durationMin,
    capacityVolumePct: route.capacityVolumePct,
    capacityWeightPct: route.capacityWeightPct,
    warnings: [],
  }
}

export function ActiveRouteDetail({
  route,
  orders,
  usedColors,
  onChangeColor,
  onRemoveOrder,
  onReorderOperationalStops,
  hideSummary = false,
}: Props) {
  const completedStopIds = new Set(
    route.stops.filter((stop) => stop.completed).map((stop) => stop.id)
  )
  const draggableStopIds = new Set(
    route.stops
      .filter(
        (stop) =>
          !stop.completed && (stop.kind === 'pickup' || stop.kind === 'delivery')
      )
      .map((stop) => stop.id)
  )

  return (
    <PendingRouteDetail
      route={toOptimizedRoute(route)}
      orders={orders}
      completedStopIds={completedStopIds}
      draggableStopIds={draggableStopIds}
      usedColors={usedColors}
      onChangeColor={onChangeColor}
      onRemoveOrder={onRemoveOrder}
      onReorderOperationalStops={onReorderOperationalStops}
      hideSummary={hideSummary}
    />
  )
}
