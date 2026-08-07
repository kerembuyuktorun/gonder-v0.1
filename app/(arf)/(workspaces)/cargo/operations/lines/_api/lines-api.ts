import { mockLineLocations, mockLines, mockLinesKpi } from "../_mock/lines-mock-data"
import { mockLineAuditLogsByLineId } from "../_mock/line-audit-log-mock-data"
import { generateLineName } from "../_lib/line-name-generator"
import { validateLineRules } from "../_lib/line-rules-validator"
import type { LineAuditAction, LineAuditLogEntry, LineFormState, LineListKpi, LineRecord, LocationOption } from "../_types"

let linesDb: LineRecord[] = [...mockLines]
let lineAuditDb: Record<string, LineAuditLogEntry[]> = Object.fromEntries(
  Object.entries(mockLineAuditLogsByLineId).map(([lineId, logs]) => [lineId, logs.map((log) => ({ ...log }))]),
)

function addLineAuditLog(
  lineId: string,
  action: LineAuditAction,
  description: string,
  actorName = "Sistem",
) {
  const entry: LineAuditLogEntry = {
    id: `line-audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    lineId,
    actorName,
    action,
    description,
    timestamp: new Date().toISOString(),
    ipAddress: "192.168.1.5",
  }

  const current = lineAuditDb[lineId] ?? []
  lineAuditDb = {
    ...lineAuditDb,
    [lineId]: [entry, ...current],
  }
}

function mapFormToRecord(input: LineFormState, id?: string): LineRecord {
  const now = new Date().toISOString()
  const lineId = id ?? `line-${Date.now()}`
  const name = generateLineName(input.stops)

  return {
    id: lineId,
    name,
    type: input.type,
    status: "active",
    createdAt: id ? linesDb.find((item) => item.id === id)?.createdAt ?? now : now,
    updatedAt: now,
    schedule: {
      workDays: input.workDays,
      plannedDepartureTime: input.plannedDepartureTime,
      plannedArrivalTime: input.plannedArrivalTime,
    },
    stops: input.stops.map((stop, index) => ({
      id: stop.id,
      order: index + 1,
      locationId: stop.locationId,
      locationName: stop.locationName,
      locationType: stop.locationType,
      operationType: stop.operationType as "pickup_only" | "dropoff_only" | "pickup_dropoff",
    })),
  }
}

export async function fetchLines(): Promise<LineRecord[]> {
  return [...linesDb].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function fetchLineKpi(): Promise<LineListKpi> {
  return mockLinesKpi
}

export async function fetchLineById(id: string): Promise<LineRecord | null> {
  return linesDb.find((line) => line.id === id) ?? null
}

export async function fetchLineLocations(): Promise<LocationOption[]> {
  return mockLineLocations
}

export async function fetchLineAuditLogs(lineId: string): Promise<LineAuditLogEntry[]> {
  const logs = lineAuditDb[lineId] ?? []
  return [...logs].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export async function createLine(input: LineFormState): Promise<LineRecord> {
  const errors = validateLineRules(input.type, input.stops)
  if (errors.length > 0) {
    throw new Error(errors[0].message)
  }
  const created = mapFormToRecord(input)
  linesDb = [created, ...linesDb]
  addLineAuditLog(created.id, "line_created", `Hat oluşturuldu: ${created.name}`)
  return created
}

export async function updateLine(id: string, input: LineFormState): Promise<LineRecord> {
  const errors = validateLineRules(input.type, input.stops)
  if (errors.length > 0) {
    throw new Error(errors[0].message)
  }
  const updated = mapFormToRecord(input, id)
  linesDb = linesDb.map((line) => (line.id === id ? updated : line))
  addLineAuditLog(id, "line_updated", `Hat bilgileri güncellendi: ${updated.name}`)
  return updated
}

export async function toggleLineStatus(id: string): Promise<LineRecord | null> {
  const lineIndex = linesDb.findIndex((line) => line.id === id)

  if (lineIndex === -1) {
    return null
  }

  const currentLine = linesDb[lineIndex]
  const changed: LineRecord = {
    ...currentLine,
    status: currentLine.status === "active" ? "passive" : "active",
    updatedAt: new Date().toISOString(),
  }

  linesDb = linesDb.map((line, index) => (index === lineIndex ? changed : line))

  if (changed) {
    addLineAuditLog(
      id,
      "line_status_changed",
      `Hat durumu ${changed.status === "active" ? "Aktif" : "Pasif"} olarak güncellendi`,
    )
  }

  return changed
}

export async function deleteLine(id: string): Promise<void> {
  linesDb = linesDb.filter((line) => line.id !== id)
}
