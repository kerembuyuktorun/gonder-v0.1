import type { LatLng, OrchestratorVehicle } from '../_types/orchestrator'

export type VehicleRouteAnchorKind = 'park' | 'current' | 'route_start'

export type VehicleRouteAnchor = {
  position: LatLng
  title: string
  subtitle: string | null
  openAddress: string | null
  tooltip: string | null
  kind: VehicleRouteAnchorKind
}

function hasFixedPark(vehicle: OrchestratorVehicle): boolean {
  return (
    vehicle.baslangic_stratejisi === 'sabit_park' &&
    vehicle.park_lat != null &&
    vehicle.park_lng != null
  )
}

/** Aracın tanımlı başlangıç / park üssü — gün içi konumdan bağımsız */
export function getVehicleHomeAnchor(vehicle: OrchestratorVehicle): VehicleRouteAnchor {
  if (hasFixedPark(vehicle)) {
    return {
      position: vehicle.baslangic_konumu,
      title: 'Araç park konumu',
      subtitle: null,
      openAddress: vehicle.baslangic_acik_adres,
      tooltip: null,
      kind: 'park',
    }
  }

  return {
    position: vehicle.baslangic_konumu,
    title: 'Araç park konumu',
    subtitle: null,
    openAddress: vehicle.baslangic_acik_adres,
    tooltip: null,
    kind: 'current',
  }
}

/** Bugün daha önce rota almış/atamış araç — yeni planlama ikinci rota sayılır */
export function isSecondRouteOfDay(vehicle: OrchestratorVehicle): boolean {
  return vehicle.gunluk_rota_sayisi > 0
}

function vehicleCurrentStartAnchor(vehicle: OrchestratorVehicle): VehicleRouteAnchor {
  return {
    position: vehicle.position,
    title: 'Güncel son konum',
    subtitle: null,
    openAddress: vehicle.position_acik_adres,
    tooltip:
      'Gün içi ilk rota olmadığı için araç bulunduğu son konumdan çıkış yapacak',
    kind: 'current',
  }
}

function vehicleHomeStartAnchor(vehicle: OrchestratorVehicle): VehicleRouteAnchor {
  return getVehicleHomeAnchor(vehicle)
}

/**
 * Rotanın çıkış noktası:
 * - Günün ilk rotası: araç başlangıç konumu (park / tanımlı üs)
 * - İkinci ve sonraki rotalar: güncel son konum
 */
export function getVehicleRouteStartAnchor(
  vehicle: OrchestratorVehicle
): VehicleRouteAnchor {
  if (isSecondRouteOfDay(vehicle)) {
    return vehicleCurrentStartAnchor(vehicle)
  }

  return vehicleHomeStartAnchor(vehicle)
}

/**
 * Rota bitişi — her zaman aracın tanımlı başlangıç konumuna dönüş.
 */
export function getVehicleRouteReturnAnchor(
  vehicle: OrchestratorVehicle
): VehicleRouteAnchor {
  const home = getVehicleHomeAnchor(vehicle)

  return {
    position: home.position,
    title: 'Araç park konumu',
    subtitle: null,
    openAddress: home.openAddress,
    tooltip: 'Araç tanımlı park konumuna geri döner',
    kind: home.kind,
  }
}
