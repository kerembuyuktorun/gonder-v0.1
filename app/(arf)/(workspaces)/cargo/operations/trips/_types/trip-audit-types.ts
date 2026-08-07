export type TripAuditAction =
  | "trip_created"
  | "trip_status_changed"
  | "leg_departed"
  | "manifest_loaded"
  | "manifest_unloaded"
  | "document_printed"

export interface TripAuditLogEntry {
  id: string
  tripId: string
  action: TripAuditAction
  description: string
  actorName: string
  timestamp: string
  ipAddress?: string
}