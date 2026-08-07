import type { LastmileVehicle } from '../../vehicles/_types/vehicle'

export type VehicleOption = {
  id: string
  plaka: string
  assignedCourierId: string | null
  assignedCourierName: string | null
}

export function mapVehicleOptions(vehicles: LastmileVehicle[]): VehicleOption[] {
  return vehicles.map((vehicle) => ({
    id: vehicle.id,
    plaka: vehicle.plaka,
    assignedCourierId: vehicle.zimmetli_surucu_id,
    assignedCourierName: vehicle.zimmetli_surucu,
  }))
}
