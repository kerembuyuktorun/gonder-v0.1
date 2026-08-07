import {
  buildSeedAssignments,
  buildSeedCollections,
  buildSeedOrderPayments,
  buildSeedOrderSnapshots,
  buildSeedPaymentTerms,
  buildSeedPriceLists,
  buildSeedZones,
} from '../_data/seed'
import { quotePrice, type QuoteEngineContext } from '../_lib/price-quote-engine'
import { addDaysIso, createId, nowIso, todayIso } from '../_lib/format'
import {
  isSeeded,
  markSeeded,
  readJson,
  STORAGE_KEYS,
  writeJson,
} from '../_lib/storage'
import type {
  CollectionEntry,
  CollectionStatus,
  CustomerFinanceSummary,
  CustomerPaymentTerms,
  CustomerPricingAssignment,
  DistanceStructure,
  OrderPayment,
  OrderPricingSnapshot,
  PriceList,
  PriceListStatus,
  PriceRule,
  PriceZone,
  QuoteInput,
  QuoteResult,
  SettlementType,
} from '../_types'
import {
  pricingModeFromDistanceStructure,
  slugCodeFromName,
} from '../_types'

function ensureSeed() {
  if (typeof window === 'undefined') return
  if (isSeeded()) return
  writeJson(STORAGE_KEYS.priceLists, buildSeedPriceLists())
  writeJson(STORAGE_KEYS.zones, buildSeedZones())
  writeJson(STORAGE_KEYS.assignments, buildSeedAssignments())
  writeJson(STORAGE_KEYS.paymentTerms, buildSeedPaymentTerms())
  writeJson(STORAGE_KEYS.collections, buildSeedCollections())
  writeJson(STORAGE_KEYS.orderPayments, buildSeedOrderPayments())
  writeJson(STORAGE_KEYS.orderSnapshots, buildSeedOrderSnapshots())
  markSeeded()
}

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function getPriceLists(): PriceList[] {
  ensureSeed()
  return readJson<PriceList[]>(STORAGE_KEYS.priceLists, [])
}

function savePriceLists(lists: PriceList[]) {
  writeJson(STORAGE_KEYS.priceLists, lists)
}

function getZones(): PriceZone[] {
  ensureSeed()
  return readJson<PriceZone[]>(STORAGE_KEYS.zones, [])
}

function saveZones(zones: PriceZone[]) {
  writeJson(STORAGE_KEYS.zones, zones)
}

function getAssignments(): CustomerPricingAssignment[] {
  ensureSeed()
  return readJson<CustomerPricingAssignment[]>(STORAGE_KEYS.assignments, [])
}

function saveAssignments(rows: CustomerPricingAssignment[]) {
  writeJson(STORAGE_KEYS.assignments, rows)
}

function getPaymentTerms(): CustomerPaymentTerms[] {
  ensureSeed()
  return readJson<CustomerPaymentTerms[]>(STORAGE_KEYS.paymentTerms, [])
}

function savePaymentTerms(rows: CustomerPaymentTerms[]) {
  writeJson(STORAGE_KEYS.paymentTerms, rows)
}

function getCollections(): CollectionEntry[] {
  ensureSeed()
  return readJson<CollectionEntry[]>(STORAGE_KEYS.collections, [])
}

function saveCollections(rows: CollectionEntry[]) {
  writeJson(STORAGE_KEYS.collections, rows)
}

function getOrderPayments(): OrderPayment[] {
  ensureSeed()
  return readJson<OrderPayment[]>(STORAGE_KEYS.orderPayments, [])
}

function saveOrderPayments(rows: OrderPayment[]) {
  writeJson(STORAGE_KEYS.orderPayments, rows)
}

function getOrderSnapshots(): Record<string, OrderPricingSnapshot> {
  ensureSeed()
  return readJson<Record<string, OrderPricingSnapshot>>(STORAGE_KEYS.orderSnapshots, {})
}

function saveOrderSnapshots(map: Record<string, OrderPricingSnapshot>) {
  writeJson(STORAGE_KEYS.orderSnapshots, map)
}

