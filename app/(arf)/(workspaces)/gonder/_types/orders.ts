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

export type OrderChannel = 'shopify' | 'trendyol' | 'excel' | 'api' | 'manual'

export type GonderOrder = {
  id: string
  orderNumber: string
  channel: OrderChannel
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

export const ORDER_CHANNEL_LABELS: Record<OrderChannel, string> = {
  shopify: 'Shopify',
  trendyol: 'Trendyol',
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
