import { mockOrderList } from '../../../orders/_mock/orders-mock-data'
import { VEHICLES_MOCK } from '../../../resources/vehicles/_mock/vehicles-mock-data'
import {
  getVehicleRouteReturnAnchor,
  getVehicleRouteStartAnchor,
} from '../_lib/vehicle-route-anchor'
import type {
  LatLng,
  OrchestratorActiveRoute,
  OrchestratorFacility,
  OrchestratorOrder,
  OrchestratorVehicle,
} from '../_types/orchestrator'
import {
  shiftOperationDate,
  toOperationDateInputValue,
} from '../_lib/operation-date'
import { pickNextRouteColors } from '../_lib/route-colors'

/** Merkez tesis — Ümraniye civarı */
export const ORCHESTRATOR_FACILITY: OrchestratorFacility = {
  id: 'fac-umn',
  name: 'Ümraniye Merkez Depo',
  region: 'Ümraniye',
  address: 'Parseller Mah. Necip Fazıl Bulvarı No:88, Ümraniye/İstanbul',
  position: { lat: 41.0165, lng: 29.1244 },
}

const ORDER_COORDS: Record<string, { pickup: LatLng; delivery: LatLng }> = {
  'lm-1001': {
    pickup: { lat: 41.0165, lng: 29.1244 },
    delivery: { lat: 41.0422, lng: 29.0078 },
  },
  'lm-1005': {
    pickup: { lat: 41.0602, lng: 28.9874 },
    delivery: { lat: 41.0688, lng: 28.9782 },
  },
  'lm-1010': {
    pickup: { lat: 41.0221, lng: 29.1208 },
    delivery: { lat: 40.9638, lng: 29.0942 },
  },
  'lm-1012': {
    pickup: { lat: 41.1086, lng: 29.0203 },
    delivery: { lat: 41.1196, lng: 29.0368 },
  },
  'lm-1015': {
    pickup: { lat: 41.0438, lng: 29.0055 },
    delivery: { lat: 41.0814, lng: 29.0118 },
  },
  // Extra pool entries for richer map (non-default statuses stay out unless chip expands)
  'lm-1002': {
    pickup: { lat: 41.0221, lng: 29.1208 },
    delivery: { lat: 40.9845, lng: 29.0262 },
  },
  'lm-1003': {
    pickup: { lat: 40.8456, lng: 29.3001 },
    delivery: { lat: 40.9833, lng: 29.1167 },
  },
  'lm-1004': {
    pickup: { lat: 40.9876, lng: 29.0361 },
    delivery: { lat: 40.9902, lng: 29.0274 },
  },
  'lm-1006': {
    pickup: { lat: 41.0428, lng: 29.0075 },
    delivery: { lat: 41.0819, lng: 29.0175 },
  },
  'lm-1007': {
    pickup: { lat: 40.8885, lng: 29.1892 },
    delivery: { lat: 40.9781, lng: 29.0788 },
  },
  'lm-1008': {
    pickup: { lat: 41.0082, lng: 28.9784 },
    delivery: { lat: 41.0551, lng: 28.9854 },
  },
  'lm-1009': {
    pickup: { lat: 40.9111, lng: 29.1555 },
    delivery: { lat: 40.8891, lng: 29.1888 },
  },
  'lm-1011': {
    pickup: { lat: 40.9678, lng: 29.0534 },
    delivery: { lat: 40.9905, lng: 29.0252 },
  },
  'lm-1013': {
    pickup: { lat: 40.9819, lng: 28.8774 },
    delivery: { lat: 41.0055, lng: 28.8278 },
  },
  'lm-1014': {
    pickup: { lat: 40.9833, lng: 29.1167 },
    delivery: { lat: 40.9921, lng: 29.1088 },
  },
  'lm-1016': {
    pickup: { lat: 41.0165, lng: 29.1244 },
    delivery: { lat: 40.9833, lng: 29.1167 },
  },
  'lm-1017': {
    pickup: { lat: 41.0165, lng: 29.1244 },
    delivery: { lat: 41.0188, lng: 29.1388 },
  },
  'lm-1018': {
    pickup: { lat: 41.0221, lng: 29.1208 },
    delivery: { lat: 41.0428, lng: 29.0075 },
  },
  'lm-1019': {
    pickup: { lat: 41.0602, lng: 28.9874 },
    delivery: { lat: 41.0578, lng: 28.9876 },
  },
  'lm-1020': {
    pickup: { lat: 40.9845, lng: 29.0262 },
    delivery: { lat: 40.9902, lng: 29.0274 },
  },
  'lm-1021': {
    pickup: { lat: 40.9111, lng: 29.1555 },
    delivery: { lat: 40.8891, lng: 29.1888 },
  },
  'lm-1022': {
    pickup: { lat: 40.9111, lng: 29.1555 },
    delivery: { lat: 40.8775, lng: 29.2333 },
  },
  'lm-1023': {
    pickup: { lat: 40.8456, lng: 29.3001 },
    delivery: { lat: 40.8633, lng: 29.3108 },
  },
  'lm-1024': {
    pickup: { lat: 40.8456, lng: 29.3001 },
    delivery: { lat: 40.9833, lng: 29.1167 },
  },
  'lm-1025': {
    pickup: { lat: 41.0428, lng: 29.0075 },
    delivery: { lat: 41.0819, lng: 29.0175 },
  },
  'lm-1026': {
    pickup: { lat: 41.0814, lng: 29.0118 },
    delivery: { lat: 41.0438, lng: 29.0055 },
  },
  'lm-1027': {
    pickup: { lat: 41.1086, lng: 29.0203 },
    delivery: { lat: 41.1196, lng: 29.0368 },
  },
  'lm-1028': {
    pickup: { lat: 40.9833, lng: 29.1167 },
    delivery: { lat: 40.9921, lng: 29.1088 },
  },
  'lm-1029': {
    pickup: { lat: 41.0165, lng: 29.1244 },
    delivery: { lat: 40.9788, lng: 28.8555 },
  },
  'lm-1030': {
    pickup: { lat: 41.0221, lng: 29.1208 },
    delivery: { lat: 40.9845, lng: 29.0262 },
  },
  'lm-1031': {
    pickup: { lat: 40.8885, lng: 29.1892 },
    delivery: { lat: 40.9781, lng: 29.0788 },
  },
  'lm-1032': {
    pickup: { lat: 41.0602, lng: 28.9874 },
    delivery: { lat: 41.0235, lng: 29.0156 },
  },
  'lm-1033': {
    pickup: { lat: 40.9876, lng: 29.0361 },
    delivery: { lat: 40.9902, lng: 29.0274 },
  },
  'lm-1034': {
    pickup: { lat: 41.0438, lng: 29.0055 },
    delivery: { lat: 41.0814, lng: 29.0118 },
  },
}

