// TODO: Remove when API is ready
import type {
  ExpenseRecord,
  ExpenseStatus,
  ExpenseSummary,
} from "../_types/expense"

const expensesStore: ExpenseRecord[] = [
  {
    id: "exp-001",
    supplierTitle: "GELİŞİM FİLO KİRALAMA SANAYİ VE DIŞ TİC. LTD ŞTİ.",
    invoiceNo: "FLO2026000000200",
    category: "Araç Kiralama",
    tag: "Operasyon",
    invoiceDate: "2026-04-11",
    dueDate: "2026-04-11",
    netAmount: 70000,
    vatAmount: 14000,
    totalAmount: 84000,
    remainingAmount: 0,
    status: "paid",
  },
  {
    id: "exp-002",
    supplierTitle: "ANADOLU ENERJİ TEDARİK A.Ş.",
    invoiceNo: "ANE2026000001045",
    category: "Enerji",
    tag: "Genel Gider",
    invoiceDate: "2026-04-09",
    dueDate: "2026-04-25",
    netAmount: 19891.67,
    vatAmount: 3978.33,
    totalAmount: 23870,
    remainingAmount: 23870,
    status: "unpaid",
  },
  {
    id: "exp-003",
    supplierTitle: "KURGOLA TEKNOLOJİ LOJİSTİK REKLAMCILIK ORGANİZASYON LİMİTED ŞİRKETİ",
    invoiceNo: "KY02026000000055",
    category: "Lojistik Hizmet",
    tag: "Operasyon",
    invoiceDate: "2026-03-28",
    dueDate: "2026-04-10",
    netAmount: 46833.33,
    vatAmount: 9366.67,
    totalAmount: 56200,
    remainingAmount: 56200,
    status: "overdue",
  },
  {
    id: "exp-004",
    supplierTitle: "CHAKRA MAĞAZACILIK TİC. A.Ş.",
    invoiceNo: "CHK2026000000312",
    category: "Ofis Malzemesi",
    tag: "İdari",
    invoiceDate: "2026-04-05",
    dueDate: "2026-05-05",
    netAmount: 10375,
    vatAmount: 2075,
    totalAmount: 12450,
    remainingAmount: 6225,
    status: "partially_paid",
  },
  {
    id: "exp-005",
    supplierTitle: "LOJIMOD TEDARİK OPERASYON HİZMETLERİ A.Ş.",
    invoiceNo: "LJM2026000000089",
    category: "Kurye Hizmet",
    tag: "Operasyon",
    invoiceDate: "2026-04-01",
    dueDate: "2026-04-15",
    netAmount: 124120,
    vatAmount: 24824,
    totalAmount: 148944,
    remainingAmount: 148944,
    status: "unpaid",
  },
]

export function getExpenses(): ExpenseRecord[] {
  return expensesStore.map((e) => ({ ...e }))
}

export function getExpensesSummary(): ExpenseSummary {
  const totalAmount = expensesStore.reduce((sum, r) => sum + r.totalAmount, 0)
  const paidAmount = expensesStore
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + r.totalAmount, 0)
  const unpaidRecords = expensesStore.filter((r) => r.status === "unpaid" || r.status === "partially_paid")
  const unpaidAmount = unpaidRecords.reduce((sum, r) => sum + r.remainingAmount, 0)
  const overdueRecords = expensesStore.filter((r) => r.status === "overdue")
  const overdueAmount = overdueRecords.reduce((sum, r) => sum + r.remainingAmount, 0)

  return {
    totalAmount,
    paidAmount,
    unpaidAmount,
    overdueAmount,
    totalCount: expensesStore.length,
    overdueCount: overdueRecords.length,
  }
}

export function getExpenseById(id: string): ExpenseRecord | undefined {
  const found = expensesStore.find((e) => e.id === id)
  return found ? { ...found } : undefined
}

export function updateExpenseStatus(id: string, status: ExpenseStatus): ExpenseRecord | undefined {
  const idx = expensesStore.findIndex((e) => e.id === id)
  if (idx < 0) return undefined
  expensesStore[idx] = { ...expensesStore[idx], status }
  return { ...expensesStore[idx] }
}
