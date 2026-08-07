import { lastmileClientRequest } from '../../new/_api/client'
import { mapBackendOrderDetail, mapMovementToAuditItem } from '../_lib/map-order-detail'
import type {
  OrderAuditLogItem,
  OrderDetail,
  OrderNoteType,
  OrderOperationNote,
} from '../_types/order-detail'

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : {}
}

function asString(input: unknown): string {
  return typeof input === 'string' || typeof input === 'number' ? String(input).trim() : ''
}

function mapOrderNote(raw: unknown, index = 0): OrderOperationNote | null {
  const row = asRecord(raw)
  const note = asString(row.note || row.content || row.text)
  if (!note) return null

  const creator = asRecord(
    row.createdUserSnapshot || row.createdByUser || row.author || row.user
  )
  const createdByRaw = row.createdBy
  const createdByRecord =
    createdByRaw && typeof createdByRaw === 'object' && !Array.isArray(createdByRaw)
      ? asRecord(createdByRaw)
      : {}
  const author =
    `${asString(creator.firstName || createdByRecord.firstName)} ${asString(creator.lastName || createdByRecord.lastName)}`.trim() ||
    asString(
      row.createdByName ||
        row.authorName ||
        row.userName ||
        creator.fullName ||
        creator.displayName ||
        creator.name ||
        createdByRecord.name ||
        creator.email ||
        (typeof createdByRaw === 'string' ? createdByRaw : '')
    ) ||
    'Operasyon Ekibi'

  const role =
    asString(
      creator.userType ||
        creator.user_type ||
        creator.role ||
        creator.roleName ||
        createdByRecord.userType ||
        createdByRecord.role ||
        row.createdByRole ||
        row.authorRole ||
        row.userType ||
        row.role
    ) || undefined

  const createdById =
    asString(
      creator.id ||
        creator.userId ||
        createdByRecord.id ||
        createdByRecord.userId ||
        row.createdById ||
        row.userId ||
        (typeof createdByRaw === 'string' ? createdByRaw : '')
    ) || undefined

  return {
    id: asString(row.id || row.noteId) || `note-${index}-${note.slice(0, 12)}`,
    note,
    author,
    role,
    createdById,
    createdAt: asString(row.createdAt || row.createdDate || row.insertedAt),
    noteType: asString(row.noteType).toUpperCase() === 'COURIER' ? 'COURIER' : 'INTERNAL',
  }
}

export async function fetchOrderDetail(id: string): Promise<
  | { success: true; data: OrderDetail }
  | { success: false; error: string; status?: number }
> {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/orders/${encodeURIComponent(id)}`,
    { method: 'GET' }
  )

  if (!result.success) {
    return { success: false, error: result.error }
  }

  const detail = mapBackendOrderDetail(result.data)
  if (!detail.id) {
    return { success: false, error: 'Sipariş detayı okunamadı.' }
  }

  return { success: true, data: detail }
}

export async function cancelOrder(
  id: string,
  reason?: string
): Promise<{ success: true } | { success: false; error: string; code?: string }> {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/orders/${encodeURIComponent(id)}/cancel`,
    {
      method: 'POST',
      body: JSON.stringify(reason ? { reason } : {}),
    }
  )

  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }
  return { success: true }
}

export async function completeOrder(
  id: string,
  itemIds?: string[]
): Promise<{ success: true } | { success: false; error: string; code?: string }> {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/orders/${encodeURIComponent(id)}/complete`,
    {
      method: 'POST',
      body: JSON.stringify(itemIds?.length ? { itemIds } : {}),
    }
  )

  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }
  return { success: true }
}

export async function handoverOrder(
  id: string,
  itemIds?: string[]
): Promise<{ success: true } | { success: false; error: string; code?: string }> {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/orders/${encodeURIComponent(id)}/handover`,
    {
      method: 'POST',
      body: JSON.stringify(itemIds?.length ? { itemIds } : {}),
    }
  )

  if (!result.success) {
    return { success: false, error: result.error, code: result.code }
  }
  return { success: true }
}

export async function fetchOrderMovements(
  id: string,
  opts?: { page?: number; pageSize?: number }
): Promise<
  | { success: true; data: { items: OrderAuditLogItem[]; total: number } }
  | { success: false; error: string }
> {
  const params = new URLSearchParams()
  params.set('page', String(opts?.page ?? 1))
  params.set('pageSize', String(opts?.pageSize ?? 50))

  const result = await lastmileClientRequest<{
    movements?: unknown[]
    total?: number
  }>(`/api/lastmile/orders/${encodeURIComponent(id)}/movements?${params.toString()}`, {
    method: 'GET',
  })

  if (!result.success) {
    return { success: false, error: result.error }
  }

  const movements = result.data.movements ?? []
  return {
    success: true,
    data: {
      items: movements.map(mapMovementToAuditItem),
      total: Number(result.data.total ?? movements.length),
    },
  }
}

export async function fetchOrderNotes(
  id: string,
  noteType: OrderNoteType = 'INTERNAL'
): Promise<
  | { success: true; data: OrderOperationNote[] }
  | { success: false; error: string }
> {
  const result = await lastmileClientRequest<{ items?: unknown[] }>(
    `/api/lastmile/orders/${encodeURIComponent(id)}/notes?noteType=${encodeURIComponent(noteType)}`,
    { method: 'GET' }
  )

  if (!result.success) return { success: false, error: result.error }

  const items = (result.data.items ?? [])
    .map(mapOrderNote)
    .filter((note): note is OrderOperationNote => note != null)
    .sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime()
      const rightTime = new Date(right.createdAt).getTime()
      if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) return 0
      return leftTime - rightTime
    })

  return { success: true, data: items }
}

export async function createOrderNote(
  id: string,
  note: string,
  noteType: OrderNoteType = 'INTERNAL'
): Promise<
  | { success: true; data: OrderOperationNote | null }
  | { success: false; error: string }
> {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/orders/${encodeURIComponent(id)}/notes`,
    {
      method: 'POST',
      body: JSON.stringify({ note, noteType }),
    }
  )

  if (!result.success) return { success: false, error: result.error }
  return { success: true, data: mapOrderNote(result.data) }
}

export async function updateOrderNote(
  noteId: string,
  note: string,
  noteType?: OrderNoteType
): Promise<
  | { success: true; data: OrderOperationNote | null }
  | { success: false; error: string }
> {
  const result = await lastmileClientRequest<unknown>(
    `/api/lastmile/order-notes/${encodeURIComponent(noteId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(noteType ? { note, noteType } : { note }),
    }
  )

  if (!result.success) return { success: false, error: result.error }
  return { success: true, data: mapOrderNote(result.data) }
}

export type LiveTrackingPayload = {
  orderId?: string
  points?: Array<{
    latitude?: number
    longitude?: number
    occurredAt?: string
    label?: string
  }>
  courierLastPosition?: {
    latitude?: number
    longitude?: number
    occurredAt?: string
    label?: string
  } | null
  bounds?: {
    minLat?: number
    maxLat?: number
    minLng?: number
    maxLng?: number
  }
}

export async function fetchLiveTracking(
  id: string
): Promise<
  | { success: true; data: LiveTrackingPayload }
  | { success: false; error: string }
> {
  const result = await lastmileClientRequest<LiveTrackingPayload>(
    `/api/lastmile/orders/${encodeURIComponent(id)}/live-tracking`,
    { method: 'GET' }
  )

  if (!result.success) {
    return { success: false, error: result.error }
  }

  return { success: true, data: result.data }
}
