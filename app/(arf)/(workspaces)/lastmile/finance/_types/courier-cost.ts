/** Last Mile kurye/tedarikçi maliyet fiyatlandırması (mock → BE taşınabilir). */

import type { GeoPointRef, PriceListStatus } from './pricing'

export type CompensationModel = 'tariff' | 'salary_plus_bonus' | 'hybrid'

export type CourierCostPricingMode =
  | 'base_plus_km'
  | 'od_district'
  | 'zone_flat'
  | 'desi_band_fixed'
  | 'desi_dynamic'
  | 'package_fee'
  | 'hourly_shift'
  | 'salary_bonus_package'
  | 'salary_bonus_km'

export type CourierCostRule = {
  id: string
  costListId: string
  name?: string
  priority: number
  status: PriceListStatus
  pricingMode: CourierCostPricingMode
  baseFee?: number
  perKm?: number
  perDesi?: number
  perHour?: number
  perPackage?: number
  flatFee?: number
  desiStart?: number
  desiEnd?: number
  origin?: GeoPointRef
  destination?: GeoPointRef
  zoneId?: string
  minFee?: number
  maxFee?: number
  notes?: string
}

export type CourierCostList = {
  id: string
  code: string
  name: string
  description?: string
  isDefault: boolean
  status: PriceListStatus
  currency: 'TRY'
  compensationModel: CompensationModel
  fixedSalaryMonthly?: number
  validFrom?: string
  validTo?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  rules: CourierCostRule[]
}

export type CourierCostAssignment = {
  courierId: string
  costListId: string
  effectiveFrom?: string
  effectiveTo?: string
  updatedAt: string
}

/** İstihdam tipine göre varsayılan maliyet listesi */
export type EmploymentTypeCostDefault = {
  employmentType: 'sirket' | 'esnaf'
  costListId: string
  updatedAt: string
}

export type PayoutCycle =
  | 'per_delivery'
  | 'weekly'
  | 'monthly'
  | 'monthly_fixed_day'

export type CourierPayoutTerms = {
  courierId: string
  payoutCycle: PayoutCycle
  /** 1=Pzt … 7=Paz */
  weeklyPayoutDay?: number
  /** Ayın 1–28. günü */
  monthlyPayoutDay?: number
  creditDays?: number
  notes?: string
  updatedAt: string
}

export type PayoutStatus = 'bekliyor' | 'kismi' | 'odendi' | 'gecikti'

export type PayoutMethod = 'havale' | 'nakit' | 'diger'

export type CourierCostQuoteInput = {
  courierId?: string
  costListId?: string
  origin: { cityId: string; districtId?: string }
  destination: { cityId: string; districtId?: string }
  desi: number
  distanceKm?: number
  packageCount?: number
  workedHours?: number
  orderDate?: string
  manualSubtotalOverride?: number
}

export type CourierCostQuoteAdjustment = {
  label: string
  amount: number
}

export type CourierCostBreakdown = {
  baseFee: number
  distanceFee: number
  desiFee: number
  packageFee: number
  hourlyFee: number
  flatFee: number
  salaryPortion: number
  bonusPortion: number
  adjustments: CourierCostQuoteAdjustment[]
  subtotal: number
  total: number
}

export type CourierCostQuoteResult =
  | {
      ok: true
      costListId: string
      costListName: string
      compensationModel: CompensationModel
      matchedRuleId: string
      matchedRuleLabel: string
      pricingMode: CourierCostPricingMode
      inputs: {
        distanceKm?: number
        desi: number
        packageCount?: number
        workedHours?: number
        originCityId: string
        originDistrictId?: string
        destCityId: string
        destDistrictId?: string
        zoneName?: string
        fixedSalaryMonthly?: number
      }
      breakdown: CourierCostBreakdown
      currency: 'TRY'
      calculatedAt: string
    }
  | {
      ok: false
      error: string
      costListId?: string
      costListName?: string
    }

export type CourierEarningsSnapshot = {
  id: string
  orderId?: string
  routeId?: string
  courierId: string
  courierName?: string
  costListId: string
  costListName: string
  matchedRuleId: string
  matchedRuleLabel: string
  pricingMode: CourierCostPricingMode
  breakdown: CourierCostBreakdown
  currency: 'TRY'
  calculatedAt: string
  manualOverride?: boolean
  earnedAt: string
}

export type CourierPayoutLedger = {
  id: string
  courierId: string
  courierName?: string
  earningsIds: string[]
  amountDue: number
  amountPaid: number
  payoutStatus: PayoutStatus
  dueDate?: string
  paidAt?: string
  method?: PayoutMethod
  note?: string
  createdAt: string
  updatedAt: string
}

export type PayoutEntry = {
  id: string
  courierId: string
  courierName?: string
  ledgerId?: string
  amount: number
  method: PayoutMethod
  paidAt: string
  note?: string
  createdBy?: string
  createdAt: string
}

export type CourierPayoutSummary = {
  courierId: string
  openBalance: number
  totalPaid: number
  overdueCount: number
  lastPayoutAt?: string
  assignedCostListId?: string
  assignedCostListName?: string
  payoutTerms?: CourierPayoutTerms
}

export type CourierPayoutsKpi = {
  toPay: number
  paid: number
  overdue: number
  openLedgerCount: number
}

export const COMPENSATION_MODEL_LABELS: Record<CompensationModel, string> = {
  tariff: 'Tarife',
  salary_plus_bonus: 'Maaş + Prim',
  hybrid: 'Hibrit',
}

export const COURIER_COST_MODE_LABELS: Record<CourierCostPricingMode, string> = {
  base_plus_km: 'Başlangıç + Km',
  od_district: 'Çıkış → Varış (İl/İlçe)',
  zone_flat: 'Bölge Paketi',
  desi_band_fixed: 'Desi Bant (Sabit)',
  desi_dynamic: 'Desi Dinamik',
  package_fee: 'Paket Ücreti',
  hourly_shift: 'Saatlik Çalışma',
  salary_bonus_package: 'Maaş Primi (Paket)',
  salary_bonus_km: 'Maaş Primi (Km)',
}

export const PAYOUT_CYCLE_LABELS: Record<PayoutCycle, string> = {
  per_delivery: 'Teslimat Başı',
  weekly: 'Haftalık',
  monthly: 'Aylık',
  monthly_fixed_day: 'Ayın Sabit Günü',
}

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  bekliyor: 'Bekliyor',
  kismi: 'Kısmi',
  odendi: 'Ödendi',
  gecikti: 'Gecikti',
}

export const PAYOUT_METHOD_LABELS: Record<PayoutMethod, string> = {
  havale: 'Havale',
  nakit: 'Nakit',
  diger: 'Diğer',
}

export const WEEKDAY_LABELS: Record<number, string> = {
  1: 'Pazartesi',
  2: 'Salı',
  3: 'Çarşamba',
  4: 'Perşembe',
  5: 'Cuma',
  6: 'Cumartesi',
  7: 'Pazar',
}
