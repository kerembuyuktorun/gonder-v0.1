/**
 * Orchestrator / API satırı → Rota Listesi satırı.
 * Müşteri alanı: BE `customerId` / `customerSnapshot` döndürürse dolar; yoksa null ("—").
 */

import type { OrchestratorActiveRoute } from '../../route-orchestrator/_types/orchestrator'
import {
  extractParkLabel,
  extractShiftTimes,
  secondsToDurationMin,
} from './format-route-detail'
import type {
  PlanningRouteDateChip,
  PlanningRouteListItem,
  PlanningRouteStatus,
  PlanningRouteType,
} from '../_types/planning-route'

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function pickNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const n = Number(value)
      if (Number.isFinite(n)) return n
    }
  }
  return null
}

function todayIsoLocal(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function resolveRouteDateChip(operationDate: string, today = todayIsoLocal()): PlanningRouteDateChip {
  const day = operationDate.slice(0, 10)
  if (day === today) return 'bugun'
  if (day < today) return 'gecmis'
  return 'ileri'
}

export function mapRawToPlanningStatus(rawStatus: unknown, fallback: OrchestratorActiveRoute['status']): PlanningRouteStatus {
  const value = pickString(rawStatus).toUpperCase()
  if (value === 'CANCELLED' || value === 'CANCELED' || value === 'IPTAL') return 'iptal'
  if (value === 'STARTED' || value === 'AKTIF') return 'aktif'
  if (value === 'COMPLETED' || value === 'TAMAMLANDI') return 'tamamlandi'
  if (value === 'CREATED' || value === 'PLANLANDI') return 'planlandi'
  return fallback
}

export function mapRawToPlanningRouteType(raw: unknown): PlanningRouteType {
  const value = pickString(raw).toUpperCase()
  if (!value) return 'Karışık'
  if (value === 'MIXED') return 'Karışık'
  if (value === 'DELIVERY') return 'Standart Rota'
  if (value === 'PICKUP') return 'Toplama Ringi'
  const lower = value.toLocaleLowerCase('tr-TR')
  if (lower.includes('karışık') || lower.includes('karisik') || lower === 'mixed') {
    return 'Karışık'
  }
  if (
    lower.includes('ekspres') ||
    lower.includes('express') ||
    lower === 'ekspres teslimat' ||
    lower === 'ekspres rota'
  ) {
    return 'Ekspres Teslimat'
  }
  if (
    lower.includes('toplama') ||
    lower.includes('milk') ||
    lower.includes('ring')
  ) {
    return 'Toplama Ringi'
  }
  if (lower.includes('standart') || lower === 'standard') {
    return 'Standart Rota'
  }
  return 'Karışık'
}

function parseSnapshotJson(raw: unknown): Record<string, unknown> {
  if (typeof raw === 'string') {
    try {
      return asRecord(JSON.parse(raw))
    } catch {
      return {}
    }
  }
  return asRecord(raw)
}

function extractCustomer(raw: Record<string, unknown>): {
  customerId: string | null
  customerName: string | null
} {
  const customer = asRecord(raw.customer)
  const snap = parseSnapshotJson(raw.customerSnapshot)
  const customerId =
    pickString(raw.customerId, raw.customer_id, customer.id, snap.id) || null
  const customerName =
    pickString(
      raw.customerName,
      raw.customer_name,
      customer.name,
      customer.title,
      customer.unvan,
      snap.name,
      snap.title,
      snap.unvan,
      snap.tradeName
    ) || null
  return { customerId, customerName }
}

/** API / orchestrator rota → liste satırı */
export function toPlanningRouteListItem(
  route: OrchestratorActiveRoute,
  raw?: unknown
): PlanningRouteListItem {
  const row = asRecord(raw)
  const { customerId, customerName } = extractCustomer(row)
  const status = mapRawToPlanningStatus(row.status, route.status)

  const { shiftStart, shiftEnd } = extractShiftTimes(row)

  const parkLabel = extractParkLabel(row) || null

  const createdAt =
    pickString(row.createdAt, row.created_at, row.olusturulma_zamani) ||
    `${route.operationDate}T08:00:00.000Z`

  const createdBy =
    pickString(
      row.createdByName,
      row.createdBy,
      row.created_by,
      row.olusturan,
      asRecord(row.createdByUser).fullName,
      asRecord(row.createdByUser).name
    ) || null

  const plannedSec = pickNumber(row.plannedDurationSec)
  const durationPlannedMin =
    secondsToDurationMin(plannedSec) ??
    (route.durationMin > 0 ? route.durationMin : null)

  const actualSec = pickNumber(row.actualDurationSec)
  const durationActualMin =
    secondsToDurationMin(actualSec) ??
    pickNumber(row.actualDurationMin, row.durationActualMin, row.realizedDurationMin)

  const routeType = mapRawToPlanningRouteType(
    pickString(row.routeType, row.rota_tipi, row.method, row.deliveryMethod) || 'Karışık'
  )

  return {
    id: route.id,
    label: route.label,
    color: route.color,
    status,
    routeType,
    operationDate: route.operationDate.slice(0, 10),
    dateChip: resolveRouteDateChip(route.operationDate),
    vehicleId: route.vehicleId,
    vehiclePlate: route.vehiclePlate,
    courierName: route.courierName,
    progressCompleted: route.completedStopCount,
    progressTotal: Math.max(route.stopCount, route.completedStopCount),
    orderCount: route.orderCount,
    distanceKm: route.distanceKm,
    durationPlannedMin: durationPlannedMin ?? route.durationMin,
    durationActualMin,
    region: route.region,
    capacityVolumePct: route.capacityVolumePct,
    capacityWeightPct: route.capacityWeightPct,
    shiftStart,
    shiftEnd,
    parkLabel,
    customerId,
    customerName,
    createdAt,
    createdBy,
  }
}
