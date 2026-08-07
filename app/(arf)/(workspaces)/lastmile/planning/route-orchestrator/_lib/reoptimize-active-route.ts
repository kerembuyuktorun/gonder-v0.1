import type {
  OptimizeSettings,
  OrchestratorActiveRoute,
  OrchestratorActiveRouteStop,
  OrchestratorOrder,
  OrchestratorVehicle,
} from '../_types/orchestrator'
import { buildLegStops } from './optimize'
import { buildPolyline, summarizeRoutePath } from './route-geometry'
import { getVehicleRouteReturnAnchor } from './vehicle-route-anchor'
import {
  FALLBACK_ORDER_SKILLS,
  vehicleSkillsMatchOrderRequirements,
} from '../../../_lib/skill-catalog'

export type ReoptimizePreview = {
  routeId: string
  routeLabel: string
  vehiclePlate: string
  courierName: string | null
  addedOrders: Array<{ id: string; takipNo: string; musteri: string }>
  lockedStopCount: number
  before: {
    orderCount: number
    stopCount: number
    distanceKm: number
    durationMin: number
  }
  after: {
    orderCount: number
    stopCount: number
    distanceKm: number
    durationMin: number
  }
  proposedIncompleteStops: Array<{
    sequence: number
    kind: 'pickup' | 'delivery'
    /** Konum başlığı (tesis / nokta adı) */
    title: string
    /** Başlık altı açık adres */
    address?: string
  }>
  warnings: string[]
}

export type ReoptimizeActiveRouteResult = {
  preview: ReoptimizePreview
  route: OrchestratorActiveRoute
  assignedOrderIds: string[]
  /** Canlı API apply için (demo’da yok) */
  previewToken?: string
}

function skillMatch(order: OrchestratorOrder, vehicle: OrchestratorVehicle): boolean {
  return vehicleSkillsMatchOrderRequirements(
    vehicle.yetenekler,
    order.gereksinimler,
    FALLBACK_ORDER_SKILLS
  )
}

function uniqueOrderIdsFromStops(
  stops: Array<{ kind: string; orderIds: string[] }>
): string[] {
  return Array.from(
    new Set(
      stops
        .filter((stop) => stop.kind === 'pickup' || stop.kind === 'delivery')
        .flatMap((stop) => stop.orderIds)
    )
  )
}

function resolveStopTitleAndAddress(
  stop: OrchestratorActiveRouteStop,
  orderById: Map<string, OrchestratorOrder>
): { title: string; address?: string } {
  const title = (stop.locationLabel ?? stop.label).trim()
  const fromStop = stop.openAddress?.trim()
  if (fromStop) return { title, address: fromStop }

  const addresses = stop.orderIds
    .map((id) => orderById.get(id))
    .filter((order): order is OrchestratorOrder => order != null)
    .map((order) =>
      stop.kind === 'pickup'
        ? order.alis_acik_adres.trim()
        : order.varis_acik_adres.trim()
    )
    .filter(Boolean)

  const unique = Array.from(new Set(addresses))
  const address = unique[0]
  if (address && address !== title) return { title, address }
  return { title }
}

/**
 * Aktif rotaya sipariş ekler; completed durakları kilitler, kalanı yeniden optimize eder.
 * Dry-run: state yazmadan `preview` + önerilen `route` döner.
 */
