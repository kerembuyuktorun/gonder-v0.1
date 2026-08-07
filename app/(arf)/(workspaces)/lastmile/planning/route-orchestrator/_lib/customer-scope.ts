/**
 * Tenant-wide apply no longer requires customerId.
 * Kept only as an optional filter helper for optimize-jobs narrowing.
 */
import type { OrchestratorOrder } from '../_types/orchestrator'

/** Unique customer ids from orders (for optional optimize filter). */
export function collectCustomerIdsFromOrders(
  orderIds: Iterable<string>,
  orders: OrchestratorOrder[]
): string[] {
  const byId = new Map(orders.map((order) => [order.id, order]))
  const customerIds = new Set<string>()
  for (const orderId of orderIds) {
    const customerId = byId.get(orderId)?.musteri_id?.trim()
    if (customerId) customerIds.add(customerId)
  }
  return [...customerIds]
}

/**
 * Optional single-customer filter for optimize create.
 * Mixed customers → omit customerId (tenant-wide).
 */
export function optionalOptimizeCustomerId(
  orderIds: Iterable<string>,
  orders: OrchestratorOrder[]
): string | undefined {
  const ids = collectCustomerIdsFromOrders(orderIds, orders)
  return ids.length === 1 ? ids[0] : undefined
}
