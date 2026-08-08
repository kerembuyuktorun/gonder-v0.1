import type {
  CollectionStatus,
  OrderPayment,
  OrderPricingSnapshot,
} from '../../../../(arf)/(workspaces)/lastmile/finance/_types'
import { readTenantJson, writeTenantJson } from './fs-json-store'

const SNAPSHOTS_FILE = 'order-snapshots.json'
const PAYMENTS_FILE = 'order-payments.json'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function nowIso() {
  return new Date().toISOString()
}

export function deriveCollectionStatus(payment: OrderPayment): CollectionStatus {
  if (payment.amountPaid >= payment.amountDue && payment.amountDue > 0) return 'tahsil_edildi'
  if (payment.amountPaid > 0 && payment.amountPaid < payment.amountDue) return 'kismi'
  if (payment.dueDate && payment.dueDate < todayIso() && payment.amountPaid < payment.amountDue) {
    return 'gecikti'
  }
  return 'bekliyor'
}

async function loadSnapshots(tenantId: string) {
  return readTenantJson<Record<string, OrderPricingSnapshot>>(tenantId, SNAPSHOTS_FILE, {})
}

async function loadPayments(tenantId: string) {
  return readTenantJson<OrderPayment[]>(tenantId, PAYMENTS_FILE, [])
}

export async function getOrderPricing(
  tenantId: string,
  orderId: string
): Promise<{ snapshot?: OrderPricingSnapshot; payment?: OrderPayment } | null> {
  const snapshot = (await loadSnapshots(tenantId))[orderId]
  const payment = (await loadPayments(tenantId)).find((p) => p.orderId === orderId)
  if (!snapshot && !payment) return null
  return {
    snapshot,
    payment: payment
      ? { ...payment, collectionStatus: deriveCollectionStatus(payment) }
      : undefined,
  }
}

export type SaveOrderPricingInput = {
  snapshot: OrderPricingSnapshot
  payment: Omit<OrderPayment, 'orderId' | 'updatedAt' | 'collectionStatus'> & {
    collectionStatus?: CollectionStatus
  }
}

/**
 * Snapshot is frozen as provided (no recalculation).
 * amountDue is taken from payment payload (FE may override vs breakdown.total).
 */
export async function saveOrderPricing(
  tenantId: string,
  orderId: string,
  payload: SaveOrderPricingInput
): Promise<{ snapshot: OrderPricingSnapshot; payment: OrderPayment }> {
  const snapshots = await loadSnapshots(tenantId)
  snapshots[orderId] = payload.snapshot
  await writeTenantJson(tenantId, SNAPSHOTS_FILE, snapshots)

  const payment: OrderPayment = {
    ...payload.payment,
    orderId,
    updatedAt: nowIso(),
    collectionStatus: payload.payment.collectionStatus ?? 'bekliyor',
  }
  payment.collectionStatus = deriveCollectionStatus(payment)

  const payments = [payment, ...(await loadPayments(tenantId)).filter((p) => p.orderId !== orderId)]
  await writeTenantJson(tenantId, PAYMENTS_FILE, payments)

  return { snapshot: payload.snapshot, payment }
}
