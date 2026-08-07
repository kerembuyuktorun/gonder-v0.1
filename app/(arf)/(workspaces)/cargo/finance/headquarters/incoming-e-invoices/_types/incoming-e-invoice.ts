export type IncomingEInvoiceStatus = "accepted_basic" | "pending_approval" | "rejected"

export interface IncomingEInvoiceRecord {
  id: string
  senderTitle: string
  invoiceNo: string
  profileLabel: string
  invoiceTypeLabel: string
  invoiceDate: string
  amount: number
  status: IncomingEInvoiceStatus
}

export interface IncomingEInvoiceSummary {
  totalAmount: number
  acceptedAmount: number
  pendingAmount: number
  pendingCount: number
  totalCount: number
}

export interface IncomingEInvoiceDetail extends IncomingEInvoiceRecord {
  issueDateTime: string
  dueDate: string
  receiverTitle: string
  receiverTaxNumber: string
  ettn: string
  notes: string[]
  supplierMatched: boolean
}
