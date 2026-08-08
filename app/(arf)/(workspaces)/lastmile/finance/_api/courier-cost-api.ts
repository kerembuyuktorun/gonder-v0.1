/**
 * Last Mile courier cost / payout API façade — BFF `/api/lastmile/*`.
 */
import type {
  CourierCostAssignment,
  CourierCostList,
  CourierCostQuoteInput,
  CourierCostQuoteResult,
  CourierCostRule,
  CourierEarningsSnapshot,
  CourierPayoutLedger,
  CourierPayoutSummary,
  CourierPayoutTerms,
  CourierPayoutsKpi,
  EmploymentTypeCostDefault,
  PayoutCycle,
  PayoutEntry,
  PayoutMethod,
  PayoutStatus,
  PriceListStatus,
} from '../_types'
import { addDaysIso } from '../_lib/format'

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

export type UpsertCourierCostListInput = {
  code?: string
  name: string
  description?: string
  isDefault?: boolean
  status?: PriceListStatus
  distanceStructure: CourierCostList['distanceStructure']
  compensationModel?: CourierCostList['compensationModel']
  fixedSalaryMonthly?: number
  validFrom?: string
  validTo?: string
  rules?: CourierCostRule[]
}

export async function listCourierCostLists(): Promise<CourierCostList[]> {
  const data = await financeFetch<{ items: CourierCostList[] }>('/api/lastmile/courier-cost-lists')
  return data.items
}

export async function getCourierCostList(id: string): Promise<CourierCostList | undefined> {
  try {
    return await financeFetch<CourierCostList>(
      `/api/lastmile/courier-cost-lists/${encodeURIComponent(id)}`
    )
  } catch {
    return undefined
  }
}

export async function createCourierCostList(
  input: UpsertCourierCostListInput
): Promise<CourierCostList> {
  return financeFetch('/api/lastmile/courier-cost-lists', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateCourierCostList(
  id: string,
  input: UpsertCourierCostListInput
): Promise<CourierCostList | undefined> {
  try {
    return await financeFetch(`/api/lastmile/courier-cost-lists/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  } catch {
    return undefined
  }
}

export async function cloneCourierCostList(id: string): Promise<CourierCostList | undefined> {
  try {
    return await financeFetch(
      `/api/lastmile/courier-cost-lists/${encodeURIComponent(id)}/clone`,
      { method: 'POST' }
    )
  } catch {
    return undefined
  }
}

export async function setDefaultCourierCostList(
  id: string
): Promise<CourierCostList | undefined> {
  try {
    return await financeFetch(
      `/api/lastmile/courier-cost-lists/${encodeURIComponent(id)}/set-default`,
      { method: 'POST' }
    )
  } catch {
    return undefined
  }
}

export async function setCourierCostListStatus(
  id: string,
  status: PriceListStatus
): Promise<CourierCostList | undefined> {
  try {
    return await financeFetch(
      `/api/lastmile/courier-cost-lists/${encodeURIComponent(id)}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) }
    )
  } catch {
    return undefined
  }
}

export async function getCourierCostAssignment(
  courierId: string
): Promise<CourierCostAssignment | undefined> {
  try {
    const row = await financeFetch<CourierCostAssignment | null>(
      `/api/lastmile/couriers/${encodeURIComponent(courierId)}/cost-assignment`
    )
    return row ?? undefined
  } catch {
    return undefined
  }
}

export async function setCourierCostAssignment(
  courierId: string,
  costListId: string | null
): Promise<CourierCostAssignment | undefined> {
  const row = await financeFetch<CourierCostAssignment | null>(
    `/api/lastmile/couriers/${encodeURIComponent(courierId)}/cost-assignment`,
    { method: 'PUT', body: JSON.stringify({ costListId }) }
  )
  return row ?? undefined
}

export async function listCourierCostAssignments(): Promise<CourierCostAssignment[]> {
  const data = await financeFetch<{ items: CourierCostAssignment[] }>(
    '/api/lastmile/couriers/cost-assignments'
  )
  return data.items
}

export async function listEmploymentTypeCostDefaults(): Promise<EmploymentTypeCostDefault[]> {
  const data = await financeFetch<{ items: EmploymentTypeCostDefault[] }>(
    '/api/lastmile/couriers/employment-cost-defaults'
  )
  return data.items
}

export async function getCourierPayoutTerms(
  courierId: string
): Promise<CourierPayoutTerms | undefined> {
  try {
    const row = await financeFetch<CourierPayoutTerms | null>(
      `/api/lastmile/couriers/${encodeURIComponent(courierId)}/payout-terms`
    )
    return row ?? undefined
  } catch {
    return undefined
  }
}

export async function setCourierPayoutTerms(
  courierId: string,
  input: {
    payoutCycle: PayoutCycle
    weeklyPayoutDay?: number
    monthlyPayoutDay?: number
    creditDays?: number
    notes?: string
  }
): Promise<CourierPayoutTerms> {
  return financeFetch(`/api/lastmile/couriers/${encodeURIComponent(courierId)}/payout-terms`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function getCourierPayoutSummary(courierId: string): Promise<CourierPayoutSummary> {
  return financeFetch(`/api/lastmile/couriers/${encodeURIComponent(courierId)}/payout-summary`)
}

export async function quoteCourierCostApi(
  input: CourierCostQuoteInput
): Promise<CourierCostQuoteResult> {
  return financeFetch('/api/lastmile/courier-costing/quote', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function listCourierPayouts(filters?: {
  courierId?: string
  status?: PayoutStatus
}): Promise<{
  entries: PayoutEntry[]
  ledgers: CourierPayoutLedger[]
  kpi: CourierPayoutsKpi
}> {
  const params = new URLSearchParams()
  if (filters?.courierId) params.set('courierId', filters.courierId)
  if (filters?.status) params.set('status', filters.status)
  const q = params.toString()
  return financeFetch(`/api/lastmile/courier-payouts${q ? `?${q}` : ''}`)
}

export async function createCourierPayout(input: {
  courierId: string
  courierName?: string
  ledgerId?: string
  amount: number
  method: PayoutMethod
  paidAt: string
  note?: string
}): Promise<PayoutEntry> {
  return financeFetch('/api/lastmile/courier-payouts', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function listCourierEarnings(
  courierId?: string
): Promise<CourierEarningsSnapshot[]> {
  const params = new URLSearchParams()
  if (courierId) params.set('courierId', courierId)
  const q = params.toString()
  const data = await financeFetch<{ items: CourierEarningsSnapshot[] }>(
    `/api/lastmile/courier-earnings${q ? `?${q}` : ''}`
  )
  return data.items
}

export function getCourierCostListsKpiSync() {
  return {
    activeCount: 0,
    salaryCount: 0,
    tariffCount: 0,
    assignedCourierCount: 0,
  }
}

export function buildDueDateFromTerms(
  earnedAt: string,
  terms?: CourierPayoutTerms
): string | undefined {
  if (!terms) return earnedAt
  const credit = terms.creditDays ?? 0
  if (terms.payoutCycle === 'per_delivery') {
    return addDaysIso(earnedAt, credit)
  }
  return addDaysIso(earnedAt, credit)
}
