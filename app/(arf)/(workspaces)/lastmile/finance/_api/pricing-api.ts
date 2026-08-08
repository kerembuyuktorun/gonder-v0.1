/**
 * Last Mile pricing/finance API façade — BFF `/api/lastmile/*` (tenant JSON store).
 * camelCase FE tipleri birebir.
 */
import type {
  CollectionEntry,
  CollectionStatus,
  CustomerFinanceSummary,
  CustomerPaymentTerms,
  CustomerPricingAssignment,
  DistanceStructure,
  OrderPayment,
  OrderPricingSnapshot,
  PriceList,
  PriceListStatus,
  PriceRule,
  PriceZone,
  QuoteInput,
  QuoteResult,
  SettlementType,
} from '../_types'
import { addDaysIso, todayIso } from '../_lib/format'

async function financeFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'same-origin',
  })
  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean
    data?: T
    error?: string
  }
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Finance API error (${res.status})`)
  }
  return json.data as T
}

export type UpsertPriceListInput = {
  name: string
  code?: string
  description?: string
  isDefault?: boolean
  status?: PriceListStatus
  distanceStructure: DistanceStructure
  returnFeePercent?: number
  returnFeeMin?: number
  validFrom?: string
  validTo?: string
  rules?: PriceRule[]
}

export type UpsertZoneInput = {
  name: string
  code?: string
  scopes: PriceZone['scopes']
}

export async function listPriceLists(): Promise<PriceList[]> {
  const data = await financeFetch<{ items: PriceList[] }>('/api/lastmile/price-lists')
  return data.items
}

export async function getPriceList(id: string): Promise<PriceList | undefined> {
  try {
    return await financeFetch<PriceList>(`/api/lastmile/price-lists/${encodeURIComponent(id)}`)
  } catch {
    return undefined
  }
}

export async function createPriceList(input: UpsertPriceListInput): Promise<PriceList> {
  return financeFetch('/api/lastmile/price-lists', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updatePriceList(
  id: string,
  input: UpsertPriceListInput
): Promise<PriceList | undefined> {
  try {
    return await financeFetch(`/api/lastmile/price-lists/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  } catch {
    return undefined
  }
}

export async function clonePriceList(id: string): Promise<PriceList | undefined> {
  try {
    return await financeFetch(`/api/lastmile/price-lists/${encodeURIComponent(id)}/clone`, {
      method: 'POST',
    })
  } catch {
    return undefined
  }
}

export async function setDefaultPriceList(id: string): Promise<PriceList | undefined> {
  try {
    return await financeFetch(`/api/lastmile/price-lists/${encodeURIComponent(id)}/set-default`, {
      method: 'POST',
    })
  } catch {
    return undefined
  }
}

