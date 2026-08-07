import { mapBackendOrderToLastmileOrder } from '../../../orders/_lib/map-order-list'
import type {
  LatLng,
  OptimizeObjective,
  OptimizeResult,
  OptimizeSettings,
  OptimizedRoute,
  OptimizedRouteStop,
  OrchestratorActiveRoute,
  OrchestratorActiveRouteStop,
  OrchestratorOrder,
  OrchestratorRouteStatus,
  OrchestratorVehicle,
  RouteStopKind,
  UnmatchedOrderInfo,
} from '../_types/orchestrator'
import type { VehicleOperationalStatus } from '../../../resources/vehicles/_types/vehicle'
import { filterImplicitSkillCodes } from '../../../_lib/skill-catalog'
import { isSparseRoadGeometry } from '../_lib/route-geometry'

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

function asStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }
  return ''
}

function pickNumber(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const n = Number(value)
      if (Number.isFinite(n)) return n
    }
  }
  return 0
}

function pickLatLng(input: unknown): LatLng | null {
  const row = asRecord(input)
  const lat = pickNumber(
    row.lat,
    row.latitude,
    row.Latitude,
    asRecord(row.location).lat,
    asRecord(row.location).latitude
  )
  const lng = pickNumber(
    row.lng,
    row.longitude,
    row.lon,
    row.Longitude,
    asRecord(row.location).lng,
    asRecord(row.location).longitude
  )
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat === 0 && lng === 0) return null
  return { lat, lng }
}

function metersToKm(meters: number): number {
  return Math.round((meters / 1000) * 10) / 10
}

function secondsToMin(seconds: number): number {
  return Math.max(0, Math.round(seconds / 60))
}

function mapRouteStatus(raw: unknown): OrchestratorRouteStatus {
  const value = pickString(raw).toUpperCase()
  if (value === 'STARTED' || value === 'AKTIF') return 'aktif'
  if (value === 'COMPLETED' || value === 'TAMAMLANDI') return 'tamamlandi'
  return 'planlandi'
}

function mapStopKind(raw: unknown): RouteStopKind {
  const value = pickString(raw).toLowerCase()
  if (value === 'vehicle_park_start' || value === 'depot_start' || value === 'start') {
    return 'depot_start'
  }
  if (value === 'depot_end' || value === 'end' || value === 'vehicle_park_end') {
    return 'depot_end'
  }
  if (value === 'delivery') return 'delivery'
  return 'pickup'
}

/** GeoJSON position [lng, lat] or {lat,lng} → LatLng */
function coordPairToLatLng(point: unknown): LatLng | null {
  if (Array.isArray(point) && point.length >= 2) {
    const lng = Number(point[0])
    const lat = Number(point[1])
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    return { lat, lng }
  }
  return pickLatLng(point)
}

/** LineString / MultiLineString coordinates → polyline */
function coordsToPolyline(coords: unknown): LatLng[] {
  if (!Array.isArray(coords) || coords.length === 0) return []
  // MultiLineString: [ [ [lng,lat], ... ], ... ]
  const first = coords[0]
  if (Array.isArray(first) && Array.isArray(first[0])) {
    return coords.flatMap((line) => coordsToPolyline(line))
  }
  return coords
    .map((pair) => coordPairToLatLng(pair))
    .filter((p): p is LatLng => p != null)
}

/**
 * Prefer GeoJSON `geometry` (contract). Fall back to `polyline` only when
 * geometry is missing/unusable — never let an empty/partial polyline hide geometry.
 */
function parseGeoJsonGeometry(geometry: unknown): LatLng[] {
  if (geometry == null) return []
  if (Array.isArray(geometry)) return coordsToPolyline(geometry)

  const geo = asRecord(geometry)
  // Feature: { type: "Feature", geometry: { type, coordinates } }
  if (geo.geometry != null && typeof geo.geometry === 'object') {
    const nested = parseGeoJsonGeometry(geo.geometry)
    if (nested.length > 0) return nested
  }
  return coordsToPolyline(geo.coordinates)
}

function parsePolylineField(polyline: unknown): LatLng[] {
  if (!Array.isArray(polyline)) return []
  return polyline
    .map((point) => coordPairToLatLng(point))
    .filter((p): p is LatLng => p != null)
}

