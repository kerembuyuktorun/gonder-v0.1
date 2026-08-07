import type { LastmileOrder, OrderStatus, OrderType } from '../../_types/order'
import type {
  OrderAuditLogItem,
  OrderDetail,
  OrderPackageLine,
  OrderTimelineStep,
  PackageLineStatus,
  TimelineStepStatus,
} from '../_types/order-detail'

export function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return Promise.resolve(false)
  }
  return navigator.clipboard.writeText(text).then(
    () => true,
    () => false
  )
}

export function packageStatusLabel(status: PackageLineStatus): string {
  const labels: Record<PackageLineStatus, string> = {
    olusturuldu: 'Oluşturuldu',
    alindi: 'Alındı',
    yolda: 'Yolda',
    teslim_edildi: 'Teslim Edildi',
    teslim_alindi: 'Teslim Alındı',
    teslim_edilemedi: 'Teslim Edilemedi',
    iptal: 'İptal',
    reddedildi: 'Reddedildi',
  }
  return labels[status]
}

export function packageKindLabel(kind: OrderPackageLine['kind']): string {
  if (kind === 'giden') return 'Giden'
  if (kind === 'donen') return 'Dönen'
  return 'Standart'
}

export function timelineStatusClass(status: TimelineStepStatus): string {
  switch (status) {
    case 'done':
      return 'border-secondary bg-secondary'
    case 'current':
      return 'border-primary bg-primary shadow-[0_0_0_3px] shadow-primary/25'
    case 'cancelled':
      return 'border-destructive bg-destructive'
    default:
      return 'border-slate-200 bg-white'
  }
}

export const TIMELINE_LABEL_BY_KEY: Record<string, string> = {
  CREATED: 'Oluşturuldu',
  PACKAGE_RECEIVED: 'Paket Alındı',
  READY_FOR_PLANNING: 'Planlamaya Hazır',
  PLANNED: 'Planlandı',
  ASSIGNED_TO_ROUTE: 'Rotaya Atandı',
  OUT_FOR_DELIVERY: 'Yolda',
  OUT_FOR_PICKUP: 'Toplamada',
  IN_TRANSIT: 'Taşımada',
  HANDOVER: 'Devredildi',
  COMPLETED: 'Teslim Edildi',
  RETURN_RECEIVED: 'İade Alındı',
  RETURNED: 'İade Edildi',
  FAILED: 'Teslim Edilemedi',
  CANCELED: 'İptal Edildi',
  CANCELLED: 'İptal Edildi',
  MIXED: 'Karma Durum',
}

type SkeletonStep = { key: string; label: string }

function skeletonForType(type: OrderType): SkeletonStep[] {
  if (type === 'toplama') {
    return [
      { key: 'CREATED', label: 'Oluşturuldu' },
      { key: 'ASSIGNED_TO_ROUTE', label: 'Rotaya Atandı' },
      { key: 'OUT_FOR_PICKUP', label: 'Toplamada' },
      { key: 'PACKAGE_RECEIVED', label: 'Paket Alındı' },
      { key: 'COMPLETED', label: 'Toplandı' },
    ]
  }

  if (type === 'iade') {
    return [
      { key: 'CREATED', label: 'Oluşturuldu' },
      { key: 'ASSIGNED_TO_ROUTE', label: 'Rotaya Atandı' },
      { key: 'OUT_FOR_PICKUP', label: 'Toplamada' },
      { key: 'PACKAGE_RECEIVED', label: 'Paket Alındı' },
      { key: 'RETURN_RECEIVED', label: 'İade Alındı' },
    ]
  }

  if (type === 'transfer') {
    return [
      { key: 'CREATED', label: 'Oluşturuldu' },
      { key: 'ASSIGNED_TO_ROUTE', label: 'Rotaya Atandı' },
      { key: 'PACKAGE_RECEIVED', label: 'Paket Alındı' },
      { key: 'OUT_FOR_DELIVERY', label: 'Yolda' },
      { key: 'HANDOVER', label: 'Devredildi' },
      { key: 'COMPLETED', label: 'Teslim Edildi' },
    ]
  }

  if (type === 'degisim') {
    return [
      { key: 'CREATED', label: 'Oluşturuldu' },
      { key: 'ASSIGNED_TO_ROUTE', label: 'Rotaya Atandı' },
      { key: 'PACKAGE_RECEIVED', label: 'Paket Alındı' },
      { key: 'OUT_FOR_DELIVERY', label: 'Yolda' },
      { key: 'COMPLETED', label: 'Değişim Tamamlandı' },
    ]
  }

  // dagitim + diğerleri
  return [
    { key: 'CREATED', label: 'Oluşturuldu' },
    { key: 'ASSIGNED_TO_ROUTE', label: 'Rotaya Atandı' },
    { key: 'PACKAGE_RECEIVED', label: 'Paket Alındı' },
    { key: 'OUT_FOR_DELIVERY', label: 'Yolda' },
    { key: 'COMPLETED', label: 'Teslim Edildi' },
  ]
}

