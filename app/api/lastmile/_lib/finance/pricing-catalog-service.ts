import {
  buildSeedAssignments,
  buildSeedCollections,
  buildSeedOrderPayments,
  buildSeedOrderSnapshots,
  buildSeedPaymentTerms,
  buildSeedPriceLists,
  buildSeedZones,
} from '../../../../(arf)/(workspaces)/lastmile/finance/_data/seed'
import { quotePrice } from '../../../../(arf)/(workspaces)/lastmile/finance/_lib/price-quote-engine'
import { addDaysIso, createId, nowIso, todayIso } from '../../../../(arf)/(workspaces)/lastmile/finance/_lib/format'
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
  QuantityBasis,
  QuoteInput,
  QuoteResult,
  SettlementType,
} from '../../../../(arf)/(workspaces)/lastmile/finance/_types'
import {
  pricingModeFromDistanceStructure,
  slugCodeFromName,
} from '../../../../(arf)/(workspaces)/lastmile/finance/_types'
import { readTenantJson, writeTenantJson } from './fs-json-store'
import { deriveCollectionStatus } from './order-pricing-service'

const FILES = {
  priceLists: 'price-lists.json',
  zones: 'zones.json',
  assignments: 'assignments.json',
  paymentTerms: 'payment-terms.json',
  collections: 'collections.json',
  orderPayments: 'order-payments.json',
  orderSnapshots: 'order-snapshots.json',
  seeded: 'seeded.json',
} as const

async function ensureSeed(tenantId: string) {
  const seeded = await readTenantJson<boolean>(tenantId, FILES.seeded, false)
  if (seeded) return

  const writeIfEmpty = async <T,>(
    file: string,
    current: T,
    isEmpty: (v: T) => boolean,
    factory: () => T
  ) => {
    if (!isEmpty(current)) return
    await writeTenantJson(tenantId, file, factory())
  }

  await writeIfEmpty(
    FILES.priceLists,
    await readTenantJson<PriceList[]>(tenantId, FILES.priceLists, []),
    (v) => v.length === 0,
    buildSeedPriceLists
  )
  await writeIfEmpty(
    FILES.zones,
    await readTenantJson<PriceZone[]>(tenantId, FILES.zones, []),
    (v) => v.length === 0,
    buildSeedZones
  )
  await writeIfEmpty(
    FILES.assignments,
    await readTenantJson<CustomerPricingAssignment[]>(tenantId, FILES.assignments, []),
    (v) => v.length === 0,
    buildSeedAssignments
  )
  await writeIfEmpty(
    FILES.paymentTerms,
    await readTenantJson<CustomerPaymentTerms[]>(tenantId, FILES.paymentTerms, []),
    (v) => v.length === 0,
    buildSeedPaymentTerms
  )
  await writeIfEmpty(
    FILES.collections,
    await readTenantJson<CollectionEntry[]>(tenantId, FILES.collections, []),
    (v) => v.length === 0,
    buildSeedCollections
  )
  await writeIfEmpty(
    FILES.orderPayments,
    await readTenantJson<OrderPayment[]>(tenantId, FILES.orderPayments, []),
    (v) => v.length === 0,
    buildSeedOrderPayments
  )
  await writeIfEmpty(
    FILES.orderSnapshots,
    await readTenantJson<Record<string, OrderPricingSnapshot>>(tenantId, FILES.orderSnapshots, {}),
    (v) => Object.keys(v).length === 0,
    buildSeedOrderSnapshots
  )
  await writeTenantJson(tenantId, FILES.seeded, true)
}

async function getPriceLists(tenantId: string): Promise<PriceList[]> {
  await ensureSeed(tenantId)
  const lists = await readTenantJson<PriceList[]>(tenantId, FILES.priceLists, [])
  return lists.map(
    (list): PriceList => ({
      ...list,
      quantityBasis: list.quantityBasis ?? 'desi',
      packages: list.packages ?? [],
    })
  )
}

async function savePriceLists(tenantId: string, lists: PriceList[]) {
  await writeTenantJson(tenantId, FILES.priceLists, lists)
}