function geometryToPolyline(geometry: unknown, polyline: unknown): LatLng[] {
  const fromGeometry = parseGeoJsonGeometry(geometry)
  if (fromGeometry.length >= 2) return fromGeometry

  const fromPolyline = parsePolylineField(polyline)
  if (fromPolyline.length >= 2) return fromPolyline

  return fromGeometry.length > 0 ? fromGeometry : fromPolyline
}

/** FE `min_time` ↔ BE `min_duration` */
export function toBackendObjective(objective: OptimizeObjective): string {
  if (objective === 'min_time') return 'min_duration'
  return objective
}

export function toBackendSettings(settings: OptimizeSettings) {
  return {
    objective: toBackendObjective(settings.objective),
    maxRouteDurationMin: settings.maxRouteDurationMin,
    maxStopsPerRoute: settings.maxStopsPerRoute,
    respectCapacity: settings.respectCapacity,
    respectTimeWindows: settings.respectTimeWindows,
    respectSkills: settings.respectSkills,
    respectShifts: settings.respectShifts,
    returnToDepot: settings.returnToDepot,
  }
}

export function mapOrderToOrchestratorOrder(raw: unknown): OrchestratorOrder | null {
  const base = mapBackendOrderToLastmileOrder(raw)
  if (!base.id) return null

  const row = asRecord(raw)
  const pickup =
    pickLatLng(row.fromAddress ?? row.from_address ?? row.pickup) ??
    pickLatLng(row.pickupLocation) ??
    { lat: 0, lng: 0 }
  const delivery =
    pickLatLng(row.toAddress ?? row.to_address ?? row.delivery) ??
    pickLatLng(row.deliveryLocation) ??
    { lat: 0, lng: 0 }

  return {
    ...base,
    pickup,
    delivery,
  }
}

function mapDisabledReason(code: string | null): string | null {
  switch (code) {
    case 'ALREADY_ON_ROUTE':
      return 'Aktif veya planlanmış rota var'
    case 'NO_DRIVER':
      return 'Bu aracın atanmış bir sürücüsü bulunmamakta'
    case 'SHIFT_ENDED':
      return 'Vardiya sona ermiş'
    case 'MISSING_PARK':
      return 'Park konumu eksik'
    default:
      return code
  }
}

