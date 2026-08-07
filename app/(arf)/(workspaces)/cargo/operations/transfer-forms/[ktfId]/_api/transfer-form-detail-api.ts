import { mockAvailableCargos, mockTransferFormDetails } from "../_mock/transfer-form-detail-mock-data"
import type { CloseTransferFormSummary, ConsignmentItem, TransferFormDetail } from "../_types/detail"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

let detailDb: Record<string, TransferFormDetail> = clone(mockTransferFormDetails)
let cargoPool: ConsignmentItem[] = clone(mockAvailableCargos)

export async function fetchTransferFormDetail(ktfId: string): Promise<TransferFormDetail | null> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  const detail = detailDb[ktfId]
  return detail ? clone(detail) : null
}

export async function addConsignmentToKTF(
  ktfId: string,
  cargoId: string,
): Promise<{ ok: true; detail: TransferFormDetail } | { ok: false; error: string }> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  const detail = detailDb[ktfId]
  if (!detail) return { ok: false, error: "KTF bulunamadı" }
  if (detail.status === "CLOSED") return { ok: false, error: "Kapalı KTF'ye zimmet eklenemez" }

  // Zaten zimmette mi?
  if (detail.consignments.some((c) => c.cargoId === cargoId)) {
    return { ok: false, error: "Bu parça zaten zimmetinizde bulunmaktadır" }
  }

  // Başka KTF'de mi?
  for (const [, otherDetail] of Object.entries(detailDb)) {
    if (otherDetail.id !== ktfId && otherDetail.consignments.some((c) => c.cargoId === cargoId)) {
      return { ok: false, error: "Bu parça başka bir transfer formunun zimmetinde" }
    }
  }

  // Pool'dan bul
  const cargo = cargoPool.find((c) => c.cargoId === cargoId)
  if (!cargo) return { ok: false, error: "Parça bulunamadı" }

  // Ekle
  detail.consignments = [...detail.consignments, cargo]
  detail.totalConsignments = detail.consignments.length
  detail.totalCollectionAmount = detail.consignments.reduce((sum, c) => sum + c.totalPrice, 0)
  detail.updatedAt = new Date().toISOString()
  cargoPool = cargoPool.filter((c) => c.cargoId !== cargoId)
  detailDb = { ...detailDb, [ktfId]: detail }

  return { ok: true, detail: clone(detail) }
}

export async function removeConsignmentFromKTF(
  ktfId: string,
  cargoId: string,
): Promise<{ ok: true; detail: TransferFormDetail } | { ok: false; error: string }> {
  await new Promise((resolve) => setTimeout(resolve, 150))

  const detail = detailDb[ktfId]
  if (!detail) return { ok: false, error: "KTF bulunamadı" }
  if (detail.status === "CLOSED") return { ok: false, error: "Kapalı KTF'den zimmet çıkarılamaz" }

  const removed = detail.consignments.find((c) => c.cargoId === cargoId)
  if (!removed) return { ok: false, error: "Parça bu KTF'de bulunamadı" }

  detail.consignments = detail.consignments.filter((c) => c.cargoId !== cargoId)
  detail.totalConsignments = detail.consignments.length
  detail.totalCollectionAmount = detail.consignments.reduce((sum, c) => sum + c.totalPrice, 0)
  detail.updatedAt = new Date().toISOString()
  cargoPool = [...cargoPool, removed]
  detailDb = { ...detailDb, [ktfId]: detail }

  return { ok: true, detail: clone(detail) }
}

export async function searchCargoByBarcode(
  barcode: string,
): Promise<{ ok: true; cargo: ConsignmentItem } | { ok: false; error: string }> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Önce mevcut KTF'lerdeki consignment'larda ara
  for (const [, detail] of Object.entries(detailDb)) {
    const found = detail.consignments.find((c) => c.trackingNumber === barcode)
    if (found) return { ok: true, cargo: clone(found) }
  }

  // Sonra pool'da ara
  const poolCargo = cargoPool.find((c) => c.trackingNumber === barcode)
  if (poolCargo) return { ok: true, cargo: clone(poolCargo) }

  return { ok: false, error: `${barcode} numaralı parça bulunamadı` }
}

export async function closeTransferForm(
  ktfId: string,
  managerId: string,
): Promise<{ ok: true; result: CloseTransferFormSummary } | { ok: false; error: string }> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const detail = detailDb[ktfId]
  if (!detail) return { ok: false, error: "KTF bulunamadı" }
  if (detail.status === "CLOSED") return { ok: false, error: "Bu KTF zaten kapalı" }

  const deliveredCount = detail.consignments.filter((c) => c.cargoStatus === "TESLİM_EDİLDİ").length
  const failedCount = detail.consignments.filter((c) => c.cargoStatus === "TESLİMATI_YAPILMADI").length
  const cashCollection = detail.consignments
    .filter((c) => c.cargoStatus === "TESLİM_EDİLDİ" && c.paymentType === "NAKİT")
    .reduce((sum, c) => sum + c.totalPrice, 0)

  const deferredCargos = detail.consignments
    .filter((c) => c.cargoStatus === "TESLİMATI_YAPILMADI")
    .map((c) => c.trackingNumber)

  const now = new Date().toISOString()
  detail.status = "CLOSED"
  detail.closedAt = now
  detail.closedByUserId = managerId
  detail.closedByUserName = "Şube Müdürü"
  detail.totalCollectionAmount = cashCollection
  detail.updatedAt = now
  detailDb = { ...detailDb, [ktfId]: detail }

  return {
    ok: true,
    result: {
      ktf: clone(detail),
      summary: {
        totalDeliveries: deliveredCount,
        totalFailed: failedCount,
        totalCollection: cashCollection,
        deferredCargos,
      },
    },
  }
}
