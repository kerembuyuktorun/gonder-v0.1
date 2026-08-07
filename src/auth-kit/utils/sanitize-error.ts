/**
 * Auth-kit tarafinda kullaniciya yansitilan hata metinlerini guvenli hale getirir.
 */

const SENSITIVE_ERROR_PATTERNS = [
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
]

export interface SanitizeAuthErrorOptions {
  fallbackMessage: string
  exposeDetails?: boolean
}

export function sanitizeAuthErrorMessage(
  input: unknown,
  options: SanitizeAuthErrorOptions
): string {
  const { fallbackMessage, exposeDetails = false } = options

  if (typeof input !== 'string') {
    return fallbackMessage
  }

  const normalized = input.trim().replace(/\s+/g, ' ')
  if (!normalized) {
    return fallbackMessage
  }

  if (normalized.length > 220) {
    return fallbackMessage
  }

  const containsSensitivePattern = SENSITIVE_ERROR_PATTERNS.some((pattern) => pattern.test(normalized))
  if (containsSensitivePattern && !exposeDetails) {
    return fallbackMessage
  }

  return normalized
}
