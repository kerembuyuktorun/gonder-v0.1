import {
  buildSeedCourierCostAssignments,
  buildSeedCourierCostLists,
  buildSeedCourierEarnings,
  buildSeedCourierPayoutLedgers,
  buildSeedCourierPayoutTerms,
  buildSeedEmploymentDefaults,
  buildSeedPayoutEntries,
} from '../../../../(arf)/(workspaces)/lastmile/finance/_data/courier-cost-seed'
import {
  quoteCourierCost,
  type CourierCostQuoteContext,
} from '../../../../(arf)/(workspaces)/lastmile/finance/_lib/courier-cost-quote-engine'
import { addDaysIso, createId, nowIso, todayIso } from '../../../../(arf)/(workspaces)/lastmile/finance/_lib/format'
import type { PriceListStatus, PriceZone } from '../../../../(arf)/(workspaces)/lastmile/finance/_types'
import type {
  CourierCostAssignment,
  CourierCostList,
  CourierCostQuoteInput,
  CourierCostQuoteResult,
  CourierCostRule,
  CourierEarningsSnapshot,
  CourierPayoutLedger,
  CourierPayoutSummary,
  CourierPayoutTerms,
  CourierPayoutsKpi,
  EmploymentTypeCostDefault,
  PayoutCycle,
  PayoutEntry,
  PayoutMethod,
  PayoutStatus,
} from '../../../../(arf)/(workspaces)/lastmile/finance/_types'
import { readTenantJson, writeTenantJson } from './fs-json-store'

const FILES = {
  costLists: 'cost-lists.json',
  assignments: 'courier-cost-assignments.json',
  employmentDefaults: 'employment-defaults.json',
  payoutTerms: 'payout-terms.json',
  earnings: 'courier-earnings.json',
  ledgers: 'payout-ledgers.json',
  payouts: 'payout-entries.json',
  zones: 'zones.json',
  seeded: 'courier-cost-seeded.json',
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
    FILES.costLists,
    await readTenantJson<CourierCostList[]>(tenantId, FILES.costLists, []),
    (v) => v.length === 0,
    buildSeedCourierCostLists
  )
  await writeIfEmpty(
    FILES.assignments,
    await readTenantJson<CourierCostAssignment[]>(tenantId, FILES.assignments, []),
    (v) => v.length === 0,
    buildSeedCourierCostAssignments
  )
  await writeIfEmpty(
    FILES.employmentDefaults,
    await readTenantJson<EmploymentTypeCostDefault[]>(tenantId, FILES.employmentDefaults, []),
    (v) => v.length === 0,
    buildSeedEmploymentDefaults
  )
  await writeIfEmpty(
    FILES.payoutTerms,
    await readTenantJson<CourierPayoutTerms[]>(tenantId, FILES.payoutTerms, []),
    (v) => v.length === 0,
    buildSeedCourierPayoutTerms
  )
  await writeIfEmpty(
    FILES.earnings,
    await readTenantJson<CourierEarningsSnapshot[]>(tenantId, FILES.earnings, []),
    (v) => v.length === 0,
    buildSeedCourierEarnings
  )
  await writeIfEmpty(
    FILES.ledgers,
    await readTenantJson<CourierPayoutLedger[]>(tenantId, FILES.ledgers, []),
    (v) => v.length === 0,
    buildSeedCourierPayoutLedgers
  )
  await writeIfEmpty(
    FILES.payouts,
    await readTenantJson<PayoutEntry[]>(tenantId, FILES.payouts, []),
    (v) => v.length === 0,
    buildSeedPayoutEntries
  )
  await writeTenantJson(tenantId, FILES.seeded, true)
}

async function getCostLists(tenantId: string) {
  await ensureSeed(tenantId)
  return readTenantJson<CourierCostList[]>(tenantId, FILES.costLists, [])
}

async function saveCostLists(tenantId: string, lists: CourierCostList[]) {
  await writeTenantJson(tenantId, FILES.costLists, lists)
}

