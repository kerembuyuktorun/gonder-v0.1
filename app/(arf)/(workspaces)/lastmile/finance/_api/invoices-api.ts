'use client'

import { getOrderPricing } from './pricing-api'
import type { LastmileInvoice, UninvoicedOrderRow } from '../_types/invoice'

export type CreateInvoiceInput = {
  customerId: string
  customerName: string
  status?: LastmileInvoice['status']
  issueDate: string
  dueDate: string
  lines: Array<{
    description: string
    quantity: number
    unitPrice: number
    taxRate: number
    orderId?: string
    [key: string]: unknown
  }>
  orderIds?: string[]
  source: LastmileInvoice['source']
  notes?: string | null
}

async function financeFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
    credentials: 'same-origin',
  })
  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean
    data?: T
    error?: string
  }
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Invoice API error (${res.status})`)
  }
  return json.data as T
}

export async function listInvoices(): Promise<LastmileInvoice[]> {
  const data = await financeFetch<{ items: LastmileInvoice[] }>('/api/lastmile/invoices')
  return data.items
}

export async function getInvoice(id: string): Promise<LastmileInvoice | null> {
  try {
    return await financeFetch(`/api/lastmile/invoices/${encodeURIComponent(id)}`)
  } catch {
    return null
  }
}

export async function createInvoice(input: CreateInvoiceInput): Promise<LastmileInvoice> {
  return financeFetch('/api/lastmile/invoices', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function patchInvoiceStatus(
  id: string,
  status: LastmileInvoice['status']
): Promise<LastmileInvoice | null> {
  try {
    return await financeFetch(`/api/lastmile/invoices/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  } catch {
    return null
  }
}

export async function listUninvoicedOrders(input?: {
  customerId?: string
  search?: string
}): Promise<UninvoicedOrderRow[]> {
  const params = new URLSearchParams()
  if (input?.customerId) params.set('customerId', input.customerId)
  if (input?.search) params.set('search', input.search)
  const q = params.toString()
  const data = await financeFetch<{ items: UninvoicedOrderRow[] }>(
    `/api/lastmile/uninvoiced-orders${q ? `?${q}` : ''}`
  )
  return data.items
}

/** Kept for screens that still compute amount client-side */
export async function amountFromOrderPricing(orderId: string) {
  const pricing = await getOrderPricing(orderId)
  if (!pricing) return { amount: 0, hasPricing: false }
  if (typeof pricing.payment?.amountDue === 'number') {
    return { amount: pricing.payment.amountDue, hasPricing: true }
  }
  if (typeof pricing.snapshot?.breakdown?.total === 'number') {
    return { amount: pricing.snapshot.breakdown.total, hasPricing: true }
  }
  return { amount: 0, hasPricing: Boolean(pricing.snapshot || pricing.payment) }
}
