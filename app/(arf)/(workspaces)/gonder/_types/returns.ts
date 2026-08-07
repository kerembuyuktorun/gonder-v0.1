export type ReturnStatus =
  | 'requested'
  | 'awaiting_approval'
  | 'approved'
  | 'rejected'
  | 'label_ready'
  | 'awaiting_handover'
  | 'handed_to_carrier'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'exception'

export type ReturnView =
  | 'all'
  | 'in_progress'
  | 'returned'
  | 'completed'
  | 'rejected_cancelled'

export type GonderReturn = {
  id: string
  orderNumber: string
  customerName: string
  requestedAt: string
  status: ReturnStatus
  handoverPoint: string | null
  carrierRef: string | null
  carrier: string
  returnMethod: string
  /** Etiket / POD / foto belgesi meta */
  documents: {
    labelReady: boolean
    hasProofOfDelivery: boolean
    hasPhotos: boolean
  }
  note?: string
}

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  requested: 'Talep alındı',
  awaiting_approval: 'Onay bekliyor',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
  label_ready: 'Etiket hazır',
  awaiting_handover: 'Teslim bekliyor',
  handed_to_carrier: 'Taşıyıcıya verildi',
  in_transit: 'Yolda',
  delivered: 'Teslim edildi',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
  exception: 'Sorunlu',
}

export const RETURN_VIEW_STATUSES: Record<ReturnView, ReturnStatus[] | null> = {
  all: null,
  in_progress: [
    'requested',
    'awaiting_approval',
    'approved',
    'label_ready',
    'awaiting_handover',
    'handed_to_carrier',
    'in_transit',
  ],
  returned: ['delivered'],
  completed: ['completed'],
  rejected_cancelled: ['rejected', 'cancelled', 'exception'],
}

export const ACTIVE_RETURN_STATUSES: ReturnStatus[] = [
  'requested',
  'awaiting_approval',
  'approved',
  'label_ready',
  'awaiting_handover',
  'handed_to_carrier',
  'in_transit',
  'exception',
]
