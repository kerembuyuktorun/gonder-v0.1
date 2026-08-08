/**
 * Pure invoice math (shared by UI forms + BFF).
 */
import type { InvoiceLine } from '../_types/invoice'

export function computeInvoiceTotals(lines: Pick<InvoiceLine, 'quantity' | 'unitPrice' | 'taxRate'>[]) {
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
  const kdv = lines.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice * (line.taxRate / 100),
    0
  )
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    kdv: Math.round(kdv * 100) / 100,
    total: Math.round((subtotal + kdv) * 100) / 100,
  }
}
