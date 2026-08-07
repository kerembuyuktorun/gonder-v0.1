export type ManifestItemTransportStatus = "loaded" | "unloaded" | "missing" | "error"

export interface TripManifestItem {
  id: string
  trackingNo: string
  originSummary: string
  transportStatus: ManifestItemTransportStatus
  senderName: string
  senderBranch: string
  receiverBranch: string
  receiverName: string
  receiverPhone: string
  paymentType: string
  invoiceStatus: string
  subtotal: number
  vatAmount: number
  totalAmount: number
  totalQuantity: number
  totalDesi: number
  pieceList: string
  invoiceNo?: string
  atfNo?: string
  createdAt: string
  updatedAt: string
  arrivalAt?: string
  deliveredAt?: string
  cargoStatus?: string
  pieceStatus?: string
  collectionStatus?: string
  createdBy: string
  relatedLegIds: string[]
}

export interface TripTtiDocument {
  tripId: string
  tripNo: string
  generatedAt: string
  vehiclePlateDisplay: string
  driverNameDisplay: string
  packageCount: number
  totalDesi: number
  items: TripManifestItem[]
}

export interface TripTtlDocument {
  tripId: string
  tripNo: string
  generatedAt: string
  touchedPackageCount: number
  touchedDesi: number
  items: TripManifestItem[]
}