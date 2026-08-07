import type { TripRecord } from "../_types"
import { completeTrip } from "./trips-list-api"

export async function completeTripById(tripId: string): Promise<TripRecord | null> {
  return completeTrip(tripId)
}