export function mapPlanningVehicle(raw: unknown): OrchestratorVehicle | null {
  const row = asRecord(raw)
  const id = pickString(row.id)
  if (!id) return null

  const park = asRecord(row.park)
  const live = asRecord(row.live)
  const capacity = asRecord(row.capacity)
  const parkPos =
    pickLatLng(park) ??
    pickLatLng({
      latitude: row.parkLatitude,
      longitude: row.parkLongitude,
    }) ??
    { lat: 0, lng: 0 }
  const livePos = pickLatLng(live) ?? pickLatLng(row.liveLocation)
  const position = livePos ?? parkPos

  const selectable = row.selectable !== false
  const disabledCode = pickString(row.disabledReason) || null
  const plate = pickString(row.plateNo, row.plate, row.plaka)
  const driverName = pickString(
    row.assignedCourierName,
    row.assignedDriverName,
    row.driverName,
    asRecord(row.assignedCourier).fullName,
    asRecord(row.assignedCourier).name,
    asRecord(row.assignedDriver).fullName,
    asRecord(row.assignedDriver).name
  )

  const activeRouteStatus = pickString(row.activeRouteStatus).toUpperCase()
  const hasAssignedRoute =
    Boolean(pickString(row.activeRouteId)) ||
    disabledCode === 'ALREADY_ON_ROUTE' ||
    activeRouteStatus === 'STARTED' ||
    activeRouteStatus === 'CREATED'

  // Rozet: rota varsa "Aktif Rotada" (yolda); seçilemez ≠ filo pasifi
  const durum: VehicleOperationalStatus = hasAssignedRoute
    ? 'yolda'
    : selectable
      ? 'bos_ta'
      : 'pasif'

  const skillsRaw = row.skills ?? row.yetenekler
  const yetenekler = filterImplicitSkillCodes(asStringArray(skillsRaw))

  return {
    id,
    plaka: plate || id.slice(0, 8),
    durum,
    arac_tipi: 'panelvan',
    kasa_tipi: 'kapali_kasa',
    marka: '—',
    model: '—',
    model_yili: 0,
    zimmetli_surucu_id:
      pickString(row.assignedCourierId, row.assignedDriverId) || null,
    zimmetli_surucu: driverName || null,
    hizmet_bolgesi: pickString(park.label, row.region, '—') || '—',
    vardiya_baslangic: pickString(row.shiftStart, '08:00'),
    vardiya_bitis: pickString(row.shiftEnd, '18:00'),
    baslangic_stratejisi: 'sabit_park',
    park_konumu: pickString(park.label) || null,
    park_lat: parkPos.lat || null,
    park_lng: parkPos.lng || null,
    doluluk_hacim_pct: 0,
    doluluk_agirlik_pct: 0,
    yetenekler,
    evrak_uyarilari: [],
    mulkiyet: 'oz_mal',
    max_hacim_m3: pickNumber(capacity.maxVolumeM3, capacity.max_hacim_m3, 12),
    max_agirlik_kg: pickNumber(capacity.maxWeight, capacity.max_agirlik_kg, 1000),
    kasko_police_no: null,
    trafik_sigortasi_bitis: null,
    kasko_bitis: null,
    muayene_bitis: null,
    evraklar: [],
    olusturan: '—',
    olusturulma_zamani: '—',
    aktif_rota_id: pickString(row.activeRouteId) || null,
    aktif_rota_label:
      pickString(row.activeRouteCode, row.activeRouteLabel, row.routeCode) || null,
    aktif_rota_durak_sayisi: null,
    aktif_rota_siparis_sayisi: null,
    position,
    baslangic_konumu: parkPos,
    baslangic_acik_adres: pickString(park.label, park.address) || null,
    position_acik_adres: pickString(live.address) || null,
    gunluk_rota_sayisi: pickNumber(row.dailyRouteCount),
    selectable,
    disabledReason: selectable ? null : mapDisabledReason(disabledCode),
  }
}

/**
 * Unique stop key for map/list/reorder.
 * Shipment DELIVERY yields two stops with the same orderItemId (pickup + delivery) —
 * never use bare orderItemId alone. Preserve BE routeItemId / distinct stop id for APIs.
 * Do not embed `sequence` — it changes on reorder and breaks subsequent orderedStopIds.
 */
function buildStopId(
  row: Record<string, unknown>,
  kind: RouteStopKind,
  index: number
): string {
  const routeItemId = pickString(row.routeItemId)
  const orderItemId = pickString(row.orderItemId)
  const rawId = pickString(row.id)

  // Dedicated ids that are not the shared shipment orderItemId
  if (routeItemId && (!orderItemId || routeItemId !== orderItemId)) {
    return routeItemId
  }
  if (rawId && (!orderItemId || rawId !== orderItemId)) {
    return rawId
  }

  const base = orderItemId || rawId || routeItemId
  if (base) return `${base}:${kind}`
  return `stop-${index}`
}

/** Unix sec/ms or ISO → display string for stop ETA */
function formatStopArrival(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      const trimmed = value.trim()
      if (/^\d+$/.test(trimmed)) {
        const n = Number(trimmed)
        if (Number.isFinite(n) && n > 0) {
          const ms = n > 1e12 ? n : n * 1000
          const d = new Date(ms)
          if (!Number.isNaN(d.getTime())) {
            return d.toLocaleString('tr-TR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          }
        }
      }
      const parsed = new Date(trimmed)
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      }
      return trimmed
    }
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      const ms = value > 1e12 ? value : value * 1000
      const d = new Date(ms)
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      }
    }
  }
  return undefined
}

function mapStopLegDistanceKm(row: Record<string, unknown>): number | undefined {
  const raw = pickNumber(
    row.distance,
    row.distanceM,
    row.legDistanceM,
    row.legDistance
  )
  if (raw <= 0) return undefined
  return raw > 100 ? metersToKm(raw) : Math.round(raw * 10) / 10
}

