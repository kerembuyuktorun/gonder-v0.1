import type {
  AddressDraft,
  CourierSpeed,
  DraftPiece,
  OperationType,
} from './price-calculation'

export type CreateShipmentSource =
  | 'manual'
  | 'quote'
  | 'order'
  | 'template'
  | 'repeat'
  | 'excel'

export type CreateShipmentStep = 1 | 2 | 3 | 4 | 5

export type CreateShipmentDraft = {
  step: CreateShipmentStep
  source: CreateShipmentSource
  orderId: string | null
  quoteId: string | null
  templateId: string | null
  repeatShipmentId: string | null
  operationType: OperationType | null
  origin: AddressDraft | null
  destination: AddressDraft | null
  pieces: DraftPiece[]
  courierSpeed: CourierSpeed | null
  providerName: string | null
  serviceName: string | null
  priceTry: number | null
  paymentMethod: 'wallet' | 'invoice' | 'card' | null
  note: string
}

export const CREATE_SHIPMENT_STEPS: Array<{ id: CreateShipmentStep; label: string }> = [
  { id: 1, label: 'Kaynak' },
  { id: 2, label: 'Adresler' },
  { id: 3, label: 'Parçalar' },
  { id: 4, label: 'Teklif' },
  { id: 5, label: 'Onay' },
]

export const EMPTY_CREATE_SHIPMENT_DRAFT: CreateShipmentDraft = {
  step: 1,
  source: 'manual',
  orderId: null,
  quoteId: null,
  templateId: null,
  repeatShipmentId: null,
  operationType: 'parcel',
  origin: null,
  destination: null,
  pieces: [],
  courierSpeed: 'express',
  providerName: null,
  serviceName: null,
  priceTry: null,
  paymentMethod: 'invoice',
  note: '',
}

export function isCreateShipmentStepReady(
  draft: CreateShipmentDraft,
  step: CreateShipmentStep
): boolean {
  if (step === 1) return Boolean(draft.operationType)
  if (step === 2) {
    return Boolean(draft.origin?.label?.trim() && draft.destination?.label?.trim())
  }
  if (step === 3) {
    return (
      draft.pieces.length > 0 &&
      draft.pieces.every(
        (piece) =>
          piece.quantity >= 1 &&
          piece.widthCm > 0 &&
          piece.lengthCm > 0 &&
          piece.heightCm > 0 &&
          piece.weightKg > 0
      )
    )
  }
  if (step === 4) {
    return Boolean(draft.providerName && draft.serviceName && draft.priceTry != null)
  }
  return Boolean(draft.paymentMethod)
}

export function canSubmitCreateShipment(draft: CreateShipmentDraft): boolean {
  return ([1, 2, 3, 4, 5] as CreateShipmentStep[]).every((step) =>
    isCreateShipmentStepReady(draft, step)
  )
}
