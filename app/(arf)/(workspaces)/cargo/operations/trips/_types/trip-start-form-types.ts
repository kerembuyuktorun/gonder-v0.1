import type { LineType, SupplierType } from "./trip-types"

export interface TripStartFormState {
  lineType: LineType | ""
  lineId: string
  supplierType: SupplierType | ""
  supplierId: string
  vehicleId: string
  driverId: string
}