function mapStopLegDurationMin(row: Record<string, unknown>): number | undefined {
  const raw = pickNumber(
    row.duration,
    row.durationSec,
    row.legDurationSec,
    row.legDuration
  )
  if (raw <= 0) return undefined
  return raw > 180 ? secondsToMin(raw) : Math.max(0, Math.round(raw))
}

function mapDraftStop(raw: unknown, index: number): OptimizedRouteStop {
  const row = asRecord(raw)
  const kind = mapStopKind(row.stepType ?? row.kind ?? row.stopKind)
  const sequence = pickNumber(row.sequence, index)
  const orderId = pickString(row.orderId, row.lastMileOrderId) || null
  const orderIds = orderId
    ? [orderId]
    : Array.isArray(row.orderIds)
      ? row.orderIds.map(String)
      : []
  const position =
    pickLatLng(row) ??
    ({
      lat: pickNumber(row.latitude),
      lng: pickNumber(row.longitude),
    } as LatLng)

  const scheduledTime = formatStopArrival(
    row.arrival,
    row.arrivalAt,
    row.etaAt,
    row.scheduledTime
  )
  const legDistanceKm = mapStopLegDistanceKm(row)
  const legDurationMin = mapStopLegDurationMin(row)

  return {
    id: buildStopId(row, kind, index),
    sequence,
    kind,
    orderId,
    orderIds,
    label:
      kind === 'depot_start'
        ? 'Park / başlangıç'
        : kind === 'delivery'
          ? 'Teslim'
          : 'Alım',
    ...(scheduledTime ? { scheduledTime } : {}),
    ...(legDistanceKm != null ? { legDistanceKm } : {}),
    ...(legDurationMin != null ? { legDurationMin } : {}),
    position,
  }
}

export function mapDraftOptimizeRoute(
  raw: unknown,
  vehicleById: Map<string, OrchestratorVehicle>
): OptimizedRoute | null {
  const row = asRecord(raw)
  const id = pickString(row.id)
  const vehicleId = pickString(row.vehicleId)
  if (!id || !vehicleId) return null

  const vehicle = vehicleById.get(vehicleId)
  const stopsRaw = Array.isArray(row.stops) ? row.stops : []
  const stops = stopsRaw
    .map((stop, index) => mapDraftStop(stop, index + 1))
    .sort((a, b) => a.sequence - b.sequence)
  const distanceM = pickNumber(row.distance, row.distanceM, row.totalDistance)
  const durationS = pickNumber(row.duration, row.durationSec, row.totalDuration)
  const orderIds = Array.isArray(row.orderIds)
    ? row.orderIds.map(String)
    : stops.flatMap((s) => s.orderIds)

  return {
    id,
    vehicleId,
    vehiclePlate: vehicle?.plaka ?? pickString(row.vehiclePlate, '—'),
    courierName: vehicle?.zimmetli_surucu ?? null,
    color: pickString(row.color, '#2563EB') || '#2563EB',
    orderIds: Array.from(new Set(orderIds)),
    stops,
    polyline: geometryToPolyline(row.geometry, row.polyline),
    stopCount: stops.filter((s) => s.kind === 'pickup' || s.kind === 'delivery').length,
    distanceKm: distanceM > 100 ? metersToKm(distanceM) : distanceM,
    durationMin: durationS > 180 ? secondsToMin(durationS) : durationS,
    capacityVolumePct: pickNumber(row.capacityVolumePct),
    capacityWeightPct: pickNumber(row.capacityWeightPct),
    warnings: Array.isArray(row.warnings) ? row.warnings.map(String) : [],
  }
}

