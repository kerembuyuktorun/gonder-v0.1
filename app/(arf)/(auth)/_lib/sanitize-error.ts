const SAFE_MESSAGE = 'İşlem şu anda tamamlanamadı. Lütfen tekrar deneyin.'

const UNSAFE_PATTERNS = [
  /token/i,
  /refresh/i,
  /jwt/i,
  /bearer/i,
  /\bpassword\b/i,
  /secret/i,
  /stack/i,
  /trace/i,
  /exception/i,
  /sql/i,
  /database/i,
  /internal server error/i,
  /at\s+\w+\s*\(/i,
  /[{}<>]/,
]

function foldTr(value: string): string {
  return value
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
}

function isSafeUserFacingMessage(message: string): boolean {
  if (message.length === 0 || message.length > 220) return false
  return !UNSAFE_PATTERNS.some((pattern) => pattern.test(message))
}

/**
 * Maps backend/BFF auth errors to a single user-facing Turkish message.
 * Already-safe localized BFF messages are passed through as-is.
 */
export function sanitizeAuthError(raw: unknown): string {
  if (typeof raw !== 'string') {
    return SAFE_MESSAGE
  }

  const trimmed = raw.trim().replace(/\s+/g, ' ')
  if (!trimmed) {
    return SAFE_MESSAGE
  }

  const folded = foldTr(trimmed)

  if (
    folded.includes('invalid credentials') ||
    folded.includes('e-posta veya sifre') ||
    folded.includes('email veya sifre') ||
    folded.includes('sifre hatal')
  ) {
    return 'E-posta veya şifre hatalı.'
  }

  if (
    folded.includes('invalid verification code') ||
    folded.includes('dogrulama kodu') ||
    folded.includes('verification code')
  ) {
    return 'Doğrulama kodu geçersiz.'
  }

  if (folded.includes('oturum tokenlari alinamadi') || folded.includes('oturum tokenları alınamadı')) {
    return 'Oturum açılamadı. Lütfen tekrar giriş yapın.'
  }

  if (folded.includes('otp oturumu bulunamadi') || folded.includes('otp oturumu bulunamadı')) {
    return 'OTP oturumu bulunamadı. Tekrar giriş yapın.'
  }

  if (folded.includes('too many') || folded.includes('429')) {
    return 'Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.'
  }

  if (folded.includes('sunucu yapilandirmasi eksik')) {
    return 'Sunucu yapılandırması eksik. Lütfen sistem yöneticinize iletin.'
  }

  if (
    folded.includes('gonderilen giris bilgileri') ||
    folded.includes('gonderilen bilgiler gecersiz')
  ) {
    return 'Gönderilen giriş bilgileri geçersiz.'
  }

  if (
    folded.includes('sifre sifirlama baglantisi') ||
    folded.includes('reset link') ||
    folded.includes('reset token') ||
    folded.includes('invalid or expired') ||
    folded.includes('suresi dolmus') ||
    folded.includes('süresi dolmuş')
  ) {
    return 'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.'
  }

  if (
    folded.includes('network') ||
    folded.includes('timeout') ||
    folded.includes('ulasilamiyor')
  ) {
    return 'Servise şu anda ulaşılamıyor. Lütfen tekrar deneyin.'
  }

  if (isSafeUserFacingMessage(trimmed)) {
    return trimmed
  }

  return SAFE_MESSAGE
}
