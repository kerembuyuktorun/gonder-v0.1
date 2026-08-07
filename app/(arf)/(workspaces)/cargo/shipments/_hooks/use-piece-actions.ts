"use client"

import { useCallback, useState } from "react"
import {
  shipmentActionsApi,
  type DeliveryEntryPayload,
  type PieceCancelPayload,
  type PieceReportPayload,
  type ShipmentCancelPayload,
  type ShipmentHandoverPayload,
} from "../_api/shipment-actions-api"

type ActionKind = "deliveryEntry" | "pieceReport" | "pieceCancel" | "shipmentHandover" | "shipmentCancel"

type ActionState = {
  loading: Record<ActionKind, boolean>
  error: string | null
  lastMessage: string | null
}

const initialLoading: Record<ActionKind, boolean> = {
  deliveryEntry: false,
  pieceReport: false,
  pieceCancel: false,
  shipmentHandover: false,
  shipmentCancel: false,
}

export function usePieceActions() {
  const [state, setState] = useState<ActionState>({
    loading: initialLoading,
    error: null,
    lastMessage: null,
  })

  const runAction = useCallback(async <T,>(kind: ActionKind, action: (payload: T) => Promise<{ ok: boolean; message?: string }>, payload: T) => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, [kind]: true },
      error: null,
    }))

    try {
      const result = await action(payload)
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, [kind]: false },
        lastMessage: result.message || null,
      }))
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu."
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, [kind]: false },
        error: message,
      }))
      return { ok: false, message }
    }
  }, [])

  const submitDeliveryEntry = useCallback(
    (payload: DeliveryEntryPayload) => runAction("deliveryEntry", shipmentActionsApi.submitDeliveryEntry, payload),
    [runAction],
  )

  const submitPieceReport = useCallback(
    (payload: PieceReportPayload) => runAction("pieceReport", shipmentActionsApi.submitPieceReport, payload),
    [runAction],
  )

  const submitPieceCancel = useCallback(
    (payload: PieceCancelPayload) => runAction("pieceCancel", shipmentActionsApi.submitPieceCancel, payload),
    [runAction],
  )

  const submitShipmentHandover = useCallback(
    (payload: ShipmentHandoverPayload) => runAction("shipmentHandover", shipmentActionsApi.submitShipmentHandover, payload),
    [runAction],
  )

  const submitShipmentCancel = useCallback(
    (payload: ShipmentCancelPayload) => runAction("shipmentCancel", shipmentActionsApi.submitShipmentCancel, payload),
    [runAction],
  )

  const clearActionFeedback = useCallback(() => {
    setState((prev) => ({ ...prev, error: null, lastMessage: null }))
  }, [])

  return {
    ...state,
    submitDeliveryEntry,
    submitPieceReport,
    submitPieceCancel,
    submitShipmentHandover,
    submitShipmentCancel,
    clearActionFeedback,
  }
}