const REGION_COORDS: Record<string, LatLng> = {
  'İstanbul — Şişli / Fulya': { lat: 41.0578, lng: 28.9876 },
  'İstanbul — Şişli / Osmanbey': { lat: 41.0524, lng: 28.9862 },
  'İstanbul — Beşiktaş / Levent': { lat: 41.0814, lng: 29.0118 },
  'İstanbul — Kadıköy / Moda': { lat: 40.9845, lng: 29.0262 },
  'İstanbul — Ataşehir / Barbaros': { lat: 40.9833, lng: 29.1167 },
  'İstanbul — Ümraniye / Çakmak': { lat: 41.0188, lng: 29.1388 },
  'İstanbul — Bakırköy / Ataköy': { lat: 40.9788, lng: 28.8555 },
  'Ankara — Çankaya / Kızılay': { lat: 39.9208, lng: 32.8541 },
  'İzmir — Bornova / Erzene': { lat: 38.4622, lng: 27.2201 },
  'Bursa — Nilüfer / Özlüce': { lat: 40.2111, lng: 28.9667 },
  'Kocaeli — Gebze / Dilovası': { lat: 40.7855, lng: 29.5312 },
  'Antalya — Muratpaşa / Lara': { lat: 36.8556, lng: 30.7922 },
}

const FALLBACK_IST: LatLng = { lat: 41.015, lng: 28.98 }

const VEHICLE_LIVE_OPEN_ADDRESSES: Record<string, string> = {
  'veh-001': 'Halaskargi Caddesi No:38, Şişli/İstanbul',
  'veh-003': 'Caferağa Mahallesi Moda Caddesi No:84, Kadıköy/İstanbul',
  'veh-006': 'Bağdat Caddesi No:233, Kadıköy/İstanbul',
}

const REGION_OPEN_ADDRESSES: Record<string, string> = {
  'İstanbul — Şişli / Fulya': 'Halaskargi Caddesi No:38, Şişli/İstanbul',
  'İstanbul — Beşiktaş / Levent': 'Levent Mahallesi Büyükdere Caddesi No:185, Şişli/İstanbul',
  'İstanbul — Kadıköy / Moda': 'Caferağa Mahallesi Moda Caddesi No:84, Kadıköy/İstanbul',
  'Ankara — Çankaya / Kızılay': 'Atatürk Bulvarı No:145, Çankaya/Ankara',
}

