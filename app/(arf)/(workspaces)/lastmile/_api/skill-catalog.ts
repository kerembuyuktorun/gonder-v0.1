import { lastmileClientRequest } from '../orders/new/_api/client'
import {
  mapSkillCatalogItem,
  type SkillCatalogAppliesTo,
  type SkillCatalogItem,
} from '../_lib/skill-catalog'

function unwrapPayload(data: Record<string, unknown> | undefined) {
  const nested = data?.data
  return nested && typeof nested === 'object' && !Array.isArray(nested)
    ? (nested as Record<string, unknown>)
    : data ?? {}
}

export async function fetchSkillCatalog(appliesTo: SkillCatalogAppliesTo) {
  const queryAppliesTo = appliesTo === 'driver' ? 'driver' : appliesTo
  const params = new URLSearchParams({
    appliesTo: queryAppliesTo,
    excludeDefault: 'true',
  })

  const result = await lastmileClientRequest<Record<string, unknown>>(
    `/api/lastmile/definitions/skills?${params.toString()}`,
    { method: 'GET' }
  )

  if (!result.success) return result

  const payload = result.data ?? {}
  const nested = unwrapPayload(payload)
  const rawItems =
    (Array.isArray(payload.items) ? payload.items : null) ??
    (Array.isArray(nested.items) ? nested.items : null) ??
    []

  const seenCodes = new Set<string>()
  const items = rawItems
    .map((item) => mapSkillCatalogItem(item))
    .filter((item): item is SkillCatalogItem => {
      if (!item) return false
      if (seenCodes.has(item.code)) return false
      seenCodes.add(item.code)
      return true
    })

  return { success: true as const, data: items }
}
