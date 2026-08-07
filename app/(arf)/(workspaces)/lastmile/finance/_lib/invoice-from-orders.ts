import type { InvoiceLine } from '../_types/invoice'
import type { UninvoicedOrderRow } from '../_types/invoice'

export function ordersToInvoiceLines(orders: UninvoicedOrderRow[]): Omit<InvoiceLine, 'id'>[] {
  return orders.map((order) => ({
    description: `Sipariş ${order.takipNo}${order.referansNo ? ` (${order.referansNo})` : ''}`,
    quantity: 1,
    unitPrice: order.amount,
    taxRate: 20,
    orderId: order.orderId,
  }))
}

export function formatTry(amount: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(amount)
}