function jitter(base: LatLng, seed: string): LatLng {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  const dLat = ((hash % 100) - 50) / 12000
  const dLng = (((hash >> 8) % 100) - 50) / 12000
  return { lat: base.lat + dLat, lng: base.lng + dLng }
}

function coordsForOrder(id: string, bolge: string): { pickup: LatLng; delivery: LatLng } {
  if (ORDER_COORDS[id]) return ORDER_COORDS[id]
  const regionBase =
    Object.entries(REGION_COORDS).find(([key]) => key.includes(bolge))?.[1] ?? FALLBACK_IST
  return {
    pickup: jitter(ORCHESTRATOR_FACILITY.position, `${id}-p`),
    delivery: jitter(regionBase, `${id}-d`),
  }
}

function vehicleDisabledReason(vehicle: (typeof VEHICLES_MOCK)[number]): string | null {
  const expiredDoc = vehicle.evrak_uyarilari.find((w) => w.daysRemaining < 0)
  if (expiredDoc) return `${expiredDoc.label} süresi dolmuş`
  return null
}

export function buildOrchestratorOrders(): OrchestratorOrder[] {
  return mockOrderList.map((order) => {
    const coords = coordsForOrder(order.id, order.bolge)
    return {
      ...order,
      pickup: coords.pickup,
      delivery: coords.delivery,
    }
  })
}

function vehicleOpenAddress(
  vehicle: (typeof VEHICLES_MOCK)[number],
  onRoad: boolean
): string | null {
  if (onRoad) {
    return (
      VEHICLE_LIVE_OPEN_ADDRESSES[vehicle.id] ??
      REGION_OPEN_ADDRESSES[vehicle.hizmet_bolgesi] ??
      `${vehicle.hizmet_bolgesi} civarı`
    )
  }

  if (vehicle.baslangic_stratejisi === 'sabit_park' && vehicle.park_konumu) {
    return vehicle.park_konumu
  }

  return (
    REGION_OPEN_ADDRESSES[vehicle.hizmet_bolgesi] ??
    `${vehicle.hizmet_bolgesi} civarı`
  )
}

export function buildOrchestratorVehicles(): OrchestratorVehicle[] {
  return VEHICLES_MOCK.map((vehicle) => {
    const disabledReason = vehicleDisabledReason(vehicle)
    const regionPos =
      REGION_COORDS[vehicle.hizmet_bolgesi] ??
      (vehicle.park_lat != null && vehicle.park_lng != null
        ? { lat: vehicle.park_lat, lng: vehicle.park_lng }
        : FALLBACK_IST)

    const parkPosition =
      vehicle.park_lat != null && vehicle.park_lng != null
        ? { lat: vehicle.park_lat, lng: vehicle.park_lng }
        : null

    const idlePosition = parkPosition ?? jitter(regionPos, vehicle.id)
    const homePosition = idlePosition
    const homeAddress =
      vehicle.baslangic_stratejisi === 'sabit_park' && vehicle.park_konumu
        ? vehicle.park_konumu
        : REGION_OPEN_ADDRESSES[vehicle.hizmet_bolgesi] ??
          `${vehicle.hizmet_bolgesi} civarı`
    // Süresi dolmuş evrak vb. uyarı: orkestratörde aktif/rotada gösterilmez
    const blocked = disabledReason != null
    const durum = blocked ? ('pasif' as const) : vehicle.durum
    const onActiveRoute = !blocked && vehicle.aktif_rota_id != null
    const gunluk_rota_sayisi = onActiveRoute ? 1 : 0
    const isLivePosition = gunluk_rota_sayisi > 0
    const position = isLivePosition
      ? jitter(homePosition, `${vehicle.id}-live`)
      : homePosition

    return {
      ...vehicle,
      durum,
      aktif_rota_id: onActiveRoute ? vehicle.aktif_rota_id : null,
      aktif_rota_label: onActiveRoute ? vehicle.aktif_rota_label : null,
      aktif_rota_durak_sayisi: onActiveRoute
        ? vehicle.aktif_rota_durak_sayisi
        : null,
      aktif_rota_siparis_sayisi: onActiveRoute
        ? vehicle.aktif_rota_siparis_sayisi
        : null,
      baslangic_konumu: homePosition,
      baslangic_acik_adres: homeAddress,
      position,
      position_acik_adres: isLivePosition
        ? vehicleOpenAddress(vehicle, true)
        : homeAddress,
      gunluk_rota_sayisi,
      selectable: Boolean(vehicle.zimmetli_surucu_id) && !blocked,
      disabledReason,
    }
  })
}

