// TODO: Remove when API is ready

import type { FinancialExstreRecord, FinancialKpi, OpenCargoRecord } from "../_types/financial"

const OPEN_CARGOS_STORAGE_KEY = "arf-customer-open-cargos"
const INVOICES_STORAGE_KEY = "arf-customer-financial-invoices"

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function cloneOpenCargo(record: OpenCargoRecord): OpenCargoRecord {
  return { ...record }
}

function cloneInvoice(record: FinancialExstreRecord): FinancialExstreRecord {
  return { ...record }
}

function getBaseOpenCargos(): Record<string, OpenCargoRecord[]> {
  return Object.fromEntries(
    Object.entries(mockOpenCargos).map(([customerId, rows]) => [customerId, rows.map(cloneOpenCargo)]),
  )
}

function getBaseInvoices(): Record<string, FinancialExstreRecord[]> {
  return Object.fromEntries(
    Object.entries(mockInvoices).map(([customerId, rows]) => [customerId, rows.map(cloneInvoice)]),
  )
}

function readStoredMap<T>(storageKey: string, fallback: Record<string, T[]>): Record<string, T[]> {
  if (!canUseStorage()) {
    return fallback
  }

  const raw = window.localStorage.getItem(storageKey)
  if (!raw) {
    return fallback
  }

  try {
    return JSON.parse(raw) as Record<string, T[]>
  } catch {
    return fallback
  }
}

function writeStoredMap<T>(storageKey: string, value: Record<string, T[]>): void {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(storageKey, JSON.stringify(value))
  window.dispatchEvent(new Event("arf-customer-financial-updated"))
}

export const mockFinancialKpi: Record<string, FinancialKpi> = {
  "cust-ahmet-karan": {
    openCargoAmount: 48000,
    pendingInvoiceDebt: 1910,
    overdueDebt: 930,
    lastCollectionDate: "2026-03-16",
    lastCollectionAmount: 1500,
    totalTransportCount: 5,
  },
  "cust-toprak": {
    openCargoAmount: 1210,
    pendingInvoiceDebt: 0,
    overdueDebt: 0,
    lastCollectionDate: "2026-03-13",
    lastCollectionAmount: 2175,
    totalTransportCount: 2,
  },
  "cust-yildiz-gida": {
    openCargoAmount: 15500,
    pendingInvoiceDebt: 3100,
    overdueDebt: 0,
    lastCollectionDate: "-",
    lastCollectionAmount: 0,
    totalTransportCount: 3,
  },
  "cust-delta-ticaret": {
    openCargoAmount: 48000,
    pendingInvoiceDebt: 48000,
    overdueDebt: 0,
    lastCollectionDate: "-",
    lastCollectionAmount: 0,
    totalTransportCount: 1,
  },
}

export const mockOpenCargos: Record<string, OpenCargoRecord[]> = {
  "cust-ahmet-karan": [],
  "cust-yildiz-gida": [
    {
      id: "shipment-200001",
      trackingNo: "ARF-200001",
      date: "2026-03-18 09:30",
      route: "Ankara -> İzmir",
      status: "dagitimda",
      pieceCount: 8,
      amount: 3100,
      senderCustomerId: "cust-yildiz-gida",
      senderCustomer: "YILDIZ GIDA SAN.",
      senderBranch: "Ankara Şube",
      receiverBranch: "İzmir Şube",
      receiverCustomer: "MEGA DEPOLAMA A.Ş.",
      receiverPhone: "0232 444 55 66",
      paymentType: "Gönderici Ödemeli",
      invoiceType: "Gönderici",
      baseAmount: 2583.33,
      vat: 516.67,
      volumetricWeight: 24,
      pieceList: "Koli",
      dispatchNo: "IRS-2026-03001",
      atfNo: "",
      arrivalAt: "",
      deliveryAt: "",
      lastActionAt: "2026-03-18 09:30",
      invoiceStatus: "kesilmedi",
      collectionStatus: "beklemede",
      createdBy: "Ali Kaya",
    },
  ],
  "cust-toprak": [
    {
      id: "shipment-100033",
      trackingNo: "ARF-100033",
      date: "2026-03-14 09:18",
      route: "Kahramanmaraş -> Adana",
      status: "hazirlaniyor",
      pieceCount: 3,
      amount: 1210,
      senderCustomerId: "cust-toprak",
      senderCustomer: "TPRK SU PLASTİK",
      senderBranch: "Kahramanmaraş Şube",
      receiverBranch: "Adana Şube",
      receiverCustomer: "Adana Toptan Ltd.",
      receiverPhone: "0322 412 33 10",
      paymentType: "Gönderici Ödemeli",
      invoiceType: "Gönderici",
      baseAmount: 1008.33,
      vat: 201.67,
      volumetricWeight: 9,
      pieceList: "Koli",
      dispatchNo: "IRS-2026-02288",
      atfNo: "",
      arrivalAt: "",
      deliveryAt: "",
      lastActionAt: "2026-03-14 09:18",
      invoiceStatus: "kesilmedi",
      collectionStatus: "beklemede",
      createdBy: "Ali Kaya",
    },
  ],
}

