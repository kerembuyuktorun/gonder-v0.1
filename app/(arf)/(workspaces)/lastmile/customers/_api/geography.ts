import { lastmileClientRequest } from './client'

export type GeoItem = {
  id: string
  name: string
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : {}
}

function asString(input: unknown): string {
  return typeof input === 'string' || typeof input === 'number' ? String(input).trim() : ''
}

function mapItems(raw: unknown): GeoItem[] {
  const root = asRecord(raw)
  const nested = asRecord(root.data)
  const items = Array.isArray(root.items)
    ? root.items
    : Array.isArray(root.cities)
      ? root.cities
      : Array.isArray(root.districts)
        ? root.districts
        : Array.isArray(root.neighborhoods)
          ? root.neighborhoods
          : Array.isArray(nested.items)
            ? nested.items
            : Array.isArray(root.data)
              ? root.data
              : Array.isArray(raw)
                ? raw
                : []

  return items
    .map((item) => {
      const row = asRecord(item)
      const id = asString(row.id)
      const name = asString(row.name || row.title || row.label)
      if (!id || !name) return null
      return { id, name }
    })
    .filter((item): item is GeoItem => Boolean(item))
}

type GeoListResult =
  | { success: true; data: GeoItem[] }
  | { success: false; error: string; code?: string }

async function fetchGeoList(
  path: string,
  params: Record<string, string | undefined>
): Promise<GeoListResult> {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value)
  }

  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/geography/${path}?${search.toString()}`,
    { method: 'GET' }
  )
  if (!result.success) return result
  return { success: true as const, data: mapItems(result.data) }
}

/** GET /api/v1/cities — ülke adımı yok */
export async function fetchCities(options?: { name?: string; pageSize?: number }) {
  return fetchGeoList('cities', {
    page: '1',
    pageSize: String(options?.pageSize ?? 1000),
    name: options?.name?.trim() || undefined,
  })
}

/** GET /api/v1/districts?cityId= */
export async function fetchDistricts(
  cityId: string,
  options?: { name?: string; pageSize?: number }
) {
  return fetchGeoList('districts', {
    cityId,
    page: '1',
    pageSize: String(options?.pageSize ?? 500),
    name: options?.name?.trim() || undefined,
  })
}

/** GET /api/v1/neighborhoods?districtId= */
export async function fetchNeighborhoods(
  districtId: string,
  options?: { name?: string; pageSize?: number }
) {
  return fetchGeoList('neighborhoods', {
    districtId,
    page: '1',
    pageSize: String(options?.pageSize ?? 1000),
    name: options?.name?.trim() || undefined,
  })
}
