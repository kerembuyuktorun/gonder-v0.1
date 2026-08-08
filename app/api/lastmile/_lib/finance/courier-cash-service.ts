import type {
  CourierCashBalance,
  CourierCashBalancesKpi,
  CourierCashMovement,
  CourierCashSource,
} from '../../../../(arf)/(workspaces)/lastmile/finance/_types/courier-cash'
import { createId, nowIso } from '../../../../(arf)/(workspaces)/lastmile/finance/_lib/format'
import { readTenantJson, writeTenantJson } from './fs-json-store'

const FILES = {
  movements: 'movements.json',
  seeded: 'cash-seeded.json',
} as const

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 86400000).toISOString()
}

function buildSeedMovements(): CourierCashMovement[] {
  const stamp = nowIso()
  return [
    {
      id: createId('ccm'),
      courierId: 'seed-courier-1',
      courierName: 'Ahmet Yılmaz',
      type: 'collection',
      amount: 450,
      occurredAt: daysAgoIso(0),
      orderId: null,
      takipNo: 'LM-10021',
      note: 'Alıcı kapıda nakit',
      source: 'kapida_alici',
      createdAt: stamp,
    },
    {
      id: createId('ccm'),
      courierId: 'seed-courier-1',
      courierName: 'Ahmet Yılmaz',
      type: 'collection',
      amount: 280,
      occurredAt: daysAgoIso(1),
      orderId: null,
      takipNo: 'LM-10008',
      note: null,
      source: 'kapida_gonderici',
      createdAt: stamp,
    },
    {
      id: createId('ccm'),
      courierId: 'seed-courier-1',
      courierName: 'Ahmet Yılmaz',
      type: 'remittance',
      amount: 300,
      occurredAt: daysAgoIso(0),
      orderId: null,
      takipNo: null,
      note: 'Gün sonu kısmi teslim',
      source: 'tenant_tahsilat',
      createdAt: stamp,
    },
    {
      id: createId('ccm'),
      courierId: 'seed-courier-2',
      courierName: 'Ayşe Demir',
      type: 'collection',
      amount: 620,
      occurredAt: daysAgoIso(0),
      orderId: null,
      takipNo: 'LM-10033',
      note: null,
      source: 'kapida_alici',
      createdAt: stamp,
    },
    {
      id: createId('ccm'),
      courierId: 'seed-courier-3',
      courierName: 'Can Öztürk',
      type: 'collection',
      amount: 150,
      occurredAt: daysAgoIso(2),
      orderId: null,
      takipNo: 'LM-09990',
      note: 'Diğer nakit',
      source: 'diger_nakit',
      createdAt: stamp,
    },
    {
      id: createId('ccm'),
      courierId: 'seed-courier-3',
      courierName: 'Can Öztürk',
      type: 'remittance',
      amount: 150,
      occurredAt: daysAgoIso(1),
      orderId: null,
      takipNo: null,
      note: 'Tam teslim',
      source: 'tenant_tahsilat',
      createdAt: stamp,
    },
  ]
}

async function ensureSeed(tenantId: string) {
  const seeded = await readTenantJson<boolean>(tenantId, FILES.seeded, false)
  if (seeded) return

  const current = await readTenantJson<CourierCashMovement[]>(tenantId, FILES.movements, [])
  if (current.length === 0) {
    await writeTenantJson(tenantId, FILES.movements, buildSeedMovements())
  }
  await writeTenantJson(tenantId, FILES.seeded, true)
}

async function getMovements(tenantId: string) {
  await ensureSeed(tenantId)
  return readTenantJson<CourierCashMovement[]>(tenantId, FILES.movements, [])
}

async function saveMovements(tenantId: string, items: CourierCashMovement[]) {
  await writeTenantJson(tenantId, FILES.movements, items)
}

