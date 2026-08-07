// TODO: Remove when API is ready

export type SupplierType = "ozmal" | "logistics" | "truck_owner" | "warehouse"

export type SupplierStatus = "active" | "passive"

export type ContractType = "fixed_salary" | "per_trip" | "per_desi" | "commission"

export interface SupplierRecord {
  id: string
  name: string
  supplierType: SupplierType
  status: SupplierStatus
  contractType: ContractType
  contactPerson?: string
  contactPhone?: string
  city?: string
  vehicleCount: number
  driverCount: number
  activeTripsCount: number
  totalTripsCount: number
  isDeletable: boolean
  isDeactivatable: boolean
  hasExpiringDocuments: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface SupplierListKpi {
  total: number
  active: number
  passive: number
  ozmal: number
  logistics: number
  truckOwner: number
  warehouse: number
}
