export interface CustomerCashregisterDetailRow {
  id: string
  customerId: string
  docType: "fatura" | "iade" | "mutabakat" | "tahsilat"
  docNo: string
  docDate: string
  amount: number
  status: string
  description?: string
}
