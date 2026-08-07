export type ShipmentActionResult = {
  ok: boolean
  message?: string
}

export type DeliveryEntryPayload = {
  pieceNos: string[]
  firstName: string
  lastName: string
  phone: string
}

export type PieceReportPayload = {
  pieceNos: string[]
  reason: string
  description: string
}

export type PieceCancelPayload = {
  pieceNos: string[]
  reason: string
  note: string
}

export type ShipmentHandoverPayload = {
  trackingNo: string
  reason: string
  note: string
}

export type ShipmentCancelPayload = {
  trackingNo: string
  reason: string
  note: string
}

const success = (message: string): ShipmentActionResult => ({ ok: true, message })

export const shipmentActionsApi = {
  async submitDeliveryEntry(payload: DeliveryEntryPayload): Promise<ShipmentActionResult> {
    void payload
    return success("Teslimat bilgisi kaydedildi.")
  },

  async submitPieceReport(payload: PieceReportPayload): Promise<ShipmentActionResult> {
    void payload
    return success("Parça ihbarı kaydedildi.")
  },

  async submitPieceCancel(payload: PieceCancelPayload): Promise<ShipmentActionResult> {
    void payload
    return success("Parça iptal talebi alındı.")
  },

  async submitShipmentHandover(payload: ShipmentHandoverPayload): Promise<ShipmentActionResult> {
    void payload
    return { ok: true }
  },

  async submitShipmentCancel(payload: ShipmentCancelPayload): Promise<ShipmentActionResult> {
    void payload
    return success("Kargo iptal talebi alındı.")
  },
}
