import {
  SHIPMENT_VIEW_STATUSES,
  type GonderShipmentDetail,
  type GonderShipmentListItem,
  type OperationType,
  type ShipmentDocument,
  type ShipmentHistoryEvent,
  type ShipmentIssue,
  type ShipmentListStatus,
  type ShipmentOperationTab,
  type ShipmentPackage,
  type ShipmentTrackingEvent,
  type ShipmentView,
} from '../_types/shipments'

export type ShipmentsListQuery = {
  /** İkincil: durum görünümü */
  view?: ShipmentView
  status?: ShipmentListStatus | null
  /** Birincil: operasyon tipi (all = filtre yok) */
  operation?: ShipmentOperationTab | null
  search?: string
  carrier?: string | null
  logisticsMode?: 'ftl' | 'ltl' | 'spot' | null
}

export type ShipmentsListResult = {
  items: GonderShipmentListItem[]
  total: number
  viewCounts: Record<ShipmentView, number>
  operationCounts: Record<ShipmentOperationTab, number>
}

export interface ShipmentsListRepository {
  list(query?: ShipmentsListQuery): Promise<ShipmentsListResult>
  getById(id: string): Promise<GonderShipmentListItem | null>
  getDetail(id: string): Promise<GonderShipmentDetail | null>
  updateStatus(id: string, status: ShipmentListStatus): Promise<GonderShipmentListItem>
  create(
    input: Omit<GonderShipmentListItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<GonderShipmentListItem>
}

const seed: GonderShipmentListItem[] = [
  {
    id: 'sh-1001',
    reference: 'GND-1001',
    orderNumber: 'ORD-10023',
    carrier: 'ARF Parcel',
    serviceLabel: 'Express',
    serviceType: 'parcel',
    operationType: 'parcel',
    logisticsMode: null,
    originCity: 'İstanbul',
    destinationCity: 'Ankara',
    status: 'in_transit',
    desi: 8,
    weightKg: 4.2,
    amountTry: 189,
    createdAt: '2026-08-06T10:00:00.000Z',
    updatedAt: '2026-08-07T09:12:00.000Z',
  },
  {
    id: 'sh-1002',
    reference: 'GND-1002',
    orderNumber: 'ORD-10041',
    carrier: 'Hızlı Kurye',
    serviceLabel: 'Aynı Gün',
    serviceType: 'courier',
    operationType: 'courier',
    logisticsMode: null,
    originCity: 'İzmir',
    destinationCity: 'Bursa',
    status: 'label_ready',
    desi: 3,
    weightKg: 1.5,
    amountTry: 95,
    createdAt: '2026-08-07T08:20:00.000Z',
    updatedAt: '2026-08-07T08:40:00.000Z',
  },
  {
    id: 'sh-1003',
    reference: 'GND-1003',
    orderNumber: 'ORD-9981',
    carrier: 'ARF Parcel',
    serviceLabel: 'Standart',
    serviceType: 'parcel',
    operationType: 'parcel',
    logisticsMode: null,
    originCity: 'Ankara',
    destinationCity: 'Antalya',
    status: 'out_for_delivery',
    desi: 12,
    weightKg: 7.1,
    amountTry: 240,
    createdAt: '2026-08-05T12:00:00.000Z',
    updatedAt: '2026-08-07T07:55:00.000Z',
  },
  {
    id: 'sh-1004',
    reference: 'GND-1004',
    orderNumber: 'ORD-10055',
    carrier: 'Express Lojistik',
    serviceLabel: 'LTL Ekonomik',
    serviceType: 'ltl',
    operationType: 'logistics',
    logisticsMode: 'ltl',
    originCity: 'İstanbul',
    destinationCity: 'Gaziantep',
    status: 'exception',
    desi: 18,
    weightKg: 11,
    amountTry: 310,
    createdAt: '2026-08-04T15:30:00.000Z',
    updatedAt: '2026-08-06T18:10:00.000Z',
  },
  {
    id: 'sh-1005',
    reference: 'GND-1005',
    orderNumber: 'ORD-10060',
    carrier: 'ARF Parcel',
    serviceLabel: 'Express',
    serviceType: 'parcel',
    operationType: 'parcel',
    logisticsMode: null,
    originCity: 'Kocaeli',
    destinationCity: 'İstanbul',
    status: 'delivered',
    desi: 5,
    weightKg: 2.4,
    amountTry: 120,
    createdAt: '2026-08-02T09:00:00.000Z',
    updatedAt: '2026-08-03T16:20:00.000Z',
  },
  {
    id: 'sh-1006',
    reference: 'GND-1006',
    orderNumber: null,
    carrier: 'ARF XL',
    serviceLabel: 'XL Standart',
    serviceType: 'xl',
    operationType: 'parcel',
    logisticsMode: null,
    originCity: 'Adana',
    destinationCity: 'Mersin',
    status: 'picked_up',
    desi: 9,
    weightKg: 5,
    amountTry: 160,
    createdAt: '2026-08-07T06:45:00.000Z',
    updatedAt: '2026-08-07T10:05:00.000Z',
  },
  {
    id: 'sh-1007',
    reference: 'GND-1007',
    orderNumber: 'ORD-10080',
    carrier: 'Hızlı Kurye',
    serviceLabel: 'Express',
    serviceType: 'courier',
    operationType: 'courier',
    logisticsMode: null,
    originCity: 'İstanbul',
    destinationCity: 'Samsun',
    status: 'cancelled',
    desi: 4,
    weightKg: 1.8,
    amountTry: null,
    createdAt: '2026-08-03T11:20:00.000Z',
    updatedAt: '2026-08-03T13:00:00.000Z',
  },
  {
    id: 'sh-1008',
    reference: 'GND-1008',
    orderNumber: 'ORD-10102',
    carrier: 'ARF Fleet',
    serviceLabel: 'FTL Komple',
    serviceType: 'ftl',
    operationType: 'logistics',
    logisticsMode: 'ftl',
    originCity: 'Bursa',
    destinationCity: 'İstanbul',
    status: 'in_transit',
    desi: 120,
    weightKg: 850,
    amountTry: 4200,
    createdAt: '2026-08-06T14:00:00.000Z',
    updatedAt: '2026-08-07T11:20:00.000Z',
  },
  {
    id: 'sh-1009',
    reference: 'GND-1009',
    orderNumber: null,
    carrier: 'Spot Lojistik',
    serviceLabel: 'Spot',
    serviceType: 'spot',
    operationType: 'logistics',
    logisticsMode: 'spot',
    originCity: 'İstanbul',
    destinationCity: 'Eskişehir',
    status: 'label_ready',
    desi: 40,
    weightKg: 220,
    amountTry: 1850,
    createdAt: '2026-08-07T09:00:00.000Z',
    updatedAt: '2026-08-07T09:30:00.000Z',
  },
  {
    id: 'sh-1010',
    reference: 'GND-1010',
    orderNumber: 'ORD-10115',
    carrier: 'Hızlı Kurye',
    serviceLabel: 'Planlı',
    serviceType: 'courier',
    operationType: 'courier',
    logisticsMode: null,
    originCity: 'Ankara',
    destinationCity: 'Konya',
    status: 'delivered',
    desi: 2,
    weightKg: 0.8,
    amountTry: 75,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-02T15:40:00.000Z',
  },
]

/** Sipariş no → sipariş id (mock eşleştirme) */
const ORDER_ID_BY_NUMBER: Record<string, { id: string; customerName: string; statusLabel: string }> =
  {
    'ORD-10023': { id: 'ord-501', customerName: 'Ayşe Yılmaz', statusLabel: 'Onay bekliyor' },
    'ORD-10041': { id: 'ord-502', customerName: 'Mehmet Demir', statusLabel: 'Gönderi bekliyor' },
    'ORD-9981': { id: 'ord-503', customerName: 'Elif Kara', statusLabel: 'İşlemde' },
    'ORD-10055': { id: 'ord-504', customerName: 'Can Öztürk', statusLabel: 'Gönderi oluştu' },
    'ORD-10060': { id: 'ord-505', customerName: 'Zeynep Arslan', statusLabel: 'Tamamlandı' },
    'ORD-10080': { id: 'ord-507', customerName: 'Burak Şahin', statusLabel: 'İptal' },
    'ORD-10102': { id: 'ord-509', customerName: 'Kerem Ural', statusLabel: 'Ödeme bekliyor' },
    'ORD-10115': { id: 'ord-510', customerName: 'Selin Koç', statusLabel: 'Tamamlandı' },
  }

type DetailOverrides = Partial<
  Omit<GonderShipmentDetail, keyof GonderShipmentListItem | 'finance'>
> & {
  finance?: Partial<GonderShipmentDetail['finance']>
}

const detailOverrides: Record<string, DetailOverrides> = {
  'sh-1001': {
    etaLabel: 'Yarın 14:00’e kadar',
    pickupAt: '2026-08-06T14:30:00.000Z',
    pieceCount: 2,
    driver: { name: 'Kemal Yıldız', phone: '0532 111 22 33', carrierCode: 'KY-441' },
    vehicle: { plate: '34 ARF 101', typeLabel: 'Panelvan', capacityLabel: '8 m³' },
    linkedQuote: { id: 'qr-1001', reference: 'TKF-1001', providerName: 'ARF Parcel' },
    readinessSummary: 'Aktarma merkezinde; varış şubesine sevk bekleniyor.',
    packages: [
      pkg('sh-1001', 1, { desi: 5, weightKg: 2.6, status: 'in_transit' }),
      pkg('sh-1001', 2, { desi: 3, weightKg: 1.6, status: 'in_transit' }),
    ],
  },
  'sh-1002': {
    etaLabel: 'Bugün 18:00’e kadar',
    pieceCount: 1,
    readinessSummary: 'Etiket hazır; kurye alma penceresi bekleniyor.',
    packages: [pkg('sh-1002', 1, { desi: 3, weightKg: 1.5, status: 'created' })],
    finance: { paymentStatus: 'pending', paymentMethod: 'Kapıda ödeme' },
  },
  'sh-1003': {
    etaLabel: 'Bugün 20:00’e kadar',
    pickupAt: '2026-08-05T16:00:00.000Z',
    pieceCount: 3,
    driver: { name: 'Emre Kaya', phone: '0533 444 55 66', carrierCode: 'EK-902' },
    vehicle: { plate: '06 ARF 303', typeLabel: 'Motorsiklet', capacityLabel: null },
    readinessSummary: 'Dağıtımda; alıcı adresine yönlendirildi.',
    packages: [
      pkg('sh-1003', 1, { desi: 4, weightKg: 2.4, status: 'out_for_delivery' }),
      pkg('sh-1003', 2, { desi: 5, weightKg: 2.8, status: 'out_for_delivery' }),
      pkg('sh-1003', 3, { desi: 3, weightKg: 1.9, status: 'out_for_delivery' }),
    ],
  },
  'sh-1004': {
    etaLabel: null,
    pickupAt: '2026-08-05T09:00:00.000Z',
    pieceCount: 2,
    driver: { name: 'Hasan Demir', phone: '0535 777 88 99', carrierCode: 'HD-218' },
    vehicle: { plate: '34 LTL 404', typeLabel: 'Kamyonet', capacityLabel: '15 m³' },
    readinessSummary: 'İstisna açık: adreste teslim alınamadı, yeniden planlanacak.',
    issues: [
      {
        id: 'iss-1004-1',
        severity: 'critical',
        title: 'Adreste teslim alınamadı',
        description: 'Alıcı adreste bulunamadı. Yeniden planlama için taşıyıcı bilgilendirildi.',
        openedAt: '2026-08-06T17:40:00.000Z',
        status: 'open',
      },
    ],
    packages: [
      pkg('sh-1004', 1, { desi: 10, weightKg: 6, status: 'exception' }),
      pkg('sh-1004', 2, { desi: 8, weightKg: 5, status: 'exception' }),
    ],
    finance: { paymentStatus: 'invoiced', invoiceNumber: 'FTR-2026-1004' },
  },
  'sh-1005': {
    etaLabel: null,
    pickupAt: '2026-08-02T11:00:00.000Z',
    deliveredAt: '2026-08-03T15:50:00.000Z',
    pieceCount: 1,
    driver: { name: 'Ayhan Çelik', phone: '0536 222 33 44', carrierCode: 'AC-110' },
    vehicle: { plate: '41 ARF 505', typeLabel: 'Panelvan', capacityLabel: '6 m³' },
    readinessSummary: 'Teslim tamamlandı; POD hazır.',
    packages: [pkg('sh-1005', 1, { desi: 5, weightKg: 2.4, status: 'delivered' })],
    finance: {
      paymentStatus: 'paid',
      paymentMethod: 'Hesaptan',
      invoiceNumber: 'FTR-2026-1005',
      chargedAt: '2026-08-03T16:00:00.000Z',
    },
  },
  'sh-1006': {
    etaLabel: 'Yarın 12:00’e kadar',
    pickupAt: '2026-08-07T09:30:00.000Z',
    pieceCount: 1,
    readinessSummary: 'Alındı; çıkış transferi bekleniyor.',
    packages: [pkg('sh-1006', 1, { desi: 9, weightKg: 5, status: 'picked_up' })],
  },
  'sh-1007': {
    readinessSummary: 'Gönderi iptal edildi; operasyon durduruldu.',
    pieceCount: 1,
    packages: [pkg('sh-1007', 1, { desi: 4, weightKg: 1.8, status: 'created' })],
    finance: { paymentStatus: 'na', amountTry: null, note: 'İptal nedeniyle ücretlendirme yok.' },
    documents: [
      {
        id: 'doc-sh-1007-label',
        type: 'label',
        name: 'Gönderi etiketi',
        status: 'missing',
        createdAt: null,
      },
    ],
  },
  'sh-1008': {
    etaLabel: '1–2 iş günü',
    pickupAt: '2026-08-06T18:00:00.000Z',
    pieceCount: 1,
    driver: { name: 'Murat Öz', phone: '0530 999 00 11', carrierCode: 'MO-FTL' },
    vehicle: { plate: '16 FTL 808', typeLabel: 'Tır', capacityLabel: '90 m³' },
    linkedQuote: { id: 'qr-1008', reference: 'TKF-1008', providerName: 'ARF Fleet' },
    readinessSummary: 'FTL seferde; varış deposuna ilerliyor.',
    packages: [
      pkg('sh-1008', 1, {
        desi: 120,
        weightKg: 850,
        status: 'in_transit',
        lengthCm: 240,
        widthCm: 120,
        heightCm: 180,
      }),
    ],
    finance: {
      paymentStatus: 'invoiced',
      invoiceNumber: 'FTR-2026-1008',
      paymentMethod: 'Vadeli',
    },
  },
  'sh-1009': {
    etaLabel: '2 iş günü',
    pieceCount: 4,
    readinessSummary: 'Etiket hazır; spot araç ataması bekleniyor.',
    packages: [
      pkg('sh-1009', 1, { desi: 12, weightKg: 60, status: 'created' }),
      pkg('sh-1009', 2, { desi: 10, weightKg: 55, status: 'created' }),
      pkg('sh-1009', 3, { desi: 10, weightKg: 50, status: 'created' }),
      pkg('sh-1009', 4, { desi: 8, weightKg: 55, status: 'created' }),
    ],
    finance: { paymentStatus: 'pending', paymentMethod: 'Havale' },
  },
  'sh-1010': {
    pickupAt: '2026-08-01T12:00:00.000Z',
    deliveredAt: '2026-08-02T14:30:00.000Z',
    pieceCount: 1,
    driver: { name: 'Seda Ak', phone: '0537 123 45 67', carrierCode: 'SA-77' },
    vehicle: { plate: '06 KRY 010', typeLabel: 'Motorsiklet', capacityLabel: null },
    readinessSummary: 'Teslim tamamlandı.',
    packages: [pkg('sh-1010', 1, { desi: 2, weightKg: 0.8, status: 'delivered' })],
    finance: {
      paymentStatus: 'paid',
      paymentMethod: 'Online',
      invoiceNumber: 'FTR-2026-1010',
      chargedAt: '2026-08-02T15:00:00.000Z',
    },
  },
}

function pkg(
  shipmentId: string,
  index: number,
  partial: Partial<ShipmentPackage> & Pick<ShipmentPackage, 'desi' | 'weightKg' | 'status'>
): ShipmentPackage {
  return {
    id: `${shipmentId}-pkg-${index}`,
    barcode: `${shipmentId.replace('sh-', 'PKG')}-${String(index).padStart(2, '0')}`,
    label: `Parça ${index}`,
    lengthCm: partial.lengthCm ?? 40,
    widthCm: partial.widthCm ?? 30,
    heightCm: partial.heightCm ?? 20,
    ...partial,
  }
}

function matches(item: GonderShipmentListItem, query: ShipmentsListQuery = {}) {
  const view = query.view ?? 'all'
  const statuses = SHIPMENT_VIEW_STATUSES[view]
  if (statuses && !statuses.includes(item.status)) return false
  if (query.status && item.status !== query.status) return false

  const operation = query.operation ?? 'all'
  if (operation !== 'all' && item.operationType !== operation) return false
  if (query.logisticsMode && item.logisticsMode !== query.logisticsMode) return false

  if (query.carrier && item.carrier !== query.carrier) return false
  if (query.search?.trim()) {
    const needle = query.search.trim().toLocaleLowerCase('tr-TR')
    const hay =
      `${item.reference} ${item.orderNumber ?? ''} ${item.carrier} ${item.serviceLabel} ${item.originCity} ${item.destinationCity}`.toLocaleLowerCase(
        'tr-TR'
      )
    if (!hay.includes(needle)) return false
  }
  return true
}

function countViews(items: GonderShipmentListItem[]): Record<ShipmentView, number> {
  return {
    all: items.length,
    active: items.filter((i) => SHIPMENT_VIEW_STATUSES.active!.includes(i.status)).length,
    delivered: items.filter((i) => SHIPMENT_VIEW_STATUSES.delivered!.includes(i.status)).length,
    returned: items.filter((i) => SHIPMENT_VIEW_STATUSES.returned!.includes(i.status)).length,
    issues: items.filter((i) => SHIPMENT_VIEW_STATUSES.issues!.includes(i.status)).length,
    cancelled: items.filter((i) => SHIPMENT_VIEW_STATUSES.cancelled!.includes(i.status)).length,
  }
}

function countOperations(items: GonderShipmentListItem[]): Record<ShipmentOperationTab, number> {
  const byType = (type: OperationType) => items.filter((i) => i.operationType === type).length
  return {
    all: items.length,
    parcel: byType('parcel'),
    courier: byType('courier'),
    logistics: byType('logistics'),
  }
}

function buildTrackingEvents(item: GonderShipmentListItem): ShipmentTrackingEvent[] {
  const base: ShipmentTrackingEvent[] = [
    {
      id: `${item.id}-tr-1`,
      title: 'Gönderi oluşturuldu',
      description: 'Gönderi kaydı sisteme işlendi.',
      location: item.originCity,
      occurredAt: item.createdAt,
      status: 'completed',
    },
    {
      id: `${item.id}-tr-2`,
      title: 'Etiket hazır',
      description: 'Barkod / etiket üretildi.',
      location: item.originCity,
      occurredAt: item.status === 'draft' ? null : item.createdAt,
      status: item.status === 'draft' ? 'pending' : 'completed',
    },
  ]

  const pickup: ShipmentTrackingEvent = {
    id: `${item.id}-tr-3`,
    title: 'Teslim alındı',
    description: 'Gönderi taşıyıcı tarafından alındı.',
    location: item.originCity,
    occurredAt: ['picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'exception'].includes(
      item.status
    )
      ? item.updatedAt
      : null,
    status: ['picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'exception'].includes(
      item.status
    )
      ? 'completed'
      : item.status === 'label_ready'
        ? 'active'
        : 'pending',
  }

  const transit: ShipmentTrackingEvent = {
    id: `${item.id}-tr-4`,
    title: 'Yolda',
    description: `${item.originCity} → ${item.destinationCity} rotasında ilerliyor.`,
    location: item.originCity,
    occurredAt: ['in_transit', 'out_for_delivery', 'delivered', 'returned', 'exception'].includes(
      item.status
    )
      ? item.updatedAt
      : null,
    status:
      item.status === 'in_transit'
        ? 'active'
        : ['out_for_delivery', 'delivered', 'returned', 'exception'].includes(item.status)
          ? 'completed'
          : 'pending',
  }

  const ofd: ShipmentTrackingEvent = {
    id: `${item.id}-tr-5`,
    title: 'Dağıtıma çıktı',
    description: 'Son mil dağıtımına alındı.',
    location: item.destinationCity,
    occurredAt: ['out_for_delivery', 'delivered'].includes(item.status) ? item.updatedAt : null,
    status:
      item.status === 'out_for_delivery'
        ? 'active'
        : item.status === 'delivered'
          ? 'completed'
          : item.status === 'exception'
            ? 'exception'
            : 'pending',
  }

  const delivered: ShipmentTrackingEvent = {
    id: `${item.id}-tr-6`,
    title: item.status === 'returned' ? 'İade teslimi' : 'Teslim edildi',
    description:
      item.status === 'returned'
        ? 'Gönderi iade olarak teslim alındı.'
        : 'Alıcıya teslim edildi.',
    location: item.destinationCity,
    occurredAt: item.status === 'delivered' || item.status === 'returned' ? item.updatedAt : null,
    status:
      item.status === 'delivered' || item.status === 'returned'
        ? 'completed'
        : item.status === 'cancelled'
          ? 'pending'
          : 'pending',
  }

  if (item.status === 'cancelled') {
    return [
      ...base,
      {
        id: `${item.id}-tr-cancel`,
        title: 'İptal edildi',
        description: 'Gönderi operasyonu iptal edildi.',
        location: item.originCity,
        occurredAt: item.updatedAt,
        status: 'exception',
      },
    ]
  }

  if (item.status === 'exception') {
    return [
      ...base,
      pickup,
      transit,
      {
        ...ofd,
        title: 'İstisna',
        description: 'Teslimat sırasında sorun oluştu.',
        status: 'exception',
        occurredAt: item.updatedAt,
      },
    ]
  }

  return [...base, pickup, transit, ofd, delivered]
}

function buildDocuments(item: GonderShipmentListItem, override?: ShipmentDocument[]): ShipmentDocument[] {
  if (override) return override
  const labelReady = item.status !== 'draft' && item.status !== 'cancelled'
  const delivered = item.status === 'delivered'
  return [
    {
      id: `${item.id}-doc-label`,
      type: 'label',
      name: 'Gönderi etiketi',
      status: labelReady ? 'ready' : item.status === 'cancelled' ? 'missing' : 'pending',
      createdAt: labelReady ? item.createdAt : null,
    },
    {
      id: `${item.id}-doc-invoice`,
      type: 'invoice',
      name: 'Taşıma faturası',
      status: item.amountTry != null && item.status !== 'cancelled' ? 'ready' : 'pending',
      createdAt: item.amountTry != null ? item.createdAt : null,
    },
    {
      id: `${item.id}-doc-pod`,
      type: 'pod',
      name: 'Teslim belgesi (POD)',
      status: delivered ? 'ready' : 'pending',
      createdAt: delivered ? item.updatedAt : null,
    },
    {
      id: `${item.id}-doc-waybill`,
      type: 'waybill',
      name: 'İrsaliye',
      status: ['in_transit', 'out_for_delivery', 'delivered', 'exception'].includes(item.status)
        ? 'ready'
        : 'pending',
      createdAt: ['in_transit', 'out_for_delivery', 'delivered', 'exception'].includes(item.status)
        ? item.updatedAt
        : null,
    },
  ]
}

function buildHistory(item: GonderShipmentListItem): ShipmentHistoryEvent[] {
  const events: ShipmentHistoryEvent[] = [
    {
      id: `${item.id}-hist-1`,
      action: 'Gönderi oluşturuldu',
      actor: 'Sistem',
      detail: `${item.reference} kaydı açıldı`,
      occurredAt: item.createdAt,
    },
  ]
  if (item.status !== 'draft') {
    events.push({
      id: `${item.id}-hist-2`,
      action: 'Etiket üretildi',
      actor: 'Operasyon',
      detail: 'Barkod yazdırma kuyruğuna eklendi',
      occurredAt: item.createdAt,
    })
  }
  if (
    ['picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'exception'].includes(
      item.status
    )
  ) {
    events.push({
      id: `${item.id}-hist-3`,
      action: 'Teslim alındı',
      actor: item.carrier,
      detail: 'Pickup tamamlandı',
      occurredAt: item.updatedAt,
    })
  }
  if (item.status === 'exception') {
    events.push({
      id: `${item.id}-hist-ex`,
      action: 'İstisna açıldı',
      actor: item.carrier,
      detail: 'Adreste teslim alınamadı',
      occurredAt: item.updatedAt,
    })
  }
  if (item.status === 'delivered') {
    events.push({
      id: `${item.id}-hist-del`,
      action: 'Teslim edildi',
      actor: item.carrier,
      detail: 'POD yüklendi',
      occurredAt: item.updatedAt,
    })
  }
  if (item.status === 'cancelled') {
    events.push({
      id: `${item.id}-hist-cancel`,
      action: 'İptal edildi',
      actor: 'Operasyon',
      detail: 'Müşteri talebi / operasyon iptali',
      occurredAt: item.updatedAt,
    })
  }
  return events.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
}

function readinessFor(status: ShipmentListStatus): string {
  switch (status) {
    case 'draft':
      return 'Taslak; etiket ve taşıyıcı ataması tamamlanmadı.'
    case 'label_ready':
      return 'Etiket hazır; alma bekleniyor.'
    case 'picked_up':
      return 'Alındı; transfer planlanıyor.'
    case 'in_transit':
      return 'Yolda; varış noktasına ilerliyor.'
    case 'out_for_delivery':
      return 'Dağıtımda; teslimat bekleniyor.'
    case 'delivered':
      return 'Teslim tamamlandı.'
    case 'returned':
      return 'İade sürecinde / iade teslim edildi.'
    case 'cancelled':
      return 'Gönderi iptal edildi.'
    case 'exception':
      return 'İstisna açık; müdahale gerekiyor.'
  }
}

function enrichDetail(item: GonderShipmentListItem): GonderShipmentDetail {
  const override = detailOverrides[item.id] ?? {}
  const orderMeta = item.orderNumber ? ORDER_ID_BY_NUMBER[item.orderNumber] : null

  const packages =
    override.packages ??
    [
      pkg(item.id, 1, {
        desi: item.desi,
        weightKg: item.weightKg,
        status:
          item.status === 'delivered'
            ? 'delivered'
            : item.status === 'out_for_delivery'
              ? 'out_for_delivery'
              : item.status === 'picked_up'
                ? 'picked_up'
                : item.status === 'exception'
                  ? 'exception'
                  : item.status === 'in_transit'
                    ? 'in_transit'
                    : 'created',
      }),
    ]

  const issues: ShipmentIssue[] =
    override.issues ??
    (item.status === 'exception'
      ? [
          {
            id: `${item.id}-iss-1`,
            severity: 'warning',
            title: 'Operasyon istisnası',
            description: 'Gönderide sorun bildirildi. Detay için takip sekmesine bakın.',
            openedAt: item.updatedAt,
            status: 'open',
          },
        ]
      : [])

  return {
    ...item,
    trackingNumber: `TRK-${item.reference.replace('GND-', '')}`,
    etaLabel: override.etaLabel ?? null,
    pickupAt: override.pickupAt ?? null,
    deliveredAt: override.deliveredAt ?? null,
    pieceCount: override.pieceCount ?? packages.length,
    sender: override.sender ?? {
      name: 'Gönderici Depo',
      phone: '0212 000 00 00',
      city: item.originCity,
      district: null,
      addressLine: `${item.originCity} çıkış noktası`,
    },
    receiver: override.receiver ?? {
      name: orderMeta?.customerName ?? 'Alıcı',
      phone: null,
      city: item.destinationCity,
      district: null,
      addressLine: `${item.destinationCity} teslimat adresi`,
    },
    driver: override.driver ?? null,
    vehicle: override.vehicle ?? null,
    linkedOrder: override.linkedOrder
      ? override.linkedOrder
      : orderMeta && item.orderNumber
        ? {
            id: orderMeta.id,
            orderNumber: item.orderNumber,
            customerName: orderMeta.customerName,
            statusLabel: orderMeta.statusLabel,
          }
        : null,
    linkedQuote: override.linkedQuote ?? null,
    readinessSummary: override.readinessSummary ?? readinessFor(item.status),
    issues,
    trackingEvents: override.trackingEvents ?? buildTrackingEvents(item),
    packages,
    documents: buildDocuments(item, override.documents),
    finance: {
      amountTry: item.amountTry,
      currency: 'TRY',
      paymentStatus:
        item.status === 'cancelled'
          ? 'na'
          : item.status === 'delivered'
            ? 'paid'
            : item.amountTry == null
              ? 'na'
              : 'pending',
      invoiceNumber: null,
      paymentMethod: null,
      chargedAt: null,
      note: null,
      ...override.finance,
    },
    history: override.history ?? buildHistory(item),
  }
}

export class MockShipmentsListRepository implements ShipmentsListRepository {
  private items = [...seed]

