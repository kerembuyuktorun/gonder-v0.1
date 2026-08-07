import type { OperationType } from './price-calculation'

export type { OperationType }

export type LogisticsMode = 'ftl' | 'ltl' | 'spot'

export type ShipmentServiceType =
  | 'parcel'
  | 'courier'
  | 'xl'
  | 'ftl'
  | 'ltl'
  | 'spot'

/** Birincil sekme: tümü + operasyon tipi */
export type ShipmentOperationTab = 'all' | OperationType

export type ShipmentListStatus =
  | 'draft'
  | 'label_ready'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'returned'
  | 'cancelled'
  | 'exception'

export type ShipmentView = 'all' | 'active' | 'delivered' | 'returned' | 'issues' | 'cancelled'

export type GonderShipmentListItem = {
  id: string
  reference: string
  orderNumber: string | null
  carrier: string
  /** Pazarlama / teklif hizmet adı (Express, Aynı Gün vb.) */
  serviceLabel: string
  serviceType: ShipmentServiceType
  operationType: OperationType
  logisticsMode: LogisticsMode | null
  originCity: string
  destinationCity: string
  status: ShipmentListStatus
  desi: number
  weightKg: number
  amountTry: number | null
  createdAt: string
  updatedAt: string
}

export const SHIPMENT_STATUS_LABELS: Record<ShipmentListStatus, string> = {
  draft: 'Taslak',
  label_ready: 'Etiket hazır',
  picked_up: 'Alındı',
  in_transit: 'Yolda',
  out_for_delivery: 'Dağıtımda',
  delivered: 'Teslim',
  returned: 'İade',
  cancelled: 'İptal',
  exception: 'Sorunlu',
}

export const SHIPMENT_OPERATION_LABELS: Record<OperationType, string> = {
  parcel: 'Kargo',
  courier: 'Kurye',
  logistics: 'Lojistik',
}

export const SHIPMENT_OPERATION_TAB_LABELS: Record<ShipmentOperationTab, string> = {
  all: 'Tüm Gönderiler',
  parcel: 'Kargo',
  courier: 'Kurye',
  logistics: 'Lojistik',
}

export const SHIPMENT_SERVICE_TYPE_LABELS: Record<ShipmentServiceType, string> = {
  parcel: 'Parcel',
  courier: 'Kurye',
  xl: 'XL',
  ftl: 'FTL',
  ltl: 'LTL',
  spot: 'Spot',
}

export const LOGISTICS_MODE_LABELS: Record<LogisticsMode, string> = {
  ftl: 'FTL / Komple',
  ltl: 'LTL / Parsiyel',
  spot: 'Spot',
}

export const SHIPMENT_VIEW_STATUSES: Record<ShipmentView, ShipmentListStatus[] | null> = {
  all: null,
  active: ['draft', 'label_ready', 'picked_up', 'in_transit', 'out_for_delivery'],
  delivered: ['delivered'],
  returned: ['returned'],
  issues: ['exception'],
  cancelled: ['cancelled'],
}

export const SHIPMENT_STATUS_BADGE: Record<ShipmentListStatus, string> = {
  draft: 'border-slate-400/30 bg-slate-500/10 text-slate-700',
  label_ready: 'border-violet-500/20 bg-violet-500/10 text-violet-700',
  picked_up: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  in_transit: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  out_for_delivery: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  delivered: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  returned: 'border-violet-500/20 bg-violet-500/10 text-violet-700',
  cancelled: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
  exception: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
}

export const SHIPMENT_OPERATION_BADGE: Record<OperationType, string> = {
  parcel: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  courier: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  logistics: 'border-violet-500/20 bg-violet-500/10 text-violet-700',
}

export function serviceTypeToOperation(serviceType: ShipmentServiceType): OperationType {
  if (serviceType === 'courier') return 'courier'
  if (serviceType === 'ftl' || serviceType === 'ltl' || serviceType === 'spot') return 'logistics'
  return 'parcel'
}

export function resolveShipmentServiceType(
  operationType: OperationType | null | undefined,
  options?: { logisticsMode?: LogisticsMode | null; preferXl?: boolean }
): ShipmentServiceType {
  if (operationType === 'courier') return 'courier'
  if (operationType === 'logistics') return options?.logisticsMode ?? 'spot'
  return options?.preferXl ? 'xl' : 'parcel'
}

/** Detail URL sekmesi */
export type ShipmentDetailTab =
  | 'overview'
  | 'tracking'
  | 'packages'
  | 'documents'
  | 'finance'
  | 'history'

export const SHIPMENT_DETAIL_TABS: readonly ShipmentDetailTab[] = [
  'overview',
  'tracking',
  'packages',
  'documents',
  'finance',
  'history',
] as const