async function getAssignments(tenantId: string) {
  await ensureSeed(tenantId)
  return readTenantJson<CourierCostAssignment[]>(tenantId, FILES.assignments, [])
}

async function saveAssignments(tenantId: string, rows: CourierCostAssignment[]) {
  await writeTenantJson(tenantId, FILES.assignments, rows)
}

async function getEmploymentDefaults(tenantId: string) {
  await ensureSeed(tenantId)
  return readTenantJson<EmploymentTypeCostDefault[]>(tenantId, FILES.employmentDefaults, [])
}

async function getPayoutTerms(tenantId: string) {
  await ensureSeed(tenantId)
  return readTenantJson<CourierPayoutTerms[]>(tenantId, FILES.payoutTerms, [])
}

async function savePayoutTerms(tenantId: string, rows: CourierPayoutTerms[]) {
  await writeTenantJson(tenantId, FILES.payoutTerms, rows)
}

async function getEarnings(tenantId: string) {
  await ensureSeed(tenantId)
  return readTenantJson<CourierEarningsSnapshot[]>(tenantId, FILES.earnings, [])
}

async function getLedgers(tenantId: string) {
  await ensureSeed(tenantId)
  return readTenantJson<CourierPayoutLedger[]>(tenantId, FILES.ledgers, [])
}

async function saveLedgers(tenantId: string, rows: CourierPayoutLedger[]) {
  await writeTenantJson(tenantId, FILES.ledgers, rows)
}

async function getPayouts(tenantId: string) {
  await ensureSeed(tenantId)
  return readTenantJson<PayoutEntry[]>(tenantId, FILES.payouts, [])
}

async function savePayouts(tenantId: string, rows: PayoutEntry[]) {
  await writeTenantJson(tenantId, FILES.payouts, rows)
}

async function buildQuoteCtx(tenantId: string): Promise<CourierCostQuoteContext> {
  const zones = await readTenantJson<PriceZone[]>(tenantId, FILES.zones, [])
  const assignments = Object.fromEntries(
    (await getAssignments(tenantId)).map((a) => [a.courierId, a.costListId])
  )
  return {
    costLists: await getCostLists(tenantId),
    zones,
    assignments,
  }
}

function derivePayoutStatus(ledger: CourierPayoutLedger): PayoutStatus {
  if (ledger.amountPaid >= ledger.amountDue && ledger.amountDue > 0) return 'odendi'
  if (ledger.amountPaid > 0 && ledger.amountPaid < ledger.amountDue) return 'kismi'
  if (ledger.dueDate && ledger.dueDate < todayIso() && ledger.amountPaid < ledger.amountDue) {
    return 'gecikti'
  }
  return 'bekliyor'
}

function validatePayoutTermsInput(input: {
  payoutCycle: PayoutCycle
  weeklyPayoutDay?: number
  monthlyPayoutDay?: number
}): string | null {
  if (input.payoutCycle === 'weekly') {
    const d = input.weeklyPayoutDay
    if (d == null || d < 1 || d > 7) return 'Haftalık ödemede gün 1–7 arasında olmalı.'
  }
  if (input.payoutCycle === 'monthly_fixed_day') {
    const d = input.monthlyPayoutDay
    if (d == null || d < 1 || d > 28) return 'Ayın sabit günü 1–28 arasında olmalı.'
  }
  return null
}

export type UpsertCourierCostListInput = {
  code?: string
  name: string
  description?: string
  isDefault?: boolean
  status?: PriceListStatus
  distanceStructure: CourierCostList['distanceStructure']
  quantityBasis?: CourierCostList['quantityBasis']
  compensationModel?: CourierCostList['compensationModel']
  fixedSalaryMonthly?: number
  validFrom?: string
  validTo?: string
  rules?: CourierCostRule[]
}

export async function listCourierCostLists(tenantId: string): Promise<CourierCostList[]> {
  return [...(await getCostLists(tenantId))].sort((a, b) => a.name.localeCompare(b.name, 'tr'))
}

export async function getCourierCostList(
  tenantId: string,
  id: string
): Promise<CourierCostList | undefined> {
  return (await getCostLists(tenantId)).find((p) => p.id === id)
}

