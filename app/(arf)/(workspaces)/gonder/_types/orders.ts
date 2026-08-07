export type OrderStatus =
  | 'imported'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'needs_information'
  | 'ready_for_shipment'
  | 'quote_pending'
  | 'payment_pending'
  | 'shipment_created'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'integration_error'

export type OrderView =
  | 'all'
  | 'pending'
  | 'needs_shipment'
  | 'processing'
  | 'rejected'
  | 'issues'
  | 'completed'

export type OrderChannelType =
  | 'shopify'
  | 'woocommerce'
  | 'trendyol'
  | 'hepsiburada'
  | 'amazon'
  | 'api'
  | 'excel'
  | 'manual'

/** @deprecated Use OrderChannelType */
export type OrderChannel = OrderChannelType

export type OrderChannelConnection = {
  id: string
  type: OrderChannelType
  name: string
  storeName?: string
  logoUrl?: string
  isActive: boolean
}

export type OrdersLayout = 'table' | 'board'

export type OrderDetailTab =
  | 'overview'
  | 'items'
  | 'customer'
  | 'integration'
  | 'history'

export type OrderPaymentStatus = 'unpaid' | 'pending' | 'paid' | 'refunded' | 'failed'

export type OrderPaymentMethod =
  | 'credit_card'
  | 'cash_on_delivery'
  | 'bank_transfer'
  | 'marketplace'
  | 'other'

export type OrderAddress = {
  fullName: string
  phone?: string
  line1: string
  line2?: string
  district?: string
  city: string
  postalCode?: string
  country: string
}

export type OrderLineItem = {
  id: string
  sku: string
  name: string
  quantity: number
  unitPriceTry: number
  totalTry: number
}

export type OrderDataQualityIssue = {
  id: string
  severity: 'error' | 'warning' | 'info'
  field?: string
  message: string
}

export type OrderHistoryEvent = {
  id: string
  at: string
  type: string
  title: string
  description?: string
  actor?: string
}

export type GonderOrder = {
  id: string
  orderNumber: string
  channel: OrderChannelType
  channelId: string
  customerName: string
  originCity: string
  destinationCity: string
  status: OrderStatus
  amountTry: number
  currency: 'TRY'
  pieceCount: number
  createdAt: string
  shipmentId: string | null
}

/** Detail-only enrichment — list rows remain GonderOrder-shaped. */
export type GonderOrderDetail = GonderOrder & {
  customerEmail: string | null
  customerPhone: string | null
  shippingAddress: OrderAddress
  billingAddress: OrderAddress
  paymentStatus: OrderPaymentStatus
  paymentMethod: OrderPaymentMethod
  externalOrderId: string
  channelMetadata: Record<string, string>
  lastSyncedAt: string | null
  dataQualityIssues: OrderDataQualityIssue[]
  lineItems: OrderLineItem[]
  history: OrderHistoryEvent[]
  notes: string | null
}

export const ORDER_DETAIL_TABS: OrderDetailTab[] = [
  'overview',
  'items',
  'customer',
  'integration',
  'history',
]

export const ORDER_DETAIL_TAB_LABELS: Record<OrderDetailTab, string> = {
  overview: 'Özet',
  items: 'Kalemler',
  customer: 'Müşteri',
  integration: 'Entegrasyon',
  history: 'Geçmiş',
}

export const ORDER_PAYMENT_STATUS_LABELS: Record<OrderPaymentStatus, string> = {
  unpaid: 'Ödenmedi',
  pending: 'Ödeme bekliyor',
  paid: 'Ödendi',
  refunded: 'İade edildi',
  failed: 'Ödeme başarısız',
}

export const ORDER_PAYMENT_METHOD_LABELS: Record<OrderPaymentMethod, string> = {
  credit_card: 'Kredi kartı',
  cash_on_delivery: 'Kapıda ödeme',
  bank_transfer: 'Havale / EFT',
  marketplace: 'Pazaryeri tahsilatı',
  other: 'Diğer',
}

export const ORDER_QUALITY_SEVERITY_LABELS: Record<
  OrderDataQualityIssue['severity'],
  string
> = {
  error: 'Hata',
  warning: 'Uyarı',
  info: 'Bilgi',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  imported: 'İçe aktarıldı',
  pending_review: 'Onay bekliyor',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
  needs_information: 'Bilgi gerekli',
  ready_for_shipment: 'Gönderi bekliyor',
  quote_pending: 'Teklif bekliyor',
  payment_pending: 'Ödeme bekliyor',
  shipment_created: 'Gönderi oluştu',
  processing: 'İşlemde',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
  integration_error: 'Entegrasyon hatası',
}

export const ORDER_CHANNEL_LABELS: Record<OrderChannelType, string> = {
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
  trendyol: 'Trendyol',
  hepsiburada: 'Hepsiburada',
  amazon: 'Amazon',
  excel: 'Excel',
  api: 'API',
  manual: 'Manuel',
}

export const ORDER_VIEW_STATUSES: Record<OrderView, OrderStatus[] | null> = {
  all: null,
  pending: ['imported', 'pending_review', 'needs_information'],
  needs_shipment: ['approved', 'ready_for_shipment', 'quote_pending', 'payment_pending'],
  processing: ['shipment_created', 'processing'],
  rejected: ['rejected', 'cancelled'],
  issues: ['integration_error', 'needs_information'],
  completed: ['completed'],
}

export const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  imported: 'border-slate-400/30 bg-slate-500/10 text-slate-700',
  pending_review: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  approved: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  rejected: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
  needs_information: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  ready_for_shipment: 'border-violet-500/20 bg-violet-500/10 text-violet-700',
  quote_pending: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  payment_pending: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  shipment_created: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  processing: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  completed: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  cancelled: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
  integration_error: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
}

/** Kanban sütunları — operasyonel pipeline */
export const ORDER_KANBAN_COLUMNS: OrderStatus[] = [
  'pending_review',
  'needs_information',
  'approved',
  'ready_for_shipment',
  'quote_pending',
  'payment_pending',
  'processing',
  'shipment_created',
  'completed',
]
