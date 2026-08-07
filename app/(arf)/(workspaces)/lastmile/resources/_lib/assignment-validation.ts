import type { VehicleOption } from '../couriers/_lib/vehicle-options'
import type { CourierOption } from '../vehicles/_lib/map-vehicle'

export function isCourierAssignableToVehicle(
  courier: Pick<CourierOption, 'assignedVehicleId'>,
  targetVehicleId: string
) {
  return !courier.assignedVehicleId || courier.assignedVehicleId === targetVehicleId
}

export function isVehicleAssignableToCourier(
  vehicle: Pick<VehicleOption, 'assignedCourierId'>,
  targetCourierId: string
) {
  return !vehicle.assignedCourierId || vehicle.assignedCourierId === targetCourierId
}

export function getCourierAssignmentConflict(
  courier: Pick<CourierOption, 'name' | 'assignedVehicleId' | 'assignedVehiclePlate'>,
  targetVehicleId: string
): string | null {
  if (isCourierAssignableToVehicle(courier, targetVehicleId)) return null

  const plateHint = courier.assignedVehiclePlate ? ` (${courier.assignedVehiclePlate})` : ''
  return `${courier.name ?? 'Kurye'} başka bir araçta zimmetli${plateHint}.`
}

export function getVehicleAssignmentConflict(
  vehicle: Pick<VehicleOption, 'plaka' | 'assignedCourierId' | 'assignedCourierName'>,
  targetCourierId: string
): string | null {
  if (isVehicleAssignableToCourier(vehicle, targetCourierId)) return null

  const nameHint = vehicle.assignedCourierName ? ` (${vehicle.assignedCourierName})` : ''
  return `${vehicle.plaka} başka bir kuryede zimmetli${nameHint}.`
}
