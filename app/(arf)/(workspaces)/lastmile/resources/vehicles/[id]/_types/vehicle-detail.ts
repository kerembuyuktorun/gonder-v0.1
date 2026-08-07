export type VehicleAssignmentRecord = {
  id: string
  courierId: string
  courierName: string
  startedAt: string
  endedAt: string | null
  note?: string
}

export type VehicleActivityKind =
  | 'created'
  | 'updated'
  | 'status_change'
  | 'assignment_change'
  | 'document_change'
  | 'scope_update'
  | 'legal_update'

export type VehicleActivityEvent = {
  id: string
  kind: VehicleActivityKind
  title: string
  detail?: string
  at: string
  actor?: string
  ip?: string | null
}

export type VehicleDetailTab = 'operations' | 'documents' | 'assignments'
