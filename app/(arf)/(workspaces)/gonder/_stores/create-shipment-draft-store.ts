'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  EMPTY_CREATE_SHIPMENT_DRAFT,
  type CreateShipmentDraft,
  type CreateShipmentSource,
  type CreateShipmentStep,
} from '../_types/create-shipment'
import type { QuotePaymentSummary } from '../_types/payment'
import type {
  AddressDraft,
  CourierSpeed,
  DraftPiece,
  OperationType,
} from '../_types/price-calculation'

type CreateShipmentStore = {
  draft: CreateShipmentDraft
  setStep: (step: CreateShipmentStep) => void
  setSource: (source: CreateShipmentSource) => void
  setOperationType: (value: OperationType) => void
  setOrigin: (value: AddressDraft | null) => void
  setDestination: (value: AddressDraft | null) => void
  setPieces: (pieces: DraftPiece[]) => void
  addPiece: (piece: DraftPiece) => void
  removePiece: (pieceId: string) => void
  setCourierSpeed: (value: CourierSpeed | null) => void
  setQuoteSummary: (value: {
    quoteId?: string | null
    providerName: string | null
    serviceName: string | null
    priceTry: number | null
  }) => void
  setPaymentMethod: (value: CreateShipmentDraft['paymentMethod']) => void
  setCardPayment: (value: QuotePaymentSummary | null) => void
  setNote: (value: string) => void
  patchDraft: (patch: Partial<CreateShipmentDraft>) => void
  hydrateFromSources: (patch: Partial<CreateShipmentDraft>) => void
  resetDraft: () => void
}

function normalizeDraft(draft: Partial<CreateShipmentDraft> | undefined): CreateShipmentDraft {
  return {
    ...EMPTY_CREATE_SHIPMENT_DRAFT,
    ...draft,
    pieces: Array.isArray(draft?.pieces) ? draft.pieces : [],
  }
}

export const useCreateShipmentStore = create<CreateShipmentStore>()(
  persist(
    (set) => ({
      draft: EMPTY_CREATE_SHIPMENT_DRAFT,
      setStep: (step) => set((state) => ({ draft: { ...state.draft, step } })),
      setSource: (source) => set((state) => ({ draft: { ...state.draft, source } })),
      setOperationType: (operationType) =>
        set((state) => ({ draft: { ...state.draft, operationType } })),
      setOrigin: (origin) => set((state) => ({ draft: { ...state.draft, origin } })),
      setDestination: (destination) =>
        set((state) => ({ draft: { ...state.draft, destination } })),
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
      setQuoteSummary: ({ quoteId, providerName, serviceName, priceTry }) =>
        set((state) => ({
          draft: {
            ...state.draft,
            quoteId: quoteId === undefined ? state.draft.quoteId : quoteId,
            providerName,
            serviceName,
            priceTry,
          },
        })),
      setPaymentMethod: (paymentMethod) =>
        set((state) => ({
          draft: {
            ...state.draft,
            paymentMethod,
            // Karttan başka yönteme geçilirse tahsilat kaydı taslakta tutulmaz.
            cardPayment: paymentMethod === 'card' ? state.draft.cardPayment : null,
          },
        })),
      setCardPayment: (cardPayment) =>
        set((state) => ({ draft: { ...state.draft, cardPayment } })),
      setNote: (note) => set((state) => ({ draft: { ...state.draft, note } })),
      patchDraft: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),
      hydrateFromSources: (patch) =>
        set((state) => ({
          draft: normalizeDraft({ ...state.draft, ...patch }),
        })),
      resetDraft: () => set({ draft: EMPTY_CREATE_SHIPMENT_DRAFT }),
    }),
    {
      name: 'gonder-create-shipment-draft-v1',
      partialize: (state) => ({ draft: state.draft }),
      merge: (persisted, current) => {
        const persistedState = persisted as { draft?: Partial<CreateShipmentDraft> } | undefined
        return {
          ...current,
          draft: normalizeDraft(persistedState?.draft),
        }
      },
    }
  )
)
