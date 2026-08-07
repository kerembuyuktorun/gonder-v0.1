// TODO: Remove when API is ready
import type {
  IncomingEInvoiceDetail,
  IncomingEInvoiceRecord,
  IncomingEInvoiceStatus,
  IncomingEInvoiceSummary,
} from "../_types/incoming-e-invoice"

const incomingEInvoicesStore: IncomingEInvoiceDetail[] = [
  {
    id: "einv-001",
    senderTitle: "GELİŞİM FİLO KİRALAMA SANAYİ VE DIŞ TİC. LTD ŞTİ.",
    receiverTitle: "LOJIMOD LOJİSTİK TEKNOLOJİLERİ ANONİM ŞİRKETİ",
    receiverTaxNumber: "6091354207",
    invoiceNo: "FLO2026000000200",
    profileLabel: "Temel e-Fatura",
    invoiceTypeLabel: "Satış",
    invoiceDate: "2026-04-11",
    issueDateTime: "2026-04-11T13:40:22",
    dueDate: "2026-04-11",
    ettn: "4d7bd948-286a-4373-ba65-cfbae8dc41be",
    notes: [],
    amount: 84000,
    status: "accepted_basic",
    supplierMatched: false,
  },
  {
    id: "einv-002",
    senderTitle: "KURGOLA TEKNOLOJİ LOJİSTİK REKLAMCILIK ORGANİZASYON LİMİTED ŞİRKETİ",
    receiverTitle: "LOJIMOD LOJİSTİK TEKNOLOJİLERİ ANONİM ŞİRKETİ",
    receiverTaxNumber: "6091354207",
    invoiceNo: "KY02026000000078",
    profileLabel: "Ticari e-Fatura",
    invoiceTypeLabel: "Tevkifat",
    invoiceDate: "2026-04-10",
    issueDateTime: "2026-04-10T14:16:37",
    dueDate: "2026-05-20",
    ettn: "864e1e52-47ae-4547-ac4b-beff4069f654",
    notes: [],
    amount: 148944,
    status: "pending_approval",
    supplierMatched: false,
  },
  {
    id: "einv-003",
    senderTitle: "ANADOLU ENERJİ TEDARİK A.Ş.",
    receiverTitle: "LOJIMOD LOJİSTİK TEKNOLOJİLERİ ANONİM ŞİRKETİ",
    receiverTaxNumber: "6091354207",
    invoiceNo: "ANE2026000001045",
    profileLabel: "Temel e-Fatura",
    invoiceTypeLabel: "Satış",
    invoiceDate: "2026-04-09",
    issueDateTime: "2026-04-09T10:28:05",
    dueDate: "2026-04-25",
    ettn: "51a7b884-9730-4cf4-8f67-4a6c7b53ffd1",
    notes: [],
    amount: 23870,
    status: "accepted_basic",
    supplierMatched: true,
  },
]

const incomingEInvoiceSupplierOptions = [
  "GELİŞİM FİLO KİRALAMA SANAYİ VE DIŞ TİC. LTD ŞTİ.",
  "KURGOLA TEKNOLOJİ LOJİSTİK REKLAMCILIK ORGANİZASYON LİMİTED ŞİRKETİ",
  "ANADOLU ENERJİ TEDARİK A.Ş.",
  "CHAKRA MAĞAZACILIK TİC. A.Ş.",
  "LOJIMOD TEDARİK OPERASYON HİZMETLERİ A.Ş.",
]

export function getIncomingEInvoices(): IncomingEInvoiceRecord[] {
  return incomingEInvoicesStore.map((invoice) => ({ ...invoice }))
}

export function getIncomingEInvoicesSummary(): IncomingEInvoiceSummary {
  const totalAmount = incomingEInvoicesStore.reduce((sum, r) => sum + r.amount, 0)
  const accepted = incomingEInvoicesStore.filter((r) => r.status === "accepted_basic")
  const pending = incomingEInvoicesStore.filter((r) => r.status === "pending_approval")

  return {
    totalAmount,
    acceptedAmount: accepted.reduce((sum, r) => sum + r.amount, 0),
    pendingAmount: pending.reduce((sum, r) => sum + r.amount, 0),
    pendingCount: pending.length,
    totalCount: incomingEInvoicesStore.length,
  }
}

export function getIncomingEInvoiceById(id: string): IncomingEInvoiceDetail | undefined {
  const found = incomingEInvoicesStore.find((invoice) => invoice.id === id)
  return found ? { ...found, notes: [...found.notes] } : undefined
}

export function updateIncomingEInvoiceStatus(
  id: string,
  status: IncomingEInvoiceStatus,
): IncomingEInvoiceDetail | undefined {
  const idx = incomingEInvoicesStore.findIndex((invoice) => invoice.id === id)
  if (idx < 0) {
    return undefined
  }

  incomingEInvoicesStore[idx] = {
    ...incomingEInvoicesStore[idx],
    status,
  }

  return { ...incomingEInvoicesStore[idx], notes: [...incomingEInvoicesStore[idx].notes] }
}

export function addIncomingEInvoiceNote(id: string, note: string): IncomingEInvoiceDetail | undefined {
  const idx = incomingEInvoicesStore.findIndex((invoice) => invoice.id === id)
  if (idx < 0) {
    return undefined
  }

  const trimmed = note.trim()
  if (!trimmed) {
    return { ...incomingEInvoicesStore[idx], notes: [...incomingEInvoicesStore[idx].notes] }
  }

  incomingEInvoicesStore[idx] = {
    ...incomingEInvoicesStore[idx],
    notes: [...incomingEInvoicesStore[idx].notes, trimmed],
  }

  return { ...incomingEInvoicesStore[idx], notes: [...incomingEInvoicesStore[idx].notes] }
}

export function getIncomingEInvoiceSupplierOptions(): string[] {
  return [...incomingEInvoiceSupplierOptions]
}
