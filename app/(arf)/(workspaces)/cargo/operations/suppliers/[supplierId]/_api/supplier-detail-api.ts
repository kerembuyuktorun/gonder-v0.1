import { supplierDetailMockData } from "../_mock/supplier-detail-mock-data"
import { suppliersDb } from "../../_mock/suppliers-mock-data"
import type { SupplierDetail, SupplierVehicle, SupplierDriver, SupplierDocument } from "../_types"

export async function fetchSupplierDetail(supplierId: string): Promise<SupplierDetail | null> {
  await new Promise((r) => setTimeout(r, 0))
  return supplierDetailMockData[supplierId] ?? null
}

export async function updateSupplierDetail(
  supplierId: string,
  data: Partial<SupplierDetail>,
): Promise<SupplierDetail> {
  await new Promise((r) => setTimeout(r, 0))
  const existing = supplierDetailMockData[supplierId]
  if (!existing) throw new Error("Tedarikçi bulunamadı")
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString().split("T")[0] }
  supplierDetailMockData[supplierId] = updated
  return updated
}

export async function addSupplierVehicle(
  supplierId: string,
  vehicle: Omit<SupplierVehicle, "id">,
): Promise<SupplierVehicle> {
  await new Promise((r) => setTimeout(r, 0))
  const existing = supplierDetailMockData[supplierId]
  if (!existing) throw new Error("Tedarikçi bulunamadı")
  const newVehicle: SupplierVehicle = { ...vehicle, id: `v${Date.now()}` }
  existing.vehicles = [...existing.vehicles, newVehicle]
  existing.vehicleCount = existing.vehicles.length
  return newVehicle
}

export async function updateSupplierVehicle(
  supplierId: string,
  vehicleId: string,
  data: Partial<SupplierVehicle>,
): Promise<SupplierVehicle> {
  await new Promise((r) => setTimeout(r, 0))
  const existing = supplierDetailMockData[supplierId]
  if (!existing) throw new Error("Tedarikçi bulunamadı")

  const vehicleIndex = existing.vehicles.findIndex((item) => item.id === vehicleId)
  if (vehicleIndex === -1) throw new Error("Araç bulunamadı")

  const updatedVehicle: SupplierVehicle = { ...existing.vehicles[vehicleIndex], ...data }
  existing.vehicles = existing.vehicles.map((item) => (item.id === vehicleId ? updatedVehicle : item))

  return updatedVehicle
}

export async function deleteSupplierVehicle(supplierId: string, vehicleId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 0))
  const existing = supplierDetailMockData[supplierId]
  if (!existing) throw new Error("Tedarikçi bulunamadı")

  existing.vehicles = existing.vehicles.filter((item) => item.id !== vehicleId)
  existing.vehicleCount = existing.vehicles.length
}

export async function toggleSupplierVehicleStatus(supplierId: string, vehicleId: string): Promise<SupplierVehicle> {
  await new Promise((r) => setTimeout(r, 0))
  const existing = supplierDetailMockData[supplierId]
  if (!existing) throw new Error("Tedarikçi bulunamadı")

  const vehicleIndex = existing.vehicles.findIndex((item) => item.id === vehicleId)
  if (vehicleIndex === -1) throw new Error("Araç bulunamadı")

  const currentVehicle = existing.vehicles[vehicleIndex]
  const updatedVehicle: SupplierVehicle = {
    ...currentVehicle,
    status: currentVehicle.status === "active" ? "passive" : "active",
  }

  existing.vehicles = existing.vehicles.map((item) => (item.id === vehicleId ? updatedVehicle : item))

  return updatedVehicle
}

export async function addSupplierDriver(
  supplierId: string,
  driver: Omit<SupplierDriver, "id">,
): Promise<SupplierDriver> {
  await new Promise((r) => setTimeout(r, 0))
  const existing = supplierDetailMockData[supplierId]
  if (!existing) throw new Error("Tedarikçi bulunamadı")
  const newDriver: SupplierDriver = { ...driver, id: `d${Date.now()}` }
  existing.drivers = [...existing.drivers, newDriver]
  existing.driverCount = existing.drivers.length
  return newDriver
}

export async function updateSupplierDriver(
  supplierId: string,
  driverId: string,
  data: Partial<SupplierDriver>,
): Promise<SupplierDriver> {
  await new Promise((r) => setTimeout(r, 0))
  const existing = supplierDetailMockData[supplierId]
  if (!existing) throw new Error("Tedarikçi bulunamadı")
  const idx = existing.drivers.findIndex((d) => d.id === driverId)
  if (idx === -1) throw new Error("Sürücü bulunamadı")
  const updated = { ...existing.drivers[idx], ...data }
  existing.drivers = existing.drivers.map((d) => (d.id === driverId ? updated : d))
  return updated
}

export async function deleteSupplierDriver(supplierId: string, driverId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 0))
  const existing = supplierDetailMockData[supplierId]
  if (!existing) throw new Error("Tedarikçi bulunamadı")
  existing.drivers = existing.drivers.filter((d) => d.id !== driverId)
  existing.driverCount = existing.drivers.length
}

export async function toggleSupplierDriverStatus(supplierId: string, driverId: string): Promise<SupplierDriver> {
  await new Promise((r) => setTimeout(r, 0))
  const existing = supplierDetailMockData[supplierId]
  if (!existing) throw new Error("Tedarikçi bulunamadı")
  const idx = existing.drivers.findIndex((d) => d.id === driverId)
  if (idx === -1) throw new Error("Sürücü bulunamadı")
  const current = existing.drivers[idx]
  const updated: SupplierDriver = {
    ...current,
    status: current.status === "off_duty" ? "available" : "off_duty",
  }
  existing.drivers = existing.drivers.map((d) => (d.id === driverId ? updated : d))
  return updated
}

export async function uploadSupplierDocument(
  supplierId: string,
  doc: Omit<SupplierDocument, "id" | "isExpired" | "isExpiringSoon">,
): Promise<SupplierDocument> {
  await new Promise((r) => setTimeout(r, 0))
  const existing = supplierDetailMockData[supplierId]
  if (!existing) throw new Error("Tedarikçi bulunamadı")
  const now = new Date()
  const expiry = doc.expiryDate ? new Date(doc.expiryDate) : null
  const isExpired = expiry ? expiry < now : false
  const thirtyDays = 30 * 24 * 60 * 60 * 1000
  const isExpiringSoon = expiry ? !isExpired && expiry.getTime() - now.getTime() < thirtyDays : false
  const newDoc: SupplierDocument = {
    ...doc,
    id: `doc${Date.now()}`,
    isExpired,
    isExpiringSoon,
  }
  existing.documents = [...existing.documents, newDoc]
  return newDoc
}

export async function toggleSupplierDetailStatus(supplierId: string): Promise<SupplierDetail> {
  await new Promise((r) => setTimeout(r, 0))
  const existing = supplierDetailMockData[supplierId]
  if (!existing) throw new Error("Tedarikçi bulunamadı")
  if (!existing.isDeactivatable) return existing
  existing.status = existing.status === "active" ? "passive" : "active"
  return existing
}

export async function deleteSupplierDetail(supplierId: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 0))
  const existing = supplierDetailMockData[supplierId]
  if (!existing) throw new Error("Tedarikçi bulunamadı")
  if (!existing.isDeletable) throw new Error("Bu tedarikçi silinemez")

  delete supplierDetailMockData[supplierId]

  const idx = suppliersDb.findIndex((record) => record.id === supplierId)
  if (idx !== -1) {
    suppliersDb.splice(idx, 1)
  }
}
