import { mapBackendOrderToLastmileOrder } from '../../_lib/map-order-list'
import { resolveVolumeValue } from '../../_lib/volume-units'
import type { OrderType, OrderVolumeClass } from '../../_types/order'
import {
  buildDefaultTimeline,
  enrichTimelineActors,
  TIMELINE_LABEL_BY_KEY,
  TIMELINE_STEP_RANK,
} from './order-detail-helpers'
import type {
  OrderAssignmentSettings,
  OrderAuditLogItem,
  OrderCustomerDetail,
  OrderDetail,
  OrderLocationContactKind,
  OrderLocationPoint,
  OrderPackageLine,
  OrderPackageProof,
  OrderRouteDetail,
  OrderTimelineStep,
  PackageLineKind,
  PackageLineStatus,
  TimelineStepStatus,
} from '../_types/order-detail'

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

function asBool(input: unknown, fallback = false): boolean {
  if (typeof input === 'boolean') return input
  if (input === 'true' || input === 1 || input === '1') return true
  if (input === 'false' || input === 0 || input === '0') return false
  return fallback
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

function formatDateTime(iso: unknown): string | null {
  const raw = asString(iso).trim()
  if (!raw) return null
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  })
}

function formatEtaTime(iso: unknown): string {
  const raw = asString(iso).trim()
  if (!raw) return '—'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  })
}

function formatWindow(from: unknown, to: unknown): string {
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
      timeZone: 'Europe/Istanbul',
    })
    const start = fromDate.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Istanbul',
    })
    const end = toDate.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Istanbul',
    })
    return `${day} - ${start} - ${end}`
  }
  return '—'
}

const VOLUME_CLASSES = new Set<OrderVolumeClass>(['S', 'M', 'L', 'XL'])

function mapVolumeClass(value: unknown): OrderVolumeClass {
  const key = asString(value).toUpperCase() as OrderVolumeClass
  return VOLUME_CLASSES.has(key) ? key : 'M'
}

function mapPackageKind(value: unknown): PackageLineKind {
  const key = asString(value).toUpperCase()
  if (key === 'OUTBOUND' || key === 'GIDEN') return 'giden'
  if (key === 'INBOUND' || key === 'DONEN' || key === 'DÖNEN') return 'donen'
  return 'standart'
}

function mapPackageStatus(value: unknown): PackageLineStatus {
  const key = asString(value).toUpperCase()

  if (key.includes('CANCEL')) return 'iptal'
  if (
    key === 'FAILED' ||
    key.includes('UNDELIVER') ||
    key.includes('NOT_DELIVER') ||
    key.includes('DELIVERY_FAIL') ||
    key.includes('FAILED_DELIVERY')
  ) {
    return 'teslim_edilemedi'
  }
  if (key.includes('REJECT')) return 'reddedildi'
  if (key === 'COMPLETED' || key === 'DELIVERED') return 'teslim_edildi'
  if (key === 'RETURNED' || key === 'RETURN_RECEIVED') return 'teslim_alindi'
  if (
    key.includes('OUT_FOR') ||
    key.includes('IN_TRANSIT') ||
    key === 'STARTED' ||
    key === 'HANDOVER'
  ) {
    return 'yolda'
  }
  if (key === 'PACKAGE_RECEIVED' || key.includes('PICKED')) return 'alindi'
  return 'olusturuldu'
}

