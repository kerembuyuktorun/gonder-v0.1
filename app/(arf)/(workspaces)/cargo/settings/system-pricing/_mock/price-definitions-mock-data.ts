// TODO: Remove when API is ready
import type {
  PriceDefinitionDetail,
  PriceDefinitionRecord,
  PriceDefinitionStatus,
  PriceDefinitionType,
  PriceMatrixValidationResult,
  PriceRuleRow,
  PriceSurcharge,
  RegionType,
  ShipmentType,
  UnitType,
} from "../_types"

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100
}

function sortRules(rules: PriceRuleRow[]): PriceRuleRow[] {
  return [...rules].sort((a, b) => {
    if (a.unitType !== b.unitType) {
      return a.unitType.localeCompare(b.unitType)
    }
    if (a.shipmentType !== b.shipmentType) {
      return a.shipmentType.localeCompare(b.shipmentType)
    }
    if (a.regionType !== b.regionType) {
      return a.regionType.localeCompare(b.regionType)
    }
    return a.rangeStart - b.rangeStart
  })
}

function cloneRules(rules: PriceRuleRow[]): PriceRuleRow[] {
  return rules.map((row) => ({ ...row }))
}

function cloneSurcharges(surcharges: PriceSurcharge): PriceSurcharge {
  return {
    ...surcharges,
    customServices: surcharges.customServices.map((service) => ({ ...service })),
  }
}

function cloneDetail(detail: PriceDefinitionDetail): PriceDefinitionDetail {
  return {
    ...detail,
    rules: cloneRules(detail.rules),
    surcharges: cloneSurchages(detail.surcharges),
  }
}

function cloneRecord(record: PriceDefinitionRecord): PriceDefinitionRecord {
  return { ...record }
}

function cloneSurchages(surcharges: PriceSurcharge): PriceSurcharge {
  return cloneSurcharges(surcharges)
}

function countRules(rules: PriceRuleRow[]): number {
  return rules.length
}

function toRecord(detail: PriceDefinitionDetail): PriceDefinitionRecord {
  return {
    id: detail.id,
    code: detail.code,
    name: detail.name,
    type: detail.type,
    isDefault: detail.isDefault,
    validFrom: detail.validFrom,
    validTo: detail.validTo,
    status: detail.status,
    ruleCount: countRules(detail.rules),
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    createdBy: detail.createdBy,
    createdByName: detail.createdByName,
  }
}

function makeRule(input: {
  id: string
  unitType: UnitType
  shipmentType: ShipmentType
  regionType: RegionType
  regionLabel: string
  rangeStart: number
  rangeEnd: number
  basePrice: number
  incrementalPrice: number
  sortOrder: number
}): PriceRuleRow {
  return {
    id: input.id,
    unitType: input.unitType,
    shipmentType: input.shipmentType,
    regionType: input.regionType,
    regionLabel: input.regionLabel,
    rangeStart: roundToTwo(input.rangeStart),
    rangeEnd: roundToTwo(input.rangeEnd),
    basePrice: roundToTwo(input.basePrice),
    incrementalPrice: roundToTwo(input.incrementalPrice),
    sortOrder: input.sortOrder,
  }
}

function makeSurcharges(input: {
  smsNotificationFee: number
  codCommissionType: PriceSurcharge["codCommissionType"]
  codCommissionValue: number
  pickupFee: number
  remoteAreaDeliveryFee: number
  customServices?: PriceSurcharge["customServices"]
}): PriceSurcharge {
  return {
    smsNotificationFee: roundToTwo(input.smsNotificationFee),
    codCommissionType: input.codCommissionType,
    codCommissionValue: roundToTwo(input.codCommissionValue),
    pickupFee: roundToTwo(input.pickupFee),
    remoteAreaDeliveryFee: roundToTwo(input.remoteAreaDeliveryFee),
    customServices: (input.customServices ?? []).map((service) => ({
      id: service.id,
      name: service.name,
      fee: roundToTwo(service.fee),
    })),
  }
}

