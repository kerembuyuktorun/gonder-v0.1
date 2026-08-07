import { defaultChannelIdForType } from './order-channels'
import {
  ORDER_STATUS_LABELS,
  ORDER_VIEW_STATUSES,
  type GonderOrder,
  type GonderOrderDetail,
  type OrderAddress,
  type OrderChannelType,
  type OrderHistoryEvent,
  type OrderLineItem,
  type OrderStatus,
  type OrderView,
} from '../_types/orders'

export type OrdersListQuery = {
  view?: OrderView
  status?: OrderStatus | null
  /** Tek kanal tipi */
  channel?: OrderChannelType | null
  /** Virgülle ayrılmış çoklu kanal tipi */
  channels?: OrderChannelType[] | null
  /** Bağlı mağaza / bağlantı id */
  channelId?: string | null
  search?: string
}

export type OrdersListResult = {
  items: GonderOrder[]
  total: number
  viewCounts: Record<OrderView, number>
  channelCounts: Record<string, number>
}

export interface OrdersRepository {
  list(query?: OrdersListQuery): Promise<OrdersListResult>
  getById(id: string): Promise<GonderOrderDetail | null>
  updateStatus(id: string, status: OrderStatus): Promise<GonderOrderDetail>
  bulkUpdateStatus(ids: string[], status: OrderStatus): Promise<number>
}

function address(partial: OrderAddress): OrderAddress {
  return partial
}

function line(
  id: string,
  sku: string,
  name: string,
  quantity: number,
  unitPriceTry: number
): OrderLineItem {
  return {
    id,
    sku,
    name,
    quantity,
    unitPriceTry,
    totalTry: quantity * unitPriceTry,
  }
}

function event(
  id: string,
  at: string,
  type: string,
  title: string,
  extras?: Pick<OrderHistoryEvent, 'description' | 'actor'>
): OrderHistoryEvent {
  return { id, at, type, title, ...extras }
}

function toListItem(item: GonderOrderDetail): GonderOrder {
  return {
    id: item.id,
    orderNumber: item.orderNumber,
    channel: item.channel,
    channelId: item.channelId,
    customerName: item.customerName,
    originCity: item.originCity,
    destinationCity: item.destinationCity,
    status: item.status,
    amountTry: item.amountTry,
    currency: item.currency,
    pieceCount: item.pieceCount,
    createdAt: item.createdAt,
    shipmentId: item.shipmentId,
  }
}

