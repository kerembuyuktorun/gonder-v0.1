import {
  moneyTry,
  type FinanceInvoice,
  type FinanceTransaction,
  type PaymentStatus,
  type UpcomingPayment,
} from '../_types/finance'

export type FinanceListQuery = {
  search?: string
  status?: PaymentStatus | null
}

export type FinanceSummary = {
  walletBalanceTry: number
  upcomingCount: number
  upcomingTotalTry: number
  remainingDebtTry: number
  paidTotalTry: number
  transactionCount: number
  invoiceCount: number
}

export type FinanceTransactionsResult = {
  items: FinanceTransaction[]
  total: number
}

export type UpcomingPaymentsResult = {
  items: UpcomingPayment[]
  total: number
  dueCount: number
}

export type FinanceInvoicesResult = {
  items: FinanceInvoice[]
  total: number
}

export interface FinanceRepository {
  getSummary(): Promise<FinanceSummary>
  listTransactions(query?: FinanceListQuery): Promise<FinanceTransactionsResult>
  getTransactionById(id: string): Promise<FinanceTransaction | null>
  listUpcoming(query?: FinanceListQuery): Promise<UpcomingPaymentsResult>
  getUpcomingById(id: string): Promise<UpcomingPayment | null>
  countUpcomingDue(): Promise<number>
  listInvoices(query?: FinanceListQuery): Promise<FinanceInvoicesResult>
  getInvoiceById(id: string): Promise<FinanceInvoice | null>
}

const seedTransactions: FinanceTransaction[] = [
  {
    id: 'ftx-1001',
    occurredAt: '2026-08-06T14:20:00.000Z',
    description: 'Gönderi ödemesi · GND-4401',
    amount: moneyTry(189),
    direction: 'debit',
    status: 'paid',
    method: 'wallet',
    entity: { type: 'shipment', id: 'shp-1001', label: 'GND-4401' },
    remainingBalance: moneyTry(0),
  },
  {
    id: 'ftx-1002',
    occurredAt: '2026-08-05T09:10:00.000Z',
    description: 'Kısmi tahsilat · ORD-10023',
    amount: moneyTry(120),
    direction: 'debit',
    status: 'partial',
    method: 'card',
    entity: { type: 'order', id: 'ord-10023', label: 'ORD-10023' },
    remainingBalance: moneyTry(80),
  },
  {
    id: 'ftx-1003',
    occurredAt: '2026-08-04T16:45:00.000Z',
    description: 'İade · GND-4388',
    amount: moneyTry(75),
    direction: 'credit',
    status: 'refunded',
    method: 'wallet',
    entity: { type: 'shipment', id: 'shp-0998', label: 'GND-4388' },
    remainingBalance: null,
  },
  {
    id: 'ftx-1004',
    occurredAt: '2026-08-03T11:00:00.000Z',
    description: 'Kart ödemesi başarısız · GND-4370',
    amount: moneyTry(249),
    direction: 'debit',
    status: 'failed',
    method: 'card',
    entity: { type: 'shipment', id: 'shp-0990', label: 'GND-4370' },
    remainingBalance: moneyTry(249),
  },
  {
    id: 'ftx-1005',
    occurredAt: '2026-08-02T08:30:00.000Z',
    description: 'Vadeli fatura tahsilatı · FTR-2026-1004',
    amount: moneyTry(540),
    direction: 'debit',
    status: 'pending',
    method: 'invoice',
    entity: { type: 'invoice', id: 'inv-1004', label: 'FTR-2026-1004' },
    remainingBalance: moneyTry(540),
  },
]

const seedUpcoming: UpcomingPayment[] = [
  {
    id: 'up-2001',
    dueAt: '2026-08-08T17:00:00.000Z',
    description: 'Gönderi ücreti · GND-4412',
    amount: moneyTry(210),
    paidAmount: moneyTry(0),
    status: 'unpaid',
    method: null,
    entity: { type: 'shipment', id: 'shp-1012', label: 'GND-4412' },
  },
  {
    id: 'up-2002',
    dueAt: '2026-08-09T12:00:00.000Z',
    description: 'Kalan bakiye · ORD-10023',
    amount: moneyTry(80),
    paidAmount: moneyTry(120),
    status: 'partial',
    method: 'card',
    entity: { type: 'order', id: 'ord-10023', label: 'ORD-10023' },
  },
  {
    id: 'up-2003',
    dueAt: '2026-08-12T09:00:00.000Z',
    description: 'Vadeli fatura · FTR-2026-1004',
    amount: moneyTry(540),
    paidAmount: moneyTry(0),
    status: 'pending',
    method: 'invoice',
    entity: { type: 'invoice', id: 'inv-1004', label: 'FTR-2026-1004' },
  },
]

