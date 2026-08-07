import { getOrderTypeFieldConfig } from '../new/_lib/order-create-helpers'
import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import type {
  LastmileOrder,
  OrderListScope,
  OrderStatusScope,
  OrderType,
  OrderTypeScope,
} from '../_types/order'
import { formatOrderHacim } from './volume-units'

/** Dağıtım sekmesi: standart dağıtım + Gel-Al + kurulumlu */
const DAGITIM_TYPES: OrderType[] = ['dagitim', 'gel_al', 'kurulumlu_teslimat']

export function matchesTypeScope(order: LastmileOrder, typeScope: OrderTypeScope): boolean {
  switch (typeScope) {
    case 'all':
      return true
    case 'dagitim':
      return DAGITIM_TYPES.includes(order.siparis_tipi)
    case 'toplama':
      return order.siparis_tipi === 'toplama'
    case 'iade':
      return order.siparis_tipi === 'iade'
    case 'transfer':
      return order.siparis_tipi === 'transfer'
    case 'degisim':
      return order.siparis_tipi === 'degisim'
    default:
      return true
  }
}

export function matchesStatusScopes(
  order: LastmileOrder,
  statusScopes: OrderStatusScope[]
): boolean {
  if (statusScopes.length === 0) return true

  return statusScopes.some((scope) => {
    if (scope === 'iptal') return order.durum === 'iptal_edildi'
    if (scope === 'atanmayan')
      return !order.rota_atandi && order.durum !== 'iptal_edildi'
    return false
  })
}

export function matchesOrderScope(order: LastmileOrder, scope: OrderListScope): boolean {
  return matchesTypeScope(order, scope.typeScope) && matchesStatusScopes(order, scope.statusScopes)
}

export function countOrdersByTypeScope(
  orders: LastmileOrder[],
  statusScopes: OrderStatusScope[]
): Record<OrderTypeScope, number> {
  const types: OrderTypeScope[] = ['all', 'dagitim', 'toplama', 'iade', 'transfer', 'degisim']

  return types.reduce(
    (acc, typeScope) => {
      acc[typeScope] = orders.filter(
        (order) =>
          matchesTypeScope(order, typeScope) && matchesStatusScopes(order, statusScopes)
      ).length
      return acc
    },
    {} as Record<OrderTypeScope, number>
  )
}

export function countOrdersByStatusScope(
  orders: LastmileOrder[],
  typeScope: OrderTypeScope
): Record<OrderStatusScope, number> {
  const statuses: OrderStatusScope[] = ['iptal', 'atanmayan']

  return statuses.reduce(
    (acc, statusScope) => {
      acc[statusScope] = orders.filter(
        (order) =>
          matchesTypeScope(order, typeScope) && matchesStatusScopes(order, [statusScope])
      ).length
      return acc
    },
    {} as Record<OrderStatusScope, number>
  )
}

const GLOBAL_SEARCH_KEYS: (keyof LastmileOrder)[] = [
  'takip_no',
  'referans_no',
  'varis_muhatabi',
  'alis_muhatabi',
  'varis_telefon',
  'alis_telefon',
]

function matchesGlobalSearch(order: LastmileOrder, query: string): boolean {
  const normalized = query.trim().toLocaleLowerCase('tr-TR')
  if (!normalized) return true

  return GLOBAL_SEARCH_KEYS.some((key) =>
    String(order[key] ?? '')
      .toLocaleLowerCase('tr-TR')
      .includes(normalized)
  )
}

function matchesColumnFilter(order: LastmileOrder, filterId: string, value: unknown): boolean {
  if (filterId === 'durum' || filterId === 'bolge' || filterId === 'atanan_kurye' || filterId === 'siparis_tipi') {
    const selected = Array.isArray(value) ? (value as string[]) : []
    if (selected.length === 0) return true

    if (filterId === 'atanan_kurye') {
      const courier = order.atanan_kurye ?? 'Atanmadı'
      return selected.includes(courier)
    }

    return selected.includes(String(order[filterId as keyof LastmileOrder] ?? ''))
  }

  if (typeof value === 'string') {
    const needle = value.trim().toLocaleLowerCase('tr-TR')
    if (!needle) return true

    const field = order[filterId as keyof LastmileOrder]
    if (Array.isArray(field)) {
      return field.some((item) => String(item).toLocaleLowerCase('tr-TR').includes(needle))
    }

    return String(field ?? '')
      .toLocaleLowerCase('tr-TR')
      .includes(needle)
  }

  return true
}

/** "22.07.2026 10:15" → epoch ms for chronological sort */
function createdAtSortValue(value: string): number | null {
  const parsed = parseCreatedAt(value)
  if (!parsed) return null
  const [day, month, year] = parsed.date.split('.').map(Number)
  const [hour, minute] = parsed.time.split(':').map(Number)
  if ([day, month, year, hour, minute].some((part) => Number.isNaN(part))) return null
  return Date.UTC(year, month - 1, day, hour, minute)
}

