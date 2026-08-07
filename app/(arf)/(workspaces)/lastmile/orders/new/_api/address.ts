import type { AddressSuggestion } from '../_types/order-create'
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

export type AddressGeocodeResult = {
  latitude: number
  longitude: number
  formattedAddress: string
  placeId?: string
}

export function mapAddressSuggestion(raw: unknown): AddressSuggestion | null {
  const item = asRecord(raw)
  const placeId = pickString(item.placeId, item.id)
  const primary = pickString(item.mainText, item.primary, item.description)
  const secondary = pickString(item.secondaryText, item.secondary)
  const description = pickString(item.description)

  if (!placeId && !primary && !description) return null

  return {
    id: placeId || description || primary,
    primary: primary || description,
    secondary: secondary || (primary && description !== primary ? description : ''),
  }
}

export async function fetchAddressAutocomplete(input: string, sessionToken?: string) {
  const result = await lastmileClientRequest<{ suggestions: unknown[] }>(
    '/api/lastmile/address/autocomplete',
    {
      method: 'POST',
      body: JSON.stringify({ input, sessionToken }),
    }
  )

  if (!result.success) return result

  return {
    success: true as const,
    data: {
      suggestions: result.data.suggestions
        .map(mapAddressSuggestion)
        .filter((item): item is AddressSuggestion => Boolean(item))
        .slice(0, 6),
    },
  }
}

export async function fetchAddressGeocode(addressText: string) {
  const result = await lastmileClientRequest<Record<string, unknown>>(
    '/api/lastmile/address/geocode',
    {
      method: 'POST',
      body: JSON.stringify({ addressText }),
    }
  )

  if (!result.success) return result

  const latitude = Number(result.data.latitude)
  const longitude = Number(result.data.longitude)
  const formattedAddress = pickString(result.data.formattedAddress, addressText)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return {
      success: false as const,
      error: 'Adres koordinatı alınamadı. Lütfen listeden tekrar seçin.',
    }
  }

  return {
    success: true as const,
    data: {
      latitude,
      longitude,
      formattedAddress,
      placeId: pickString(result.data.placeId) || undefined,
    } satisfies AddressGeocodeResult,
  }
}
