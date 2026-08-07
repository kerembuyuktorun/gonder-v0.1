import type { OrderType } from '../../../orders/_types/order'
import type {
  LatLng,
  OptimizeResult,
  OptimizeSettings,
  OptimizedRoute,
  OptimizedRouteStop,
  OrchestratorOrder,
  OrchestratorVehicle,
  UnmatchedOrderInfo,
} from '../_types/orchestrator'
import { ORCHESTRATOR_FACILITY } from '../_mock/orchestrator-mock'
import {
  getVehicleRouteReturnAnchor,
  getVehicleRouteStartAnchor,
} from './vehicle-route-anchor'
import { pickNextRouteColors } from './route-colors'
import {
  FALLBACK_ORDER_SKILLS,
  vehicleSkillsMatchOrderRequirements,
} from '../../../_lib/skill-catalog'

const FACILITY_PICKUP_TYPES = new Set<OrderType>([
  'dagitim',
  'gel_al',
  'kurulumlu_teslimat',
  'degisim',
])

const FACILITY_DELIVERY_TYPES = new Set<OrderType>(['toplama', 'iade'])

function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function interpolate(a: LatLng, b: LatLng, steps: number): LatLng[] {
  const points: LatLng[] = []
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps
    points.push({
      lat: a.lat + (b.lat - a.lat) * t,
      lng: a.lng + (b.lng - a.lng) * t,
    })
  }
  return points
}

function buildPolyline(points: LatLng[]): LatLng[] {
  if (points.length === 0) return []
  const line: LatLng[] = [points[0]]
  for (let i = 1; i < points.length; i += 1) {
    line.push(...interpolate(points[i - 1], points[i], 6), points[i])
  }
  return line
}

function locationKey(pos: LatLng): string {
  return `${pos.lat.toFixed(5)},${pos.lng.toFixed(5)}`
}

function skillMatch(order: OrchestratorOrder, vehicle: OrchestratorVehicle): boolean {
  if (
    !vehicleSkillsMatchOrderRequirements(
      vehicle.yetenekler,
      order.gereksinimler,
      FALLBACK_ORDER_SKILLS
    )
  ) {
    return false
  }

  if (order.agirlik_kg > vehicle.max_agirlik_kg) return false
  if (order.toplam_hacim > vehicle.max_hacim_m3) return false

  return true
}

function explainUnmatched(
  order: OrchestratorOrder,
  buckets: Array<{
    vehicle: OrchestratorVehicle
    orders: OrchestratorOrder[]
    volumeUsed: number
    weightUsed: number
  }>,
  settings: OptimizeSettings
): { reasonCode: string; reason: string } {
  if (buckets.length === 0) {
    return {
      reasonCode: 'NO_FEASIBLE_SLOT',
      reason: 'Seçili geçerli araç yok',
    }
  }

  let stopBlocked = 0
  let skillBlocked = 0
  let capacityBlocked = 0
  let capacityExceededAlone = 0
  let passiveBlocked = 0

  for (const bucket of buckets) {
    const nextOrders = [...bucket.orders, order]
    const estimatedStops = estimateOperationalStops(nextOrders)
    if (estimatedStops > settings.maxStopsPerRoute) {
      stopBlocked += 1
      continue
    }
    if (settings.respectSkills && !skillMatch(order, bucket.vehicle)) {
      skillBlocked += 1
      continue
    }
    if (settings.respectShifts && bucket.vehicle.durum === 'pasif') {
      passiveBlocked += 1
      continue
    }
    if (
      settings.respectCapacity &&
      (order.agirlik_kg > bucket.vehicle.max_agirlik_kg ||
        order.toplam_hacim > bucket.vehicle.max_hacim_m3)
    ) {
      capacityExceededAlone += 1
      continue
    }
    const nextVolume = bucket.volumeUsed + order.toplam_hacim
    const nextWeight = bucket.weightUsed + order.agirlik_kg
    if (
      settings.respectCapacity &&
      (nextVolume > bucket.vehicle.max_hacim_m3 ||
        nextWeight > bucket.vehicle.max_agirlik_kg)
    ) {
      capacityBlocked += 1
      continue
    }
  }

  const n = buckets.length
  if (skillBlocked === n) {
    return {
      reasonCode: 'NO_SKILL_MATCH',
      reason: 'Uygun yetenekli araç yok (örn. soğuk zincir)',
    }
  }
  if (capacityExceededAlone === n) {
    return {
      reasonCode: 'CAPACITY_EXCEEDED',
      reason: 'Kapasite yetersiz — sipariş hiçbir araca sığmıyor',
    }
  }
  if (stopBlocked === n) {
    return {
      reasonCode: 'MAX_STOPS_REACHED',
      reason: 'Max durak limiti aşıldı',
    }
  }
  if (passiveBlocked === n) {
    return {
      reasonCode: 'TIME_WINDOW_UNREACHABLE',
      reason: 'Uygun vardiya / aktif araç yok',
    }
  }
  if (capacityBlocked === n || capacityBlocked > 0) {
    return {
      reasonCode: 'CAPACITY_TIGHT',
      reason: 'Kapasite veya yük dağılımı uygun değil',
    }
  }
  if (skillBlocked > 0) {
    return {
      reasonCode: 'NO_SKILL_MATCH',
      reason: 'Yetenek kısıtı',
    }
  }
  return {
    reasonCode: 'NO_FEASIBLE_SLOT',
    reason: 'Kısıtlar nedeniyle yerleştirilemedi',
  }
}

