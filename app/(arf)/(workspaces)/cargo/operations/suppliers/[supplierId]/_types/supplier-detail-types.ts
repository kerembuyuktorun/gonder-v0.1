import type { SupplierRecord, SupplierType, SupplierStatus, ContractType } from "../../_types"
import type { GiderKalemi } from "../../../../transport/[tasimaNo]/_types/transport-detail"

// ───────── Araç ─────────
export type VehicleType = "tir" | "kamyon" | "van" | "pickup"
export type VehicleStatus = "active" | "passive"
export type VehicleBodyType = "tenteli" | "kapali_kasa" | "frigorifik" | "acik_kasa" | "panelvan" | "diger"
export type VehicleDocumentType = "ruhsat" | "trafik_sigortasi" | "kasko" | "muayene" | "diger"

export interface SupplierVehicleDocument {
  id: string
  type: VehicleDocumentType
  label: string
  fileName?: string
  fileSize?: number
  uploadedBy?: string
  fileUrl?: string
  uploadedAt?: string
}

export interface SupplierVehicle {
  id: string
  plate: string
  brand: string
  model: string
  bodyType?: VehicleBodyType
  vehicleType: VehicleType
  year: number
  maxWeightCapacity?: number
  maxVolumeCapacity?: number
  status: VehicleStatus
  currentDriverId?: string
  currentDriverName?: string
  inspectionExpiryDate?: string
  trafficInsuranceExpiryDate?: string
  cascoPolicyNumber?: string
  cascoExpiryDate?: string
  documents?: SupplierVehicleDocument[]
}

// ───────── Sürücü ─────────
export type LicenseClass = "B" | "C" | "CE" | "D"
export type DriverStatus = "available" | "on_trip" | "off_duty"
export type SrcType = "SRC-1" | "SRC-2" | "SRC-3" | "SRC-4" | "SRC-5"
export type BloodGroup = "A Rh+" | "A Rh-" | "B Rh+" | "B Rh-" | "AB Rh+" | "AB Rh-" | "0 Rh+" | "0 Rh-"
export type DriverDocumentType =
  | "ehliyet_fotokopisi"
  | "src_belgesi"
  | "psikoteknik_belgesi"
  | "nufus_cuzdani"
  | "saglik_raporu"
  | "diger"

export interface DriverDocument {
  id: string
  type: DriverDocumentType
  label: string
  fileName?: string
  fileSize?: number
  uploadedBy?: string
  fileUrl?: string
  uploadedAt?: string
}

export interface SupplierDriver {
  id: string
  firstName: string
  lastName: string
  phone: string
  nationalId: string // TCKN
  birthDate?: string
  bloodGroup?: BloodGroup
  licenseClass: LicenseClass
  licenseExpiry: string
  srcType?: SrcType
  hasSrcCertificate: boolean
  srcExpiryDate?: string
  psychotechnicExpiryDate?: string
  status: DriverStatus
  activeVehicleId?: string
  activeVehiclePlate?: string
  totalTrips: number
  documents: DriverDocument[]
}

// ───────── Evrak ─────────
export type DocumentType =
  | "vergi_levhasi"
  | "imza_sirkuleri"
  | "tasima_sozlesmesi"
  | "k_belgesi"
  | "src_belgesi"
  | "trafik_sigortasi"
  | "kasko"
  | "diger"

export interface SupplierDocument {
  id: string
  documentType: DocumentType
  label: string
  fileUrl?: string
  uploadedAt?: string
  expiryDate?: string
  isExpired: boolean
  isExpiringSoon: boolean
}

// ───────── Tedarikçi Taşıma ─────────
export type SupplierTransportDurum = "planlanmis" | "yukleniyor" | "yolda" | "teslim_edildi" | "iptal"

export interface SupplierTransportYukSatir {
  yukTipi: string
  adet: number
  agirlik: number
}

export interface SupplierTransportRecord {
  id: string
  tasimaNo: string
  yuklemeTarihi: string
  gonderiTipi: "FTL" | "LTL"
  gondericiMusteri: string
  aliciMusteri: string
  cikisAdres: string
  varisAdres: string
  tedarikciUnvan: string
  aracPlaka: string
  surucu: string
  yukler: SupplierTransportYukSatir[]
  yukTipleri: string
  toplamAdet: number
  toplamAgirlik: number
  toplamHacim: number
  toplamDesi: number
  alisFiyat: number
  durum: SupplierTransportDurum
  olusturmaTarihi: string
  olusturan: string
  giderler: GiderKalemi[]
}

// ───────── Tedarikçi Fatura & Ödeme ─────────
export type SupplierInvoicePaymentStatus = "odendi" | "bekliyor" | "kismi" | "gecikti"
export type SupplierExstreType = "fatura" | "odeme"

export interface SupplierFinancialRecord {
  id: string
  type: SupplierExstreType
  invoiceNo: string
  description: string
  amount: number
  remainingBalance: number
  status: SupplierInvoicePaymentStatus
  createdAt: string
  /* Fatura'ya özel */
  supplierTitle?: string
  category?: string
  tag?: string
  invoiceDate?: string
  dueDate?: string
  netAmount?: number
  vatAmount?: number
  totalAmount?: number
  paidAmount?: number
  /* Ödeme'ye özel */
  recipientName?: string
  recipientIban?: string
  senderName?: string
  senderIban?: string
  referenceNumber?: string
  paymentMethod?: string
  direction?: "credit" | "debit"
  matchStatus?: "matched" | "unmatched" | "partial"
  matchSource?: "auto" | "manual"
  matchedEntityLabel?: string
}

// ───────── Tedarikçi Detay ─────────
export interface SupplierDetail extends SupplierRecord {
  // Yasal
  taxOffice?: string
  taxNumber?: string
  officialAddress?: string
  // İletişim
  contactPersonTitle?: string
  contactEmail?: string
  // Banka
  iban?: string
  accountHolder?: string
  // Anlaşma
  paymentTermDays?: number
  pricePerTrip?: number
  pricePerDesi?: number
  // İlişkili listeler
  vehicles: SupplierVehicle[]
  drivers: SupplierDriver[]
  documents: SupplierDocument[]
}

export type { SupplierType, SupplierStatus, ContractType }
