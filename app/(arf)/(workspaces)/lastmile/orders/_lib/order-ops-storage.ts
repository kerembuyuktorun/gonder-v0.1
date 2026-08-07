/**
 * Last Mile order ops mock persistence.
 * Keys: arf:lastmile:order-ops:v1:*
 */

const PREFIX = 'arf:lastmile:order-ops:v1:'

export const ORDER_OPS_STORAGE_KEYS = {
  cancelRequests: `${PREFIX}cancel-requests`,
  returns: `${PREFIX}returns`,
  deferrals: `${PREFIX}deferrals`,
  overlay: `${PREFIX}overlay`,
  extraOrders: `${PREFIX}extra-orders`,
  seeded: `${PREFIX}seeded`,
} as const

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function readOrderOpsJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeOrderOpsJson<T>(key: string, value: T) {
  if (!canUseStorage()) return
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent('arf-lastmile-order-ops-updated', { detail: { key } }))
}

export function isOrderOpsSeeded() {
  return readOrderOpsJson(ORDER_OPS_STORAGE_KEYS.seeded, false)
}

export function markOrderOpsSeeded() {
  writeOrderOpsJson(ORDER_OPS_STORAGE_KEYS.seeded, true)
}
