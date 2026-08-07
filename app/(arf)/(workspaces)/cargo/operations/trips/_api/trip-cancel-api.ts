import type { TripRecord } from "../_types"
import { cancelTrip } from "./trips-list-api"

export async function cancelTripById(tripId: string): Promise<TripRecord | null> {
  return cancelTrip(tripId)
}