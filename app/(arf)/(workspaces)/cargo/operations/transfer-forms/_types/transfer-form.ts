export type TransferFormStatus = "OPEN" | "CLOSED"

export interface TransferFormListRecord {
  id: string
  ktfNumber: string
  courierId: string
  courierName: string
  branchId: string
  branchName: string
  status: TransferFormStatus
  openedAt: string
  closedAt: string | null
  totalConsignments: number
  totalCollectionAmount: number
  createdAt: string
  updatedAt: string
}

export interface TransferFormListKpi {
  totalKtf: number
  totalOpen: number
  totalConsignments: number
}

export interface CreateTransferFormResponse {
  id: string
  ktfNumber: string
  courierId: string
  courierName: string
  status: "OPEN"
  consignments: []
  totalConsignments: 0
  totalCollectionAmount: 0
}

export interface CreateTransferFormError {
  code: "COURIER_HAS_OPEN_KTF"
  message: string
  existingKtfId: string
}