async function getZones(tenantId: string) {
  await ensureSeed(tenantId)
  return readTenantJson<PriceZone[]>(tenantId, FILES.zones, [])
}

async function saveZones(tenantId: string, zones: PriceZone[]) {
  await writeTenantJson(tenantId, FILES.zones, zones)
}

async function getAssignments(tenantId: string) {
  await ensureSeed(tenantId)
  return readTenantJson<CustomerPricingAssignment[]>(tenantId, FILES.assignments, [])
}

async function saveAssignments(tenantId: string, rows: CustomerPricingAssignment[]) {
  await writeTenantJson(tenantId, FILES.assignments, rows)
}

async function getPaymentTerms(tenantId: string) {
  await ensureSeed(tenantId)
  return readTenantJson<CustomerPaymentTerms[]>(tenantId, FILES.paymentTerms, [])
}

async function savePaymentTerms(tenantId: string, rows: CustomerPaymentTerms[]) {
  await writeTenantJson(tenantId, FILES.paymentTerms, rows)
}

async function getCollections(tenantId: string) {
  await ensureSeed(tenantId)
  return readTenantJson<CollectionEntry[]>(tenantId, FILES.collections, [])
}

async function saveCollections(tenantId: string, rows: CollectionEntry[]) {
  await writeTenantJson(tenantId, FILES.collections, rows)
}

async function getOrderPayments(tenantId: string) {
  await ensureSeed(tenantId)
  return readTenantJson<OrderPayment[]>(tenantId, FILES.orderPayments, [])
}

async function saveOrderPayments(tenantId: string, rows: OrderPayment[]) {
  await writeTenantJson(tenantId, FILES.orderPayments, rows)
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
    priority: r.priority ?? 100 - index,
    desiPricing: r.desiPricing ?? 'fixed',
    desiStart: r.desiStart ?? 0,
    desiEnd: r.desiEnd ?? 99,
    packageStart: r.packageStart,
    packageEnd: r.packageEnd,
    perPackage: r.perPackage,
  }))
}

export type UpsertPriceListInput = {
  name: string
  code?: string
  description?: string
  isDefault?: boolean
  status?: PriceListStatus
  distanceStructure: DistanceStructure
  quantityBasis?: QuantityBasis
  packages?: PriceList['packages']
  returnFeePercent?: number
  returnFeeMin?: number
  validFrom?: string
  validTo?: string
  rules?: PriceRule[]
}

export type UpsertZoneInput = {
  name: string
  code?: string
  scopes: PriceZone['scopes']
}

export async function listPriceLists(tenantId: string) {
  return [...(await getPriceLists(tenantId))].sort((a, b) => a.name.localeCompare(b.name, 'tr'))
}

export async function getPriceList(tenantId: string, id: string) {
  return (await getPriceLists(tenantId)).find((p) => p.id === id)
}

export async function createPriceList(tenantId: string, input: UpsertPriceListInput) {
  const lists = await getPriceLists(tenantId)
  const id = createId('pl')
  const stamp = nowIso()
  const name = input.name.trim()
  const list: PriceList = {
    id,
    code: input.code?.trim() || slugCodeFromName(name),
    name,
    description: input.description?.trim(),
    isDefault: Boolean(input.isDefault),
    status: input.status ?? 'active',
    currency: 'TRY',
    distanceStructure: input.distanceStructure,
    quantityBasis: input.quantityBasis ?? 'desi',
    packages: input.packages ?? [],
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
  if (list.isDefault) next = next.map((p) => (p.id === id ? p : { ...p, isDefault: false }))
  await savePriceLists(tenantId, next)
  return list
}

export async function updatePriceList(tenantId: string, id: string, input: UpsertPriceListInput) {
  const lists = await getPriceLists(tenantId)
  const idx = lists.findIndex((p) => p.id === id)
  if (idx < 0) return undefined
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
    quantityBasis: input.quantityBasis ?? prev.quantityBasis ?? 'desi',
    packages: input.packages ?? prev.packages ?? [],
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
  if (updated.isDefault) next = next.map((p) => (p.id === id ? p : { ...p, isDefault: false }))
  await savePriceLists(tenantId, next)
  return updated
}

export async function clonePriceList(tenantId: string, id: string) {
  const source = (await getPriceLists(tenantId)).find((p) => p.id === id)
  if (!source) return undefined
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
    rules: source.rules.map((r) => ({ ...r, id: createId('rule'), priceListId: newId })),
  }
  await savePriceLists(tenantId, [clone, ...(await getPriceLists(tenantId))])
  return clone
}