function buildBalances(movements: CourierCashMovement[]): CourierCashBalance[] {
  const byCourier = new Map<
    string,
    {
      courierName: string
      collected: number
      remitted: number
      lastMovementAt?: string
      count: number
    }
  >()

  for (const m of movements) {
    const row = byCourier.get(m.courierId) ?? {
      courierName: m.courierName || m.courierId,
      collected: 0,
      remitted: 0,
      lastMovementAt: undefined as string | undefined,
      count: 0,
    }
    if (m.type === 'collection') row.collected += m.amount
    else row.remitted += m.amount
    row.count += 1
    if (!row.lastMovementAt || m.occurredAt > row.lastMovementAt) {
      row.lastMovementAt = m.occurredAt
    }
    if (m.courierName) row.courierName = m.courierName
    byCourier.set(m.courierId, row)
  }

  return Array.from(byCourier.entries())
    .map(([courierId, row]) => {
      const netBalance = Math.round((row.collected - row.remitted) * 100) / 100
      return {
        courierId,
        courierName: row.courierName,
        netBalance,
        collectedTotal: Math.round(row.collected * 100) / 100,
        remittedTotal: Math.round(row.remitted * 100) / 100,
        lastMovementAt: row.lastMovementAt,
        openMovementCount: row.count,
      } satisfies CourierCashBalance
    })
    .sort((a, b) => b.netBalance - a.netBalance || a.courierName.localeCompare(b.courierName, 'tr'))
}

export async function listBalances(tenantId: string): Promise<CourierCashBalance[]> {
  return buildBalances(await getMovements(tenantId))
}

export async function getBalance(
  tenantId: string,
  courierId: string
): Promise<CourierCashBalance | null> {
  return (await listBalances(tenantId)).find((b) => b.courierId === courierId) ?? null
}

export async function listMovements(
  tenantId: string,
  courierId: string
): Promise<CourierCashMovement[]> {
  return (await getMovements(tenantId))
    .filter((m) => m.courierId === courierId)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
}

export async function getKpi(tenantId: string): Promise<CourierCashBalancesKpi> {
  const balances = await listBalances(tenantId)
  const today = todayIsoDate()
  const remittedToday = (await getMovements(tenantId))
    .filter((m) => m.type === 'remittance' && m.occurredAt.slice(0, 10) === today)
    .reduce((sum, m) => sum + m.amount, 0)

  return {
    totalNet: Math.round(balances.reduce((sum, b) => sum + b.netBalance, 0) * 100) / 100,
    couriersWithBalance: balances.filter((b) => b.netBalance > 0).length,
    remittedToday: Math.round(remittedToday * 100) / 100,
  }
}

export type RecordRemittanceInput = {
  courierId: string
  courierName?: string
  amount: number
  occurredAt: string
  note?: string | null
}

export async function recordRemittance(
  tenantId: string,
  input: RecordRemittanceInput
): Promise<CourierCashMovement> {
  const balance = await getBalance(tenantId, input.courierId)
  const net = balance?.netBalance ?? 0
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error('Geçerli bir tutar girin')
  }
  if (input.amount > net + 0.001) {
    throw new Error('Tutar net bakiyeden büyük olamaz')
  }

  const movement: CourierCashMovement = {
    id: createId('ccm'),
    courierId: input.courierId,
    courierName: input.courierName || balance?.courierName || input.courierId,
    type: 'remittance',
    amount: Math.round(input.amount * 100) / 100,
    occurredAt: input.occurredAt.includes('T')
      ? input.occurredAt
      : `${input.occurredAt}T12:00:00.000Z`,
    orderId: null,
    takipNo: null,
    note: input.note?.trim() || null,
    source: 'tenant_tahsilat',
    createdAt: nowIso(),
  }

  await saveMovements(tenantId, [movement, ...(await getMovements(tenantId))])
  return movement
}

export type RecordCollectionInput = {
  courierId: string
  courierName?: string
  amount: number
  occurredAt: string
  source: Exclude<CourierCashSource, 'tenant_tahsilat'> | CourierCashSource
  orderId?: string | null
  takipNo?: string | null
  note?: string | null
}

export async function recordCollection(
  tenantId: string,
  input: RecordCollectionInput
): Promise<CourierCashMovement> {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error('Geçerli bir tutar girin')
  }

  const balance = await getBalance(tenantId, input.courierId)
  const movement: CourierCashMovement = {
    id: createId('ccm'),
    courierId: input.courierId,
    courierName: input.courierName || balance?.courierName || input.courierId,
    type: 'collection',
    amount: Math.round(input.amount * 100) / 100,
    occurredAt: input.occurredAt.includes('T')
      ? input.occurredAt
      : `${input.occurredAt}T12:00:00.000Z`,
    orderId: input.orderId ?? null,
    takipNo: input.takipNo ?? null,
    note: input.note?.trim() || null,
    source: input.source,
    createdAt: nowIso(),
  }

  await saveMovements(tenantId, [movement, ...(await getMovements(tenantId))])
  return movement
}
