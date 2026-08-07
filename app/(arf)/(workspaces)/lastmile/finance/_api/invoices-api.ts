'use client'

import { fetchOrdersPool } from '../../orders/_api/list-orders'
import { getOrderPricing } from './pricing-api'
import {
  createInvoiceLocal,
  getInvoiceLocal,
  getOrderInvoiceMap,
  listInvoicesLocal,
  type CreateInvoiceInput,
} from '../_mock/invoice-store'
import type { LastmileInvoice, UninvoicedOrderRow } from '../_types/invoice'

export async function listInvoices(): Promise<LastmileInvoice[]> {
  return listInvoicesLocal()
}

export async function getInvoice(id: string): Promise<LastmileInvoice | null> {
  return getInvoiceLocal(id)
}

export async function createInvoice(input: CreateInvoiceInput): Promise<LastmileInvoice> {
  return createInvoiceLocal(input)
}

function amountFromPricing(pricing: Awaited<ReturnType<typeof getOrderPricing>>): {
  amount: number
  hasPricing: boolean
} {
  if (!pricing) return { amount: 0, hasPricing: false }
  const due = pricing.payment?.amountDue
  if (typeof due === 'number' && Number.isFinite(due)) {
    return { amount: due, hasPricing: true }
  }
  const total = pricing.snapshot?.breakdown?.total
  if (typeof total === 'number' && Number.isFinite(total)) {
    return { amount: total, hasPricing: true }
  }
  return { amount: 0, hasPricing: Boolean(pricing.snapshot || pricing.payment) }
}

export async function listUninvoicedOrders(input?: {
  customerId?: string
  search?: string
}): Promise<UninvoicedOrderRow[]> {
  const pool = await fetchOrdersPool({
    orderOwner: input?.customerId,
  })
  if (!pool.success) return []

  const map = getOrderInvoiceMap()
  const search = input?.search?.trim().toLowerCase()

  const candidates = pool.data.orders.filter((order) => {
    if (order.durum === 'iptal_edildi') return false
    if (map[order.id]) return false
    if (input?.customerId && order.musteri_id && order.musteri_id !== input.customerId) {
      return false
    }
    if (search) {
      const hay = `${order.takip_no} ${order.referans_no} ${order.musteri}`.toLowerCase()
      if (!hay.includes(search)) return false
    }
    return true
  })

  const rows: UninvoicedOrderRow[] = []
  for (const order of candidates) {
    const pricing = await getOrderPricing(order.id)
    const { amount, hasPricing } = amountFromPricing(pricing)
    rows.push({
      orderId: order.id,
      takipNo: order.takip_no,
      referansNo: order.referans_no,
      customerId: order.musteri_id ?? input?.customerId ?? '',
      customerName: order.musteri,
      createdAt: order.olusturulma_zamani,
      amount,
      hasPricing,
      durum: order.durum_etiketi ?? order.durum,
    })
  }

  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
