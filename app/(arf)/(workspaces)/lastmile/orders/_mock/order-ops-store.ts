/**
 * Last Mile order ops mock store (cancel / return / defer).
 * TODO: Remove mock when backend API is ready.
 */
import {
  buildSeedCancelRequests,
  buildSeedDeferrals,
  buildSeedOverlay,
  buildSeedReturnOrder,
  buildSeedReturns,
} from '../_data/order-ops-seed'
import { createId } from '../../finance/_lib/format'
import {
  ORDER_OPS_STORAGE_KEYS,
  isOrderOpsSeeded,
  markOrderOpsSeeded,
  readOrderOpsJson,
  writeOrderOpsJson,
} from '../_lib/order-ops-storage'
import { tomorrowIsoDate } from '../_lib/order-ops-policy'
import type { LastmileOrder, OrderStatus } from '../_types/order'
import type {
  CancelRequest,
  DeliveryDeferral,
  OrderOpsOverlay,
  ReturnSuborderLink,
} from '../_types/order-ops'

function ensureSeed() {
  if (typeof window === 'undefined') return
  if (isOrderOpsSeeded()) return
  writeOrderOpsJson(ORDER_OPS_STORAGE_KEYS.cancelRequests, buildSeedCancelRequests())
  writeOrderOpsJson(ORDER_OPS_STORAGE_KEYS.returns, buildSeedReturns())
  writeOrderOpsJson(ORDER_OPS_STORAGE_KEYS.deferrals, buildSeedDeferrals())
  writeOrderOpsJson(ORDER_OPS_STORAGE_KEYS.overlay, buildSeedOverlay())
  writeOrderOpsJson(ORDER_OPS_STORAGE_KEYS.extraOrders, [buildSeedReturnOrder()])
  markOrderOpsSeeded()
}

function delay<T>(value: T, ms = 80): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function getCancelRequests(): CancelRequest[] {
  ensureSeed()
  return readOrderOpsJson<CancelRequest[]>(ORDER_OPS_STORAGE_KEYS.cancelRequests, [])
}

function saveCancelRequests(rows: CancelRequest[]) {
  writeOrderOpsJson(ORDER_OPS_STORAGE_KEYS.cancelRequests, rows)
}

function getReturns(): ReturnSuborderLink[] {
  ensureSeed()
  return readOrderOpsJson<ReturnSuborderLink[]>(ORDER_OPS_STORAGE_KEYS.returns, [])
}

function saveReturns(rows: ReturnSuborderLink[]) {
  writeOrderOpsJson(ORDER_OPS_STORAGE_KEYS.returns, rows)
}

function getDeferrals(): DeliveryDeferral[] {
  ensureSeed()
  return readOrderOpsJson<DeliveryDeferral[]>(ORDER_OPS_STORAGE_KEYS.deferrals, [])
}

function saveDeferrals(rows: DeliveryDeferral[]) {
  writeOrderOpsJson(ORDER_OPS_STORAGE_KEYS.deferrals, rows)
}

function getOverlay(): OrderOpsOverlay {
  ensureSeed()
  return readOrderOpsJson<OrderOpsOverlay>(ORDER_OPS_STORAGE_KEYS.overlay, {
    statusByOrderId: {},
    metaByOrderId: {},
  })
}

function saveOverlay(overlay: OrderOpsOverlay) {
  writeOrderOpsJson(ORDER_OPS_STORAGE_KEYS.overlay, overlay)
}

function getExtraOrders(): LastmileOrder[] {
  ensureSeed()
  return readOrderOpsJson<LastmileOrder[]>(ORDER_OPS_STORAGE_KEYS.extraOrders, [])
}

function saveExtraOrders(rows: LastmileOrder[]) {
  writeOrderOpsJson(ORDER_OPS_STORAGE_KEYS.extraOrders, rows)
}

function patchOrderStatus(orderId: string, status: OrderStatus) {
  const overlay = getOverlay()
  overlay.statusByOrderId[orderId] = status
  saveOverlay(overlay)
}

function patchOrderMeta(
  orderId: string,
  patch: OrderOpsOverlay['metaByOrderId'][string]
) {
  const overlay = getOverlay()
  overlay.metaByOrderId[orderId] = { ...overlay.metaByOrderId[orderId], ...patch }
  saveOverlay(overlay)
}

export async function listCancelRequests(): Promise<CancelRequest[]> {
  return delay(
    [...getCancelRequests()].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
  )
}

