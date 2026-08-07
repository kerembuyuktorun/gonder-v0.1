const COUNTRY_PREFIX = '+90'

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Form / API değerinden ulusal 10 haneyi çıkarır (5XXXXXXXXX).
 * Baştaki ülke kodu (90) her zaman ayrılır; böylece sabit +90
 * öneki ulusal inputa sızmaz.
 */
export function toNationalPhoneDigits(value: string): string {
  let digits = digitsOnly(value)

  while (digits.startsWith('90')) {
    digits = digits.slice(2)
  }
  if (digits.startsWith('0')) {
    digits = digits.slice(1)
  }
  return digits.slice(0, 10)
}

/** Görüntü formatı: 555 555 5555 */
export function formatNationalPhone(digits: string): string {
  const d = toNationalPhoneDigits(digits)
  const parts = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean)
  return parts.join(' ')
}

/** Saklanan değer: +90 555 555 5555 */
export function toStoredPhoneValue(nationalOrFull: string): string {
  const national = toNationalPhoneDigits(nationalOrFull)
  if (!national) return ''
  return `${COUNTRY_PREFIX} ${formatNationalPhone(national)}`
}

export function isValidTrMobilePhone(value: string): boolean {
  const national = toNationalPhoneDigits(value)
  return national.length === 10 && national.startsWith('5')
}

export const TR_PHONE_COUNTRY_PREFIX = COUNTRY_PREFIX