const seed: GonderOrderDetail[] = [
  {
    id: 'ord-501',
    orderNumber: 'ORD-10023',
    channel: 'shopify',
    channelId: defaultChannelIdForType('shopify'),
    customerName: 'Ayşe Yılmaz',
    originCity: 'İstanbul',
    destinationCity: 'Ankara',
    status: 'pending_review',
    amountTry: 1240,
    currency: 'TRY',
    pieceCount: 2,
    createdAt: '2026-08-07T08:10:00.000Z',
    shipmentId: null,
    customerEmail: 'ayse.yilmaz@example.com',
    customerPhone: '+90 532 111 22 33',
    shippingAddress: address({
      fullName: 'Ayşe Yılmaz',
      phone: '+90 532 111 22 33',
      line1: 'Çankaya Mah. Atatürk Blv. No:12 D:4',
      district: 'Çankaya',
      city: 'Ankara',
      postalCode: '06690',
      country: 'TR',
    }),
    billingAddress: address({
      fullName: 'Ayşe Yılmaz',
      phone: '+90 532 111 22 33',
      line1: 'Çankaya Mah. Atatürk Blv. No:12 D:4',
      district: 'Çankaya',
      city: 'Ankara',
      postalCode: '06690',
      country: 'TR',
    }),
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    externalOrderId: 'SH-784512',
    channelMetadata: {
      store: 'ARF Mağaza',
      paymentGateway: 'Shopify Payments',
      tags: 'vip,express',
    },
    lastSyncedAt: '2026-08-07T08:12:00.000Z',
    dataQualityIssues: [],
    lineItems: [
      line('li-501-1', 'SKU-TEE-BLK-M', 'Premium Tişört Siyah M', 1, 640),
      line('li-501-2', 'SKU-HAT-NVY', 'Logo Şapka Lacivert', 1, 600),
    ],
    history: [
      event('ev-501-1', '2026-08-07T08:10:00.000Z', 'imported', 'Sipariş içe aktarıldı', {
        description: 'Shopify webhook ile alındı',
        actor: 'Shopify',
      }),
      event('ev-501-2', '2026-08-07T08:11:30.000Z', 'status', 'Onay bekliyor', {
        actor: 'Sistem',
      }),
    ],
    notes: null,
  },
  {
    id: 'ord-502',
    orderNumber: 'ORD-10041',
    channel: 'trendyol',
    channelId: defaultChannelIdForType('trendyol'),
    customerName: 'Mehmet Demir',
    originCity: 'İzmir',
    destinationCity: 'Bursa',
    status: 'ready_for_shipment',
    amountTry: 890,
    currency: 'TRY',
    pieceCount: 1,
    createdAt: '2026-08-06T14:20:00.000Z',
    shipmentId: null,
    customerEmail: 'mehmet.demir@example.com',
    customerPhone: '+90 505 444 55 66',
    shippingAddress: address({
      fullName: 'Mehmet Demir',
      phone: '+90 505 444 55 66',
      line1: 'Nilüfer Cad. No:45',
      district: 'Nilüfer',
      city: 'Bursa',
      postalCode: '16110',
      country: 'TR',
    }),
    billingAddress: address({
      fullName: 'Mehmet Demir',
      line1: 'Alsancak Mah. Kıbrıs Şehitleri Cad. No:8',
      district: 'Konak',
      city: 'İzmir',
      postalCode: '35220',
      country: 'TR',
    }),
    paymentStatus: 'paid',
    paymentMethod: 'marketplace',
    externalOrderId: 'TY-9921847',
    channelMetadata: {
      cargoProviderPreference: 'ARF',
      packageCount: '1',
    },
    lastSyncedAt: '2026-08-06T15:00:00.000Z',
    dataQualityIssues: [
      {
        id: 'dq-502-1',
        severity: 'info',
        field: 'billingAddress',
        message: 'Fatura adresi teslimat adresinden farklı',
      },
    ],
    lineItems: [line('li-502-1', 'SKU-BAG-01', 'Günlük Çanta', 1, 890)],
    history: [
      event('ev-502-1', '2026-08-06T14:20:00.000Z', 'imported', 'Sipariş içe aktarıldı', {
        actor: 'Trendyol',
      }),
      event('ev-502-2', '2026-08-06T14:45:00.000Z', 'status', 'Onaylandı', {
        actor: 'Operasyon',
      }),
      event('ev-502-3', '2026-08-06T15:00:00.000Z', 'status', 'Gönderi bekliyor', {
        actor: 'Sistem',
      }),
    ],
    notes: 'Müşteri mesai saatlerinde teslimat istiyor.',
  },
  {
    id: 'ord-503',
    orderNumber: 'ORD-9981',
    channel: 'excel',
    channelId: defaultChannelIdForType('excel'),
    customerName: 'Elif Kara',
    originCity: 'Ankara',
    destinationCity: 'Antalya',
    status: 'processing',
    amountTry: 2100,
    currency: 'TRY',
    pieceCount: 3,
    createdAt: '2026-08-05T11:00:00.000Z',
    shipmentId: 'sh-1003',
    customerEmail: 'elif.kara@example.com',
    customerPhone: '+90 533 222 33 44',
    shippingAddress: address({
      fullName: 'Elif Kara',
      phone: '+90 533 222 33 44',
      line1: 'Lara Cad. Palm City Site B Blok D:12',
      district: 'Muratpaşa',
      city: 'Antalya',
      postalCode: '07230',
      country: 'TR',
    }),
    billingAddress: address({
      fullName: 'Kara Tekstil Ltd.',
      line1: 'Ostim OSB 1234. Cad. No:7',
      district: 'Yenimahalle',
      city: 'Ankara',
      postalCode: '06374',
      country: 'TR',
    }),
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
    externalOrderId: 'XLS-2026-0812',
    channelMetadata: {
      importBatch: 'batch-44',
      fileName: 'siparisler_agustos.xlsx',
    },
    lastSyncedAt: '2026-08-05T11:05:00.000Z',
    dataQualityIssues: [],
    lineItems: [
      line('li-503-1', 'SKU-BOX-L', 'Karton Koli Büyük', 2, 700),
      line('li-503-2', 'SKU-TAPE-CLR', 'Koli Bandı Şeffaf', 1, 700),
    ],
    history: [
      event('ev-503-1', '2026-08-05T11:00:00.000Z', 'imported', 'Excel ile içe aktarıldı', {
        actor: 'Operasyon',
      }),
      event('ev-503-2', '2026-08-05T11:30:00.000Z', 'status', 'Onaylandı', {
        actor: 'Operasyon',
      }),
      event('ev-503-3', '2026-08-05T12:10:00.000Z', 'shipment', 'Gönderi oluşturuldu', {
        description: 'Gönderi no: sh-1003',
        actor: 'Operasyon',
      }),
      event('ev-503-4', '2026-08-05T13:00:00.000Z', 'status', 'İşlemde', {
        actor: 'Sistem',
      }),
    ],
    notes: null,
  },
  {
    id: 'ord-504',
    orderNumber: 'ORD-10055',
    channel: 'api',
    channelId: defaultChannelIdForType('api'),
    customerName: 'Can Öztürk',
    originCity: 'İstanbul',
    destinationCity: 'Gaziantep',
    status: 'integration_error',
    amountTry: 640,
    currency: 'TRY',
    pieceCount: 1,
    createdAt: '2026-08-07T09:40:00.000Z',
    shipmentId: null,
    customerEmail: null,
    customerPhone: '+90 541 777 88 99',
    shippingAddress: address({
      fullName: 'Can Öztürk',
      phone: '+90 541 777 88 99',
      line1: 'Şehitkamil Mah.',
      city: 'Gaziantep',
      country: 'TR',
    }),
    billingAddress: address({
      fullName: 'Can Öztürk',
      line1: 'Şehitkamil Mah.',
      city: 'Gaziantep',
      country: 'TR',
    }),
    paymentStatus: 'pending',
    paymentMethod: 'other',
    externalOrderId: 'ERP-441902',
    channelMetadata: {
      sourceSystem: 'ERP Sync',
      syncErrorCode: 'ADDR_INCOMPLETE',
    },
    lastSyncedAt: '2026-08-07T09:41:00.000Z',
    dataQualityIssues: [
      {
        id: 'dq-504-1',
        severity: 'error',
        field: 'shippingAddress.line1',
        message: 'Teslimat adresi satırı eksik / doğrulanamadı',
      },
      {
        id: 'dq-504-2',
        severity: 'warning',
        field: 'customerEmail',
        message: 'Müşteri e-posta adresi gelmedi',
      },
      {
        id: 'dq-504-3',
        severity: 'error',
        field: 'shippingAddress.district',
        message: 'İlçe bilgisi zorunlu',
      },
    ],
    lineItems: [line('li-504-1', 'SKU-CBL-USB', 'USB-C Kablo 2m', 1, 640)],
    history: [
      event('ev-504-1', '2026-08-07T09:40:00.000Z', 'imported', 'API ile alındı', {
        actor: 'ERP Sync',
      }),
      event('ev-504-2', '2026-08-07T09:41:00.000Z', 'error', 'Entegrasyon hatası', {
        description: 'ADDR_INCOMPLETE — adres doğrulaması başarısız',
        actor: 'Sistem',
      }),
    ],
    notes: 'ERP tarafında adres güncellemesi bekleniyor.',
  },
  {
    id: 'ord-505',
    orderNumber: 'ORD-10060',
    channel: 'shopify',
    channelId: defaultChannelIdForType('shopify'),
    customerName: 'Zeynep Ak',
    originCity: 'Kocaeli',
    destinationCity: 'İstanbul',
    status: 'completed',
    amountTry: 450,
    currency: 'TRY',
    pieceCount: 1,
    createdAt: '2026-08-01T16:15:00.000Z',
    shipmentId: 'sh-0990',
    customerEmail: 'zeynep.ak@example.com',
    customerPhone: '+90 555 100 20 30',
    shippingAddress: address({
      fullName: 'Zeynep Ak',
      phone: '+90 555 100 20 30',
      line1: 'Kadıköy Moda Cad. No:22',
      district: 'Kadıköy',
      city: 'İstanbul',
      postalCode: '34710',
      country: 'TR',
    }),
    billingAddress: address({
      fullName: 'Zeynep Ak',
      line1: 'Kadıköy Moda Cad. No:22',
      district: 'Kadıköy',
      city: 'İstanbul',
      postalCode: '34710',
      country: 'TR',
    }),
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    externalOrderId: 'SH-771200',
    channelMetadata: { store: 'ARF Mağaza' },
    lastSyncedAt: '2026-08-03T10:00:00.000Z',
    dataQualityIssues: [],
    lineItems: [line('li-505-1', 'SKU-MUG-01', 'Seramik Kupa', 1, 450)],
    history: [
      event('ev-505-1', '2026-08-01T16:15:00.000Z', 'imported', 'Sipariş içe aktarıldı', {
        actor: 'Shopify',
      }),
      event('ev-505-2', '2026-08-01T17:00:00.000Z', 'status', 'Onaylandı', {
        actor: 'Operasyon',
      }),
      event('ev-505-3', '2026-08-02T09:00:00.000Z', 'shipment', 'Gönderi oluşturuldu', {
        description: 'Gönderi no: sh-0990',
        actor: 'Operasyon',
      }),
      event('ev-505-4', '2026-08-03T10:00:00.000Z', 'status', 'Tamamlandı', {
        actor: 'Sistem',
      }),
    ],
    notes: null,
  },
  {
    id: 'ord-506',
    orderNumber: 'ORD-10071',
    channel: 'manual',
    channelId: defaultChannelIdForType('manual'),
    customerName: 'Deniz Aydın',
    originCity: 'Adana',
    destinationCity: 'Mersin',
    status: 'approved',
    amountTry: 1320,
    currency: 'TRY',
    pieceCount: 2,
    createdAt: '2026-08-07T07:05:00.000Z',
    shipmentId: null,
    customerEmail: 'deniz.aydin@example.com',
    customerPhone: '+90 536 300 40 50',
    shippingAddress: address({
      fullName: 'Deniz Aydın',
      phone: '+90 536 300 40 50',
      line1: 'Mezitli Mah. Akdeniz Blv. No:5',
      district: 'Mezitli',
      city: 'Mersin',
      postalCode: '33340',
      country: 'TR',
    }),
    billingAddress: address({
      fullName: 'Deniz Aydın',
      line1: 'Seyhan Mah. Toros Cad. No:18',
      district: 'Seyhan',
      city: 'Adana',
      postalCode: '01120',
      country: 'TR',
    }),
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
    externalOrderId: 'MAN-10071',
    channelMetadata: { createdBy: 'Operasyon' },
    lastSyncedAt: null,
    dataQualityIssues: [],
    lineItems: [
      line('li-506-1', 'SKU-SHOE-42', 'Spor Ayakkabı 42', 1, 990),
      line('li-506-2', 'SKU-SOCK-3', 'Çorap Seti 3lü', 1, 330),
    ],
    history: [
      event('ev-506-1', '2026-08-07T07:05:00.000Z', 'created', 'Manuel sipariş oluşturuldu', {
        actor: 'Operasyon',
      }),
      event('ev-506-2', '2026-08-07T07:20:00.000Z', 'status', 'Onaylandı', {
        actor: 'Operasyon',
      }),
    ],
    notes: null,
  },
  {
    id: 'ord-507',
    orderNumber: 'ORD-10080',
    channel: 'trendyol',
    channelId: defaultChannelIdForType('trendyol'),
    customerName: 'Burak Şen',
    originCity: 'İstanbul',
    destinationCity: 'Samsun',
    status: 'rejected',
    amountTry: 780,
    currency: 'TRY',
    pieceCount: 1,
    createdAt: '2026-08-04T12:30:00.000Z',
    shipmentId: null,
    customerEmail: 'burak.sen@example.com',
    customerPhone: '+90 542 600 70 80',
    shippingAddress: address({
      fullName: 'Burak Şen',
      phone: '+90 542 600 70 80',
      line1: 'Atakum Sahil Yolu No:90',
      district: 'Atakum',
      city: 'Samsun',
      postalCode: '55200',
      country: 'TR',
    }),
    billingAddress: address({
      fullName: 'Burak Şen',
      line1: 'Atakum Sahil Yolu No:90',
      district: 'Atakum',
      city: 'Samsun',
      postalCode: '55200',
      country: 'TR',
    }),
    paymentStatus: 'refunded',
    paymentMethod: 'marketplace',
    externalOrderId: 'TY-8810021',
    channelMetadata: { cancelReason: 'Stok yetersiz' },
    lastSyncedAt: '2026-08-04T14:00:00.000Z',
    dataQualityIssues: [
      {
        id: 'dq-507-1',
        severity: 'warning',
        message: 'Sipariş stok kontrolünde reddedildi',
      },
    ],
    lineItems: [line('li-507-1', 'SKU-WATCH-S', 'Akıllı Saat', 1, 780)],
    history: [
      event('ev-507-1', '2026-08-04T12:30:00.000Z', 'imported', 'Sipariş içe aktarıldı', {
        actor: 'Trendyol',
      }),
      event('ev-507-2', '2026-08-04T13:15:00.000Z', 'status', 'Reddedildi', {
        description: 'Stok yetersiz',
        actor: 'Operasyon',
      }),
    ],
    notes: 'Pazaryerine iptal bildirildi.',
  },
  {
    id: 'ord-508',
    orderNumber: 'ORD-10091',
    channel: 'hepsiburada',
    channelId: defaultChannelIdForType('hepsiburada'),
    customerName: 'Selin Yurt',
    originCity: 'İstanbul',
    destinationCity: 'Eskişehir',
    status: 'needs_information',
    amountTry: 560,
    currency: 'TRY',
    pieceCount: 1,
    createdAt: '2026-08-07T10:05:00.000Z',
    shipmentId: null,
    customerEmail: 'selin.yurt@example.com',
    customerPhone: null,
    shippingAddress: address({
      fullName: 'Selin Yurt',
      line1: 'Tepebaşı Odunpazarı Cad.',
      city: 'Eskişehir',
      country: 'TR',
    }),
    billingAddress: address({
      fullName: 'Selin Yurt',
      line1: 'Tepebaşı Odunpazarı Cad.',
      city: 'Eskişehir',
      country: 'TR',
    }),
    paymentStatus: 'paid',
    paymentMethod: 'marketplace',
    externalOrderId: 'HB-5501299',
    channelMetadata: { packageType: 'standart' },
    lastSyncedAt: '2026-08-07T10:06:00.000Z',
    dataQualityIssues: [
      {
        id: 'dq-508-1',
        severity: 'error',
        field: 'customerPhone',
        message: 'Teslimat için telefon numarası gerekli',
      },
      {
        id: 'dq-508-2',
        severity: 'warning',
        field: 'shippingAddress.district',
        message: 'İlçe bilgisi eksik',
      },
    ],
    lineItems: [line('li-508-1', 'SKU-BOOK-12', 'Defter Seti', 1, 560)],
    history: [
      event('ev-508-1', '2026-08-07T10:05:00.000Z', 'imported', 'Sipariş içe aktarıldı', {
        actor: 'Hepsiburada',
      }),
      event('ev-508-2', '2026-08-07T10:06:00.000Z', 'status', 'Bilgi gerekli', {
        description: 'Telefon ve ilçe eksik',
        actor: 'Sistem',
      }),
    ],
    notes: null,
  },
  {
    id: 'ord-509',
    orderNumber: 'ORD-10102',
    channel: 'amazon',
    channelId: defaultChannelIdForType('amazon'),
    customerName: 'Kerem Ural',
    originCity: 'Bursa',
    destinationCity: 'İstanbul',
    status: 'payment_pending',
    amountTry: 1890,
    currency: 'TRY',
    pieceCount: 2,
    createdAt: '2026-08-06T18:40:00.000Z',
    shipmentId: null,
    customerEmail: 'kerem.ural@example.com',
    customerPhone: '+90 530 900 10 20',
    shippingAddress: address({
      fullName: 'Kerem Ural',
      phone: '+90 530 900 10 20',
      line1: 'Beşiktaş Barbaros Bulvarı No:60',
      district: 'Beşiktaş',
      city: 'İstanbul',
      postalCode: '34353',
      country: 'TR',
    }),
    billingAddress: address({
      fullName: 'Ural Danışmanlık',
      line1: 'Nilüfer Organize Sanayi 3. Cad. No:11',
      district: 'Nilüfer',
      city: 'Bursa',
      postalCode: '16140',
      country: 'TR',
    }),
    paymentStatus: 'pending',
    paymentMethod: 'credit_card',
    externalOrderId: 'AMZ-TR-334891',
    channelMetadata: {
      marketplace: 'Amazon TR',
      fulfillment: 'MFN',
    },
    lastSyncedAt: '2026-08-06T19:00:00.000Z',
    dataQualityIssues: [
      {
        id: 'dq-509-1',
        severity: 'warning',
        field: 'paymentStatus',
        message: 'Ödeme onayı henüz tamamlanmadı; gönderi oluşturulabilir ancak riskli',
      },
    ],
    lineItems: [
      line('li-509-1', 'SKU-HEAD-01', 'Kulaklık Pro', 1, 1290),
      line('li-509-2', 'SKU-CASE-01', 'Koruyucu Kılıf', 1, 600),
    ],
    history: [
      event('ev-509-1', '2026-08-06T18:40:00.000Z', 'imported', 'Sipariş içe aktarıldı', {
        actor: 'Amazon',
      }),
      event('ev-509-2', '2026-08-06T19:00:00.000Z', 'status', 'Ödeme bekliyor', {
        actor: 'Sistem',
      }),
    ],
    notes: null,
  },
  {
    id: 'ord-510',
    orderNumber: 'ORD-10115',
    channel: 'shopify',
    channelId: defaultChannelIdForType('shopify'),
    customerName: 'İrem Koç',
    originCity: 'Ankara',
    destinationCity: 'Konya',
    status: 'quote_pending',
    amountTry: 980,
    currency: 'TRY',
    pieceCount: 1,
    createdAt: '2026-08-07T06:20:00.000Z',
    shipmentId: null,
    customerEmail: 'irem.koc@example.com',
    customerPhone: '+90 534 210 30 40',
    shippingAddress: address({
      fullName: 'İrem Koç',
      phone: '+90 534 210 30 40',
      line1: 'Selçuklu Kampüs Cad. No:3',
      district: 'Selçuklu',
      city: 'Konya',
      postalCode: '42030',
      country: 'TR',
    }),
    billingAddress: address({
      fullName: 'İrem Koç',
      line1: 'Çankaya Bahçelievler 7. Cad. No:14',
      district: 'Çankaya',
      city: 'Ankara',
      postalCode: '06490',
      country: 'TR',
    }),
    paymentStatus: 'unpaid',
    paymentMethod: 'other',
    externalOrderId: 'SH-790044',
    channelMetadata: { store: 'ARF Mağaza', quoteRequested: 'true' },
    lastSyncedAt: '2026-08-07T06:25:00.000Z',
    dataQualityIssues: [],
    lineItems: [line('li-510-1', 'SKU-LAMP-DESK', 'Masa Lambası', 1, 980)],
    history: [
      event('ev-510-1', '2026-08-07T06:20:00.000Z', 'imported', 'Sipariş içe aktarıldı', {
        actor: 'Shopify',
      }),
      event('ev-510-2', '2026-08-07T06:25:00.000Z', 'status', 'Teklif bekliyor', {
        actor: 'Operasyon',
      }),
    ],
    notes: 'Özel boyutlu paket — teklif gerekli.',
  },
]