function buildQuoteCtx(): QuoteEngineContext {
  const assignments = Object.fromEntries(
    getAssignments().map((a) => [a.customerId, a.priceListId])
  )
  return {
    priceLists: getPriceLists(),
    zones: getZones(),
    assignments,
  }
}

function deriveCollectionStatus(payment: OrderPayment): CollectionStatus {
  if (payment.amountPaid >= payment.amountDue && payment.amountDue > 0) return 'tahsil_edildi'
  if (payment.amountPaid > 0 && payment.amountPaid < payment.amountDue) return 'kismi'
  if (payment.dueDate && payment.dueDate < todayIso() && payment.amountPaid < payment.amountDue) {
    return 'gecikti'
  }
  return 'bekliyor'
}

// ─── Price Lists ───────────────────────────────────────────

export async function listPriceLists(): Promise<PriceList[]> {
  return delay([...getPriceLists()].sort((a, b) => a.name.localeCompare(b.name, 'tr')))
}

export async function getPriceList(id: string): Promise<PriceList | undefined> {
  return delay(getPriceLists().find((p) => p.id === id))
}

export type UpsertPriceListInput = {
  name: string
  code?: string
  description?: string
  isDefault?: boolean
  status?: PriceListStatus
  distanceStructure: DistanceStructure
  returnFeePercent?: number
  returnFeeMin?: number
  validFrom?: string
  validTo?: string
  rules?: PriceRule[]
}

function normalizeRules(
  priceListId: string,
  structure: DistanceStructure,
  rules: PriceRule[]
): PriceRule[] {
  const mode = pricingModeFromDistanceStructure(structure)
  return rules.map((r, index) => ({
    ...r,
    priceListId,
    pricingMode: mode,
    priority: r.priority ?? (100 - index),
    desiPricing: r.desiPricing ?? 'fixed',
    desiStart: r.desiStart ?? 0,
    desiEnd: r.desiEnd ?? 99,
  }))
}

export async function createPriceList(input: UpsertPriceListInput): Promise<PriceList> {
  const lists = getPriceLists()
  const id = createId('pl')
  const stamp = nowIso()
  const name = input.name.trim()
  const list: PriceList = {
    id,
    code: (input.code?.trim() || slugCodeFromName(name)),
    name,
    description: input.description?.trim(),
    isDefault: Boolean(input.isDefault),
    status: input.status ?? 'active',
    currency: 'TRY',
    distanceStructure: input.distanceStructure,
    returnFeePercent: input.returnFeePercent ?? 50,
    returnFeeMin: input.returnFeeMin,
    validFrom: input.validFrom,
    validTo: input.validTo,
    createdAt: stamp,
    updatedAt: stamp,
    createdBy: 'kullanici',
    rules: normalizeRules(id, input.distanceStructure, input.rules ?? []),
  }
  let next = [list, ...lists]
  if (list.isDefault) {
    next = next.map((p) => (p.id === id ? p : { ...p, isDefault: false }))
  }
  savePriceLists(next)
  return delay(list)
}

export async function updatePriceList(
  id: string,
  input: UpsertPriceListInput
): Promise<PriceList | undefined> {
  const lists = getPriceLists()
  const idx = lists.findIndex((p) => p.id === id)
  if (idx < 0) return delay(undefined)
  const prev = lists[idx]
  const name = input.name.trim()
  const updated: PriceList = {
    ...prev,
    code: input.code?.trim() || prev.code || slugCodeFromName(name),
    name,
    description: input.description?.trim(),
    isDefault: input.isDefault ?? prev.isDefault,
    status: input.status ?? prev.status,
    distanceStructure: input.distanceStructure,
    returnFeePercent: input.returnFeePercent ?? prev.returnFeePercent ?? 50,
    returnFeeMin: input.returnFeeMin !== undefined ? input.returnFeeMin : prev.returnFeeMin,
    validFrom: input.validFrom,
    validTo: input.validTo,
    updatedAt: nowIso(),
    rules: input.rules
      ? normalizeRules(id, input.distanceStructure, input.rules)
      : prev.rules,
  }
  let next = [...lists]
  next[idx] = updated
  if (updated.isDefault) {
    next = next.map((p) => (p.id === id ? p : { ...p, isDefault: false }))
  }
  savePriceLists(next)
  return delay(updated)
}