export function listOrchestratorRegions(orders: OrchestratorOrder[]): string[] {
  return Array.from(new Set(orders.map((o) => o.bolge))).sort((a, b) =>
    a.localeCompare(b, 'tr')
  )
}

/** Planlama havuzu — yalnızca henüz araç ve kurye atanmamış siparişler */
export function defaultPlanningPool(orders: OrchestratorOrder[]): OrchestratorOrder[] {
  return orders.filter(
    (order) =>
      order.durum === 'atama_bekliyor' &&
      order.atanan_arac == null &&
      order.atanan_kurye == null
  )
}

function lerpCoord(a: LatLng, b: LatLng, t: number): LatLng {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  }
}

function offsetCoord(
  base: LatLng,
  angleRad: number,
  radiusDeg: number
): LatLng {
  return {
    lat: base.lat + Math.sin(angleRad) * radiusDeg,
    lng: base.lng + Math.cos(angleRad) * radiusDeg * 1.25,
  }
}

function pickOrdersForActiveRoute(
  vehicle: OrchestratorVehicle,
  orders: OrchestratorOrder[],
  orderCount: number,
  routeIndex: number
): OrchestratorOrder[] {
  if (orderCount <= 0 || orders.length === 0) return []

  // Planlama havuzundaki atama_bekliyor siparişlere dokunma — aksi halde
  // "rotaya ekle" önizlemesinde sipariş sayısı değişmez görünür.
  const onRoad = orders.filter((order) => order.durum === 'yolda')
  const byPlate = onRoad.filter((order) => order.atanan_arac === vehicle.plaka)
  const byRegion = onRoad.filter((order) =>
    vehicle.hizmet_bolgesi.includes(order.bolge.split('—')[0]?.trim() ?? '')
  )

  const pool: OrchestratorOrder[] = []
  const seen = new Set<string>()
  for (const order of [...byPlate, ...byRegion, ...onRoad]) {
    if (seen.has(order.id)) continue
    seen.add(order.id)
    pool.push(order)
  }

  if (pool.length === 0) return []

  const offset = (routeIndex * 3) % pool.length
  const selected: OrchestratorOrder[] = []
  for (let i = 0; i < orderCount; i += 1) {
    selected.push(pool[(offset + i) % pool.length])
  }
  return selected
}

/**
 * Durakları sipariş alım/teslim çiftlerinden üretir; başa Başlangıç, sona
 * Araç Park Konumuna Dönüş ekler (optimize sonucuyla aynı ankorlar).
 */