/** BE detail nested özetlerini liste mapper’ının beklediği root alanlara yay. */
export function normalizeDetailRaw(raw: unknown): Record<string, unknown> {
  const row = asRecord(raw)
  const sender = asRecord(row.senderSummary)
  const receiver = asRecord(row.receiverInfo)
  const routeOp = asRecord(row.routeOperation)
  const constraints = asRecord(row.constraintsSummary)
  const orderOwnerCard = parseMaybeJsonObject(row.orderOwnerCard)
  const orderOwnerSnapshot = parseMaybeJsonObject(row.orderOwnerSnapshot)

  return {
    ...row,
    orderOwner: row.orderOwner ?? row.orderOwnerId,
    // GraphQL'de JSON string gelebilir — parse edilmiş objeyi de tut
    orderOwnerCard: Object.keys(orderOwnerCard).length > 0 ? orderOwnerCard : row.orderOwnerCard,
    orderOwnerSnapshot:
      Object.keys(orderOwnerSnapshot).length > 0 ? orderOwnerSnapshot : row.orderOwnerSnapshot,
    fromAddress: row.fromAddress ?? sender.fromAddress,
    toAddress: row.toAddress ?? receiver.toAddress,
    senderContact: row.senderContact ?? sender.senderContact,
    receiverContact: row.receiverContact ?? receiver.receiverContact,
    // Gönderici ≠ order owner; senderSummary içinde customerCard yok
    senderCustomerSnapshot: row.senderCustomerSnapshot ?? sender.senderCustomerSnapshot,
    receiverCustomerSnapshot: row.receiverCustomerSnapshot ?? receiver.receiverCustomerSnapshot,
    activeRoute: row.activeRoute ?? routeOp.activeRoute,
    courier: row.courier ?? routeOp.courier,
    vehicle: row.vehicle ?? routeOp.vehicle ?? asRecord(row.activeRoute).vehicleSnapshot,
    serviceTimeSec: row.serviceTimeSec ?? constraints.serviceTimeSec,
    priority: row.priority ?? constraints.priority,
    requiredSkills: row.requiredSkills ?? constraints.requiredSkills,
  }
}

function mapContactParty(contactRaw: unknown): {
  contact_tipi: OrderLocationContactKind | null
  muhatap: string
  telefon: string
  firma_adi: string | null
  vkn: string | null
  vergi_dairesi: string | null
  tckn: string | null
} {
  const contact = asRecord(contactRaw)
  if (Object.keys(contact).length === 0) {
    return {
      contact_tipi: null,
      muhatap: '',
      telefon: '',
      firma_adi: null,
      vkn: null,
      vergi_dairesi: null,
      tckn: null,
    }
  }

  const companyType = asString(contact.companyType).toUpperCase()
  const firma = asString(contact.companyName || contact.tradeName || contact.unvan).trim()
  const vkn = asString(contact.taxNumber || contact.vkn).trim()
  const vergi = asString(contact.taxOffice || contact.vergiDairesi).trim()
  const tckn = asString(
    contact.tckn || contact.tcIdentityNumber || contact.identityNumber || contact.nationalId
  ).trim()

  let contact_tipi: OrderLocationContactKind | null = null
  if (companyType === 'CORPORATE' || companyType === 'COMPANY') contact_tipi = 'kurumsal'
  else if (companyType === 'INDIVIDUAL' || companyType === 'PERSON') contact_tipi = 'bireysel'
  else if (firma || vkn) contact_tipi = 'kurumsal'
  else if (tckn) contact_tipi = 'bireysel'

  const person =
    `${asString(contact.firstName)} ${asString(contact.lastName)}`.trim() ||
    `${asString(contact.managerFirstName)} ${asString(contact.managerLastName)}`.trim() ||
    asString(
      contact.authorizedPerson || contact.contactName || contact.name || contact.fullName
    ).trim()

  const telefon = asString(
    contact.phone || contact.mobile || contact.telephone || contact.managerPhone
  ).trim()

  return {
    contact_tipi,
    muhatap: person,
    telefon,
    firma_adi: firma || null,
    vkn: vkn || null,
    vergi_dairesi: vergi || null,
    tckn: tckn || null,
  }
}