/**
 * Adım ilerleme sırası (yüksek = daha ileri).
 * Akış: oluştur → rotaya ata → alım noktasından al → yolda → teslim.
 */
export const TIMELINE_STEP_RANK: Record<string, number> = {
  CREATED: 10,
  READY_FOR_PLANNING: 20,
  PLANNED: 30,
  ASSIGNED_TO_ROUTE: 30,
  OUT_FOR_PICKUP: 40,
  PACKAGE_RECEIVED: 45,
  OUT_FOR_DELIVERY: 50,
  IN_TRANSIT: 55,
  HANDOVER: 60,
  COMPLETED: 70,
  RETURN_RECEIVED: 70,
  RETURNED: 70,
  FAILED: 70,
  CANCELED: 80,
  CANCELLED: 80,
}

function rankForAggregated(status: OrderStatus, assigned: boolean): number {
  if (status === 'iptal_edildi') return 80
  if (status === 'teslim_edildi') return 70
  if (status === 'yolda') return 50
  if (status === 'planlandi' || assigned) return 30
  return 10
}

/**
 * Tip ve duruma göre last-mile çizelge iskeleti.
 * BE `statusTimeline` yoksa kullanılır; actor bilgisi `olusturan` / kurye ile doldurulur.
 */
export function buildDefaultTimeline(
  order: LastmileOrder & {
    rota?: { rota_id?: string | null; kurye_adi?: string | null }
  },
  createdAt: string
): OrderTimelineStep[] {
  const assigned = Boolean(order.rota?.rota_id)
  const progressRank = rankForAggregated(order.durum, assigned)
  const creator = order.olusturan && order.olusturan !== '—' ? order.olusturan : undefined
  const courier =
    order.atanan_kurye && order.atanan_kurye !== '—'
      ? order.atanan_kurye
      : order.rota?.kurye_adi && order.rota.kurye_adi !== '—'
        ? order.rota.kurye_adi
        : undefined

  if (order.durum === 'iptal_edildi') {
    return [
      {
        id: 'CREATED',
        label: 'Oluşturuldu',
        timestamp: createdAt,
        status: 'done',
        actor: creator,
      },
      {
        id: 'CANCELED',
        label: 'İptal Edildi',
        timestamp: createdAt,
        status: 'cancelled',
        description: 'Sipariş iptal edildi',
      },
    ]
  }

  const skeleton = skeletonForType(order.siparis_tipi)
  const steps = skeleton.map((item) => {
    const rank = TIMELINE_STEP_RANK[item.key] ?? 0
    let status: TimelineStepStatus = 'upcoming'
    if (rank < progressRank) status = 'done'
    else if (rank === progressRank) status = 'current'
    else if (progressRank >= 70 && rank >= 70) status = 'done'

    const timestamp =
      status === 'done' || status === 'current'
        ? item.key === 'CREATED'
          ? createdAt
          : null
        : null

    let actor: string | undefined
    if (item.key === 'CREATED') actor = creator
    if (
      (item.key === 'OUT_FOR_DELIVERY' ||
        item.key === 'OUT_FOR_PICKUP' ||
        item.key === 'HANDOVER' ||
        item.key === 'COMPLETED' ||
        item.key === 'RETURN_RECEIVED') &&
      (status === 'done' || status === 'current')
    ) {
      actor = courier
    }

    return {
      id: item.key,
      label: item.label,
      timestamp,
      status,
      actor,
    } satisfies OrderTimelineStep
  })

  // Son tamamlanan adımı current yap (terminal hariç)
  const lastDoneOrCurrent = [...steps]
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.status === 'done' || s.status === 'current')
    .at(-1)

  if (lastDoneOrCurrent && order.durum !== 'teslim_edildi') {
    return steps.map((step, index) => {
      if (index === lastDoneOrCurrent.i) return { ...step, status: 'current' as const }
      if (step.status === 'current' && index !== lastDoneOrCurrent.i) {
        return { ...step, status: 'done' as const }
      }
      return step
    })
  }

  return steps
}

