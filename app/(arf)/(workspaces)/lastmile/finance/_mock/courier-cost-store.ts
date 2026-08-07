/**
 * Last Mile courier cost / payout mock store.
 * TODO: Remove mock when backend API is ready.
 */
import {
  buildSeedCourierCostAssignments,
  buildSeedCourierCostLists,
  buildSeedCourierEarnings,
  buildSeedCourierPayoutLedgers,
  buildSeedCourierPayoutTerms,
  buildSeedEmploymentDefaults,
  buildSeedPayoutEntries,
} from '../_data/courier-cost-seed'
import {
  quoteCourierCost,
  type CourierCostQuoteContext,
} from '../_lib/courier-cost-quote-engine'
import { addDaysIso, createId, nowIso, todayIso } from '../_lib/format'
import {
  COURIER_COST_STORAGE_KEYS,
  isCourierCostSeeded,
  markCourierCostSeeded,
  readCourierCostJson,
  writeCourierCostJson,
} from '../_lib/courier-cost-storage'
import { listPriceZones } from './pricing-store'
import type { PriceListStatus, PriceZone } from '../_types'
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
} from '../_types'

function ensureSeed() {
  if (typeof window === 'undefined') return
  if (isCourierCostSeeded()) return
  writeCourierCostJson(COURIER_COST_STORAGE_KEYS.costLists, buildSeedCourierCostLists())
  writeCourierCostJson(
    COURIER_COST_STORAGE_KEYS.assignments,
    buildSeedCourierCostAssignments()
  )
  writeCourierCostJson(
    COURIER_COST_STORAGE_KEYS.employmentDefaults,
    buildSeedEmploymentDefaults()
  )
  writeCourierCostJson(COURIER_COST_STORAGE_KEYS.payoutTerms, buildSeedCourierPayoutTerms())
  writeCourierCostJson(COURIER_COST_STORAGE_KEYS.earnings, buildSeedCourierEarnings())
  writeCourierCostJson(COURIER_COST_STORAGE_KEYS.ledgers, buildSeedCourierPayoutLedgers())
  writeCourierCostJson(COURIER_COST_STORAGE_KEYS.payouts, buildSeedPayoutEntries())
  markCourierCostSeeded()
}

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function getCostLists(): CourierCostList[] {
  ensureSeed()
  return readCourierCostJson<CourierCostList[]>(COURIER_COST_STORAGE_KEYS.costLists, [])
}

function saveCostLists(lists: CourierCostList[]) {
  writeCourierCostJson(COURIER_COST_STORAGE_KEYS.costLists, lists)
}

function getAssignments(): CourierCostAssignment[] {
  ensureSeed()
  return readCourierCostJson<CourierCostAssignment[]>(
    COURIER_COST_STORAGE_KEYS.assignments,
    []
  )
}

function saveAssignments(rows: CourierCostAssignment[]) {
  writeCourierCostJson(COURIER_COST_STORAGE_KEYS.assignments, rows)
}

function getEmploymentDefaults(): EmploymentTypeCostDefault[] {
  ensureSeed()
  return readCourierCostJson<EmploymentTypeCostDefault[]>(
    COURIER_COST_STORAGE_KEYS.employmentDefaults,
    []
  )
}

function getPayoutTerms(): CourierPayoutTerms[] {
  ensureSeed()
  return readCourierCostJson<CourierPayoutTerms[]>(COURIER_COST_STORAGE_KEYS.payoutTerms, [])
}

function savePayoutTerms(rows: CourierPayoutTerms[]) {
  writeCourierCostJson(COURIER_COST_STORAGE_KEYS.payoutTerms, rows)
}

function getEarnings(): CourierEarningsSnapshot[] {
  ensureSeed()
  return readCourierCostJson<CourierEarningsSnapshot[]>(COURIER_COST_STORAGE_KEYS.earnings, [])
}

function getLedgers(): CourierPayoutLedger[] {
  ensureSeed()
  return readCourierCostJson<CourierPayoutLedger[]>(COURIER_COST_STORAGE_KEYS.ledgers, [])
}

function saveLedgers(rows: CourierPayoutLedger[]) {
  writeCourierCostJson(COURIER_COST_STORAGE_KEYS.ledgers, rows)
}

function getPayouts(): PayoutEntry[] {
  ensureSeed()
  return readCourierCostJson<PayoutEntry[]>(COURIER_COST_STORAGE_KEYS.payouts, [])
}

