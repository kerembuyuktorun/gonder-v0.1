/**
 * Fleet / lastmile skill kataloğu — sipariş (vroomId) ve araç/kurye (code) eşlemesi.
 */

export type SkillCatalogAppliesTo = 'order' | 'vehicle' | 'courier' | 'driver'

export type SkillCatalogItem = {
  code: string
  name: string
  vroomId?: number | null
  appliesTo?: string[]
}

/** Canonical vroomId → label (fleet kataloğu ile hizalı) */
export const CANONICAL_SKILL_LABEL_BY_ID: Record<number, string> = {
  209: 'Montaj Ekibi',
  102: 'Soğuk Zincir',
  210: 'İki Kurye',
}

/** Eski sipariş create ID’leri → canonical */
export const LEGACY_SKILL_ID_TO_CANONICAL: Record<number, number> = {
  101: 209,
  103: 210,
}

export const SKILL_LABEL_BY_CODE: Record<string, string> = {
  montaj_ekibi: 'Montaj Ekibi',
  soguk_zincir: 'Soğuk Zincir',
  iki_kurye: 'İki Kurye',
  ASSEMBLY_TEAM: 'Montaj Ekibi',
  COLD_CHAIN: 'Soğuk Zincir',
  TWO_COURIERS: 'İki Kurye',
}

export const FALLBACK_ORDER_SKILLS: SkillCatalogItem[] = [
  { code: 'montaj_ekibi', name: 'Montaj Ekibi', vroomId: 209, appliesTo: ['order'] },
  { code: 'soguk_zincir', name: 'Soğuk Zincir', vroomId: 102, appliesTo: ['order', 'vehicle'] },
  { code: 'iki_kurye', name: 'İki Kurye', vroomId: 210, appliesTo: ['order', 'vehicle'] },
]

/** VROOM default skill — tenant-wide implicit; hidden from pickers and badges */
export const DEFAULT_SKILL_VROOM_ID = 14
export const DEFAULT_SKILL_CODE = 'genel'

export function isImplicitSkill(value: number | string): boolean {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value === DEFAULT_SKILL_VROOM_ID
  }

  if (typeof value !== 'string') return false

  const trimmed = value.trim()
  if (!trimmed) return false

  if (trimmed === '14') return true
  if (trimmed.toLowerCase() === DEFAULT_SKILL_CODE) return true
  if (trimmed.replace(/\s+/g, '_').toLowerCase() === DEFAULT_SKILL_CODE) return true
  if (trimmed === 'Genel') return true

  return false
}

export function filterImplicitSkillCodes<T extends string>(codes: T[]): T[] {
  return codes.filter((code) => !isImplicitSkill(code))
}

export function filterImplicitSkillIds(ids: number[]): number[] {
  return ids.filter((id) => !isImplicitSkill(id))
}

export type SkillLabelLookup = {
  byId: Record<number, string>
  byCode: Record<string, string>
  byName: Record<string, number>
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

function asString(input: unknown, fallback = ''): string {
  if (typeof input === 'string') return input
  if (typeof input === 'number' && Number.isFinite(input)) return String(input)
  return fallback
}

function asStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input.map((item) => asString(item).trim()).filter(Boolean)
}

export function normalizeSkillId(id: number): number {
  return LEGACY_SKILL_ID_TO_CANONICAL[id] ?? id
}

export function mapSkillCatalogItem(raw: unknown): SkillCatalogItem | null {
  const row = asRecord(raw)
  const code = asString(row.code ?? row.slug ?? row.id)
  if (!code) return null

  const name = asString(row.name ?? row.label) || code
  const vroomRaw = row.vroomId ?? row.vroomSkillId
  const vroomId =
    typeof vroomRaw === 'number' && Number.isFinite(vroomRaw) ? vroomRaw : null
  const appliesTo = asStringArray(row.appliesTo)

  if (isImplicitSkill(code) || (vroomId != null && isImplicitSkill(vroomId))) {
    return null
  }

  return {
    code,
    name,
    vroomId,
    appliesTo: appliesTo.length > 0 ? appliesTo : undefined,
  }
}

export function buildSkillLabelLookup(items: SkillCatalogItem[]): SkillLabelLookup {
  const byId: Record<number, string> = { ...CANONICAL_SKILL_LABEL_BY_ID }
  const byCode: Record<string, string> = { ...SKILL_LABEL_BY_CODE }
  const byName: Record<string, number> = {}

  for (const item of items) {
    byCode[item.code] = item.name
    if (typeof item.vroomId === 'number' && Number.isFinite(item.vroomId)) {
      byId[item.vroomId] = item.name
      byName[item.name] = item.vroomId
    }
  }

  for (const [legacy, canonical] of Object.entries(LEGACY_SKILL_ID_TO_CANONICAL)) {
    const legacyNum = Number(legacy)
    if (byId[canonical]) {
      byId[legacyNum] = byId[canonical]
    }
  }

  return { byId, byCode, byName }
}

