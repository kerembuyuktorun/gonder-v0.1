import { mockTransferForms } from "../_mock/transfer-forms-mock-data"
import type {
  CreateTransferFormError,
  CreateTransferFormResponse,
  TransferFormListKpi,
  TransferFormListRecord,
  TransferFormStatus,
} from "../_types"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

let db: TransferFormListRecord[] = clone(mockTransferForms)

function calculateKpi(rows: TransferFormListRecord[]): TransferFormListKpi {
  const openRows = rows.filter((r) => r.status === "OPEN")
  const totalConsignments = rows.reduce((sum, r) => sum + r.totalConsignments, 0)

  return {
    totalKtf: rows.length,
    totalOpen: openRows.length,
    totalConsignments,
  }
}

export async function fetchTransferForms(filters?: {
  courierName?: string
  branchId?: string
  status?: TransferFormStatus
  dateFrom?: string
  dateTo?: string
}): Promise<TransferFormListRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  let result = clone(db)

  if (filters?.courierName) {
    const q = filters.courierName.toLowerCase()
    result = result.filter((r) => r.courierName.toLowerCase().includes(q))
  }
  if (filters?.branchId) {
    result = result.filter((r) => r.branchId === filters.branchId)
  }
  if (filters?.status) {
    result = result.filter((r) => r.status === filters.status)
  }
  if (filters?.dateFrom) {
    result = result.filter((r) => r.openedAt >= filters.dateFrom!)
  }
  if (filters?.dateTo) {
    result = result.filter((r) => r.openedAt <= filters.dateTo!)
  }

  return result
}

export async function fetchTransferFormListKpi(): Promise<TransferFormListKpi> {
  await new Promise((resolve) => setTimeout(resolve, 50))
  return calculateKpi(db)
}

export async function createNewTransferForm(): Promise<CreateTransferFormResponse | CreateTransferFormError> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  // Mock: mevcut kullanıcı usr-001, Emir Tarhan olarak simüle ediliyor
  const currentCourierId = "usr-001"
  const currentCourierName = "Emir Tarhan"

  // Açık KTF kontrolü
  const existingOpen = db.find((r) => r.courierId === currentCourierId && r.status === "OPEN")
  if (existingOpen) {
    return {
      code: "COURIER_HAS_OPEN_KTF",
      message: `${currentCourierName} adlı kuryenin zaten ${existingOpen.ktfNumber} numaralı açık bir transfer formu bulunmaktadır. Lütfen önce bunu kapatınız.`,
      existingKtfId: existingOpen.id,
    }
  }

  // Yeni KTF No üretimi
  const maxNumber = db.reduce((max, r) => Math.max(max, parseInt(r.ktfNumber, 10)), 0)
  const newKtfNumber = String(maxNumber + 1)

  const now = new Date().toISOString()
  const newRecord: TransferFormListRecord = {
    id: `ktf-${Date.now()}`,
    ktfNumber: newKtfNumber,
    courierId: currentCourierId,
    courierName: currentCourierName,
    branchId: "branch-001",
    branchName: "İstanbul Anadolu Şubesi",
    status: "OPEN",
    openedAt: now,
    closedAt: null,
    totalConsignments: 0,
    totalCollectionAmount: 0,
    createdAt: now,
    updatedAt: now,
  }

  db = [newRecord, ...db]

  return {
    id: newRecord.id,
    ktfNumber: newRecord.ktfNumber,
    courierId: newRecord.courierId,
    courierName: newRecord.courierName,
    status: "OPEN",
    consignments: [],
    totalConsignments: 0,
    totalCollectionAmount: 0,
  }
}
