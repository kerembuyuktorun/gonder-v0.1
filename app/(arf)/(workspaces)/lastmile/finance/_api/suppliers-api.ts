/**
 * Unified supplier accounts API (couriers + other vendors) — BFF `/api/lastmile/*`.
 */
import type {
  OtherSupplierRecord,
  SupplierAccount,
  SupplierKind,
  UpsertOtherSupplierInput,
} from '../_types/supplier'

export type { UpsertOtherSupplierInput }

async function financeFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'same-origin',
  })
  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean
    data?: T
    error?: string
  }
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Finance API error (${res.status})`)
  }
  return json.data as T
}

export async function listSupplierAccounts(filters?: {
  kind?: SupplierKind | 'all'
  search?: string
  tag?: string
}): Promise<SupplierAccount[]> {
  const params = new URLSearchParams()
  if (filters?.kind) params.set('kind', filters.kind)
  if (filters?.search?.trim()) params.set('search', filters.search.trim())
  if (filters?.tag) params.set('tag', filters.tag)
  const q = params.toString()
  const data = await financeFetch<{ items: SupplierAccount[] }>(
    `/api/lastmile/suppliers${q ? `?${q}` : ''}`
  )
  return data.items
}

export async function listOtherSuppliers(): Promise<OtherSupplierRecord[]> {
  const data = await financeFetch<{ items: OtherSupplierRecord[] }>(
    '/api/lastmile/suppliers/other'
  )
  return data.items
}

export async function getOtherSupplier(id: string): Promise<OtherSupplierRecord | undefined> {
  try {
    return await financeFetch<OtherSupplierRecord>(
      `/api/lastmile/suppliers/other/${encodeURIComponent(id)}`
    )
  } catch {
    return undefined
  }
}

export async function createOtherSupplier(
  input: UpsertOtherSupplierInput
): Promise<OtherSupplierRecord> {
  return financeFetch('/api/lastmile/suppliers/other', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateOtherSupplier(
  id: string,
  input: UpsertOtherSupplierInput
): Promise<OtherSupplierRecord | undefined> {
  try {
    return await financeFetch(`/api/lastmile/suppliers/other/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  } catch {
    return undefined
  }
}

export async function deleteOtherSupplier(id: string): Promise<boolean> {
  try {
    await financeFetch(`/api/lastmile/suppliers/other/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    return true
  } catch {
    return false
  }
}