export async function createCourierCostList(
  tenantId: string,
  input: UpsertCourierCostListInput
): Promise<CourierCostList> {
  const lists = await getCostLists(tenantId)
  const id = createId('ccl')
  const stamp = nowIso()
  const compensationModel = input.compensationModel ?? 'tariff'
  const list: CourierCostList = {
    id,
    code: (input.code?.trim() || `KURYE-${Date.now().toString(36).toUpperCase()}`).slice(0, 40),
    name: input.name.trim(),
    description: input.description?.trim(),
    isDefault: Boolean(input.isDefault),
    status: input.status ?? 'active',
    currency: 'TRY',
    distanceStructure: input.distanceStructure,
    quantityBasis: input.quantityBasis ?? 'desi',
    compensationModel,
    fixedSalaryMonthly:
      compensationModel === 'salary_plus_bonus' ? input.fixedSalaryMonthly : undefined,
    validFrom: input.validFrom,
    validTo: input.validTo,
    createdAt: stamp,
    updatedAt: stamp,
    createdBy: 'kullanici',
    rules: (input.rules ?? []).map((r) => ({ ...r, costListId: id })),
  }
  let next = [list, ...lists]
  if (list.isDefault) {
    next = next.map((p) => (p.id === id ? p : { ...p, isDefault: false }))
  }
  await saveCostLists(tenantId, next)
  return list
}

export async function updateCourierCostList(
  tenantId: string,
  id: string,
  input: UpsertCourierCostListInput
): Promise<CourierCostList | undefined> {
  const lists = await getCostLists(tenantId)
  const idx = lists.findIndex((p) => p.id === id)
  if (idx < 0) return undefined
  const prev = lists[idx]
  const compensationModel = input.compensationModel ?? prev.compensationModel
  const updated: CourierCostList = {
    ...prev,
    code: input.code?.trim() || prev.code,
    name: input.name.trim(),
    description: input.description?.trim(),
    isDefault: input.isDefault ?? prev.isDefault,
    status: input.status ?? prev.status,
    distanceStructure: input.distanceStructure,
    quantityBasis: input.quantityBasis ?? prev.quantityBasis ?? 'desi',
    compensationModel,
    fixedSalaryMonthly:
      compensationModel === 'salary_plus_bonus' ? input.fixedSalaryMonthly : undefined,
    validFrom: input.validFrom,
    validTo: input.validTo,
    updatedAt: nowIso(),
    rules: input.rules ? input.rules.map((r) => ({ ...r, costListId: id })) : prev.rules,
  }
  let next = [...lists]
  next[idx] = updated
  if (updated.isDefault) {
    next = next.map((p) => (p.id === id ? p : { ...p, isDefault: false }))
  }
  await saveCostLists(tenantId, next)
  return updated
}

export async function cloneCourierCostList(
  tenantId: string,
  id: string
): Promise<CourierCostList | undefined> {
  const source = (await getCostLists(tenantId)).find((p) => p.id === id)
  if (!source) return undefined
  const newId = createId('ccl')
  const stamp = nowIso()
  const clone: CourierCostList = {
    ...source,
    id: newId,
    code: `${source.code}-KOPYA`,
    name: `${source.name} (Kopya)`,
    isDefault: false,
    createdAt: stamp,
    updatedAt: stamp,
    rules: source.rules.map((r) => ({
      ...r,
      id: createId('ccr'),
      costListId: newId,
    })),
  }
  await saveCostLists(tenantId, [clone, ...(await getCostLists(tenantId))])
  return clone
}

export async function setDefaultCourierCostList(
  tenantId: string,
  id: string
): Promise<CourierCostList | undefined> {
  const lists = await getCostLists(tenantId)
  if (!lists.some((p) => p.id === id)) return undefined
  const next = lists.map((p) => ({
    ...p,
    isDefault: p.id === id,
    status: p.id === id ? ('active' as const) : p.status,
    updatedAt: p.id === id ? nowIso() : p.updatedAt,
  }))
  await saveCostLists(tenantId, next)
  return next.find((p) => p.id === id)
}

