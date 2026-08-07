import { SEED_GEO } from './seed'
import type {
  CourierCostAssignment,
  CourierCostList,
  CourierEarningsSnapshot,
  CourierPayoutLedger,
  CourierPayoutTerms,
  EmploymentTypeCostDefault,
  PayoutEntry,
} from '../_types'

const now = '2026-08-07T10:00:00.000Z'

export function buildSeedCourierCostLists(): CourierCostList[] {
  return [
    {
      id: 'ccl_km_default',
      code: 'KURYE-KM-2026',
      name: 'Kurye Km Tarifesi',
      description: 'Varsayılan tarife — başlangıç + km ve paket ücreti.',
      isDefault: true,
      status: 'active',
      currency: 'TRY',
      compensationModel: 'tariff',
      validFrom: '2026-01-01',
      createdAt: now,
      updatedAt: now,
      createdBy: 'sistem',
      rules: [
        {
          id: 'ccr_km',
          costListId: 'ccl_km_default',
          name: 'Başlangıç + km',
          priority: 40,
          status: 'active',
          pricingMode: 'base_plus_km',
          baseFee: 55,
          perKm: 3.25,
          minFee: 70,
        },
        {
          id: 'ccr_pkg',
          costListId: 'ccl_km_default',
          name: 'Paket ücreti',
          priority: 60,
          status: 'active',
          pricingMode: 'package_fee',
          perPackage: 18,
        },
        {
          id: 'ccr_hourly',
          costListId: 'ccl_km_default',
          name: 'Saatlik vardiya',
          priority: 20,
          status: 'active',
          pricingMode: 'hourly_shift',
          perHour: 95,
        },
      ],
    },
    {
      id: 'ccl_desi_zone',
      code: 'KURYE-BOLGE-DESI',
      name: 'Bölge & Desi Maliyet',
      description: 'Çıkış-varış ve desi bantlarına göre maliyet.',
      isDefault: false,
      status: 'active',
      currency: 'TRY',
      compensationModel: 'tariff',
      validFrom: '2026-02-01',
      createdAt: now,
      updatedAt: now,
      createdBy: 'sistem',
      rules: [
        {
          id: 'ccr_od',
          costListId: 'ccl_desi_zone',
          name: 'Ataşehir → Tuzla',
          priority: 100,
          status: 'active',
          pricingMode: 'od_district',
          flatFee: 95,
          origin: {
            cityId: SEED_GEO.istanbul.cityId,
            cityName: SEED_GEO.istanbul.cityName,
            districtId: SEED_GEO.atasehir.districtId,
            districtName: SEED_GEO.atasehir.districtName,
          },
          destination: {
            cityId: SEED_GEO.istanbul.cityId,
            cityName: SEED_GEO.istanbul.cityName,
            districtId: SEED_GEO.tuzla.districtId,
            districtName: SEED_GEO.tuzla.districtName,
          },
        },
        {
          id: 'ccr_zone',
          costListId: 'ccl_desi_zone',
          name: 'Doğu bölge paketi',
          priority: 80,
          status: 'active',
          pricingMode: 'zone_flat',
          flatFee: 85,
          zoneId: 'zone_asya_dogu',
        },
        {
          id: 'ccr_desi_band',
          costListId: 'ccl_desi_zone',
          name: '1–5 desi sabit',
          priority: 60,
          status: 'active',
          pricingMode: 'desi_band_fixed',
          flatFee: 55,
          desiStart: 1,
          desiEnd: 5,
        },
        {
          id: 'ccr_desi_dyn',
          costListId: 'ccl_desi_zone',
          name: 'Desi dinamik',
          priority: 40,
          status: 'active',
          pricingMode: 'desi_dynamic',
          baseFee: 30,
          perDesi: 8,
          minFee: 45,
        },
      ],
    },
    {
      id: 'ccl_salary_bonus',
      code: 'KURYE-MAAS-PRIM',
      name: 'Maaş + Paket Primi',
      description: 'Sabit aylık maaş + paket/km primleri.',
      isDefault: false,
      status: 'active',
      currency: 'TRY',
      compensationModel: 'salary_plus_bonus',
      fixedSalaryMonthly: 28500,
      validFrom: '2026-01-01',
      createdAt: now,
      updatedAt: now,
      createdBy: 'sistem',
      rules: [
        {
          id: 'ccr_bonus_pkg',
          costListId: 'ccl_salary_bonus',
          name: 'Paket primi',
          priority: 80,
          status: 'active',
          pricingMode: 'salary_bonus_package',
          perPackage: 12,
        },
        {
          id: 'ccr_bonus_km',
          costListId: 'ccl_salary_bonus',
          name: 'Km primi',
          priority: 60,
          status: 'active',
          pricingMode: 'salary_bonus_km',
          perKm: 1.5,
        },
      ],
    },
  ]
}

export function buildSeedCourierCostAssignments(): CourierCostAssignment[] {
  return [
    {
      courierId: 'seed-courier-1',
      costListId: 'ccl_km_default',
      effectiveFrom: '2026-01-01',
      updatedAt: now,
    },
    {
      courierId: 'seed-courier-2',
      costListId: 'ccl_salary_bonus',
      effectiveFrom: '2026-03-01',
      updatedAt: now,
    },
  ]
}