export async function getPendingCancelRequest(
  orderId: string
): Promise<CancelRequest | undefined> {
  return delay(
    getCancelRequests().find((r) => r.orderId === orderId && r.status === 'pending')
  )
}

export async function createCancelRequest(input: {
  orderId: string
  orderTakipNo?: string
  customerName?: string
  reasonCode: string
  reasonLabel: string
  note?: string
  requestedBy?: string
}): Promise<CancelRequest> {
  const existing = getCancelRequests().find(
    (r) => r.orderId === input.orderId && r.status === 'pending'
  )
  if (existing) return delay(existing)

  const row: CancelRequest = {
    id: createId('cr'),
    orderId: input.orderId,
    orderTakipNo: input.orderTakipNo,
    customerName: input.customerName,
    reasonCode: input.reasonCode,
    reasonLabel: input.reasonLabel,
    note: input.note,
    status: 'pending',
    requestedBy: input.requestedBy ?? 'Kullanıcı',
    requestedAt: new Date().toISOString(),
  }
  saveCancelRequests([row, ...getCancelRequests()])
  return delay(row)
}

export async function decideCancelRequest(
  id: string,
  decision: 'approved' | 'rejected',
  decidedBy = 'Admin'
): Promise<CancelRequest | undefined> {
  const rows = getCancelRequests()
  const idx = rows.findIndex((r) => r.id === id)
  if (idx < 0) return delay(undefined)
  const updated: CancelRequest = {
    ...rows[idx],
    status: decision,
    decidedBy,
    decidedAt: new Date().toISOString(),
  }
  const next = [...rows]
  next[idx] = updated
  saveCancelRequests(next)
  if (decision === 'approved') {
    patchOrderStatus(updated.orderId, 'iptal_edildi')
  }
  return delay(updated)
}

export async function applyInstantCancel(orderId: string): Promise<void> {
  patchOrderStatus(orderId, 'iptal_edildi')
  return delay(undefined)
}

export async function listReturnsForParent(
  parentOrderId: string
): Promise<ReturnSuborderLink[]> {
  return delay(getReturns().filter((r) => r.parentOrderId === parentOrderId))
}

export async function listAllReturns(): Promise<ReturnSuborderLink[]> {
  return delay(getReturns())
}

export async function createReturnSuborder(input: {
  parent: LastmileOrder
  returnFee: number
  returnFeePercent: number
  packageIds: string[]
  reasonLabel?: string
  createdBy?: string
}): Promise<{ link: ReturnSuborderLink; order: LastmileOrder }> {
  const returnId = createId('lm-ret')
  const takip = `ARF-RET-${returnId.slice(-6).toUpperCase()}`
  const stamp = new Date()
  const trStamp = `${String(stamp.getDate()).padStart(2, '0')}.${String(stamp.getMonth() + 1).padStart(2, '0')}.${stamp.getFullYear()} ${String(stamp.getHours()).padStart(2, '0')}:${String(stamp.getMinutes()).padStart(2, '0')}`

  const order: LastmileOrder = {
    ...input.parent,
    id: returnId,
    takip_no: takip,
    referans_no: `RET-${input.parent.takip_no}`,
    siparis_tipi: 'iade',
    durum: 'atama_bekliyor',
    durum_etiketi: 'Atama Bekliyor',
    rota_atandi: false,
    rota_kodu: null,
    atanan_arac: null,
    atanan_kurye: null,
    eta: '—',
    eta_kalan_dk: null,
    eta_alim_yapildi: false,
    // Ters yön: varış → alış
    alis_noktasi: input.parent.varis_noktasi,
    alis_acik_adres: input.parent.varis_acik_adres,
    alis_muhatabi: input.parent.varis_muhatabi,
    alis_telefon: input.parent.varis_telefon,
    varis_noktasi: input.parent.alis_noktasi,
    varis_acik_adres: input.parent.alis_acik_adres,
    varis_muhatabi: input.parent.alis_muhatabi,
    varis_telefon: input.parent.alis_telefon,
    etiketler: [...(input.parent.etiketler ?? []), 'İade'].filter(
      (v, i, a) => a.indexOf(v) === i
    ),
    olusturulma_zamani: trStamp,
    olusturan: input.createdBy ?? 'Sistem',
    donen_paket: input.packageIds.length || input.parent.paket_sayisi,
    giden_paket: null,
  }

  const link: ReturnSuborderLink = {
    id: createId('ret'),
    parentOrderId: input.parent.id,
    returnOrderId: returnId,
    returnTakipNo: takip,
    returnFee: input.returnFee,
    returnFeePercent: input.returnFeePercent,
    packageIds: input.packageIds,
    reasonLabel: input.reasonLabel,
    createdAt: stamp.toISOString(),
    createdBy: input.createdBy ?? 'Sistem',
  }

  saveExtraOrders([order, ...getExtraOrders()])
  saveReturns([link, ...getReturns()])
  patchOrderMeta(returnId, { parent_order_id: input.parent.id })
  return delay({ link, order })
}