export function mapOptimizeResult(
  raw: unknown,
  vehicles: OrchestratorVehicle[]
): OptimizeResult {
  const row = asRecord(raw)
  const vehicleById = new Map(vehicles.map((v) => [v.id, v]))
  const routesRaw = Array.isArray(row.routes) ? row.routes : []
  const routes = routesRaw
    .map((route) => mapDraftOptimizeRoute(route, vehicleById))
    .filter((route): route is OptimizedRoute => route != null)

  const unmatchedRaw = Array.isArray(row.unmatchedOrders) ? row.unmatchedOrders : []
  const unmatchedOrders: UnmatchedOrderInfo[] = unmatchedRaw.map((item) => {
    const u = asRecord(item)
    const reasonCode = pickString(u.reasonCode, u.reason_code) || 'UNKNOWN'
    const orderItemIdsRaw = u.orderItemIds ?? u.order_item_ids
    const orderItemIds = Array.isArray(orderItemIdsRaw)
      ? orderItemIdsRaw.map((id) => String(id)).filter(Boolean)
      : undefined
    return {
      orderId: pickString(u.orderId, u.order_id),
      reasonCode,
      reason: pickString(u.reason, reasonCode, 'Eşleşmedi') || 'Eşleşmedi',
      ...(orderItemIds && orderItemIds.length > 0 ? { orderItemIds } : {}),
    }
  })

  const summary = asRecord(row.summary)
  const distanceM = pickNumber(summary.totalDistance, row.totalDistance)
  const durationS = pickNumber(summary.totalDuration, row.totalDuration)

  const baseWarnings = Array.isArray(row.warnings) ? row.warnings.map(String) : []
  const geometryWarnings = routes
    .filter((route) => isSparseRoadGeometry(route.polyline))
    .map(
      (route) =>
        `${route.vehiclePlate}: rota geometrisi seyrek (${route.polyline.length} nokta). Duraklardan yol uydurulmadı.`
    )

  return {
    routes,
    unmatchedOrderIds: unmatchedOrders.map((u) => u.orderId).filter(Boolean),
    unmatchedOrders,
    warnings: [...baseWarnings, ...geometryWarnings],
    totals: {
      stopCount: routes.reduce((sum, r) => sum + r.stopCount, 0),
      distanceKm:
        distanceM > 0
          ? distanceM > 100
            ? metersToKm(distanceM)
            : distanceM
          : routes.reduce((sum, r) => sum + r.distanceKm, 0),
      durationMin:
        durationS > 0
          ? durationS > 180
            ? secondsToMin(durationS)
            : durationS
          : routes.reduce((sum, r) => sum + r.durationMin, 0),
      vehicleCount: routes.length,
      orderCount: routes.reduce((sum, r) => sum + r.orderIds.length, 0),
    },
  }
}

function mapActiveStop(raw: unknown, index: number): OrchestratorActiveRouteStop {
  const base = mapDraftStop(raw, index)
  const row = asRecord(raw)
  const status = pickString(row.status, row.itemStatus).toUpperCase()
  const completed =
    row.completed === true ||
    status === 'COMPLETED' ||
    status === 'FAILED' ||
    status === 'CANCELLED' ||
    status === 'CANCELED'

  return { ...base, completed }
}

