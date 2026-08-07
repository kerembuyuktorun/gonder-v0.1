import type {
  CollectionEntry,
  CustomerPaymentTerms,
  CustomerPricingAssignment,
  OrderPayment,
  OrderPricingSnapshot,
  PriceList,
  PriceZone,
} from '../_types'

/** İstanbul seed geo id'leri (mock; gerçek geography API'den bağımsız). */
export const SEED_GEO = {
  istanbul: { cityId: '34', cityName: 'İstanbul' },
  atasehir: { districtId: '34-atasehir', districtName: 'Ataşehir' },
  tuzla: { districtId: '34-tuzla', districtName: 'Tuzla' },
  pendik: { districtId: '34-pendik', districtName: 'Pendik' },
  kartal: { districtId: '34-kartal', districtName: 'Kartal' },
  maltepe: { districtId: '34-maltepe', districtName: 'Maltepe' },
  kadikoy: { districtId: '34-kadikoy', districtName: 'Kadıköy' },
} as const

const now = '2026-08-07T10:00:00.000Z'

export function buildSeedZones(): PriceZone[] {
  return [
    {
      id: 'zone_asya_dogu',
      name: 'Anadolu Doğu (Tuzla + Pendik)',
      code: 'ASYA-D',
      scopes: [
        {
          cityId: SEED_GEO.istanbul.cityId,
          cityName: SEED_GEO.istanbul.cityName,
          districtIds: [SEED_GEO.tuzla.districtId, SEED_GEO.pendik.districtId],
          districtNames: [SEED_GEO.tuzla.districtName, SEED_GEO.pendik.districtName],
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'zone_asya_orta',
      name: 'Anadolu Orta (Kartal + Maltepe)',
      code: 'ASYA-O',
      scopes: [
        {
          cityId: SEED_GEO.istanbul.cityId,
          cityName: SEED_GEO.istanbul.cityName,
          districtIds: [SEED_GEO.kartal.districtId, SEED_GEO.maltepe.districtId],
          districtNames: [SEED_GEO.kartal.districtName, SEED_GEO.maltepe.districtName],
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ]
}

export function buildSeedPriceLists(): PriceList[] {
  return [
    {
      id: 'pl_default',
      code: 'GENEL-2026',
      name: 'Genel Last Mile Tarifesi',
      description: 'Tenant varsayılan fiyat listesi — km, desi ve bölge kuralları.',
      isDefault: true,
      status: 'active',
      currency: 'TRY',
      validFrom: '2026-01-01',
      createdAt: now,
      updatedAt: now,
      createdBy: 'sistem',
      rules: [
        {
          id: 'rule_od_ata_tuzla',
          priceListId: 'pl_default',
          name: 'Ataşehir → Tuzla',
          priority: 100,
          status: 'active',
          pricingMode: 'od_district',
          flatFee: 185,
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
          id: 'rule_zone_dogu',
          priceListId: 'pl_default',
          name: 'Doğu bölge paketi',
          priority: 80,
          status: 'active',
          pricingMode: 'zone_flat',
          flatFee: 160,
          zoneId: 'zone_asya_dogu',
        },
        {
          id: 'rule_desi_band',
          priceListId: 'pl_default',
          name: '1–5 desi sabit',
          priority: 60,
          status: 'active',
          pricingMode: 'desi_band_fixed',
          flatFee: 95,
          desiStart: 1,
          desiEnd: 5,
        },
        {
          id: 'rule_desi_dyn',
          priceListId: 'pl_default',
          name: 'Desi dinamik (genel)',
          priority: 40,
          status: 'active',
          pricingMode: 'desi_dynamic',
          baseFee: 50,
          perDesi: 12,
          minFee: 75,
        },
        {
          id: 'rule_km',
          priceListId: 'pl_default',
          name: 'Başlangıç + km',
          priority: 20,
          status: 'active',
          pricingMode: 'base_plus_km',
          baseFee: 70,
          perKm: 4.5,
          minFee: 90,
        },
      ],
    },
    {
      id: 'pl_premium',
      code: 'OZEL-PREMIUM',
      name: 'Premium Müşteri Tarifesi',
      description: 'Seçili kurumsal müşteriler için özel ücretlendirme.',
      isDefault: false,
      status: 'active',
      currency: 'TRY',
      validFrom: '2026-03-01',
      createdAt: now,
      updatedAt: now,
      createdBy: 'sistem',
      rules: [
        {
          id: 'rule_prem_zone_orta',
          priceListId: 'pl_premium',
          name: 'Orta bölge paketi',
          priority: 90,
          status: 'active',
          pricingMode: 'zone_flat',
          flatFee: 140,
          zoneId: 'zone_asya_orta',
        },
        {
          id: 'rule_prem_od',
          priceListId: 'pl_premium',
          name: 'Kadıköy → Maltepe',
          priority: 100,
          status: 'active',
          pricingMode: 'od_district',
          flatFee: 120,
          origin: {
            cityId: SEED_GEO.istanbul.cityId,
            cityName: SEED_GEO.istanbul.cityName,
            districtId: SEED_GEO.kadikoy.districtId,
            districtName: SEED_GEO.kadikoy.districtName,
          },
          destination: {
            cityId: SEED_GEO.istanbul.cityId,
            cityName: SEED_GEO.istanbul.cityName,
            districtId: SEED_GEO.maltepe.districtId,
            districtName: SEED_GEO.maltepe.districtName,
          },
        },
        {
          id: 'rule_prem_desi',
          priceListId: 'pl_premium',
          name: 'Desi dinamik premium',
          priority: 50,
          status: 'active',
          pricingMode: 'desi_dynamic',
          baseFee: 40,
          perDesi: 10,
        },
      ],
    },
  ]
}

/** Seed müşteri id'leri — gerçek listedeki id'lerle eşleşmeyebilir; UI atama serbest. */
export function buildSeedAssignments(): CustomerPricingAssignment[] {
  return [
    {
      customerId: 'seed-customer-premium',
      priceListId: 'pl_premium',
      effectiveFrom: '2026-03-01',
      updatedAt: now,
    },
  ]
}

export function buildSeedPaymentTerms(): CustomerPaymentTerms[] {
  return [
    {
      customerId: 'seed-customer-premium',
      settlementType: 'vadeli',
      creditDays: 30,
      billingCycle: 'per_order',
      notes: 'Kurumsal 30 gün vade',
      updatedAt: now,
    },
    {
      customerId: 'seed-customer-cash',
      settlementType: 'pesin',
      creditDays: 0,
      billingCycle: 'per_order',
      updatedAt: now,
    },
  ]
}

export function buildSeedOrderPayments(): OrderPayment[] {
  return [
    {
      orderId: 'seed-order-1',
      customerId: 'seed-customer-premium',
      customerName: 'Premium Müşteri (Seed)',
      settlementType: 'vadeli',
      creditDays: 30,
      dueDate: '2026-07-15',
      collectionStatus: 'gecikti',
      amountDue: 222,
      amountPaid: 0,
      orderDate: '2026-06-15',
      updatedAt: now,
    },
    {
      orderId: 'seed-order-2',
      customerId: 'seed-customer-premium',
      customerName: 'Premium Müşteri (Seed)',
      settlementType: 'vadeli',
      creditDays: 30,
      dueDate: '2026-09-01',
      collectionStatus: 'bekliyor',
      amountDue: 168,
      amountPaid: 0,
      orderDate: '2026-08-02',
      updatedAt: now,
    },
    {
      orderId: 'seed-order-3',
      customerId: 'seed-customer-cash',
      customerName: 'Peşin Müşteri (Seed)',
      settlementType: 'pesin',
      creditDays: 0,
      dueDate: '2026-08-05',
      collectionStatus: 'tahsil_edildi',
      amountDue: 114,
      amountPaid: 114,
      paymentMethod: 'havale',
      orderDate: '2026-08-05',
      updatedAt: now,
    },
  ]
}

export function buildSeedCollections(): CollectionEntry[] {
  return [
    {
      id: 'col_1',
      customerId: 'seed-customer-cash',
      customerName: 'Peşin Müşteri (Seed)',
      orderId: 'seed-order-3',
      amount: 114,
      method: 'havale',
      paidAt: '2026-08-05',
      note: 'Sipariş anında tahsilat',
      createdBy: 'sistem',
      createdAt: now,
    },
  ]
}

export function buildSeedOrderSnapshots(): Record<string, OrderPricingSnapshot> {
  return {
    'seed-order-1': {
      priceListId: 'pl_premium',
      priceListName: 'Premium Müşteri Tarifesi',
      matchedRuleId: 'rule_prem_zone_orta',
      matchedRuleLabel: 'Orta bölge paketi',
      pricingMode: 'zone_flat',
      inputs: { desi: 3, zoneName: 'Anadolu Orta (Kartal + Maltepe)', destDistrict: 'Maltepe' },
      breakdown: {
        baseFee: 0,
        distanceFee: 0,
        desiFee: 0,
        flatFee: 140,
        adjustments: [],
        subtotal: 140,
        kdvRate: 20,
        kdvAmount: 28,
        total: 168,
      },
      currency: 'TRY',
      calculatedAt: now,
    },
  }
}
