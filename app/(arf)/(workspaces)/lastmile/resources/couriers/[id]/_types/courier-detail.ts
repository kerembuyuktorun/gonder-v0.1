export type CourierVehicleAssignment = {
  id: string
  vehicleId: string
  vehiclePlate: string
  startedAt: string
  endedAt: string | null
  note?: string
}

export type CourierActivityKind =
  | 'created'
  | 'updated'
  | 'status_change'
  | 'assignment_change'
  | 'document_change'
  | 'profile_update'

export type CourierActivityEvent = {
  id: string
  kind: CourierActivityKind
  title: string
  detail?: string
  at: string
  actor?: string
  ip?: string | null
}

export type CourierDetailTab = 'info' | 'documents' | 'assignments' | 'cost'
