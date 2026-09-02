/**
 * Gönder — teklif onayı sonrası kredi kartı ile ödeme (demo gateway).
 *
 * Gerçek PSP entegrasyonunda kart verisi hiçbir zaman uygulama state'inde
 * tutulmaz; iframe/hosted field kullanılır. Buradaki tipler yalnızca demo
 * akışını modellemek için vardır.
 */

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'troy' | 'unknown'

export type CardPaymentStatus =
  | 'threeds_required'
  | 'succeeded'
  | 'failed'

export type CardPaymentFailureCode =
  | 'invalid_card'
  | 'expired_card'
  | 'insufficient_funds'
  | 'do_not_honor'
  | 'threeds_failed'

export type CardFormValue = {
  /** Boşluklu gösterim değeri — doğrulama öncesi normalize edilir */
  number: string
  holder: string
  /** MM/YY */
  expiry: string
  cvv: string
  installment: number
  use3ds: boolean
  saveCard: boolean
}

export type CardFormField = 'number' | 'holder' | 'expiry' | 'cvv'

export type CardFormErrors = Partial<Record<CardFormField, string>>

export type InstallmentOption = {
  count: number
  monthlyTry: number
  totalTry: number
  /** Vade farkı oranı — 0 ise faizsiz */
  surchargeRate: number
}

export type CardPaymentRequest = {
  requestId: string
  offerId: string | null
  amountTry: number
  card: CardFormValue
}

export type CardPayment = {
  id: string
  reference: string
  requestId: string
  offerId: string | null
  /** Teklif tutarı (vade farkı hariç) */
  amountTry: number
  /** Karta çekilen tutar (vade farkı dahil) */
  chargedTry: number
  installment: number
  brand: CardBrand
  maskedNumber: string
  holder: string
  status: CardPaymentStatus
  threeDSecure: boolean
  authCode: string | null
  failureCode: CardPaymentFailureCode | null
  createdAt: string
  paidAt: string | null
}

/** Teklif / gönderi kaydına iliştirilen kalıcı ödeme özeti */
export type QuotePaymentSummary = {
  paymentId: string
  reference: string
  amountTry: number
  chargedTry: number
  installment: number
  brand: CardBrand
  maskedNumber: string
  authCode: string | null
  threeDSecure: boolean
  paidAt: string
}

export const CARD_BRAND_LABELS: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  troy: 'Troy',
  unknown: 'Kart',
}

export const CARD_PAYMENT_FAILURE_LABELS: Record<CardPaymentFailureCode, string> = {
  invalid_card: 'Kart numarası geçersiz. Bilgileri kontrol edip tekrar deneyin.',
  expired_card: 'Kartın son kullanma tarihi geçmiş.',
  insufficient_funds: 'Kart limiti bu işlem için yetersiz.',
  do_not_honor: 'Banka işlemi onaylamadı (do not honor). Farklı bir kart deneyin.',
  threeds_failed: '3D Secure doğrulaması tamamlanamadı.',
}

export const EMPTY_CARD_FORM: CardFormValue = {
  number: '',
  holder: '',
  expiry: '',
  cvv: '',
  installment: 1,
  use3ds: true,
  saveCard: false,
}

export function toQuotePaymentSummary(payment: CardPayment): QuotePaymentSummary {
  return {
    paymentId: payment.id,
    reference: payment.reference,
    amountTry: payment.amountTry,
    chargedTry: payment.chargedTry,
    installment: payment.installment,
    brand: payment.brand,
    maskedNumber: payment.maskedNumber,
    authCode: payment.authCode,
    threeDSecure: payment.threeDSecure,
    paidAt: payment.paidAt ?? new Date().toISOString(),
  }
}
