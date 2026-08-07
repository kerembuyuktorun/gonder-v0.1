import type { TripDetailRecord } from "../../_types"
import { fetchTripDetailById } from "../../_api/trips-list-api"

export async function fetchTripDetail(tripId: string): Promise<TripDetailRecord | null> {
  return fetchTripDetailById(tripId)
}