export async function clonePriceList(id: string): Promise<PriceList | undefined> {
  const source = getPriceLists().find((p) => p.id === id)
  if (!source) return delay(undefined)
  const newId = createId('pl')
  const stamp = nowIso()
  const clone: PriceList = {
    ...source,
    id: newId,
    code: `${source.code}-KOPYA`,
    name: `${source.name} (Kopya)`,
    isDefault: false,
    createdAt: stamp,
    updatedAt: stamp,
    rules: source.rules.map((r) => ({
      ...r,
      id: createId('rule'),
      priceListId: newId,
    })),
  }
  savePriceLists([clone, ...getPriceLists()])
  return delay(clone)
}

export async function setDefaultPriceList(id: string): Promise<PriceList | undefined> {
  const lists = getPriceLists()
  if (!lists.some((p) => p.id === id)) return delay(undefined)
  const next = lists.map((p) => ({
    ...p,
    isDefault: p.id === id,
    status: p.id === id ? ('active' as const) : p.status,
    updatedAt: p.id === id ? nowIso() : p.updatedAt,
  }))
  savePriceLists(next)
  return delay(next.find((p) => p.id === id))
}

export async function setPriceListStatus(
  id: string,
  status: PriceListStatus
): Promise<PriceList | undefined> {
  const lists = getPriceLists()
  const idx = lists.findIndex((p) => p.id === id)
  if (idx < 0) return delay(undefined)
  const updated = { ...lists[idx], status, updatedAt: nowIso() }
  const next = [...lists]
  next[idx] = updated
  savePriceLists(next)
  return delay(updated)
}

// ─── Zones ─────────────────────────────────────────────────

export async function listPriceZones(): Promise<PriceZone[]> {
  return delay([...getZones()].sort((a, b) => a.name.localeCompare(b.name, 'tr')))
}

export async function getPriceZone(id: string): Promise<PriceZone | undefined> {
  return delay(getZones().find((z) => z.id === id))
}

export type UpsertZoneInput = {
  name: string
  code?: string
  scopes: PriceZone['scopes']
}

export async function createPriceZone(input: UpsertZoneInput): Promise<PriceZone> {
  const stamp = nowIso()
  const zone: PriceZone = {
    id: createId('zone'),
    name: input.name.trim(),
    code: input.code?.trim(),
    scopes: input.scopes,
    createdAt: stamp,
    updatedAt: stamp,
  }
  saveZones([zone, ...getZones()])
  return delay(zone)
}

export async function updatePriceZone(
  id: string,
  input: UpsertZoneInput
): Promise<PriceZone | undefined> {
  const zones = getZones()
  const idx = zones.findIndex((z) => z.id === id)
  if (idx < 0) return delay(undefined)
  const updated: PriceZone = {
    ...zones[idx],
    name: input.name.trim(),
    code: input.code?.trim(),
    scopes: input.scopes,
    updatedAt: nowIso(),
  }
  const next = [...zones]
  next[idx] = updated
  saveZones(next)
  return delay(updated)
}

export async function deletePriceZone(id: string): Promise<boolean> {
  const zones = getZones()
  const next = zones.filter((z) => z.id !== id)
  if (next.length === zones.length) return delay(false)
  saveZones(next)
  // Clear zone refs on rules
  const lists = getPriceLists().map((list) => ({
    ...list,
    rules: list.rules.map((r) =>
      r.zoneId === id ? { ...r, zoneId: undefined, status: 'passive' as const } : r
    ),
  }))
  savePriceLists(lists)
  return delay(true)
}

// ─── Customer finance ──────────────────────────────────────

export async function getCustomerPricingAssignment(
  customerId: string
): Promise<CustomerPricingAssignment | undefined> {
  return delay(getAssignments().find((a) => a.customerId === customerId))
}

