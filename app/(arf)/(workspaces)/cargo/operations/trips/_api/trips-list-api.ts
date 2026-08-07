import { generateDynamicTtiDocument, generateTtlDocument } from "../_lib/dynamic-tti-engine"
import { validateTripStartForm } from "../_lib/trip-start-validator"
import { mockTripAuditByTripId } from "../_mock/trip-audit-mock-data"
import { mockTripDetailsById } from "../_mock/trip-detail-mock-data"
import { mockTripManifestByTripId } from "../_mock/trip-manifest-mock-data"
import { mockDrivers, mockSuppliers, mockTripLineOptions, mockTrips, mockVehicles } from "../_mock/trips-mock-data"
import type {
  DriverOption,
  SupplierOption,
  TripAuditAction,
  TripAuditLogEntry,
  TripDetailRecord,
  TripLineOption,
  TripListKpi,
  TripManifestItem,
  TripRecord,
  TripStartFormState,
  TripStartOptions,
  TripTtiDocument,
  TripTtlDocument,
  VehicleOption,
} from "../_types"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

let tripsDb: TripRecord[] = clone(mockTrips)
let tripDetailsDb: Record<string, TripDetailRecord> = clone(mockTripDetailsById)
let tripManifestDb: Record<string, TripManifestItem[]> = clone(mockTripManifestByTripId)
let tripAuditDb: Record<string, TripAuditLogEntry[]> = clone(mockTripAuditByTripId)

const lineOptionsDb: TripLineOption[] = clone(mockTripLineOptions)
const supplierOptionsDb: SupplierOption[] = clone(mockSuppliers)
const vehicleOptionsDb: VehicleOption[] = clone(mockVehicles)
const driverOptionsDb: DriverOption[] = clone(mockDrivers)

