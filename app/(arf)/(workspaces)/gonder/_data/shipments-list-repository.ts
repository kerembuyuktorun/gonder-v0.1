import {
  SHIPMENT_VIEW_STATUSES,
  type GonderShipmentListItem,
  type ShipmentListStatus,
  type ShipmentView,
} from '../_types/shipments'

export type ShipmentsListQuery = {
  view?: ShipmentView
  status?: ShipmentListStatus | null
  search?: string
  carrier?: string | null
}

export type ShipmentsListResult = {
  items: GonderShipmentListItem[]
  total: number
  viewCounts: Record<ShipmentView, number>
}

export interface ShipmentsListRepository {
  list(query?: ShipmentsListQuery): Promise<ShipmentsListResult>
  getById(id: string): Promise<GonderShipmentListItem | null>
  updateStatus(id: string, status: ShipmentListStatus): Promise<GonderShipmentListItem>
  create(input: Omit<GonderShipmentListItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<GonderShipmentListItem>
}

const seed: GonderShipmentListItem[] = [
  {
    id: 'sh-1001',
    reference: 'GND-1001',
    orderNumber: 'ORD-10023',
    carrier: 'ARF Parcel',
    serviceType: 'Express',
    originCity: 'İstanbul',
    destinationCity: 'Ankara',
    status: 'in_transit',
    desi: 8,
    weightKg: 4.2,
    amountTry: 189,
    createdAt: '2026-08-06T10:00:00.000Z',
    updatedAt: '2026-08-07T09:12:00.000Z',
  },
  {
    id: 'sh-1002',
    reference: 'GND-1002',
    orderNumber: 'ORD-10041',
    carrier: 'Hızlı Kurye',
    serviceType: 'Aynı Gün',
    originCity: 'İzmir',
    destinationCity: 'Bursa',
    status: 'label_ready',
    desi: 3,
    weightKg: 1.5,
    amountTry: 95,
    createdAt: '2026-08-07T08:20:00.000Z',
    updatedAt: '2026-08-07T08:40:00.000Z',
  },
  {
    id: 'sh-1003',
    reference: 'GND-1003',
    orderNumber: 'ORD-9981',
    carrier: 'ARF Parcel',
    serviceType: 'Standart',
    originCity: 'Ankara',
    destinationCity: 'Antalya',
    status: 'out_for_delivery',
    desi: 12,
    weightKg: 7.1,
    amountTry: 240,
    createdAt: '2026-08-05T12:00:00.000Z',
    updatedAt: '2026-08-07T07:55:00.000Z',
  },
  {
    id: 'sh-1004',
    reference: 'GND-1004',
    orderNumber: 'ORD-10055',
    carrier: 'Express Lojistik',
    serviceType: 'Ekonomik',
    originCity: 'İstanbul',
    destinationCity: 'Gaziantep',
    status: 'exception',
    desi: 18,
    weightKg: 11,
    amountTry: 310,
    createdAt: '2026-08-04T15:30:00.000Z',
    updatedAt: '2026-08-06T18:10:00.000Z',
  },
  {
    id: 'sh-1005',
    reference: 'GND-1005',
    orderNumber: 'ORD-10060',
    carrier: 'ARF Parcel',
    serviceType: 'Express',
    originCity: 'Kocaeli',
    destinationCity: 'İstanbul',
    status: 'delivered',
    desi: 5,
    weightKg: 2.4,
    amountTry: 120,
    createdAt: '2026-08-02T09:00:00.000Z',
    updatedAt: '2026-08-03T16:20:00.000Z',
  },
  {
    id: 'sh-1006',
    reference: 'GND-1006',
    orderNumber: null,
    carrier: 'ARF Parcel',
    serviceType: 'Standart',
    originCity: 'Adana',
    destinationCity: 'Mersin',
    status: 'picked_up',
    desi: 9,
    weightKg: 5,
    amountTry: 160,
    createdAt: '2026-08-07T06:45:00.000Z',
    updatedAt: '2026-08-07T10:05:00.000Z',
  },
  {
    id: 'sh-1007',
    reference: 'GND-1007',
    orderNumber: 'ORD-10080',
    carrier: 'Hızlı Kurye',
    serviceType: 'Express',
    originCity: 'İstanbul',
    destinationCity: 'Samsun',
    status: 'cancelled',
    desi: 4,
    weightKg: 1.8,
    amountTry: null,
    createdAt: '2026-08-03T11:20:00.000Z',
    updatedAt: '2026-08-03T13:00:00.000Z',
  },
]

function matches(item: GonderShipmentListItem, query: ShipmentsListQuery = {}) {
  const view = query.view ?? 'all'
  const statuses = SHIPMENT_VIEW_STATUSES[view]
  if (statuses && !statuses.includes(item.status)) return false
  if (query.status && item.status !== query.status) return false
  if (query.carrier && item.carrier !== query.carrier) return false
  if (query.search?.trim()) {
    const needle = query.search.trim().toLocaleLowerCase('tr-TR')
    const hay = `${item.reference} ${item.orderNumber ?? ''} ${item.carrier} ${item.originCity} ${item.destinationCity}`.toLocaleLowerCase(
      'tr-TR'
    )
    if (!hay.includes(needle)) return false
  }
  return true
}

function countViews(items: GonderShipmentListItem[]): Record<ShipmentView, number> {
  return {
    all: items.length,
    active: items.filter((i) => SHIPMENT_VIEW_STATUSES.active!.includes(i.status)).length,
    delivered: items.filter((i) => SHIPMENT_VIEW_STATUSES.delivered!.includes(i.status)).length,
    returned: items.filter((i) => SHIPMENT_VIEW_STATUSES.returned!.includes(i.status)).length,
    issues: items.filter((i) => SHIPMENT_VIEW_STATUSES.issues!.includes(i.status)).length,
    cancelled: items.filter((i) => SHIPMENT_VIEW_STATUSES.cancelled!.includes(i.status)).length,
  }
}

export class MockShipmentsListRepository implements ShipmentsListRepository {
  private items = [...seed]

  async list(query: ShipmentsListQuery = {}): Promise<ShipmentsListResult> {
    await delay(70)
    const filtered = this.items.filter((item) => matches(item, query))
    return { items: filtered, total: filtered.length, viewCounts: countViews(this.items) }
  }

  async getById(id: string): Promise<GonderShipmentListItem | null> {
    await delay(40)
    return this.items.find((item) => item.id === id) ?? null
  }

  async updateStatus(id: string, status: ShipmentListStatus): Promise<GonderShipmentListItem> {
    await delay(50)
    const index = this.items.findIndex((item) => item.id === id)
    if (index < 0) throw new Error('Gönderi bulunamadı')
    const next = {
      ...this.items[index]!,
      status,
      updatedAt: new Date().toISOString(),
    }
    this.items[index] = next
    return next
  }

  async create(
    input: Omit<GonderShipmentListItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<GonderShipmentListItem> {
    await delay(80)
    const now = new Date().toISOString()
    const created: GonderShipmentListItem = {
      ...input,
      id: input.id ?? `sh-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    }
    this.items = [created, ...this.items]
    return created
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const shipmentsListRepository: ShipmentsListRepository = new MockShipmentsListRepository()
