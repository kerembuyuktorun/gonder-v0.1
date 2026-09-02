import { ARF_ROUTES } from '../../../_shared/routes'
import type { FinanceEntityRef } from '../_types/finance'

export function financeEntityHref(ref: FinanceEntityRef | null | undefined): string | null {
  if (!ref) return null
  switch (ref.type) {
    case 'order':
      return ARF_ROUTES.gonder.orders.detail(ref.id)
    case 'shipment':
      return ARF_ROUTES.gonder.shipments.detail(ref.id)
    case 'quote':
      return ARF_ROUTES.gonder.quotes.detail(ref.id)
    case 'invoice':
      return ARF_ROUTES.gonder.finance.invoices.detail(ref.id)
    case 'wallet':
      return ARF_ROUTES.gonder.finance.wallet.root
    default:
      return null
  }
}

export function financeTransactionHref(id: string): string {
  return ARF_ROUTES.gonder.finance.transactions.detail(id)
}

export function financeUpcomingHref(id: string): string {
  return ARF_ROUTES.gonder.finance.upcoming.detail(id)
}

export function financeInvoiceHref(id: string): string {
  return ARF_ROUTES.gonder.finance.invoices.detail(id)
}
