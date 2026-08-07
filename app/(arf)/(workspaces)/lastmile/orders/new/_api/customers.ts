import type { CustomerOption } from '../_types/order-create'
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

export function mapCustomerOption(raw: unknown): CustomerOption | null {
  const item = asRecord(raw)
  const id = pickString(item.id)
  if (!id) return null

  const ownerName = [pickString(item.ownerFirstName), pickString(item.ownerLastName)]
    .filter(Boolean)
    .join(' ')

  const label =
    pickString(
      item.name,
      item.companyName,
      item.title,
      item.tradeName,
      item.label,
      ownerName
    ) || id

  return { id, label }
}

export async function fetchCustomers(search?: string) {
  const params = new URLSearchParams({ page: '1', pageSize: '100', status: 'Active' })
  if (search?.trim()) params.set('search', search.trim())

  const result = await lastmileClientRequest<{ items: unknown[] }>(
    `/api/lastmile/customers?${params.toString()}`,
    { method: 'GET' }
  )

  if (!result.success) return result

  return {
    success: true as const,
    data: {
      items: result.data.items.map(mapCustomerOption).filter((item): item is CustomerOption => Boolean(item)),
    },
  }
}
