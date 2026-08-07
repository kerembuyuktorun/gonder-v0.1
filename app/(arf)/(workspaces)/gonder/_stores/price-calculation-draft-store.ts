'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  EMPTY_PRICE_DRAFT,
  normalizePriceLocation,
  type CourierSpeed,
  type DraftMode,
  type DraftPiece,
  type LogisticsSubtype,
  type OperationType,
  type PriceCalculationDraft,
  type PriceCalculationLocation,
} from '../_types/price-calculation'

type PriceDraftStore = {
  draft: PriceCalculationDraft
  setOperationType: (value: OperationType) => void
  setOrigin: (value: PriceCalculationLocation | null) => void
  setDestination: (value: PriceCalculationLocation | null) => void
  swapLocations: () => void
  setLogisticsSubtype: (value: LogisticsSubtype) => void
  setVehicleType: (value: string | null) => void
  setBodyType: (value: string | null) => void
  setLoadType: (value: string | null) => void
  setWeightKg: (value: number | null) => void
  setPieces: (pieces: DraftPiece[]) => void
  addPiece: (piece: DraftPiece) => void
  removePiece: (pieceId: string) => void
  setCourierSpeed: (value: CourierSpeed) => void
  setSelectedQuoteId: (value: string | null) => void
  setMode: (value: DraftMode) => void
  patchDraft: (patch: Partial<PriceCalculationDraft>) => void
  resetDraft: () => void
}

function normalizeDraft(draft: Partial<PriceCalculationDraft> | undefined): PriceCalculationDraft {
  return {
    ...EMPTY_PRICE_DRAFT,
    ...draft,
    origin: normalizePriceLocation(draft?.origin),
    destination: normalizePriceLocation(draft?.destination),
    pieces: Array.isArray(draft?.pieces) ? draft.pieces : [],
  }
}

export const usePriceDraftStore = create<PriceDraftStore>()(
  persist(
    (set) => ({
      draft: EMPTY_PRICE_DRAFT,
      setOperationType: (operationType) =>
        set((state) => ({
          draft: {
            ...state.draft,
            operationType,
            logisticsSubtype:
              operationType === 'logistics' ? state.draft.logisticsSubtype ?? 'ltl' : null,
            courierSpeed:
              operationType === 'courier' ? state.draft.courierSpeed ?? 'express' : null,
          },
        })),
      setOrigin: (origin) =>
        set((state) => ({ draft: { ...state.draft, origin: normalizePriceLocation(origin) } })),
      setDestination: (destination) =>
        set((state) => ({
          draft: { ...state.draft, destination: normalizePriceLocation(destination) },
        })),
      swapLocations: () =>
        set((state) => ({
          draft: {
            ...state.draft,
            origin: state.draft.destination,
            destination: state.draft.origin,
          },
        })),
      setLogisticsSubtype: (logisticsSubtype) =>
        set((state) => ({ draft: { ...state.draft, logisticsSubtype } })),
      setVehicleType: (vehicleType) =>
        set((state) => ({ draft: { ...state.draft, vehicleType } })),
      setBodyType: (bodyType) => set((state) => ({ draft: { ...state.draft, bodyType } })),
      setLoadType: (loadType) => set((state) => ({ draft: { ...state.draft, loadType } })),
      setWeightKg: (weightKg) => set((state) => ({ draft: { ...state.draft, weightKg } })),
      setPieces: (pieces) => set((state) => ({ draft: { ...state.draft, pieces } })),
      addPiece: (piece) =>
        set((state) => ({ draft: { ...state.draft, pieces: [...state.draft.pieces, piece] } })),
      removePiece: (pieceId) =>
        set((state) => ({
          draft: {
            ...state.draft,
            pieces: state.draft.pieces.filter((piece) => piece.id !== pieceId),
          },
        })),
      setCourierSpeed: (courierSpeed) =>
        set((state) => ({ draft: { ...state.draft, courierSpeed } })),
      setSelectedQuoteId: (selectedQuoteId) =>
        set((state) => ({ draft: { ...state.draft, selectedQuoteId } })),
      setMode: (mode) => set((state) => ({ draft: { ...state.draft, mode } })),
      patchDraft: (patch) =>
        set((state) => ({
          draft: normalizeDraft({
            ...state.draft,
            ...patch,
          }),
        })),
      resetDraft: () => set({ draft: EMPTY_PRICE_DRAFT }),
    }),
    {
      name: 'gonder-price-calculation-draft-v3',
      partialize: (state) => ({ draft: state.draft }),
      merge: (persisted, current) => {
        const persistedState = persisted as { draft?: Partial<PriceCalculationDraft> } | undefined
        return {
          ...current,
          draft: normalizeDraft(persistedState?.draft),
        }
      },
    }
  )
)

export function isPriceDraftReady(draft: PriceCalculationDraft): boolean {
  if (!draft.operationType) return false
  if (!draft.origin?.label?.trim() || !draft.origin.city?.trim()) return false
  if (!draft.destination?.label?.trim() || !draft.destination.city?.trim()) return false

  if (draft.operationType === 'logistics') {
    if (!draft.logisticsSubtype) return false
    if (draft.logisticsSubtype === 'ftl') {
      return Boolean(draft.vehicleType && draft.bodyType)
    }
    return Boolean(draft.loadType && draft.weightKg && draft.weightKg > 0)
  }

  if (draft.operationType === 'courier' && !draft.courierSpeed) return false
  if (!draft.pieces.length) return false
  return draft.pieces.every(
    (piece) =>
      piece.type.trim() &&
      piece.quantity >= 1 &&
      piece.widthCm > 0 &&
      piece.lengthCm > 0 &&
      piece.heightCm > 0 &&
      piece.weightKg > 0 &&
      piece.desi >= 0
  )
}