function makeDetail(input: {
  id: string
  code: string
  name: string
  type: PriceDefinitionType
  isDefault: boolean
  validFrom: string
  validTo: string
  status: PriceDefinitionStatus
  rules: PriceRuleRow[]
  surcharges: PriceSurcharge
  createdAt: string
  updatedAt: string
  createdByName: string
}): PriceDefinitionDetail {
  return {
    id: input.id,
    code: input.code,
    name: input.name,
    type: input.type,
    isDefault: input.isDefault,
    validFrom: input.validFrom,
    validTo: input.validTo,
    status: input.status,
    ruleCount: input.rules.length,
    rules: sortRules(input.rules),
    surcharges: cloneSurchages(input.surcharges),
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    createdBy: input.createdByName.toLowerCase().replace(/\s+/g, "-"),
    createdByName: input.createdByName,
  }
}

const priceDefinitionsStore: PriceDefinitionDetail[] = [
  makeDetail({
    id: "prc-1",
    code: "TRF-ECOM-26",
    name: "E-Ticaret Standart 2026",
    type: "b2c",
    isDefault: true,
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    status: "active",
    rules: [
      makeRule({ id: "r-1", unitType: "desi", shipmentType: "koli", regionType: "city_inner", regionLabel: "Şehir İçi (0-50 km)", rangeStart: 0, rangeEnd: 5, basePrice: 85, incrementalPrice: 0, sortOrder: 1 }),
      makeRule({ id: "r-2", unitType: "desi", shipmentType: "koli", regionType: "city_inner", regionLabel: "Şehir İçi (0-50 km)", rangeStart: 5.01, rangeEnd: 15, basePrice: 85, incrementalPrice: 12, sortOrder: 2 }),
      makeRule({ id: "r-3", unitType: "kg", shipmentType: "zarf", regionType: "all_turkey", regionLabel: "Tüm Türkiye", rangeStart: 0, rangeEnd: 1, basePrice: 45, incrementalPrice: 0, sortOrder: 3 }),
      makeRule({ id: "r-4", unitType: "kg", shipmentType: "zarf", regionType: "all_turkey", regionLabel: "Tüm Türkiye", rangeStart: 1.01, rangeEnd: 5, basePrice: 45, incrementalPrice: 9.5, sortOrder: 4 }),
    ],
    surcharges: makeSurcharges({ smsNotificationFee: 2.5, codCommissionType: "fixed", codCommissionValue: 40, pickupFee: 20, remoteAreaDeliveryFee: 65 }),
    createdAt: "2026-01-02T09:10:00",
    updatedAt: "2026-03-20T14:30:00",
    createdByName: "Derya Aydın",
  }),
  makeDetail({
    id: "prc-2",
    code: "TRF-B2B-26",
    name: "Kurumsal Sözleşmesiz 2026",
    type: "b2b",
    isDefault: false,
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    status: "active",
    rules: [
      makeRule({ id: "r-5", unitType: "desi", shipmentType: "palet", regionType: "line_based", regionLabel: "Hat Bazlı", rangeStart: 0, rangeEnd: 20, basePrice: 180, incrementalPrice: 8, sortOrder: 1 }),
      makeRule({ id: "r-6", unitType: "desi", shipmentType: "palet", regionType: "line_based", regionLabel: "Hat Bazlı", rangeStart: 20.01, rangeEnd: 60, basePrice: 340, incrementalPrice: 7.25, sortOrder: 2 }),
    ],
    surcharges: makeSurcharges({ smsNotificationFee: 1.75, codCommissionType: "percent", codCommissionValue: 3, pickupFee: 18, remoteAreaDeliveryFee: 55 }),
    createdAt: "2026-01-03T11:15:00",
    updatedAt: "2026-02-11T10:20:00",
    createdByName: "Serkan Demir",
  }),
  makeDetail({
    id: "prc-3",
    code: "TRF-ECOM-25",
    name: "E-Ticaret Standart 2025",
    type: "b2c",
    isDefault: false,
    validFrom: "2025-01-01",
    validTo: "2025-12-31",
    status: "passive",
    rules: [
      makeRule({ id: "r-7", unitType: "desi", shipmentType: "koli", regionType: "city_inner", regionLabel: "Şehir İçi (0-50 km)", rangeStart: 0, rangeEnd: 5, basePrice: 72, incrementalPrice: 0, sortOrder: 1 }),
      makeRule({ id: "r-8", unitType: "desi", shipmentType: "koli", regionType: "city_inner", regionLabel: "Şehir İçi (0-50 km)", rangeStart: 5.01, rangeEnd: 15, basePrice: 72, incrementalPrice: 9, sortOrder: 2 }),
    ],
    surcharges: makeSurcharges({ smsNotificationFee: 2, codCommissionType: "fixed", codCommissionValue: 30, pickupFee: 15, remoteAreaDeliveryFee: 50 }),
    createdAt: "2025-01-03T10:00:00",
    updatedAt: "2025-11-27T17:00:00",
    createdByName: "Nazlı Yaman",
  }),
]