function mapLocationPoint(
  addressRaw: unknown,
  contactRaw: unknown,
  fallback: {
    baslik: string
    adres: string
    muhatap: string
    telefon: string
    zaman_penceresi: string
  },
  windowFrom: unknown,
  windowTo: unknown,
  mapPoint?: Record<string, unknown>
): OrderLocationPoint {
  const address = asRecord(addressRaw)
  const contact = mapContactParty(contactRaw)
  const title = asString(address.title || address.name || address.label).trim()
  const full = asString(
    address.fullAddress || address.formattedAddress || address.addressLine || address.address
  ).trim()
  const addressMuhatap = asString(
    address.authorizedPerson || address.contactName || address.contactPerson
  ).trim()
  const addressTelefon = asString(address.phone || address.contactPhone || address.mobile).trim()
  const lat =
    asNullableNumber(address.latitude ?? address.lat) ??
    asNullableNumber(mapPoint?.latitude ?? mapPoint?.lat) ??
    0
  const lng =
    asNullableNumber(address.longitude ?? address.lng ?? address.lon) ??
    asNullableNumber(mapPoint?.longitude ?? mapPoint?.lng ?? mapPoint?.lon) ??
    0

  return {
    baslik: title || fallback.baslik || '—',
    adres: full || fallback.adres || '—',
    muhatap: contact.muhatap || addressMuhatap || fallback.muhatap || '—',
    telefon: contact.telefon || addressTelefon || fallback.telefon || '',
    zaman_penceresi: formatWindow(windowFrom, windowTo) || fallback.zaman_penceresi || '—',
    lat,
    lng,
    contact_tipi: contact.contact_tipi ?? 'tesis',
    firma_adi: contact.firma_adi,
    vkn: contact.vkn,
    vergi_dairesi: contact.vergi_dairesi,
    tckn: contact.tckn,
  }
}

function mapProof(
  proofRaw: unknown,
  itemId: string,
  itemsWithoutProof: Set<string>
): OrderPackageProof | null {
  if (itemsWithoutProof.has(itemId)) return null
  const proof = asRecord(proofRaw)
  if (Object.keys(proof).length === 0) return null
  if (proof.hasProof === false) return null

  const proofs = Array.isArray(proof.proofs) ? proof.proofs : []
  const imageUrlsFromProofs = proofs
    .map((entry) => {
      const row = asRecord(entry)
      return asString(row.photoDownloadUrl || row.photoUrl).trim()
    })
    .filter(Boolean)

  const imageUrls = Array.isArray(proof.imageUrls)
    ? proof.imageUrls.map((url) => asString(url).trim()).filter(Boolean)
    : []

  const foto_urls = imageUrls.length > 0 ? imageUrls : imageUrlsFromProofs
  const firstProof = asRecord(proofs[0])

  const tc =
    asString(proof.tcLast4 || firstProof.tcLast4).trim() || null
  const name =
    asString(proof.receiverFullName || firstProof.receiverFullName).trim() || null
  const note = asString(proof.courierNote).trim() || null

  if (!tc && !name && foto_urls.length === 0 && !note) {
    const legacy = asString(proof.proofImage || proof.imageUrl).trim()
    if (!legacy) return null
    return {
      tc_son_4: null,
      alici_ad_soyad: null,
      foto_urls: [legacy],
      kurye_gorev_notu: null,
    }
  }

  return {
    tc_son_4: tc,
    alici_ad_soyad: name,
    foto_urls,
    kurye_gorev_notu: note,
  }
}

function mapPackages(row: Record<string, unknown>): OrderPackageLine[] {
  const proofSummary = asRecord(row.proofSummary)
  const without = new Set(
    Array.isArray(proofSummary.itemsWithoutProof)
      ? proofSummary.itemsWithoutProof.map((id) => asString(id)).filter(Boolean)
      : []
  )

  const items = Array.isArray(row.items) ? row.items : []
  return items.map((raw, index) => {
    const item = asRecord(raw)
    const id = asString(item.id, `item-${index}`)
    return {
      id,
      kind: mapPackageKind(item.kind),
      hacim_sinifi: mapVolumeClass(item.sizeClass || item.hacim_sinifi),
      hacim: resolveVolumeValue(item.volume, item.volumeM3, item.hacim),
      agirlik_kg: asNullableNumber(item.kg ?? item.agirlik_kg),
      barkod: asString(item.code || item.barcode || item.barkod, '—'),
      durum: mapPackageStatus(item.status || item.durum),
      kanit: mapProof(item.proof, id, without),
    }
  })
}

/** BE label’ları genelde ASCII (Olusturuldu); key’e göre TR etiket tercih et */
function formatActorFromUnknown(input: unknown): string | undefined {
  if (typeof input === 'string' && input.trim()) return input.trim()
  const actor = asRecord(input)
  if (Object.keys(actor).length === 0) return undefined

  const actorType = asString(actor.type || actor.actorType).toUpperCase()
  const actorName =
    asString(actor.name || actor.fullName || actor.displayName).trim() ||
    `${asString(actor.firstName)} ${asString(actor.lastName)}`.trim() ||
    asString(actor.email)

  if (!actorName) {
    if (actorType === 'API') return 'API'
    if (actorType === 'SYSTEM') return 'Sistem'
    if (actorType === 'COURIER') return 'Kurye'
    return undefined
  }

  if (actorType === 'API') return `API (${actorName})`
  if (actorType === 'COURIER') return `Kurye · ${actorName}`
  return actorName
}

