'use client'

import {
  COURIER_CASH_STORAGE_KEYS,
  readCourierCashJson,
  writeCourierCashJson,
} from '../_lib/courier-cash-storage'
import type {
  CourierCashBalance,
  CourierCashBalancesKpi,
  CourierCashMovement,
} from '../_types/courier-cash'

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 86400000).toISOString()
}

function ensureSeeded() {
  if (typeof window === 'undefined') return
  if (readCourierCashJson(COURIER_CASH_STORAGE_KEYS.seeded, false)) return

  const now = new Date().toISOString()
  const seed: CourierCashMovement[] = [
    {
      id: uid('ccm'),
      courierId: 'seed-courier-1',
      courierName: 'Ahmet Yılmaz',
      type: 'collection',
      amount: 450,
      occurredAt: daysAgoIso(0),
      orderId: null,
      takipNo: 'LM-10021',
      note: 'Alıcı kapıda nakit',
      source: 'kapida_alici',
      createdAt: now,
    },
    {
      id: uid('ccm'),
      courierId: 'seed-courier-1',
      courierName: 'Ahmet Yılmaz',
      type: 'collection',
      amount: 280,
      occurredAt: daysAgoIso(1),
      orderId: null,
      takipNo: 'LM-10008',
      note: null,
      source: 'kapida_gonderici',
      createdAt: now,
    },
    {
      id: uid('ccm'),
      courierId: 'seed-courier-1',
      courierName: 'Ahmet Yılmaz',
      type: 'remittance',
      amount: 300,
      occurredAt: daysAgoIso(0),
      orderId: null,
      takipNo: null,
      note: 'Gün sonu kısmi teslim',
      source: 'tenant_tahsilat',
      createdAt: now,
    },
    {
      id: uid('ccm'),
      courierId: 'seed-courier-2',
      courierName: 'Ayşe Demir',
      type: 'collection',
      amount: 620,
      occurredAt: daysAgoIso(0),
      orderId: null,
      takipNo: 'LM-10033',
      note: null,
      source: 'kapida_alici',
      createdAt: now,
    },
    {
      id: uid('ccm'),
      courierId: 'seed-courier-3',
      courierName: 'Can Öztürk',
      type: 'collection',
      amount: 150,
      occurredAt: daysAgoIso(2),
      orderId: null,
      takipNo: 'LM-09990',
      note: 'Diğer nakit',
      source: 'diger_nakit',
      createdAt: now,
    },
    {
      id: uid('ccm'),
      courierId: 'seed-courier-3',
      courierName: 'Can Öztürk',
      type: 'remittance',
      amount: 150,
      occurredAt: daysAgoIso(1),
      orderId: null,
      takipNo: null,
      note: 'Tam teslim',
      source: 'tenant_tahsilat',
      createdAt: now,
    },
  ]

  writeCourierCashJson(COURIER_CASH_STORAGE_KEYS.movements, seed)
  writeCourierCashJson(COURIER_CASH_STORAGE_KEYS.seeded, true)
}

function getMovements(): CourierCashMovement[] {
  ensureSeeded()
  return readCourierCashJson<CourierCashMovement[]>(COURIER_CASH_STORAGE_KEYS.movements, [])
}

function saveMovements(items: CourierCashMovement[]) {
  writeCourierCashJson(COURIER_CASH_STORAGE_KEYS.movements, items)
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

export function listCourierCashBalancesLocal(): CourierCashBalance[] {
  return buildBalances(getMovements())
}

export function getCourierCashBalanceLocal(courierId: string): CourierCashBalance | null {
  return listCourierCashBalancesLocal().find((b) => b.courierId === courierId) ?? null
}

export function listCourierCashMovementsLocal(courierId: string): CourierCashMovement[] {
  return getMovements()
    .filter((m) => m.courierId === courierId)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
}

export function getCourierCashBalancesKpiLocal(): CourierCashBalancesKpi {
  const balances = listCourierCashBalancesLocal()
  const today = todayIsoDate()
  const remittedToday = getMovements()
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

export function recordRemittanceLocal(input: RecordRemittanceInput): CourierCashMovement {
  const balance = getCourierCashBalanceLocal(input.courierId)
  const net = balance?.netBalance ?? 0
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error('Geçerli bir tutar girin')
  }
  if (input.amount > net + 0.001) {
    throw new Error('Tutar net bakiyeden büyük olamaz')
  }

  const movement: CourierCashMovement = {
    id: uid('ccm'),
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
    createdAt: new Date().toISOString(),
  }

  saveMovements([movement, ...getMovements()])
  return movement
}
