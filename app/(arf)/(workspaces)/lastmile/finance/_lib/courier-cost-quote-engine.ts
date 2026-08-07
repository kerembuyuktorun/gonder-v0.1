import type { PriceZone } from '../_types/pricing'
import type {
  CompensationModel,
  CourierCostBreakdown,
  CourierCostList,
  CourierCostPricingMode,
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

function isBonusMode(mode: CourierCostPricingMode): boolean {
  return mode === 'salary_bonus_package' || mode === 'salary_bonus_km'
}

function isTariffMode(mode: CourierCostPricingMode): boolean {
  return (
    mode === 'base_plus_km' ||
    mode === 'od_district' ||
    mode === 'zone_flat' ||
    mode === 'desi_band_fixed' ||
    mode === 'desi_dynamic' ||
    mode === 'package_fee' ||
    mode === 'hourly_shift'
  )
}

function modeAllowedForCompensation(
  model: CompensationModel,
  mode: CourierCostPricingMode
): boolean {
  if (model === 'tariff') return isTariffMode(mode)
  if (model === 'salary_plus_bonus') return isBonusMode(mode)
  // hybrid: tariff + bonus
  return isTariffMode(mode) || isBonusMode(mode)
}

function ruleMatches(
  rule: CourierCostRule,
  input: CourierCostQuoteInput,
  zonesById: Map<string, PriceZone>
): { match: boolean; zoneName?: string } {
  if (rule.status !== 'active') return { match: false }

  switch (rule.pricingMode) {
    case 'od_district':
      return {
        match:
          geoMatches(rule.origin, input.origin) &&
          geoMatches(rule.destination, input.destination),
      }
    case 'zone_flat': {
      if (!rule.zoneId) return { match: false }
      const zone = zonesById.get(rule.zoneId)
      if (!zone) return { match: false }
      const match = isDestInZone(zone, input.destination)
      return { match, zoneName: match ? zone.name : undefined }
    }
    case 'base_plus_km':
    case 'salary_bonus_km':
      return { match: typeof input.distanceKm === 'number' && input.distanceKm >= 0 }
    case 'desi_band_fixed': {
      const start = rule.desiStart ?? 0
      const end = rule.desiEnd ?? Number.POSITIVE_INFINITY
      return { match: input.desi >= start && input.desi <= end }
    }
    case 'desi_dynamic': {
      if (rule.desiStart != null || rule.desiEnd != null) {
        const start = rule.desiStart ?? 0
        const end = rule.desiEnd ?? Number.POSITIVE_INFINITY
        return { match: input.desi >= start && input.desi <= end }
      }
      return { match: input.desi >= 0 }
    }
    case 'package_fee':
    case 'salary_bonus_package':
      return { match: (input.packageCount ?? 0) >= 0 }
    case 'hourly_shift':
      return { match: typeof input.workedHours === 'number' && input.workedHours >= 0 }
    default:
      return { match: false }
  }
}

type FeeParts = {
  baseFee: number
  distanceFee: number
  desiFee: number
  packageFee: number
  hourlyFee: number
  flatFee: number
  bonusPortion: number
}

function computeFees(rule: CourierCostRule, input: CourierCostQuoteInput): FeeParts {
  const empty: FeeParts = {
    baseFee: 0,
    distanceFee: 0,
    desiFee: 0,
    packageFee: 0,
    hourlyFee: 0,
    flatFee: 0,
    bonusPortion: 0,
  }

  switch (rule.pricingMode) {
    case 'base_plus_km': {
      const baseFee = rule.baseFee ?? 0
      const distanceFee = (rule.perKm ?? 0) * (input.distanceKm ?? 0)
      return { ...empty, baseFee, distanceFee }
    }
    case 'od_district':
    case 'zone_flat':
    case 'desi_band_fixed':
      return { ...empty, flatFee: rule.flatFee ?? 0 }
    case 'desi_dynamic': {
      const baseFee = rule.baseFee ?? 0
      const desiFee = (rule.perDesi ?? 0) * input.desi
      return { ...empty, baseFee, desiFee }
    }
    case 'package_fee': {
      const packageFee = (rule.perPackage ?? rule.flatFee ?? 0) * (input.packageCount ?? 1)
      return { ...empty, packageFee }
    }
    case 'hourly_shift': {
      const hourlyFee = (rule.perHour ?? 0) * (input.workedHours ?? 0)
      return { ...empty, hourlyFee }
    }
    case 'salary_bonus_package': {
      const bonusPortion = (rule.perPackage ?? 0) * (input.packageCount ?? 1)
      return { ...empty, bonusPortion, packageFee: bonusPortion }
    }
    case 'salary_bonus_km': {
      const bonusPortion = (rule.perKm ?? 0) * (input.distanceKm ?? 0)
      return { ...empty, bonusPortion, distanceFee: bonusPortion }
    }
    default:
      return empty
  }
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
    packageFee: 0,
    hourlyFee: 0,
    flatFee: 0,
    salaryPortion: 0,
    bonusPortion: 0,
    adjustments: [],
    ...patch,
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
    list.compensationModel === 'salary_plus_bonus' || list.compensationModel === 'hybrid'
      ? list.fixedSalaryMonthly
      : undefined

  if (input.manualSubtotalOverride != null && Number.isFinite(input.manualSubtotalOverride)) {
    const subtotal = roundMoney(input.manualSubtotalOverride)
    return {
      ok: true,
      costListId: list.id,
      costListName: list.name,
      compensationModel: list.compensationModel,
      matchedRuleId: 'manual_override',
      matchedRuleLabel: 'Manuel tutar',
      pricingMode: 'package_fee',
      inputs: {
        desi: input.desi,
        distanceKm: input.distanceKm,
        packageCount: input.packageCount,
        workedHours: input.workedHours,
        originCityId: input.origin.cityId,
        originDistrictId: input.origin.districtId,
        destCityId: input.destination.cityId,
        destDistrictId: input.destination.districtId,
        fixedSalaryMonthly: salaryNote,
      },
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
  const sorted = [...list.rules]
    .filter((r) => modeAllowedForCompensation(list.compensationModel, r.pricingMode))
    .sort((a, b) => b.priority - a.priority)

  // salary_plus_bonus: sipariş quote'unda salaryPortion=0 (dönemsel); yalnız bonus kuralları
  // hybrid/tariff: eşleşen kuralın ücretleri
  for (const rule of sorted) {
    const { match, zoneName } = ruleMatches(rule, input, zonesById)
    if (!match) continue

    const fees = computeFees(rule, input)
    const raw =
      fees.baseFee +
      fees.distanceFee +
      fees.desiFee +
      fees.packageFee +
      fees.hourlyFee +
      fees.flatFee
    // bonusPortion already counted in packageFee/distanceFee for bonus modes; avoid double count
    const rawTotal = isBonusMode(rule.pricingMode)
      ? fees.bonusPortion
      : raw

    const { value: subtotal, adjustments } = applyMinMax(rawTotal, rule)
    const salaryPortion = 0 // dönemsel maaş sipariş quote'unda ayrı gösterilir
    const bonusPortion = isBonusMode(rule.pricingMode)
      ? subtotal
      : roundMoney(fees.bonusPortion)

    return {
      ok: true,
      costListId: list.id,
      costListName: list.name,
      compensationModel: list.compensationModel,
      matchedRuleId: rule.id,
      matchedRuleLabel: rule.name || rule.pricingMode,
      pricingMode: rule.pricingMode,
      inputs: {
        desi: input.desi,
        distanceKm: input.distanceKm,
        packageCount: input.packageCount,
        workedHours: input.workedHours,
        originCityId: input.origin.cityId,
        originDistrictId: input.origin.districtId,
        destCityId: input.destination.cityId,
        destDistrictId: input.destination.districtId,
        zoneName,
        fixedSalaryMonthly: salaryNote,
      },
      breakdown: {
        baseFee: roundMoney(fees.baseFee),
        distanceFee: roundMoney(isBonusMode(rule.pricingMode) ? 0 : fees.distanceFee),
        desiFee: roundMoney(fees.desiFee),
        packageFee: roundMoney(isBonusMode(rule.pricingMode) ? 0 : fees.packageFee),
        hourlyFee: roundMoney(fees.hourlyFee),
        flatFee: roundMoney(fees.flatFee),
        salaryPortion,
        bonusPortion,
        adjustments,
        subtotal,
        total: subtotal,
      },
      currency: 'TRY',
      calculatedAt: new Date().toISOString(),
    }
  }

  // Maaş + prim modelinde bonus kuralı yoksa: 0 prim + maaş notu
  if (list.compensationModel === 'salary_plus_bonus') {
    return {
      ok: true,
      costListId: list.id,
      costListName: list.name,
      compensationModel: list.compensationModel,
      matchedRuleId: 'salary_only',
      matchedRuleLabel: 'Sabit maaş (dönemsel)',
      pricingMode: 'salary_bonus_package',
      inputs: {
        desi: input.desi,
        distanceKm: input.distanceKm,
        packageCount: input.packageCount,
        workedHours: input.workedHours,
        originCityId: input.origin.cityId,
        originDistrictId: input.origin.districtId,
        destCityId: input.destination.cityId,
        destDistrictId: input.destination.districtId,
        fixedSalaryMonthly: list.fixedSalaryMonthly,
      },
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