function savePayouts(rows: PayoutEntry[]) {
  writeCourierCostJson(COURIER_COST_STORAGE_KEYS.payouts, rows)
}

async function getSharedZones(): Promise<PriceZone[]> {
  return listPriceZones()
}

async function buildQuoteCtx(): Promise<CourierCostQuoteContext> {
  const zones = await getSharedZones()
  const assignments = Object.fromEntries(getAssignments().map((a) => [a.courierId, a.costListId]))
  return {
    costLists: getCostLists(),
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

// ─── Cost Lists ────────────────────────────────────────────

export async function listCourierCostLists(): Promise<CourierCostList[]> {
  return delay([...getCostLists()].sort((a, b) => a.name.localeCompare(b.name, 'tr')))
}

export async function getCourierCostList(id: string): Promise<CourierCostList | undefined> {
  return delay(getCostLists().find((p) => p.id === id))
}

export type UpsertCourierCostListInput = {
  code?: string
  name: string
  description?: string
  isDefault?: boolean
  status?: PriceListStatus
  distanceStructure: CourierCostList['distanceStructure']
  compensationModel?: CourierCostList['compensationModel']
  fixedSalaryMonthly?: number
  validFrom?: string
  validTo?: string
  rules?: CourierCostRule[]
}

export async function createCourierCostList(
  input: UpsertCourierCostListInput
): Promise<CourierCostList> {
  const lists = getCostLists()
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
    compensationModel,
    fixedSalaryMonthly:
      compensationModel === 'tariff' ? undefined : input.fixedSalaryMonthly,
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
  saveCostLists(next)
  return delay(list)
}

export async function updateCourierCostList(
  id: string,
  input: UpsertCourierCostListInput
): Promise<CourierCostList | undefined> {
  const lists = getCostLists()
  const idx = lists.findIndex((p) => p.id === id)
  if (idx < 0) return delay(undefined)
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
    compensationModel,
    fixedSalaryMonthly:
      compensationModel === 'tariff' ? undefined : input.fixedSalaryMonthly,
    validFrom: input.validFrom,
    validTo: input.validTo,
    updatedAt: nowIso(),
    rules: input.rules
      ? input.rules.map((r) => ({ ...r, costListId: id }))
      : prev.rules,
  }
  let next = [...lists]
  next[idx] = updated
  if (updated.isDefault) {
    next = next.map((p) => (p.id === id ? p : { ...p, isDefault: false }))
  }
  saveCostLists(next)
  return delay(updated)
}

export async function cloneCourierCostList(id: string): Promise<CourierCostList | undefined> {
  const source = getCostLists().find((p) => p.id === id)
  if (!source) return delay(undefined)
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
  saveCostLists([clone, ...getCostLists()])
  return delay(clone)
}

export async function setDefaultCourierCostList(
  id: string
): Promise<CourierCostList | undefined> {
  const lists = getCostLists()
  if (!lists.some((p) => p.id === id)) return delay(undefined)
  const next = lists.map((p) => ({
    ...p,
    isDefault: p.id === id,
    status: p.id === id ? ('active' as const) : p.status,
    updatedAt: p.id === id ? nowIso() : p.updatedAt,
  }))
  saveCostLists(next)
  return delay(next.find((p) => p.id === id))
}

export async function setCourierCostListStatus(
  id: string,
  status: PriceListStatus
): Promise<CourierCostList | undefined> {
  const lists = getCostLists()
  const idx = lists.findIndex((p) => p.id === id)
  if (idx < 0) return delay(undefined)
  const updated = { ...lists[idx], status, updatedAt: nowIso() }
  const next = [...lists]
  next[idx] = updated
  saveCostLists(next)
  return delay(updated)
}

// ─── Assignments ───────────────────────────────────────────

export async function getCourierCostAssignment(
  courierId: string
): Promise<CourierCostAssignment | undefined> {
  return delay(getAssignments().find((a) => a.courierId === courierId))
}

export async function setCourierCostAssignment(
  courierId: string,
  costListId: string | null
): Promise<CourierCostAssignment | undefined> {
  let rows = getAssignments().filter((a) => a.courierId !== courierId)
  if (!costListId) {
    saveAssignments(rows)
    return delay(undefined)
  }
  const row: CourierCostAssignment = {
    courierId,
    costListId,
    updatedAt: nowIso(),
  }
  rows = [row, ...rows]
  saveAssignments(rows)
  return delay(row)
}

export async function listCourierCostAssignments(): Promise<CourierCostAssignment[]> {
  return delay(getAssignments())
}

export async function listEmploymentTypeCostDefaults(): Promise<EmploymentTypeCostDefault[]> {
  return delay(getEmploymentDefaults())
}

// ─── Payout terms ──────────────────────────────────────────

export async function getCourierPayoutTerms(
  courierId: string
): Promise<CourierPayoutTerms | undefined> {
  return delay(getPayoutTerms().find((t) => t.courierId === courierId))
}

export async function setCourierPayoutTerms(
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
  const rows = [row, ...getPayoutTerms().filter((t) => t.courierId !== courierId)]
  savePayoutTerms(rows)
  return delay(row)
}

export async function getCourierPayoutSummary(
  courierId: string
): Promise<CourierPayoutSummary> {
  const ledgers = getLedgers()
    .filter((l) => l.courierId === courierId)
    .map((l) => ({ ...l, payoutStatus: derivePayoutStatus(l) }))
  const payouts = getPayouts().filter((p) => p.courierId === courierId)
  const assignment = getAssignments().find((a) => a.courierId === courierId)
  const list = assignment
    ? getCostLists().find((p) => p.id === assignment.costListId)
    : undefined
  const terms = getPayoutTerms().find((t) => t.courierId === courierId)

  const openBalance = ledgers.reduce(
    (sum, p) => sum + Math.max(0, p.amountDue - p.amountPaid),
    0
  )
  const totalPaid = payouts.reduce((sum, c) => sum + c.amount, 0)
  const overdueCount = ledgers.filter((p) => p.payoutStatus === 'gecikti').length
  const lastPayoutAt = payouts
    .map((c) => c.paidAt)
    .sort()
    .at(-1)

  return delay({
    courierId,
    openBalance,
    totalPaid,
    overdueCount,
    lastPayoutAt,
    assignedCostListId: assignment?.costListId,
    assignedCostListName: list?.name,
    payoutTerms: terms,
  })
}

// ─── Quote ─────────────────────────────────────────────────

export async function quoteCourierCostApi(
  input: CourierCostQuoteInput
): Promise<CourierCostQuoteResult> {
  const ctx = await buildQuoteCtx()
  return delay(quoteCourierCost(ctx, input))
}

// ─── Payouts / ledgers ─────────────────────────────────────

export async function listCourierPayouts(filters?: {
  courierId?: string
  status?: PayoutStatus
}): Promise<{
  entries: PayoutEntry[]
  ledgers: CourierPayoutLedger[]
  kpi: CourierPayoutsKpi
}> {
  let entries = getPayouts()
  let ledgers = getLedgers().map((l) => ({
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

  return delay({
    entries: [...entries].sort((a, b) => b.paidAt.localeCompare(a.paidAt)),
    ledgers: [...ledgers].sort((a, b) => (b.dueDate ?? '').localeCompare(a.dueDate ?? '')),
    kpi,
  })
}

export async function createCourierPayout(input: {
  courierId: string
  courierName?: string
  ledgerId?: string
  amount: number
  method: PayoutMethod
  paidAt: string
  note?: string
}): Promise<PayoutEntry> {
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
  savePayouts([entry, ...getPayouts()])

  if (input.ledgerId) {
    const ledgers = getLedgers()
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
      saveLedgers(next)
    }
  }

  return delay(entry)
}

export async function listCourierEarnings(courierId?: string): Promise<CourierEarningsSnapshot[]> {
  let rows = getEarnings()
  if (courierId) rows = rows.filter((e) => e.courierId === courierId)
  return delay([...rows].sort((a, b) => b.earnedAt.localeCompare(a.earnedAt)))
}

export function getCourierCostListsKpiSync() {
  ensureSeed()
  const lists = getCostLists()
  const assignments = getAssignments()
  const active = lists.filter((l) => l.status === 'active')
  const salaryCount = lists.filter(
    (l) =>
      l.status === 'active' &&
      (l.compensationModel === 'salary_plus_bonus' || l.compensationModel === 'hybrid')
  ).length
  const tariffCount = lists.filter(
    (l) => l.status === 'active' && l.compensationModel === 'tariff'
  ).length
  return {
    activeCount: active.length,
    salaryCount,
    tariffCount,
    assignedCourierCount: assignments.length,
  }
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
  // Simplified mock: credit days after earned date
  return addDaysIso(earnedAt, credit)
}
