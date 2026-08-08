import type { InvoiceLine, LastmileInvoice } from '../../../../(arf)/(workspaces)/lastmile/finance/_types/invoice'
import { readTenantJson, writeTenantJson } from './fs-json-store'

const INVOICES_FILE = 'invoices.json'
const ORDER_MAP_FILE = 'order-invoice-map.json'
const SEEDED_FILE = 'invoices-seeded.json'

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function nextInvoiceNumber(existing: LastmileInvoice[]): string {
  const year = new Date().getFullYear()
  const seq = existing.length + 1
  return `LM-${year}-${String(seq).padStart(4, '0')}`
}

export function computeInvoiceTotals(lines: InvoiceLine[]) {
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

async function ensureSeed(tenantId: string) {
  if (await readTenantJson(tenantId, SEEDED_FILE, false)) return
  const now = new Date()
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
    issueDate: now.toISOString().slice(0, 10),
    dueDate: new Date(now.getTime() + 14 * 86400000).toISOString().slice(0, 10),
    lines,
    ...totals,
    orderIds: [],
    source: 'manual',
    notes: 'Örnek fatura',
    createdAt: now.toISOString(),
  }
  await writeTenantJson(tenantId, INVOICES_FILE, [seed])
  await writeTenantJson(tenantId, ORDER_MAP_FILE, {} as Record<string, string>)
  await writeTenantJson(tenantId, SEEDED_FILE, true)
}

export async function listInvoices(tenantId: string) {
  await ensureSeed(tenantId)
  const rows = await readTenantJson<LastmileInvoice[]>(tenantId, INVOICES_FILE, [])
  return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getInvoice(tenantId: string, id: string) {
  return (await listInvoices(tenantId)).find((inv) => inv.id === id) ?? null
}

export async function getOrderInvoiceMap(tenantId: string) {
  await ensureSeed(tenantId)
  return readTenantJson<Record<string, string>>(tenantId, ORDER_MAP_FILE, {})
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

export async function createInvoice(tenantId: string, input: CreateInvoiceInput) {
  await ensureSeed(tenantId)
  const existing = await listInvoices(tenantId)
  const map = await getOrderInvoiceMap(tenantId)
  const orderIds = input.orderIds ?? []

  for (const orderId of orderIds) {
    if (map[orderId]) {
      throw new Error(`ORDER_ALREADY_INVOICED:${orderId}`)
    }
  }

  const lines: InvoiceLine[] = input.lines.map((line) => ({ ...line, id: uid('line') }))
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
    orderIds,
    source: input.source,
    notes: input.notes ?? null,
    createdAt: new Date().toISOString(),
  }

  await writeTenantJson(tenantId, INVOICES_FILE, [invoice, ...existing])

  if (orderIds.length > 0) {
    const nextMap = { ...map }
    for (const orderId of orderIds) nextMap[orderId] = invoice.id
    await writeTenantJson(tenantId, ORDER_MAP_FILE, nextMap)
  }

  return invoice
}

export async function patchInvoiceStatus(
  tenantId: string,
  id: string,
  status: LastmileInvoice['status']
) {
  const rows = await listInvoices(tenantId)
  const idx = rows.findIndex((r) => r.id === id)
  if (idx < 0) return null
  const updated = { ...rows[idx], status }
  const next = [...rows]
  next[idx] = updated
  await writeTenantJson(tenantId, INVOICES_FILE, next)

  // iptal → release order links
  if (status === 'iptal') {
    const map = await getOrderInvoiceMap(tenantId)
    let changed = false
    for (const orderId of updated.orderIds) {
      if (map[orderId] === id) {
        delete map[orderId]
        changed = true
      }
    }
    if (changed) await writeTenantJson(tenantId, ORDER_MAP_FILE, map)
  }

  return updated
}