function addAuditLog(tripId: string, action: TripAuditAction, description: string, actorName = "Sistem") {
  const next: TripAuditLogEntry = {
    id: `trip-audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tripId,
    action,
    description,
    actorName,
    timestamp: new Date().toISOString(),
    ipAddress: "10.10.2.15",
  }

  tripAuditDb = {
    ...tripAuditDb,
    [tripId]: [next, ...(tripAuditDb[tripId] ?? [])],
  }
}

function calculateTripKpi(rows: TripRecord[]): TripListKpi {
  return {
    total: rows.length,
    onRoad: rows.filter((row) => row.status === "on_road").length,
    waiting: rows.filter((row) => row.status === "created").length,
    completed: rows.filter((row) => row.status === "completed").length,
    cancelled: rows.filter((row) => row.status === "cancelled").length,
  }
}

function buildManifestFromLine(line: TripLineOption, tripId: string): TripManifestItem[] {
  const lastStop = line.stops[line.stops.length - 1] ?? line.stops[0] ?? "-"
  return Array.from({ length: 4 }).map((_, index) => {
    const createdAt = new Date(Date.now() - index * 30 * 60 * 1000).toISOString()
    return {
      id: `${tripId}-manifest-${index + 1}`,
      trackingNo: `10010${Math.floor(Math.random() * 90) + 10}${index}`,
      originSummary: `${line.stops[index] ?? line.stops[0]} -> ${lastStop}`,
      transportStatus: "loaded",
      senderName: `Müşteri ${index + 1}`,
      senderBranch: line.stops[index] ?? line.stops[0] ?? "-",
      receiverBranch: lastStop,
      receiverName: `Alıcı ${index + 1}`,
      receiverPhone: `0532${String(index + 1).padStart(7, "1")}`,
      paymentType: index % 2 === 0 ? "Gönderici Ödemeli" : "Alıcı Ödemeli",
      invoiceStatus: index % 2 === 0 ? "Kesildi" : "Bekliyor",
      subtotal: 450 + index * 120,
      vatAmount: 90 + index * 24,
      totalAmount: 540 + index * 144,
      totalQuantity: 4 + index,
      totalDesi: 80 + index * 35,
      pieceList: `${4 + index} Koli`,
      createdAt,
      updatedAt: createdAt,
      cargoStatus: "Araçta",
      pieceStatus: "Yüklendi",
      collectionStatus: index % 2 === 0 ? "Tahsil Edildi" : "Tahsilat Bekliyor",
      createdBy: "Sistem",
      relatedLegIds: line.stops.map((_, legIndex) => `${tripId}-leg-${legIndex + 1}`),
    }
  })
}

function createTripDetailFromForm(createdTrip: TripRecord, line: TripLineOption): TripDetailRecord {
  return {
    trip: createdTrip,
    routeSummary: line.summary,
    supplierDisplay: `${createdTrip.supplierType === "company" ? "Şirket" : createdTrip.supplierType === "warehouse" ? "Ambar" : createdTrip.supplierType === "truck_owner" ? "Kamyon Sahibi" : "Lojistik"} / ${createdTrip.supplierName}`,
    vehicleDisplay: createdTrip.vehiclePlate && createdTrip.driverName
      ? `${createdTrip.vehiclePlate} - ${createdTrip.driverName}`
      : "Plakasız - Sürücüsüz",
    totalWeightKg: Math.round(createdTrip.totalDesi * 0.67),
    giderler: [],
    faturalar: [],
    legs: line.stops.map((stop, index) => ({
      id: `${createdTrip.id}-leg-${index + 1}`,
      order: index + 1,
      locationName: stop,
      plannedOperation: index === 0 ? "pickup_only" : index === line.stops.length - 1 ? "dropoff_only" : "pickup_dropoff",
      status: "pending",
    })),
  }
}

function nextTripNo() {
  const max = tripsDb.reduce((current, trip) => Math.max(current, Number(trip.tripNo)), 10000160)
  return String(max + 1)
}

export async function fetchTrips(): Promise<TripRecord[]> {
  return clone(tripsDb).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function fetchTripListKpi(): Promise<TripListKpi> {
  return calculateTripKpi(tripsDb)
}

export async function fetchTripStartOptions(): Promise<TripStartOptions> {
  return {
    lines: clone(lineOptionsDb),
    suppliers: clone(supplierOptionsDb),
    vehicles: clone(vehicleOptionsDb),
    drivers: clone(driverOptionsDb),
  }
}

export async function fetchTripDetailById(tripId: string): Promise<TripDetailRecord | null> {
  const detail = tripDetailsDb[tripId]
  if (!detail) return null
  return clone(detail)
}

export async function fetchTripManifestById(tripId: string): Promise<TripManifestItem[]> {
  return clone(tripManifestDb[tripId] ?? [])
}

export async function fetchTripAuditById(tripId: string): Promise<TripAuditLogEntry[]> {
  return clone(tripAuditDb[tripId] ?? []).sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export async function startTrip(values: TripStartFormState): Promise<TripRecord> {
  const parsed = validateTripStartForm(values)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Sefer başlatma formu geçersiz.")
  }

  const line = lineOptionsDb.find((item) => item.id === values.lineId)
  const supplier = supplierOptionsDb.find((item) => item.id === values.supplierId)
  const vehicle = vehicleOptionsDb.find((item) => item.id === values.vehicleId)
  const driver = driverOptionsDb.find((item) => item.id === values.driverId)

  if (!line || !supplier) {
    throw new Error("Hat veya tedarikçi bilgisi bulunamadı.")
  }

  const tripId = `trip-${nextTripNo()}`
  const manifestItems = buildManifestFromLine(line, tripId)
  const totalPackageCount = manifestItems.reduce((total, item) => total + item.totalQuantity, 0)
  const totalDesi = manifestItems.reduce((total, item) => total + item.totalDesi, 0)

  const created: TripRecord = {
    id: tripId,
    tripNo: nextTripNo(),
    lineId: line.id,
    lineType: line.type,
    lineName: line.name,
    lineSummary: line.summary,
    supplierType: supplier.type,
    supplierName: supplier.name,
    vehiclePlate: vehicle?.plate,
    driverName: driver?.name,
    totalPackageCount,
    totalDesi,
    currentLocationSummary: `${line.stops[0] ?? "İlk durak"} çıkış için hazır`,
    status: "created",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "Sistem Kullanıcısı",
  }

  const detail = createTripDetailFromForm(created, line)
  tripsDb = [created, ...tripsDb]
  tripDetailsDb = { ...tripDetailsDb, [created.id]: detail }
  tripManifestDb = { ...tripManifestDb, [created.id]: manifestItems }
  tripAuditDb = {
    ...tripAuditDb,
    [created.id]: [],
  }
  addAuditLog(created.id, "trip_created", `Sefer başlatıldı. ${created.tripNo} numaralı sefer oluşturuldu.`, "Sistem Kullanıcısı")

  return clone(created)
}

export async function completeTrip(tripId: string): Promise<TripRecord | null> {
  const target = tripsDb.find((item) => item.id === tripId)
  if (!target || target.status !== "on_road") {
    return target ? clone(target) : null
  }

  const updated: TripRecord = {
    ...target,
    status: "completed",
    currentLocationSummary: "Sefer başarıyla tamamlandı",
    updatedAt: new Date().toISOString(),
  }
  tripsDb = tripsDb.map((item) => (item.id === tripId ? updated : item))

  const detail = tripDetailsDb[tripId]
  if (detail) {
    tripDetailsDb = {
      ...tripDetailsDb,
      [tripId]: {
        ...detail,
        trip: updated,
        legs: detail.legs.map((leg) => ({ ...leg, status: "done", actualTimestamp: leg.actualTimestamp ?? new Date().toISOString() })),
      },
    }
  }

  addAuditLog(tripId, "trip_status_changed", "Sefer tamamlandı olarak kapatıldı.")
  return clone(updated)
}

export async function cancelTrip(tripId: string): Promise<TripRecord | null> {
  const target = tripsDb.find((item) => item.id === tripId)
  if (!target || target.status === "completed") {
    return target ? clone(target) : null
  }

  const updated: TripRecord = {
    ...target,
    status: "cancelled",
    currentLocationSummary: "Sefer iptal edildi",
    updatedAt: new Date().toISOString(),
  }
  tripsDb = tripsDb.map((item) => (item.id === tripId ? updated : item))

  const detail = tripDetailsDb[tripId]
  if (detail) {
    tripDetailsDb = {
      ...tripDetailsDb,
      [tripId]: {
        ...detail,
        trip: updated,
      },
    }
  }

  addAuditLog(tripId, "trip_status_changed", "Sefer iptal edildi.")
  return clone(updated)
}

export async function generateTripTti(tripId: string): Promise<TripTtiDocument | null> {
  const trip = tripsDb.find((item) => item.id === tripId)
  if (!trip) return null
  const document = generateDynamicTtiDocument(trip, tripManifestDb[tripId] ?? [])
  addAuditLog(tripId, "document_printed", `Dinamik TTİ üretildi. ${document.packageCount} parça içeriyor.`)
  return clone(document)
}

export async function generateTripTtl(tripId: string): Promise<TripTtlDocument | null> {
  const trip = tripsDb.find((item) => item.id === tripId)
  if (!trip) return null
  const document = generateTtlDocument(trip, tripManifestDb[tripId] ?? [])
  addAuditLog(tripId, "document_printed", `TTL üretildi. ${document.touchedPackageCount} parça içeriyor.`)
  return clone(document)
}