import {
  DESI_VIEW_STATUSES,
  type DesiAdjustmentStatus,
  type DesiAdjustmentView,
  type GonderDesiAdjustment,
} from '../_types/desi-adjustments'

export type DesiListQuery = {
  view?: DesiAdjustmentView
  status?: DesiAdjustmentStatus | null
  search?: string
  carrier?: string | null
}

export type DesiListResult = {
  items: GonderDesiAdjustment[]
  total: number
  viewCounts: Record<DesiAdjustmentView, number>
  unreviewedCount: number
}

export interface DesiAdjustmentsRepository {
  list(query?: DesiListQuery): Promise<DesiListResult>
  countUnreviewed(): Promise<number>
  getById(id: string): Promise<GonderDesiAdjustment | null>
  updateStatus(id: string, status: DesiAdjustmentStatus): Promise<GonderDesiAdjustment>
  simulateWebhook(
    payload: Partial<GonderDesiAdjustment> & { id?: string }
  ): Promise<GonderDesiAdjustment>
}

function withDeltas(
  item: Omit<GonderDesiAdjustment, 'deltaDesi' | 'deltaWeightKg'> &
    Partial<Pick<GonderDesiAdjustment, 'deltaDesi' | 'deltaWeightKg'>>
): GonderDesiAdjustment {
  return {
    ...item,
    deltaDesi: Math.round((item.measuredDesi - item.declaredDesi) * 100) / 100,
    deltaWeightKg: Math.round((item.measuredWeightKg - item.declaredWeightKg) * 100) / 100,
  }
}

const seed: GonderDesiAdjustment[] = [
  withDeltas({
    id: 'desi-2001',
    shipmentRef: 'GND-1001',
    orderNumber: 'ORD-10023',
    carrier: 'ARF Parcel',
    declaredDesi: 8,
    measuredDesi: 12.4,
    declaredWeightKg: 4,
    measuredWeightKg: 5.2,
    chargeTry: 86,
    status: 'unreviewed',
    createdAt: '2026-08-07T07:30:00.000Z',
  }),
  withDeltas({
    id: 'desi-2002',
    shipmentRef: 'GND-1004',
    orderNumber: 'ORD-9988',
    carrier: 'Express Lojistik',
    declaredDesi: 20,
    measuredDesi: 28,
    declaredWeightKg: 12,
    measuredWeightKg: 14.5,
    chargeTry: 145,
    status: 'disputed',
    createdAt: '2026-08-06T11:10:00.000Z',
    note: 'Paket ölçümü itiraz edildi',
  }),
  withDeltas({
    id: 'desi-2003',
    shipmentRef: 'GND-0990',
    orderNumber: null,
    carrier: 'Hızlı Kurye',
    declaredDesi: 5,
    measuredDesi: 5.2,
    declaredWeightKg: 2,
    measuredWeightKg: 2.1,
    chargeTry: null,
    status: 'resolved',
    createdAt: '2026-08-02T15:00:00.000Z',
  }),
  withDeltas({
    id: 'desi-2004',
    shipmentRef: 'GND-1008',
    orderNumber: 'ORD-10102',
    carrier: 'ARF Parcel',
    declaredDesi: 15,
    measuredDesi: 22,
    declaredWeightKg: 8,
    measuredWeightKg: 9.4,
    chargeTry: 112,
    status: 'charge_pending',
    createdAt: '2026-08-05T18:20:00.000Z',
  }),
]

function matchesQuery(item: GonderDesiAdjustment, query: DesiListQuery = {}) {
  const view = query.view ?? 'all'
  const statuses = DESI_VIEW_STATUSES[view]
  if (statuses && !statuses.includes(item.status)) return false
  if (query.status && item.status !== query.status) return false
  if (query.carrier && item.carrier !== query.carrier) return false
  if (query.search?.trim()) {
    const needle = query.search.trim().toLocaleLowerCase('tr-TR')
    const hay = `${item.shipmentRef} ${item.orderNumber ?? ''} ${item.carrier}`.toLocaleLowerCase(
      'tr-TR'
    )
    if (!hay.includes(needle)) return false
  }
  return true
}

function countByView(items: GonderDesiAdjustment[]): Record<DesiAdjustmentView, number> {
  return {
    all: items.length,
    unreviewed: items.filter((item) => DESI_VIEW_STATUSES.unreviewed!.includes(item.status)).length,
    in_review: items.filter((item) => DESI_VIEW_STATUSES.in_review!.includes(item.status)).length,
    charge: items.filter((item) => DESI_VIEW_STATUSES.charge!.includes(item.status)).length,
    resolved: items.filter((item) => DESI_VIEW_STATUSES.resolved!.includes(item.status)).length,
  }
}

export class MockDesiAdjustmentsRepository implements DesiAdjustmentsRepository {
  private items: GonderDesiAdjustment[] = [...seed]

  async list(query: DesiListQuery = {}): Promise<DesiListResult> {
    await delay(80)
    const filtered = this.items.filter((item) => matchesQuery(item, query))
    return {
      items: filtered,
      total: filtered.length,
      viewCounts: countByView(this.items),
      unreviewedCount: this.items.filter((item) => item.status === 'unreviewed').length,
    }
  }

  async countUnreviewed(): Promise<number> {
    await delay(40)
    return this.items.filter((item) => item.status === 'unreviewed').length
  }

  async getById(id: string): Promise<GonderDesiAdjustment | null> {
    await delay(40)
    return this.items.find((item) => item.id === id) ?? null
  }

  async updateStatus(id: string, status: DesiAdjustmentStatus): Promise<GonderDesiAdjustment> {
    await delay(60)
    const index = this.items.findIndex((item) => item.id === id)
    if (index < 0) throw new Error('Desi kaydı bulunamadı')
    const next = { ...this.items[index]!, status }
    this.items[index] = next
    return next
  }

  async simulateWebhook(
    payload: Partial<GonderDesiAdjustment> & { id?: string }
  ): Promise<GonderDesiAdjustment> {
    await delay(60)
    const id = payload.id ?? `desi-${Date.now()}`
    const existing = this.items.findIndex((item) => item.id === id)
    const declaredDesi = payload.declaredDesi ?? 10
    const measuredDesi = payload.measuredDesi ?? 14
    const declaredWeightKg = payload.declaredWeightKg ?? 5
    const measuredWeightKg = payload.measuredWeightKg ?? 6
    const base = withDeltas({
      id,
      shipmentRef: payload.shipmentRef ?? `GND-${Math.floor(Math.random() * 9000 + 1000)}`,
      orderNumber: payload.orderNumber ?? null,
      carrier: payload.carrier ?? 'ARF Parcel',
      declaredDesi,
      measuredDesi,
      declaredWeightKg,
      measuredWeightKg,
      chargeTry: payload.chargeTry ?? null,
      status: payload.status ?? 'unreviewed',
      createdAt: payload.createdAt ?? new Date().toISOString(),
      note: payload.note,
    })
    if (existing >= 0) {
      this.items[existing] = { ...this.items[existing]!, ...base }
      return this.items[existing]!
    }
    this.items = [base, ...this.items]
    return base
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const desiAdjustmentsRepository: DesiAdjustmentsRepository =
  new MockDesiAdjustmentsRepository()
