import type { TripRecord, TripStartFormState } from "../_types"
import { startTrip } from "./trips-list-api"

export async function startTripFromModal(values: TripStartFormState): Promise<TripRecord> {
  return startTrip(values)
}