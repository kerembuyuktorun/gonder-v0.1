import type { LastmileOrder, OrderType, RouteType } from '../../../orders/_types/order'
import type { LastmileVehicle } from '../../../resources/vehicles/_types/vehicle'

export type OrchestratorStep = 1 | 2 | 3

export type OrchestratorRouteStatus = 'aktif' | 'planlandi' | 'tamamlandi'

export type OptimizeObjective =
  | 'balanced'
  | 'min_distance'
  | 'min_time'
  | 'min_vehicles'

export type OptimizeSettings = {
  objective: OptimizeObjective
  maxRouteDurationMin: number
  maxStopsPerRoute: number
  respectCapacity: boolean
  respectTimeWindows: boolean
  respectSkills: boolean
  respectShifts: boolean
  returnToDepot: boolean
}

export type LatLng = { lat: number; lng: number }

export type OrchestratorOrder = LastmileOrder & {
  pickup: LatLng
  delivery: LatLng
}

export type OrchestratorVehicle = LastmileVehicle & {
  position: LatLng
  /** Tanımlı araç başlangıç / park konumu */
  baslangic_konumu: LatLng
  /** Tanımlı başlangıç konumu açık adresi */
  baslangic_acik_adres: string | null
  /** Araç konumu için mock açık adres */
  position_acik_adres: string | null
  /** Bugün daha önce başlatılmış/tamamlanmış rota sayısı */
  gunluk_rota_sayisi: number
  selectable: boolean
  disabledReason: string | null
}

export type OrchestratorFacility = {
  id: string
  name: string
  region: string
  address: string
  position: LatLng
}

export type RouteStopKind = 'depot_start' | 'pickup' | 'delivery' | 'depot_end'

export type OptimizedRouteStop = {
  id: string
  sequence: number
  kind: RouteStopKind
  /** Tek sipariş durakları için geriye uyum */
  orderId: string | null
  /** Duraktaki siparişler — birleşik alım/tesis teslimi */
  orderIds: string[]
  label: string
  /** Birleşik duraklarda tesis/adres adı */
  locationLabel?: string
  /** Başlangıç/dönüş duraklarında açıklayıcı alt metin */
  locationHint?: string
  /** Başlık yanındaki bilgi ikonu tooltip metni */
  locationTooltip?: string
  /** Konum açık adres satırı */
  openAddress?: string
  /** Başlangıç durağı / ETA — planlanan varış veya çıkış zamanı */
  scheduledTime?: string
  /** BE recalculate: önceki duraktan leg mesafesi (km) */
  legDistanceKm?: number
  /** BE recalculate: önceki duraktan leg süresi (dk) */
  legDurationMin?: number
  position: LatLng
}

export type OptimizedRoute = {
  id: string
  vehicleId: string
  vehiclePlate: string
  courierName: string | null
  color: string
  orderIds: string[]
  stops: OptimizedRouteStop[]
  polyline: LatLng[]
  stopCount: number
  distanceKm: number
  durationMin: number
  capacityVolumePct: number
  capacityWeightPct: number
  warnings: string[]
}

/** Optimize sonrası rotaya giremeyen sipariş + neden */
export type UnmatchedOrderInfo = {
  orderId: string
  /** BE classifier code — UI badge / özet için */
  reasonCode: string
  /** BE Türkçe açıklama — satırda doğrudan gösterilir */
  reason: string
  orderItemIds?: string[]
}

export type OptimizeResult = {
  routes: OptimizedRoute[]
  unmatchedOrderIds: string[]
  unmatchedOrders: UnmatchedOrderInfo[]
  warnings: string[]
  totals: {
    stopCount: number
    distanceKm: number
    durationMin: number
    vehicleCount: number
    orderCount: number
  }
}

/** Sahada aktif rota durakları — optimize duraklarıyla aynı şekil + tamamlanma */
export type OrchestratorActiveRouteStop = OptimizedRouteStop & {
  completed: boolean
}

/** Sahada aktif / planlanmış rotalar — orkestratör rota listesi paneli */
export type OrchestratorActiveRoute = {
  id: string
  label: string
  status: OrchestratorRouteStatus
  vehicleId: string
  vehiclePlate: string
  courierName: string | null
  region: string
  color: string
  /** Operasyon günü (YYYY-MM-DD) — bugün / geçmişten kalan filtresi */
  operationDate: string
  orderIds: string[]
  orderCount: number
  stopCount: number
  completedStopCount: number
  distanceKm: number
  durationMin: number
  capacityVolumePct: number
  capacityWeightPct: number
  position: LatLng
  /** Depo → duraklar → araç konumuna giden çizgi */
  polyline: LatLng[]
  stops: OrchestratorActiveRouteStop[]
  /** Optimistic lock (BE LastMileRoute.version) */
  version?: number
}

/** Aktif rota listesi zaman dilimi */
export type ActiveRouteDateScope = 'today' | 'carryover'

export type WorkspaceFilters = {
  operationDate: string
  facilityId: string
  region: string | 'all'
  orderType: OrderType | 'all'
  routeType: RouteType | 'all'
}

export const DEFAULT_OPTIMIZE_SETTINGS: OptimizeSettings = {
  objective: 'balanced',
  maxRouteDurationMin: 480,
  maxStopsPerRoute: 24,
  respectCapacity: true,
  respectTimeWindows: true,
  respectSkills: true,
  respectShifts: true,
  returnToDepot: true,
}

export function clampOptimizeSettings(settings: OptimizeSettings): OptimizeSettings {
  return {
    ...settings,
    maxRouteDurationMin: Math.min(
      1440,
      Math.max(30, Number(settings.maxRouteDurationMin) || DEFAULT_OPTIMIZE_SETTINGS.maxRouteDurationMin)
    ),
    maxStopsPerRoute: Math.min(
      200,
      Math.max(1, Number(settings.maxStopsPerRoute) || DEFAULT_OPTIMIZE_SETTINGS.maxStopsPerRoute)
    ),
  }
}

/** Harita / rota kartları için ayırt edilebilir palet */
export const ROUTE_COLORS = [
  '#0284c7',
  '#059669',
  '#d97706',
  '#7c3aed',
  '#db2777',
  '#0f766e',
  '#ea580c',
  '#2563eb',
  '#ca8a04',
  '#e11d48',
  '#0891b2',
  '#65a30d',
  '#9333ea',
  '#dc2626',
  '#0d9488',
  '#4f46e5',
  '#c026d3',
  '#b45309',
  '#16a34a',
  '#1d4ed8',
] as const