  async list(query: ShipmentsListQuery = {}): Promise<ShipmentsListResult> {
    await delay(70)
    const filtered = this.items.filter((item) => matches(item, query))

    const forViewCounts = this.items.filter((item) =>
      matches(item, {
        operation: query.operation,
        logisticsMode: query.logisticsMode,
        search: query.search,
        carrier: query.carrier,
      })
    )
    const forOperationCounts = this.items.filter((item) =>
      matches(item, {
        view: query.view,
        status: query.status,
        search: query.search,
        carrier: query.carrier,
      })
    )

    return {
      items: filtered,
      total: filtered.length,
      viewCounts: countViews(forViewCounts),
      operationCounts: countOperations(forOperationCounts),
    }
  }

  async getById(id: string): Promise<GonderShipmentListItem | null> {
    await delay(40)
    return this.items.find((item) => item.id === id) ?? null
  }

  async getDetail(id: string): Promise<GonderShipmentDetail | null> {
    await delay(60)
    const item = this.items.find((row) => row.id === id)
    if (!item) return null
    return enrichDetail(item)
  }

  async updateStatus(id: string, status: ShipmentListStatus): Promise<GonderShipmentListItem> {
    await delay(50)
    const index = this.items.findIndex((item) => item.id === id)
    if (index < 0) throw new Error('Gönderi bulunamadı')
    const next = {
      ...this.items[index]!,
      status,
      updatedAt: new Date().toISOString(),
    }
    this.items[index] = next
    return next
  }

  async create(
    input: Omit<GonderShipmentListItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Promise<GonderShipmentListItem> {
    await delay(80)
    const now = new Date().toISOString()
    const created: GonderShipmentListItem = {
      ...input,
      id: input.id ?? `sh-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    }
    this.items = [created, ...this.items]
    return created
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const shipmentsListRepository: ShipmentsListRepository = new MockShipmentsListRepository()