export const SHIPMENT_DETAIL_TAB_LABELS: Record<ShipmentDetailTab, string> = {
  overview: 'Genel bakış',
  tracking: 'Takip',
  packages: 'Paketler',
  documents: 'Belgeler',
  finance: 'Finans',
  history: 'Geçmiş',
}

export type TrackingEventStatus = 'completed' | 'active' | 'pending' | 'exception'

export type ShipmentTrackingEvent = {
  id: string
  title: string
  description: string
  location: string | null
  occurredAt: string | null
  status: TrackingEventStatus
}

export type ShipmentPackageStatus =
  | 'created'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception'
  | 'returned'

export type ShipmentPackage = {
  id: string
  barcode: string
  label: string
  desi: number
  weightKg: number
  lengthCm: number | null
  widthCm: number | null
  heightCm: number | null
  status: ShipmentPackageStatus
}

export const SHIPMENT_PACKAGE_STATUS_LABELS: Record<ShipmentPackageStatus, string> = {
  created: 'Oluşturuldu',
  picked_up: 'Alındı',
  in_transit: 'Yolda',
  out_for_delivery: 'Dağıtımda',
  delivered: 'Teslim',
  exception: 'Sorunlu',
  returned: 'İade',
}

export type ShipmentDocumentType = 'label' | 'invoice' | 'pod' | 'waybill' | 'other'

export type ShipmentDocument = {
  id: string
  type: ShipmentDocumentType
  name: string
  status: 'ready' | 'pending' | 'missing'
  createdAt: string | null
}

export const SHIPMENT_DOCUMENT_TYPE_LABELS: Record<ShipmentDocumentType, string> = {
  label: 'Etiket',
  invoice: 'Fatura',
  pod: 'Teslim belgesi (POD)',
  waybill: 'İrsaliye',
  other: 'Diğer',
}

export type ShipmentPaymentStatus = 'unpaid' | 'pending' | 'paid' | 'invoiced' | 'refunded' | 'na'

export type ShipmentFinanceSummary = {
  amountTry: number | null
  currency: 'TRY'
  paymentStatus: ShipmentPaymentStatus
  invoiceNumber: string | null
  paymentMethod: string | null
  chargedAt: string | null
  note: string | null
}

export const SHIPMENT_PAYMENT_STATUS_LABELS: Record<ShipmentPaymentStatus, string> = {
  unpaid: 'Ödenmedi',
  pending: 'Beklemede',
  paid: 'Ödendi',
  invoiced: 'Faturalandı',
  refunded: 'İade edildi',
  na: 'Yok',
}

export const SHIPMENT_PAYMENT_STATUS_BADGE: Record<ShipmentPaymentStatus, string> = {
  unpaid: 'border-rose-500/20 bg-rose-500/10 text-rose-700',
  pending: 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  paid: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  invoiced: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  refunded: 'border-violet-500/20 bg-violet-500/10 text-violet-700',
  na: 'border-slate-400/30 bg-slate-500/10 text-slate-700',
}

export type ShipmentHistoryEvent = {
  id: string
  action: string
  actor: string
  detail: string | null
  occurredAt: string
}

export type ShipmentDriverInfo = {
  name: string
  phone: string | null
  carrierCode: string | null
}

export type ShipmentVehicleInfo = {
  plate: string
  typeLabel: string
  capacityLabel: string | null
}

export type ShipmentIssue = {
  id: string
  severity: 'warning' | 'critical'
  title: string
  description: string
  openedAt: string
  status: 'open' | 'resolved'
}

export type ShipmentLinkedOrder = {
  id: string
  orderNumber: string
  customerName: string | null
  statusLabel: string | null
}

export type ShipmentLinkedQuote = {
  id: string
  reference: string
  providerName: string | null
}

export type ShipmentPartySummary = {
  name: string
  phone: string | null
  city: string
  district: string | null
  addressLine: string | null
}

export type GonderShipmentDetail = GonderShipmentListItem & {
  trackingNumber: string
  etaLabel: string | null
  pickupAt: string | null
  deliveredAt: string | null
  pieceCount: number
  sender: ShipmentPartySummary
  receiver: ShipmentPartySummary
  driver: ShipmentDriverInfo | null
  vehicle: ShipmentVehicleInfo | null
  linkedOrder: ShipmentLinkedOrder | null
  linkedQuote: ShipmentLinkedQuote | null
  readinessSummary: string
  issues: ShipmentIssue[]
  trackingEvents: ShipmentTrackingEvent[]
  packages: ShipmentPackage[]
  documents: ShipmentDocument[]
  finance: ShipmentFinanceSummary
  history: ShipmentHistoryEvent[]
}