export async function listDeferralsForOrder(orderId: string): Promise<DeliveryDeferral[]> {
  return delay(
    getDeferrals()
      .filter((d) => d.orderId === orderId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  )
}

/**
 * Ertesi güne kargo devri (zimmet değişimi değil).
 * Mobil sözleşme (mock): POST /api/lastmile/orders/:id/defer
 * body: { reasonCode, reasonLabel?, note?, deferredToDate? }
 */
export async function createDeliveryDeferral(input: {
  orderId: string
  reasonCode: string
  reasonLabel: string
  note?: string
  deferredToDate?: string
  createdBy?: string
}): Promise<DeliveryDeferral> {
  const prev = getDeferrals().filter((d) => d.orderId === input.orderId)
  const deferredToDate = input.deferredToDate ?? tomorrowIsoDate()
  const row: DeliveryDeferral = {
    id: createId('def'),
    orderId: input.orderId,
    reasonCode: input.reasonCode,
    reasonLabel: input.reasonLabel,
    note: input.note,
    deferredToDate,
    attemptNo: prev.length + 1,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy ?? 'Kurye',
  }
  saveDeferrals([row, ...getDeferrals()])

  const [y, m, d] = deferredToDate.split('-')
  const label = `${d}.${m}.${y}`
  patchOrderStatus(input.orderId, 'atama_bekliyor')
  patchOrderMeta(input.orderId, {
    rota_atandi: false,
    atanan_kurye: null,
    atanan_arac: null,
    eta: '—',
    alim_zaman_penceresi: `${label} - 09:00 - 12:00`,
    teslim_zaman_penceresi: `${label} - 14:00 - 18:00`,
  })

  return delay(row)
}

export function getExtraOrdersSync(): LastmileOrder[] {
  ensureSeed()
  return getExtraOrders()
}

export function getOverlaySync(): OrderOpsOverlay {
  ensureSeed()
  return getOverlay()
}

/** Liste satırlarına overlay uygula + ekstra iade siparişlerini birleştir */
export function mergeOrdersWithOps(base: LastmileOrder[]): LastmileOrder[] {
  ensureSeed()
  const overlay = getOverlay()
  const extras = getExtraOrders()
  const byId = new Map<string, LastmileOrder>()

  for (const order of [...extras, ...base]) {
    const status = overlay.statusByOrderId[order.id] as OrderStatus | undefined
    const meta = overlay.metaByOrderId[order.id]
    byId.set(order.id, {
      ...order,
      ...(status ? { durum: status, durum_etiketi: statusLabel(status) } : {}),
      ...(meta?.rota_atandi != null ? { rota_atandi: meta.rota_atandi } : {}),
      ...(meta?.atanan_kurye !== undefined ? { atanan_kurye: meta.atanan_kurye } : {}),
      ...(meta?.atanan_arac !== undefined ? { atanan_arac: meta.atanan_arac } : {}),
      ...(meta?.eta ? { eta: meta.eta } : {}),
      ...(meta?.alim_zaman_penceresi
        ? { alim_zaman_penceresi: meta.alim_zaman_penceresi }
        : {}),
      ...(meta?.teslim_zaman_penceresi
        ? { teslim_zaman_penceresi: meta.teslim_zaman_penceresi }
        : {}),
    })
  }

  return Array.from(byId.values())
}

function statusLabel(status: OrderStatus): string {
  switch (status) {
    case 'atama_bekliyor':
      return 'Atama Bekliyor'
    case 'planlandi':
      return 'Planlandı'
    case 'yolda':
      return 'Yolda'
    case 'teslim_edildi':
      return 'Teslim Edildi'
    case 'iptal_edildi':
      return 'İptal Edildi'
  }
}
