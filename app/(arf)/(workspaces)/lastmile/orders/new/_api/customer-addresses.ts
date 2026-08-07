import type { FacilityOption } from '../_types/order-create'
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

function pickNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return null
}

export function mapCustomerAddressToFacility(
  raw: unknown,
  fallbackCustomerId: string
): FacilityOption | null {
  const item = asRecord(raw)
  const id = pickString(item.id)
  if (!id) return null

  return {
    id,
    customerId: pickString(item.customerId) || fallbackCustomerId,
    label: pickString(item.title, item.label, item.name) || 'Tesis',
    address: pickString(item.fullAddress, item.detailAddress, item.address),
    contactName: pickString(item.authorizedPerson, item.contactName),
    contactPhone: pickString(item.phone, item.contactPhone),
    latitude: pickNumber(item.latitude, item.lat),
    longitude: pickNumber(item.longitude, item.lon, item.lng),
  }
}

export async function fetchCustomerAddresses(customerId: string) {
  if (!customerId) {
    return { success: true as const, data: { items: [] as FacilityOption[] } }
  }

  const params = new URLSearchParams({
    customerId,
    page: '1',
    pageSize: '100',
  })

  const result = await lastmileClientRequest<{ items: unknown[] }>(
    `/api/lastmile/customer-addresses?${params.toString()}`,
    { method: 'GET' }
  )

  if (!result.success) return result

  return {
    success: true as const,
    data: {
      items: result.data.items
        .map((item) => mapCustomerAddressToFacility(item, customerId))
        .filter((item): item is FacilityOption => Boolean(item)),
    },
  }
}
