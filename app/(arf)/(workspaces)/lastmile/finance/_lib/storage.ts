/**
 * localStorage persistence helpers for Last Mile pricing/finance mock data.
 * Keys: arf:lastmile:pricing:v4:*
 */

const PREFIX = 'arf:lastmile:pricing:v4:'

export const STORAGE_KEYS = {
  priceLists: `${PREFIX}price-lists`,
  zones: `${PREFIX}zones`,
  assignments: `${PREFIX}assignments`,
  paymentTerms: `${PREFIX}payment-terms`,
  collections: `${PREFIX}collections`,
  orderPayments: `${PREFIX}order-payments`,
  orderSnapshots: `${PREFIX}order-snapshots`,
  seeded: `${PREFIX}seeded`,
} as const

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent('arf-lastmile-pricing-updated', { detail: { key } }))
}

export function isSeeded() {
  return readJson(STORAGE_KEYS.seeded, false)
}

export function markSeeded() {
  writeJson(STORAGE_KEYS.seeded, true)
}