function buildActiveRouteStops(
  vehicle: OrchestratorVehicle,
  routeId: string,
  routeIndex: number,
  stopCount: number,
  completedStopCount: number,
  routeOrders: OrchestratorOrder[]
): OrchestratorActiveRoute['stops'] {
  const startAnchor = getVehicleRouteStartAnchor(vehicle)
  const returnAnchor = getVehicleRouteReturnAnchor(vehicle)
  const regionBase =
    REGION_COORDS[vehicle.hizmet_bolgesi] ??
    jitter(vehicle.position, `${routeId}-region`)
  const hub = lerpCoord(regionBase, vehicle.position, 0.35)

  const pinCount = Math.max(0, stopCount)
  const completedPins = Math.min(pinCount, Math.max(0, completedStopCount))

  type OpDraft = {
    order: OrchestratorOrder
    kind: 'pickup' | 'delivery'
  }
  const drafts: OpDraft[] = []
  for (const order of routeOrders) {
    drafts.push({ order, kind: 'pickup' })
    drafts.push({ order, kind: 'delivery' })
  }
  while (drafts.length < pinCount && routeOrders.length > 0) {
    const order = routeOrders[drafts.length % routeOrders.length]
    drafts.push({
      order,
      kind: drafts.length % 2 === 0 ? 'pickup' : 'delivery',
    })
  }

  const sweepStart = (routeIndex * 0.9) % (Math.PI * 2)
  const sweepSpan = Math.PI * 1.15
  const operational: OrchestratorActiveRoute['stops'] = []

  for (let i = 0; i < pinCount; i += 1) {
    const draft = drafts[i]
    if (!draft) break
    const t = pinCount === 1 ? 0.5 : i / (pinCount - 1)
    const angle = sweepStart + sweepSpan * t
    const radius = 0.012 + (i % 3) * 0.004 + (routeIndex % 3) * 0.002
    const orderPosition =
      draft.kind === 'pickup' ? draft.order.pickup : draft.order.delivery
    const position = jitter(
      lerpCoord(orderPosition, offsetCoord(hub, angle, radius), 0.35),
      `${routeId}-stop-${i}`
    )
    const pickupIndex = Math.floor(i / 2) + 1
    const deliveryIndex = Math.floor(i / 2) + 1

    operational.push({
      id: `${routeId}-stop-${i + 1}`,
      sequence: i + 2,
      kind: draft.kind,
      orderId: draft.order.id,
      orderIds: [draft.order.id],
      label: draft.kind === 'pickup' ? `Alım ${pickupIndex}` : `Teslim ${deliveryIndex}`,
      locationLabel:
        draft.kind === 'pickup'
          ? draft.order.alis_noktasi
          : draft.order.varis_noktasi,
      openAddress:
        draft.kind === 'pickup'
          ? draft.order.alis_acik_adres
          : draft.order.varis_acik_adres,
      position,
      completed: i < completedPins,
    })
  }

  return [
    {
      id: `${routeId}-start`,
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
      })} · ${vehicle.vardiya_baslangic}`,
      position: startAnchor.position,
      completed: completedStopCount > 0,
    },
    ...operational,
    {
      id: `${routeId}-end`,
      sequence: operational.length + 2,
      kind: 'depot_end',
      orderId: null,
      orderIds: [],
      label: 'Araç Park Konumuna Dönüş',
      locationLabel: returnAnchor.title,
      locationTooltip: returnAnchor.tooltip ?? undefined,
      openAddress: returnAnchor.openAddress ?? undefined,
      position: returnAnchor.position,
      completed: completedStopCount >= stopCount,
    },
  ]
}

function buildActiveRoutePolyline(stops: OrchestratorActiveRoute['stops']): LatLng[] {
  return stops.map((stop) => stop.position)
}

/** Sahada aktif rotalar — araç zimmetindeki aktif rota kayıtlarından türetilir */
export function buildOrchestratorActiveRoutes(
  vehicles: OrchestratorVehicle[],
  orders: OrchestratorOrder[]
): OrchestratorActiveRoute[] {
  const vehiclesWithRoutes = vehicles.filter(
    (vehicle) => vehicle.aktif_rota_id != null
  )
  const colors = pickNextRouteColors(vehiclesWithRoutes.length)
  const today = toOperationDateInputValue()
  const yesterday = shiftOperationDate(-1)

  return vehiclesWithRoutes
    .map((vehicle, index) => {
      const routeId = vehicle.aktif_rota_id!
      const stopCount = vehicle.aktif_rota_durak_sayisi ?? 0
      const orderCount = vehicle.aktif_rota_siparis_sayisi ?? 0
      const progressRatio = Math.min(0.85, 0.18 + index * 0.12)
      const completedStopCount = Math.max(
        1,
        Math.min(stopCount - 1, Math.round(stopCount * progressRatio))
      )
      const routeOrders = pickOrdersForActiveRoute(
        vehicle,
        orders,
        Math.max(orderCount, 1),
        index
      )
      const stops = buildActiveRouteStops(
        vehicle,
        routeId,
        index,
        stopCount,
        completedStopCount,
        routeOrders
      )
      // Kart / önizleme metrikleri duraklardaki gerçek siparişlerle birebir olsun
      const orderIds = Array.from(
        new Set(
          stops
            .filter((stop) => stop.kind === 'pickup' || stop.kind === 'delivery')
            .flatMap((stop) => stop.orderIds)
        )
      )
      const operationalStopCount = stops.filter(
        (stop) => stop.kind === 'pickup' || stop.kind === 'delivery'
      ).length
      const completedOperational = stops.filter(
        (stop) =>
          stop.completed && (stop.kind === 'pickup' || stop.kind === 'delivery')
      ).length
      // Mock: ilk rota dünden kalan, diğerleri bugün
      const operationDate = index === 0 ? yesterday : today

      return {
        id: routeId,
        label: vehicle.aktif_rota_label ?? `RT-${routeId}`,
        status: 'aktif' as const,
        vehicleId: vehicle.id,
        vehiclePlate: vehicle.plaka,
        courierName: vehicle.zimmetli_surucu,
        region: vehicle.hizmet_bolgesi,
        color: colors[index] ?? colors[0]!,
        operationDate,
        orderIds,
        orderCount: orderIds.length,
        stopCount: operationalStopCount,
        completedStopCount: completedOperational,
        distanceKm: Math.round((stopCount * 3.4 + index * 2.1) * 10) / 10,
        durationMin: stopCount * 9 + index * 6,
        capacityVolumePct: vehicle.doluluk_hacim_pct,
        capacityWeightPct: vehicle.doluluk_agirlik_pct,
        position: vehicle.position,
        stops,
        polyline: buildActiveRoutePolyline(stops),
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'tr'))
}
