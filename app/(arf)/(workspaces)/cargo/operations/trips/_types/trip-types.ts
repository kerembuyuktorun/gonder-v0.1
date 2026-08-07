export type TripStatus = "created" | "on_road" | "completed" | "cancelled"

export type SupplierType = "company" | "warehouse" | "truck_owner" | "logistics"

export type LineType = "main" | "hub" | "feeder"

export interface TripRecord {
  id: string
  tripNo: string
  lineId: string
  lineType: LineType
  lineName: string
  lineSummary: string
  supplierType: SupplierType
  supplierName: string
  vehiclePlate?: string
  driverName?: string
  totalPackageCount: number
  totalDesi: number
  currentLocationSummary: string
  status: TripStatus
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface TripListKpi {
  total: number
  onRoad: number
  waiting: number
  completed: number
  cancelled: number
}

export interface TripLineOption {
  id: string
  type: LineType
  name: string
  summary: string
  stops: string[]
}

export interface SupplierOption {
  id: string
  type: SupplierType
  name: string
}

export interface VehicleOption {
  id: string
  supplierId: string
  plate: string
}

export interface DriverOption {
  id: string
  supplierId: string
  vehicleId: string
  name: string
}

export interface TripStartOptions {
  lines: TripLineOption[]
  suppliers: SupplierOption[]
  vehicles: VehicleOption[]
  drivers: DriverOption[]
}