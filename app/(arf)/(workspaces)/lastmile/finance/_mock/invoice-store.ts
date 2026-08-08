'use client'

import { computeInvoiceTotals } from '../_lib/invoice-math'
import { readJson, writeJson } from '../_lib/storage'
import type { InvoiceLine, LastmileInvoice } from '../_types/invoice'

const INVOICES_KEY = 'arf:lastmile:finance:v1:invoices'
const ORDER_INVOICE_MAP_KEY = 'arf:lastmile:finance:v1:order-invoice-map'
const SEEDED_KEY = 'arf:lastmile:finance:v1:invoices-seeded'

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function nextInvoiceNumber(existing: LastmileInvoice[]): string {
  const year = new Date().getFullYear()
  const seq = existing.length + 1
  return `LM-${year}-${String(seq).padStart(4, '0')}`
}

export { computeInvoiceTotals } from '../_lib/invoice-math'

function ensureSeeded() {
  if (typeof window === 'undefined') return
  if (readJson(SEEDED_KEY, false)) return

  const now = new Date()
  const issue = now.toISOString().slice(0, 10)
  const due = new Date(now.getTime() + 14 * 86400000).toISOString().slice(0, 10)
  const lines: InvoiceLine[] = [
    {
      id: uid('line'),
      description: 'Last mile teslimat hizmeti',
      quantity: 1,
      unitPrice: 250,
      taxRate: 20,
    },
  ]
  const totals = computeInvoiceTotals(lines)
  const seed: LastmileInvoice = {
    id: uid('inv'),
    number: `LM-${now.getFullYear()}-0001`,
    customerId: 'seed-customer',
    customerName: 'Örnek Müşteri A.Ş.',
    status: 'kesildi',
    issueDate: issue,
    dueDate: due,
    lines,
    ...totals,
    orderIds: [],
    source: 'manual',
    notes: 'Örnek fatura',
    createdAt: now.toISOString(),
  }

  writeJson(INVOICES_KEY, [seed])
  writeJson(ORDER_INVOICE_MAP_KEY, {} as Record<string, string>)
  writeJson(SEEDED_KEY, true)
}

export function listInvoicesLocal(): LastmileInvoice[] {
  ensureSeeded()
  return readJson<LastmileInvoice[]>(INVOICES_KEY, []).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
}

export function getInvoiceLocal(id: string): LastmileInvoice | null {
  return listInvoicesLocal().find((inv) => inv.id === id) ?? null
}

export function getOrderInvoiceMap(): Record<string, string> {
  ensureSeeded()
  return readJson<Record<string, string>>(ORDER_INVOICE_MAP_KEY, {})
}

export function isOrderInvoiced(orderId: string): boolean {
  const map = getOrderInvoiceMap()
  return Boolean(map[orderId])
}

export type CreateInvoiceInput = {
  customerId: string
  customerName: string
  status?: LastmileInvoice['status']
  issueDate: string
  dueDate: string
  lines: Omit<InvoiceLine, 'id'>[]
  orderIds?: string[]
  source: LastmileInvoice['source']
  notes?: string | null
}

export function createInvoiceLocal(input: CreateInvoiceInput): LastmileInvoice {
  ensureSeeded()
  const existing = listInvoicesLocal()
  const lines: InvoiceLine[] = input.lines.map((line) => ({
    ...line,
    id: uid('line'),
  }))
  const totals = computeInvoiceTotals(lines)
  const invoice: LastmileInvoice = {
    id: uid('inv'),
    number: nextInvoiceNumber(existing),
    customerId: input.customerId,
    customerName: input.customerName,
    status: input.status ?? 'kesildi',
    issueDate: input.issueDate,
    dueDate: input.dueDate,
    lines,
    ...totals,
    orderIds: input.orderIds ?? [],
    source: input.source,
    notes: input.notes ?? null,
    createdAt: new Date().toISOString(),
  }

  writeJson(INVOICES_KEY, [invoice, ...existing])

  if (invoice.orderIds.length > 0) {
    markOrdersInvoicedLocal(invoice.orderIds, invoice.id)
  }

  return invoice
}

export function markOrdersInvoicedLocal(orderIds: string[], invoiceId: string) {
  const map = getOrderInvoiceMap()
  for (const orderId of orderIds) {
    map[orderId] = invoiceId
  }
  writeJson(ORDER_INVOICE_MAP_KEY, map)
}
