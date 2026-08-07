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
  serviceType: string
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