function ensureSingleDefault(preferredId: string): void {
  for (const definition of priceDefinitionsStore) {
    definition.isDefault = definition.id === preferredId
  }
}

function buildRuleGroupKey(rule: PriceRuleRow): string {
  return `${rule.unitType}__${rule.shipmentType}__${rule.regionType}`
}

export function validatePriceRuleMatrix(rules: PriceRuleRow[]): PriceMatrixValidationResult {
  const overlapErrors: string[] = []
  const gapWarnings: string[] = []
  const grouped = new Map<string, PriceRuleRow[]>()

  for (const rule of rules) {
    const key = buildRuleGroupKey(rule)
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)?.push(rule)

    if (roundToTwo(rule.rangeStart) > roundToTwo(rule.rangeEnd)) {
      overlapErrors.push(
        `${rule.regionLabel} / ${rule.shipmentType} için başlangıç değeri bitişten büyük olamaz (${rule.rangeStart} - ${rule.rangeEnd}).`,
      )
    }
  }

  for (const [key, rows] of grouped) {
    const sortedRows = [...rows].sort((a, b) => a.rangeStart - b.rangeStart)
    for (let index = 1; index < sortedRows.length; index += 1) {
      const previous = sortedRows[index - 1]
      const current = sortedRows[index]
      const expectedStart = roundToTwo(previous.rangeEnd + 0.01)

      if (roundToTwo(current.rangeStart) < roundToTwo(expectedStart)) {
        overlapErrors.push(
          `${key} grubunda kesişen Tanım var: ${previous.rangeStart}-${previous.rangeEnd} ile ${current.rangeStart}-${current.rangeEnd}.`,
        )
      }

      if (roundToTwo(current.rangeStart) > roundToTwo(expectedStart)) {
        gapWarnings.push(
          `${key} grubunda Tanım boşluğu var: ${previous.rangeEnd} sonrası ${current.rangeStart} başlıyor.`,
        )
      }
    }
  }

  return { overlapErrors, gapWarnings }
}

export function getPriceDefinitionsList(): PriceDefinitionRecord[] {
  return priceDefinitionsStore
    .map((detail) => toRecord(detail))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .map((record) => cloneRecord(record))
}

export function getPriceDefinitionById(id: string): PriceDefinitionDetail | undefined {
  const detail = priceDefinitionsStore.find((item) => item.id === id)
  return detail ? cloneDetail(detail) : undefined
}

export interface UpsertPriceDefinitionInput {
  code: string
  name: string
  type: PriceDefinitionType
  isDefault: boolean
  validFrom: string
  validTo: string
  status: PriceDefinitionStatus
  rules: PriceRuleRow[]
  surcharges: PriceSurcharge
}