export const mockInvoices: Record<string, FinancialExstreRecord[]> = {
  "cust-ahmet-karan": [
    {
      id: "exs-ahmet-1",
      type: "fatura",
      invoiceName: "Mart 2. Hafta Sevkiyat",
      invoiceNo: "FTR-2026-01521",
      customerName: "AHMET KARAN NAKLİYAT",
      issueDate: "2026-03-15",
      dueDate: "2026-04-15",
      description: "Mart 2. hafta sevkiyat faturası (2 kargo)",
      amount: 4120,
      subTotal: 3440,
      vatTotal: 680,
      grandTotal: 4120,
      paidTotal: 0,
      remainingBalance: 4120,
      categoryLabel: "Nakliye",
      tagLabels: ["Sevkiyat"],
      status: "bekliyor",
      relatedCargoCount: 2,
      createdAt: "2026-03-15",
    },
    {
      id: "exs-ahmet-2",
      type: "gelen_odeme",
      invoiceNo: "THS-2026-00841",
      description: "Kısmi tahsilat – Banka transferi",
      amount: 1500,
      remainingBalance: 2620,
      status: "kismi",
      createdAt: "2026-03-16",
      senderName: "AHMET KARAN NAKLİYAT",
      senderIban: "TR33 0006 1005 1978 6457 8413 26",
      recipientName: "ARF LOJİSTİK A.Ş.",
      recipientIban: "TR12 0001 2009 8880 0016 0052 31",
      referenceNumber: "REF-2026-088441",
      direction: "credit",
      matchStatus: "auto_matched",
      matchSource: "customer_invoice",
      matchedEntityLabel: "FTR-2026-01521",
    },
    {
      id: "exs-ahmet-3",
      type: "fatura",
      invoiceName: "Ek Teslimat Faturası",
      invoiceNo: "FTR-2026-01599",
      customerName: "AHMET KARAN NAKLİYAT",
      issueDate: "2026-03-17",
      dueDate: "2026-03-25",
      description: "Ek teslimat faturası (1 kargo)",
      amount: 3350,
      subTotal: 2792,
      vatTotal: 558,
      grandTotal: 3350,
      paidTotal: 0,
      remainingBalance: 5970,
      categoryLabel: "Nakliye",
      tagLabels: ["Ek Teslimat"],
      status: "gecikti",
      relatedCargoCount: 1,
      createdAt: "2026-03-17",
    },
    {
      id: "exs-ahmet-4",
      type: "gelen_odeme",
      invoiceNo: "THS-2026-00910",
      description: "Havale – Garanti Bankası",
      amount: 2560,
      remainingBalance: 3410,
      status: "kismi",
      createdAt: "2026-03-22",
      senderName: "AHMET KARAN NAKLİYAT",
      senderIban: "TR33 0006 1005 1978 6457 8413 26",
      recipientName: "ARF LOJİSTİK A.Ş.",
      recipientIban: "TR12 0001 2009 8880 0016 0052 31",
      referenceNumber: "REF-2026-091022",
      direction: "credit",
      matchStatus: "manual_matched",
      matchSource: "customer_invoice",
      matchedEntityLabel: "FTR-2026-01599",
    },
    {
      id: "exs-ahmet-5",
      type: "fatura",
      invoiceName: "Mart 3. Hafta Sevkiyat",
      invoiceNo: "FTR-2026-01688",
      customerName: "AHMET KARAN NAKLİYAT",
      issueDate: "2026-03-24",
      dueDate: "2026-04-30",
      description: "Mart 3. hafta sevkiyat faturası (1 kargo)",
      amount: 1500,
      subTotal: 1250,
      vatTotal: 250,
      grandTotal: 1500,
      paidTotal: 0,
      remainingBalance: 4910,
      categoryLabel: "Nakliye",
      tagLabels: ["Sevkiyat"],
      status: "bekliyor",
      relatedCargoCount: 1,
      createdAt: "2026-03-24",
    },
  ],
  "cust-yildiz-gida": [
    {
      id: "exs-yildiz-1",
      type: "fatura",
      invoiceName: "Sevkiyat Faturası",
      invoiceNo: "FTR-2026-02100",
      customerName: "YILDIZ GIDA SAN.",
      issueDate: "2026-03-18",
      dueDate: "2026-04-18",
      description: "Sevkiyat faturası (1 kargo + 1 taşıma)",
      amount: 18600,
      subTotal: 15500,
      vatTotal: 3100,
      grandTotal: 18600,
      paidTotal: 0,
      remainingBalance: 18600,
      categoryLabel: "Nakliye",
      tagLabels: ["Sevkiyat", "Taşıma"],
      status: "bekliyor",
      relatedCargoCount: 2,
      createdAt: "2026-03-18",
    },
  ],
  "cust-delta-ticaret": [
    {
      id: "exs-delta-1",
      type: "fatura",
      invoiceName: "Taşıma Faturası",
      invoiceNo: "FTR-2025-00321",
      customerName: "DELTA TİCARET A.Ş.",
      issueDate: "2025-01-20",
      dueDate: "2025-02-20",
      description: "Taşıma faturası",
      amount: 48000,
      subTotal: 40000,
      vatTotal: 8000,
      grandTotal: 48000,
      paidTotal: 0,
      remainingBalance: 48000,
      categoryLabel: "Nakliye",
      tagLabels: [],
      status: "bekliyor",
      relatedCargoCount: 1,
      createdAt: "2025-01-20",
    },
  ],
  "cust-toprak": [
    {
      id: "exs-toprak-1",
      type: "fatura",
      invoiceName: "Haftalık Sevkiyat",
      invoiceNo: "FTR-2026-01492",
      customerName: "TPRK SU PLASTİK",
      issueDate: "2026-03-12",
      dueDate: "2026-04-12",
      description: "Haftalık sevkiyat faturası (1 kargo)",
      amount: 2175,
      subTotal: 1812.5,
      vatTotal: 362.5,
      grandTotal: 2175,
      paidTotal: 2175,
      remainingBalance: 0,
      categoryLabel: "Nakliye",
      tagLabels: ["Sevkiyat"],
      status: "odendi",
      relatedCargoCount: 1,
      createdAt: "2026-03-12",
    },
    {
      id: "exs-toprak-2",
      type: "gelen_odeme",
      invoiceNo: "THS-2026-00803",
      description: "Banka transferi",
      amount: 2175,
      remainingBalance: 0,
      status: "odendi",
      createdAt: "2026-03-13",
      senderName: "TPRK SU PLASTİK",
      senderIban: "TR77 0001 0025 4321 9876 5400 01",
      recipientName: "ARF LOJİSTİK A.Ş.",
      recipientIban: "TR12 0001 2009 8880 0016 0052 31",
      referenceNumber: "REF-2026-080300",
      direction: "credit",
      matchStatus: "auto_matched",
      matchSource: "customer_invoice",
      matchedEntityLabel: "FTR-2026-01492",
    },
  ],
}

