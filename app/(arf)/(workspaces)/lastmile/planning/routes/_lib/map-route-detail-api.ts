import type { OrderAuditLogItem } from '../../../orders/[id]/_types/order-detail'
import type { RouteNoteItem, RouteNoteVisibility } from '../_types/planning-route-detail'

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {}
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function formatActivityTimestamp(raw: unknown): string {
  const value = pickString(raw)
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const VISIBILITY_FROM_BE: Record<string, RouteNoteVisibility> = {
  EVERYONE: 'everyone',
  DISPATCHER: 'dispatcher',
  OPERATION: 'operation',
}

export function mapRouteNoteFromBe(raw: unknown): RouteNoteItem | null {
  const row = asRecord(raw)
  const id = pickString(row.id)
  if (!id) return null

  const visibilityRaw = pickString(row.visibility).toUpperCase()
  const visibility = VISIBILITY_FROM_BE[visibilityRaw] ?? 'dispatcher'

  return {
    id,
    note: pickString(row.note, row.content),
    visibility,
    authorName: pickString(row.authorName, row.createdByName, row.author, '—'),
    createdUserId: pickString(row.createdUserId, row.createdBy) || null,
    createdAt: pickString(row.createdAt, row.created_at) || new Date().toISOString(),
  }
}

export function mapRouteActivityFromBe(raw: unknown): OrderAuditLogItem | null {
  const row = asRecord(raw)
  const id = pickString(row.id, row.eventId)
  if (!id) return null

  const source = pickString(row.source, row.sourceType).toUpperCase()
  const sourceLabel =
    source === 'ROUTE_NOTE'
      ? 'Rota Notu'
      : source === 'ROUTE'
        ? 'ROTA'
        : source || 'ROUTE'

  return {
    id,
    timestamp: formatActivityTimestamp(row.createdAt ?? row.timestamp ?? row.occurredAt),
    actor: pickString(row.performerName, row.actor, row.actorName, '—'),
    action: pickString(row.actionLabel, row.action, row.eventLabel, row.eventKey, '—'),
    actionType: pickString(row.actionType, row.eventKey, row.action, 'ROUTE_EVENT'),
    sourceLabel,
    itemCode: pickString(row.itemCode, row.routeCode, row.code),
    location: pickString(row.location, row.region),
    ip: pickString(row.clientIp, row.ip, '—'),
  }
}

export function visibilityToBe(visibility: RouteNoteVisibility): string {
  switch (visibility) {
    case 'everyone':
      return 'EVERYONE'
    case 'operation':
      return 'OPERATION'
    default:
      return 'DISPATCHER'
  }
}
