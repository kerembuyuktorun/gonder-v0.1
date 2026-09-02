import {
  moneyTry,
  type FinanceInvoice,
  type FinanceInvoiceKind,
  type FinanceInvoiceStatus,
  type FinanceSettlementChannel,
  type FinanceSummaryPeriod,
  type FinanceTransaction,
  type PaymentStatus,
  type UpcomingPayment,
} from '../_types/finance'
import {
  creditRefundNarrative,
  creditTopUpNarrative,
  debitNarrative,
  upcomingNarrative,
} from '../_lib/finance-narrative'
import { walletRepository } from './wallet-repository'

export type FinanceListQuery = {
  search?: string
  status?: PaymentStatus | null
  settlement?: FinanceSettlementChannel | null
  invoiceStatus?: FinanceInvoiceStatus | null
  invoiceKind?: FinanceInvoiceKind | null
  invoiceId?: string | null
}

export type FinanceSummary = {
  period: FinanceSummaryPeriod
  orderCount: number
  logisticsSpendTry: number
  estimatedSavingsTry: number
  pendingPaymentTry: number
  pendingPaymentCount: number
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

export type PayUpcomingResult = {
  upcoming: UpcomingPayment
  transaction: FinanceTransaction
}

export interface FinanceRepository {
  getSummary(period?: FinanceSummaryPeriod): Promise<FinanceSummary>
  listTransactions(query?: FinanceListQuery): Promise<FinanceTransactionsResult>
  getTransactionById(id: string): Promise<FinanceTransaction | null>
  listUpcoming(query?: FinanceListQuery): Promise<UpcomingPaymentsResult>
  getUpcomingById(id: string): Promise<UpcomingPayment | null>
  countUpcomingDue(): Promise<number>
  listInvoices(query?: FinanceListQuery): Promise<FinanceInvoicesResult>
  getInvoiceById(id: string): Promise<FinanceInvoice | null>
  payUpcoming(id: string, channel: FinanceSettlementChannel): Promise<PayUpcomingResult>
  recordWalletTopUp(input: {
    amountTry: number
    method: 'card' | 'transfer'
    note?: string
  }): Promise<FinanceTransaction>
}

const ORDER = {
  ord501: { type: 'order' as const, id: 'ord-501', label: 'ORD-10023' },
  ord502: { type: 'order' as const, id: 'ord-502', label: 'ORD-10041' },
  ord503: { type: 'order' as const, id: 'ord-503', label: 'ORD-9981' },
  ord504: { type: 'order' as const, id: 'ord-504', label: 'ORD-10055' },
  ord505: { type: 'order' as const, id: 'ord-505', label: 'ORD-10060' },
  ord509: { type: 'order' as const, id: 'ord-509', label: 'ORD-10102' },
  ord510: { type: 'order' as const, id: 'ord-510', label: 'ORD-10115' },
}

const SHIPMENT = {
  sh1001: { type: 'shipment' as const, id: 'sh-1001', label: 'GND-1001' },
  sh1002: { type: 'shipment' as const, id: 'sh-1002', label: 'GND-1002' },
  sh1003: { type: 'shipment' as const, id: 'sh-1003', label: 'GND-1003' },
  sh1004: { type: 'shipment' as const, id: 'sh-1004', label: 'GND-1004' },
  sh1005: { type: 'shipment' as const, id: 'sh-1005', label: 'GND-1005' },
  sh1006: { type: 'shipment' as const, id: 'sh-1006', label: 'GND-1006' },
  sh1008: { type: 'shipment' as const, id: 'sh-1008', label: 'GND-1008' },
  sh1009: { type: 'shipment' as const, id: 'sh-1009', label: 'GND-1009' },
  sh1010: { type: 'shipment' as const, id: 'sh-1010', label: 'GND-1010' },
}

const QUOTE = {
  qr1001: { type: 'quote' as const, id: 'qr-1001', label: 'TKF-1001' },
  qr1008: { type: 'quote' as const, id: 'qr-1008', label: 'TKF-1008' },
}

const INVOICE = {
  inv1001: { type: 'invoice' as const, id: 'inv-1001', label: 'FTR-2026-1001' },
  inv1003: { type: 'invoice' as const, id: 'inv-1003', label: 'FTR-2026-1003' },
  inv1004: { type: 'invoice' as const, id: 'inv-1004', label: 'FTR-2026-1004' },
  inv1005: { type: 'invoice' as const, id: 'inv-1005', label: 'FTR-2026-1005' },
  inv1008: { type: 'invoice' as const, id: 'inv-1008', label: 'FTR-2026-1008' },
  inv1011: { type: 'invoice' as const, id: 'inv-1011', label: 'FTR-2026-1011' },
}

/** Demo sipariş adetleri — finans özeti için (sipariş listesindeki tarihler Ağustos ağırlıklı) */
const PERIOD_ORDER_COUNTS: Record<FinanceSummaryPeriod, number> = {
  '7d': 8,
  '30d': 22,
  '90d': 47,
}

const SAVINGS_RATE = 0.12

function tx(partial: FinanceTransaction): FinanceTransaction {
  return partial
}

const seedTransactions: FinanceTransaction[] = [
  tx({
    id: 'ftx-1001',
    occurredAt: '2026-09-01T14:20:00.000Z',
    description: 'Gönderi ücreti · GND-1001',
    narrative: debitNarrative({
      shipmentLabel: 'GND-1001',
      orderLabel: 'ORD-10023',
      amountTry: 189,
      invoiceLabel: 'FTR-2026-1001',
      invoiceKind: 'batch',
      settlement: 'wallet',
    }),
    amount: moneyTry(189),
    direction: 'debit',
    status: 'paid',
    method: 'wallet',
    settlement: 'wallet',
    entity: SHIPMENT.sh1001,
    order: ORDER.ord501,
    shipment: SHIPMENT.sh1001,
    invoice: INVOICE.inv1001,
    invoiceKind: 'batch',
    quote: QUOTE.qr1001,
    remainingBalance: moneyTry(0),
  }),
  tx({
    id: 'ftx-1002',
    occurredAt: '2026-08-31T09:10:00.000Z',
    description: 'Gönderi ücreti · GND-1002',
    narrative: debitNarrative({
      shipmentLabel: 'GND-1002',
      orderLabel: 'ORD-10041',
      amountTry: 95,
      invoiceLabel: 'FTR-2026-1001',
      invoiceKind: 'batch',
      settlement: 'wallet',
    }),
    amount: moneyTry(95),
    direction: 'debit',
    status: 'paid',
    method: 'wallet',
    settlement: 'wallet',
    entity: SHIPMENT.sh1002,
    order: ORDER.ord502,
    shipment: SHIPMENT.sh1002,
    invoice: INVOICE.inv1001,
    invoiceKind: 'batch',
    quote: null,
    remainingBalance: moneyTry(0),
  }),
  tx({
    id: 'ftx-1006',
    occurredAt: '2026-08-28T11:40:00.000Z',
    description: 'Gönderi ücreti · GND-1006',
    narrative: debitNarrative({
      shipmentLabel: 'GND-1006',
      amountTry: 160,
      invoiceLabel: 'FTR-2026-1001',
      invoiceKind: 'batch',
      settlement: 'wallet',
    }),
    amount: moneyTry(160),
    direction: 'debit',
    status: 'paid',
    method: 'wallet',
    settlement: 'wallet',
    entity: SHIPMENT.sh1006,
    order: null,
    shipment: SHIPMENT.sh1006,
    invoice: INVOICE.inv1001,
    invoiceKind: 'batch',
    quote: null,
    remainingBalance: moneyTry(0),
  }),
  tx({
    id: 'ftx-1012',
    occurredAt: '2026-08-31T18:00:00.000Z',
    description: 'Cüzdan yükleme',
    narrative: creditTopUpNarrative(500, 'card'),
    amount: moneyTry(500),
    direction: 'credit',
    status: 'paid',
    method: 'card',
    settlement: 'wallet',
    entity: { type: 'wallet', id: 'wal-001', label: 'Cüzdan' },
    order: null,
    shipment: null,
    invoice: null,
    invoiceKind: null,
    quote: null,
    remainingBalance: null,
  }),
  tx({
    id: 'ftx-1003',
    occurredAt: '2026-08-20T16:45:00.000Z',
    description: 'Vadeli fatura · FTR-2026-1003',
    narrative: debitNarrative({
      shipmentLabel: 'GND-1003',
      orderLabel: 'ORD-9981',
      amountTry: 240,
      invoiceLabel: 'FTR-2026-1003',
      invoiceKind: 'single',
      settlement: 'cari',
    }),
    amount: moneyTry(240),
    direction: 'debit',
    status: 'paid',
    method: 'invoice',
    settlement: 'cari',
    entity: INVOICE.inv1003,
    order: ORDER.ord503,
    shipment: SHIPMENT.sh1003,
    invoice: INVOICE.inv1003,
    invoiceKind: 'single',
    quote: null,
    remainingBalance: moneyTry(0),
  }),
  tx({
    id: 'ftx-1005',
    occurredAt: '2026-08-10T08:30:00.000Z',
    description: 'Vadeli fatura · FTR-2026-1005',
    narrative: debitNarrative({
      shipmentLabel: 'GND-1005',
      orderLabel: 'ORD-10060',
      amountTry: 120,
      invoiceLabel: 'FTR-2026-1005',
      invoiceKind: 'single',
      settlement: 'cari',
    }),
    amount: moneyTry(120),
    direction: 'debit',
    status: 'paid',
    method: 'transfer',
    settlement: 'cari',
    entity: INVOICE.inv1005,
    order: ORDER.ord505,
    shipment: SHIPMENT.sh1005,
    invoice: INVOICE.inv1005,
    invoiceKind: 'single',
    quote: null,
    remainingBalance: moneyTry(0),
  }),
  tx({
    id: 'ftx-1004',
    occurredAt: '2026-08-06T11:00:00.000Z',
    description: 'Vadeli fatura · FTR-2026-1004',
    narrative: debitNarrative({
      shipmentLabel: 'GND-1004',
      orderLabel: 'ORD-10055',
      amountTry: 310,
      invoiceLabel: 'FTR-2026-1004',
      invoiceKind: 'single',
      settlement: 'cari',
    }),
    amount: moneyTry(310),
    direction: 'debit',
    status: 'pending',
    method: 'invoice',
    settlement: 'cari',
    entity: INVOICE.inv1004,
    order: ORDER.ord504,
    shipment: SHIPMENT.sh1004,
    invoice: INVOICE.inv1004,
    invoiceKind: 'single',
    quote: null,
    remainingBalance: moneyTry(310),
  }),
  tx({
    id: 'ftx-1008',
    occurredAt: '2026-08-06T14:20:00.000Z',
    description: 'Vadeli fatura · FTR-2026-1008',
    narrative: debitNarrative({
      shipmentLabel: 'GND-1008',
      orderLabel: 'ORD-10102',
      amountTry: 4200,
      invoiceLabel: 'FTR-2026-1008',
      invoiceKind: 'single',
      settlement: 'cari',
    }),
    amount: moneyTry(4200),
    direction: 'debit',
    status: 'pending',
    method: 'invoice',
    settlement: 'cari',
    entity: INVOICE.inv1008,
    order: ORDER.ord509,
    shipment: SHIPMENT.sh1008,
    invoice: INVOICE.inv1008,
    invoiceKind: 'single',
    quote: QUOTE.qr1008,
    remainingBalance: moneyTry(4200),
  }),
  tx({
    id: 'ftx-1011',
    occurredAt: '2026-08-07T09:30:00.000Z',
    description: 'Vadeli fatura · FTR-2026-1011',
    narrative: debitNarrative({
      shipmentLabel: 'GND-1009',
      amountTry: 1850,
      invoiceLabel: 'FTR-2026-1011',
      invoiceKind: 'single',
      settlement: 'cari',
    }),
    amount: moneyTry(1850),
    direction: 'debit',
    status: 'pending',
    method: 'invoice',
    settlement: 'cari',
    entity: INVOICE.inv1011,
    order: null,
    shipment: SHIPMENT.sh1009,
    invoice: INVOICE.inv1011,
    invoiceKind: 'single',
    quote: null,
    remainingBalance: moneyTry(1850),
  }),
  tx({
    id: 'ftx-1010',
    occurredAt: '2026-07-15T10:15:00.000Z',
    description: 'Gönderi ücreti · GND-1010',
    narrative: debitNarrative({
      shipmentLabel: 'GND-1010',
      orderLabel: 'ORD-10115',
      amountTry: 75,
      invoiceLabel: 'FTR-2026-1005',
      invoiceKind: 'single',
      settlement: 'wallet',
    }),
    amount: moneyTry(75),
    direction: 'debit',
    status: 'paid',
    method: 'wallet',
    settlement: 'wallet',
    entity: SHIPMENT.sh1010,
    order: ORDER.ord510,
    shipment: SHIPMENT.sh1010,
    invoice: INVOICE.inv1005,
    invoiceKind: 'single',
    quote: null,
    remainingBalance: moneyTry(0),
  }),
  tx({
    id: 'ftx-1013',
    occurredAt: '2026-08-03T16:20:00.000Z',
    description: 'İade · GND-1005',
    narrative: creditRefundNarrative({ shipmentLabel: 'GND-1005', amountTry: 40 }),
    amount: moneyTry(40),
    direction: 'credit',
    status: 'refunded',
    method: 'wallet',
    settlement: 'wallet',
    entity: SHIPMENT.sh1005,
    order: ORDER.ord505,
    shipment: SHIPMENT.sh1005,
    invoice: INVOICE.inv1005,
    invoiceKind: 'single',
    quote: null,
    remainingBalance: null,
  }),
]

const seedUpcoming: UpcomingPayment[] = [
  {
    id: 'up-2004',
    dueAt: '2026-09-08T17:00:00.000Z',
    description: 'Fatura ödemesi · FTR-2026-1004',
    narrative: upcomingNarrative({
      invoiceLabel: 'FTR-2026-1004',
      invoiceKind: 'single',
      amountTry: 310,
      settlement: 'cari',
      shipmentLabel: 'GND-1004',
    }),
    amount: moneyTry(310),
    paidAmount: moneyTry(0),
    status: 'unpaid',
    method: 'invoice',
    settlement: 'cari',
    entity: INVOICE.inv1004,
    order: ORDER.ord504,
    shipment: SHIPMENT.sh1004,
    invoice: INVOICE.inv1004,
    invoiceKind: 'single',
    invoiceNumber: 'FTR-2026-1004',
  },
  {
    id: 'up-2008',
    dueAt: '2026-09-15T12:00:00.000Z',
    description: 'Fatura ödemesi · FTR-2026-1008',
    narrative: upcomingNarrative({
      invoiceLabel: 'FTR-2026-1008',
      invoiceKind: 'single',
      amountTry: 4200,
      settlement: 'cari',
      shipmentLabel: 'GND-1008',
    }),
    amount: moneyTry(4200),
    paidAmount: moneyTry(0),
    status: 'unpaid',
    method: 'invoice',
    settlement: 'cari',
    entity: INVOICE.inv1008,
    order: ORDER.ord509,
    shipment: SHIPMENT.sh1008,
    invoice: INVOICE.inv1008,
    invoiceKind: 'single',
    invoiceNumber: 'FTR-2026-1008',
  },
  {
    id: 'up-2011',
    dueAt: '2026-09-20T09:00:00.000Z',
    description: 'Fatura ödemesi · FTR-2026-1011',
    narrative: upcomingNarrative({
      invoiceLabel: 'FTR-2026-1011',
      invoiceKind: 'single',
      amountTry: 1850,
      settlement: 'cari',
      shipmentLabel: 'GND-1009',
    }),
    amount: moneyTry(1850),
    paidAmount: moneyTry(0),
    status: 'unpaid',
    method: 'invoice',
    settlement: 'cari',
    entity: INVOICE.inv1011,
    order: null,
    shipment: SHIPMENT.sh1009,
    invoice: INVOICE.inv1011,
    invoiceKind: 'single',
    invoiceNumber: 'FTR-2026-1011',
  },
]

const seedInvoices: FinanceInvoice[] = [
  {
    id: 'inv-1001',
    number: 'FTR-2026-1001',
    kind: 'batch',
    issuedAt: '2026-08-31T10:00:00.000Z',
    dueAt: '2026-09-05T17:00:00.000Z',
    amount: moneyTry(444),
    status: 'paid',
    settlement: 'wallet',
    entity: INVOICE.inv1001,
    relatedOrders: [ORDER.ord501, ORDER.ord502],
    relatedShipments: [SHIPMENT.sh1001, SHIPMENT.sh1002, SHIPMENT.sh1006],
    relatedTransactionIds: ['ftx-1001', 'ftx-1002', 'ftx-1006'],
    documentReady: false,
  },
  {
    id: 'inv-1003',
    number: 'FTR-2026-1003',
    kind: 'single',
    issuedAt: '2026-08-20T09:00:00.000Z',
    dueAt: '2026-08-27T17:00:00.000Z',
    amount: moneyTry(240),
    status: 'paid',
    settlement: 'cari',
    entity: INVOICE.inv1003,
    relatedOrders: [ORDER.ord503],
    relatedShipments: [SHIPMENT.sh1003],
    relatedTransactionIds: ['ftx-1003'],
    documentReady: false,
  },
  {
    id: 'inv-1004',
    number: 'FTR-2026-1004',
    kind: 'single',
    issuedAt: '2026-08-06T10:00:00.000Z',
    dueAt: '2026-09-08T17:00:00.000Z',
    amount: moneyTry(310),
    status: 'issued',
    settlement: 'cari',
    entity: INVOICE.inv1004,
    relatedOrders: [ORDER.ord504],
    relatedShipments: [SHIPMENT.sh1004],
    relatedTransactionIds: ['ftx-1004'],
    documentReady: false,
  },
  {
    id: 'inv-1005',
    number: 'FTR-2026-1005',
    kind: 'single',
    issuedAt: '2026-08-02T14:00:00.000Z',
    dueAt: '2026-08-12T14:00:00.000Z',
    amount: moneyTry(120),
    status: 'paid',
    settlement: 'cari',
    entity: INVOICE.inv1005,
    relatedOrders: [ORDER.ord505, ORDER.ord510],
    relatedShipments: [SHIPMENT.sh1005, SHIPMENT.sh1010],
    relatedTransactionIds: ['ftx-1005', 'ftx-1010', 'ftx-1013'],
    documentReady: false,
  },
  {
    id: 'inv-1008',
    number: 'FTR-2026-1008',
    kind: 'single',
    issuedAt: '2026-08-06T15:00:00.000Z',
    dueAt: '2026-09-15T12:00:00.000Z',
    amount: moneyTry(4200),
    status: 'issued',
    settlement: 'cari',
    entity: INVOICE.inv1008,
    relatedOrders: [ORDER.ord509],
    relatedShipments: [SHIPMENT.sh1008],
    relatedTransactionIds: ['ftx-1008'],
    documentReady: false,
  },
  {
    id: 'inv-1011',
    number: 'FTR-2026-1011',
    kind: 'single',
    issuedAt: '2026-08-07T10:00:00.000Z',
    dueAt: '2026-09-20T09:00:00.000Z',
    amount: moneyTry(1850),
    status: 'issued',
    settlement: 'cari',
    entity: INVOICE.inv1011,
    relatedOrders: [],
    relatedShipments: [SHIPMENT.sh1009],
    relatedTransactionIds: ['ftx-1011'],
    documentReady: false,
  },
  {
    id: 'inv-1012',
    number: 'FTR-2026-1012',
    kind: 'single',
    issuedAt: null,
    dueAt: null,
    amount: moneyTry(150),
    status: 'draft',
    settlement: null,
    entity: { type: 'quote', id: 'qr-1003', label: 'TKF-1003' },
    relatedOrders: [],
    relatedShipments: [],
    relatedTransactionIds: [],
    documentReady: false,
  },
]

function matchesSearch(haystack: string, search?: string): boolean {
  if (!search?.trim()) return true
  const needle = search.trim().toLocaleLowerCase('tr-TR')
  return haystack.toLocaleLowerCase('tr-TR').includes(needle)
}

function cloneTx(item: FinanceTransaction): FinanceTransaction {
  return {
    ...item,
    amount: { ...item.amount },
    remainingBalance: item.remainingBalance ? { ...item.remainingBalance } : null,
    entity: item.entity ? { ...item.entity } : null,
    order: item.order ? { ...item.order } : null,
    shipment: item.shipment ? { ...item.shipment } : null,
    invoice: item.invoice ? { ...item.invoice } : null,
    quote: item.quote ? { ...item.quote } : null,
  }
}

function cloneUpcoming(item: UpcomingPayment): UpcomingPayment {
  return {
    ...item,
    amount: { ...item.amount },
    paidAmount: { ...item.paidAmount },
    entity: item.entity ? { ...item.entity } : null,
    order: item.order ? { ...item.order } : null,
    shipment: item.shipment ? { ...item.shipment } : null,
    invoice: item.invoice ? { ...item.invoice } : null,
  }
}

function cloneInvoice(item: FinanceInvoice): FinanceInvoice {
  return {
    ...item,
    amount: { ...item.amount },
    entity: item.entity ? { ...item.entity } : null,
    relatedOrders: item.relatedOrders.map((ref) => ({ ...ref })),
    relatedShipments: item.relatedShipments.map((ref) => ({ ...ref })),
    relatedTransactionIds: [...item.relatedTransactionIds],
  }
}

function isOpenUpcoming(item: UpcomingPayment): boolean {
  return ['unpaid', 'partial', 'pending'].includes(item.status)
}

function remainingOf(item: UpcomingPayment): number {
  return Math.max(0, item.amount.amount - item.paidAmount.amount)
}

function periodStartMs(period: FinanceSummaryPeriod, now = new Date()): number {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  return now.getTime() - days * 24 * 60 * 60 * 1000
}

export class MockFinanceRepository implements FinanceRepository {
  private transactions: FinanceTransaction[] = seedTransactions.map(cloneTx)
  private upcoming: UpcomingPayment[] = seedUpcoming.map(cloneUpcoming)
  private invoices: FinanceInvoice[] = seedInvoices.map(cloneInvoice)

  async getSummary(period: FinanceSummaryPeriod = '30d'): Promise<FinanceSummary> {
    await delay(60)
    const dueItems = this.upcoming.filter(isOpenUpcoming)
    const remainingDebtTry = dueItems.reduce((sum, item) => sum + remainingOf(item), 0)
    const paidTotalTry = this.transactions
      .filter((item) => item.status === 'paid' && item.direction === 'debit')
      .reduce((sum, item) => sum + item.amount.amount, 0)

    const start = periodStartMs(period)
    const periodDebits = this.transactions.filter(
      (item) =>
        item.direction === 'debit' &&
        item.status !== 'failed' &&
        (item.shipment != null || item.order != null) &&
        new Date(item.occurredAt).getTime() >= start
    )
    const logisticsSpendTry = periodDebits.reduce((sum, item) => sum + item.amount.amount, 0)
    const estimatedSavingsTry = Math.round(logisticsSpendTry * SAVINGS_RATE)

    const walletBalanceTry = await walletRepository.getBalanceTry()

    return {
      period,
      orderCount: PERIOD_ORDER_COUNTS[period],
      logisticsSpendTry,
      estimatedSavingsTry,
      pendingPaymentTry: remainingDebtTry,
      pendingPaymentCount: dueItems.length,
      walletBalanceTry,
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
      if (query.settlement && item.settlement !== query.settlement) return false
      if (query.invoiceId && item.invoice?.id !== query.invoiceId) return false
      return matchesSearch(
        `${item.description} ${item.narrative} ${item.entity?.label ?? ''} ${item.order?.label ?? ''} ${item.shipment?.label ?? ''} ${item.invoice?.label ?? ''} ${item.id}`,
        query.search
      )
    })
    return { items: items.map(cloneTx), total: items.length }
  }

  async getTransactionById(id: string): Promise<FinanceTransaction | null> {
    await delay(40)
    const item = this.transactions.find((row) => row.id === id)
    return item ? cloneTx(item) : null
  }

  async listUpcoming(query: FinanceListQuery = {}): Promise<UpcomingPaymentsResult> {
    await delay(70)
    const items = this.upcoming.filter((item) => {
      if (query.status && item.status !== query.status) return false
      if (query.settlement && item.settlement !== query.settlement) return false
      return matchesSearch(
        `${item.description} ${item.narrative} ${item.invoiceNumber ?? ''} ${item.entity?.label ?? ''} ${item.id}`,
        query.search
      )
    })
    const dueCount = this.upcoming.filter(isOpenUpcoming).length
    return { items: items.map(cloneUpcoming), total: items.length, dueCount }
  }

  async getUpcomingById(id: string): Promise<UpcomingPayment | null> {
    await delay(40)
    const item = this.upcoming.find((row) => row.id === id)
    return item ? cloneUpcoming(item) : null
  }

  async countUpcomingDue(): Promise<number> {
    await delay(40)
    return this.upcoming.filter(isOpenUpcoming).length
  }

  async listInvoices(query: FinanceListQuery = {}): Promise<FinanceInvoicesResult> {
    await delay(70)
    const items = this.invoices.filter((item) => {
      if (query.invoiceStatus && item.status !== query.invoiceStatus) return false
      if (query.invoiceKind && item.kind !== query.invoiceKind) return false
      if (query.settlement && item.settlement !== query.settlement) return false
      return matchesSearch(
        `${item.number} ${item.relatedShipments.map((s) => s.label).join(' ')} ${item.relatedOrders.map((o) => o.label).join(' ')} ${item.id}`,
        query.search
      )
    })
    return { items: items.map(cloneInvoice), total: items.length }
  }

  async getInvoiceById(id: string): Promise<FinanceInvoice | null> {
    await delay(40)
    const item = this.invoices.find((row) => row.id === id)
    return item ? cloneInvoice(item) : null
  }

  async payUpcoming(id: string, channel: FinanceSettlementChannel): Promise<PayUpcomingResult> {
    await delay(90)
    const upcoming = this.upcoming.find((item) => item.id === id)
    if (!upcoming) throw new Error('Yaklaşan ödeme bulunamadı')
    if (!isOpenUpcoming(upcoming)) throw new Error('Bu fatura zaten ödenmiş')

    const remaining = remainingOf(upcoming)
    if (remaining <= 0) throw new Error('Ödenecek bakiye yok')

    if (channel === 'wallet') {
      await walletRepository.charge({
        amountTry: remaining,
        description: `Fatura ödemesi · ${upcoming.invoiceNumber ?? upcoming.id}`,
        relatedPaymentId: upcoming.id,
      })
    }

    const now = new Date().toISOString()
    upcoming.paidAmount = moneyTry(upcoming.amount.amount)
    upcoming.status = 'paid'
    upcoming.settlement = channel
    upcoming.method = channel === 'wallet' ? 'wallet' : 'transfer'
    upcoming.narrative = `${upcoming.invoiceNumber ?? 'Fatura'} için ${remaining.toLocaleString('tr-TR')} ₺ ${
      channel === 'wallet' ? 'cüzdanından çekildi' : 'cari hesapta ödendi olarak işaretlendi'
    }.`

    if (upcoming.invoice?.id) {
      const invoice = this.invoices.find((item) => item.id === upcoming.invoice?.id)
      if (invoice) {
        invoice.status = 'paid'
        invoice.settlement = channel
      }
    }

    const linkedTx = this.transactions.find(
      (item) => item.invoice?.id === upcoming.invoice?.id && item.status === 'pending'
    )
    if (linkedTx) {
      linkedTx.status = 'paid'
      linkedTx.settlement = channel
      linkedTx.method = channel === 'wallet' ? 'wallet' : 'transfer'
      linkedTx.remainingBalance = moneyTry(0)
    }

    const transaction: FinanceTransaction = {
      id: `ftx-pay-${Date.now()}`,
      occurredAt: now,
      description: `Fatura tahsilatı · ${upcoming.invoiceNumber ?? upcoming.id}`,
      narrative:
        channel === 'wallet'
          ? `${upcoming.invoiceNumber ?? 'Fatura'} için ${moneyTry(remaining).amount.toLocaleString('tr-TR')} ₺ cüzdanından çekildi.`
          : `${upcoming.invoiceNumber ?? 'Fatura'} cari hesapta ödendi olarak işaretlendi.`,
      amount: moneyTry(remaining),
      direction: 'debit',
      status: 'paid',
      method: channel === 'wallet' ? 'wallet' : 'transfer',
      settlement: channel,
      entity: upcoming.invoice,
      order: upcoming.order,
      shipment: upcoming.shipment,
      invoice: upcoming.invoice,
      invoiceKind: upcoming.invoiceKind,
      quote: null,
      remainingBalance: moneyTry(0),
    }
    transaction.narrative = debitNarrative({
      shipmentLabel: upcoming.shipment?.label,
      orderLabel: upcoming.order?.label,
      amountTry: remaining,
      invoiceLabel: upcoming.invoiceNumber,
      invoiceKind: upcoming.invoiceKind,
      settlement: channel,
    })

    this.transactions = [transaction, ...this.transactions]
    if (upcoming.invoice?.id) {
      const invoice = this.invoices.find((item) => item.id === upcoming.invoice?.id)
      invoice?.relatedTransactionIds.unshift(transaction.id)
    }

    return {
      upcoming: cloneUpcoming(upcoming),
      transaction: cloneTx(transaction),
    }
  }

  async recordWalletTopUp(input: {
    amountTry: number
    method: 'card' | 'transfer'
    note?: string
  }): Promise<FinanceTransaction> {
    await delay(40)
    const transaction: FinanceTransaction = {
      id: `ftx-topup-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      description: input.note?.trim() || 'Cüzdan yükleme',
      narrative: creditTopUpNarrative(input.amountTry, input.method),
      amount: moneyTry(input.amountTry),
      direction: 'credit',
      status: 'paid',
      method: input.method,
      settlement: 'wallet',
      entity: { type: 'wallet', id: 'wal-001', label: 'Cüzdan' },
      order: null,
      shipment: null,
      invoice: null,
      invoiceKind: null,
      quote: null,
      remainingBalance: null,
    }
    this.transactions = [transaction, ...this.transactions]
    return cloneTx(transaction)
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const financeRepository: FinanceRepository = new MockFinanceRepository()
