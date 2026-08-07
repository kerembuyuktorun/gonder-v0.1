import type {
  DistanceStructure,
  PriceList,
  PriceRule,
  PriceZone,
  QuoteBreakdown,
  QuoteInput,
  QuoteResult,
} from '../_types/pricing'
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

function desiInRange(rule: PriceRule, desi: number): boolean {
  const start = rule.desiStart ?? 0
  const end = rule.desiEnd ?? Number.POSITIVE_INFINITY
  return desi >= start && desi <= end
}

function distanceMatches(
  structure: DistanceStructure,
  rule: PriceRule,
  input: QuoteInput,
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
  list: PriceList,
  rule: PriceRule,
  input: QuoteInput,
  zonesById: Map<string, PriceZone>
): { match: boolean; zoneName?: string } {
  if (rule.status !== 'active') return { match: false }
  if (!desiInRange(rule, input.desi)) return { match: false }
  return distanceMatches(list.distanceStructure, rule, input, zonesById)
}

/**
 * fixed  → flatFee (+ km: perKm × distance)
 * dynamic → baseFee + perDesi × desi (+ km: perKm × distance)
 */
function computeFees(
  list: PriceList,
  rule: PriceRule,
  input: QuoteInput
): Omit<QuoteBreakdown, 'adjustments' | 'subtotal' | 'kdvRate' | 'kdvAmount' | 'total'> {
  const distanceFee =
    list.distanceStructure === 'km' ? (rule.perKm ?? 0) * (input.distanceKm ?? 0) : 0

  if (rule.desiPricing === 'fixed') {
    return {
      baseFee: 0,
      distanceFee,
      desiFee: 0,
      flatFee: rule.flatFee ?? 0,
    }
  }

  return {
    baseFee: rule.baseFee ?? 0,
    distanceFee,
    desiFee: (rule.perDesi ?? 0) * input.desi,
    flatFee: 0,
  }
}

