import {
  ACTIVE_RETURN_STATUSES,
  RETURN_VIEW_STATUSES,
  type GonderReturn,
  type ReturnStatus,
  type ReturnView,
} from '../_types/returns'

export type ReturnsListQuery = {
  view?: ReturnView
  status?: ReturnStatus | null
  search?: string
  carrier?: string | null
}

export type ReturnsListResult = {
  items: GonderReturn[]
  total: number
  viewCounts: Record<ReturnView, number>
  activeCount: number
}

export interface ReturnsRepository {
  list(query?: ReturnsListQuery): Promise<ReturnsListResult>
  countActive(): Promise<number>
  getById(id: string): Promise<GonderReturn | null>
  updateStatus(id: string, status: ReturnStatus): Promise<GonderReturn>
  simulateWebhook(payload: Partial<GonderReturn> & { id?: string }): Promise<GonderReturn>
}

const seed: GonderReturn[] = [
  {
    id: 'ret-1001',
    orderNumber: 'ORD-10023',
    customerName: 'Ayşe Yılmaz',
    requestedAt: '2026-08-05T10:20:00.000Z',
    status: 'awaiting_approval',
    handoverPoint: null,
    carrierRef: null,
    carrier: 'ARF Parcel',
    returnMethod: 'Kapıdan alma',
    documents: { labelReady: false, hasProofOfDelivery: false, hasPhotos: false },
  },
  {
    id: 'ret-1002',
    orderNumber: 'ORD-10041',
    customerName: 'Mehmet Demir',
    requestedAt: '2026-08-04T14:05:00.000Z',
    status: 'in_transit',
    handoverPoint: 'Kadıköy Şube',
    carrierRef: 'RET-88421',
    carrier: 'Hızlı Kurye',
    returnMethod: 'Şubeye bırakma',
    documents: { labelReady: true, hasProofOfDelivery: false, hasPhotos: true },
  },
  {
    id: 'ret-1003',
    orderNumber: 'ORD-9981',
    customerName: 'Elif Kara',
    requestedAt: '2026-08-01T09:00:00.000Z',
    status: 'completed',
    handoverPoint: 'Müşteri adresi',
    carrierRef: 'RET-77102',
    carrier: 'ARF Parcel',
    returnMethod: 'Kapıdan alma',
    documents: { labelReady: true, hasProofOfDelivery: true, hasPhotos: true },
  },
  {
    id: 'ret-1004',
    orderNumber: 'ORD-10055',
    customerName: 'Can Öztürk',
    requestedAt: '2026-08-06T16:40:00.000Z',
    status: 'rejected',
    handoverPoint: null,
    carrierRef: null,
    carrier: 'Express Lojistik',
    returnMethod: 'Kapıdan alma',
    note: 'Ürün iade koşullarına uymuyor',
    documents: { labelReady: false, hasProofOfDelivery: false, hasPhotos: false },
  },
  {
    id: 'ret-1005',
    orderNumber: 'ORD-10060',
    customerName: 'Zeynep Ak',
    requestedAt: '2026-08-07T08:15:00.000Z',
    status: 'requested',
    handoverPoint: null,
    carrierRef: null,
    carrier: 'ARF Parcel',
    returnMethod: 'Kapıdan alma',
    documents: { labelReady: false, hasProofOfDelivery: false, hasPhotos: false },
  },
  {
    id: 'ret-1006',
    orderNumber: 'ORD-10115',
    customerName: 'İrem Koç',
    requestedAt: '2026-08-07T11:00:00.000Z',
    status: 'label_ready',
    handoverPoint: 'Beşiktaş Şube',
    carrierRef: 'RET-90211',
    carrier: 'ARF Parcel',
    returnMethod: 'Şubeye bırakma',
    documents: { labelReady: true, hasProofOfDelivery: false, hasPhotos: false },
  },
]

function matchesQuery(item: GonderReturn, query: ReturnsListQuery = {}) {
  const view = query.view ?? 'all'
  const statuses = RETURN_VIEW_STATUSES[view]
  if (statuses && !statuses.includes(item.status)) return false
  if (query.status && item.status !== query.status) return false
  if (query.carrier && item.carrier !== query.carrier) return false
  if (query.search?.trim()) {
    const needle = query.search.trim().toLocaleLowerCase('tr-TR')
    const hay = `${item.orderNumber} ${item.customerName} ${item.carrierRef ?? ''} ${item.carrier}`.toLocaleLowerCase(
      'tr-TR'
    )
    if (!hay.includes(needle)) return false
  }
  return true
}

function countByView(items: GonderReturn[]): Record<ReturnView, number> {
  return {
    all: items.length,
    in_progress: items.filter((item) => RETURN_VIEW_STATUSES.in_progress!.includes(item.status)).length,
    returned: items.filter((item) => RETURN_VIEW_STATUSES.returned!.includes(item.status)).length,
    completed: items.filter((item) => RETURN_VIEW_STATUSES.completed!.includes(item.status)).length,
    rejected_cancelled: items.filter((item) =>
      RETURN_VIEW_STATUSES.rejected_cancelled!.includes(item.status)
    ).length,
  }
}

export class MockReturnsRepository implements ReturnsRepository {
  private items: GonderReturn[] = [...seed]

  async list(query: ReturnsListQuery = {}): Promise<ReturnsListResult> {
    await delay(80)
    const filtered = this.items.filter((item) => matchesQuery(item, query))
    return {
      items: filtered,
      total: filtered.length,
      viewCounts: countByView(this.items),
      activeCount: this.items.filter((item) => ACTIVE_RETURN_STATUSES.includes(item.status)).length,
    }
  }

  async countActive(): Promise<number> {
    await delay(40)
    return this.items.filter((item) => ACTIVE_RETURN_STATUSES.includes(item.status)).length
  }

  async getById(id: string): Promise<GonderReturn | null> {
    await delay(40)
    return this.items.find((item) => item.id === id) ?? null
  }

  async updateStatus(id: string, status: ReturnStatus): Promise<GonderReturn> {
    await delay(60)
    const index = this.items.findIndex((item) => item.id === id)
    if (index < 0) throw new Error('İade bulunamadı')
    const next = { ...this.items[index]!, status }
    this.items[index] = next
    return next
  }

  async simulateWebhook(payload: Partial<GonderReturn> & { id?: string }): Promise<GonderReturn> {
    await delay(60)
    const id = payload.id ?? `ret-${Date.now()}`
    const existing = this.items.findIndex((item) => item.id === id)
    if (existing >= 0) {
      const next = { ...this.items[existing]!, ...payload, id }
      this.items[existing] = next
      return next
    }
    const created: GonderReturn = {
      id,
      orderNumber: payload.orderNumber ?? `ORD-${Math.floor(Math.random() * 90000 + 10000)}`,
      customerName: payload.customerName ?? 'Webhook Müşteri',
      requestedAt: payload.requestedAt ?? new Date().toISOString(),
      status: payload.status ?? 'requested',
      handoverPoint: payload.handoverPoint ?? null,
      carrierRef: payload.carrierRef ?? null,
      carrier: payload.carrier ?? 'ARF Parcel',
      returnMethod: payload.returnMethod ?? 'Kapıdan alma',
      documents: payload.documents ?? {
        labelReady: false,
        hasProofOfDelivery: false,
        hasPhotos: false,
      },
      note: payload.note,
    }
    this.items = [created, ...this.items]
    return created
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const returnsRepository: ReturnsRepository = new MockReturnsRepository()
