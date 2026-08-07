/**
 * Rota detay / liste header alanları — BE plannedStartAt, parkLabel, actualDurationSec vb.
 */

import type { OrchestratorActiveRoute } from '../../route-orchestrator/_types/orchestrator'
import type { PlanningRouteStatus, PlanningRouteType } from '../_types/planning-route'

const TZ = 'Europe/Istanbul'

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

function mapRawToPlanningStatus(
  rawStatus: unknown,
  fallback: PlanningRouteStatus
): PlanningRouteStatus {
  const value = pickString(rawStatus).toUpperCase()
  if (value === 'CANCELLED' || value === 'CANCELED' || value === 'IPTAL') return 'iptal'
  if (value === 'STARTED' || value === 'AKTIF') return 'aktif'
  if (value === 'COMPLETED' || value === 'TAMAMLANDI') return 'tamamlandi'
  if (value === 'CREATED' || value === 'PLANLANDI') return 'planlandi'
  return fallback
}

function mapRawToPlanningRouteType(raw: unknown): PlanningRouteType {
  const value = pickString(raw).toUpperCase()
  if (!value) return 'Karışık'
  if (value === 'MIXED') return 'Karışık'
  if (value === 'DELIVERY') return 'Standart Rota'
  if (value === 'PICKUP') return 'Toplama Ringi'
  return 'Karışık'
}

export function formatTimeIstanbul(iso?: string | null): string | null {
  if (!iso?.trim()) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    const match = iso.match(/^(\d{2}):(\d{2})/)
    return match ? `${match[1]}:${match[2]}` : null
  }
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function secondsToDurationMin(sec?: number | null): number | null {
  if (sec == null || !Number.isFinite(sec) || sec <= 0) return null
  return Math.round(sec / 60)
}

export function extractShiftTimes(row: Record<string, unknown>): {
  shiftStart: string | null
  shiftEnd: string | null
} {
  const startIso = pickString(row.plannedStartAt, row.startAt)
  const endIso = pickString(row.plannedEndAt, row.endAt)

  const shiftStart =
    pickString(row.shiftStart, row.plannedStartTime, row.startTime) ||
    formatTimeIstanbul(startIso) ||
    null

  const shiftEnd =
    pickString(row.shiftEnd, row.plannedEndTime, row.endTime) ||
    formatTimeIstanbul(endIso) ||
    null

  return { shiftStart, shiftEnd }
}

export function extractParkLabel(
  row: Record<string, unknown>,
  mapDetailRaw?: unknown,
  route?: OrchestratorActiveRoute | null
): string | null {
  const facilitySnap = parseSnapshotJson(row.facilitySnapshot)
  const fromRoute =
    pickString(
      row.parkLabel,
      row.parkName,
      row.startLocationLabel,
      facilitySnap.name,
      facilitySnap.label,
      facilitySnap.address
    ) || null

  if (fromRoute) return fromRoute

  const detail = asRecord(mapDetailRaw)
  const park = asRecord(detail.vehicleParkStart)
  const fromMap = pickString(park.label) || null
  if (fromMap) return fromMap

  const depotStop = route?.stops.find((stop) => stop.kind === 'depot_start')
  if (depotStop?.locationLabel?.trim()) return depotStop.locationLabel.trim()
  if (depotStop?.label?.trim() && depotStop.label !== 'Park / başlangıç') {
    return depotStop.label.trim()
  }

  return null
}

export type RouteHeaderFields = {
  shiftStart: string | null
  shiftEnd: string | null
  parkLabel: string | null
  durationPlannedMin: number | null
  durationActualMin: number | null
  createdAt: string | null
  createdBy: string | null
  routeType: PlanningRouteType | null
  status: PlanningRouteStatus | null
}

export function extractRouteHeaderFields(
  raw: unknown,
  mapDetailRaw?: unknown,
  route?: OrchestratorActiveRoute | null
): RouteHeaderFields {
  const row = asRecord(raw)
  const { shiftStart, shiftEnd } = extractShiftTimes(row)

  const plannedSec = pickNumber(row.plannedDurationSec)
  const durationPlannedMin =
    secondsToDurationMin(plannedSec) ??
    (route?.durationMin != null && route.durationMin > 0 ? route.durationMin : null)

  const actualSec = pickNumber(row.actualDurationSec)
  const durationActualMin =
    secondsToDurationMin(actualSec) ??
    pickNumber(row.actualDurationMin, row.durationActualMin, row.realizedDurationMin)

  const createdAt =
    pickString(row.createdAt, row.created_at, row.olusturulma_zamani) || null

  const createdBy =
    pickString(
      row.createdByName,
      row.createdBy,
      row.created_by,
      row.olusturan,
      asRecord(row.createdByUser).fullName,
      asRecord(row.createdByUser).name
    ) || null

  const routeType = mapRawToPlanningRouteType(
    pickString(row.routeType, row.rota_tipi, row.method, row.deliveryMethod) || 'Karışık'
  )

  const status = route
    ? mapRawToPlanningStatus(row.status, route.status)
    : mapRawToPlanningStatus(row.status, 'planlandi')

  return {
    shiftStart,
    shiftEnd,
    parkLabel: extractParkLabel(row, mapDetailRaw, route),
    durationPlannedMin,
    durationActualMin,
    createdAt,
    createdBy,
    routeType,
    status,
  }
}