function timelineRank(id: string): number {
  return TIMELINE_STEP_RANK[id.toUpperCase()] ?? 65
}

function beStatusToFe(beStatus: string): TimelineStepStatus {
  if (beStatus === 'CANCELLED' || beStatus === 'CANCELED') return 'cancelled'
  if (beStatus === 'DONE' || beStatus === 'COMPLETED') return 'done'
  return 'upcoming'
}

function mapTimeline(
  row: Record<string, unknown>,
  orderType: OrderType,
  fallbacks: { olusturan?: string; kuryeAdi?: string | null; createdAt: string }
): OrderTimelineStep[] {
  const steps = Array.isArray(row.statusTimeline) ? row.statusTimeline : []
  const beByKey = new Map<
    string,
    {
      label: string
      timestamp: string | null
      beStatus: string
      description?: string
      actor?: string
    }
  >()

  for (const [index, raw] of steps.entries()) {
    const step = asRecord(raw)
    const key = asString(step.key || step.id, `step-${index}`).toUpperCase()
    const actor =
      formatActorFromUnknown(step.actor) ||
      formatActorFromUnknown(step.performedBy) ||
      formatActorFromUnknown(step.createdByUser) ||
      formatActorFromUnknown(step.createdBy) ||
      formatActorFromUnknown(step.user)

    beByKey.set(key, {
      label: TIMELINE_LABEL_BY_KEY[key] || asString(step.label, '—'),
      timestamp: formatDateTime(step.occurredAt),
      beStatus: asString(step.status).toUpperCase(),
      description: asString(step.description) || undefined,
      actor,
    })
  }

  const listMapped = mapBackendOrderToLastmileOrder(row)
  const base = buildDefaultTimeline(
    {
      ...listMapped,
      siparis_tipi: orderType || listMapped.siparis_tipi,
      olusturan: fallbacks.olusturan || listMapped.olusturan,
      atanan_kurye: fallbacks.kuryeAdi || listMapped.atanan_kurye,
      rota: {
        rota_id: asString(asRecord(row.activeRoute).id) || null,
        kurye_adi: fallbacks.kuryeAdi || listMapped.atanan_kurye,
      },
    } as Parameters<typeof buildDefaultTimeline>[0],
    fallbacks.createdAt
  )

  let merged = base.map((step) => {
    const key = step.id.toUpperCase()
    const be =
      beByKey.get(key) ||
      (key === 'OUT_FOR_DELIVERY' ? beByKey.get('IN_TRANSIT') : undefined)

    if (!be) return step

    return {
      ...step,
      label: be.label || step.label,
      timestamp: be.timestamp ?? step.timestamp,
      status: beStatusToFe(be.beStatus),
      description: be.description || step.description,
      actor: be.actor || step.actor,
    }
  })

  const skeletonKeys = new Set(merged.map((s) => s.id.toUpperCase()))
  for (const [key, be] of beByKey) {
    if (skeletonKeys.has(key)) continue
    if (key === 'IN_TRANSIT' && skeletonKeys.has('OUT_FOR_DELIVERY')) continue
    merged.push({
      id: key,
      label: be.label,
      timestamp: be.timestamp,
      status: beStatusToFe(be.beStatus),
      description: be.description,
      actor: be.actor,
    })
  }

  if (beByKey.has('FAILED')) {
    const failed = beByKey.get('FAILED')!
    merged = merged.filter(
      (s) => !['COMPLETED', 'RETURN_RECEIVED', 'RETURNED'].includes(s.id.toUpperCase())
    )
    if (!merged.some((s) => s.id.toUpperCase() === 'FAILED')) {
      merged.push({
        id: 'FAILED',
        label: 'Teslim Edilemedi',
        timestamp: failed.timestamp,
        status: beStatusToFe(failed.beStatus) === 'upcoming' ? 'cancelled' : 'done',
        actor: failed.actor,
        description: failed.description,
      })
    }
  }

  if (beByKey.has('CANCELED') || beByKey.has('CANCELLED') || listMapped.durum === 'iptal_edildi') {
    const canceled = beByKey.get('CANCELED') || beByKey.get('CANCELLED')
    const prior = merged.filter(
      (s) =>
        s.status === 'done' &&
        !['CANCELED', 'CANCELLED', 'FAILED'].includes(s.id.toUpperCase())
    )
    merged = [
      ...(prior.length > 0
        ? prior
        : [
            {
              id: 'CREATED',
              label: 'Oluşturuldu',
              timestamp: fallbacks.createdAt,
              status: 'done' as const,
              actor: fallbacks.olusturan,
            },
          ]),
      {
        id: 'CANCELED',
        label: 'İptal Edildi',
        timestamp: canceled?.timestamp ?? fallbacks.createdAt,
        status: 'cancelled' as const,
        actor: canceled?.actor,
        description: canceled?.description || 'Sipariş iptal edildi',
      },
    ]
  }

  merged = merged.sort((a, b) => timelineRank(a.id) - timelineRank(b.id))

  let lastDoneIndex = -1
  for (let i = 0; i < merged.length; i++) {
    if (merged[i].status === 'done') lastDoneIndex = i
  }
  const terminalIds = new Set([
    'COMPLETED',
    'RETURN_RECEIVED',
    'RETURNED',
    'FAILED',
    'CANCELED',
    'CANCELLED',
  ])
  const terminalReached =
    lastDoneIndex >= 0 && terminalIds.has(merged[lastDoneIndex].id.toUpperCase())

  merged = merged.map((step, index) => {
    if (step.status === 'cancelled') return step
    if (step.status === 'done' && !terminalReached && index === lastDoneIndex) {
      return { ...step, status: 'current' as const }
    }
    return step
  })

  return enrichTimelineActors(merged, {
    olusturan: fallbacks.olusturan,
    kuryeAdi: fallbacks.kuryeAdi,
  })
}

