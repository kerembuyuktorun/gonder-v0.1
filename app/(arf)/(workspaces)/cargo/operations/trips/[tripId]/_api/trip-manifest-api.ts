import type { TripManifestItem } from "../../_types"
import { fetchTripManifestById } from "../../_api/trips-list-api"

export async function fetchTripManifest(tripId: string): Promise<TripManifestItem[]> {
  return fetchTripManifestById(tripId)
}