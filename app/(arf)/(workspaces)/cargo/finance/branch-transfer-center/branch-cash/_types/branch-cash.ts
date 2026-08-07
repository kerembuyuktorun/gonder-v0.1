export type PaymentType = "alici_odemeli" | "pesin"

export type CashItemStatus = "teslim_edildi" | "bekliyor" | "iptal"

export interface BranchCashItem {
  id: string
  shipmentId: string
  trackingNo: string
  paymentType: PaymentType
  status: CashItemStatus
  senderBranch: string
  receiverBranch: string
  amount: number
  createdAt: string
  deliveredAt?: string
  branchId: string
}

export interface BranchCashSummary {
  toplamSubeBorcu: number
  onayBekleyenTransfer: number
  onayBekleyenTransferToplami: number
  son30GunOnaylanan: number
}

export interface CreateTransferPayload {
  selectedItemIds: string[]
  targetIban: string
  queryNumberManual: string
  queryNumberDecont: string
  decontAmount: number
  totalSelectedAmount: number
  notes?: string
}

export type ValidationLevel = "L1" | "L2" | "L3"
export type ValidationStatus = "pass" | "fail" | "pending"

export interface ValidationResult {
  level: ValidationLevel
  status: ValidationStatus
  label: string
  description: string
}

export interface TransferRecord {
  id: string
  branchId: string
  transferDate: string
  totalAmount: number
  itemCount: number
  status: "pending_approval" | "approved" | "rejected"
  queryNumber: string
  targetIban: string
}