function mapCustomerDetail(
  row: Record<string, unknown>,
  baseMusteri: string
): OrderCustomerDetail {
  // Detay kartı: canlı orderOwnerCard → yoksa orderOwnerSnapshot (audit fallback)
  const card = parseMaybeJsonObject(row.orderOwnerCard)
  const ownerSnapshot = parseMaybeJsonObject(row.orderOwnerSnapshot)

  const source =
    Object.keys(card).length > 0
      ? card
      : Object.keys(ownerSnapshot).length > 0
        ? ownerSnapshot
        : {}

  const ownerName = [asString(source.ownerFirstName), asString(source.ownerLastName)]
    .filter(Boolean)
    .join(' ')
    .trim()

  return {
    unvan: asString(
      source.name || source.companyName || source.tradeName || baseMusteri,
      '—'
    ),
    yetkili: asString(
      source.contactName || source.authorizedPerson || ownerName,
      '—'
    ),
    vkn: asString(source.taxNumber || source.vkn, '—'),
    vergi_dairesi: asString(source.taxOffice || source.vergiDairesi, '—'),
    email: asString(source.email || source.ownerEmail),
    telefon: asString(source.phone || source.mobile || source.ownerPhone),
    bildirim_sms: asBool(row.isSmsSendReceiver ?? row.bildirim_sms, false),
    bildirim_email: asBool(row.isEmailSendReceiver ?? row.bildirim_email, false),
  }
}

