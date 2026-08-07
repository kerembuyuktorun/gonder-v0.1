import {
  ORDER_VIEW_STATUSES,
  type GonderOrder,
  type OrderChannel,
  type OrderStatus,
  type OrderView,
} from '../_types/orders'

export type OrdersListQuery = {
  view?: OrderView
  status?: OrderStatus | null
  channel?: OrderChannel | null
  search?: string
}

export type OrdersListResult = {
  items: GonderOrder[]
  total: number
  viewCounts: Record<OrderView, number>
}

export interface OrdersRepository {
  list(query?: OrdersListQuery): Promise<OrdersListResult>
  getById(id: string): Promise<GonderOrder | null>
  updateStatus(id: string, status: OrderStatus): Promise<GonderOrder>
  bulkUpdateStatus(ids: string[], status: OrderStatus): Promise<number>
}

const seed: GonderOrder[] = [
  {
    id: 'ord-501',
    orderNumber: 'ORD-10023',
    channel: 'shopify',
    customerName: 'Ayşe Yılmaz',
    originCity: 'İstanbul',
    destinationCity: 'Ankara',
    status: 'pending_review',
    amountTry: 1240,
    currency: 'TRY',
    pieceCount: 2,
    createdAt: '2026-08-07T08:10:00.000Z',
    shipmentId: null,
  },
  {
    id: 'ord-502',
    orderNumber: 'ORD-10041',
    channel: 'trendyol',
    customerName: 'Mehmet Demir',
    originCity: 'İzmir',
    destinationCity: 'Bursa',
    status: 'ready_for_shipment',
    amountTry: 890,
    currency: 'TRY',
    pieceCount: 1,
    createdAt: '2026-08-06T14:20:00.000Z',
    shipmentId: null,
  },
  {
    id: 'ord-503',
    orderNumber: 'ORD-9981',
    channel: 'excel',
    customerName: 'Elif Kara',
    originCity: 'Ankara',
    destinationCity: 'Antalya',
    status: 'processing',
    amountTry: 2100,
    currency: 'TRY',
    pieceCount: 3,
    createdAt: '2026-08-05T11:00:00.000Z',
    shipmentId: 'sh-1003',
  },
  {
    id: 'ord-504',
    orderNumber: 'ORD-10055',
    channel: 'api',
    customerName: 'Can Öztürk',
    originCity: 'İstanbul',
    destinationCity: 'Gaziantep',
    status: 'integration_error',
    amountTry: 640,
    currency: 'TRY',
    pieceCount: 1,
    createdAt: '2026-08-07T09:40:00.000Z',
    shipmentId: null,
  },
  {
    id: 'ord-505',
    orderNumber: 'ORD-10060',
    channel: 'shopify',
    customerName: 'Zeynep Ak',
    originCity: 'Kocaeli',
    destinationCity: 'İstanbul',
    status: 'completed',
    amountTry: 450,
    currency: 'TRY',
    pieceCount: 1,
    createdAt: '2026-08-01T16:15:00.000Z',
    shipmentId: 'sh-0990',
  },
  {
    id: 'ord-506',
    orderNumber: 'ORD-10071',
    channel: 'manual',
    customerName: 'Deniz Aydın',
    originCity: 'Adana',
    destinationCity: 'Mersin',
    status: 'approved',
    amountTry: 1320,
    currency: 'TRY',
    pieceCount: 2,
    createdAt: '2026-08-07T07:05:00.000Z',
    shipmentId: null,
  },
  {
    id: 'ord-507',
    orderNumber: 'ORD-10080',
    channel: 'trendyol',
    customerName: 'Burak Şen',
    originCity: 'İstanbul',
    destinationCity: 'Samsun',
    status: 'rejected',
    amountTry: 780,
    currency: 'TRY',
    pieceCount: 1,
    createdAt: '2026-08-04T12:30:00.000Z',
    shipmentId: null,
  },
]

function matches(item: GonderOrder, query: OrdersListQuery = {}) {
  const view = query.view ?? 'all'
  const statuses = ORDER_VIEW_STATUSES[view]
  if (statuses && !statuses.includes(item.status)) return false
  if (query.status && item.status !== query.status) return false
  if (query.channel && item.channel !== query.channel) return false
  if (query.search?.trim()) {
    const needle = query.search.trim().toLocaleLowerCase('tr-TR')
    const hay = `${item.orderNumber} ${item.customerName} ${item.originCity} ${item.destinationCity}`.toLocaleLowerCase(
      'tr-TR'
    )
    if (!hay.includes(needle)) return false
  }
  return true
}

function countViews(items: GonderOrder[]): Record<OrderView, number> {
  return {
    all: items.length,
    pending: items.filter((i) => ORDER_VIEW_STATUSES.pending!.includes(i.status)).length,
    needs_shipment: items.filter((i) => ORDER_VIEW_STATUSES.needs_shipment!.includes(i.status))
      .length,
    processing: items.filter((i) => ORDER_VIEW_STATUSES.processing!.includes(i.status)).length,
    rejected: items.filter((i) => ORDER_VIEW_STATUSES.rejected!.includes(i.status)).length,
    issues: items.filter((i) => ORDER_VIEW_STATUSES.issues!.includes(i.status)).length,
    completed: items.filter((i) => ORDER_VIEW_STATUSES.completed!.includes(i.status)).length,
  }
}

export class MockOrdersRepository implements OrdersRepository {
  private items = [...seed]

  async list(query: OrdersListQuery = {}): Promise<OrdersListResult> {
    await delay(70)
    const filtered = this.items.filter((item) => matches(item, query))
    return { items: filtered, total: filtered.length, viewCounts: countViews(this.items) }
  }

  async getById(id: string): Promise<GonderOrder | null> {
    await delay(40)
    return this.items.find((item) => item.id === id) ?? null
  }

  async updateStatus(id: string, status: OrderStatus): Promise<GonderOrder> {
    await delay(50)
    const index = this.items.findIndex((item) => item.id === id)
    if (index < 0) throw new Error('Sipariş bulunamadı')
    const next = { ...this.items[index]!, status }
    this.items[index] = next
    return next
  }

  async bulkUpdateStatus(ids: string[], status: OrderStatus): Promise<number> {
    await delay(80)
    let count = 0
    this.items = this.items.map((item) => {
      if (!ids.includes(item.id)) return item
      count += 1
      return { ...item, status }
    })
    return count
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const ordersRepository: OrdersRepository = new MockOrdersRepository()
