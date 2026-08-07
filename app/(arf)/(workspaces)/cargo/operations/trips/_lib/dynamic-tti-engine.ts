import type { TripManifestItem, TripRecord, TripTtiDocument, TripTtlDocument } from "../_types"

export function generateDynamicTtiDocument(trip: TripRecord, items: TripManifestItem[]): TripTtiDocument {
  const activeItems = items.filter((item) => item.transportStatus === "loaded")

  return {
    tripId: trip.id,
    tripNo: trip.tripNo,
    generatedAt: new Date().toISOString(),
    vehiclePlateDisplay: trip.supplierType === "warehouse" && !trip.vehiclePlate ? ".............." : trip.vehiclePlate ?? "..............",
    driverNameDisplay: trip.supplierType === "warehouse" && !trip.driverName ? ".............." : trip.driverName ?? "..............",
    packageCount: activeItems.reduce((total, item) => total + item.totalQuantity, 0),
    totalDesi: activeItems.reduce((total, item) => total + item.totalDesi, 0),
    items: activeItems,
  }
}

export function generateTtlDocument(trip: TripRecord, items: TripManifestItem[]): TripTtlDocument {
  return {
    tripId: trip.id,
    tripNo: trip.tripNo,
    generatedAt: new Date().toISOString(),
    touchedPackageCount: items.reduce((total, item) => total + item.totalQuantity, 0),
    touchedDesi: items.reduce((total, item) => total + item.totalDesi, 0),
    items,
  }
}