function sortOrders(
  orders: OrchestratorOrder[],
  settings: OptimizeSettings
): OrchestratorOrder[] {
  const copy = [...orders]
  if (settings.objective === 'min_time') {
    return copy.sort((a, b) => b.oncelik_puani - a.oncelik_puani)
  }
  if (settings.objective === 'min_distance') {
    const depot = ORCHESTRATOR_FACILITY.position
    return copy.sort(
      (a, b) =>
        haversineKm(depot, a.delivery) - haversineKm(depot, b.delivery)
    )
  }
  return copy.sort((a, b) => b.oncelik_puani - a.oncelik_puani)
}

function sortOrdersFromPoint(
  orders: OrchestratorOrder[],
  from: LatLng,
  settings: OptimizeSettings,
  getTarget: (order: OrchestratorOrder) => LatLng
): OrchestratorOrder[] {
  const copy = [...orders]
  if (settings.objective === 'min_distance') {
    return copy.sort(
      (a, b) => haversineKm(from, getTarget(a)) - haversineKm(from, getTarget(b))
    )
  }
  if (settings.objective === 'min_time') {
    return copy.sort((a, b) => b.oncelik_puani - a.oncelik_puani)
  }
  return copy.sort((a, b) => b.oncelik_puani - a.oncelik_puani)
}

type LocationGroup = {
  key: string
  position: LatLng
  label: string
  orders: OrchestratorOrder[]
}

function groupOrdersByLocation(
  orders: OrchestratorOrder[],
  getPosition: (order: OrchestratorOrder) => LatLng,
  getLabel: (order: OrchestratorOrder) => string
): LocationGroup[] {
  const map = new Map<string, LocationGroup>()

  for (const order of orders) {
    const position = getPosition(order)
    const key = locationKey(position)
    const existing = map.get(key)
    if (existing) {
      existing.orders.push(order)
    } else {
      map.set(key, {
        key,
        position,
        label: getLabel(order),
        orders: [order],
      })
    }
  }

  return Array.from(map.values())
}

function sortGroupsNearest(
  groups: LocationGroup[],
  from: LatLng | null,
  settings: OptimizeSettings
): LocationGroup[] {
  if (groups.length <= 1) return groups
  if (settings.objective !== 'min_distance' || from == null) {
    return groups
  }

  const remaining = [...groups]
  const sorted: LocationGroup[] = []
  let cursor = from

  while (remaining.length > 0) {
    let bestIndex = 0
    let bestDistance = haversineKm(cursor, remaining[0].position)
    for (let i = 1; i < remaining.length; i += 1) {
      const distance = haversineKm(cursor, remaining[i].position)
      if (distance < bestDistance) {
        bestDistance = distance
        bestIndex = i
      }
    }
    const [next] = remaining.splice(bestIndex, 1)
    sorted.push(next)
    cursor = next.position
  }

  return sorted
}