const MOVEMENT_TO_TIMELINE_KEY: Array<{ match: RegExp; key: string }> = [
  { match: /ORDER_CREATE|CREATED|oluşturuldu/i, key: 'CREATED' },
  { match: /PACKAGE_RECEIV|paket alındı/i, key: 'PACKAGE_RECEIVED' },
  { match: /READY_FOR_PLAN|PLANNING|planlamaya hazır/i, key: 'READY_FOR_PLANNING' },
  { match: /ASSIGN|ROUTE_ITEM|ADD_TO_ROUTE|rotaya atandı/i, key: 'ASSIGNED_TO_ROUTE' },
  { match: /OUT_FOR_PICKUP|ROUTE_PICKUP|teslim alındı/i, key: 'OUT_FOR_PICKUP' },
  {
    match: /OUT_FOR_DELIVERY|IN_TRANSIT|TRIP_LOAD|ROUTE_START|yolda|yüklendi/i,
    key: 'OUT_FOR_DELIVERY',
  },
  { match: /HANDOVER|devredildi/i, key: 'HANDOVER' },
  { match: /RETURN_RECEIV|RETURNED|iade/i, key: 'RETURN_RECEIVED' },
  { match: /ROUTE_DELIVER|DELIVER|COMPLETE|teslim edildi/i, key: 'COMPLETED' },
  { match: /FAIL|UNDELIVER|teslim edilemedi/i, key: 'FAILED' },
  { match: /CANCEL|iptal/i, key: 'CANCELED' },
]

function timelineKeyFromMovementAction(action: string): string | null {
  for (const rule of MOVEMENT_TO_TIMELINE_KEY) {
    if (rule.match.test(action)) return rule.key
  }
  return null
}

const NON_PERSON_ACTORS = new Set(['—', 'Sistem', 'API', 'Kurye'])

/**
 * Hareketler / oluşturan / kurye bilgisinden çizelge adımlarına actor yazar.
 */
export function enrichTimelineActors(
  steps: OrderTimelineStep[],
  opts: {
    olusturan?: string
    kuryeAdi?: string | null
    movements?: OrderAuditLogItem[]
  }
): OrderTimelineStep[] {
  const actorByKey = new Map<string, string>()
  const genericActorByKey = new Map<string, string>()

  for (const movement of opts.movements ?? []) {
    const key = timelineKeyFromMovementAction(movement.actionType || movement.action)
    if (!key || !movement.actor) continue
    if (NON_PERSON_ACTORS.has(movement.actor)) {
      genericActorByKey.set(key, movement.actor)
    } else {
      actorByKey.set(key, movement.actor)
    }
  }

  return steps.map((step) => {
    const key = step.id.toUpperCase()
    let actor = step.actor

    if (actorByKey.has(key)) {
      actor = actorByKey.get(key)
    } else if (!actor) {
      if (key === 'CREATED' && opts.olusturan && opts.olusturan !== '—') {
        actor = opts.olusturan
      } else if (
        (key === 'OUT_FOR_DELIVERY' ||
          key === 'OUT_FOR_PICKUP' ||
          key === 'IN_TRANSIT' ||
          key === 'HANDOVER' ||
          key === 'COMPLETED' ||
          key === 'RETURN_RECEIVED') &&
        opts.kuryeAdi &&
        opts.kuryeAdi !== '—' &&
        (step.status === 'done' || step.status === 'current')
      ) {
        actor = opts.kuryeAdi
      } else {
        actor = genericActorByKey.get(key)
      }
    }

    return actor ? { ...step, actor } : step
  })
}

/**
 * “Rotaya atandı” — `aggregatedStatus` PLANNED veya isRouteAssigned / activeRoute.
 */
export function isOrderAssigned(
  order: Pick<OrderDetail, 'rota' | 'timeline' | 'rota_atandi' | 'durum'>
): boolean {
  if (order.rota_atandi) return true
  if (order.durum === 'planlandi') return true
  if (order.rota.rota_id) return true
  return order.timeline.some(
    (step) =>
      step.id.toUpperCase() === 'ASSIGNED_TO_ROUTE' &&
      (step.status === 'done' || step.status === 'current')
  )
}

export function orderTypeSupportsSwapPackages(type: OrderType): boolean {
  return type === 'degisim'
}
