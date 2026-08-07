/**
 * Rota Listesi / Rota Detay sayfaları için dedicated mock.
 * Orkestratör panellerinden bağımsız — BE kapalıyken UI çalışması için.
 */

import type {
  LatLng,
  OrchestratorActiveRoute,
  OrchestratorActiveRouteStop,
} from '../../route-orchestrator/_types/orchestrator'
import { resolveRouteDateChip } from '../_lib/map-planning-route'
import type {
  PlanningRouteListItem,
  PlanningRouteStatus,
  PlanningRouteType,
} from '../_types/planning-route'

function todayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function offsetIso(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function stop(partial: OrchestratorActiveRouteStop): OrchestratorActiveRouteStop {
  return partial
}

function buildStops(routeId: string, points: LatLng[]): OrchestratorActiveRouteStop[] {
  const [park, a, b, c, d] = points
  return [
    stop({
      id: `${routeId}-park`,
      sequence: 0,
      kind: 'depot_start',
      orderId: null,
      orderIds: [],
      label: 'Park çıkışı',
      locationLabel: 'Araç parkı',
      locationHint: 'Varsayılan park konumu',
      openAddress: 'Park Cad. No:1, İstanbul',
      scheduledTime: '08:30',
      position: park,
      completed: true,
    }),
    stop({
      id: `${routeId}-p1`,
      sequence: 1,
      kind: 'pickup',
      orderId: `${routeId}-ord-1`,
      orderIds: [`${routeId}-ord-1`],
      label: 'Alım · ORD-1001',
      locationLabel: 'Kadıköy Depo',
      openAddress: 'Caferağa Mah. Moda Cad. No:12, Kadıköy',
      scheduledTime: '09:15',
      legDistanceKm: 4.2,
      legDurationMin: 12,
      position: a,
      completed: true,
    }),
    stop({
      id: `${routeId}-d1`,
      sequence: 2,
      kind: 'delivery',
      orderId: `${routeId}-ord-1`,
      orderIds: [`${routeId}-ord-1`],
      label: 'Teslim · ORD-1001',
      locationLabel: 'Beşiktaş Ofis',
      openAddress: 'Levent Mah. Büyükdere Cad. No:45, Beşiktaş',
      scheduledTime: '10:40',
      legDistanceKm: 12.8,
      legDurationMin: 28,
      position: b,
      completed: routeId === '4120',
    }),
    stop({
      id: `${routeId}-p2`,
      sequence: 3,
      kind: 'pickup',
      orderId: `${routeId}-ord-2`,
      orderIds: [`${routeId}-ord-2`],
      label: 'Alım · ORD-1002',
      locationLabel: 'Şişli Merkez',
      openAddress: 'Fulya Mah. Hakkı Yeten Cad. No:8, Şişli',
      scheduledTime: '11:20',
      legDistanceKm: 3.1,
      legDurationMin: 11,
      position: c,
      completed: false,
    }),
    stop({
      id: `${routeId}-d2`,
      sequence: 4,
      kind: 'delivery',
      orderId: `${routeId}-ord-2`,
      orderIds: [`${routeId}-ord-2`],
      label: 'Teslim · ORD-1002',
      locationLabel: 'Ataşehir Plaza',
      openAddress: 'Barbaros Mah. Begonya Sk. No:3, Ataşehir',
      scheduledTime: '12:50',
      legDistanceKm: 14.5,
      legDurationMin: 32,
      position: d,
      completed: false,
    }),
    stop({
      id: `${routeId}-end`,
      sequence: 5,
      kind: 'depot_end',
      orderId: null,
      orderIds: [],
      label: 'Park dönüşü',
      locationLabel: 'Araç parkı',
      locationHint: 'Rota sonu',
      openAddress: 'Park Cad. No:1, İstanbul',
      scheduledTime: '13:30',
      legDistanceKm: 6.0,
      legDurationMin: 18,
      position: park,
      completed: false,
    }),
  ]
}

const PARK: LatLng = { lat: 40.9895, lng: 29.025 }
const P_A: LatLng = { lat: 40.9901, lng: 29.0292 }
const P_B: LatLng = { lat: 41.081, lng: 29.011 }
const P_C: LatLng = { lat: 41.0555, lng: 28.992 }
const P_D: LatLng = { lat: 40.992, lng: 29.127 }

function route(input: {
  id: string
  label: string
  status: OrchestratorActiveRoute['status']
  vehicleId: string
  vehiclePlate: string
  courierName: string
  region: string
  color: string
  operationDate: string
  distanceKm: number
  durationMin: number
  capacityVolumePct: number
  capacityWeightPct: number
  points?: LatLng[]
}): OrchestratorActiveRoute {
  const points = input.points ?? [PARK, P_A, P_B, P_C, P_D]
  const stops = buildStops(input.id, points)
  const operational = stops.filter((s) => s.kind === 'pickup' || s.kind === 'delivery')
  const orderIds = Array.from(
    new Set(operational.flatMap((s) => s.orderIds).filter(Boolean))
  )
  return {
    id: input.id,
    label: input.label,
    status: input.status,
    vehicleId: input.vehicleId,
    vehiclePlate: input.vehiclePlate,
    courierName: input.courierName,
    region: input.region,
    color: input.color,
    operationDate: input.operationDate,
    orderIds,
    orderCount: orderIds.length,
    stopCount: operational.length,
    completedStopCount: operational.filter((s) => s.completed).length,
    distanceKm: input.distanceKm,
    durationMin: input.durationMin,
    capacityVolumePct: input.capacityVolumePct,
    capacityWeightPct: input.capacityWeightPct,
    position: points[2] ?? PARK,
    polyline: stops.map((s) => s.position),
    stops,
    version: 1,
  }
}

/** Detay sayfası için OrchestratorActiveRoute mock — `/routes/4120` id korunur. */
export const PLANNING_ROUTES_MOCK: OrchestratorActiveRoute[] = [
  route({
    id: '4120',
    label: 'RT-4120',
    status: 'aktif',
    vehicleId: 'veh-mock-10',
    vehiclePlate: '34 ORCH 10',
    courierName: 'Orch Driver1',
    region: 'Kadıköy · Beşiktaş',
    color: '#0284c7',
    operationDate: todayIso(),
    distanceKm: 41.6,
    durationMin: 101,
    capacityVolumePct: 62,
    capacityWeightPct: 48,
  }),
  route({
    id: '4121',
    label: 'RT-4121',
    status: 'planlandi',
    vehicleId: 'veh-mock-12',
    vehiclePlate: '34 ORCH 12',
    courierName: 'Orch Driver3',
    region: 'Maltepe · Kartal',
    color: '#059669',
    operationDate: todayIso(),
    distanceKm: 28.4,
    durationMin: 74,
    capacityVolumePct: 35,
    capacityWeightPct: 29,
    points: [
      { lat: 40.964, lng: 29.086 },
      { lat: 40.935, lng: 29.13 },
      { lat: 40.905, lng: 29.185 },
      { lat: 40.98, lng: 28.872 },
      { lat: 41.018, lng: 28.955 },
    ],
  }),
  route({
    id: '4118',
    label: 'RT-4118',
    status: 'aktif',
    vehicleId: 'veh-mock-11',
    vehiclePlate: '34 ORCH 11',
    courierName: 'Orch Driver2',
    region: 'Şişli · Sarıyer',
    color: '#d97706',
    operationDate: offsetIso(-1),
    distanceKm: 36.2,
    durationMin: 88,
    capacityVolumePct: 71,
    capacityWeightPct: 55,
    points: [
      { lat: 41.0428, lng: 29.0075 },
      { lat: 41.0555, lng: 28.992 },
      { lat: 41.12, lng: 29.04 },
      { lat: 41.081, lng: 29.011 },
      { lat: 41.025, lng: 29.015 },
    ],
  }),
  route({
    id: '4115',
    label: 'RT-4115',
    status: 'tamamlandi',
    vehicleId: 'veh-mock-13',
    vehiclePlate: '34 ORCH 13',
    courierName: 'Orch Driver4',
    region: 'Fatih · Bakırköy',
    color: '#7c3aed',
    operationDate: offsetIso(-1),
    distanceKm: 22.1,
    durationMin: 56,
    capacityVolumePct: 40,
    capacityWeightPct: 33,
  }),
  route({
    id: '4122',
    label: 'RT-4122',
    status: 'planlandi',
    vehicleId: 'veh-mock-14',
    vehiclePlate: '34 HCB 999',
    courierName: 'Orch Driver5',
    region: 'Üsküdar · Ataşehir',
    color: '#db2777',
    operationDate: todayIso(),
    distanceKm: 19.8,
    durationMin: 52,
    capacityVolumePct: 18,
    capacityWeightPct: 22,
  }),
  route({
    id: '4125',
    label: 'RT-4125',
    status: 'planlandi',
    vehicleId: 'veh-mock-15',
    vehiclePlate: '34 ORCH 15',
    courierName: 'Orch Driver6',
    region: 'Pendik · Tuzla',
    color: '#0d9488',
    operationDate: offsetIso(2),
    distanceKm: 48.2,
    durationMin: 130,
    capacityVolumePct: 55,
    capacityWeightPct: 44,
  }),
  route({
    id: '4109',
    label: 'RT-4109',
    status: 'planlandi',
    vehicleId: 'veh-mock-09',
    vehiclePlate: '34 ORCH 09',
    courierName: 'Orch Driver9',
    region: 'Beyoğlu',
    color: '#64748b',
    operationDate: offsetIso(-2),
    distanceKm: 15.0,
    durationMin: 40,
    capacityVolumePct: 12,
    capacityWeightPct: 10,
  }),
  route({
    id: '4112',
    label: 'RT-4112',
    status: 'tamamlandi',
    vehicleId: 'veh-mock-08',
    vehiclePlate: '34 ORCH 08',
    courierName: 'Orch Driver1',
    region: 'Kadıköy',
    color: '#2563eb',
    operationDate: todayIso(),
    distanceKm: 18.4,
    durationMin: 48,
    capacityVolumePct: 28,
    capacityWeightPct: 24,
  }),
]

type ListSeed = {
  id: string
  label: string
  status: PlanningRouteStatus
  routeType: PlanningRouteType
  color: string
  operationDate: string
  vehicleId: string
  vehiclePlate: string
  courierName: string | null
  progressCompleted: number
  progressTotal: number
  orderCount: number
  distanceKm: number
  durationPlannedMin: number
  durationActualMin: number | null
  region: string
  capacityVolumePct: number
  capacityWeightPct: number
  shiftStart: string | null
  shiftEnd: string | null
  parkLabel: string | null
  customerId: string | null
  customerName: string | null
  createdAt: string
  createdBy: string | null
}

function listItem(seed: ListSeed): PlanningRouteListItem {
  return {
    ...seed,
    dateChip: resolveRouteDateChip(seed.operationDate),
  }
}

/**
 * Liste sayfası mock — sipariş/müşteri listesi kadar sütun dolu demo set.
 * Müşteri: bazı rotalarda bağlı (müşteri scoped planlama); yoksa null → "—".
 */
export const PLANNING_ROUTES_LIST_MOCK: PlanningRouteListItem[] = [
  listItem({
    id: '4120',
    label: 'RT-4120',
    status: 'aktif',
    routeType: 'Karışık',
    color: '#0284c7',
    operationDate: todayIso(),
    vehicleId: 'veh-mock-10',
    vehiclePlate: '34 ORCH 10',
    courierName: 'Orch Driver1',
    progressCompleted: 3,
    progressTotal: 8,
    orderCount: 6,
    distanceKm: 41.6,
    durationPlannedMin: 101,
    durationActualMin: null,
    region: 'Kadıköy · Beşiktaş',
    capacityVolumePct: 62,
    capacityWeightPct: 48,
    shiftStart: '08:30',
    shiftEnd: '16:30',
    parkLabel: 'Kadıköy Araç Parkı',
    customerId: 'cust-demo-acme',
    customerName: 'Acme Lojistik A.Ş.',
    createdAt: `${todayIso()}T06:12:00.000Z`,
    createdBy: 'Ayşe Dispatcher',
  }),
  listItem({
    id: '4121',
    label: 'RT-4121',
    status: 'planlandi',
    routeType: 'Standart Rota',
    color: '#059669',
    operationDate: todayIso(),
    vehicleId: 'veh-mock-12',
    vehiclePlate: '34 ORCH 12',
    courierName: 'Orch Driver3',
    progressCompleted: 0,
    progressTotal: 6,
    orderCount: 4,
    distanceKm: 28.4,
    durationPlannedMin: 74,
    durationActualMin: null,
    region: 'Maltepe · Kartal',
    capacityVolumePct: 35,
    capacityWeightPct: 29,
    shiftStart: '09:00',
    shiftEnd: '15:00',
    parkLabel: 'Kartal Depo Parkı',
    customerId: null,
    customerName: null,
    createdAt: `${todayIso()}T05:40:00.000Z`,
    createdBy: 'Ayşe Dispatcher',
  }),
  listItem({
    id: '4118',
    label: 'RT-4118',
    status: 'aktif',
    routeType: 'Ekspres Teslimat',
    color: '#d97706',
    operationDate: offsetIso(-1),
    vehicleId: 'veh-mock-11',
    vehiclePlate: '34 ORCH 11',
    courierName: 'Orch Driver2',
    progressCompleted: 5,
    progressTotal: 7,
    orderCount: 5,
    distanceKm: 36.2,
    durationPlannedMin: 88,
    durationActualMin: null,
    region: 'Şişli · Sarıyer',
    capacityVolumePct: 71,
    capacityWeightPct: 55,
    shiftStart: '08:00',
    shiftEnd: '17:00',
    parkLabel: 'Şişli Merkez Park',
    customerId: 'cust-demo-nord',
    customerName: 'Nord Retail',
    createdAt: `${offsetIso(-1)}T07:05:00.000Z`,
    createdBy: 'Mehmet Planlama',
  }),
  listItem({
    id: '4115',
    label: 'RT-4115',
    status: 'tamamlandi',
    routeType: 'Toplama Ringi',
    color: '#7c3aed',
    operationDate: offsetIso(-1),
    vehicleId: 'veh-mock-13',
    vehiclePlate: '34 ORCH 13',
    courierName: 'Orch Driver4',
    progressCompleted: 8,
    progressTotal: 8,
    orderCount: 7,
    distanceKm: 22.1,
    durationPlannedMin: 56,
    durationActualMin: 61,
    region: 'Fatih · Bakırköy',
    capacityVolumePct: 40,
    capacityWeightPct: 33,
    shiftStart: '10:00',
    shiftEnd: '14:30',
    parkLabel: 'Bakırköy Tesis',
    customerId: null,
    customerName: null,
    createdAt: `${offsetIso(-2)}T18:20:00.000Z`,
    createdBy: 'Sistem',
  }),
  listItem({
    id: '4122',
    label: 'RT-4122',
    status: 'planlandi',
    routeType: 'Karışık',
    color: '#db2777',
    operationDate: todayIso(),
    vehicleId: 'veh-mock-14',
    vehiclePlate: '34 HCB 999',
    courierName: 'Orch Driver5',
    progressCompleted: 0,
    progressTotal: 4,
    orderCount: 3,
    distanceKm: 19.8,
    durationPlannedMin: 52,
    durationActualMin: null,
    region: 'Üsküdar · Ataşehir',
    capacityVolumePct: 18,
    capacityWeightPct: 22,
    shiftStart: '11:00',
    shiftEnd: '15:30',
    parkLabel: 'Üsküdar Park',
    customerId: 'cust-demo-acme',
    customerName: 'Acme Lojistik A.Ş.',
    createdAt: `${todayIso()}T04:55:00.000Z`,
    createdBy: 'Ayşe Dispatcher',
  }),
  listItem({
    id: '4125',
    label: 'RT-4125',
    status: 'planlandi',
    routeType: 'Ekspres Teslimat',
    color: '#0d9488',
    operationDate: offsetIso(2),
    vehicleId: 'veh-mock-15',
    vehiclePlate: '34 ORCH 15',
    courierName: 'Orch Driver6',
    progressCompleted: 0,
    progressTotal: 10,
    orderCount: 9,
    distanceKm: 48.2,
    durationPlannedMin: 130,
    durationActualMin: null,
    region: 'Pendik · Tuzla',
    capacityVolumePct: 55,
    capacityWeightPct: 44,
    shiftStart: '07:30',
    shiftEnd: '16:00',
    parkLabel: 'Tuzla Lojistik Park',
    customerId: null,
    customerName: null,
    createdAt: `${todayIso()}T09:10:00.000Z`,
    createdBy: 'Mehmet Planlama',
  }),
  listItem({
    id: '4109',
    label: 'RT-4109',
    status: 'iptal',
    routeType: 'Standart Rota',
    color: '#64748b',
    operationDate: offsetIso(-2),
    vehicleId: 'veh-mock-09',
    vehiclePlate: '34 ORCH 09',
    courierName: null,
    progressCompleted: 0,
    progressTotal: 5,
    orderCount: 4,
    distanceKm: 15.0,
    durationPlannedMin: 40,
    durationActualMin: null,
    region: 'Beyoğlu',
    capacityVolumePct: 12,
    capacityWeightPct: 10,
    shiftStart: '13:00',
    shiftEnd: '17:00',
    parkLabel: 'Taksim Depo',
    customerId: 'cust-demo-nord',
    customerName: 'Nord Retail',
    createdAt: `${offsetIso(-3)}T11:00:00.000Z`,
    createdBy: 'Ayşe Dispatcher',
  }),
  listItem({
    id: '4112',
    label: 'RT-4112',
    status: 'tamamlandi',
    routeType: 'Toplama Ringi',
    color: '#2563eb',
    operationDate: todayIso(),
    vehicleId: 'veh-mock-08',
    vehiclePlate: '34 ORCH 08',
    courierName: 'Orch Driver1',
    progressCompleted: 6,
    progressTotal: 6,
    orderCount: 5,
    distanceKm: 18.4,
    durationPlannedMin: 48,
    durationActualMin: 45,
    region: 'Kadıköy',
    capacityVolumePct: 28,
    capacityWeightPct: 24,
    shiftStart: '06:30',
    shiftEnd: '10:00',
    parkLabel: 'Kadıköy Araç Parkı',
    customerId: null,
    customerName: null,
    createdAt: `${offsetIso(-1)}T20:15:00.000Z`,
    createdBy: 'Sistem',
  }),
]

export function getPlanningRoutesMockList(search?: string): OrchestratorActiveRoute[] {
  const q = search?.trim().toLocaleLowerCase('tr-TR')
  if (!q) return PLANNING_ROUTES_MOCK
  return PLANNING_ROUTES_MOCK.filter((item) => {
    const haystack = [
      item.label,
      item.vehiclePlate,
      item.courierName ?? '',
      item.region,
      item.id,
    ]
      .join(' ')
      .toLocaleLowerCase('tr-TR')
    return haystack.includes(q)
  })
}

export function getPlanningRoutesListMock(search?: string): PlanningRouteListItem[] {
  const q = search?.trim().toLocaleLowerCase('tr-TR')
  if (!q) return PLANNING_ROUTES_LIST_MOCK
  return PLANNING_ROUTES_LIST_MOCK.filter((item) => {
    const haystack = [
      item.label,
      item.vehiclePlate,
      item.courierName ?? '',
      item.region,
      item.customerName ?? '',
      item.id,
    ]
      .join(' ')
      .toLocaleLowerCase('tr-TR')
    return haystack.includes(q)
  })
}

export function getPlanningRouteMockById(routeId: string): OrchestratorActiveRoute | null {
  return PLANNING_ROUTES_MOCK.find((item) => item.id === routeId) ?? null
}