function getSortComparable(order: LastmileOrder, columnId: string): string | number | null {
  switch (columnId) {
    case 'gorev_suresi':
      return order.gorev_suresi_dk
    case 'mesafe':
      return order.mesafe_m
    case 'eta':
      return order.eta_kalan_dk
    case 'atanan_kurye':
      return order.atanan_kurye ?? 'Atanmadı'
    case 'atanan_arac':
      return order.atanan_arac ?? 'Atanmadı'
    case 'alis_muhatabi':
      return formatContact(order.alis_muhatabi, order.alis_telefon)
    case 'varis_muhatabi':
      return formatContact(order.varis_muhatabi, order.varis_telefon)
    case 'paket_boyutu_adedi':
      return `${order.hacim_sinifi} ${order.paket_sayisi}`
    case 'toplam_hacim_agirlik':
      return order.toplam_hacim
    case 'gereksinimler':
      return order.gereksinimler.join(', ')
    case 'etiketler':
      return order.etiketler.join(', ')
    case 'olusturulma_zamani':
      return createdAtSortValue(order.olusturulma_zamani) ?? order.olusturulma_zamani
    default: {
      const value = order[columnId as keyof LastmileOrder]
      if (typeof value === 'number' || typeof value === 'string') return value
      if (value == null) return null
      if (Array.isArray(value)) return value.join(', ')
      return String(value)
    }
  }
}

function compareSortValues(
  left: string | number | null,
  right: string | number | null,
  desc: boolean
): number {
  if (left == null && right == null) return 0
  if (left == null) return desc ? 1 : -1
  if (right == null) return desc ? -1 : 1

  if (typeof left === 'number' && typeof right === 'number') {
    return desc ? right - left : left - right
  }

  const leftText = String(left)
  const rightText = String(right)
  if (leftText === rightText) return 0
  const cmp = leftText.localeCompare(rightText, 'tr')
  return desc ? -cmp : cmp
}

export function queryOrders({
  rows,
  scope,
  pagination,
  sorting,
  columnFilters,
  globalFilter,
}: {
  rows: LastmileOrder[]
  scope: OrderListScope
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
  globalFilter: string
}) {
  let filtered = rows.filter((row) => matchesOrderScope(row, scope))

  if (globalFilter) {
    filtered = filtered.filter((row) => matchesGlobalSearch(row, globalFilter))
  }

  for (const filter of columnFilters) {
    filtered = filtered.filter((row) => matchesColumnFilter(row, filter.id, filter.value))
  }

  if (sorting.length > 0) {
    const [{ id, desc }] = sorting
    filtered.sort((a, b) =>
      compareSortValues(getSortComparable(a, id), getSortComparable(b, id), desc)
    )
  }

  const totalRows = filtered.length
  const start = pagination.pageIndex * pagination.pageSize
  const end = start + pagination.pageSize

  return {
    rows: filtered.slice(start, end),
    totalRows,
  }
}

export function formatDistance(meters: number): string {
  if (meters <= 0) return '—'
  if (meters < 1000) return `${meters} m`
  return `${(meters / 1000).toFixed(1).replace(/\.0$/, '')} km`
}

export function formatTaskDuration(minutes: number, _orderType?: OrderType): string {
  return `${minutes} dk`
}

/** Route orchestrator kartı — kompakt paket / hacim özeti */
export function formatOrderCardPackageSummary(order: LastmileOrder): string {
  if (order.siparis_tipi === 'degisim' && order.giden_paket != null && order.donen_paket != null) {
    return `${order.hacim_sinifi} · ${order.giden_paket} giden · ${order.donen_paket} dönen`
  }

  const lines = order.paket_satirlari?.filter((line) => line.adet > 0) ?? []
  if (lines.length > 1) {
    const mixedSizes = lines.map((line) => `${line.adet}${line.size}`).join('+')
    return `${mixedSizes} · ${order.paket_sayisi}pkt`
  }

  return `${order.hacim_sinifi} · ${order.paket_sayisi}pkt`
}

export function formatPackageSize(order: LastmileOrder): { size: string; count: string } {
  if (order.siparis_tipi === 'degisim' && order.giden_paket != null && order.donen_paket != null) {
    return {
      size: order.hacim_sinifi,
      count: `${order.giden_paket} giden / ${order.donen_paket} dönen`,
    }
  }

  const lines = order.paket_satirlari?.filter((line) => line.adet > 0) ?? []
  if (lines.length > 1) {
    return {
      size: lines.map((line) => line.size).join(' · '),
      count: lines.map((line) => `${line.adet} adet`).join(' · '),
    }
  }

  if (lines.length === 1) {
    return {
      size: lines[0].size,
      count: `${lines[0].adet} adet`,
    }
  }

  return {
    size: order.hacim_sinifi,
    count: `${order.paket_sayisi} adet`,
  }
}

