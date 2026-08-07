import type {
  OptimizeResult,
  OptimizedRoute,
  OrchestratorActiveRoute,
  OrchestratorOrder,
  OrchestratorVehicle,
} from '../_types/orchestrator'

export type ApproveOptimizeResultInput = {
  result: OptimizeResult
  orders: OrchestratorOrder[]
  vehicles: OrchestratorVehicle[]
  existingActiveRoutes: OrchestratorActiveRoute[]
  /** Onaylanan rotaların operasyon günü (YYYY-MM-DD) */
  operationDate: string
  /** Verilirse yalnızca bu rota id'leri onaylanır */
  routeIds?: string[]
}

export type ApproveOptimizeResultOutput = {
  orders: OrchestratorOrder[]
  vehicles: OrchestratorVehicle[]
  approvedRoutes: OrchestratorActiveRoute[]
  approvedOrderIds: string[]
  approvedVehicleIds: string[]
}

function nextRouteLabel(
  existingActiveRoutes: OrchestratorActiveRoute[],
  approvedSoFar: OrchestratorActiveRoute[],
  index: number
): string {
  const used = new Set(
    [...existingActiveRoutes, ...approvedSoFar].map((route) => route.label)
  )
  let n = 4100 + existingActiveRoutes.length + index
  let label = `RT-${n}`
  while (used.has(label)) {
    n += 1
    label = `RT-${n}`
  }
  return label
}

function toActiveRoute(
  route: OptimizedRoute,
  vehicle: OrchestratorVehicle,
  label: string,
  operationDate: string
): OrchestratorActiveRoute {
  const operationalStopCount = route.stops.filter(
    (stop) => stop.kind === 'pickup' || stop.kind === 'delivery'
  ).length

  return {
    id: route.id,
    label,
    status: 'aktif',
    vehicleId: route.vehicleId,
    vehiclePlate: route.vehiclePlate,
    courierName: route.courierName,
    region: vehicle.hizmet_bolgesi,
    color: route.color,
    operationDate,
    orderIds: [...route.orderIds],
    orderCount: route.orderIds.length,
    stopCount: operationalStopCount,
    completedStopCount: 0,
    distanceKm: route.distanceKm,
    durationMin: route.durationMin,
    capacityVolumePct: route.capacityVolumePct,
    capacityWeightPct: route.capacityWeightPct,
    position: vehicle.position,
    polyline: route.polyline,
    stops: route.stops.map((stop) => ({
      ...stop,
      completed: false,
    })),
  }
}

/**
 * Optimizasyon sonucunu onaylar (mock).
 * Backend bağlanınca aynı çıktı şekli API yanıtına map edilebilir.
 */
export function approveOptimizeResult(
  input: ApproveOptimizeResultInput
): ApproveOptimizeResultOutput {
  const { result, orders, vehicles, existingActiveRoutes, operationDate, routeIds } =
    input
  const routesToApprove =
    routeIds != null && routeIds.length > 0
      ? result.routes.filter((route) => routeIds.includes(route.id))
      : result.routes

  const approvedOrderIds = Array.from(
    new Set(routesToApprove.flatMap((route) => route.orderIds))
  )
  const approvedVehicleIds = Array.from(
    new Set(routesToApprove.map((route) => route.vehicleId))
  )
  const approvedOrderIdSet = new Set(approvedOrderIds)
  const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]))

  const approvedRoutes: OrchestratorActiveRoute[] = []
  for (let index = 0; index < routesToApprove.length; index += 1) {
    const route = routesToApprove[index]
    const vehicle = vehicleById.get(route.vehicleId)
    if (!vehicle) continue
    const label = nextRouteLabel(existingActiveRoutes, approvedRoutes, index)
    approvedRoutes.push(toActiveRoute(route, vehicle, label, operationDate))
  }

  const routeByVehicleId = new Map(
    approvedRoutes.map((route) => [route.vehicleId, route])
  )

  const nextOrders = orders.map((order) => {
    if (!approvedOrderIdSet.has(order.id)) return order
    const route = routesToApprove.find((item) => item.orderIds.includes(order.id))
    return {
      ...order,
      durum: 'yolda' as const,
      atanan_arac: route?.vehiclePlate ?? order.atanan_arac,
      atanan_kurye: route?.courierName ?? order.atanan_kurye,
    }
  })

  const nextVehicles = vehicles.map((vehicle) => {
    const route = routeByVehicleId.get(vehicle.id)
    if (!route) return vehicle
    return {
      ...vehicle,
      durum: 'yolda' as const,
      aktif_rota_id: route.id,
      aktif_rota_label: route.label,
      aktif_rota_durak_sayisi: route.stopCount,
      aktif_rota_siparis_sayisi: route.orderCount,
      doluluk_hacim_pct: route.capacityVolumePct,
      doluluk_agirlik_pct: route.capacityWeightPct,
      gunluk_rota_sayisi: Math.max(1, vehicle.gunluk_rota_sayisi + 1),
    }
  })

  return {
    orders: nextOrders,
    vehicles: nextVehicles,
    approvedRoutes,
    approvedOrderIds,
    approvedVehicleIds,
  }
}

/** Seed + oturumda onaylanan rotaları birleştir (aynı araçta oturum rotası öncelikli). */
export function mergeActiveRoutes(
  seedRoutes: OrchestratorActiveRoute[],
  sessionRoutes: OrchestratorActiveRoute[]
): OrchestratorActiveRoute[] {
  if (sessionRoutes.length === 0) return seedRoutes
  const sessionVehicleIds = new Set(sessionRoutes.map((route) => route.vehicleId))
  const sessionIds = new Set(sessionRoutes.map((route) => route.id))
  const kept = seedRoutes.filter(
    (route) =>
      !sessionVehicleIds.has(route.vehicleId) && !sessionIds.has(route.id)
  )
  return [...kept, ...sessionRoutes].sort((a, b) =>
    a.label.localeCompare(b.label, 'tr')
  )
}