function applyMinMax(
  subtotal: number,
  rule: PriceRule
): { value: number; adjustments: QuoteBreakdown['adjustments'] } {
  const adjustments: QuoteBreakdown['adjustments'] = []
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

export type QuoteEngineContext = {
  priceLists: PriceList[]
  zones: PriceZone[]
  /** customerId → priceListId */
  assignments: Record<string, string>
}

export function resolvePriceList(
  ctx: QuoteEngineContext,
  input: QuoteInput
): PriceList | undefined {
  if (input.priceListId) {
    return ctx.priceLists.find((p) => p.id === input.priceListId && p.status === 'active')
  }
  if (input.customerId) {
    const assignedId = ctx.assignments[input.customerId]
    if (assignedId) {
      const assigned = ctx.priceLists.find((p) => p.id === assignedId && p.status === 'active')
      if (assigned) return assigned
    }
  }
  return ctx.priceLists.find((p) => p.isDefault && p.status === 'active')
}

export function quotePrice(ctx: QuoteEngineContext, input: QuoteInput): QuoteResult {
  const list = resolvePriceList(ctx, input)
  if (!list) {
    return { ok: false, error: 'Aktif fiyat listesi bulunamadı.' }
  }

  if (input.manualSubtotalOverride != null && Number.isFinite(input.manualSubtotalOverride)) {
    const subtotal = roundMoney(input.manualSubtotalOverride)
    const includeKdv = input.includeKdv !== false
    const kdvRate = includeKdv ? (input.kdvRate ?? 20) : 0
    const kdvAmount = includeKdv ? roundMoney(subtotal * (kdvRate / 100)) : 0
    return {
      ok: true,
      priceListId: list.id,
      priceListName: list.name,
      matchedRuleId: 'manual_override',
      matchedRuleLabel: 'Manuel tutar',
      pricingMode: list.rules[0]?.pricingMode ?? 'od_district',
      distanceStructure: list.distanceStructure,
      inputs: {
        desi: input.desi,
        distanceKm: input.distanceKm,
        originCityId: input.origin.cityId,
        originDistrictId: input.origin.districtId,
        destCityId: input.destination.cityId,
        destDistrictId: input.destination.districtId,
      },
      breakdown: {
        baseFee: 0,
        distanceFee: 0,
        desiFee: 0,
        flatFee: subtotal,
        adjustments: [{ label: 'Manuel override', amount: 0 }],
        subtotal,
        kdvRate: includeKdv ? kdvRate : undefined,
        kdvAmount: includeKdv ? kdvAmount : undefined,
        total: roundMoney(subtotal + kdvAmount),
      },
      currency: 'TRY',
      calculatedAt: new Date().toISOString(),
    }
  }

  // İade: gönderi bedelinin yüzdesi
  if (input.purpose === 'return') {
    const percent = list.returnFeePercent ?? 50
    const original = input.originalSubtotal ?? 0
    if (!(original > 0)) {
      return {
        ok: false,
        error: 'İade ücreti için orijinal gönderi tutarı gerekli.',
        priceListId: list.id,
        priceListName: list.name,
      }
    }
    let subtotal = roundMoney((original * percent) / 100)
    const adjustments: QuoteBreakdown['adjustments'] = [
      { label: `İade ücreti (%${percent})`, amount: subtotal },
    ]
    if (list.returnFeeMin != null && subtotal < list.returnFeeMin) {
      adjustments.push({
        label: 'İade minimum ücret',
        amount: roundMoney(list.returnFeeMin - subtotal),
      })
      subtotal = roundMoney(list.returnFeeMin)
    }
    const includeKdv = input.includeKdv !== false
    const kdvRate = includeKdv ? (input.kdvRate ?? 20) : 0
    const kdvAmount = includeKdv ? roundMoney(subtotal * (kdvRate / 100)) : 0
    return {
      ok: true,
      priceListId: list.id,
      priceListName: list.name,
      matchedRuleId: 'return_fee',
      matchedRuleLabel: `İade · %${percent}`,
      pricingMode: list.rules[0]?.pricingMode ?? 'od_district',
      distanceStructure: list.distanceStructure,
      inputs: {
        desi: input.desi,
        distanceKm: input.distanceKm,
        originCityId: input.origin.cityId,
        originDistrictId: input.origin.districtId,
        destCityId: input.destination.cityId,
        destDistrictId: input.destination.districtId,
      },
      breakdown: {
        baseFee: 0,
        distanceFee: 0,
        desiFee: 0,
        flatFee: subtotal,
        adjustments,
        subtotal,
        kdvRate: includeKdv ? kdvRate : undefined,
        kdvAmount: includeKdv ? kdvAmount : undefined,
        total: roundMoney(subtotal + kdvAmount),
      },
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
    const includeKdv = input.includeKdv !== false
    const kdvRate = includeKdv ? (input.kdvRate ?? 20) : 0
    const kdvAmount = includeKdv ? roundMoney(subtotal * (kdvRate / 100)) : 0

    return {
      ok: true,
      priceListId: list.id,
      priceListName: list.name,
      matchedRuleId: rule.id,
      matchedRuleLabel: rule.name || `${rule.desiStart}–${rule.desiEnd} desi`,
      pricingMode: rule.pricingMode,
      distanceStructure: list.distanceStructure,
      inputs: {
        desi: input.desi,
        distanceKm: input.distanceKm,
        originCityId: input.origin.cityId,
        originDistrictId: input.origin.districtId,
        destCityId: input.destination.cityId,
        destDistrictId: input.destination.districtId,
        zoneName,
      },
      breakdown: {
        ...fees,
        baseFee: roundMoney(fees.baseFee),
        distanceFee: roundMoney(fees.distanceFee),
        desiFee: roundMoney(fees.desiFee),
        flatFee: roundMoney(fees.flatFee),
        adjustments,
        subtotal,
        kdvRate: includeKdv ? kdvRate : undefined,
        kdvAmount: includeKdv ? kdvAmount : undefined,
        total: roundMoney(subtotal + kdvAmount),
      },
      currency: 'TRY',
      calculatedAt: new Date().toISOString(),
    }
  }

  return {
    ok: false,
    error: 'Uygun fiyat kuralı bulunamadı.',
    priceListId: list.id,
    priceListName: list.name,
  }
}

/** İade ücreti hesapla (liste kuralı). */
export function computeReturnFee(
  list: Pick<PriceList, 'returnFeePercent' | 'returnFeeMin'>,
  originalSubtotal: number
): { fee: number; percent: number } {
  const percent = list.returnFeePercent ?? 50
  let fee = roundMoney((originalSubtotal * percent) / 100)
  if (list.returnFeeMin != null && fee < list.returnFeeMin) {
    fee = roundMoney(list.returnFeeMin)
  }
  return { fee, percent }
}
