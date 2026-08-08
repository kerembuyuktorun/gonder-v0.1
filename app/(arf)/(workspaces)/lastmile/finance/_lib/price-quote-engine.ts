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

function totalPackageCount(input: QuoteInput): number {
  if (input.packageLines && input.packageLines.length > 0) {
    return input.packageLines.reduce((sum, line) => sum + Math.max(0, line.quantity), 0)
  }
  return input.packageCount ?? 0
}

function quantityInRange(list: PriceList, rule: PriceRule, input: QuoteInput): boolean {
  if ((list.quantityBasis ?? 'desi') === 'package') {
    const count = totalPackageCount(input)
    const start = rule.packageStart ?? 0
    const end = rule.packageEnd ?? Number.POSITIVE_INFINITY
    return count >= start && count <= end
  }
  return desiInRange(rule, input.desi)
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
  if (!quantityInRange(list, rule, input)) return { match: false }
  return distanceMatches(list.distanceStructure, rule, input, zonesById)
}

/**
 * Paket kataloğu satırlarından ücret (Σ unitPrice × adet).
 */
export function computeCatalogPackageFee(
  list: PriceList,
  packageLines: QuoteInput['packageLines']
): { fee: number; adjustments: QuoteBreakdown['adjustments'] } | null {
  if (!packageLines || packageLines.length === 0) return null
  const catalog = list.packages ?? []
  if (catalog.length === 0) return null

  let fee = 0
  const adjustments: QuoteBreakdown['adjustments'] = []
  for (const line of packageLines) {
    if (!(line.quantity > 0)) continue
    const pkg = catalog.find((p) => p.id === line.packageId)
    if (!pkg || pkg.unitPrice == null || Number.isNaN(pkg.unitPrice)) {
      return null
    }
    const lineTotal = roundMoney(pkg.unitPrice * line.quantity)
    fee += lineTotal
    adjustments.push({
      label: `${pkg.code || pkg.name} × ${line.quantity}`,
      amount: lineTotal,
    })
  }
  return { fee: roundMoney(fee), adjustments }
}

/**
 * fixed  → flatFee (+ km) [+ katalog paket]
 * dynamic → baseFee + birim×miktar (+ km); katalog satırı varsa birim fiyat katalogdan
 */
function computeFees(
  list: PriceList,
  rule: PriceRule,
  input: QuoteInput
): Omit<QuoteBreakdown, 'adjustments' | 'subtotal' | 'kdvRate' | 'kdvAmount' | 'total'> & {
  catalogAdjustments: QuoteBreakdown['adjustments']
} {
  const distanceFee =
    list.distanceStructure === 'km' ? (rule.perKm ?? 0) * (input.distanceKm ?? 0) : 0

  const catalog = computeCatalogPackageFee(list, input.packageLines)

  if (rule.desiPricing === 'fixed') {
    if (catalog) {
      return {
        baseFee: 0,
        distanceFee,
        desiFee: catalog.fee,
        flatFee: 0,
        catalogAdjustments: catalog.adjustments,
      }
    }
    return {
      baseFee: 0,
      distanceFee,
      desiFee: 0,
      flatFee: rule.flatFee ?? 0,
      catalogAdjustments: [],
    }
  }

  if (catalog) {
    return {
      baseFee: rule.baseFee ?? 0,
      distanceFee,
      desiFee: catalog.fee,
      flatFee: 0,
      catalogAdjustments: catalog.adjustments,
    }
  }

  const quantityFee =
    (list.quantityBasis ?? 'desi') === 'package'
      ? (rule.perPackage ?? 0) * totalPackageCount(input)
      : (rule.perDesi ?? 0) * input.desi

  return {
    baseFee: rule.baseFee ?? 0,
    distanceFee,
    desiFee: quantityFee,
    flatFee: 0,
    catalogAdjustments: [],
  }
}

function ruleQuantityLabel(list: PriceList, rule: PriceRule): string {
  if ((list.quantityBasis ?? 'desi') === 'package') {
    return `${rule.packageStart ?? 0}–${rule.packageEnd ?? '∞'} paket`
  }
  return `${rule.desiStart}–${rule.desiEnd} desi`
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

  const quantityBasis = list.quantityBasis ?? 'desi'

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
      quantityBasis,
      inputs: {
        desi: input.desi,
        packageCount: input.packageCount,
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
      quantityBasis,
      inputs: {
        desi: input.desi,
        packageCount: totalPackageCount(input) || undefined,
        packageLines: input.packageLines,
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

    if (input.packageLines && input.packageLines.some((l) => l.quantity > 0)) {
      const catalogCheck = computeCatalogPackageFee(list, input.packageLines)
      if (!catalogCheck) {
        return {
          ok: false,
          error:
            'Paket satırları için katalog birim fiyatı bulunamadı. Fiyat listesinde paket tanımlarını kontrol edin.',
          priceListId: list.id,
          priceListName: list.name,
        }
      }
    }

    const fees = computeFees(list, rule, input)
    const raw = fees.baseFee + fees.distanceFee + fees.desiFee + fees.flatFee
    const { value: subtotal, adjustments: minMaxAdj } = applyMinMax(raw, rule)
    const adjustments = [...fees.catalogAdjustments, ...minMaxAdj]
    const includeKdv = input.includeKdv !== false
    const kdvRate = includeKdv ? (input.kdvRate ?? 20) : 0
    const kdvAmount = includeKdv ? roundMoney(subtotal * (kdvRate / 100)) : 0

    return {
      ok: true,
      priceListId: list.id,
      priceListName: list.name,
      matchedRuleId: rule.id,
      matchedRuleLabel: rule.name || ruleQuantityLabel(list, rule),
      pricingMode: rule.pricingMode,
      distanceStructure: list.distanceStructure,
      quantityBasis,
      inputs: {
        desi: input.desi,
        packageCount: totalPackageCount(input) || undefined,
        packageLines: input.packageLines,
        distanceKm: input.distanceKm,
        originCityId: input.origin.cityId,
        originDistrictId: input.origin.districtId,
        destCityId: input.destination.cityId,
        destDistrictId: input.destination.districtId,
        zoneName,
      },
      breakdown: {
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