function mapRouteDetail(row: Record<string, unknown>): OrderRouteDetail {
  const routeOp = asRecord(row.routeOperation)
  const activeRoute = asRecord(row.activeRoute ?? routeOp.activeRoute)
  const courier = asRecord(row.courier ?? routeOp.courier)
  const vehicle = asRecord(
    routeOp.vehicle ||
      row.vehicle ||
      activeRoute.vehicleSnapshot ||
      activeRoute.vehicle
  )
  const mapSummary = asRecord(row.mapSummary)
  const progress = asRecord(routeOp.routeProgress ?? row.routeProgress)
  const routeSummary = asRecord(row.routeSummary)
  const mapCourier = asRecord(mapSummary.courier)

  const courierName =
    asString(courier.fullName || courier.name || courier.displayName).trim() ||
    `${asString(courier.firstName)} ${asString(courier.lastName)}`.trim() ||
    null

  const plate = asString(
    vehicle.plateNo || vehicle.plate || vehicle.plateNumber || vehicle.name
  ).trim()

  const polylineRaw = Array.isArray(mapSummary.polyline)
    ? mapSummary.polyline
    : Array.isArray(asRecord(activeRoute.geometry).coordinates)
      ? []
      : []

  const polylineMapped = polylineRaw
    .map((point) => {
      const p = asRecord(point)
      const lat = asNullableNumber(p.latitude ?? p.lat)
      const lng = asNullableNumber(p.longitude ?? p.lng ?? p.lon)
      if (lat == null || lng == null) return null
      return { lat, lng }
    })
    .filter((p): p is { lat: number; lng: number } => p != null)

  // 2–3 nokta = düz A→B; gerçek rota için daha zengin geometry beklenir
  const polyline = polylineMapped.length >= 5 ? polylineMapped : []

  const stops = Array.isArray(mapSummary.stops) ? mapSummary.stops : []
  const ara_duraklar = stops
    .map((raw, index) => {
      const stop = asRecord(raw)
      const isThis = stop.isThisOrder === true
      if (isThis) return null
      const lat = asNullableNumber(stop.latitude ?? stop.lat)
      const lng = asNullableNumber(stop.longitude ?? stop.lng)
      if (lat == null || lng == null) return null
      return {
        id: asString(stop.orderItemId || stop.id, `stop-${index}`),
        label: asString(stop.sequence ?? stop.label, String(index + 1)),
        lat,
        lng,
        passive: true as const,
      }
    })
    .filter((s): s is NonNullable<typeof s> => s != null)

  const activeRouteId = asString(activeRoute.id).trim() || null
  const rotaCode =
    asString(
      row.routeCode || routeSummary.code || activeRoute.code || activeRoute.name
    ).trim() || null

  return {
    rota_id: activeRouteId,
    rota_adi: rotaCode,
    kurye_id: asString(courier.id).trim() || null,
    kurye_adi: courierName,
    arac: plate || null,
    eta: formatEtaTime(row.estimatedArrivalAt),
    mesafe_m: asNullableNumber(row.orderDistanceM ?? activeRoute.distance),
    mevcut_durak_sirasi: asNullableNumber(
      progress.orderStopsCompleted ??
        progress.courierStopIndex ??
        routeSummary.completedStops
    ),
    durak_sirasi: asNullableNumber(
      progress.orderTotalStops ?? progress.orderStopIndex
    ),
    toplam_durak: asNullableNumber(
      progress.orderTotalStops ?? progress.totalStops ?? routeSummary.totalStops
    ),
    kurye_lat: asNullableNumber(mapCourier.latitude ?? mapCourier.lat),
    kurye_lng: asNullableNumber(mapCourier.longitude ?? mapCourier.lng),
    polyline,
    ara_duraklar,
  }
}

function mapAssignment(row: Record<string, unknown>): OrderAssignmentSettings {
  const proofSummary = asRecord(row.proofSummary)
  const dispatch = asString(row.dispatchMode).toUpperCase()
  const activeRoute = asRecord(row.activeRoute ?? asRecord(row.routeOperation).activeRoute)

  return {
    teslimat_kaniti_zorunlu: asBool(
      row.requireProofOnComplete ?? proofSummary.requireProof,
      false
    ),
    bildirim_sms: asBool(row.isSmsSendReceiver, false),
    bildirim_email: asBool(row.isEmailSendReceiver, false),
    guvenli_teslimat_otp: asBool(row.secureDeliveryOtp, false),
    yakin_kuryelere_dagit: dispatch === 'NEARBY',
    aninda_sahaya_ilet: dispatch === 'INSTANT',
    aktif_rota_id: asString(activeRoute.id).trim() || null,
    aktif_rota_label: asString(activeRoute.name || activeRoute.code).trim() || null,
  }
}

