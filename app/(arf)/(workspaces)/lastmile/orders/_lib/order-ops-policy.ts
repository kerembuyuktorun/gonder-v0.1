import type { OrderStatus } from '../_types/order'

const SELF_CANCEL_WINDOW_HOURS = 24

export function canInstantCancel(status: OrderStatus, routeAssigned = false): boolean {
  return status === 'atama_bekliyor' && !routeAssigned
}

export function canRequestCancel(status: OrderStatus): boolean {
  return status === 'planlandi' || status === 'yolda'
}

/** Oluşturma zamanı string (örn. 22.07.2026 10:15) veya ISO. */
export function canSelfCancel(
  createdAt: string | null | undefined,
  windowHours = SELF_CANCEL_WINDOW_HOURS
): boolean {
  if (!createdAt) return false
  const created = parseLooseDate(createdAt)
  if (!created) return false
  const elapsedMs = Date.now() - created.getTime()
  return elapsedMs >= 0 && elapsedMs <= windowHours * 60 * 60 * 1000
}

export function canCreateReturn(status: OrderStatus, siparisTipi?: string): boolean {
  if (siparisTipi === 'iade') return false
  return status === 'teslim_edildi'
}

export function canDefer(status: OrderStatus): boolean {
  return status === 'yolda' || status === 'planlandi'
}

export function tomorrowIsoDate(from = new Date()): string {
  const d = new Date(from)
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export function formatTrDateLabel(isoDate: string): string {
  const [y, m, day] = isoDate.split('-')
  if (!y || !m || !day) return isoDate
  return `${day}.${m}.${y}`
}

function parseLooseDate(value: string): Date | null {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }
  // 22.07.2026 10:15
  const m = value.match(
    /^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?/
  )
  if (!m) return null
  const [, dd, mm, yyyy, hh = '0', min = '0'] = m
  const d = new Date(
    Number(yyyy),
    Number(mm) - 1,
    Number(dd),
    Number(hh),
    Number(min)
  )
  return Number.isNaN(d.getTime()) ? null : d
}
