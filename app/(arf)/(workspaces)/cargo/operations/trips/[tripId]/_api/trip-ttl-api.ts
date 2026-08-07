import type { TripTtlDocument } from "../../_types"
import { generateTripTtl } from "../../_api/trips-list-api"

export async function fetchTripTtlDocument(tripId: string): Promise<TripTtlDocument | null> {
  return generateTripTtl(tripId)
}