function matches(item: GonderOrder, query: OrdersListQuery = {}) {
  const view = query.view ?? 'all'
  const statuses = ORDER_VIEW_STATUSES[view]
  if (statuses && !statuses.includes(item.status)) return false
  if (query.status && item.status !== query.status) return false
  if (query.channelId && item.channelId !== query.channelId) return false
  if (query.channels?.length && !query.channels.includes(item.channel)) return false
  if (query.channel && !query.channels?.length && item.channel !== query.channel) return false
  if (query.search?.trim()) {
    const needle = query.search.trim().toLocaleLowerCase('tr-TR')
    const hay = `${item.orderNumber} ${item.customerName} ${item.originCity} ${item.destinationCity}`.toLocaleLowerCase(
      'tr-TR'
    )
    if (!hay.includes(needle)) return false
  }
  return true
}

function countViews(items: GonderOrder[]): Record<OrderView, number> {
  return {
    all: items.length,
    pending: items.filter((i) => ORDER_VIEW_STATUSES.pending!.includes(i.status)).length,
    needs_shipment: items.filter((i) => ORDER_VIEW_STATUSES.needs_shipment!.includes(i.status))
      .length,
    processing: items.filter((i) => ORDER_VIEW_STATUSES.processing!.includes(i.status)).length,
    rejected: items.filter((i) => ORDER_VIEW_STATUSES.rejected!.includes(i.status)).length,
    issues: items.filter((i) => ORDER_VIEW_STATUSES.issues!.includes(i.status)).length,
    completed: items.filter((i) => ORDER_VIEW_STATUSES.completed!.includes(i.status)).length,
  }
}