export async function setPriceListStatus(
  id: string,
  status: PriceListStatus
): Promise<PriceList | undefined> {
  try {
    return await financeFetch(`/api/lastmile/price-lists/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  } catch {
    return undefined
  }
}

export async function listPriceZones(): Promise<PriceZone[]> {
  const data = await financeFetch<{ items: PriceZone[] }>('/api/lastmile/price-zones')
  return data.items
}

export async function getPriceZone(id: string): Promise<PriceZone | undefined> {
  try {
    return await financeFetch(`/api/lastmile/price-zones/${encodeURIComponent(id)}`)
  } catch {
    return undefined
  }
}

export async function createPriceZone(input: UpsertZoneInput): Promise<PriceZone> {
  return financeFetch('/api/lastmile/price-zones', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updatePriceZone(
  id: string,
  input: UpsertZoneInput
): Promise<PriceZone | undefined> {
  try {
    return await financeFetch(`/api/lastmile/price-zones/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  } catch {
    return undefined
  }
}

export async function deletePriceZone(id: string): Promise<boolean> {
  try {
    await financeFetch(`/api/lastmile/price-zones/${encodeURIComponent(id)}`, { method: 'DELETE' })
    return true
  } catch {
    return false
  }
}

export async function getCustomerPricingAssignment(
  customerId: string
): Promise<CustomerPricingAssignment | undefined> {
  try {
    return await financeFetch(
      `/api/lastmile/customers/${encodeURIComponent(customerId)}/pricing-assignment`
    )
  } catch {
    return undefined
  }
}

export async function setCustomerPricingAssignment(
  customerId: string,
  priceListId: string | null
): Promise<CustomerPricingAssignment | null> {
  return financeFetch(
    `/api/lastmile/customers/${encodeURIComponent(customerId)}/pricing-assignment`,
    { method: 'PUT', body: JSON.stringify({ priceListId }) }
  )
}

export async function listCustomerPricingAssignments(): Promise<CustomerPricingAssignment[]> {
  const data = await financeFetch<{ items: CustomerPricingAssignment[] }>(
    '/api/lastmile/customers/pricing-assignments'
  )
  return data.items
}

export async function getCustomerPaymentTerms(
  customerId: string
): Promise<CustomerPaymentTerms | undefined> {
  try {
    return await financeFetch(
      `/api/lastmile/customers/${encodeURIComponent(customerId)}/payment-terms`
    )
  } catch {
    return undefined
  }
}

export async function setCustomerPaymentTerms(
  customerId: string,
  input: Omit<CustomerPaymentTerms, 'customerId' | 'updatedAt'>
): Promise<CustomerPaymentTerms> {
  return financeFetch(`/api/lastmile/customers/${encodeURIComponent(customerId)}/payment-terms`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function getCustomerFinanceSummary(
  customerId: string
): Promise<CustomerFinanceSummary> {
  return financeFetch(`/api/lastmile/customers/${encodeURIComponent(customerId)}/finance-summary`)
}

export async function quotePriceApi(input: QuoteInput): Promise<QuoteResult> {
  return financeFetch('/api/lastmile/pricing/quote', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function getOrderPricing(orderId: string): Promise<{
  snapshot?: OrderPricingSnapshot
  payment?: OrderPayment
} | undefined> {
  const data = await financeFetch<{
    snapshot?: OrderPricingSnapshot
    payment?: OrderPayment
  }>(`/api/lastmile/orders/${encodeURIComponent(orderId)}/pricing`)
  if (!data?.snapshot && !data?.payment) return undefined
  return data
}

export async function saveOrderPricing(
  orderId: string,
  payload: {
    snapshot: OrderPricingSnapshot
    payment: Omit<OrderPayment, 'orderId' | 'updatedAt' | 'collectionStatus'> & {
      collectionStatus?: CollectionStatus
    }
  }
): Promise<{ snapshot: OrderPricingSnapshot; payment: OrderPayment }> {
  return financeFetch(`/api/lastmile/orders/${encodeURIComponent(orderId)}/pricing`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function buildOrderPaymentFromQuote(params: {
  orderId: string
  customerId: string
  customerName?: string
  settlementType: SettlementType
  creditDays: number
  orderDate: string
  amountDue: number
}): OrderPayment {
  const dueDate =
    params.settlementType === 'vadeli'
      ? addDaysIso(params.orderDate, params.creditDays)
      : params.orderDate
  const payment: OrderPayment = {
    orderId: params.orderId,
    customerId: params.customerId,
    customerName: params.customerName,
    settlementType: params.settlementType,
    creditDays: params.creditDays,
    dueDate,
    collectionStatus: 'bekliyor',
    amountDue: params.amountDue,
    amountPaid: 0,
    orderDate: params.orderDate,
    updatedAt: new Date().toISOString(),
  }
  // Client-side derive for immediate UI; server re-derives on save
  if (payment.amountPaid >= payment.amountDue && payment.amountDue > 0) {
    payment.collectionStatus = 'tahsil_edildi'
  } else if (payment.dueDate && payment.dueDate < todayIso() && payment.amountPaid < payment.amountDue) {
    payment.collectionStatus = 'gecikti'
  }
  return payment
}

export async function listCollections(filters?: {
  customerId?: string
  status?: CollectionStatus
}): Promise<{ entries: CollectionEntry[]; payments: OrderPayment[] }> {
  const params = new URLSearchParams()
  if (filters?.customerId) params.set('customerId', filters.customerId)
  if (filters?.status) params.set('status', filters.status)
  const q = params.toString()
  return financeFetch(`/api/lastmile/collections${q ? `?${q}` : ''}`)
}

export async function createCollection(input: {
  customerId: string
  customerName?: string
  orderId?: string
  amount: number
  method: CollectionEntry['method']
  paidAt: string
  note?: string
}): Promise<CollectionEntry> {
  return financeFetch('/api/lastmile/collections', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function getPriceListsKpiSync() {
  // sync KPI used in some pages — best-effort empty until hydrated
  return {
    activeCount: 0,
    defaultName: '—',
    ruleCount: 0,
    assignedCustomerCount: 0,
  }
}