type StopDraft = Omit<OptimizedRouteStop, 'sequence'>

function makeStop(
  draft: Omit<StopDraft, 'orderId' | 'orderIds'> & {
    orders: OrchestratorOrder[]
    locationLabel?: string
  }
): StopDraft {
  const orderIds = draft.orders.map((order) => order.id)
  return {
    id: draft.id,
    kind: draft.kind,
    orderId: orderIds.length === 1 ? orderIds[0] : null,
    orderIds,
    label: draft.label,
    locationLabel: draft.locationLabel,
    position: draft.position,
  }
}

/** Aktif rota kalan-optimizasyonu için de kullanılır */
export function buildLegStops(
  orders: OrchestratorOrder[],
  settings: OptimizeSettings,
  cursor: LatLng | null
): { stops: StopDraft[]; cursor: LatLng | null } {
  const stops: StopDraft[] = []
  let current = cursor

  const fromFacility = orders.filter((order) => FACILITY_PICKUP_TYPES.has(order.siparis_tipi))
  const toFacility = orders.filter((order) => FACILITY_DELIVERY_TYPES.has(order.siparis_tipi))
  const transfers = orders.filter((order) => order.siparis_tipi === 'transfer')

  const pickupGroups = sortGroupsNearest(
    groupOrdersByLocation(fromFacility, (order) => order.pickup, (order) => order.alis_noktasi),
    current,
    settings
  )

  for (const group of pickupGroups) {
    stops.push(
      makeStop({
        id: `pickup-facility-${group.key}`,
        kind: 'pickup',
        label: group.label,
        locationLabel: group.label,
        position: group.position,
        orders: group.orders,
      })
    )
    current = group.position

    const deliverySequence = sortOrdersFromPoint(
      group.orders,
      group.position,
      settings,
      (order) => order.delivery
    )

    for (const order of deliverySequence) {
      stops.push(
        makeStop({
          id: `${order.id}-delivery`,
          kind: 'delivery',
          label: order.varis_noktasi,
          position: order.delivery,
          orders: [order],
        })
      )
      current = order.delivery
    }
  }

  if (toFacility.length > 0) {
    const addressPickupGroups = sortGroupsNearest(
      groupOrdersByLocation(
        toFacility,
        (order) => order.pickup,
        (order) => order.alis_noktasi
      ),
      current,
      settings
    )

    for (const group of addressPickupGroups) {
      stops.push(
        makeStop({
          id: `pickup-address-${group.key}`,
          kind: 'pickup',
          label: group.label,
          locationLabel: group.label,
          position: group.position,
          orders: group.orders,
        })
      )
      current = group.position
    }

    const facilityDeliveryGroups = groupOrdersByLocation(
      toFacility,
      (order) => order.delivery,
      (order) => order.varis_noktasi
    )

    for (const group of facilityDeliveryGroups) {
      stops.push(
        makeStop({
          id: `delivery-${group.key}`,
          kind: 'delivery',
          label: group.label,
          locationLabel: group.label,
          position: group.position,
          orders: group.orders,
        })
      )
      current = group.position
    }
  }

  const transferSequence = sortOrdersFromPoint(
    transfers,
    current ?? transfers[0]?.pickup ?? ORCHESTRATOR_FACILITY.position,
    settings,
    (order) => order.pickup
  )

  for (const order of transferSequence) {
    stops.push(
      makeStop({
        id: `${order.id}-pickup`,
        kind: 'pickup',
        label: order.alis_noktasi,
        position: order.pickup,
        orders: [order],
      })
    )
    stops.push(
      makeStop({
        id: `${order.id}-delivery`,
        kind: 'delivery',
        label: order.varis_noktasi,
        position: order.delivery,
        orders: [order],
      })
    )
    current = order.delivery
  }

  return { stops, cursor: current }
}

function estimateOperationalStops(orders: OrchestratorOrder[]): number {
  let count = 0

  const fromFacility = orders.filter((order) => FACILITY_PICKUP_TYPES.has(order.siparis_tipi))
  count += groupOrdersByLocation(
    fromFacility,
    (order) => order.pickup,
    (order) => order.alis_noktasi
  ).length
  count += fromFacility.length

  const toFacility = orders.filter((order) => FACILITY_DELIVERY_TYPES.has(order.siparis_tipi))
  count += groupOrdersByLocation(
    toFacility,
    (order) => order.pickup,
    (order) => order.alis_noktasi
  ).length
  count += groupOrdersByLocation(
    toFacility,
    (order) => order.delivery,
    (order) => order.varis_noktasi
  ).length

  count += orders.filter((order) => order.siparis_tipi === 'transfer').length * 2

  return count
}

