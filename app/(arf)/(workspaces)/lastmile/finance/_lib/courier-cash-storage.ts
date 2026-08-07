/**
 * localStorage persistence for courier cash (COD) balances.
 * Keys: arf:lastmile:courier-cash:v1:*
 */

const PREFIX = 'arf:lastmile:courier-cash:v1:'

export const COURIER_CASH_STORAGE_KEYS = {
  movements: `${PREFIX}movements`,
  seeded: `${PREFIX}seeded`,
} as const

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function readCourierCashJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeCourierCashJson<T>(key: string, value: T) {
  if (!canUseStorage()) return
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(
    new CustomEvent('arf-lastmile-courier-cash-updated', { detail: { key } }),
  )
}
