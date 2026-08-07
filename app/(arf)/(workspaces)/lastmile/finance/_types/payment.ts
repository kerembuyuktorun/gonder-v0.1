/** Last Mile ödeme / tahsilat domain tipleri. */

export type SettlementType = 'pesin' | 'vadeli'

export type BillingCycle = 'per_order' | 'weekly' | 'monthly'

export type CollectionStatus = 'bekliyor' | 'kismi' | 'tahsil_edildi' | 'gecikti'

export type PaymentMethod = 'nakit' | 'havale' | 'kart' | 'diger' | 'kapida'

export type CustomerPaymentTerms = {
  customerId: string
  settlementType: SettlementType
  creditDays: number
  billingCycle: BillingCycle
  notes?: string
  updatedAt: string
}

export type OrderPayment = {
  orderId: string
  customerId: string
  customerName?: string
  settlementType: SettlementType
  creditDays: number
  dueDate?: string
  collectionStatus: CollectionStatus
  amountDue: number
  amountPaid: number
  paymentMethod?: PaymentMethod
  orderDate: string
  updatedAt: string
}

export type CollectionEntry = {
  id: string
  customerId: string
  customerName?: string
  orderId?: string
  amount: number
  method: PaymentMethod
  paidAt: string
  note?: string
  createdBy?: string
  createdAt: string
}

export type CustomerFinanceSummary = {
  customerId: string
  openBalance: number
  totalCollected: number
  overdueOrderCount: number
  lastCollectionAt?: string
  assignedPriceListId?: string
  assignedPriceListName?: string
  paymentTerms?: CustomerPaymentTerms
}

export type CollectionsKpi = {
  toCollect: number
  collected: number
  overdue: number
  openOrderCount: number
}

export const SETTLEMENT_TYPE_LABELS: Record<SettlementType, string> = {
  pesin: 'Peşin',
  vadeli: 'Vadeli',
}

export const COLLECTION_STATUS_LABELS: Record<CollectionStatus, string> = {
  bekliyor: 'Bekliyor',
  kismi: 'Kısmi',
  tahsil_edildi: 'Tahsil Edildi',
  gecikti: 'Gecikti',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  nakit: 'Nakit',
  havale: 'Havale',
  kart: 'Kart',
  diger: 'Diğer',
  kapida: 'Kapıda',
}