export function mapOrchestratorListRoute(raw: unknown): OrchestratorActiveRoute | null {
  const row = asRecord(raw)
  const id = pickString(row.id, row.routeId, row.lastMileRouteId, row.last_mile_route_id)
  if (!id) return null

  const items = Array.isArray(row.items) ? row.items : []
  const orderIds = Array.isArray(row.orderIds)
    ? row.orderIds.map(String)
    : items
        .map((item) =>
          pickString(
            asRecord(item).lastMileOrderId,
            asRecord(item).orderId,
            asRecord(item).last_mile_order_id
          )
        )
        .filter(Boolean)

  const operationDate = pickString(
    row.operationDate,
    row.plannedDate,
    row.planned_date
  ).slice(0, 10)

  const vehicle = asRecord(row.vehicle)
  const driver = asRecord(row.driver)
  const vehicleSnap = parseSnapshotJson(row.vehicleSnapshot)
  const driverSnap = parseSnapshotJson(row.driverSnapshot)
  const facilitySnap = parseSnapshotJson(row.facilitySnapshot)

  const completedFromItems = items.filter((item) => {
    const status = pickString(asRecord(item).status, asRecord(item).itemStatus).toUpperCase()
    return (
      status === 'COMPLETED' ||
      status === 'FAILED' ||
      status === 'CANCELLED' ||
      status === 'CANCELED'
    )
  }).length

  const driverName =
    pickString(
      row.driverName,
      row.courierName,
      driver.fullName,
      driver.name,
      [pickString(driverSnap.firstName), pickString(driverSnap.lastName)]
        .filter(Boolean)
        .join(' ')
    ) || null

  return {
    id,
    label: pickString(row.code, row.routeCode, row.name, row.label) || id.slice(0, 8),
    status: mapRouteStatus(row.status),
    vehicleId: pickString(row.vehicleId, vehicle.id, vehicleSnap.id),
    vehiclePlate: pickString(
      row.vehiclePlate,
      vehicle.plateNo,
      vehicle.plate,
      vehicleSnap.plateNo,
      vehicleSnap.plate,
      '—'
    ),
    courierName: driverName,
    region:
      pickString(
        row.region,
        row.hizmet_bolgesi,
        // Prefer route name as location subtitle when code is the label
        pickString(row.code) ? pickString(row.name) : '',
        facilitySnap.name,
        facilitySnap.label,
        '—'
      ) || '—',
    color: pickString(row.color, '#2563EB') || '#2563EB',
    operationDate: operationDate || new Date().toISOString().slice(0, 10),
    orderIds: Array.from(new Set(orderIds)),
    orderCount: pickNumber(row.orderCount, orderIds.length),
    stopCount: pickNumber(row.stopCount, items.length),
    completedStopCount: pickNumber(row.completedStopCount, completedFromItems),
    distanceKm: (() => {
      const m = pickNumber(row.distanceM, row.distance)
      return m > 100 ? metersToKm(m) : m
    })(),
    durationMin: (() => {
      const plannedSec = pickNumber(row.plannedDurationSec)
      if (plannedSec > 0) return secondsToMin(plannedSec)
      const s = pickNumber(row.durationSec, row.durationMin, row.duration)
      return s > 180 ? secondsToMin(s) : s
    })(),
    capacityVolumePct: pickNumber(
      row.capacityVolumePct,
      row.volumeOccupancyPct,
      vehicleSnap.volumeOccupancyPct,
      vehicle.volumeOccupancyPct
    ),
    capacityWeightPct: pickNumber(
      row.capacityWeightPct,
      row.weightOccupancyPct,
      vehicleSnap.weightOccupancyPct,
      vehicle.weightOccupancyPct
    ),
    position: pickLatLng(row.position) ?? { lat: 0, lng: 0 },
    polyline: geometryToPolyline(row.geometry, row.polyline),
    stops: [],
  }
}

function parseSnapshotJson(raw: unknown): Record<string, unknown> {
  if (typeof raw === 'string') {
    try {
      return asRecord(JSON.parse(raw))
    } catch {
      return {}
    }
  }
  return asRecord(raw)
}

export function applyMapDetailToRoute(
  route: OrchestratorActiveRoute,
  detailRaw: unknown
): OrchestratorActiveRoute {
  const detail = asRecord(detailRaw)
  const routeNode = asRecord(detail.route)
  const stopsRaw = Array.isArray(detail.stops) ? detail.stops : []
  const park = asRecord(detail.vehicleParkStart)

  const stops = stopsRaw
    .map((stop, index) => mapActiveStop(stop, index))
    .sort((a, b) => a.sequence - b.sequence)
  if (
    stops.length > 0 &&
    stops[0]?.kind !== 'depot_start' &&
    (park.latitude != null || park.longitude != null)
  ) {
    stops.unshift({
      id: pickString(park.id) || `${route.id}:vehicle_park_start`,
      sequence: 0,
      kind: 'depot_start',
      orderId: null,
      orderIds: [],
      label: pickString(park.label, 'Park / başlangıç') || 'Park / başlangıç',
      position: pickLatLng(park) ?? route.position,
      completed: false,
      scheduledTime: pickString(park.etaAt) || undefined,
    })
  }

  const polyline = geometryToPolyline(
    detail.geometry ?? routeNode.geometry,
    detail.polyline
  )
  const position =
    pickLatLng(park) ??
    stops.find((s) => s.kind === 'depot_start')?.position ??
    route.position

  return {
    ...route,
    version: pickNumber(routeNode.version, detail.version, route.version),
    color: pickString(routeNode.color, route.color) || route.color,
    polyline: polyline.length > 0 ? polyline : route.polyline,
    position,
    stops,
    stopCount: stops.filter((s) => s.kind === 'pickup' || s.kind === 'delivery').length,
    completedStopCount: stops.filter(
      (s) => (s.kind === 'pickup' || s.kind === 'delivery') && s.completed
    ).length,
  }
}