function normalizeRule(rule: PriceRuleRow, index: number): PriceRuleRow {
  return {
    ...rule,
    id: rule.id || `rule-${Date.now()}-${index}`,
    sortOrder: index + 1,
    rangeStart: roundToTwo(rule.rangeStart),
    rangeEnd: roundToTwo(rule.rangeEnd),
    basePrice: roundToTwo(rule.basePrice),
    incrementalPrice: roundToTwo(rule.incrementalPrice),
  }
}

export function createPriceDefinition(input: UpsertPriceDefinitionInput): PriceDefinitionDetail {
  const now = new Date().toISOString()
  const id = `prc-${Date.now()}`
  const detail = makeDetail({
    id,
    code: input.code.trim(),
    name: input.name.trim(),
    type: input.type,
    isDefault: input.isDefault,
    validFrom: input.validFrom,
    validTo: input.validTo,
    status: input.status,
    rules: input.rules.map(normalizeRule),
    surcharges: cloneSurchages(input.surcharges),
    createdAt: now,
    updatedAt: now,
    createdByName: "Mevcut Kullanıcı",
  })

  if (detail.isDefault) {
    ensureSingleDefault(detail.id)
  }

  priceDefinitionsStore.unshift(detail)
  return cloneDetail(detail)
}

export function updatePriceDefinition(id: string, input: UpsertPriceDefinitionInput): PriceDefinitionDetail | undefined {
  const detail = priceDefinitionsStore.find((item) => item.id === id)
  if (!detail) {
    return undefined
  }

  detail.code = input.code.trim()
  detail.name = input.name.trim()
  detail.type = input.type
  detail.isDefault = input.isDefault
  detail.validFrom = input.validFrom
  detail.validTo = input.validTo
  detail.status = input.status
  detail.rules = sortRules(input.rules.map(normalizeRule))
  detail.ruleCount = detail.rules.length
  detail.surcharges = cloneSurchages(input.surcharges)
  detail.updatedAt = new Date().toISOString()

  if (detail.isDefault) {
    ensureSingleDefault(detail.id)
  }

  return cloneDetail(detail)
}

export function clonePriceDefinition(id: string): PriceDefinitionDetail | undefined {
  const source = priceDefinitionsStore.find((item) => item.id === id)
  if (!source) {
    return undefined
  }

  const now = new Date().toISOString()
  const cloneId = `prc-${Date.now()}`
  const clone = makeDetail({
    id: cloneId,
    code: `${source.code}-CLN`,
    name: `${source.name} (Kopya)`,
    type: source.type,
    isDefault: false,
    validFrom: source.validFrom,
    validTo: source.validTo,
    status: "passive",
    rules: cloneRules(source.rules).map((rule, index) => ({
      ...rule,
      id: `rule-${Date.now()}-${index}`,
      sortOrder: index + 1,
    })),
    surcharges: cloneSurchages(source.surcharges),
    createdAt: now,
    updatedAt: now,
    createdByName: "Mevcut Kullanıcı",
  })

  priceDefinitionsStore.unshift(clone)
  return cloneDetail(clone)
}

export function setPriceDefinitionStatus(id: string, status: PriceDefinitionStatus): PriceDefinitionDetail | undefined {
  const detail = priceDefinitionsStore.find((item) => item.id === id)
  if (!detail) {
    return undefined
  }

  detail.status = status
  detail.updatedAt = new Date().toISOString()
  if (status === "passive" && detail.isDefault) {
    detail.isDefault = false
    const nextActive = priceDefinitionsStore.find((item) => item.id !== id && item.status === "active")
    if (nextActive) {
      ensureSingleDefault(nextActive.id)
    }
  }

  return cloneDetail(detail)
}

export function exportPriceDefinition(id: string, format: "pdf" | "excel"): { url: string } {
  return {
    url: `/mock/exports/price-definition-${id}.${format === "excel" ? "xlsx" : "pdf"}`,
  }
}
