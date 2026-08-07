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

/** Select seçenekleri (OD satırları). */
export const SEED_DISTRICTS = [
  { ...SEED_GEO.istanbul, ...SEED_GEO.atasehir },
  { ...SEED_GEO.istanbul, ...SEED_GEO.tuzla },
  { ...SEED_GEO.istanbul, ...SEED_GEO.pendik },
  { ...SEED_GEO.istanbul, ...SEED_GEO.kartal },
  { ...SEED_GEO.istanbul, ...SEED_GEO.maltepe },
  { ...SEED_GEO.istanbul, ...SEED_GEO.kadikoy },
] as const

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
      id: 'pl_km_default',
      code: 'KM-GENEL',
      name: 'Km Genel Tarifesi',
      isDefault: true,
      status: 'active',
      currency: 'TRY',
      distanceStructure: 'km',
      createdAt: now,
      updatedAt: now,
      createdBy: 'sistem',
      rules: [
        {
          id: 'rule_km_1_5',
          priceListId: 'pl_km_default',
          name: '1–5 desi',
          priority: 100,
          status: 'active',
          pricingMode: 'base_plus_km',
          desiPricing: 'fixed',
          desiStart: 1,
          desiEnd: 5,
          flatFee: 70,
          perKm: 4.5,
        },
        {
          id: 'rule_km_6_plus',
          priceListId: 'pl_km_default',
          name: '6+ desi dinamik',
          priority: 80,
          status: 'active',
          pricingMode: 'base_plus_km',
          desiPricing: 'dynamic',
          desiStart: 6,
          desiEnd: 99,
          baseFee: 50,
          perDesi: 12,
          perKm: 4.5,
        },
      ],
    },
    {
      id: 'pl_od',
      code: 'OD-ASYA',
      name: 'Çıkış–Varış Asya',
      isDefault: false,
      status: 'active',
      currency: 'TRY',
      distanceStructure: 'od',
      createdAt: now,
      updatedAt: now,
      createdBy: 'sistem',
      rules: [
        {
          id: 'rule_od_ata_tuzla',
          priceListId: 'pl_od',
          name: 'Ataşehir → Tuzla · 1–5',
          priority: 100,
          status: 'active',
          pricingMode: 'od_district',
          desiPricing: 'fixed',
          desiStart: 1,
          desiEnd: 5,
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
          id: 'rule_od_kad_mal',
          priceListId: 'pl_od',
          name: 'Kadıköy → Maltepe · dinamik',
          priority: 90,
          status: 'active',
          pricingMode: 'od_district',
          desiPricing: 'dynamic',
          desiStart: 1,
          desiEnd: 20,
          baseFee: 40,
          perDesi: 10,
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
      ],
    },
    {
      id: 'pl_zone',
      code: 'BOLGE-ASYA',
      name: 'Varış Bölge Tarifesi',
      isDefault: false,
      status: 'active',
      currency: 'TRY',
      distanceStructure: 'zone',
      createdAt: now,
      updatedAt: now,
      createdBy: 'sistem',
      rules: [
        {
          id: 'rule_zone_dogu',
          priceListId: 'pl_zone',
          name: 'Doğu · 1–5 sabit',
          priority: 100,
          status: 'active',
          pricingMode: 'zone_flat',
          desiPricing: 'fixed',
          desiStart: 1,
          desiEnd: 5,
          flatFee: 160,
          zoneId: 'zone_asya_dogu',
        },
        {
          id: 'rule_zone_orta',
          priceListId: 'pl_zone',
          name: 'Orta · dinamik',
          priority: 90,
          status: 'active',
          pricingMode: 'zone_flat',
          desiPricing: 'dynamic',
          desiStart: 1,
          desiEnd: 15,
          baseFee: 80,
          perDesi: 8,
          zoneId: 'zone_asya_orta',
        },
      ],
    },
  ]
}

export function buildSeedAssignments(): CustomerPricingAssignment[] {
  return [
    {
      customerId: 'seed-customer-premium',
      priceListId: 'pl_od',
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
      priceListId: 'pl_od',
      priceListName: 'Çıkış–Varış Asya',
      matchedRuleId: 'rule_od_ata_tuzla',
      matchedRuleLabel: 'Ataşehir → Tuzla · 1–5',
      pricingMode: 'od_district',
      inputs: { desi: 3, destDistrict: 'Tuzla', originDistrict: 'Ataşehir' },
      breakdown: {
        baseFee: 0,
        distanceFee: 0,
        desiFee: 0,
        flatFee: 185,
        adjustments: [],
        subtotal: 185,
        kdvRate: 20,
        kdvAmount: 37,
        total: 222,
      },
      currency: 'TRY',
      calculatedAt: now,
    },
  }
}