export function formatVolumeWeight(order: LastmileOrder): {
  volume: string
  weight: string
} {
  return {
    volume: formatOrderHacim(order.toplam_hacim),
    weight: `${order.agirlik_kg} kg`,
  }
}

/** "22.07.2026 10:15" → tarih + saat */
export function parseCreatedAt(value: string): { date: string; time: string } | null {
  const match = value.trim().match(/^(\d{2}\.\d{2}\.\d{4})\s+(\d{2}:\d{2})$/)
  if (!match) return null
  return { date: match[1], time: match[2] }
}

/** "API (Modanisa)" → kanal + kaynak; düz isim → tek satır */
export function parseCreator(value: string): { title: string; detail: string | null } {
  const match = value.trim().match(/^(.+?)\s*\((.+)\)$/u)
  if (!match) {
    return { title: value, detail: null }
  }
  return { title: match[1].trim(), detail: match[2].trim() }
}

export function formatContact(name: string, phone: string): string {
  return `${name} (${phone})`
}

/** Konum satırı: Mh → Müşteri, Gel-Al → Gel-Al */
export function getLocationDisplay(value: string): { title: string; detail: string | null } {
  const title = value.replace(/\s*\([^)]*\)\s*$/u, '').trim()
  if (/gel[\s-]?al|gelal/iu.test(title)) {
    return { title, detail: 'Gel-Al' }
  }
  if (/\bMh\.?\b/iu.test(title)) {
    return { title, detail: 'Müşteri' }
  }
  return { title, detail: null }
}

export type OrderRouteEndpointKind = 'tesis' | 'adres' | 'gel_al'

export function getOrderRouteEndpointKinds(order: Pick<LastmileOrder, 'siparis_tipi'>): {
  from: OrderRouteEndpointKind
  to: OrderRouteEndpointKind
} {
  const config = getOrderTypeFieldConfig(order.siparis_tipi)
  return {
    from: config.alisMode === 'facility' ? 'tesis' : 'adres',
    to:
      config.varisMode === 'facility'
        ? 'tesis'
        : config.varisMode === 'gel_al'
          ? 'gel_al'
          : 'adres',
  }
}

/** "22.07.2026 - 14:00 - 16:00" → { date, timeRange } */
export function parseSlaWindow(value: string): { date: string; timeRange: string } | null {
  const match = value.trim().match(/^(\d{2}\.\d{2}\.\d{4})\s*[-–]\s*(\d{2}:\d{2})\s*[-–]\s*(\d{2}:\d{2})$/)
  if (!match) return null
  return {
    date: match[1],
    timeRange: `${match[2]} – ${match[3]}`,
  }
}

/** Liste hücresi: tarih üstte, alım/teslim saat aralıkları altta. */
export function parsePickupDeliverySchedule(
  pickupWindow: string,
  deliveryWindow: string
): { date: string; lines: string[] } | null {
  const pickup = pickupWindow && pickupWindow !== '—' ? parseSlaWindow(pickupWindow) : null
  const delivery = deliveryWindow && deliveryWindow !== '—' ? parseSlaWindow(deliveryWindow) : null
  if (!pickup && !delivery) return null

  const date = pickup?.date || delivery?.date || ''
  const lines: string[] = []
  if (pickup) lines.push(`Alım ${pickup.timeRange}`)
  if (delivery) {
    const sameDay = !pickup || pickup.date === delivery.date
    lines.push(sameDay ? `Teslim ${delivery.timeRange}` : `Teslim ${delivery.date} ${delivery.timeRange}`)
  }

  return { date, lines }
}

export type EtaDisplay = {
  time: string
  detail: string | null
  tone: 'default' | 'late' | 'done' | 'remaining' | 'waiting'
}

export function getEtaDisplay(order: LastmileOrder): EtaDisplay {
  if (!order.eta_alim_yapildi) {
    return { time: 'Alım bekleniyor', detail: null, tone: 'waiting' }
  }

  if (!order.eta || order.eta === '—') {
    return { time: 'Hesaplanıyor', detail: null, tone: 'default' }
  }

  if (order.durum === 'teslim_edildi') {
    return { time: order.eta, detail: 'Tamamlandı', tone: 'done' }
  }

  if (order.eta_kalan_dk == null) {
    return { time: order.eta, detail: 'Alımdan sonra', tone: 'default' }
  }

  if (order.eta_kalan_dk < 0) {
    return {
      time: order.eta,
      detail: `${Math.abs(order.eta_kalan_dk)} dk gecikti`,
      tone: 'late',
    }
  }

  return {
    time: order.eta,
    detail: `${order.eta_kalan_dk} dk kaldı`,
    tone: 'remaining',
  }
}

/** Sıralama / düz metin için */
export function formatEta(order: LastmileOrder): string {
  const eta = getEtaDisplay(order)
  return eta.detail ? `${eta.time} ${eta.detail}` : eta.time
}

export function formatPriority(score: number): string {
  return String(score)
}
