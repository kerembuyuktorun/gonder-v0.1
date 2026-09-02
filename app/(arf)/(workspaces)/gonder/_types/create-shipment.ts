import type {
  Offer,
  OrderDraft,
} from '../../../../(marketing)/siparis/_lib/order-types'
import type { QuotePaymentSummary } from './payment'
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
  /** Teklif talebi (TKF) kimliği — ödeme ve dönüşüm kaydı için */
  quoteRequestId: string | null
  /** Çoklu siparişten kargo: tüm bağlı sipariş id’leri */
  linkedOrderIds: string[]
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
  /** Kart ile tahsilat tamamlandıysa ödeme özeti */
  cardPayment: QuotePaymentSummary | null
  note: string
  /** Landing sipariş sihirbazı taslağı — panel UI kaynağı */
  siparis: OrderDraft | null
  siparisStep: string
  selectedOffer: Offer | null
}

export const CREATE_SHIPMENT_STEPS: Array<{ id: CreateShipmentStep; label: string }> = [
  { id: 1, label: 'Hizmet' },
  { id: 2, label: 'Adres' },
  { id: 3, label: 'Detaylar' },
  { id: 4, label: 'Teklif' },
  { id: 5, label: 'Ödeme' },
]

export const EMPTY_CREATE_SHIPMENT_DRAFT: CreateShipmentDraft = {
  step: 1,
  source: 'manual',
  orderId: null,
  quoteId: null,
  quoteRequestId: null,
  linkedOrderIds: [],
  templateId: null,
  repeatShipmentId: null,
  operationType: null,
  origin: null,
  destination: null,
  pieces: [],
  courierSpeed: 'express',
  providerName: null,
  serviceName: null,
  priceTry: null,
  paymentMethod: 'invoice',
  cardPayment: null,
  note: '',
  siparis: null,
  siparisStep: 'route',
  selectedOffer: null,
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
    const quoteReady = Boolean(draft.providerName && draft.serviceName && draft.priceTry != null)
    if (!quoteReady) return false
    if (!draft.courierSpeed) return false
    return true
  }
  if (!draft.paymentMethod) return false
  // Kart seçildiyse tahsilat tamamlanmış olmalı.
  return draft.paymentMethod !== 'card' || draft.cardPayment != null
}

export function canSubmitCreateShipment(draft: CreateShipmentDraft): boolean {
  return getCreateShipmentMissingFields(draft).length === 0
}

/** Tek sayfa form için eksik alan listesi (özet paneli) */
export function getCreateShipmentMissingFields(draft: CreateShipmentDraft): string[] {
  const missing: string[] = []
  if (!draft.operationType) missing.push('Hizmet tipi')
  if (!draft.origin?.label?.trim()) missing.push('Çıkış adresi')
  if (!draft.destination?.label?.trim()) missing.push('Varış adresi')
  const originKey = (draft.origin?.placeId || draft.origin?.label || '').trim().toLocaleLowerCase('tr-TR')
  const destKey = (draft.destination?.placeId || draft.destination?.label || '').trim().toLocaleLowerCase('tr-TR')
  if (
    draft.origin?.label?.trim() &&
    draft.destination?.label?.trim() &&
    originKey.length > 0 &&
    originKey === destKey
  ) {
    missing.push('Farklı varış adresi')
  }
  if (
    draft.pieces.length === 0 ||
    !draft.pieces.every(
      (piece) =>
        piece.quantity >= 1 &&
        piece.widthCm > 0 &&
        piece.lengthCm > 0 &&
        piece.heightCm > 0 &&
        piece.weightKg > 0
    )
  ) {
    missing.push('Paket / yük bilgisi')
  }
  if (!draft.courierSpeed) missing.push('Teslimat zamanı')
  if (draft.priceTry == null) missing.push('Tahmini ücret')
  if (!draft.paymentMethod) missing.push('Ödeme yöntemi')
  if (draft.paymentMethod === 'card' && !draft.cardPayment) missing.push('Kart ödemesi')
  return missing
}
