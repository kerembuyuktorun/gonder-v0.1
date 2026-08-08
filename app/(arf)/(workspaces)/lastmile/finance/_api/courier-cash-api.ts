/**
 * Courier cash (COD / elde nakit) API façade — BFF `/api/lastmile/*`.
 */
import type {
  CourierCashBalance,
  CourierCashBalancesKpi,
  CourierCashMovement,
  CourierCashSource,
} from '../_types/courier-cash'

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

export type RecordRemittanceInput = {
  courierId: string
  courierName?: string
  amount: number
  occurredAt: string
  note?: string | null
}

export type RecordCollectionInput = {
  courierId: string
  courierName?: string
  amount: number
  occurredAt: string
  source: CourierCashSource
  orderId?: string | null
  takipNo?: string | null
  note?: string | null
}

export async function listCourierCashBalances(): Promise<CourierCashBalance[]> {
  const data = await financeFetch<{ items: CourierCashBalance[] }>(
    '/api/lastmile/courier-cash-balances'
  )
  return data.items
}

export async function getCourierCashBalance(
  courierId: string
): Promise<CourierCashBalance | null> {
  try {
    return await financeFetch<CourierCashBalance>(
      `/api/lastmile/courier-cash-balances/${encodeURIComponent(courierId)}`
    )
  } catch {
    return null
  }
}

export async function listCourierCashMovements(
  courierId: string
): Promise<CourierCashMovement[]> {
  const data = await financeFetch<{ items: CourierCashMovement[] }>(
    `/api/lastmile/courier-cash-balances/${encodeURIComponent(courierId)}/movements`
  )
  return data.items
}

export async function getCourierCashBalancesKpi(): Promise<CourierCashBalancesKpi> {
  return financeFetch('/api/lastmile/courier-cash-balances/kpi')
}

export async function recordRemittance(
  input: RecordRemittanceInput
): Promise<CourierCashMovement> {
  return financeFetch(
    `/api/lastmile/courier-cash-balances/${encodeURIComponent(input.courierId)}/remittances`,
    {
      method: 'POST',
      body: JSON.stringify({
        courierName: input.courierName,
        amount: input.amount,
        occurredAt: input.occurredAt,
        note: input.note,
      }),
    }
  )
}

export async function recordCollection(
  input: RecordCollectionInput
): Promise<CourierCashMovement> {
  return financeFetch(
    `/api/lastmile/courier-cash-balances/${encodeURIComponent(input.courierId)}/collections`,
    {
      method: 'POST',
      body: JSON.stringify({
        courierName: input.courierName,
        amount: input.amount,
        occurredAt: input.occurredAt,
        source: input.source,
        orderId: input.orderId,
        takipNo: input.takipNo,
        note: input.note,
      }),
    }
  )
}
