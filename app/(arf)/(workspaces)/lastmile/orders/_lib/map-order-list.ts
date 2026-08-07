import type {
  LastmileOrder,
  OrderStatus,
  OrderType,
  OrderVolumeClass,
  RouteType,
} from '../_types/order'
import { mapSkillsFromRaw } from '../../_lib/skill-catalog'
import { resolveVolumeValueOrZero } from './volume-units'

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : {}
}

function asString(input: unknown, fallback = ''): string {
  if (typeof input === 'string') return input
  if (typeof input === 'number' && Number.isFinite(input)) return String(input)
  return fallback
}

function asNumber(input: unknown, fallback = 0): number {
  if (typeof input === 'number' && Number.isFinite(input)) return input
  if (typeof input === 'string' && input.trim()) {
    const parsed = Number(input)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function asNullableNumber(input: unknown): number | null {
  if (input == null || input === '') return null
  const value = asNumber(input, Number.NaN)
  return Number.isFinite(value) ? value : null
}

const TYPE_FROM_BE: Record<string, OrderType> = {
  DELIVERY: 'dagitim',
  PICKUP: 'toplama',
  RETURN: 'iade',
  TRANSFER: 'transfer',
  SWAP: 'degisim',
  GEL_AL: 'gel_al',
  INSTALL: 'kurulumlu_teslimat',
}

const METHOD_FROM_BE: Record<string, RouteType> = {
  STANDARD: 'Standart Rota',
  EXPRESS: 'Ekspres Rota',
  MILK_RUN: 'Toplama Ringi',
}

/**
 * BE `aggregatedStatus` → FE liste/detay badge bucket.
 * Not: ASSIGNED_TO_ROUTE aggregatedStatus’ta yok — rota için `activeRoute`.
 * Yolda: OUT_FOR_DELIVERY | OUT_FOR_PICKUP | IN_TRANSIT | HANDOVER
 */
const STATUS_FROM_BE: Record<string, OrderStatus> = {
  CREATED: 'atama_bekliyor',
  PACKAGE_RECEIVED: 'atama_bekliyor',
  READY_FOR_PLANNING: 'atama_bekliyor',
  PENDING_ASSIGNMENT: 'atama_bekliyor',
  ASSIGNED: 'atama_bekliyor',
  MIXED: 'atama_bekliyor',
  PLANNED: 'planlandi',
  ASSIGNED_TO_ROUTE: 'planlandi',
  OUT_FOR_DELIVERY: 'yolda',
  OUT_FOR_PICKUP: 'yolda',
  IN_TRANSIT: 'yolda',
  HANDOVER: 'yolda',
  STARTED: 'yolda',
  PICKED_UP: 'yolda',
  ARRIVED: 'yolda',
  COMPLETED: 'teslim_edildi',
  DELIVERED: 'teslim_edildi',
  DONE: 'teslim_edildi',
  RETURNED: 'teslim_edildi',
  RETURN_RECEIVED: 'teslim_edildi',
  FAILED: 'iptal_edildi',
  CANCELED: 'iptal_edildi',
  CANCELLED: 'iptal_edildi',
}

/** Kurye aktif saha hareketinde mi? (live-tracking poll vb.) */
export const ON_ROAD_AGGREGATED = new Set([
  'OUT_FOR_DELIVERY',
  'OUT_FOR_PICKUP',
  'IN_TRANSIT',
  'HANDOVER',
])

const VOLUME_CLASSES = new Set<OrderVolumeClass>(['S', 'M', 'L', 'XL'])

/** Create `TAG_TO_BE` tersi — liste gösterimi Türkçe */
const TAG_FROM_BE: Record<string, string> = {
  'Kirilabilir Paket': 'Kırılabilir Paket',
  'Zile Basma': 'Zile Basma',
  'Kapiya Birak': 'Kapıya Bırak',
  Acil: 'Acil',
}

const SOURCE_LABEL: Record<string, string> = {
  MANUAL: 'Manuel',
  API: 'API',
  IMPORT: 'İçe Aktarım',
  SYSTEM: 'Sistem',
}

function mapType(value: unknown): OrderType {
  const key = asString(value).toUpperCase()
  return TYPE_FROM_BE[key] ?? 'dagitim'
}

function mapMethod(value: unknown): RouteType {
  const key = asString(value).toUpperCase()
  return METHOD_FROM_BE[key] ?? 'Standart Rota'
}

function mapStatus(value: unknown): OrderStatus {
  const key = asString(value).toUpperCase()
  if (STATUS_FROM_BE[key]) return STATUS_FROM_BE[key]
  if (ON_ROAD_AGGREGATED.has(key) || key.startsWith('OUT_FOR_')) return 'yolda'
  if (key.includes('CANCEL') || key.includes('FAIL')) return 'iptal_edildi'
  if (key.includes('COMPLETE') || key.includes('DELIVER') || key.includes('RETURN')) {
    return 'teslim_edildi'
  }
  // CREATED / READY_FOR_PLANNING / PACKAGE_RECEIVED / MIXED …
  return 'atama_bekliyor'
}

function mapVolumeClass(value: unknown): OrderVolumeClass {
  const key = asString(value).toUpperCase() as OrderVolumeClass
  return VOLUME_CLASSES.has(key) ? key : 'M'
}

function mapTagsFromBe(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input
    .map((item) => {
      const raw = asString(item).trim()
      if (!raw) return ''
      return TAG_FROM_BE[raw] ?? TAG_FROM_BE[raw.replace(/\s+/g, ' ')] ?? raw
    })
    .filter(Boolean)
}

/** Muhatap adı: kişi (first/last); companyName müşteri kolonunda, burada kullanılmaz. */
function personFromContact(contact: Record<string, unknown>): string {
  if (Object.keys(contact).length === 0) return ''

  const full = `${asString(contact.firstName)} ${asString(contact.lastName)}`.trim()
  if (full) return full

  const manager = `${asString(contact.managerFirstName)} ${asString(contact.managerLastName)}`.trim()
  if (manager) return manager

  return asString(
    contact.authorizedPerson || contact.contactName || contact.name || contact.fullName
  ).trim()
}

function contactPhone(contact: Record<string, unknown>): string {
  return asString(
    contact.phone || contact.mobile || contact.telephone || contact.managerPhone
  ).trim()
}

function parseMaybeJsonObject(input: unknown): Record<string, unknown> {
  if (typeof input === 'string') {
    const trimmed = input.trim()
    if (trimmed.startsWith('{')) {
      try {
        return asRecord(JSON.parse(trimmed))
      } catch {
        return {}
      }
    }
    return {}
  }
  return asRecord(input)
}

function addressParts(address: unknown): { title: string; full: string } {
  if (typeof address === 'string') {
    const trimmed = address.trim()
    if (trimmed.startsWith('{')) {
      return addressParts(parseMaybeJsonObject(trimmed))
    }
    const separator = ' — '
    const splitIndex = trimmed.indexOf(separator)
    if (splitIndex > 0) {
      return {
        title: trimmed.slice(0, splitIndex).trim(),
        full: trimmed.slice(splitIndex + separator.length).trim(),
      }
    }
    return { title: trimmed, full: trimmed }
  }

  const row = asRecord(address)
  const title = asString(row.title || row.name || row.label).trim()
  const full = asString(
    row.fullAddress || row.formattedAddress || row.addressLine || row.address
  ).trim()

  if (title && full) return { title, full }
  const fallback = title || full || '—'
  return { title: fallback, full: full || fallback === '—' ? '' : fallback }
}

function addressLabel(address: unknown): string {
  const { title, full } = addressParts(address)
  if (title && full && title !== full) return `${title} — ${full}`
  return title || full || '—'
}

function formatEtaTime(iso: unknown): string {
  const raw = asString(iso).trim()
  if (!raw) return '—'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

function formatCreatedAt(iso: unknown): string {
  const raw = asString(iso).trim()
  if (!raw) return '—'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatIsoWindow(from: unknown, to: unknown): string {
  const fromDate = typeof from === 'string' ? new Date(from) : null
  const toDate = typeof to === 'string' ? new Date(to) : null

  if (
    fromDate &&
    !Number.isNaN(fromDate.getTime()) &&
    toDate &&
    !Number.isNaN(toDate.getTime())
  ) {
    const day = fromDate.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    const start = fromDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    const end = toDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    return `${day} - ${start} - ${end}`
  }

  return ''
}

function formatTimeWindows(row: Record<string, unknown>): {
  alim: string
  teslim: string
  combined: string
} {
  const alim =
    formatIsoWindow(
      row.scheduledPickupFrom ?? row.pickupFrom,
      row.scheduledPickupTo ?? row.pickupTo
    ) || ''
  const teslim =
    formatIsoWindow(
      row.scheduledDeliveryFrom ?? row.targetDeliveryFrom,
      row.scheduledDeliveryTo ?? row.targetDeliveryTo
    ) || ''

  if (!alim && !teslim) {
    const fallback = asString(row.zaman_penceresi || row.timeWindow, '—')
    return { alim: '', teslim: fallback === '—' ? '' : fallback, combined: fallback }
  }

  const parts = [
    alim ? `Alım: ${alim}` : null,
    teslim ? `Teslim: ${teslim}` : null,
  ].filter(Boolean)

  return {
    alim: alim || '—',
    teslim: teslim || '—',
    combined: parts.join(' · ') || '—',
  }
}

/** Alım tamamlandıktan sonra ETA (teslimat süresi) anlamlıdır. */
function isPickupCompleted(row: Record<string, unknown>): boolean {
  const actual = row.actualPickupAt ?? row.pickedUpAt ?? row.pickupCompletedAt
  if (typeof actual === 'string' && actual.trim()) {
    const date = new Date(actual)
    if (!Number.isNaN(date.getTime())) return true
  }

  const status = asString(row.aggregatedStatus || row.status).toUpperCase()
  return (
    status === 'PACKAGE_RECEIVED' ||
    status === 'PICKED_UP' ||
    status === 'IN_TRANSIT' ||
    status === 'OUT_FOR_DELIVERY' ||
    status === 'HANDOVER' ||
    status === 'ARRIVED' ||
    status === 'STARTED' ||
    status === 'COMPLETED' ||
    status === 'DELIVERED' ||
    status === 'DONE' ||
    status === 'RETURNED' ||
    status === 'RETURN_RECEIVED' ||
    status === 'FAILED' ||
    status === 'MIXED'
  )
}

function courierName(courier: unknown): string | null {
  if (courier == null) return null
  if (typeof courier === 'string') {
    const value = courier.trim()
    return value || null
  }
  const row = asRecord(courier)
  const name =
    asString(row.fullName || row.name || row.displayName).trim() ||
    `${asString(row.firstName)} ${asString(row.lastName)}`.trim()
  return name || null
}

function vehicleLabel(row: Record<string, unknown>, courier: Record<string, unknown>): string | null {
  const activeRoute = asRecord(row.activeRoute)
  const vehicle = asRecord(row.vehicle || courier.vehicle || activeRoute.vehicle)
  const plate = asString(
    vehicle.plate || vehicle.plateNumber || vehicle.name || activeRoute.name || activeRoute.code
  ).trim()
  return plate || null
}

function customerEntityLabel(customer: Record<string, unknown>): string {
  if (Object.keys(customer).length === 0) return ''

  const company = asRecord(customer.company)
  const ownerName = [asString(customer.ownerFirstName), asString(customer.ownerLastName)]
    .filter(Boolean)
    .join(' ')
    .trim()

  return (
    asString(
      customer.companyName ||
        company.name ||
        company.companyName ||
        customer.name ||
        customer.tradeName ||
        customer.title ||
        customer.label ||
        customer.displayName
    ).trim() || ownerName
  )
}

/** Muhatap için: kişi adı (owner / yetkili); şirket adı son çare. */
function customerPersonLabel(customer: Record<string, unknown>): string {
  if (Object.keys(customer).length === 0) return ''

  const ownerName = [asString(customer.ownerFirstName), asString(customer.ownerLastName)]
    .filter(Boolean)
    .join(' ')
    .trim()
  if (ownerName) return ownerName

  const authorized = asString(customer.authorizedPerson || customer.contactName).trim()
  if (authorized) return authorized

  return customerEntityLabel(customer)
}

/**
 * Create wizard ile aynı mantık:
 * 1) Contact (serbest adres muhatabı)
 * 2) Adres authorizedPerson / phone (tesis — customer-address)
 * 3) Customer snapshot kişi (owner) — şirket adı muhatap değil, son çare
 */
function resolveSideMuhatap(
  contactRaw: unknown,
  customerRaw: unknown,
  addressRaw?: unknown
): { name: string; phone: string } {
  const contact = parseMaybeJsonObject(contactRaw)
  const customer = parseMaybeJsonObject(customerRaw)
  const address = parseMaybeJsonObject(addressRaw)

  const name =
    personFromContact(contact) ||
    asString(address.authorizedPerson || address.contactName || address.contactPerson).trim() ||
    customerPersonLabel(customer)

  const phone =
    contactPhone(contact) ||
    asString(address.phone || address.contactPhone).trim() ||
    contactPhone(customer)

  return { name, phone }
}

/**
 * Wizard’daki seçili müşteri: önce orderOwnerSnapshot, sonra tip’e göre sender/receiver.
 */
function customerLabel(row: Record<string, unknown>, orderType: OrderType): string {
  const direct = asString(row.customerName || row.musteri).trim()
  if (direct) return direct

  const orderOwnerSnapshot = parseMaybeJsonObject(row.orderOwnerSnapshot)
  const orderOwnerName = customerEntityLabel(orderOwnerSnapshot)
  if (orderOwnerName) return orderOwnerName

  const senderCustomer = asRecord(
    row.senderCustomerSnapshot ||
      row.senderCustomer ||
      row.sender_customer ||
      row.customerSender
  )
  const receiverCustomer = asRecord(
    row.receiverCustomerSnapshot ||
      row.receiverCustomer ||
      row.receiver_customer ||
      row.customerReceiver
  )
  const singleCustomer = asRecord(row.customer || row.customerSnapshot)

  const useReceiver = orderType === 'toplama' || orderType === 'iade'
  const primaryName = useReceiver
    ? asString(row.receiverCustomerName || row.receiver_customer_name).trim()
    : asString(row.senderCustomerName || row.sender_customer_name).trim()
  if (primaryName) return primaryName

  const primary = useReceiver ? receiverCustomer : senderCustomer
  const secondary = useReceiver ? senderCustomer : receiverCustomer

  return (
    customerEntityLabel(primary) ||
    customerEntityLabel(secondary) ||
    customerEntityLabel(singleCustomer) ||
    asString(row.senderCustomerName || row.receiverCustomerName).trim() ||
    '—'
  )
}

function customerIdFromRow(row: Record<string, unknown>, orderType: OrderType): string | null {
  const orderOwner = asString(row.orderOwner || row.orderOwnerId).trim()
  if (orderOwner) return orderOwner

  const useReceiver = orderType === 'toplama' || orderType === 'iade'
  const direct = asString(
    useReceiver
      ? row.receiverCustomerId || row.receiver_customer_id
      : row.senderCustomerId || row.sender_customer_id
  ).trim()
  if (direct) return direct

  const fallback = asString(
    row.customerId ||
      row.customer_id ||
      row.senderCustomerId ||
      row.receiverCustomerId ||
      row.sender_customer_id ||
      row.receiver_customer_id
  ).trim()
  if (fallback) return fallback

  const senderCustomer = asRecord(
    row.senderCustomerSnapshot || row.senderCustomer || row.sender_customer
  )
  const receiverCustomer = asRecord(
    row.receiverCustomerSnapshot || row.receiverCustomer || row.receiver_customer
  )
  const primary = useReceiver ? receiverCustomer : senderCustomer
  const secondary = useReceiver ? senderCustomer : receiverCustomer
  const singleCustomer = asRecord(row.customer || row.customerSnapshot)

  return (
    asString(primary.id || primary.customerId).trim() ||
    asString(secondary.id || secondary.customerId).trim() ||
    asString(singleCustomer.id || singleCustomer.customerId).trim() ||
    null
  )
}

function personDisplayName(snapshot: Record<string, unknown>): string {
  const full =
    asString(snapshot.fullName || snapshot.name || snapshot.displayName).trim() ||
    `${asString(snapshot.firstName)} ${asString(snapshot.lastName)}`.trim()
  return full
}

/** Müşteri paneli kullanıcısı → detayda müşteri adı; tenant kullanıcısı → yalnızca kanal. */
function isCustomerPortalUser(snapshot: Record<string, unknown>): boolean {
  if (asString(snapshot.customerId || snapshot.customer_id).trim()) return true

  const userType = asString(snapshot.userType || snapshot.user_type || snapshot.role)
    .trim()
    .toUpperCase()
  if (!userType) return false

  if (
    userType.includes('CUSTOMER') ||
    userType === 'EXTERNAL' ||
    userType === 'PARTNER' ||
    userType === 'CLIENT'
  ) {
    return true
  }

  // Tenant personeli (ör. Manager, Developer, Dispatcher…)
  return false
}

/**
 * Tenant kullanıcısı: "Disp Atcher (Manuel)"
 * Müşteri paneli: "Disp Atcher (Manuel · BNF)" — tenant adı değil, müşteri adı.
 * parseCreator: title=kişi, detail=kanal[ · müşteri]
 */
function creatorLabel(row: Record<string, unknown>, customerName: string): string {
  const snapshot = asRecord(
    row.createdUserSnapshot || row.createdByUser || row.createdBy || row.creator
  )
  const sourceRaw = asString(row.sourceType || snapshot.sourceType || snapshot.source).trim()
  const sourceKey = sourceRaw.toUpperCase()
  const sourceLabel =
    SOURCE_LABEL[sourceKey] || (sourceRaw ? sourceRaw : '') || 'Manuel'

  const userName =
    personDisplayName(snapshot) ||
    asString(snapshot.email || snapshot.userName || snapshot.username).trim() ||
    '—'

  if (isCustomerPortalUser(snapshot)) {
    const customer =
      customerName.trim() && customerName.trim() !== '—' ? customerName.trim() : ''
    if (customer) return `${userName} (${sourceLabel} · ${customer})`
    return `${userName} (${sourceLabel})`
  }

  return `${userName} (${sourceLabel})`
}

function extractPackageLines(
  row: Record<string, unknown>,
  packageSummary: Record<string, unknown>
): Array<{ size: OrderVolumeClass; adet: number }> {
  const items = Array.isArray(row.items)
    ? row.items
    : Array.isArray(packageSummary.items)
      ? packageSummary.items
      : Array.isArray(packageSummary.lines)
        ? packageSummary.lines
        : []

  const fromItems: Array<{ size: OrderVolumeClass; adet: number }> = []
  for (const raw of items) {
    const item = asRecord(raw)
    const size = mapVolumeClass(item.sizeClass || item.hacim_sinifi || item.size)
    const adet = Math.max(1, asNumber(item.quantity ?? item.adet ?? item.qty, 1))
    fromItems.push({ size, adet })
  }

  if (fromItems.length > 0) {
    // Aynı size’ları birleştir
    const merged = new Map<OrderVolumeClass, number>()
    for (const line of fromItems) {
      merged.set(line.size, (merged.get(line.size) ?? 0) + line.adet)
    }
    return Array.from(merged.entries()).map(([size, adet]) => ({ size, adet }))
  }

  // sizeClasses: ["M","XL"] veya [{sizeClass,quantity}]
  const sizeClasses = packageSummary.sizeClasses ?? packageSummary.classes
  if (Array.isArray(sizeClasses) && sizeClasses.length > 0) {
    return sizeClasses.map((entry) => {
      if (typeof entry === 'string' || typeof entry === 'number') {
        return { size: mapVolumeClass(entry), adet: 1 }
      }
      const item = asRecord(entry)
      return {
        size: mapVolumeClass(item.sizeClass || item.size || item.name),
        adet: Math.max(1, asNumber(item.quantity ?? item.adet ?? item.count, 1)),
      }
    })
  }

  return []
}

export function resolveOrderTotalVolume(
  row: Record<string, unknown>,
  packageSummary: Record<string, unknown>
): number {
  return resolveVolumeValueOrZero(
    packageSummary.totalVolume,
    packageSummary.volume,
    row.totalVolume,
    row.volume,
    packageSummary.totalVolumeM3,
    packageSummary.total_volume_m3,
    row.totalVolumeM3,
    row.toplam_hacim
  )
}

export function mapBackendOrderToLastmileOrder(raw: unknown): LastmileOrder {
  const row = asRecord(raw)
  const packageSummary = asRecord(row.packageSummary)
  const courier = asRecord(row.courier)
  const orderType = mapType(row.type || row.siparis_tipi)

  const alisMuhatap = resolveSideMuhatap(
    row.senderContact ?? row.sender_contact ?? row.senderContactSnapshot,
    row.senderCustomerSnapshot ?? row.senderCustomer ?? row.sender_customer,
    row.fromAddress ?? row.from_address
  )
  const varisMuhatap = resolveSideMuhatap(
    row.receiverContact ?? row.receiver_contact ?? row.receiverContactSnapshot,
    row.receiverCustomerSnapshot ?? row.receiverCustomer ?? row.receiver_customer,
    row.toAddress ?? row.to_address
  )

  const etaOffsetSec = asNullableNumber(row.etaOffsetSec)
  const serviceTimeSec = asNullableNumber(row.serviceTimeSec)
  const timeWindows = formatTimeWindows(row)
  const etaAlimYapildi = isPickupCompleted(row)

  const paket_satirlari = extractPackageLines(row, packageSummary)
  const primarySize =
    paket_satirlari[0]?.size ??
    mapVolumeClass(packageSummary.primarySizeClass || row.hacim_sinifi || row.sizeClass)
  const totalQty =
    paket_satirlari.length > 0
      ? paket_satirlari.reduce((sum, line) => sum + line.adet, 0)
      : asNumber(packageSummary.totalQuantity ?? row.paket_sayisi, 0)

  const musteri = customerLabel(row, orderType)

  const activeRoute = asRecord(row.activeRoute)
  const routeSummary = asRecord(row.routeSummary)
  const rota_kodu =
    asString(
      row.routeCode ||
        routeSummary.code ||
        activeRoute.code ||
        activeRoute.name
    ).trim() || null
  const rota_atandi =
    row.isRouteAssigned === true ||
    Boolean(asString(activeRoute.id).trim()) ||
    Boolean(rota_kodu)
  const aggregatedRaw = asString(row.aggregatedStatus || row.status || row.durum)
  let durum = mapStatus(aggregatedRaw)
  if (
    rota_atandi &&
    (durum === 'atama_bekliyor' || aggregatedRaw.toUpperCase() === 'PLANNED')
  ) {
    durum = 'planlandi'
  }
  const durum_etiketi =
    asString(row.aggregatedStatusLabel || row.aggregated_status_label).trim() ||
    null

  return {
    id: asString(row.id),
    takip_no: asString(row.trackingCode || row.trackingNo || row.code || row.takip_no, '—'),
    referans_no: asString(row.referenceNo || row.referans_no, '—'),
    siparis_tipi: orderType,
    durum,
    durum_etiketi,
    rota_atandi,
    rota_kodu,
    zaman_penceresi: timeWindows.combined,
    alim_zaman_penceresi: timeWindows.alim || '—',
    teslim_zaman_penceresi: timeWindows.teslim || '—',
    eta: etaAlimYapildi ? formatEtaTime(row.estimatedArrivalAt || row.eta) : '—',
    eta_kalan_dk: etaAlimYapildi
      ? etaOffsetSec == null
        ? asNullableNumber(row.eta_kalan_dk)
        : Math.round(etaOffsetSec / 60)
      : null,
    eta_alim_yapildi: etaAlimYapildi,
    gorev_suresi_dk:
      serviceTimeSec == null
        ? asNumber(row.gorev_suresi_dk, 0)
        : Math.max(0, Math.round(serviceTimeSec / 60)),
    oncelik_puani: asNumber(row.priority ?? row.oncelik_puani, 0),
    gereksinimler: mapSkillsFromRaw(row.requiredSkills || row.gereksinimler),
    musteri,
    musteri_id: customerIdFromRow(row, orderType),
    alis_noktasi: addressParts(row.fromAddress ?? row.alis_noktasi).title,
    alis_acik_adres: addressParts(row.fromAddress ?? row.alis_noktasi).full,
    alis_muhatabi: alisMuhatap.name || '—',
    alis_telefon: alisMuhatap.phone,
    varis_noktasi: addressParts(row.toAddress ?? row.varis_noktasi).title,
    varis_acik_adres: addressParts(row.toAddress ?? row.varis_noktasi).full,
    varis_muhatabi: varisMuhatap.name || '—',
    varis_telefon: varisMuhatap.phone,
    mesafe_m: asNumber(row.orderDistanceM ?? row.mesafe_m, 0),
    hacim_sinifi: primarySize,
    paket_satirlari,
    paket_sayisi: totalQty,
    toplam_hacim: resolveOrderTotalVolume(row, packageSummary),
    agirlik_kg: asNumber(packageSummary.totalKg ?? row.agirlik_kg, 0),
    giden_paket: asNullableNumber(row.giden_paket ?? packageSummary.outboundQuantity),
    donen_paket: asNullableNumber(row.donen_paket ?? packageSummary.inboundQuantity),
    rota_tipi: mapMethod(row.method || row.rota_tipi),
    atanan_arac: vehicleLabel(row, courier),
    atanan_kurye: courierName(row.courier ?? row.atanan_kurye),
    etiketler: mapTagsFromBe(row.tags || row.etiketler),
    olusturulma_zamani: formatCreatedAt(row.createdAt || row.olusturulma_zamani),
    olusturan: creatorLabel(row, musteri),
    bolge: asString(row.bolge || row.region || row.zone),
  }
}

export const ORDER_TYPE_TO_BE: Record<OrderType, string> = {
  dagitim: 'DELIVERY',
  toplama: 'PICKUP',
  iade: 'RETURN',
  transfer: 'TRANSFER',
  degisim: 'SWAP',
  gel_al: 'GEL_AL',
  kurulumlu_teslimat: 'INSTALL',
}

export const ORDER_STATUS_TO_AGGREGATED: Record<OrderStatus, string> = {
  atama_bekliyor: 'CREATED',
  planlandi: 'PLANNED',
  yolda: 'OUT_FOR_DELIVERY',
  teslim_edildi: 'COMPLETED',
  iptal_edildi: 'CANCELED',
}

/** Dağıtım sekmesi BE’de tek type → DELIVERY (GEL_AL / INSTALL “Tümü”nde) */
export function typeScopeToBackendType(
  typeScope: import('../_types/order').OrderTypeScope
): string | undefined {
  switch (typeScope) {
    case 'all':
      return undefined
    case 'dagitim':
      return 'DELIVERY'
    case 'toplama':
      return 'PICKUP'
    case 'iade':
      return 'RETURN'
    case 'transfer':
      return 'TRANSFER'
    case 'degisim':
      return 'SWAP'
    default:
      return undefined
  }
}