export async function setDefaultPriceList(tenantId: string, id: string) {
  const lists = await getPriceLists(tenantId)
  if (!lists.some((p) => p.id === id)) return undefined
  const next = lists.map((p) => ({
    ...p,
    isDefault: p.id === id,
    status: p.id === id ? ('active' as const) : p.status,
    updatedAt: p.id === id ? nowIso() : p.updatedAt,
  }))
  await savePriceLists(tenantId, next)
  return next.find((p) => p.id === id)
}

export async function setPriceListStatus(tenantId: string, id: string, status: PriceListStatus) {
  const lists = await getPriceLists(tenantId)
  const idx = lists.findIndex((p) => p.id === id)
  if (idx < 0) return undefined
  const updated = { ...lists[idx], status, updatedAt: nowIso() }
  const next = [...lists]
  next[idx] = updated
  await savePriceLists(tenantId, next)
  return updated
}

export async function listPriceZones(tenantId: string) {
  return [...(await getZones(tenantId))].sort((a, b) => a.name.localeCompare(b.name, 'tr'))
}

export async function getPriceZone(tenantId: string, id: string) {
  return (await getZones(tenantId)).find((z) => z.id === id)
}

export async function createPriceZone(tenantId: string, input: UpsertZoneInput) {
  const stamp = nowIso()
  const zone: PriceZone = {
    id: createId('zone'),
    name: input.name.trim(),
    code: input.code?.trim(),
    scopes: input.scopes,
    createdAt: stamp,
    updatedAt: stamp,
  }
  await saveZones(tenantId, [zone, ...(await getZones(tenantId))])
  return zone
}

export async function updatePriceZone(tenantId: string, id: string, input: UpsertZoneInput) {
  const zones = await getZones(tenantId)
  const idx = zones.findIndex((z) => z.id === id)
  if (idx < 0) return undefined
  const updated: PriceZone = {
    ...zones[idx],
    name: input.name.trim(),
    code: input.code?.trim(),
    scopes: input.scopes,
    updatedAt: nowIso(),
  }
  const next = [...zones]
  next[idx] = updated
  await saveZones(tenantId, next)
  return updated
}

export async function deletePriceZone(tenantId: string, id: string) {
  const zones = await getZones(tenantId)
  const next = zones.filter((z) => z.id !== id)
  if (next.length === zones.length) return false
  await saveZones(tenantId, next)
  return true
}

export async function quotePriceForTenant(tenantId: string, input: QuoteInput): Promise<QuoteResult> {
  const priceLists = await getPriceLists(tenantId)
  const zones = await getZones(tenantId)
  const assignmentRows = await getAssignments(tenantId)
  const assignments: Record<string, string> = {}
  for (const row of assignmentRows) {
    assignments[row.customerId] = row.priceListId
  }
  return quotePrice({ priceLists, zones, assignments }, input)
}

export async function getCustomerPricingAssignment(tenantId: string, customerId: string) {
  return (await getAssignments(tenantId)).find((a) => a.customerId === customerId)
}

export async function setCustomerPricingAssignment(
  tenantId: string,
  customerId: string,
  priceListId: string | null
) {
  const lists = await getPriceLists(tenantId)
  const rows = await getAssignments(tenantId)
  const filtered = rows.filter((a) => a.customerId !== customerId)
  if (!priceListId) {
    await saveAssignments(tenantId, filtered)
    return null
  }
  const list = lists.find((l) => l.id === priceListId)
  if (!list) throw new Error('PRICE_LIST_NOT_FOUND')
  const row: CustomerPricingAssignment = {
    customerId,
    priceListId,
    updatedAt: nowIso(),
  }
  await saveAssignments(tenantId, [row, ...filtered])
  return row
}

