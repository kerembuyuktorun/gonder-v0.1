import type { DistanceStructure, PriceZone } from '../_types/pricing'
import type {
  CourierCostBreakdown,
  CourierCostList,
  CourierCostQuoteInput,
  CourierCostQuoteResult,
  CourierCostRule,
} from '../_types/courier-cost'
import { roundMoney } from './format'

function geoMatches(
  rulePoint: { cityId: string; districtId?: string } | undefined,
  input: { cityId: string; districtId?: string }
): boolean {
  if (!rulePoint) return false
  if (rulePoint.cityId !== input.cityId) return false
  if (!rulePoint.districtId) return true
  if (!input.districtId) return false
  return rulePoint.districtId === input.districtId
}

function isDestInZone(zone: PriceZone, dest: { cityId: string; districtId?: string }): boolean {
  return zone.scopes.some((scope) => {
    if (scope.cityId !== dest.cityId) return false
    if (scope.districtIds.length === 0) return true
    if (!dest.districtId) return false
    return scope.districtIds.includes(dest.districtId)
  })
}

function quantityInRange(list: CourierCostList, rule: CourierCostRule, input: CourierCostQuoteInput): boolean {
  if ((list.quantityBasis ?? 'desi') === 'package') {
    const count = input.packageCount ?? 0
    const start = rule.packageStart ?? 0
    const end = rule.packageEnd ?? Number.POSITIVE_INFINITY
    return count >= start && count <= end
  }
  const desi = input.desi
  const start = rule.desiStart ?? 0
  const end = rule.desiEnd ?? Number.POSITIVE_INFINITY
  return desi >= start && desi <= end
}

function distanceMatches(
  structure: DistanceStructure,
  rule: CourierCostRule,
  input: CourierCostQuoteInput,
  zonesById: Map<string, PriceZone>
): { match: boolean; zoneName?: string } {
  switch (structure) {
    case 'od':
      return {
        match:
          geoMatches(rule.origin, input.origin) &&
          geoMatches(rule.destination, input.destination),
      }
    case 'zone': {
      if (!rule.zoneId) return { match: false }
      const zone = zonesById.get(rule.zoneId)
      if (!zone) return { match: false }
      const match = isDestInZone(zone, input.destination)
      return { match, zoneName: match ? zone.name : undefined }
    }
    case 'km':
      return { match: typeof input.distanceKm === 'number' && input.distanceKm >= 0 }
  }
}

function ruleMatches(
  list: CourierCostList,
  rule: CourierCostRule,
  input: CourierCostQuoteInput,
  zonesById: Map<string, PriceZone>
): { match: boolean; zoneName?: string } {
  if (rule.status !== 'active') return { match: false }
  if (!quantityInRange(list, rule, input)) return { match: false }
  return distanceMatches(list.distanceStructure, rule, input, zonesById)
}

/**
 * fixed  → flatFee (+ hybrid veya km: perKm × distance)
 * dynamic → baseFee + perDesi|perPackage × miktar (+ km)
 */
function computeFees(
  list: CourierCostList,
  rule: CourierCostRule,
  input: CourierCostQuoteInput
): Pick<CourierCostBreakdown, 'baseFee' | 'distanceFee' | 'desiFee' | 'flatFee'> {
  const needsKm =
    list.compensationModel === 'hybrid' || list.distanceStructure === 'km'
  const distanceFee = needsKm ? (rule.perKm ?? 0) * (input.distanceKm ?? 0) : 0

  if (rule.desiPricing === 'fixed') {
    return {
      baseFee: 0,
      distanceFee,
      desiFee: 0,
      flatFee: rule.flatFee ?? 0,
    }
  }

  const quantityFee =
    (list.quantityBasis ?? 'desi') === 'package'
      ? (rule.perPackage ?? 0) * (input.packageCount ?? 0)
      : (rule.perDesi ?? 0) * input.desi

  return {
    baseFee: rule.baseFee ?? 0,
    distanceFee,
    desiFee: quantityFee,
    flatFee: 0,
  }
}

function ruleLabel(list: CourierCostList, rule: CourierCostRule): string {
  if (rule.name) return rule.name
  if ((list.quantityBasis ?? 'desi') === 'package') {
    return `${rule.packageStart ?? 0}–${rule.packageEnd ?? '∞'} paket`
  }
  return `${rule.desiStart}–${rule.desiEnd} desi`
}

function applyMinMax(
  subtotal: number,
  rule: CourierCostRule
): { value: number; adjustments: CourierCostBreakdown['adjustments'] } {
  const adjustments: CourierCostBreakdown['adjustments'] = []
  let value = subtotal
  if (rule.minFee != null && value < rule.minFee) {
    adjustments.push({ label: 'Minimum ücret', amount: roundMoney(rule.minFee - value) })
    value = rule.minFee
  }
  if (rule.maxFee != null && value > rule.maxFee) {
    adjustments.push({ label: 'Maksimum ücret', amount: roundMoney(rule.maxFee - value) })
    value = rule.maxFee
  }
  return { value: roundMoney(value), adjustments }
}

export type CourierCostQuoteContext = {
  costLists: CourierCostList[]
  zones: PriceZone[]
  /** courierId → costListId */
  assignments: Record<string, string>
}

export function resolveCourierCostList(
  ctx: CourierCostQuoteContext,
  input: CourierCostQuoteInput
): CourierCostList | undefined {
  if (input.costListId) {
    return ctx.costLists.find((p) => p.id === input.costListId && p.status === 'active')
  }
  if (input.courierId) {
    const assignedId = ctx.assignments[input.courierId]
    if (assignedId) {
      const assigned = ctx.costLists.find((p) => p.id === assignedId && p.status === 'active')
      if (assigned) return assigned
    }
  }
  return ctx.costLists.find((p) => p.isDefault && p.status === 'active')
}

