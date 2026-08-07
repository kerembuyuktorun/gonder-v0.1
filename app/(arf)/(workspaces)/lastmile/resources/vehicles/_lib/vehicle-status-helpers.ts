import type { LastmileVehicle, VehicleStatusScope } from '../_types/vehicle'

/** Yolda = aktif rota üzerinde. */
export function isVehicleActiveOnRoute(vehicle: LastmileVehicle): boolean {
  return vehicle.durum === 'yolda'
}

export function vehicleMatchesStatusScope(
  vehicle: LastmileVehicle,
  scope: VehicleStatusScope
): boolean {
  if (scope === 'all') return true
  return vehicle.durum === scope
}

export function formatVehicleRouteMeta(vehicle: LastmileVehicle): string {
  const parts: string[] = []
  if (vehicle.aktif_rota_durak_sayisi != null) {
    parts.push(`${vehicle.aktif_rota_durak_sayisi} durak`)
  }
  if (vehicle.aktif_rota_siparis_sayisi != null) {
    parts.push(`${vehicle.aktif_rota_siparis_sayisi} sipariş`)
  }
  return parts.join(' · ')
}
