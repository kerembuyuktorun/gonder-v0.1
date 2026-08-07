export type DesiAdjustmentStatus =
  | 'unreviewed'
  | 'acknowledged'
  | 'disputed'
  | 'charge_pending'
  | 'charge_accepted'
  | 'charge_waived'
  | 'resolved'

export type DesiAdjustmentView =
  | 'all'
  | 'unreviewed'
  | 'in_review'
  | 'charge'
  | 'resolved'

export type GonderDesiAdjustment = {
  id: string
  shipmentRef: string
  orderNumber: string | null
  carrier: string
  declaredDesi: number
  measuredDesi: number
  declaredWeightKg: number
  measuredWeightKg: number
  deltaDesi: number
  deltaWeightKg: number
  chargeTry: number | null
  status: DesiAdjustmentStatus
  createdAt: string
  note?: string
}

export const DESI_STATUS_LABELS: Record<DesiAdjustmentStatus, string> = {
  unreviewed: 'İncelenmedi',
  acknowledged: 'Bilgilendirildi',
  disputed: 'İtiraz edildi',
  charge_pending: 'Ücret farkı bekliyor',
  charge_accepted: 'Ücret kabul',
  charge_waived: 'Ücret feragat',
  resolved: 'Çözüldü',
}

export const DESI_VIEW_STATUSES: Record<DesiAdjustmentView, DesiAdjustmentStatus[] | null> = {
  all: null,
  unreviewed: ['unreviewed'],
  in_review: ['acknowledged', 'disputed'],
  charge: ['charge_pending', 'charge_accepted', 'charge_waived'],
  resolved: ['resolved'],
}
