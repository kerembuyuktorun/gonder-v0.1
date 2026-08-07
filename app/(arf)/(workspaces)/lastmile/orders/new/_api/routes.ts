import type { ActiveRouteOption } from '../_types/order-create'
import { lastmileClientRequest } from './client'

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function pickNumber(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return 0
}

export function mapRouteOption(raw: unknown): ActiveRouteOption | null {
  const item = asRecord(raw)
  const id = pickString(item.id)
  if (!id) return null

  const driver = asRecord(item.driver)
  const distanceM = pickNumber(item.distanceM, item.distance_m)
  const distanceKm =
    pickNumber(item.distanceKm, item.distance_km) ||
    (distanceM > 0 ? Math.round((distanceM / 1000) * 10) / 10 : 0)

  return {
    id,
    label: pickString(item.name, item.code, item.label, item.routeCode) || id.slice(0, 8),
    courier: pickString(
      item.driverName,
      item.courierName,
      driver.fullName,
      driver.name,
      [pickString(driver.firstName), pickString(driver.lastName)].filter(Boolean).join(' ')
    ),
    distanceKm,
    costMinutes: pickNumber(
      item.costMinutes,
      item.etaMinutes,
      item.extraMinutes,
      item.durationMinutes
    ),
  }
}

export async function fetchActiveRoutes(customerId: string) {
  if (!customerId) {
    return { success: true as const, data: { items: [] as ActiveRouteOption[] } }
  }

  const params = new URLSearchParams({
    customerId,
    page: '1',
    pageSize: '50',
  })

  // Prefer active statuses; BE may ignore unknown multi-status — call twice if needed.
  // Single call without status filter is safer if status is enum-only one value.
  const result = await lastmileClientRequest<{ items: unknown[] }>(
    `/api/lastmile/routes?${params.toString()}`,
    { method: 'GET' }
  )

  if (!result.success) return result

  const items = result.data.items
    .map(mapRouteOption)
    .filter((item): item is ActiveRouteOption => Boolean(item))

  return {
    success: true as const,
    data: { items },
  }
}
