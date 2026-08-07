export type InvoiceStatus =
  | "bekliyor"
  | "kismi"
  | "odendi"
  | "gecikti"
  | "reddedildi"
  | "iade"
  | "iptal"

export type InvoiceSource = "customer-detail" | "manual" | "batch"

export type CargoInvoiceStatus = "serbest" | "kilitli"

export interface InvoiceCargoSnapshot {
  id: string
  trackingNo: string
  date: string
  route: string
  status: string
  pieceCount: number
  amount: number
  senderCustomerId?: string
  senderCustomer?: string
  senderBranch?: string
  receiverBranch?: string
  receiverCustomer?: string
  receiverPhone?: string
  paymentType?: string
  invoiceType?: string
  baseAmount?: number
  vat?: number
  volumetricWeight?: number
  pieceList?: string
  dispatchNo?: string
  atfNo?: string
  arrivalAt?: string
  deliveryAt?: string
  lastActionAt?: string
  pieceStatus?: string
  invoiceStatus?: "kesildi" | "kesilmedi"
  collectionStatus?: "tahsil_edildi" | "beklemede" | "iptal" | "musteri_tahsil_edildi" | "gm_gonderildi"
  createdBy?: string
}

export interface InvoiceTransportSnapshot {
  id: string
  tasimaNo: string
  yuklemeTarihi: string
  gonderiTipi: string
  gondericiFirma: string
  aliciFirma: string
  cikisAdres: string
  varisAdres: string
  tasimaciAdi?: string
  satisFiyat: number
}

export interface InvoiceServiceLineSnapshot {
  id: string
  aciklama: string
  miktar: number
  birim: string
  birimFiyat: number
  kdvOran: number
  toplamTutar: number
}

export interface InvoiceRecord {
  id: string
  invoiceName: string
  invoiceNo: string
  categoryLabel: string
  tagLabels: string[]
  customerId: string
  customerName: string
  customerType: "corporate" | "individual"
  taxOffice: string
  taxNumber: string
  operatingBranchId: string
  operatingBranchName: string
  issueDate: string
  dueDate: string
  note: string
  subTotal: number
  vatTotal: number
  grandTotal: number
  paidTotal: number
  remainingBalance: number
  status: InvoiceStatus
  statusChangedAt: string
  statusChangedBy: string
  parentInvoiceId?: string
  rejectionReason?: string
  source: InvoiceSource
  relatedCargoIds: string[]
  cargoSnapshots?: InvoiceCargoSnapshot[]
  transportSnapshots?: InvoiceTransportSnapshot[]
  serviceLineSnapshots?: InvoiceServiceLineSnapshot[]
  relatedCargoCount: number
  createdAt: string
  createdBy: string
}

export interface InvoicePayment {
  id: string
  invoiceId: string
  paymentDate: string
  amount: number
  channel: "nakit" | "havale" | "eft" | "mahsup"
  referenceNo: string
  matchType?: "manual" | "bank_auto"
  bankAccountLabel?: string
  bankTransactionId?: string
  senderIban?: string
  createdAt: string
  createdBy: string
}

export interface InvoiceSummary {
  totalAmount: number
  totalPaid: number
  openBalance: number
  overdueBalance: number
  thisMonthCount: number
}

export interface UpdateInvoiceStatusPayload {
  status: "reddedildi" | "iade" | "iptal"
  reason?: string
  parentInvoiceId?: string
}

export interface CreateInvoiceRecordPayload {
  invoiceName: string
  invoiceNo: string
  categoryLabel: string
  tagLabels: string[]
  customerId: string
  customerName: string
  customerType: "corporate" | "individual"
  taxOffice: string
  taxNumber: string
  operatingBranchId: string
  operatingBranchName: string
  issueDate: string
  dueDate: string
  note: string
  subTotal: number
  vatTotal: number
  grandTotal: number
  source: InvoiceSource
  relatedCargoIds: string[]
  cargoSnapshots?: InvoiceCargoSnapshot[]
  createdBy: string
}

export interface AddPaymentPayload {
  paymentDate: string
  amount: number
  channel: InvoicePayment["channel"]
  referenceNo: string
}
