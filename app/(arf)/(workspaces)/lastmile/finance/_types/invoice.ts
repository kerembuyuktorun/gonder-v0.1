export type LastmileInvoiceStatus = 'taslak' | 'kesildi' | 'iptal'
export type LastmileInvoiceSource = 'manual' | 'orders'
export type OrderInvoiceStatus = 'faturalanmadi' | 'faturalandi'

export type InvoiceLine = {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  orderId?: string | null
}

export type LastmileInvoice = {
  id: string
  number: string
  customerId: string
  customerName: string
  status: LastmileInvoiceStatus
  issueDate: string
  dueDate: string
  lines: InvoiceLine[]
  subtotal: number
  kdv: number
  total: number
  orderIds: string[]
  source: LastmileInvoiceSource
  notes?: string | null
  createdAt: string
}

export type UninvoicedOrderRow = {
  orderId: string
  takipNo: string
  referansNo: string
  customerId: string
  customerName: string
  createdAt: string
  amount: number
  hasPricing: boolean
  durum: string
}

export const INVOICE_STATUS_LABEL: Record<LastmileInvoiceStatus, string> = {
  taslak: 'Taslak',
  kesildi: 'Kesildi',
  iptal: 'İptal',
}

export const INVOICE_SOURCE_LABEL: Record<LastmileInvoiceSource, string> = {
  manual: 'Manuel',
  orders: 'Sipariş',
}