export async function setCourierCostListStatus(
  tenantId: string,
  id: string,
  status: PriceListStatus
): Promise<CourierCostList | undefined> {
  const lists = await getCostLists(tenantId)
  const idx = lists.findIndex((p) => p.id === id)
  if (idx < 0) return undefined
  const updated = { ...lists[idx], status, updatedAt: nowIso() }
  const next = [...lists]
  next[idx] = updated
  await saveCostLists(tenantId, next)
  return updated
}

export async function getCourierCostAssignment(
  tenantId: string,
  courierId: string
): Promise<CourierCostAssignment | undefined> {
  return (await getAssignments(tenantId)).find((a) => a.courierId === courierId)
}

export async function setCourierCostAssignment(
  tenantId: string,
  courierId: string,
  costListId: string | null
): Promise<CourierCostAssignment | undefined> {
  let rows = (await getAssignments(tenantId)).filter((a) => a.courierId !== courierId)
  if (!costListId) {
    await saveAssignments(tenantId, rows)
    return undefined
  }
  const row: CourierCostAssignment = {
    courierId,
    costListId,
    updatedAt: nowIso(),
  }
  rows = [row, ...rows]
  await saveAssignments(tenantId, rows)
  return row
}

export async function listCourierCostAssignments(
  tenantId: string
): Promise<CourierCostAssignment[]> {
  return getAssignments(tenantId)
}

export async function listEmploymentTypeCostDefaults(
  tenantId: string
): Promise<EmploymentTypeCostDefault[]> {
  return getEmploymentDefaults(tenantId)
}

export async function getCourierPayoutTerms(
  tenantId: string,
  courierId: string
): Promise<CourierPayoutTerms | undefined> {
  return (await getPayoutTerms(tenantId)).find((t) => t.courierId === courierId)
}

export async function setCourierPayoutTerms(
  tenantId: string,
  courierId: string,
  input: {
    payoutCycle: PayoutCycle
    weeklyPayoutDay?: number
    monthlyPayoutDay?: number
    creditDays?: number
    notes?: string
  }
): Promise<CourierPayoutTerms> {
  const err = validatePayoutTermsInput(input)
  if (err) throw new Error(err)

  const row: CourierPayoutTerms = {
    courierId,
    payoutCycle: input.payoutCycle,
    weeklyPayoutDay: input.payoutCycle === 'weekly' ? input.weeklyPayoutDay : undefined,
    monthlyPayoutDay:
      input.payoutCycle === 'monthly_fixed_day' ? input.monthlyPayoutDay : undefined,
    creditDays: Math.max(0, input.creditDays ?? 0),
    notes: input.notes,
    updatedAt: nowIso(),
  }
  const rows = [row, ...(await getPayoutTerms(tenantId)).filter((t) => t.courierId !== courierId)]
  await savePayoutTerms(tenantId, rows)
  return row
}

export async function getCourierPayoutSummary(
  tenantId: string,
  courierId: string
): Promise<CourierPayoutSummary> {
  const ledgers = (await getLedgers(tenantId))
    .filter((l) => l.courierId === courierId)
    .map((l) => ({ ...l, payoutStatus: derivePayoutStatus(l) }))
  const payouts = (await getPayouts(tenantId)).filter((p) => p.courierId === courierId)
  const assignment = (await getAssignments(tenantId)).find((a) => a.courierId === courierId)
  const list = assignment
    ? (await getCostLists(tenantId)).find((p) => p.id === assignment.costListId)
    : undefined
  const terms = (await getPayoutTerms(tenantId)).find((t) => t.courierId === courierId)

  const openBalance = ledgers.reduce((sum, p) => sum + Math.max(0, p.amountDue - p.amountPaid), 0)
  const totalPaid = payouts.reduce((sum, c) => sum + c.amount, 0)
  const overdueCount = ledgers.filter((p) => p.payoutStatus === 'gecikti').length
  const lastPayoutAt = payouts
    .map((c) => c.paidAt)
    .sort()
    .at(-1)

  return {
    courierId,
    openBalance,
    totalPaid,
    overdueCount,
    lastPayoutAt,
    assignedCostListId: assignment?.costListId,
    assignedCostListName: list?.name,
    payoutTerms: terms,
  }
}