export function buildCodeLabelMap(items: SkillCatalogItem[]): Record<string, string> {
  return buildSkillLabelLookup(items).byCode
}

export function mapSkillLabel(raw: unknown, lookup?: SkillLabelLookup): string {
  if (raw == null) return ''

  const byId = lookup?.byId ?? CANONICAL_SKILL_LABEL_BY_ID
  const byCode = lookup?.byCode ?? SKILL_LABEL_BY_CODE

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    if (isImplicitSkill(raw)) return ''
    const normalized = normalizeSkillId(raw)
    return byId[normalized] ?? byId[raw] ?? String(raw)
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed || isImplicitSkill(trimmed)) return ''

    const asId = Number(trimmed)
    if (Number.isInteger(asId)) {
      const normalized = normalizeSkillId(asId)
      if (byId[normalized]) return byId[normalized]
      if (byId[asId]) return byId[asId]
    }

    const codeKey = trimmed.toLowerCase().replace(/\s+/g, '_')
    if (byCode[codeKey]) return byCode[codeKey]
    if (byCode[trimmed]) return byCode[trimmed]
    const upperKey = trimmed.toUpperCase().replace(/\s+/g, '_')
    if (byCode[upperKey]) return byCode[upperKey]

    if (Object.values(byId).includes(trimmed)) return trimmed
    return trimmed
  }

  const row = asRecord(raw)
  const label = asString(row.label ?? row.name ?? row.title).trim()
  if (label) return mapSkillLabel(label, lookup)

  const id = Number(row.id ?? row.skillId ?? row.vroomId)
  if (Number.isFinite(id)) return mapSkillLabel(id, lookup)

  const code = asString(row.code ?? row.key).trim()
  if (code) return mapSkillLabel(code, lookup)

  return ''
}

export function mapSkillsFromRaw(input: unknown, lookup?: SkillLabelLookup): string[] {
  if (!Array.isArray(input)) return []
  const labels = input
    .filter((item) => {
      if (typeof item === 'number' || typeof item === 'string') {
        return !isImplicitSkill(item)
      }
      return true
    })
    .map((item) => mapSkillLabel(item, lookup))
    .filter((label) => Boolean(label) && !isImplicitSkill(label))
  return Array.from(new Set(labels))
}

/** Form gereksinim adları / vroomId string → canonical vroomId listesi */
export function mapRequirementValuesToVroomIds(
  values: string[],
  catalog: SkillCatalogItem[]
): number[] {
  const lookup = buildSkillLabelLookup(catalog)

  return values.flatMap((value) => {
    const trimmed = value.trim()
    if (!trimmed || isImplicitSkill(trimmed)) return []

    const asNum = Number(trimmed)
    if (Number.isInteger(asNum) && Number.isFinite(asNum)) {
      if (isImplicitSkill(asNum)) return []
      return [normalizeSkillId(asNum)]
    }

    const fromName = lookup.byName[trimmed]
    if (typeof fromName === 'number') {
      if (isImplicitSkill(fromName)) return []
      return [fromName]
    }

    const fromCatalog = catalog.find(
      (item) => item.name === trimmed || item.code === trimmed
    )
    if (fromCatalog?.vroomId != null) {
      if (isImplicitSkill(fromCatalog.vroomId)) return []
      return [fromCatalog.vroomId]
    }

    return []
  })
}

/** Araç yetenek slug’ları sipariş gereksinim vroomId’leriyle eşleşiyor mu */
export function vehicleSkillsMatchOrderRequirements(
  vehicleSkillCodes: string[],
  orderRequirementLabels: string[],
  catalog: SkillCatalogItem[]
): boolean {
  if (orderRequirementLabels.length === 0) return true

  const lookup = buildSkillLabelLookup(catalog)
  const requiredIds = mapRequirementValuesToVroomIds(orderRequirementLabels, catalog)
  if (requiredIds.length === 0) return true

  const vehicleVroomIds = vehicleSkillCodes.flatMap((code) => {
    const item = catalog.find((entry) => entry.code === code)
    if (item?.vroomId != null) return [item.vroomId]
    const fromCode = lookup.byCode[code]
    const match = catalog.find((entry) => entry.name === fromCode)
    return match?.vroomId != null ? [match.vroomId] : []
  })

  return requiredIds.every((id) => vehicleVroomIds.includes(id))
}
