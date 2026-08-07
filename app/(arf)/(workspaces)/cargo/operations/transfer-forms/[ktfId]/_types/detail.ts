export type PaymentType = "NAKİT" | "KART" | "HAVALE" | "ÖDEMESİZ"

export type CargoStatus = "TESLİMATI_YAPILMADI" | "KISMI" | "TESLİM_EDİLDİ" | "İADE" | "İPTAL"

export type ItemStatus = "BEKLEMEDE" | "YOLDA" | "TESLİM_NOKTASINDA" | "TESLİM_EDİLDİ" | "GERİ_DÖNDÜ"

export type CargoType = "STANDART" | "KOLİ" | "SOĞUK_ZİNCİR" | "KURU_TEMİZLEME"

export interface ConsignmentItem {
  id: string
  cargoId: string
  trackingNumber: string
  senderCustomerName: string
  senderBranchId: string
  senderBranchName: string
  receiverBranchId: string
  receiverBranchName: string
  receiverCustomerName: string
  paymentType: PaymentType
  cargoStatus: CargoStatus
  itemStatus: ItemStatus
  cargoType: CargoType
  desi: number
  weight: number
  totalPrice: number
  createdAt: string
  lastUpdatedAt: string
  arrivedAt: string | null
  deliveredAt: string | null
}

export interface Note {
  id: string
  text: string
  createdAt: string
  createdByUserId: string
  createdByUserName: string
}

export interface TransferFormDetail {
  id: string
  ktfNumber: string
  courierId: string
  courierName: string
  branchId: string
  branchName: string
  status: "OPEN" | "CLOSED"
  openedAt: string
  closedAt: string | null
  totalConsignments: number
  totalCollectionAmount: number
  consignments: ConsignmentItem[]
  notes: Note[]
  closedByUserId?: string
  closedByUserName?: string
  createdAt: string
  updatedAt: string
}

export interface CloseTransferFormSummary {
  ktf: TransferFormDetail
  summary: {
    totalDeliveries: number
    totalFailed: number
    totalCollection: number
    deferredCargos: string[]
  }
}