export function getStoredOpenCargos(customerId: string): OpenCargoRecord[] {
  const store = readStoredMap(OPEN_CARGOS_STORAGE_KEY, getBaseOpenCargos())
  return (store[customerId] ?? []).map(cloneOpenCargo)
}

export function getStoredInvoices(customerId: string): FinancialExstreRecord[] {
  const store = readStoredMap(INVOICES_STORAGE_KEY, getBaseInvoices())
  return (store[customerId] ?? []).map(cloneInvoice)
}

export function lockCustomerOpenCargos(customerId: string, cargoIds: string[]): OpenCargoRecord[] {
  const store = readStoredMap(OPEN_CARGOS_STORAGE_KEY, getBaseOpenCargos())
  const current = store[customerId] ?? []
  const next = current.filter((cargo) => !cargoIds.includes(cargo.id))
  store[customerId] = next
  writeStoredMap(OPEN_CARGOS_STORAGE_KEY, store)
  return next.map(cloneOpenCargo)
}

export function releaseCustomerOpenCargos(customerId: string, cargos: OpenCargoRecord[]): OpenCargoRecord[] {
  const store = readStoredMap(OPEN_CARGOS_STORAGE_KEY, getBaseOpenCargos())
  const current = store[customerId] ?? []
  const currentIds = new Set(current.map((cargo) => cargo.id))
  const restored = cargos.filter((cargo) => !currentIds.has(cargo.id)).map(cloneOpenCargo)
  store[customerId] = [...restored, ...current]
  writeStoredMap(OPEN_CARGOS_STORAGE_KEY, store)
  return store[customerId].map(cloneOpenCargo)
}

export function prependCustomerInvoice(customerId: string, invoice: FinancialExstreRecord): FinancialExstreRecord[] {
  const store = readStoredMap(INVOICES_STORAGE_KEY, getBaseInvoices())
  store[customerId] = [cloneInvoice(invoice), ...(store[customerId] ?? [])]
  writeStoredMap(INVOICES_STORAGE_KEY, store)
  return store[customerId].map(cloneInvoice)
}
