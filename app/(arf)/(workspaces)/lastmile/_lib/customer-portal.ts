/**
 * Detect customer-portal actors from session user payload.
 * Tenant dispatchers keep full planning / route mutation UX.
 */
export function isCustomerPortalUser(
  user?: Record<string, unknown> | null
): boolean {
  if (!user) return false

  const kind = String(
    user.userKind ?? user.kullanici_tipi ?? user.kind ?? ''
  )
    .trim()
    .toLowerCase()
  if (kind === 'musteri' || kind === 'customer') return true

  const role = String(
    user.role ?? user.userRole ?? user.userType ?? user.user_type ?? ''
  )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')

  if (
    role.includes('musteri') ||
    role.includes('customer') ||
    role === 'musteri_depo_yoneticisi' ||
    role === 'musteri_izleyici'
  ) {
    return true
  }

  return false
}

/** Planning / orchestrator / route-list paths hidden for customers */
export function isCustomerRestrictedPath(url: string): boolean {
  return (
    url.includes('/planning/route-orchestrator') ||
    url.includes('/planning/routes') ||
    url.endsWith('/planning') ||
    url.includes('/planning/')
  )
}