const seedInvoices: FinanceInvoice[] = [
  {
    id: 'inv-1004',
    number: 'FTR-2026-1004',
    issuedAt: '2026-08-01T10:00:00.000Z',
    dueAt: '2026-08-12T09:00:00.000Z',
    amount: moneyTry(540),
    status: 'issued',
    entity: { type: 'shipment', id: 'shp-1004', label: 'GND-4399' },
    documentReady: false,
  },
  {
    id: 'inv-1005',
    number: 'FTR-2026-1005',
    issuedAt: '2026-07-28T14:00:00.000Z',
    dueAt: '2026-08-05T14:00:00.000Z',
    amount: moneyTry(320),
    status: 'paid',
    entity: { type: 'order', id: 'ord-9981', label: 'ORD-9981' },
    documentReady: false,
  },
  {
    id: 'inv-1006',
    number: 'FTR-2026-1006',
    issuedAt: null,
    dueAt: null,
    amount: moneyTry(150),
    status: 'draft',
    entity: { type: 'quote', id: 'q-2201', label: 'Teklif Q-2201' },
    documentReady: false,
  },
]

function matchesSearch(
  haystack: string,
  search?: string
): boolean {
  if (!search?.trim()) return true
  const needle = search.trim().toLocaleLowerCase('tr-TR')
  return haystack.toLocaleLowerCase('tr-TR').includes(needle)
}

export class MockFinanceRepository implements FinanceRepository {
  private transactions: FinanceTransaction[] = seedTransactions.map((item) => ({ ...item }))
  private upcoming: UpcomingPayment[] = seedUpcoming.map((item) => ({ ...item }))
  private invoices: FinanceInvoice[] = seedInvoices.map((item) => ({ ...item }))
  /** Dashboard özeti için seed cüzdan bakiyesi — wallet repo ile senkron sonraki dilimde */
  private walletBalanceTry = 1250.5

  async getSummary(): Promise<FinanceSummary> {
    await delay(60)
    const dueItems = this.upcoming.filter((item) =>
      ['unpaid', 'partial', 'pending'].includes(item.status)
    )
    const remainingDebtTry = dueItems.reduce(
      (sum, item) => sum + Math.max(0, item.amount.amount - item.paidAmount.amount),
      0
    )
    const paidTotalTry = this.transactions
      .filter((item) => item.status === 'paid')
      .reduce((sum, item) => sum + item.amount.amount, 0)

    return {
      walletBalanceTry: this.walletBalanceTry,
      upcomingCount: dueItems.length,
      upcomingTotalTry: dueItems.reduce((sum, item) => sum + item.amount.amount, 0),
      remainingDebtTry,
      paidTotalTry,
      transactionCount: this.transactions.length,
      invoiceCount: this.invoices.length,
    }
  }

  async listTransactions(query: FinanceListQuery = {}): Promise<FinanceTransactionsResult> {
    await delay(70)
    const items = this.transactions.filter((item) => {
      if (query.status && item.status !== query.status) return false
      return matchesSearch(
        `${item.description} ${item.entity?.label ?? ''} ${item.id}`,
        query.search
      )
    })
    return { items, total: items.length }
  }

  async getTransactionById(id: string): Promise<FinanceTransaction | null> {
    await delay(40)
    return this.transactions.find((item) => item.id === id) ?? null
  }

  async listUpcoming(query: FinanceListQuery = {}): Promise<UpcomingPaymentsResult> {
    await delay(70)
    const items = this.upcoming.filter((item) => {
      if (query.status && item.status !== query.status) return false
      return matchesSearch(
        `${item.description} ${item.entity?.label ?? ''} ${item.id}`,
        query.search
      )
    })
    const dueCount = this.upcoming.filter((item) =>
      ['unpaid', 'partial', 'pending'].includes(item.status)
    ).length
    return { items, total: items.length, dueCount }
  }

  async getUpcomingById(id: string): Promise<UpcomingPayment | null> {
    await delay(40)
    return this.upcoming.find((item) => item.id === id) ?? null
  }

  async countUpcomingDue(): Promise<number> {
    await delay(40)
    return this.upcoming.filter((item) =>
      ['unpaid', 'partial', 'pending'].includes(item.status)
    ).length
  }

  async listInvoices(query: FinanceListQuery = {}): Promise<FinanceInvoicesResult> {
    await delay(70)
    const items = this.invoices.filter((item) =>
      matchesSearch(`${item.number} ${item.entity?.label ?? ''} ${item.id}`, query.search)
    )
    return { items, total: items.length }
  }

  async getInvoiceById(id: string): Promise<FinanceInvoice | null> {
    await delay(40)
    return this.invoices.find((item) => item.id === id) ?? null
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const financeRepository: FinanceRepository = new MockFinanceRepository()
