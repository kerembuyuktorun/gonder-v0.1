import type { TripTtiDocument } from "../../_types"
import { generateTripTti } from "../../_api/trips-list-api"

export async function fetchTripTtiDocument(tripId: string): Promise<TripTtiDocument | null> {
  return generateTripTti(tripId)
}