function mapMeta(row: Record<string, unknown>): Record<string, string> {
  const meta = asRecord(row.metadata ?? row.meta)
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(meta)) {
    if (value == null) continue
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      result[key] = String(value)
    }
  }

  const sourceType = asString(row.sourceType).trim()
  const integration = asString(row.integrationSource).trim()
  if (sourceType && !result.kanal) result.kanal = sourceType
  if (integration && !result.kaynak) result.kaynak = integration

  return result
}

function mapNotes(row: Record<string, unknown>): { kurye_notu: string; ic_not: string } {
  const byType = asRecord(row.notesByType)
  const courier = asRecord(byType.courier)
  const internal = asRecord(byType.internal)
  return {
    kurye_notu: asString(courier.note || row.kurye_notu),
    ic_not: asString(internal.note || row.ic_not),
  }
}

function mapTeslimZamani(row: Record<string, unknown>): string | null {
  const steps = Array.isArray(row.statusTimeline) ? row.statusTimeline : []
  for (const raw of steps) {
    const step = asRecord(raw)
    const key = asString(step.key).toUpperCase()
    if (key === 'COMPLETED' || key === 'RETURN_RECEIVED') {
      const formatted = formatDateTime(step.occurredAt)
      if (formatted) return formatted
    }
  }
  return formatDateTime(row.completedAt)
}

const MOVEMENT_ACTION_LABEL_TR: Record<string, string> = {
  ORDER_CREATED: 'Sipariş oluşturuldu',
  ORDER_UPDATED: 'Sipariş güncellendi',
  ORDER_CANCELED: 'Sipariş iptal edildi',
  ORDER_COMPLETED: 'Sipariş tamamlandı',
  PACKAGE_RECEIVED: 'Paket alındı',
  READY_FOR_PLANNING: 'Planlamaya hazır',
  ASSIGNED_TO_ROUTE: 'Rotaya atandı',
  ROUTE_ITEM_ADDED: 'Rotaya atandı',
  ROUTE_ITEM_REMOVED: 'Rotadan çıkarıldı',
  ROUTE_START: 'Rota başlatıldı',
  ROUTE_ARRIVE: 'Adrese varıldı',
  ROUTE_PICKUP: 'Paket teslim alındı',
  ROUTE_DELIVER: 'Teslim edildi',
  ROUTE_FAIL: 'Teslim edilemedi',
  ROUTE_HANDOVER: 'Devredildi',
  TRIP_LOAD: 'Araca yüklendi',
  TRIP_UNLOAD: 'Araçtan indirildi',
  RETURN_RECEIVED: 'İade teslim alındı',
  NOTE_CREATED: 'Not eklendi',
  NOTE_UPDATED: 'Not güncellendi',
  PROOF_UPLOADED: 'Teslim kanıtı eklendi',
}

const MOVEMENT_SOURCE_LABEL_TR: Record<string, string> = {
  ORDER: 'Sipariş',
  ORDER_ITEM: 'Paket',
  ROUTE: 'Rota',
  ROUTE_ITEM: 'Rota durağı',
  TRIP: 'Sefer',
  TRIP_LEG: 'Sefer bacağı',
}

export function mapMovementToAuditItem(raw: unknown): OrderAuditLogItem {
  const row = asRecord(raw)
  const actor = asRecord(row.actor)
  const actorType = asString(actor.type).toUpperCase()
  const actorName =
    asString(actor.name || actor.fullName).trim() ||
    `${asString(actor.firstName)} ${asString(actor.lastName)}`.trim()

  let actorLabel = actorName
  if (!actorLabel) {
    if (actorType === 'API') actorLabel = 'API'
    else if (actorType === 'COURIER') actorLabel = 'Kurye'
    else actorLabel = 'Sistem'
  } else if (actorType === 'API') {
    actorLabel = `API (${actorName})`
  }

  const actionType = asString(row.actionType).toUpperCase()
  const source = asString(row.source).toUpperCase()

  return {
    id: asString(row.id, `mv-${asString(row.occurredAt)}`),
    timestamp: formatDateTime(row.occurredAt) ?? '—',
    actor: actorLabel,
    action:
      MOVEMENT_ACTION_LABEL_TR[actionType] || asString(row.actionLabel).trim() || actionType || '—',
    actionType,
    sourceLabel: MOVEMENT_SOURCE_LABEL_TR[source] || '',
    itemCode: asString(row.itemCode).trim(),
    location: asString(row.locationLabel).trim(),
    ip: asString(row.ip || row.clientIp || row.createdClientIp, '—'),
  }
}