export async function setCustomerPricingAssignment(
  customerId: string,
  priceListId: string | null
): Promise<CustomerPricingAssignment | undefined> {
  let rows = getAssignments().filter((a) => a.customerId !== customerId)
  if (!priceListId) {
    saveAssignments(rows)
    return delay(undefined)
  }
  const row: CustomerPricingAssignment = {
    customerId,
    priceListId,
    updatedAt: nowIso(),
  }
  rows = [row, ...rows]
  saveAssignments(rows)
  return delay(row)
}

export async function listCustomerPricingAssignments(): Promise<CustomerPricingAssignment[]> {
  return delay(getAssignments())
}

export async function getCustomerPaymentTerms(
  customerId: string
): Promise<CustomerPaymentTerms | undefined> {
  return delay(getPaymentTerms().find((t) => t.customerId === customerId))
}

export async function setCustomerPaymentTerms(
  customerId: string,
  input: {
    settlementType: SettlementType
    creditDays: number
    billingCycle?: CustomerPaymentTerms['billingCycle']
    notes?: string
  }
): Promise<CustomerPaymentTerms> {
  const row: CustomerPaymentTerms = {
    customerId,
    settlementType: input.settlementType,
    creditDays: input.settlementType === 'pesin' ? 0 : Math.max(0, input.creditDays),
    billingCycle: input.billingCycle ?? 'per_order',
    notes: input.notes,
    updatedAt: nowIso(),
  }
  const rows = [row, ...getPaymentTerms().filter((t) => t.customerId !== customerId)]
  savePaymentTerms(rows)
  return delay(row)
}

export async function getCustomerFinanceSummary(
  customerId: string
): Promise<CustomerFinanceSummary> {
  const payments = getOrderPayments().filter((p) => p.customerId === customerId)
  const collections = getCollections().filter((c) => c.customerId === customerId)
  const assignment = getAssignments().find((a) => a.customerId === customerId)
  const list = assignment
    ? getPriceLists().find((p) => p.id === assignment.priceListId)
    : undefined
  const terms = getPaymentTerms().find((t) => t.customerId === customerId)

  const openBalance = payments.reduce(
    (sum, p) => sum + Math.max(0, p.amountDue - p.amountPaid),
    0
  )
  const totalCollected = collections.reduce((sum, c) => sum + c.amount, 0)
  const overdueOrderCount = payments.filter(
    (p) => deriveCollectionStatus(p) === 'gecikti'
  ).length
  const lastCollectionAt = collections
    .map((c) => c.paidAt)
    .sort()
    .at(-1)

  return delay({
    customerId,
    openBalance,
    totalCollected,
    overdueOrderCount,
    lastCollectionAt,
    assignedPriceListId: assignment?.priceListId,
    assignedPriceListName: list?.name,
    paymentTerms: terms,
  })
}

// ─── Quote ─────────────────────────────────────────────────

export async function quotePriceApi(input: QuoteInput): Promise<QuoteResult> {
  return delay(quotePrice(buildQuoteCtx(), input))
}

// ─── Order pricing (local side-store) ───────────────────────

export async function getOrderPricing(orderId: string): Promise<{
  snapshot?: OrderPricingSnapshot
  payment?: OrderPayment
} | undefined> {
  const snapshot = getOrderSnapshots()[orderId]
  const payment = getOrderPayments().find((p) => p.orderId === orderId)
  if (!snapshot && !payment) return delay(undefined)
  return delay({ snapshot, payment })
}

