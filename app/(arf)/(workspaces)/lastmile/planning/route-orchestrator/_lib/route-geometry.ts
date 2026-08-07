import type { LatLng, OptimizedRouteStop } from '../_types/orchestrator'

/** Below this, geometry is treated as sparse — warn; never invent stop-to-stop chords. */
export const MIN_ROAD_GEOMETRY_POINTS = 10

export function haversineKm(a: LatLng, b: LatLng): number {
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

/** Project point onto segment AB in local lat/lng plane (short urban segments). */
function projectOntoSegment(p: LatLng, a: LatLng, b: LatLng): LatLng {
  const dx = b.lng - a.lng
  const dy = b.lat - a.lat
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return a
  let t = ((p.lng - a.lng) * dx + (p.lat - a.lat) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  return { lat: a.lat + t * dy, lng: a.lng + t * dx }
}

/**
 * Display-only snap: move marker to nearest point on road geometry.
 * Does not extend or rewrite the polyline toward the address pin.
 */
export function snapLatLngToPolyline(point: LatLng, polyline: LatLng[]): LatLng {
  if (polyline.length === 0) return point
  if (polyline.length === 1) return polyline[0]

  let best = polyline[0]
  let bestDist = Infinity
  for (let i = 0; i < polyline.length - 1; i += 1) {
    const projected = projectOntoSegment(point, polyline[i], polyline[i + 1])
    const d = haversineKm(point, projected)
    if (d < bestDist) {
      bestDist = d
      best = projected
    }
  }
  return best
}

export function isSparseRoadGeometry(polyline: LatLng[]): boolean {
  return polyline.length < MIN_ROAD_GEOMETRY_POINTS
}

export function buildPolyline(points: LatLng[]): LatLng[] {
  if (points.length === 0) return []
  const line: LatLng[] = [points[0]]
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1]
    const b = points[i]
    for (let step = 1; step < 6; step += 1) {
      const t = step / 6
      line.push({
        lat: a.lat + (b.lat - a.lat) * t,
        lng: a.lng + (b.lng - a.lng) * t,
      })
    }
    line.push(b)
  }
  return line
}

export function renumberStops<T extends { sequence: number }>(stops: T[]): T[] {
  return stops.map((stop, index) => ({ ...stop, sequence: index + 1 }))
}

export function summarizeRoutePath(stops: Array<{ position: LatLng; kind: string }>): {
  distanceKm: number
  durationMin: number
  stopCount: number
  polyline: LatLng[]
} {
  const pathPoints = stops.map((stop) => stop.position)
  let distanceKm = 0
  for (let i = 1; i < pathPoints.length; i += 1) {
    distanceKm += haversineKm(pathPoints[i - 1], pathPoints[i])
  }
  distanceKm = Math.round(distanceKm * 10) / 10
  const stopCount = stops.filter(
    (stop) => stop.kind === 'pickup' || stop.kind === 'delivery'
  ).length
  const durationMin = Math.round(stopCount * 9 + distanceKm * 2.2)
  return {
    distanceKm,
    durationMin,
    stopCount,
    polyline: buildPolyline(pathPoints),
  }
}

export function collectOrderIdsFromStops(
  stops: Array<{ orderIds: string[]; kind: string }>
): string[] {
  return Array.from(
    new Set(
      stops
        .filter((stop) => stop.kind === 'pickup' || stop.kind === 'delivery')
        .flatMap((stop) => stop.orderIds)
    )
  )
}

type RouteMetricsShape = {
  stops: OptimizedRouteStop[]
  orderIds: string[]
  stopCount: number
  distanceKm: number
  durationMin: number
  polyline: LatLng[]
  orderCount?: number
}

export function withUpdatedRouteMetrics<T extends RouteMetricsShape>(
  route: T,
  stops: T['stops']
): T {
  const ordered = renumberStops(stops)
  const metrics = summarizeRoutePath(ordered)
  const orderIds = collectOrderIdsFromStops(ordered)
  // Keep BE/OSRM geometry when present — never replace with stop-to-stop chords
  const polyline =
    route.polyline.length >= 2 ? route.polyline : metrics.polyline
  return {
    ...route,
    stops: ordered,
    orderIds,
    ...(route.orderCount != null ? { orderCount: orderIds.length } : {}),
    stopCount: metrics.stopCount,
    distanceKm: metrics.distanceKm,
    durationMin: metrics.durationMin,
    polyline,
  }
}