/**
 * Mock VRP: seçili siparişleri seçili araçlara dağıtır.
 * Aynı koordinattaki tesis alımları / tesis teslimleri tek durakta birleştirilir.
 */
export function runMockOptimize(input: {
  orders: OrchestratorOrder[]
  vehicles: OrchestratorVehicle[]
  settings: OptimizeSettings
  /** Sahadaki aktif rota renkleri — yeni rotalar boş renklerden seçilir */
  occupiedColors?: string[]
}): OptimizeResult {
  const { settings } = input
  const vehicles = input.vehicles.filter((v) => v.selectable)
  const orders = sortOrders(input.orders, settings)
  const occupiedColors = input.occupiedColors ?? []

  if (vehicles.length === 0 || orders.length === 0) {
    const unmatchedOrders: UnmatchedOrderInfo[] = orders.map((order) => ({
      orderId: order.id,
      reasonCode: 'NO_FEASIBLE_SLOT',
      reason: 'Seçili geçerli araç yok',
    }))
    return {
      routes: [],
      unmatchedOrderIds: unmatchedOrders.map((item) => item.orderId),
      unmatchedOrders,
      warnings: ['Optimizasyon için en az bir sipariş ve bir geçerli araç gerekli'],
      totals: {
        stopCount: 0,
        distanceKm: 0,
        durationMin: 0,
        vehicleCount: 0,
        orderCount: 0,
      },
    }
  }

  const fleet =
    settings.objective === 'min_vehicles'
      ? vehicles.slice(0, Math.max(1, Math.ceil(orders.length / 4)))
      : vehicles

  type Bucket = {
    vehicle: OrchestratorVehicle
    orders: OrchestratorOrder[]
    volumeUsed: number
    weightUsed: number
    warnings: string[]
  }

  const buckets: Bucket[] = fleet.map((vehicle) => ({
    vehicle,
    orders: [],
    volumeUsed: 0,
    weightUsed: 0,
    warnings: [],
  }))

  const unmatchedOrders: UnmatchedOrderInfo[] = []
  const globalWarnings: string[] = []

  for (const order of orders) {
    let placed = false

    const ranked = [...buckets].sort((a, b) => {
      if (settings.objective === 'balanced') {
        return a.orders.length - b.orders.length
      }
      return a.weightUsed - b.weightUsed
    })

    for (const bucket of ranked) {
      const nextOrders = [...bucket.orders, order]
      const estimatedStops = estimateOperationalStops(nextOrders)
      if (estimatedStops > settings.maxStopsPerRoute) continue

      if (settings.respectSkills && !skillMatch(order, bucket.vehicle)) {
        continue
      }

      if (settings.respectShifts && bucket.vehicle.durum === 'pasif') {
        continue
      }

      const nextVolume = bucket.volumeUsed + order.toplam_hacim
      const nextWeight = bucket.weightUsed + order.agirlik_kg
      if (
        settings.respectCapacity &&
        (nextVolume > bucket.vehicle.max_hacim_m3 ||
          nextWeight > bucket.vehicle.max_agirlik_kg)
      ) {
        continue
      }

      bucket.orders.push(order)
      bucket.volumeUsed = nextVolume
      bucket.weightUsed = nextWeight
      placed = true
      break
    }

    if (!placed) {
      const explained = explainUnmatched(order, buckets, settings)
      unmatchedOrders.push({
        orderId: order.id,
        reasonCode: explained.reasonCode,
        reason: explained.reason,
      })
    }
  }

  const routes: OptimizedRoute[] = []

  const routeBuckets = buckets.filter((bucket) => bucket.orders.length > 0)
  const assignedColors = pickNextRouteColors(routeBuckets.length, occupiedColors)

  routeBuckets.forEach((bucket, index) => {
    const depot = ORCHESTRATOR_FACILITY.position
    const startAnchor = getVehicleRouteStartAnchor(bucket.vehicle)
    const start = startAnchor.position
    const pathPoints: LatLng[] = [start]
    const stops: OptimizedRouteStop[] = [
      {
        id: `${bucket.vehicle.id}-start`,
        sequence: 1,
        kind: 'depot_start',
        orderId: null,
        orderIds: [],
        label: 'Başlangıç',
        locationLabel: startAnchor.title,
        locationHint: startAnchor.subtitle ?? undefined,
        locationTooltip: startAnchor.tooltip ?? undefined,
        openAddress: startAnchor.openAddress ?? undefined,
        scheduledTime: `${new Date().toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })} · ${bucket.vehicle.vardiya_baslangic}`,
        position: start,
      },
    ]

    const { stops: legStops } = buildLegStops(bucket.orders, settings, start)

    let seq = 2
    let distanceKm = haversineKm(start, legStops[0]?.position ?? depot) * 0.15
    let durationMin = 8

    for (const draft of legStops) {
      const prev = pathPoints[pathPoints.length - 1]
      distanceKm += haversineKm(prev, draft.position)
      durationMin +=
        draft.orderIds.reduce((sum, orderId) => {
          const order = bucket.orders.find((item) => item.id === orderId)
          return sum + (order?.gorev_suresi_dk ?? 0)
        }, 0) +
        (draft.orderIds.length > 1 ? 8 + draft.orderIds.length * 2 : 12)

      stops.push({ ...draft, sequence: seq })
      pathPoints.push(draft.position)
      seq += 1
    }

    if (settings.returnToDepot) {
      const lastPoint = pathPoints[pathPoints.length - 1]
      const returnAnchor = getVehicleRouteReturnAnchor(bucket.vehicle)
      stops.push({
        id: `${bucket.vehicle.id}-end`,
        sequence: seq,
        kind: 'depot_end',
        orderId: null,
        orderIds: [],
        label: 'Araç Park Konumuna Dönüş',
        locationLabel: returnAnchor.title,
        locationTooltip: returnAnchor.tooltip ?? undefined,
        openAddress: returnAnchor.openAddress ?? undefined,
        position: returnAnchor.position,
      })
      pathPoints.push(returnAnchor.position)
      distanceKm += haversineKm(lastPoint, returnAnchor.position)
      durationMin += 10
    }

    if (settings.respectTimeWindows && durationMin > settings.maxRouteDurationMin) {
      bucket.warnings.push('Tahmini süre max rota süresini aşıyor')
    }

    routes.push({
      id: `route-${bucket.vehicle.id}`,
      vehicleId: bucket.vehicle.id,
      vehiclePlate: bucket.vehicle.plaka,
      courierName: bucket.vehicle.zimmetli_surucu,
      color: assignedColors[index] ?? assignedColors[0]!,
      orderIds: bucket.orders.map((o) => o.id),
      stops,
      polyline: buildPolyline(pathPoints),
      stopCount: stops.filter((s) => s.kind === 'pickup' || s.kind === 'delivery').length,
      distanceKm: Math.round(distanceKm * 10) / 10,
      durationMin: Math.round(durationMin),
      capacityVolumePct: Math.min(
        100,
        Math.round((bucket.volumeUsed / Math.max(bucket.vehicle.max_hacim_m3, 0.01)) * 100)
      ),
      capacityWeightPct: Math.min(
        100,
        Math.round((bucket.weightUsed / Math.max(bucket.vehicle.max_agirlik_kg, 1)) * 100)
      ),
      warnings: bucket.warnings,
    })
  })

  const totals = {
    stopCount: routes.reduce((sum, r) => sum + r.stopCount, 0),
    distanceKm: Math.round(routes.reduce((sum, r) => sum + r.distanceKm, 0) * 10) / 10,
    durationMin: routes.reduce((sum, r) => sum + r.durationMin, 0),
    vehicleCount: routes.length,
    orderCount: orders.length - unmatchedOrders.length,
  }

  return {
    routes,
    unmatchedOrderIds: unmatchedOrders.map((item) => item.orderId),
    unmatchedOrders,
    warnings: globalWarnings,
    totals,
  }
}