function countChannels(items: GonderOrder[]): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.channel] = (acc[item.channel] ?? 0) + 1
    acc[item.channelId] = (acc[item.channelId] ?? 0) + 1
    return acc
  }, {})
}

function appendStatusHistory(item: GonderOrderDetail, status: OrderStatus): OrderHistoryEvent[] {
  const nextEvent = event(
    `ev-${item.id}-${Date.now()}`,
    new Date().toISOString(),
    'status',
    ORDER_STATUS_LABELS[status],
    { actor: 'Operasyon' }
  )
  return [nextEvent, ...item.history]
}

export class MockOrdersRepository implements OrdersRepository {
  private items = seed.map((item) => ({
    ...item,
    shippingAddress: { ...item.shippingAddress },
    billingAddress: { ...item.billingAddress },
    channelMetadata: { ...item.channelMetadata },
    dataQualityIssues: item.dataQualityIssues.map((issue) => ({ ...issue })),
    lineItems: item.lineItems.map((li) => ({ ...li })),
    history: item.history.map((ev) => ({ ...ev })),
  }))

  async list(query: OrdersListQuery = {}): Promise<OrdersListResult> {
    await delay(70)
    const listItems = this.items.map(toListItem)
    const filtered = listItems.filter((item) => matches(item, query))
    const forViewCounts = listItems.filter((item) =>
      matches(item, {
        channel: query.channel,
        channels: query.channels,
        channelId: query.channelId,
        search: query.search,
      })
    )
    return {
      items: filtered,
      total: filtered.length,
      viewCounts: countViews(forViewCounts),
      channelCounts: countChannels(listItems),
    }
  }

