import type { ManifestItemTransportStatus, TripManifestItem } from "../_types"

export type TripManifestStatusFilter = "all" | ManifestItemTransportStatus | "problem"

export function filterTripManifestItems(items: TripManifestItem[], selectedLegId: string | null, status: TripManifestStatusFilter) {
  return items.filter((item) => {
    if (selectedLegId && !item.relatedLegIds.includes(selectedLegId)) {
      return false
    }

    if (status === "all") {
      return true
    }

    if (status === "problem") {
      return item.transportStatus === "missing" || item.transportStatus === "error"
    }

    if (status === "loaded") {
      const pieceStatus = (item.pieceStatus ?? "").toLocaleLowerCase("tr-TR")
      return item.transportStatus === "loaded" || pieceStatus.includes("araca yüklendi") || pieceStatus.includes("yüklendi")
    }

    if (status === "unloaded") {
      const pieceStatus = (item.pieceStatus ?? "").toLocaleLowerCase("tr-TR")
      return item.transportStatus === "unloaded" || pieceStatus.includes("araçtan boşaltıldı") || pieceStatus.includes("indirildi")
    }

    return item.transportStatus === status
  })
}