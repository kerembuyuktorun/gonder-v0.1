import type { LastmileCourier, CourierStatusScope } from '../_types/courier'

export function isCourierActiveOnRoute(courier: LastmileCourier): boolean {
  return courier.durum === 'yolda'
}

export function courierMatchesStatusScope(
  courier: LastmileCourier,
  scope: CourierStatusScope
): boolean {
  if (scope === 'all') return true
  return courier.durum === scope
}

export function formatCourierRouteMeta(courier: LastmileCourier): string {
  const parts: string[] = []
  if (courier.aktif_rota_durak_sayisi != null) {
    parts.push(`${courier.aktif_rota_durak_sayisi} durak`)
  }
  if (courier.aktif_rota_siparis_sayisi != null) {
    parts.push(`${courier.aktif_rota_siparis_sayisi} sipariş`)
  }
  return parts.join(' · ')
}
