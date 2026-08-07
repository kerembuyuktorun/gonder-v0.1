export type ExpenseStatus = "paid" | "unpaid" | "partially_paid" | "overdue"

export interface ExpenseRecord {
  id: string
  supplierTitle: string
  invoiceNo: string
  category: string
  tag: string
  invoiceDate: string
  dueDate: string
  netAmount: number
  vatAmount: number
  totalAmount: number
  remainingAmount: number
  status: ExpenseStatus
}

export interface ExpenseSummary {
  totalAmount: number
  paidAmount: number
  unpaidAmount: number
  overdueAmount: number
  totalCount: number
  overdueCount: number
}
