import type { LastmileOrder, OrderStatus, OrderType, OrderVolumeClass } from '../../_types/order'

export type PackageLineKind = 'standart' | 'giden' | 'donen'

export type PackageLineStatus =
  | 'olusturuldu'
  | 'alindi'
  | 'yolda'
  | 'teslim_edildi'
  | 'teslim_alindi'
  | 'teslim_edilemedi'
  | 'iptal'
  | 'reddedildi'

export type OrderPackageProof = {
  tc_son_4: string | null
  alici_ad_soyad: string | null
  foto_urls: string[]
  kurye_gorev_notu: string | null
}

export type OrderPackageLine = {
  id: string
  kind: PackageLineKind
  hacim_sinifi: OrderVolumeClass
  hacim: number | null
  agirlik_kg: number | null
  barkod: string
  durum: PackageLineStatus
  kanit: OrderPackageProof | null
}

export type OrderLocationContactKind = 'bireysel' | 'kurumsal' | 'tesis'

export type OrderLocationPoint = {
  baslik: string
  adres: string
  muhatap: string
  telefon: string
  zaman_penceresi: string
  lat: number
  lng: number
  /** tesis = customer-address; bireysel/kurumsal = serbest contact */
  contact_tipi: OrderLocationContactKind
  firma_adi: string | null
  vkn: string | null
  vergi_dairesi: string | null
  tckn: string | null
}

export type OrderCustomerDetail = {
  unvan: string
  yetkili: string
  vkn: string
  vergi_dairesi: string
  email: string
  telefon: string
  bildirim_sms: boolean
  bildirim_email: boolean
}

export type MapWaypoint = {
  id: string
  label: string
  lat: number
  lng: number
  passive?: boolean
}

export type OrderRouteDetail = {
  rota_id: string | null
  rota_adi: string | null
  kurye_id: string | null
  kurye_adi: string | null
  arac: string | null
  eta: string
  mesafe_m: number | null
  mevcut_durak_sirasi: number | null
  durak_sirasi: number | null
  toplam_durak: number | null
  kurye_lat: number | null
  kurye_lng: number | null
  polyline: Array<{ lat: number; lng: number }>
  ara_duraklar: MapWaypoint[]
}

export type TimelineStepStatus = 'done' | 'current' | 'upcoming' | 'cancelled'

export type OrderTimelineStep = {
  id: string
  label: string
  timestamp: string | null
  status: TimelineStepStatus
  description?: string
  /** İşlemi yapan kişi / sistem */
  actor?: string
}

export type OrderAuditLogItem = {
  id: string
  timestamp: string
  actor: string
  action: string
  actionType: string
  /** BE `source`: ORDER | ROUTE | TRIP_LEG — olayın nereden geldiği, kişi değil. */
  sourceLabel: string
  itemCode: string
  location: string
  ip: string
}

export type OrderNoteType = 'INTERNAL' | 'COURIER'

export type OrderNoteVisibility = 'everyone' | 'roles'

export type OrderOperationNote = {
  id: string
  note: string
  author: string
  role?: string
  createdById?: string
  visibility?: OrderNoteVisibility
  visibleRoles?: string[]
  createdAt: string
  noteType: OrderNoteType
}

export type OrderAssignmentSettings = {
  teslimat_kaniti_zorunlu: boolean
  bildirim_sms: boolean
  bildirim_email: boolean
  guvenli_teslimat_otp: boolean
  yakin_kuryelere_dagit: boolean
  aninda_sahaya_ilet: boolean
  aktif_rota_id: string | null
  aktif_rota_label: string | null
}

export type OrderDetail = LastmileOrder & {
  musteri_detay: OrderCustomerDetail
  alis: OrderLocationPoint
  varis: OrderLocationPoint
  rota: OrderRouteDetail
  paketler: OrderPackageLine[]
  atama_guvenlik: OrderAssignmentSettings
  meta: Record<string, string>
  kurye_notu: string
  ic_not: string
  teslim_zamani: string | null
  timeline: OrderTimelineStep[]
  audit_log: OrderAuditLogItem[]
}

export type { OrderStatus, OrderType }