export function reoptimizeActiveRouteRemaining(input: {
  route: OrchestratorActiveRoute
  vehicle: OrchestratorVehicle
  newOrders: OrchestratorOrder[]
  /** Rotadaki incomplete siparişler + yeni siparişler için katalog */
  orderCatalog: OrchestratorOrder[]
  settings: OptimizeSettings
}): ReoptimizeActiveRouteResult {
  const { route, vehicle, newOrders, orderCatalog, settings } = input
  const orderById = new Map(orderCatalog.map((order) => [order.id, order]))

  const startStop = route.stops.find((stop) => stop.kind === 'depot_start') ?? null
  const returnStop = route.stops.find((stop) => stop.kind === 'depot_end') ?? null
  const completedOperational = route.stops.filter(
    (stop) =>
      stop.completed && (stop.kind === 'pickup' || stop.kind === 'delivery')
  )
  const incompleteOperational = route.stops.filter(
    (stop) =>
      !stop.completed && (stop.kind === 'pickup' || stop.kind === 'delivery')
  )

  const completedOrderIds = new Set(
    completedOperational.flatMap((stop) => stop.orderIds)
  )

  // Tamamlanmış siparişin incomplete teslim/alımı korunur (yeniden üretilmez)
  const preservedPartialIncomplete = incompleteOperational.filter((stop) =>
    stop.orderIds.some((id) => completedOrderIds.has(id))
  )

  // Hiç tamamlanmamış siparişler + yeni eklenenler yeniden sıralanır
  const fullyIncompleteIds = Array.from(
    new Set(
      incompleteOperational
        .flatMap((stop) => stop.orderIds)
        .filter((id) => !completedOrderIds.has(id))
    )
  )
  const remainingOrders = fullyIncompleteIds
    .map((id) => orderById.get(id))
    .filter((order): order is OrchestratorOrder => order != null)

  const newOrderIds = new Set(newOrders.map((order) => order.id))
  const optimizeOrders = [
    ...remainingOrders.filter((order) => !newOrderIds.has(order.id)),
    ...newOrders,
  ]

  const { stops: legDrafts } = buildLegStops(
    optimizeOrders,
    settings,
    vehicle.position
  )
  const returnAnchor = getVehicleRouteReturnAnchor(vehicle)

  const prefix: OrchestratorActiveRouteStop[] = [
    ...(startStop ? [startStop] : []),
    ...completedOperational,
    ...preservedPartialIncomplete,
  ]

  const newIncomplete: OrchestratorActiveRouteStop[] = legDrafts.map((draft, index) => ({
    ...draft,
    id: `${route.id}-reopt-${index + 1}`,
    sequence: prefix.length + index + 1,
    completed: false,
    openAddress: undefined,
  }))

  const nextReturn: OrchestratorActiveRouteStop = returnStop
    ? {
        ...returnStop,
        sequence: prefix.length + newIncomplete.length + 1,
        position: returnAnchor.position,
        locationLabel: returnAnchor.title,
        openAddress: returnAnchor.openAddress ?? undefined,
        locationTooltip: returnAnchor.tooltip ?? undefined,
        completed: false,
      }
    : {
        id: `${route.id}-end`,
        sequence: prefix.length + newIncomplete.length + 1,
        kind: 'depot_end',
        orderId: null,
        orderIds: [],
        label: 'Araç Park Konumuna Dönüş',
        locationLabel: returnAnchor.title,
        openAddress: returnAnchor.openAddress ?? undefined,
        locationTooltip: returnAnchor.tooltip ?? undefined,
        position: returnAnchor.position,
        completed: false,
      }

  const nextStops: OrchestratorActiveRouteStop[] = [
    ...prefix,
    ...newIncomplete,
    nextReturn,
  ].map((stop, index) => ({ ...stop, sequence: index + 1 }))

  const metrics = summarizeRoutePath(nextStops)
  const beforeOrderIds = uniqueOrderIdsFromStops(route.stops)
  const beforeStopCount = route.stops.filter(
    (stop) => stop.kind === 'pickup' || stop.kind === 'delivery'
  ).length
  // Duraklardan + açıkça eklenen siparişler (eklenenlerin sayıya yansıması garanti)
  const orderIds = Array.from(
    new Set([
      ...beforeOrderIds,
      ...uniqueOrderIdsFromStops(nextStops),
      ...newOrders.map((order) => order.id),
    ])
  )

  const warnings: string[] = []
  const volume = optimizeOrders.reduce((sum, order) => sum + order.toplam_hacim, 0)
  const weight = optimizeOrders.reduce((sum, order) => sum + order.agirlik_kg, 0)
  if (volume > vehicle.max_hacim_m3 || weight > vehicle.max_agirlik_kg) {
    warnings.push('Eklenen siparişlerle araç kapasitesi aşılabilir (yine de uygulanabilir)')
  }
  if (settings.respectSkills) {
    const skillMiss = newOrders.filter((order) => !skillMatch(order, vehicle))
    if (skillMiss.length > 0) {
      warnings.push('Bazı siparişler araç yetenekleriyle uyumsuz olabilir')
    }
  }
  const alreadyOnRoute = newOrders.filter((order) => beforeOrderIds.includes(order.id))
  if (alreadyOnRoute.length > 0) {
    warnings.push('Bazı seçili siparişler bu rotada zaten var')
  }

  const nextRoute: OrchestratorActiveRoute = {
    ...route,
    orderIds,
    orderCount: orderIds.length,
    stopCount: metrics.stopCount,
    completedStopCount: completedOperational.length,
    distanceKm: metrics.distanceKm,
    durationMin: metrics.durationMin,
    position: vehicle.position,
    stops: nextStops,
    polyline: buildPolyline(nextStops.map((stop) => stop.position)),
  }

  const preview: ReoptimizePreview = {
    routeId: route.id,
    routeLabel: route.label,
    vehiclePlate: route.vehiclePlate,
    courierName: route.courierName,
    addedOrders: newOrders.map((order) => ({
      id: order.id,
      takipNo: order.takip_no,
      musteri: order.musteri,
    })),
    lockedStopCount: completedOperational.length,
    before: {
      orderCount: beforeOrderIds.length,
      stopCount: beforeStopCount,
      distanceKm: route.distanceKm,
      durationMin: route.durationMin,
    },
    after: {
      orderCount: nextRoute.orderCount,
      stopCount: nextRoute.stopCount,
      distanceKm: nextRoute.distanceKm,
      durationMin: nextRoute.durationMin,
    },
    proposedIncompleteStops: nextStops
      .filter(
        (stop) =>
          !stop.completed && (stop.kind === 'pickup' || stop.kind === 'delivery')
      )
      .map((stop) => {
        const { title, address } = resolveStopTitleAndAddress(stop, orderById)
        return {
          sequence: stop.sequence,
          kind: stop.kind as 'pickup' | 'delivery',
          title,
          address,
        }
      }),
    warnings,
  }

  return {
    preview,
    route: nextRoute,
    assignedOrderIds: newOrders.map((order) => order.id),
  }
}
