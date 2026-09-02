import type {
  CardBrand,
  CardFormErrors,
  CardFormValue,
  InstallmentOption,
} from '../_types/payment'

/** Taksitin açılabilmesi için minimum sepet tutarı */
const INSTALLMENT_MIN_AMOUNT_TRY = 100

/** Vade farkı oranları — taksit sayısı → oran */
const INSTALLMENT_SURCHARGES: Array<{ count: number; surchargeRate: number }> = [
  { count: 1, surchargeRate: 0 },
  { count: 2, surchargeRate: 0 },
  { count: 3, surchargeRate: 0 },
  { count: 6, surchargeRate: 0.045 },
  { count: 9, surchargeRate: 0.075 },
  { count: 12, surchargeRate: 0.105 },
]

export const CARD_NUMBER_MAX_DIGITS = 19

export function onlyDigits(value: string): string {
  return value.replace(/\D+/g, '')
}

export function detectCardBrand(value: string): CardBrand {
  const digits = onlyDigits(value)
  if (!digits) return 'unknown'
  if (/^9792/.test(digits)) return 'troy'
  if (/^3[47]/.test(digits)) return 'amex'
  if (/^4/.test(digits)) return 'visa'
  if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6]\d|7[01]|720)/.test(digits)) return 'mastercard'
  return 'unknown'
}

/** Amex 15 hane / 4-6-5, diğerleri 16 hane / 4-4-4-4 */
function brandGroups(brand: CardBrand): number[] {
  return brand === 'amex' ? [4, 6, 5] : [4, 4, 4, 4]
}

export function cardNumberLength(brand: CardBrand): number {
  return brand === 'amex' ? 15 : 16
}

export function cvvLength(brand: CardBrand): number {
  return brand === 'amex' ? 4 : 3
}

function groupChars(chars: string, groups: number[]): string {
  const parts: string[] = []
  let cursor = 0
  for (const size of groups) {
    if (cursor >= chars.length) break
    parts.push(chars.slice(cursor, cursor + size))
    cursor += size
  }
  if (cursor < chars.length) parts.push(chars.slice(cursor))
  return parts.join(' ')
}

export function formatCardNumber(value: string): string {
  const brand = detectCardBrand(value)
  const digits = onlyDigits(value).slice(0, cardNumberLength(brand) || CARD_NUMBER_MAX_DIGITS)
  return groupChars(digits, brandGroups(brand))
}

/** İlk 6 + son 4 açık, ortası maskeli — PCI görüntüleme kuralı */
export function maskCardNumber(value: string): string {
  const digits = onlyDigits(value)
  if (digits.length < 10) return formatCardNumber(digits)
  const masked = digits
    .split('')
    .map((char, index) => (index >= 6 && index < digits.length - 4 ? '•' : char))
    .join('')
  return groupChars(masked, brandGroups(detectCardBrand(digits)))
}

export function formatExpiryInput(value: string): string {
  const digits = onlyDigits(value).slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function parseExpiry(value: string): { month: number; year: number } | null {
  const digits = onlyDigits(value)
  if (digits.length !== 4) return null
  const month = Number(digits.slice(0, 2))
  const year = 2000 + Number(digits.slice(2))
  if (month < 1 || month > 12) return null
  return { month, year }
}

export function isExpiryPast(value: string, now = new Date()): boolean {
  const parsed = parseExpiry(value)
  if (!parsed) return false
  const lastDay = new Date(parsed.year, parsed.month, 0, 23, 59, 59)
  return lastDay.getTime() < now.getTime()
}

export function luhnCheck(value: string): boolean {
  const digits = onlyDigits(value)
  if (digits.length < 12) return false
  let sum = 0
  let double = false
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index])
    if (double) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    double = !double
  }
  return sum % 10 === 0
}

export function validateCardForm(value: CardFormValue): CardFormErrors {
  const errors: CardFormErrors = {}
  const brand = detectCardBrand(value.number)
  const digits = onlyDigits(value.number)

  if (!digits) errors.number = 'Kart numarası girin'
  else if (digits.length !== cardNumberLength(brand)) {
    errors.number = `Kart numarası ${cardNumberLength(brand)} haneli olmalı`
  } else if (!luhnCheck(digits)) errors.number = 'Kart numarası geçersiz'

  if (!value.holder.trim()) errors.holder = 'Kart sahibini girin'
  else if (value.holder.trim().split(/\s+/).length < 2) errors.holder = 'Ad ve soyad girin'

  if (!parseExpiry(value.expiry)) errors.expiry = 'AA/YY formatında girin'
  else if (isExpiryPast(value.expiry)) errors.expiry = 'Kartın süresi geçmiş'

  if (onlyDigits(value.cvv).length !== cvvLength(brand)) {
    errors.cvv = `${cvvLength(brand)} haneli CVV girin`
  }

  return errors
}

export function isCardFormValid(value: CardFormValue): boolean {
  return Object.keys(validateCardForm(value)).length === 0
}

export function buildInstallmentOptions(
  amountTry: number,
  brand: CardBrand
): InstallmentOption[] {
  const single: InstallmentOption = {
    count: 1,
    monthlyTry: amountTry,
    totalTry: amountTry,
    surchargeRate: 0,
  }
  // Amex yurt içi taksit desteklemiyor; düşük tutarlarda da taksit kapalı.
  if (brand === 'amex' || amountTry < INSTALLMENT_MIN_AMOUNT_TRY) return [single]

  return INSTALLMENT_SURCHARGES.map(({ count, surchargeRate }) => {
    const totalTry = Math.round(amountTry * (1 + surchargeRate) * 100) / 100
    return {
      count,
      surchargeRate,
      totalTry,
      monthlyTry: Math.round((totalTry / count) * 100) / 100,
    }
  })
}

export function findInstallmentOption(
  options: InstallmentOption[],
  count: number
): InstallmentOption {
  return options.find((option) => option.count === count) ?? options[0]!
}

export type DemoCard = {
  id: string
  label: string
  description: string
  number: string
  holder: string
  expiry: string
  cvv: string
  outcome: 'success' | 'insufficient_funds' | 'do_not_honor' | 'expired_card'
}

/**
 * Demo kartları — gerçek kart bilgisi değildir, PSP test kartı düzenindedir.
 * Ödeme sonucu kart numarasına göre deterministik üretilir.
 */
export const DEMO_CARDS: DemoCard[] = [
  {
    id: 'success-visa',
    label: 'Başarılı ödeme',
    description: 'Visa · 3D Secure onayı geçer',
    number: '4242 4242 4242 4242',
    holder: 'ARF DEMO',
    expiry: '12/30',
    cvv: '123',
    outcome: 'success',
  },
  {
    id: 'success-troy',
    label: 'Başarılı ödeme',
    description: 'Troy · taksitli işlem',
    number: '9792 0300 0000 0000',
    holder: 'ARF DEMO',
    expiry: '08/29',
    cvv: '456',
    outcome: 'success',
  },
  {
    id: 'insufficient',
    label: 'Limit yetersiz',
    description: 'Banka reddi senaryosu',
    number: '4000 0000 0000 9995',
    holder: 'ARF DEMO',
    expiry: '10/28',
    cvv: '123',
    outcome: 'insufficient_funds',
  },
  {
    id: 'declined',
    label: 'Banka onaylamadı',
    description: 'Do not honor senaryosu',
    number: '4000 0000 0000 0002',
    holder: 'ARF DEMO',
    expiry: '05/29',
    cvv: '123',
    outcome: 'do_not_honor',
  },
]

/** 3D Secure demo doğrulama kodu */
export const DEMO_THREEDS_CODE = '123456'