export function buildSeedEmploymentDefaults(): EmploymentTypeCostDefault[] {
  return [
    {
      employmentType: 'esnaf',
      costListId: 'ccl_km_default',
      updatedAt: now,
    },
    {
      employmentType: 'sirket',
      costListId: 'ccl_salary_bonus',
      updatedAt: now,
    },
  ]
}

export function buildSeedCourierPayoutTerms(): CourierPayoutTerms[] {
  return [
    {
      courierId: 'seed-courier-1',
      payoutCycle: 'weekly',
      weeklyPayoutDay: 5,
      creditDays: 0,
      notes: 'Her Cuma hakediş ödemesi',
      updatedAt: now,
    },
    {
      courierId: 'seed-courier-2',
      payoutCycle: 'monthly_fixed_day',
      monthlyPayoutDay: 5,
      creditDays: 3,
      notes: 'Her ayın 5. günü + 3 gün vade',
      updatedAt: now,
    },
  ]
}

export function buildSeedCourierEarnings(): CourierEarningsSnapshot[] {
  return [
    {
      id: 'earn_1',
      orderId: 'seed-order-lm-1',
      courierId: 'seed-courier-1',
      courierName: 'Ahmet Kurye (Seed)',
      costListId: 'ccl_km_default',
      costListName: 'Kurye Km Tarifesi',
      matchedRuleId: 'ccr_pkg',
      matchedRuleLabel: 'Paket ücreti',
      pricingMode: 'package_fee',
      breakdown: {
        baseFee: 0,
        distanceFee: 0,
        desiFee: 0,
        packageFee: 36,
        hourlyFee: 0,
        flatFee: 0,
        salaryPortion: 0,
        bonusPortion: 0,
        adjustments: [],
        subtotal: 36,
        total: 36,
      },
      currency: 'TRY',
      calculatedAt: now,
      earnedAt: '2026-08-04',
    },
    {
      id: 'earn_2',
      orderId: 'seed-order-lm-2',
      courierId: 'seed-courier-1',
      courierName: 'Ahmet Kurye (Seed)',
      costListId: 'ccl_km_default',
      costListName: 'Kurye Km Tarifesi',
      matchedRuleId: 'ccr_km',
      matchedRuleLabel: 'Başlangıç + km',
      pricingMode: 'base_plus_km',
      breakdown: {
        baseFee: 55,
        distanceFee: 58.5,
        desiFee: 0,
        packageFee: 0,
        hourlyFee: 0,
        flatFee: 0,
        salaryPortion: 0,
        bonusPortion: 0,
        adjustments: [],
        subtotal: 113.5,
        total: 113.5,
      },
      currency: 'TRY',
      calculatedAt: now,
      earnedAt: '2026-08-05',
    },
    {
      id: 'earn_3',
      orderId: 'seed-order-lm-3',
      courierId: 'seed-courier-2',
      courierName: 'Ayşe Şirket (Seed)',
      costListId: 'ccl_salary_bonus',
      costListName: 'Maaş + Paket Primi',
      matchedRuleId: 'ccr_bonus_pkg',
      matchedRuleLabel: 'Paket primi',
      pricingMode: 'salary_bonus_package',
      breakdown: {
        baseFee: 0,
        distanceFee: 0,
        desiFee: 0,
        packageFee: 0,
        hourlyFee: 0,
        flatFee: 0,
        salaryPortion: 0,
        bonusPortion: 48,
        adjustments: [],
        subtotal: 48,
        total: 48,
      },
      currency: 'TRY',
      calculatedAt: now,
      earnedAt: '2026-08-03',
    },
  ]
}

export function buildSeedCourierPayoutLedgers(): CourierPayoutLedger[] {
  return [
    {
      id: 'led_1',
      courierId: 'seed-courier-1',
      courierName: 'Ahmet Kurye (Seed)',
      earningsIds: ['earn_1', 'earn_2'],
      amountDue: 149.5,
      amountPaid: 0,
      payoutStatus: 'bekliyor',
      dueDate: '2026-08-08',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'led_2',
      courierId: 'seed-courier-2',
      courierName: 'Ayşe Şirket (Seed)',
      earningsIds: ['earn_3'],
      amountDue: 48,
      amountPaid: 48,
      payoutStatus: 'odendi',
      dueDate: '2026-08-08',
      paidAt: '2026-08-06',
      method: 'havale',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'led_3',
      courierId: 'seed-courier-2',
      courierName: 'Ayşe Şirket (Seed)',
      earningsIds: [],
      amountDue: 28500,
      amountPaid: 0,
      payoutStatus: 'gecikti',
      dueDate: '2026-07-08',
      note: 'Temmuz maaş hakedişi',
      createdAt: now,
      updatedAt: now,
    },
  ]
}

export function buildSeedPayoutEntries(): PayoutEntry[] {
  return [
    {
      id: 'pay_1',
      courierId: 'seed-courier-2',
      courierName: 'Ayşe Şirket (Seed)',
      ledgerId: 'led_2',
      amount: 48,
      method: 'havale',
      paidAt: '2026-08-06',
      note: 'Paket primi ödemesi',
      createdBy: 'sistem',
      createdAt: now,
    },
  ]
}
