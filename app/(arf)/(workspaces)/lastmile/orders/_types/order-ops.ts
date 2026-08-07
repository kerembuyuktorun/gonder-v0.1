/** Last Mile sipariş operasyonları — iptal talebi, iade alt-sipariş, ertesi güne devir. */

export type CancelRequestStatus = 'pending' | 'approved' | 'rejected'

export type CancelRequest = {
  id: string
  orderId: string
  orderTakipNo?: string
  customerName?: string
  reasonCode: string
  reasonLabel: string
  note?: string
  status: CancelRequestStatus
  requestedBy: string
  requestedAt: string
  decidedBy?: string
  decidedAt?: string
  decisionNote?: string
}

export type ReturnSuborderLink = {
  id: string
  parentOrderId: string
  returnOrderId: string
  returnTakipNo: string
  returnFee: number
  returnFeePercent: number
  packageIds: string[]
  reasonLabel?: string
  createdAt: string
  createdBy: string
}

export type DeliveryDeferral = {
  id: string
  orderId: string
  reasonCode: string
  reasonLabel: string
  note?: string
  deferredToDate: string
  attemptNo: number
  createdAt: string
  createdBy: string
}

export type OrderOpsOverlay = {
  /** Demo/mock sipariş durum override */
  statusByOrderId: Record<string, string>
  /** Rota koparma / ETA güncellemesi */
  metaByOrderId: Record<
    string,
    {
      rota_atandi?: boolean
      atanan_kurye?: string | null
      atanan_arac?: string | null
      eta?: string
      alim_zaman_penceresi?: string
      teslim_zaman_penceresi?: string
      parent_order_id?: string
    }
  >
}
