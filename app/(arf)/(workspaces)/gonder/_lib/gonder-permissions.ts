export const GONDER_PERMISSIONS = {
  returnsRead: 'returns:read',
  returnsManage: 'returns:manage',
  desiRead: 'desi_adjustments:read',
  desiManage: 'desi_adjustments:manage',
  desiDispute: 'desi_adjustments:dispute',
  quotesRead: 'quotes:read',
  quotesManage: 'quotes:manage',
} as const

export type GonderPermission = (typeof GONDER_PERMISSIONS)[keyof typeof GONDER_PERMISSIONS]

/** Demo: tüm yetkiler açık. Gerçek IAM bağlanınca session’dan okunur. */
export function canGonder(_permission: GonderPermission): boolean {
  return true
}

/** Nav / aksiyon metadata — shell filtreleri için */
export type GonderPermissionGate = {
  requiredPermission?: GonderPermission
}

export function isGonderNavVisible(gate?: GonderPermissionGate): boolean {
  if (!gate?.requiredPermission) return true
  return canGonder(gate.requiredPermission)
}