export async function getCustomerPaymentTerms(tenantId: string, customerId: string) {
  return (await getPaymentTerms(tenantId)).find((t) => t.customerId === customerId)
}

export async function setCustomerPaymentTerms(
  tenantId: string,
  customerId: string,
  input: Omit<CustomerPaymentTerms, 'customerId' | 'updatedAt'>
) {
  const row: CustomerPaymentTerms = {
    ...input,
    customerId,
    updatedAt: nowIso(),
  }
  const next = [row, ...(await getPaymentTerms(tenantId)).filter((t) => t.customerId !== customerId)]
  await savePaymentTerms(tenantId, next)
  return row
}

export async function getCustomerFinanceSummary(
  tenantId: string,
  customerId: string
): Promise<CustomerFinanceSummary> {
  const payments = (await getOrderPayments(tenantId))
    .filter((p) => p.customerId === customerId)
    .map((p) => ({ ...p, collectionStatus: deriveCollectionStatus(p) }))
  const collections = (await getCollections(tenantId)).filter((c) => c.customerId === customerId)
  const openBalance = payments.reduce(
    (sum, p) => sum + Math.max(0, p.amountDue - p.amountPaid),
    0
  )
  const totalCollected = collections.reduce((sum, c) => sum + c.amount, 0)
  const overdueOrderCount = payments.filter((p) => p.collectionStatus === 'gecikti').length
  const lastCollectionAt = collections.map((c) => c.paidAt).sort().at(-1)
  const assignment = await getCustomerPricingAssignment(tenantId, customerId)
  const list = assignment
    ? (await getPriceLists(tenantId)).find((l) => l.id === assignment.priceListId)
    : undefined
  const terms = await getCustomerPaymentTerms(tenantId, customerId)
  return {
    customerId,
    openBalance,
    totalCollected,
    overdueOrderCount,
    lastCollectionAt,
    assignedPriceListId: assignment?.priceListId,
    assignedPriceListName: list?.name,
    paymentTerms: terms,
  }
}

export async function listCollections(
  tenantId: string,
  filters?: { customerId?: string; status?: CollectionStatus; from?: string; to?: string }
) {
  let entries = await getCollections(tenantId)
  let payments = (await getOrderPayments(tenantId)).map((p) => ({
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
  if (filters?.from) {
    entries = entries.filter((e) => e.paidAt >= filters.from!)
  }
  if (filters?.to) {
    entries = entries.filter((e) => e.paidAt <= filters.to!)
  }
  return {
    entries: [...entries].sort((a, b) => b.paidAt.localeCompare(a.paidAt)),
    payments: [...payments].sort((a, b) => (b.dueDate ?? '').localeCompare(a.dueDate ?? '')),
  }
}

export async function createCollection(
  tenantId: string,
  input: {
    customerId: string
    customerName?: string
    orderId?: string
    amount: number
    method: CollectionEntry['method']
    paidAt: string
    note?: string
  }
) {
  const entry: CollectionEntry = {
    id: createId('col'),
    customerId: input.customerId,
    customerName: input.customerName,
    orderId: input.orderId,
    amount: input.amount,
    method: input.method,
    paidAt: input.paidAt,
    note: input.note,
    createdAt: nowIso(),
  }
  await saveCollections(tenantId, [entry, ...(await getCollections(tenantId))])

  if (input.orderId) {
    const payments = await getOrderPayments(tenantId)
    const idx = payments.findIndex((p) => p.orderId === input.orderId)
    if (idx >= 0) {
      const updated = {
        ...payments[idx],
        amountPaid: payments[idx].amountPaid + input.amount,
        updatedAt: nowIso(),
      }
      updated.collectionStatus = deriveCollectionStatus(updated)
      const next = [...payments]
      next[idx] = updated
      await saveOrderPayments(tenantId, next)
    }
  }

  return entry
}

export { deriveCollectionStatus, addDaysIso, todayIso }
export type { SettlementType, OrderPayment, OrderPricingSnapshot }
