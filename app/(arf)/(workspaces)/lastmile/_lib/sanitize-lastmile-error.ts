/**
 * Maps known English / code-style last-mile API errors to TR user copy.
 */
export function sanitizeLastmileError(
  message: string | null | undefined,
  code?: string | null
): string {
  const trimmed = (message ?? '').trim()
  const codeKey = (code ?? '').trim().toUpperCase()

  if (
    codeKey === 'NO_DRIVER' ||
    /has no assigned driver/i.test(trimmed) ||
    /no assigned driver/i.test(trimmed)
  ) {
    return 'Bu aracın atanmış bir sürücüsü bulunmamakta'
  }

  return trimmed || 'İşlem başarısız oldu.'
}
