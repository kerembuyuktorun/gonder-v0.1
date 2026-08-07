import type { TripAuditLogEntry } from "../../_types"
import { fetchTripAuditById } from "../../_api/trips-list-api"

export async function fetchTripAudit(tripId: string): Promise<TripAuditLogEntry[]> {
  return fetchTripAuditById(tripId)
}