export async function saveOrderPricing(
  orderId: string,
  payload: {
    snapshot: OrderPricingSnapshot
    payment: Omit<OrderPayment, 'orderId' | 'updatedAt' | 'collectionStatus'> & {
      collectionStatus?: CollectionStatus
    }
  }
): Promise<{ snapshot: OrderPricingSnapshot; payment: OrderPayment }> {
  const snapshots = getOrderSnapshots()
  snapshots[orderId] = payload.snapshot
  saveOrderSnapshots(snapshots)

  const payment: OrderPayment = {
    ...payload.payment,
    orderId,
    updatedAt: nowIso(),
    collectionStatus:
      payload.payment.collectionStatus ??
      deriveCollectionStatus({
        ...payload.payment,
        orderId,
        updatedAt: nowIso(),
        collectionStatus: 'bekliyor',
      }),
  }
  payment.collectionStatus = deriveCollectionStatus(payment)

  const payments = [payment, ...getOrderPayments().filter((p) => p.orderId !== orderId)]
  saveOrderPayments(payments)
  return delay({ snapshot: payload.snapshot, payment })
}

export function buildOrderPaymentFromQuote(params: {
  orderId: string
  customerId: string
  customerName?: string
  settlementType: SettlementType
  creditDays: number
  orderDate: string
  amountDue: number
}): OrderPayment {
  const dueDate =
    params.settlementType === 'vadeli'
      ? addDaysIso(params.orderDate, params.creditDays)
      : params.orderDate
  const payment: OrderPayment = {
    orderId: params.orderId,
    customerId: params.customerId,
    customerName: params.customerName,
    settlementType: params.settlementType,
    creditDays: params.creditDays,
    dueDate,
    collectionStatus: 'bekliyor',
    amountDue: params.amountDue,
    amountPaid: 0,
    orderDate: params.orderDate,
    updatedAt: nowIso(),
  }
  payment.collectionStatus = deriveCollectionStatus(payment)
  return payment
}

// ─── Collections ───────────────────────────────────────────

export async function listCollections(filters?: {
  customerId?: string
  status?: CollectionStatus
}): Promise<{
  entries: CollectionEntry[]
  payments: OrderPayment[]
}> {
  let entries = getCollections()
  let payments = getOrderPayments().map((p) => ({
    ...p,
    collectionStatus: deriveCollectionStatus(p),
  }))

  if (filters?.customerId) {
    entries = entries.filter((e) => e.customerId === filters.customerId)
    payments = payments.filter((p) => p.customerId === filters.customerId)
  }
  if (filters?.status) {
    payments = payments.filter((p) => p.collectionStatus === filters.status)
  }

  return delay({
    entries: [...entries].sort((a, b) => b.paidAt.localeCompare(a.paidAt)),
    payments: [...payments].sort((a, b) => (b.dueDate ?? '').localeCompare(a.dueDate ?? '')),
  })
}

export async function createCollection(input: {
  customerId: string
  customerName?: string
  orderId?: string
  amount: number
  method: CollectionEntry['method']
  paidAt: string
  note?: string
}): Promise<CollectionEntry> {
  const entry: CollectionEntry = {
    id: createId('col'),
    customerId: input.customerId,
    customerName: input.customerName,
    orderId: input.orderId,
    amount: input.amount,
    method: input.method,
    paidAt: input.paidAt,
    note: input.note,
    createdBy: 'kullanici',
    createdAt: nowIso(),
  }
  saveCollections([entry, ...getCollections()])

  if (input.orderId) {
    const payments = getOrderPayments()
    const idx = payments.findIndex((p) => p.orderId === input.orderId)
    if (idx >= 0) {
      const updated = {
        ...payments[idx],
        amountPaid: payments[idx].amountPaid + input.amount,
        paymentMethod: input.method,
        updatedAt: nowIso(),
      }
      updated.collectionStatus = deriveCollectionStatus(updated)
      const next = [...payments]
      next[idx] = updated
      saveOrderPayments(next)
    }
  }

  return delay(entry)
}

export function getPriceListsKpiSync() {
  ensureSeed()
  const lists = getPriceLists()
  const assignments = getAssignments()
  const active = lists.filter((l) => l.status === 'active')
  const defaultList = lists.find((l) => l.isDefault)
  const ruleCount = lists.reduce((sum, l) => sum + l.rules.length, 0)
  return {
    activeCount: active.length,
    defaultName: defaultList?.name ?? '—',
    ruleCount,
    assignedCustomerCount: assignments.length,
  }
}
