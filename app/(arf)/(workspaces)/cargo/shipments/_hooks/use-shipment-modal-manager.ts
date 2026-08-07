"use client"

import { useCallback, useState } from "react"

type ModalKey =
  | "deliveryInfo"
  | "pieceReportInfo"
  | "pieceDeliveryEntry"
  | "pieceReport"
  | "pieceCancel"
  | "shipmentHandover"
  | "shipmentCancel"

type ModalPayloadMap = {
  deliveryInfo: { pieceId: string }
  pieceReportInfo: { pieceId: string }
  pieceDeliveryEntry: { pieceNos: string[] }
  pieceReport: { pieceNos: string[] }
  pieceCancel: { pieceNos: string[] }
  shipmentHandover: { trackingNo: string }
  shipmentCancel: { trackingNo: string }
}

type ModalState<K extends ModalKey = ModalKey> = {
  key: K
  payload: ModalPayloadMap[K]
}

export function useShipmentModalManager() {
  const [activeModal, setActiveModal] = useState<ModalState | null>(null)

  const openModal = useCallback(<K extends ModalKey>(key: K, payload: ModalPayloadMap[K]) => {
    setActiveModal({ key, payload } as ModalState)
  }, [])

  const closeModal = useCallback(() => {
    setActiveModal(null)
  }, [])

  return {
    activeModal,
    openModal,
    closeModal,
    isOpen: (key: ModalKey) => activeModal?.key === key,
  }
}