export async function quoteCourierCostForTenant(
  tenantId: string,
  input: CourierCostQuoteInput
): Promise<CourierCostQuoteResult> {
  const ctx = await buildQuoteCtx(tenantId)
  return quoteCourierCost(ctx, input)
}

export async function listCourierPayouts(
  tenantId: string,
  filters?: {
    courierId?: string
    status?: PayoutStatus
  }
): Promise<{
  entries: PayoutEntry[]
  ledgers: CourierPayoutLedger[]
  kpi: CourierPayoutsKpi
}> {
  let entries = await getPayouts(tenantId)
  let ledgers = (await getLedgers(tenantId)).map((l) => ({
    ...l,
    payoutStatus: derivePayoutStatus(l),
  }))

  if (filters?.courierId) {
    entries = entries.filter((e) => e.courierId === filters.courierId)
    ledgers = ledgers.filter((p) => p.courierId === filters.courierId)
  }
  if (filters?.status) {
    ledgers = ledgers.filter((p) => p.payoutStatus === filters.status)
  }

  const kpi: CourierPayoutsKpi = {
    toPay: ledgers.reduce((s, l) => s + Math.max(0, l.amountDue - l.amountPaid), 0),
    paid: entries.reduce((s, e) => s + e.amount, 0),
    overdue: ledgers
      .filter((l) => l.payoutStatus === 'gecikti')
      .reduce((s, l) => s + Math.max(0, l.amountDue - l.amountPaid), 0),
    openLedgerCount: ledgers.filter((l) => l.amountPaid < l.amountDue).length,
  }

  return {
    entries: [...entries].sort((a, b) => b.paidAt.localeCompare(a.paidAt)),
    ledgers: [...ledgers].sort((a, b) => (b.dueDate ?? '').localeCompare(a.dueDate ?? '')),
    kpi,
  }
}

export async function createCourierPayout(
  tenantId: string,
  input: {
    courierId: string
    courierName?: string
    ledgerId?: string
    amount: number
    method: PayoutMethod
    paidAt: string
    note?: string
  }
): Promise<PayoutEntry> {
  const entry: PayoutEntry = {
    id: createId('pay'),
    courierId: input.courierId,
    courierName: input.courierName,
    ledgerId: input.ledgerId,
    amount: input.amount,
    method: input.method,
    paidAt: input.paidAt,
    note: input.note,
    createdBy: 'kullanici',
    createdAt: nowIso(),
  }
  await savePayouts(tenantId, [entry, ...(await getPayouts(tenantId))])

  if (input.ledgerId) {
    const ledgers = await getLedgers(tenantId)
    const idx = ledgers.findIndex((p) => p.id === input.ledgerId)
    if (idx >= 0) {
      const updated = {
        ...ledgers[idx],
        amountPaid: ledgers[idx].amountPaid + input.amount,
        method: input.method,
        paidAt: input.paidAt,
        updatedAt: nowIso(),
      }
      updated.payoutStatus = derivePayoutStatus(updated)
      const next = [...ledgers]
      next[idx] = updated
      await saveLedgers(tenantId, next)
    }
  }

  return entry
}

export async function listCourierEarnings(
  tenantId: string,
  courierId?: string
): Promise<CourierEarningsSnapshot[]> {
  let rows = await getEarnings(tenantId)
  if (courierId) rows = rows.filter((e) => e.courierId === courierId)
  return [...rows].sort((a, b) => b.earnedAt.localeCompare(a.earnedAt))
}

export function buildDueDateFromTerms(
  earnedAt: string,
  terms?: CourierPayoutTerms
): string | undefined {
  if (!terms) return earnedAt
  const credit = terms.creditDays ?? 0
  if (terms.payoutCycle === 'per_delivery') {
    return addDaysIso(earnedAt, credit)
  }
  return addDaysIso(earnedAt, credit)
}