export function mapBackendOrderDetail(raw: unknown): OrderDetail {
  const normalized = normalizeDetailRaw(raw)
  const base = mapBackendOrderToLastmileOrder(normalized)
  const mapSummary = asRecord(normalized.mapSummary)
  const notes = mapNotes(normalized)
  const customer = mapCustomerDetail(normalized, base.musteri)

  const alis = mapLocationPoint(
    normalized.fromAddress,
    normalized.senderContact,
    {
      baslik: base.alis_noktasi,
      adres: base.alis_noktasi,
      muhatap: base.alis_muhatabi,
      telefon: base.alis_telefon,
      zaman_penceresi: base.alim_zaman_penceresi,
    },
    normalized.scheduledPickupFrom ?? normalized.pickupFrom,
    normalized.scheduledPickupTo ?? normalized.pickupTo,
    asRecord(mapSummary.pickup)
  )

  const varis = mapLocationPoint(
    normalized.toAddress,
    normalized.receiverContact,
    {
      baslik: base.varis_noktasi,
      adres: base.varis_noktasi,
      muhatap: base.varis_muhatabi,
      telefon: base.varis_telefon,
      zaman_penceresi: base.teslim_zaman_penceresi,
    },
    normalized.scheduledDeliveryFrom ?? normalized.targetDeliveryFrom,
    normalized.scheduledDeliveryTo ?? normalized.targetDeliveryTo,
    asRecord(mapSummary.dropoff)
  )

  const constraints = asRecord(normalized.constraintsSummary)
  const serviceSec = asNullableNumber(constraints.serviceTimeSec ?? normalized.serviceTimeSec)
  const priority = asNumber(constraints.priority ?? normalized.priority ?? base.oncelik_puani, 0)

  const detailBase = {
    ...base,
    gorev_suresi_dk:
      serviceSec == null ? base.gorev_suresi_dk : Math.max(0, Math.round(serviceSec / 60)),
    oncelik_puani: priority,
    musteri: customer.unvan !== '—' ? customer.unvan : base.musteri,
    eta: formatEtaTime(normalized.estimatedArrivalAt) || base.eta,
    mesafe_m: asNumber(normalized.orderDistanceM, base.mesafe_m),
  }

  const rota = mapRouteDetail(normalized)

  const timeline = mapTimeline(normalized, detailBase.siparis_tipi, {
    olusturan: detailBase.olusturan,
    kuryeAdi: rota.kurye_adi || detailBase.atanan_kurye,
    createdAt: detailBase.olusturulma_zamani,
  })

  const detail: OrderDetail = {
    ...detailBase,
    musteri_detay: customer,
    alis,
    varis,
    rota,
    paketler: mapPackages(normalized),
    atama_guvenlik: mapAssignment(normalized),
    meta: mapMeta(normalized),
    kurye_notu: notes.kurye_notu,
    ic_not: notes.ic_not,
    teslim_zamani: mapTeslimZamani(normalized),
    timeline,
    audit_log: [],
  }

  // Sync list-ish fields used by header chips
  detail.alis_noktasi = alis.baslik !== '—' ? `${alis.baslik} — ${alis.adres}` : alis.adres
  detail.alis_muhatabi = alis.muhatap
  detail.alis_telefon = alis.telefon
  detail.varis_noktasi = varis.baslik !== '—' ? `${varis.baslik} — ${varis.adres}` : varis.adres
  detail.varis_muhatabi = varis.muhatap
  detail.varis_telefon = varis.telefon
  detail.atanan_kurye = rota.kurye_adi
  detail.atanan_arac = rota.arac
  const packageSummary = asRecord(normalized.packageSummary)
  const totalQty = asNumber(packageSummary.totalQuantity, 0)
  if (totalQty > 0) {
    detail.paket_sayisi = totalQty
  } else if (detail.paketler.length > 0) {
    detail.paket_sayisi = detail.paketler.length
  }

  return detail
}
