import {
  DEMO_CARDS,
  DEMO_THREEDS_CODE,
  buildInstallmentOptions,
  detectCardBrand,
  findInstallmentOption,
  isExpiryPast,
  luhnCheck,
  maskCardNumber,
  onlyDigits,
  validateCardForm,
} from '../_lib/payment-card'
import type {
  CardPayment,
  CardPaymentFailureCode,
  CardPaymentRequest,
} from '../_types/payment'

export interface QuotePaymentsRepository {
  /** Kartı provizyona gönderir. 3D Secure açıksa `threeds_required` döner. */
  authorize(request: CardPaymentRequest): Promise<CardPayment>
  /** 3D Secure adımını tamamlar. */
  confirmThreeDSecure(paymentId: string, code: string): Promise<CardPayment>
  getById(paymentId: string): Promise<CardPayment | null>
  listByRequest(requestId: string): Promise<CardPayment[]>
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomDigits(length: number) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')
}

/** Demo sonuç kart numarasından deterministik türetilir. */
function resolveOutcome(cardNumber: string): CardPaymentFailureCode | null {
  const digits = onlyDigits(cardNumber)
  const demo = DEMO_CARDS.find((card) => onlyDigits(card.number) === digits)
  if (demo) return demo.outcome === 'success' ? null : demo.outcome
  return luhnCheck(digits) ? null : 'invalid_card'
}

export class MockQuotePaymentsRepository implements QuotePaymentsRepository {
  private payments = new Map<string, CardPayment>()
  /** paymentId → 3DS sonrası uygulanacak sonuç */
  private pendingOutcomes = new Map<string, CardPaymentFailureCode | null>()

  async authorize(request: CardPaymentRequest): Promise<CardPayment> {
    await delay(900)

    const { card, amountTry } = request
    const brand = detectCardBrand(card.number)
    const installmentOptions = buildInstallmentOptions(amountTry, brand)
    const installment = findInstallmentOption(installmentOptions, card.installment)
    const now = new Date().toISOString()

    const base: CardPayment = {
      id: `pay-${Date.now()}-${randomDigits(4)}`,
      reference: `ODM-${randomDigits(8)}`,
      requestId: request.requestId,
      offerId: request.offerId,
      amountTry,
      chargedTry: installment.totalTry,
      installment: installment.count,
      brand,
      maskedNumber: maskCardNumber(card.number),
      holder: card.holder.trim().toLocaleUpperCase('tr-TR'),
      status: 'failed',
      threeDSecure: card.use3ds,
      authCode: null,
      failureCode: null,
      createdAt: now,
      paidAt: null,
    }

    if (Object.keys(validateCardForm(card)).length > 0) {
      const failed: CardPayment = {
        ...base,
        failureCode: isExpiryPast(card.expiry) ? 'expired_card' : 'invalid_card',
      }
      this.payments.set(failed.id, failed)
      return failed
    }

    const outcome = resolveOutcome(card.number)

    if (card.use3ds) {
      const challenged: CardPayment = { ...base, status: 'threeds_required' }
      this.payments.set(challenged.id, challenged)
      this.pendingOutcomes.set(challenged.id, outcome)
      return challenged
    }

    const settled = this.settle(base, outcome)
    this.payments.set(settled.id, settled)
    return settled
  }

  async confirmThreeDSecure(paymentId: string, code: string): Promise<CardPayment> {
    await delay(700)
    const current = this.payments.get(paymentId)
    if (!current) throw new Error('Ödeme kaydı bulunamadı')

    if (onlyDigits(code) !== DEMO_THREEDS_CODE) {
      const failed: CardPayment = { ...current, status: 'failed', failureCode: 'threeds_failed' }
      this.payments.set(paymentId, failed)
      return failed
    }

    const outcome = this.pendingOutcomes.get(paymentId) ?? null
    this.pendingOutcomes.delete(paymentId)
    const settled = this.settle(current, outcome)
    this.payments.set(paymentId, settled)
    return settled
  }

  async getById(paymentId: string): Promise<CardPayment | null> {
    await delay(30)
    return this.payments.get(paymentId) ?? null
  }

  async listByRequest(requestId: string): Promise<CardPayment[]> {
    await delay(30)
    return [...this.payments.values()].filter((payment) => payment.requestId === requestId)
  }

  private settle(payment: CardPayment, failureCode: CardPaymentFailureCode | null): CardPayment {
    if (failureCode) {
      return { ...payment, status: 'failed', failureCode, authCode: null, paidAt: null }
    }
    return {
      ...payment,
      status: 'succeeded',
      failureCode: null,
      authCode: randomDigits(6),
      paidAt: new Date().toISOString(),
    }
  }
}

export const quotePaymentsRepository: QuotePaymentsRepository =
  new MockQuotePaymentsRepository()