  async getById(id: string): Promise<GonderOrderDetail | null> {
    await delay(40)
    const item = this.items.find((row) => row.id === id)
    if (!item) return null
    return {
      ...item,
      shippingAddress: { ...item.shippingAddress },
      billingAddress: { ...item.billingAddress },
      channelMetadata: { ...item.channelMetadata },
      dataQualityIssues: item.dataQualityIssues.map((issue) => ({ ...issue })),
      lineItems: item.lineItems.map((li) => ({ ...li })),
      history: item.history.map((ev) => ({ ...ev })),
    }
  }

  async updateStatus(id: string, status: OrderStatus): Promise<GonderOrderDetail> {
    await delay(50)
    const index = this.items.findIndex((item) => item.id === id)
    if (index < 0) throw new Error('Sipariş bulunamadı')
    const current = this.items[index]!
    const next: GonderOrderDetail = {
      ...current,
      status,
      history: appendStatusHistory(current, status),
    }
    this.items[index] = next
    return {
      ...next,
      shippingAddress: { ...next.shippingAddress },
      billingAddress: { ...next.billingAddress },
      channelMetadata: { ...next.channelMetadata },
      dataQualityIssues: next.dataQualityIssues.map((issue) => ({ ...issue })),
      lineItems: next.lineItems.map((li) => ({ ...li })),
      history: next.history.map((ev) => ({ ...ev })),
    }
  }

  async bulkUpdateStatus(ids: string[], status: OrderStatus): Promise<number> {
    await delay(80)
    let count = 0
    this.items = this.items.map((item) => {
      if (!ids.includes(item.id)) return item
      count += 1
      return {
        ...item,
        status,
        history: appendStatusHistory(item, status),
      }
    })
    return count
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const ordersRepository: OrdersRepository = new MockOrdersRepository()
