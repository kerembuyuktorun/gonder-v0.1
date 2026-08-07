import { computeSupplierKpi, suppliersDb } from "../_mock/suppliers-mock-data"
import { supplierDetailMockData } from "../[supplierId]/_mock/supplier-detail-mock-data"
import type { SupplierDocument } from "../[supplierId]/_types"
import type { SupplierListKpi, SupplierRecord } from "../_types"

// TODO: Replace with real API calls when backend is ready

export async function fetchSuppliers(): Promise<SupplierRecord[]> {
  return [...suppliersDb]
}

export async function fetchSupplierListKpi(): Promise<SupplierListKpi> {
  return computeSupplierKpi(suppliersDb)
}

export async function createSupplier(
  data: Omit<SupplierRecord, "id" | "vehicleCount" | "driverCount" | "activeTripsCount" | "totalTripsCount" | "isDeletable" | "isDeactivatable" | "hasExpiringDocuments" | "createdAt" | "updatedAt">
  & {
    contactPersonTitle?: string
    contactEmail?: string
    officialAddress?: string
    taxOffice?: string
    taxNumber?: string
    paymentTermDays?: number
    pricePerTrip?: number
    pricePerDesi?: number
    iban?: string
    accountHolder?: string
    documents?: SupplierDocument[]
  }
): Promise<SupplierRecord> {
  const newRecord: SupplierRecord = {
    ...data,
    id: String(Date.now()),
    vehicleCount: 0,
    driverCount: 0,
    activeTripsCount: 0,
    totalTripsCount: 0,
    isDeletable: true,
    isDeactivatable: true,
    hasExpiringDocuments: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  suppliersDb.push(newRecord)

  supplierDetailMockData[newRecord.id] = {
    ...newRecord,
    taxOffice: data.taxOffice,
    taxNumber: data.taxNumber,
    officialAddress: data.officialAddress,
    contactPersonTitle: data.contactPersonTitle,
    contactEmail: data.contactEmail,
    iban: data.iban,
    accountHolder: data.accountHolder,
    paymentTermDays: data.paymentTermDays,
    pricePerTrip: data.pricePerTrip,
    pricePerDesi: data.pricePerDesi,
    vehicles: [],
    drivers: [],
    documents: data.documents ?? [],
  }

  return newRecord
}

export async function toggleSupplierStatus(id: string): Promise<SupplierRecord | null> {
  const idx = suppliersDb.findIndex((r) => r.id === id)
  if (idx === -1) return null
  const record = suppliersDb[idx]
  if (!record.isDeactivatable) return record
  record.status = record.status === "active" ? "passive" : "active"
  record.updatedAt = new Date().toISOString()
  return { ...record }
}