function emptyBreakdown(
  patch: Partial<CourierCostBreakdown> & { subtotal: number; total: number }
): CourierCostBreakdown {
  return {
    baseFee: 0,
    distanceFee: 0,
    desiFee: 0,
    flatFee: 0,
    salaryPortion: 0,
    bonusPortion: 0,
    adjustments: [],
    ...patch,
  }
}

function buildInputs(
  list: CourierCostList,
  input: CourierCostQuoteInput,
  extras?: { zoneName?: string; fixedSalaryMonthly?: number }
) {
  return {
    desi: input.desi,
    packageCount: input.packageCount,
    distanceKm: input.distanceKm,
    originCityId: input.origin.cityId,
    originDistrictId: input.origin.districtId,
    destCityId: input.destination.cityId,
    destDistrictId: input.destination.districtId,
    zoneName: extras?.zoneName,
    fixedSalaryMonthly: extras?.fixedSalaryMonthly,
  }
}

export function quoteCourierCost(
  ctx: CourierCostQuoteContext,
  input: CourierCostQuoteInput
): CourierCostQuoteResult {
  const list = resolveCourierCostList(ctx, input)
  if (!list) {
    return { ok: false, error: 'Aktif kurye ücret listesi bulunamadı.' }
  }

  const salaryNote =
    list.compensationModel === 'salary_plus_bonus' ? list.fixedSalaryMonthly : undefined

  if (input.manualSubtotalOverride != null && Number.isFinite(input.manualSubtotalOverride)) {
    const subtotal = roundMoney(input.manualSubtotalOverride)
    return {
      ok: true,
      costListId: list.id,
      costListName: list.name,
      compensationModel: list.compensationModel,
      quantityBasis: list.quantityBasis ?? 'desi',
      matchedRuleId: 'manual_override',
      matchedRuleLabel: 'Manuel tutar',
      pricingMode: list.rules[0]?.pricingMode ?? 'od_district',
      distanceStructure: list.distanceStructure,
      inputs: buildInputs(list, input, { fixedSalaryMonthly: salaryNote }),
      breakdown: emptyBreakdown({
        flatFee: subtotal,
        adjustments: [{ label: 'Manuel override', amount: 0 }],
        subtotal,
        total: subtotal,
      }),
      currency: 'TRY',
      calculatedAt: new Date().toISOString(),
    }
  }

  const zonesById = new Map(ctx.zones.map((z) => [z.id, z]))
  const sorted = [...list.rules].sort((a, b) => b.priority - a.priority)

  for (const rule of sorted) {
    const { match, zoneName } = ruleMatches(list, rule, input, zonesById)
    if (!match) continue

    const fees = computeFees(list, rule, input)
    const raw = fees.baseFee + fees.distanceFee + fees.desiFee + fees.flatFee
    const { value: subtotal, adjustments } = applyMinMax(raw, rule)
    const isBonus = list.compensationModel === 'salary_plus_bonus'

    if (
      list.compensationModel === 'hybrid' &&
      (input.distanceKm == null || !Number.isFinite(input.distanceKm))
    ) {
      adjustments.push({
        label: 'Mesafe (km) girilmedi — km ücreti 0',
        amount: 0,
      })
    }

    return {
      ok: true,
      costListId: list.id,
      costListName: list.name,
      compensationModel: list.compensationModel,
      quantityBasis: list.quantityBasis ?? 'desi',
      matchedRuleId: rule.id,
      matchedRuleLabel: ruleLabel(list, rule),
      pricingMode: rule.pricingMode,
      distanceStructure: list.distanceStructure,
      inputs: buildInputs(list, input, { zoneName, fixedSalaryMonthly: salaryNote }),
      breakdown: {
        baseFee: roundMoney(fees.baseFee),
        distanceFee: roundMoney(fees.distanceFee),
        desiFee: roundMoney(fees.desiFee),
        flatFee: roundMoney(fees.flatFee),
        salaryPortion: 0,
        bonusPortion: isBonus ? subtotal : 0,
        adjustments,
        subtotal,
        total: subtotal,
      },
      currency: 'TRY',
      calculatedAt: new Date().toISOString(),
    }
  }

  if (list.compensationModel === 'salary_plus_bonus') {
    return {
      ok: true,
      costListId: list.id,
      costListName: list.name,
      compensationModel: list.compensationModel,
      quantityBasis: list.quantityBasis ?? 'desi',
      matchedRuleId: 'salary_only',
      matchedRuleLabel: 'Sabit maaş (dönemsel)',
      pricingMode: list.rules[0]?.pricingMode ?? 'base_plus_km',
      distanceStructure: list.distanceStructure,
      inputs: buildInputs(list, input, { fixedSalaryMonthly: list.fixedSalaryMonthly }),
      breakdown: emptyBreakdown({
        salaryPortion: 0,
        adjustments: [
          {
            label: `Aylık maaş (bilgi): ${list.fixedSalaryMonthly ?? 0} ₺`,
            amount: 0,
          },
        ],
        subtotal: 0,
        total: 0,
      }),
      currency: 'TRY',
      calculatedAt: new Date().toISOString(),
    }
  }

  return {
    ok: false,
    error: 'Uygun maliyet kuralı bulunamadı.',
    costListId: list.id,
    costListName: list.name,
  }
}
