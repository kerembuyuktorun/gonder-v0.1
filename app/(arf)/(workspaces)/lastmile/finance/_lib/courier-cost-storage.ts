/**
 * localStorage persistence for Last Mile courier cost / payout mock data.
 * Keys: arf:lastmile:courier-cost:v1:*
 * Isolated from customer pricing (arf:lastmile:pricing:v1:*).
 */

const PREFIX = 'arf:lastmile:courier-cost:v1:'

export const COURIER_COST_STORAGE_KEYS = {
  costLists: `${PREFIX}cost-lists`,
  assignments: `${PREFIX}assignments`,
  employmentDefaults: `${PREFIX}employment-defaults`,
  payoutTerms: `${PREFIX}payout-terms`,
  earnings: `${PREFIX}earnings`,
  ledgers: `${PREFIX}ledgers`,
  payouts: `${PREFIX}payouts`,
  seeded: `${PREFIX}seeded`,
} as const

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function readCourierCostJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeCourierCostJson<T>(key: string, value: T) {
  if (!canUseStorage()) return
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(
    new CustomEvent('arf-lastmile-courier-cost-updated', { detail: { key } })
  )
}

export function isCourierCostSeeded() {
  return readCourierCostJson(COURIER_COST_STORAGE_KEYS.seeded, false)
}

export function markCourierCostSeeded() {
  writeCourierCostJson(COURIER_COST_STORAGE_KEYS.seeded, true)
}
