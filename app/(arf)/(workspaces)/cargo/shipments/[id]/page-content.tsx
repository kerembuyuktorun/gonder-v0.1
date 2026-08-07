"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { ColumnDef, Table as TanStackTable } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader, DataTablePagination, createSelectionColumn } from "@hascanb/arf-ui-kit/datatable-kit"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { DeliveryInfoModal } from "../_components/delivery-info-modal"
import { PieceCancelInfoModal } from "../_components/piece-cancel-info-modal"
import { PieceCancelModal } from "../_components/piece-cancel-modal"
import { PieceDeliveryEntryModal } from "../_components/piece-delivery-entry-modal"
import { PieceReportInfoModal } from "../_components/piece-report-info-modal"
import { PieceReportModal } from "../_components/piece-report-modal"
import { ShipmentCancelInfoModal } from "../_components/shipment-cancel-info-modal"
import { ShipmentCancelModal } from "../_components/shipment-cancel-modal"
import { ShipmentHandoverModal } from "../_components/shipment-handover-modal"
import { ShipmentHandoverInfoModal } from "../_components/shipment-handover-info-modal"
import { usePieceActions } from "../_hooks/use-piece-actions"
import { ARF_ROUTES } from "../../../../_shared/routes"
import {
  mockCargoList,
  mockPieceCancelInfoByPieceNo as sharedPieceCancelInfoByPieceNo,
  shipmentDetailMockData,
  shipmentNotesHistoryMock,
} from "../_mock/shipments-mock-data"
import { AlertTriangle, ArrowRightLeft, Ban, Building2, CheckCircle2, Copy, ExternalLink, Eye, Minus, Package, Printer, Route, Truck } from "lucide-react"

type EventStage = "hazirlaniyor" | "transferde" | "varis" | "devredildi" | "iptal" | "dagitimda" | "teslim"
type EventStatus = "completed" | "active" | "pending"

type EventItem = {
  title: string
  description: string
  time: string
  done?: boolean
  stage: EventStage
  status: EventStatus
  subtitle?: string
}

type PartyCustomerType = "corporate" | "individual"

type PartyInfo = {
  customerId?: string
  customerType: PartyCustomerType
  displayName: string
  companyName?: string
  taxNumber?: string
  taxOffice?: string
  tcIdentityNumber?: string
  contactName: string
  phone: string
  email?: string
  branch: string
  city: string
  district: string
  neighborhood: string
  fullAddress: string
}

type PieceDetailStatus = "olusturuldu" | "transferde" | "dagitimda" | "teslim_edildi" | "iptal_edildi"

type PieceDetailRow = {
  id: string
  parca_no: string
  parca_durumu: PieceDetailStatus
  ihbar_edildi?: boolean
  ihbar_zamani?: string
  ihbar_sebebi?: string
  ihbar_aciklama?: string
  ihbar_kanit_url?: string
  parca_tipi: string
  desi: number
  agirlik: number
  olusturulma_zamani: string
  guncellenme_zamani: string
  varis_zamani: string
  teslimat_zamani: string
  teslim_alan_ad: string
  teslim_alan_soyad: string
  teslim_alan_telefonu: string
  teslimat_resmi_url?: string
}

type ShipmentHandoverInfo = {
  transferredAt: string
  transferredBy: string
  receiverBranch: string
  reason: string
  note: string
}

type ShipmentCancelInfo = {
  canceledAt: string
  canceledBy: string
  category: string
  reason: string
  note: string
}

type PieceCancelInfo = {
  canceledAt: string
  canceledBy: string
  category: string
  reason: string
  note: string
}

type PieceReportInfo = {
  reportTime: string
  reason: string
  description: string
  evidenceImageUrl?: string
}

type PieceDeliveryInfo = {
  firstName: string
  lastName: string
  deliveryTime: string
  phone: string
  imageUrl?: string
}

type PieceCancelInfoModalData = {
  pieceNo: string
  info: PieceCancelInfo
}

const pieceStatusConfig: Record<PieceDetailStatus, { label: string; className: string }> = {
  olusturuldu: { label: "Oluşturuldu", className: "border-secondary/25 bg-secondary/10 text-secondary" },
  transferde: { label: "Transferde", className: "border-primary/25 bg-primary/10 text-foreground" },
  dagitimda: { label: "Dağıtımda", className: "border-amber-200 bg-amber-50 text-amber-700" },
  teslim_edildi: { label: "Teslim Edildi", className: "border-primary/25 bg-primary/15 text-foreground" },
  iptal_edildi: { label: "İptal Edildi", className: "border-rose-200 bg-rose-50 text-rose-700" },
}

const notesHistory = shipmentNotesHistoryMock

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold leading-tight tracking-tight text-slate-900">{value}</p>
    </div>
  )
}

function InfoCell({ label, value, compact }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 font-semibold tracking-tight text-slate-900 ${compact ? "text-sm leading-snug" : "text-base leading-tight"}`}>
        {value}
      </p>
    </div>
  )
}

const timelineStageIcon: Record<EventStage, typeof Package> = {
  hazirlaniyor: Package,
  transferde: Route,
  varis: Building2,
  devredildi: ArrowRightLeft,
  iptal: Ban,
  dagitimda: Truck,
  teslim: CheckCircle2,
}

const handoverReasonLabels: Record<string, string> = {
  musteri_adreste_degil: "Müşteri adreste değil",
  musteriye_ulasilamiyor: "Müşteriye ulaşılamıyor",
  diger_sebep: "Diğer sebep",
}

const cancelCategoryLabels: Record<string, string> = {
  operasyonel: "Operasyonel",
  musteri: "Müşteri",
  guvenlik: "Güvenlik",
  diger: "Diğer",
}

const cancelReasonLabels: Record<string, string> = {
  musteri_talebi: "Müşteri talebi",
  yanlis_gonderi_kaydi: "Yanlış gönderi kaydı",
  tasimaya_uygunsuz: "Taşımaya uygunsuz içerik",
  diger_sebep: "Diğer sebep",
}

const pieceCancelReasonLabels: Record<string, string> = {
  musteri_talebi: "Müşteri talebi",
  yanlis_parca_kaydi: "Yanlış parça kaydı",
  teslimat_imkansiz: "Teslimat koşulu sağlanamadı",
  hasarli_parca: "Parça hasarlı / kullanılamaz",
  diger_sebep: "Diğer sebep",
}

const pieceCancelCategoryLabels: Record<string, string> = {
  operasyonel: "Operasyonel",
  musteri: "Müşteri",
  hasar: "Hasar",
  diger: "Diğer",
}

const pieceReportReasonLabels: Record<string, string> = {
  hasarli_kargo: "Hasarlı Kargo",
  yanlis_urun: "Yanlış Ürün",
  eksik_hatali_evrak: "Eksik/Hatalı Evrak",
  saskin_kargo: "Şaşkın Kargo",
}

const mockPieceCancelInfoByPieceNo: Record<string, PieceCancelInfo> = { ...sharedPieceCancelInfoByPieceNo }
type CargoListItem = (typeof mockCargoList)[number]

const cargoStatusLabels: Record<CargoListItem["kargo_durumu"], string> = {
  beklemede: "Beklemede",
  teslim_alindi: "Teslim Alındı",
  transfer: "Transferde",
  dagitimda: "Dağıtımda",
  teslim_edildi: "Teslim Edildi",
}

type PrimaryCargoStatus =
  | "olusturuldu"
  | "transfer_surecinde"
  | "varis_subede"
  | "dagitimda"
  | "teslim_edildi"
  | "devredildi"
  | "kargo_iptal"

const primaryCargoStatusConfig: Record<PrimaryCargoStatus, { label: string; className: string }> = {
  olusturuldu: { label: "Oluşturuldu", className: "border-slate-200 bg-slate-50 text-slate-700" },
  transfer_surecinde: { label: "Transfer Sürecinde", className: "border-primary/25 bg-primary/10 text-foreground" },
  varis_subede: { label: "Varış Şubede", className: "border-amber-200 bg-amber-50 text-amber-700" },
  dagitimda: { label: "Dağıtımda", className: "border-sky-200 bg-sky-50 text-sky-700" },
  teslim_edildi: { label: "Teslim Edildi", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  devredildi: { label: "Devredildi", className: "border-indigo-200 bg-indigo-50 text-indigo-700" },
  kargo_iptal: { label: "Kargo İptal", className: "border-rose-200 bg-rose-50 text-rose-700" },
}

const resolvePrimaryCargoStatus = (statusLabel: string, hasArrival: boolean): PrimaryCargoStatus => {
  if (statusLabel === "Teslim Edildi") {
    return "teslim_edildi"
  }

  if (statusLabel === "Dağıtımda") {
    return "dagitimda"
  }

  if (statusLabel === "Transferde") {
    return hasArrival ? "varis_subede" : "transfer_surecinde"
  }

  return "olusturuldu"
}

const cargoToPieceStatus: Record<CargoListItem["kargo_durumu"], PieceDetailStatus> = {
  beklemede: "olusturuldu",
  teslim_alindi: "olusturuldu",
  transfer: "transferde",
  dagitimda: "dagitimda",
  teslim_edildi: "teslim_edildi",
}

const toDateTimeDisplay = (value: string) => (value ? value.replace(/-/g, ".") : "-")

const toMoneyDisplay = (value: number) =>
  `₺${value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const buildPieceRowsFromCargo = (cargo: CargoListItem) => {
  const takipNo = cargo.takip_no.replace("ARF-", "")

  const pieceStatuses: PieceDetailStatus[] =
    cargo.kargo_durumu === "teslim_edildi"
      ? Array.from({ length: cargo.t_adet }, () => "teslim_edildi")
      : cargo.kargo_durumu === "transfer"
        ? Array.from({ length: cargo.t_adet }, (_, index) =>
            index < Math.max(1, cargo.t_adet - 1) ? "transferde" : "olusturuldu",
          )
        : Array.from({ length: cargo.t_adet }, () => cargoToPieceStatus[cargo.kargo_durumu])

  return Array.from({ length: cargo.t_adet }, (_, index) => {
    const suffix = String(index + 1).padStart(2, "0")
    const pieceNo = `${takipNo}${suffix}`
    const pieceStatus = pieceStatuses[index] ?? cargoToPieceStatus[cargo.kargo_durumu]
    const updateTime =
      pieceStatus === "teslim_edildi"
        ? cargo.teslimat_zamani || cargo.varis_zamani || cargo.olusturulma_zamani
        : pieceStatus === "transferde"
          ? cargo.varis_zamani || cargo.olusturulma_zamani
          : cargo.olusturulma_zamani
    const hasDeliveryInfo = pieceStatus === "teslim_edildi"

    return {
      id: `piece-${cargo.id}-${index + 1}`,
      parca_no: pieceNo,
      parca_durumu: pieceStatus,
      ihbar_edildi: false,
      parca_tipi: index % 3 === 0 ? "Koli" : index % 3 === 1 ? "Palet" : "Çuval",
      desi: Math.max(4, Math.ceil(cargo.t_desi / Math.max(1, cargo.t_adet))),
      agirlik: Math.max(5, Math.ceil((cargo.t_desi * 1.2) / Math.max(1, cargo.t_adet))),
      olusturulma_zamani: toDateTimeDisplay(cargo.olusturulma_zamani),
      guncellenme_zamani: toDateTimeDisplay(updateTime),
      varis_zamani: toDateTimeDisplay(cargo.varis_zamani),
      teslimat_zamani: toDateTimeDisplay(hasDeliveryInfo ? cargo.teslimat_zamani : ""),
      teslim_alan_ad: hasDeliveryInfo ? cargo.alici_musteri.split(" ")[0] || "-" : "",
      teslim_alan_soyad: hasDeliveryInfo ? cargo.alici_musteri.split(" ").slice(1).join(" ") || "-" : "",
      teslim_alan_telefonu: hasDeliveryInfo ? cargo.alici_telefon : "",
      teslimat_resmi_url:
        hasDeliveryInfo
          ? `https://picsum.photos/seed/teslimat-${pieceNo}/900/600`
          : "",
    }
  })
}

const buildTimelineFromCargo = (cargo: CargoListItem) => {
  const stages = [
    {
      title: "Hazırlanıyor",
      description: "Gönderi kaydı alındı ve şube çıkışı için hazırlandı.",
      time: toDateTimeDisplay(cargo.olusturulma_zamani),
      stage: "hazirlaniyor",
      subtitle: `Çıkış Şubesi: ${cargo.gonderen_sube}`,
    },
    {
      title: "Transferde",
      description: "Gönderi transfer hattına alındı.",
      time: toDateTimeDisplay(cargo.olusturulma_zamani),
      stage: "transferde",
      subtitle: `Hat: ${cargo.gonderen_sube} → ${cargo.alici_sube}`,
    },
    {
      title: "Varış Şubede",
      description: "Gönderi varış şubesine ulaştı.",
      time: toDateTimeDisplay(cargo.varis_zamani),
      stage: "varis",
      subtitle: `Varış Şubesi: ${cargo.alici_sube}`,
    },
    {
      title: "Dağıtımda",
      description: "Kurye teslimat için dağıtıma çıktı.",
      time: toDateTimeDisplay(cargo.varis_zamani || cargo.olusturulma_zamani),
      stage: "dagitimda",
    },
    {
      title: "Teslim Edildi",
      description: "Teslimat tamamlandığında bu adım aktif olur.",
      time: toDateTimeDisplay(cargo.teslimat_zamani),
      stage: "teslim",
    },
  ] as const

  const progressByStatus: Record<CargoListItem["kargo_durumu"], number> = {
    beklemede: 0,
    teslim_alindi: 1,
    transfer: 2,
    dagitimda: 3,
    teslim_edildi: 5,
  }

  const completedCount = progressByStatus[cargo.kargo_durumu]

  return stages.map((item, index) => {
    const isCompleted = index < completedCount || cargo.kargo_durumu === "teslim_edildi"
    const isActive = !isCompleted && index === completedCount

    return {
      ...item,
      done: isCompleted || isActive,
      status: isCompleted ? "completed" : isActive ? "active" : "pending",
    }
  })
}

const createDetailFromCargo = (cargo: CargoListItem): typeof shipmentDetailMockData => {
  const takipNo = cargo.takip_no.replace("ARF-", "")
  const upperReceiver = cargo.alici_musteri.toUpperCase()

  return {
    ...shipmentDetailMockData,
    takipNo,
    durum: cargoStatusLabels[cargo.kargo_durumu],
    gonderen: cargo.gonderen_musteri,
    alici: upperReceiver,
    gonderiTarihi: toDateTimeDisplay(cargo.olusturulma_zamani),
    odemeTuru: cargo.odeme_turu,
    faturaTuru: cargo.fatura_turu,
    faturaDurumu: cargo.fatura_durumu === "kesildi" ? "Kesildi" : "Kesilmedi",
    toplamTutar: toMoneyDisplay(cargo.toplam),
    parcaSayisi: String(cargo.t_adet),
    toplamDesi: String(cargo.t_desi),
    irsaliyeNo: cargo.irsaliye_no || "-",
    atfNo: cargo.atf_no || "-",
    olusturan: cargo.olusturan,
    rota: `${cargo.gonderen_sube} → ${cargo.alici_sube}`,
    transferHatti: `${cargo.gonderen_sube} TM → ${cargo.alici_sube} TM`,
    varisSubesi: cargo.alici_sube,
    takipGecmisi: buildTimelineFromCargo(cargo),
    senderInfo: {
      ...shipmentDetailMockData.senderInfo,
      displayName: cargo.gonderen_musteri,
      companyName: cargo.gonderen_musteri,
      contactName: cargo.gonderen_musteri,
      branch: cargo.gonderen_sube,
    },
    receiverInfo: {
      ...shipmentDetailMockData.receiverInfo,
      displayName: upperReceiver,
      contactName: cargo.alici_musteri,
      phone: cargo.alici_telefon.replace(/\s+/g, ""),
      branch: cargo.alici_sube,
    },
    parcaDetaylari: buildPieceRowsFromCargo(cargo),
  }
}

const timelineStatusStyles: Record<EventStatus, { card: string; iconWrap: string; icon: string; title: string; subtitleBadge: string; subtitleDot: string; line: string }> = {
  completed: {
    card: "border-primary/25 bg-primary/5",
    iconWrap: "border-primary/25 bg-primary/10",
    icon: "text-primary",
    title: "text-foreground",
    subtitleBadge: "border-primary/20 bg-background text-foreground/80",
    subtitleDot: "bg-primary",
    line: "bg-primary/40",
  },
  active: {
    card: "border-secondary/35 bg-secondary/10",
    iconWrap: "border-secondary/35 bg-secondary/20",
    icon: "text-foreground",
    title: "text-foreground",
    subtitleBadge: "border-secondary/30 bg-background text-foreground/80",
    subtitleDot: "bg-foreground/70",
    line: "bg-linear-to-r from-secondary to-border",
  },
  pending: {
    card: "border-border bg-muted/30",
    iconWrap: "border-border bg-background",
    icon: "text-muted-foreground",
    title: "text-muted-foreground",
    subtitleBadge: "border-border bg-background text-muted-foreground",
    subtitleDot: "bg-muted-foreground/50",
    line: "bg-border",
  },
}

function TimelineBlock({ items }: { items: EventItem[] }) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-[1080px] gap-3 px-1 py-1">
        {items.map((item, index) => (
          <div key={`${item.title}-${item.time}`} className="relative min-w-[200px] flex-1">
            <div className="relative z-10 mb-2.5 flex items-center gap-2">
              {(() => {
                const StageIcon = timelineStageIcon[item.stage]
                const style = timelineStatusStyles[item.status]

                return (
                  <>
                    <div className={`flex size-10 items-center justify-center rounded-full border-2 ${style.iconWrap}`}>
                      <StageIcon className={`size-5 ${style.icon}`} />
                    </div>
                    <p className={`text-xl font-semibold leading-tight tracking-tight lg:text-2xl ${style.title}`}>
                      {item.title}
                    </p>
                    {index < items.length - 1 && <div className={`ml-1 h-0.5 min-w-6 flex-1 ${style.line}`} />}
                  </>
                )
              })()}
            </div>

            <div className={`rounded-2xl border p-3 ${timelineStatusStyles[item.status].card}`}>
              {item.subtitle && (
                <div className={`mb-2 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${timelineStatusStyles[item.status].subtitleBadge}`}>
                  <span className={`size-1.5 rounded-full ${timelineStatusStyles[item.status].subtitleDot}`} />
                  {item.subtitle}
                </div>
              )}
              <p className="text-sm text-foreground/85">{item.description}</p>
              <p className="mt-2 text-xs font-medium text-muted-foreground">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DetailField({ label, value, fullWidth }: { label: string; value?: string; fullWidth?: boolean }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 ${fullWidth ? "md:col-span-2" : ""}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value || "-"}</p>
    </div>
  )
}

function PartyInfoCard({ title, party }: { title: string; party: PartyInfo }) {
  const typeLabel = party.customerType === "corporate" ? "Kurumsal" : "Bireysel"
  const typeBadgeClass =
    party.customerType === "corporate"
      ? "border-secondary/30 bg-secondary/12 text-foreground"
      : "border-primary/30 bg-primary/15 text-foreground"

  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-3 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h3>
          <div className="flex items-center gap-2">
            {party.customerId && (
              <Button variant="outline" size="sm" className="h-7 gap-1.5 rounded-lg text-xs" asChild>
                <Link href={ARF_ROUTES.cargo.sales.customerDetail(party.customerId)}>
                  <ExternalLink className="size-3.5" />
                  Müşteri Detay
                </Link>
              </Button>
            )}
            <Badge className={`rounded-lg border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${typeBadgeClass}`}>
              {typeLabel}
            </Badge>
          </div>
        </div>

        <div className="grid gap-2.5 md:grid-cols-2">
          <DetailField
            label={party.customerType === "corporate" ? "Şirket Ünvanı" : "Müşteri"}
            value={party.customerType === "corporate" ? party.companyName || party.displayName : party.displayName}
          />

          {party.customerType === "corporate" ? (
            <>
              <DetailField label="Yetkili" value={party.contactName} />
              <DetailField label="Vergi Numarası" value={party.taxNumber} />
              <DetailField label="Vergi Dairesi" value={party.taxOffice} />
              <DetailField label="E-posta" value={party.email || "-"} />
            </>
          ) : (
            <>
              <DetailField label="TC Kimlik No" value={party.tcIdentityNumber} />
              <DetailField label="E-posta" value={party.email || "-"} />
            </>
          )}

          <DetailField label="Telefon" value={party.phone} />
          <DetailField label="Şube" value={party.branch} />
          <DetailField label="İl" value={party.city} />
          <DetailField label="İlçe" value={party.district} />
          <DetailField label="Mahalle" value={party.neighborhood} />
          <DetailField label="Açık Adres" value={party.fullAddress} fullWidth />
        </div>
      </CardContent>
    </Card>
  )
}

export default function KargoDetayPage() {
  const params = useParams<{ id: string }>()
  const shipmentId = Array.isArray(params?.id) ? params.id[0] : params?.id

  const detailData = useMemo(() => {
    if (!shipmentId || shipmentId === "1") {
      return shipmentDetailMockData
    }

    const cargo = mockCargoList.find((item) => item.id === shipmentId)
    return cargo ? createDetailFromCargo(cargo) : shipmentDetailMockData
  }, [shipmentId])

  const [pieceTable, setPieceTable] = useState<TanStackTable<PieceDetailRow> | null>(null)
  const [pieceRows, setPieceRows] = useState<PieceDetailRow[]>(() => detailData.parcaDetaylari as PieceDetailRow[])
  const [pieceCancelInfoMap, setPieceCancelInfoMap] = useState<Record<string, PieceCancelInfo>>(mockPieceCancelInfoByPieceNo)
  const [, setPieceReportInfoMap] = useState<Record<string, PieceReportInfo>>({})
  const [pieceDeliveryInfoMap, setPieceDeliveryInfoMap] = useState<Record<string, PieceDeliveryInfo>>({})
  const [pieceCancelInfoModalData, setPieceCancelInfoModalData] = useState<PieceCancelInfoModalData | null>(null)
  const [deliveryInfoModalPiece, setDeliveryInfoModalPiece] = useState<PieceDetailRow | null>(null)
  const [reportInfoModalPiece, setReportInfoModalPiece] = useState<PieceDetailRow | null>(null)
  const [deliveryEntryModalOpen, setDeliveryEntryModalOpen] = useState(false)
  const [deliveryEntryPieceNos, setDeliveryEntryPieceNos] = useState<string[]>([])
  const [deliveryEntryInitialValues, setDeliveryEntryInitialValues] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  })
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportPieceNos, setReportPieceNos] = useState<string[]>([])
  const [reportInitialValues, setReportInitialValues] = useState({
    reason: "hasarli_kargo" as const,
    description: "",
  })
  const [pieceCancelModalOpen, setPieceCancelModalOpen] = useState(false)
  const [pieceCancelPieceNos, setPieceCancelPieceNos] = useState<string[]>([])
  const [pieceCancelInitialValues, setPieceCancelInitialValues] = useState({
    category: "operasyonel" as const,
    reason: "musteri_talebi" as const,
    note: "",
  })
  const [handoverModalOpen, setHandoverModalOpen] = useState(false)
  const [handoverInfoModalOpen, setHandoverInfoModalOpen] = useState(false)
  const [shipmentHandoverInfo, setShipmentHandoverInfo] = useState<ShipmentHandoverInfo | null>(null)
  const [handoverInitialValues, setHandoverInitialValues] = useState({
    reason: "musteri_adreste_degil" as const,
    note: "",
  })
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelInfoModalOpen, setCancelInfoModalOpen] = useState(false)
  const [shipmentCancelInfo, setShipmentCancelInfo] = useState<ShipmentCancelInfo | null>(null)
  const [cancelInitialValues, setCancelInitialValues] = useState({
    category: "operasyonel" as const,
    reason: "musteri_talebi" as const,
    note: "",
  })
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState("")
  const [bulkActionNotice, setBulkActionNotice] = useState("")
  const [headerActionNotice, setHeaderActionNotice] = useState("")

  const {
    loading,
    submitDeliveryEntry,
    submitPieceReport,
    submitPieceCancel,
    submitShipmentHandover,
    submitShipmentCancel,
  } = usePieceActions()

  const hasShipmentHandover = Boolean(shipmentHandoverInfo)
  const hasShipmentCancel = Boolean(shipmentCancelInfo)
  const canceledPieceCount = pieceRows.filter((piece) => piece.parca_durumu === "iptal_edildi").length
  const hasPartialPieceCancel = canceledPieceCount > 0 && canceledPieceCount < pieceRows.length
  const reportedPieceCount = pieceRows.filter((piece) => piece.ihbar_edildi).length
  const hasArrivalInfo = pieceRows.some((piece) => Boolean(piece.varis_zamani && piece.varis_zamani !== "-"))
  const primaryCargoStatus = useMemo<PrimaryCargoStatus>(() => {
    if (hasShipmentCancel) {
      return "kargo_iptal"
    }

    if (hasShipmentHandover) {
      return "devredildi"
    }

    return resolvePrimaryCargoStatus(detailData.durum, hasArrivalInfo)
  }, [detailData.durum, hasArrivalInfo, hasShipmentCancel, hasShipmentHandover])
  const primaryCargoStatusBadge = primaryCargoStatusConfig[primaryCargoStatus]

  const pieceCancelStorageKey = `shipment-piece-cancel-info:${detailData.takipNo}`
  const pieceReportStorageKey = `shipment-piece-report-info:${detailData.takipNo}`
  const pieceDeliveryStorageKey = `shipment-piece-delivery-info:${detailData.takipNo}`

  useEffect(() => {
    setPieceRows(detailData.parcaDetaylari as PieceDetailRow[])
  }, [detailData.takipNo, detailData.parcaDetaylari])

  useEffect(() => {
    try {
      const storedHandoverInfo = localStorage.getItem(`shipment-handover-info:${detailData.takipNo}`)
      if (!storedHandoverInfo) {
        setShipmentHandoverInfo(null)
        return
      }

      const parsed = JSON.parse(storedHandoverInfo) as ShipmentHandoverInfo
      setShipmentHandoverInfo(parsed)
    } catch {
      // ignore storage read errors in demo flow
    }
  }, [detailData.takipNo])

  useEffect(() => {
    try {
      const storedCancelInfo = localStorage.getItem(`shipment-cancel-info:${detailData.takipNo}`)
      if (!storedCancelInfo) {
        setShipmentCancelInfo(null)
        return
      }

      const parsed = JSON.parse(storedCancelInfo) as ShipmentCancelInfo
      setShipmentCancelInfo(parsed)
      setPieceRows((prev) => prev.map((piece) => ({ ...piece, parca_durumu: "iptal_edildi" })))
    } catch {
      // ignore storage read errors in demo flow
    }
  }, [detailData.takipNo])

  useEffect(() => {
    try {
      const storedPieceCancelInfo = localStorage.getItem(pieceCancelStorageKey)
      const parsed = storedPieceCancelInfo ? (JSON.parse(storedPieceCancelInfo) as Record<string, PieceCancelInfo>) : {}
      const merged = { ...mockPieceCancelInfoByPieceNo, ...parsed }
      setPieceCancelInfoMap(merged)
      setPieceRows((prev) =>
        prev.map((piece) =>
          merged[piece.parca_no]
            ? {
                ...piece,
                parca_durumu: "iptal_edildi",
                guncellenme_zamani: merged[piece.parca_no].canceledAt || piece.guncellenme_zamani,
              }
            : piece,
        ),
      )
    } catch {
      // ignore storage read errors in demo flow
    }
  }, [pieceCancelStorageKey])

  useEffect(() => {
    try {
      const storedPieceReportInfo = localStorage.getItem(pieceReportStorageKey)
      const parsed = storedPieceReportInfo ? (JSON.parse(storedPieceReportInfo) as Record<string, PieceReportInfo>) : {}
      setPieceReportInfoMap(parsed)
      setPieceRows((prev) =>
        prev.map((piece) => {
          const reportInfo = parsed[piece.parca_no]
          if (!reportInfo) {
            return piece
          }

          return {
            ...piece,
            ihbar_edildi: true,
            ihbar_zamani: reportInfo.reportTime,
            ihbar_sebebi: reportInfo.reason,
            ihbar_aciklama: reportInfo.description,
            ihbar_kanit_url: reportInfo.evidenceImageUrl || piece.ihbar_kanit_url,
          }
        }),
      )
    } catch {
      // ignore storage read errors in demo flow
    }
  }, [pieceReportStorageKey])

  useEffect(() => {
    try {
      const storedPieceDeliveryInfo = localStorage.getItem(pieceDeliveryStorageKey)
      const parsed = storedPieceDeliveryInfo ? (JSON.parse(storedPieceDeliveryInfo) as Record<string, PieceDeliveryInfo>) : {}
      setPieceDeliveryInfoMap(parsed)
      setPieceRows((prev) =>
        prev.map((piece) => {
          const deliveryInfo = parsed[piece.parca_no]
          if (!deliveryInfo) {
            return piece
          }

          return {
            ...piece,
            parca_durumu: piece.parca_durumu === "iptal_edildi" ? piece.parca_durumu : "teslim_edildi",
            guncellenme_zamani: deliveryInfo.deliveryTime || piece.guncellenme_zamani,
            teslimat_zamani: deliveryInfo.deliveryTime || piece.teslimat_zamani,
            teslim_alan_ad: deliveryInfo.firstName || piece.teslim_alan_ad,
            teslim_alan_soyad: deliveryInfo.lastName || piece.teslim_alan_soyad,
            teslim_alan_telefonu: deliveryInfo.phone || piece.teslim_alan_telefonu,
            teslimat_resmi_url: deliveryInfo.imageUrl || piece.teslimat_resmi_url,
          }
        }),
      )
    } catch {
      // ignore storage read errors in demo flow
    }
  }, [pieceDeliveryStorageKey])

  const timelineItems = useMemo<EventItem[]>(() => {
    const baseItems = (detailData.takipGecmisi as EventItem[]).map((item): EventItem => ({ ...item }))

    if (shipmentHandoverInfo) {
      const handoverItem: EventItem = {
        title: "Devredildi",
        description: `Gönderi kurye tarafından ${shipmentHandoverInfo.receiverBranch} alıcı şubesine devredildi.`,
        time: shipmentHandoverInfo.transferredAt,
        stage: "devredildi",
        status: "active",
        subtitle: `İşlemi Yapan: ${shipmentHandoverInfo.transferredBy}`,
      }

      const dispatchIndex = baseItems.findIndex((item) => item.stage === "dagitimda")
      const handoverInsertIndex = dispatchIndex >= 0 ? dispatchIndex : baseItems.length
      baseItems.splice(handoverInsertIndex, 0, handoverItem)

      if (dispatchIndex >= 0 && baseItems[handoverInsertIndex + 1]) {
        baseItems[handoverInsertIndex + 1] = {
          ...baseItems[handoverInsertIndex + 1],
          status: "pending",
          done: false,
          description: "Gönderi devredildiği için dağıtım süreci devralan şubede devam eder.",
          time: "-",
        }
      }
    }

    if (shipmentCancelInfo) {
      const cancelItem: EventItem = {
        title: "İptal Edildi",
        description: `Gönderi iptal edildi. Kategori: ${shipmentCancelInfo.category}. Neden: ${shipmentCancelInfo.reason}.`,
        time: shipmentCancelInfo.canceledAt,
        stage: "iptal",
        status: "active",
        subtitle: `İşlemi Yapan: ${shipmentCancelInfo.canceledBy}`,
      }

      const handoverIndex = baseItems.findIndex((item) => item.stage === "devredildi")
      const arrivalIndex = baseItems.findIndex((item) => item.stage === "varis")
      const cancelInsertIndex = handoverIndex >= 0 ? handoverIndex + 1 : arrivalIndex >= 0 ? arrivalIndex + 1 : baseItems.length
      baseItems.splice(cancelInsertIndex, 0, cancelItem)

      for (let index = cancelInsertIndex + 1; index < baseItems.length; index += 1) {
        baseItems[index] = {
          ...baseItems[index],
          status: "pending",
          done: false,
          time: "-",
          description: "Kargo iptal edildiği için bu adım tamamlanmadı.",
        }
      }
    }

    return baseItems
  }, [shipmentCancelInfo, shipmentHandoverInfo])

  const handlePieceTableReady = useCallback((nextTable: TanStackTable<PieceDetailRow>) => {
    setPieceTable(nextTable)
  }, [detailData.takipNo])

  const hasDeliveryInfo = useCallback((piece: PieceDetailRow) => {
    if (pieceDeliveryInfoMap[piece.parca_no]) {
      return true
    }

    return [piece.teslimat_zamani, piece.teslim_alan_ad, piece.teslim_alan_soyad, piece.teslim_alan_telefonu, piece.teslimat_resmi_url]
      .some((value) => Boolean(value && value !== "-"))
  }, [pieceDeliveryInfoMap])

  const deliveryPieces = useMemo(() => pieceRows.filter((piece) => hasDeliveryInfo(piece)), [hasDeliveryInfo, pieceRows])
  const pendingDeliveryPieces = useMemo(() => pieceRows.filter((piece) => !hasDeliveryInfo(piece)), [hasDeliveryInfo, pieceRows])
  const totalPieceCount = pieceRows.length
  const deliveredPieceCount = deliveryPieces.length
  const pendingPieceCount = pendingDeliveryPieces.length
  const deliveryRate = totalPieceCount > 0 ? Math.round((deliveredPieceCount / totalPieceCount) * 100) : 0
  const hasPartialDelivery = deliveredPieceCount > 0 && pendingPieceCount > 0

  const openSinglePieceDeliveryModal = useCallback((piece: PieceDetailRow) => {
    setBulkActionNotice("")
    setDeliveryEntryPieceNos([piece.parca_no])
    setDeliveryEntryInitialValues({
      firstName: piece.teslim_alan_ad && piece.teslim_alan_ad !== "-" ? piece.teslim_alan_ad : "",
      lastName: piece.teslim_alan_soyad && piece.teslim_alan_soyad !== "-" ? piece.teslim_alan_soyad : "",
      phone: piece.teslim_alan_telefonu && piece.teslim_alan_telefonu !== "-" ? piece.teslim_alan_telefonu : "",
    })
    setDeliveryEntryModalOpen(true)
  }, [])

  const handleOpenDeliveryEntryModal = useCallback(() => {
    const selectedRows = pieceTable?.getSelectedRowModel().rows.map((row) => row.original) ?? []
    if (selectedRows.length === 0) {
      setBulkActionNotice("Teslim Et için en az bir parça seçin.")
      return
    }

    setBulkActionNotice("")
    const targetRows = selectedRows
    const firstPiece = targetRows[0]

    setDeliveryEntryPieceNos(targetRows.map((piece) => piece.parca_no))
    setDeliveryEntryInitialValues({
      firstName: firstPiece?.teslim_alan_ad && firstPiece.teslim_alan_ad !== "-" ? firstPiece.teslim_alan_ad : "",
      lastName: firstPiece?.teslim_alan_soyad && firstPiece.teslim_alan_soyad !== "-" ? firstPiece.teslim_alan_soyad : "",
      phone:
        firstPiece?.teslim_alan_telefonu && firstPiece.teslim_alan_telefonu !== "-" ? firstPiece.teslim_alan_telefonu : "",
    })
    setDeliveryEntryModalOpen(true)
  }, [pieceTable])

  const handleOpenReportModal = useCallback(() => {
    const selectedRows = pieceTable?.getSelectedRowModel().rows.map((row) => row.original) ?? []
    if (selectedRows.length === 0) {
      setBulkActionNotice("İhbar Et için en az bir parça seçin.")
      return
    }

    setBulkActionNotice("")
    setReportPieceNos(selectedRows.map((piece) => piece.parca_no))
    setReportInitialValues({ reason: "hasarli_kargo", description: "" })
    setReportModalOpen(true)
  }, [pieceTable])

  const handleOpenPieceCancelModal = useCallback(() => {
    const selectedRows = pieceTable?.getSelectedRowModel().rows.map((row) => row.original) ?? []
    if (selectedRows.length === 0) {
      setBulkActionNotice("Parça İptal için en az bir parça seçin.")
      return
    }

    const cancellableRows = selectedRows.filter((piece) => piece.parca_durumu !== "iptal_edildi")
    if (cancellableRows.length === 0) {
      setBulkActionNotice("Seçili parçalar zaten iptal edildi.")
      return
    }

    setBulkActionNotice("")
    setPieceCancelPieceNos(cancellableRows.map((piece) => piece.parca_no))
    setPieceCancelInitialValues({
      category: "operasyonel",
      reason: "musteri_talebi",
      note: "",
    })
    setPieceCancelModalOpen(true)
  }, [pieceTable])

  const handleConfirmDeliveryEntry = useCallback(
    (values: { firstName: string; lastName: string; phone: string }) => {
      if (loading.deliveryEntry) {
        return
      }

      void (async () => {
        const result = await submitDeliveryEntry({
          pieceNos: deliveryEntryPieceNos,
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
        })

        if (result.ok) {
          const deliveryTime = new Date().toLocaleString("tr-TR")
          const deliveryInfo: PieceDeliveryInfo = {
            firstName: values.firstName || "-",
            lastName: values.lastName || "-",
            deliveryTime,
            phone: values.phone || "-",
            imageUrl: "",
          }

          setPieceRows((prev) =>
            prev.map((piece) =>
              deliveryEntryPieceNos.includes(piece.parca_no)
                ? {
                    ...piece,
                    parca_durumu: piece.parca_durumu === "iptal_edildi" ? piece.parca_durumu : "teslim_edildi",
                    guncellenme_zamani: deliveryTime,
                    teslimat_zamani: deliveryTime,
                    teslim_alan_ad: deliveryInfo.firstName,
                    teslim_alan_soyad: deliveryInfo.lastName,
                    teslim_alan_telefonu: deliveryInfo.phone,
                  }
                : piece,
            ),
          )

          try {
            const storedDeliveryInfo = localStorage.getItem(pieceDeliveryStorageKey)
            const parsed = storedDeliveryInfo ? (JSON.parse(storedDeliveryInfo) as Record<string, PieceDeliveryInfo>) : {}
            const next = { ...parsed }

            deliveryEntryPieceNos.forEach((pieceNo) => {
              next[pieceNo] = deliveryInfo
            })

            localStorage.setItem(pieceDeliveryStorageKey, JSON.stringify(next))
            setPieceDeliveryInfoMap(next)
          } catch {
            // ignore storage write errors in demo flow
          }

          setDeliveryEntryModalOpen(false)
          setBulkActionNotice("")
          return
        }

        setBulkActionNotice(`Hata: ${result.message || "Teslimat bilgisi kaydedilemedi."}`)
      })()
    },
    [deliveryEntryPieceNos, loading.deliveryEntry, pieceDeliveryStorageKey, submitDeliveryEntry],
  )

  const handleConfirmPieceReport = useCallback(
    (values: { reason: string; description: string }) => {
      if (loading.pieceReport) {
        return
      }

      void (async () => {
        const result = await submitPieceReport({
          pieceNos: reportPieceNos,
          reason: values.reason,
          description: values.description,
        })

        if (result.ok) {
          const reportTime = new Date().toLocaleString("tr-TR")
          const reportInfo: PieceReportInfo = {
            reportTime,
            reason: pieceReportReasonLabels[values.reason] || values.reason,
            description: values.description || "-",
            evidenceImageUrl: "",
          }

          setPieceRows((prev) =>
            prev.map((piece) =>
              reportPieceNos.includes(piece.parca_no)
                ? {
                    ...piece,
                    ihbar_edildi: true,
                    ihbar_zamani: reportTime,
                    ihbar_sebebi: reportInfo.reason,
                    ihbar_aciklama: reportInfo.description,
                    ihbar_kanit_url: reportInfo.evidenceImageUrl || piece.ihbar_kanit_url,
                    guncellenme_zamani: reportTime,
                  }
                : piece,
            ),
          )

          try {
            const storedPieceReportInfo = localStorage.getItem(pieceReportStorageKey)
            const parsed = storedPieceReportInfo ? (JSON.parse(storedPieceReportInfo) as Record<string, PieceReportInfo>) : {}
            const next = { ...parsed }
            reportPieceNos.forEach((pieceNo) => {
              next[pieceNo] = reportInfo
            })
            localStorage.setItem(pieceReportStorageKey, JSON.stringify(next))
            setPieceReportInfoMap(next)
          } catch {
            // ignore storage write errors in demo flow
          }

          setReportModalOpen(false)
          setBulkActionNotice("")
          return
        }

        setBulkActionNotice(`Hata: ${result.message || "Parça ihbarı kaydedilemedi."}`)
      })()
    },
    [loading.pieceReport, pieceReportStorageKey, reportPieceNos, submitPieceReport],
  )

  const handleConfirmPieceCancel = useCallback(
    (values: { category: string; reason: string; note: string }) => {
      if (loading.pieceCancel) {
        return
      }

      void (async () => {
        const result = await submitPieceCancel({
          pieceNos: pieceCancelPieceNos,
          reason: values.reason,
          note: values.note,
        })

        if (result.ok) {
          const cancelTime = new Date().toLocaleString("tr-TR")
          const categoryLabel = pieceCancelCategoryLabels[values.category] || values.category
          const reasonLabel = pieceCancelReasonLabels[values.reason] || values.reason
          const cancelInfo: PieceCancelInfo = {
            canceledAt: cancelTime,
            canceledBy: "Operasyon Merkezi",
            category: categoryLabel,
            reason: reasonLabel,
            note: values.note,
          }

          setPieceRows((prev) =>
            prev.map((piece) =>
              pieceCancelPieceNos.includes(piece.parca_no)
                ? {
                    ...piece,
                    parca_durumu: "iptal_edildi",
                    guncellenme_zamani: cancelTime,
                  }
                : piece,
            ),
          )

          try {
            const storedPieceCancelInfo = localStorage.getItem(pieceCancelStorageKey)
            const parsed = storedPieceCancelInfo ? (JSON.parse(storedPieceCancelInfo) as Record<string, PieceCancelInfo>) : {}
            const next = { ...parsed }
            pieceCancelPieceNos.forEach((pieceNo) => {
              next[pieceNo] = cancelInfo
            })
            localStorage.setItem(pieceCancelStorageKey, JSON.stringify(next))
          } catch {
            // ignore storage write errors in demo flow
          }

          setPieceCancelInfoMap((prev) => {
            const next = { ...prev }
            pieceCancelPieceNos.forEach((pieceNo) => {
              next[pieceNo] = cancelInfo
            })
            return next
          })

          setPieceCancelModalOpen(false)
          setBulkActionNotice("")
          return
        }

        setBulkActionNotice(`Hata: ${result.message || "Parça iptal talebi gönderilemedi."}`)
      })()
    },
    [loading.pieceCancel, pieceCancelPieceNos, pieceCancelStorageKey, submitPieceCancel],
  )

  const handleConfirmShipmentHandover = useCallback(
    (values: { reason: string; note?: string }) => {
      if (loading.shipmentHandover) {
        return
      }

      void (async () => {
        const result = await submitShipmentHandover({
          trackingNo: detailData.takipNo,
          reason: values.reason,
          note: values.note ?? "",
        })

        if (result.ok) {
          const transferTime = new Date().toLocaleString("tr-TR")
          const handoverInfo: ShipmentHandoverInfo = {
            transferredAt: transferTime,
            transferredBy: "Kurye",
            receiverBranch: detailData.receiverInfo.branch,
            reason: handoverReasonLabels[values.reason] || values.reason,
            note: values.note ?? "",
          }

          setShipmentHandoverInfo(handoverInfo)
          try {
            localStorage.setItem(`shipment-handover-info:${detailData.takipNo}`, JSON.stringify(handoverInfo))
          } catch {
            // ignore storage write errors in demo flow
          }
          setHandoverModalOpen(false)
          setHeaderActionNotice("")
          return
        }

        setHeaderActionNotice(`Hata: ${result.message || "Kargo devretme talebi gönderilemedi."}`)
      })()
    },
    [detailData.receiverInfo.branch, detailData.takipNo, loading.shipmentHandover, submitShipmentHandover],
  )

  const handleConfirmShipmentCancel = useCallback(
    (values: { category: string; reason: string; note: string }) => {
      if (loading.shipmentCancel) {
        return
      }

      void (async () => {
        const result = await submitShipmentCancel({
          trackingNo: detailData.takipNo,
          reason: values.reason,
          note: values.note,
        })

        if (result.ok) {
          const cancelTime = new Date().toLocaleString("tr-TR")
          const cancelInfo: ShipmentCancelInfo = {
            canceledAt: cancelTime,
            canceledBy: "Operasyon Merkezi",
            category: cancelCategoryLabels[values.category] || values.category,
            reason: cancelReasonLabels[values.reason] || values.reason,
            note: values.note,
          }

          setShipmentCancelInfo(cancelInfo)
          setPieceRows((prev) => prev.map((piece) => ({ ...piece, parca_durumu: "iptal_edildi" })))
          try {
            localStorage.setItem(`shipment-cancel-info:${detailData.takipNo}`, JSON.stringify(cancelInfo))
          } catch {
            // ignore storage write errors in demo flow
          }
          setCancelModalOpen(false)
          setHeaderActionNotice("")
          return
        }

        setHeaderActionNotice(`Hata: ${result.message || "Kargo iptal işlemi tamamlanamadı."}`)
      })()
    },
    [detailData.takipNo, loading.shipmentCancel, submitShipmentCancel],
  )

  const pieceColumns = useMemo<ColumnDef<PieceDetailRow>[]>(
    () => [
      createSelectionColumn<PieceDetailRow>(),
      {
        accessorKey: "parca_no",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Parça No" />,
        cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.original.parca_no}</span>,
      },
      {
        accessorKey: "parca_durumu",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Parça Durumu" />,
        cell: ({ row }) => {
          if (row.original.parca_durumu === "iptal_edildi") {
            const hasPieceLevelCancel = Boolean(pieceCancelInfoMap[row.original.parca_no])
            const cancelLabel = hasPieceLevelCancel ? "Parça İptal" : "Kargo İptal"

            return (
              <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">
                {cancelLabel}
              </Badge>
            )
          }

          const status = pieceStatusConfig[row.original.parca_durumu]
          return (
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
          )
        },
      },
      {
        accessorKey: "parca_tipi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Parça Tipi" />,
      },
      {
        accessorKey: "desi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Desi" />,
        cell: ({ row }) => <span className="tabular-nums">{row.original.desi}</span>,
      },
      {
        accessorKey: "agirlik",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ağırlık" />,
        cell: ({ row }) => <span className="tabular-nums">{row.original.agirlik}</span>,
      },
      {
        accessorKey: "guncellenme_zamani",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Son İşlem Zamanı" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.guncellenme_zamani}</span>,
      },
      {
        id: "teslimat_bilgi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Teslimat" />,
        enableSorting: false,
        enableHiding: false,
        size: 136,
        cell: ({ row }) => {
          if (!hasDeliveryInfo(row.original)) {
            return (
              <span className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400">
                <Minus className="size-3.5 stroke-[2.5]" />
              </span>
            )
          }

          return (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-lg border-emerald-200 bg-emerald-50 px-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
              aria-label="Teslimat bilgisini görüntüle"
              onClick={() => setDeliveryInfoModalPiece(row.original)}
            >
              <Truck className="mr-1 size-3.5" />
              Teslim
            </Button>
          )
        },
      },
      {
        id: "ihbar_bilgi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="İhbar" />,
        enableSorting: false,
        size: 120,
        cell: ({ row }) => {
          if (!row.original.ihbar_edildi) {
            return (
              <span className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400">
                <Minus className="size-3.5 stroke-[2.5]" />
              </span>
            )
          }

          return (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-lg border-amber-200 bg-amber-50 px-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 hover:text-amber-800"
              aria-label="İhbar bilgisini görüntüle"
              onClick={() => setReportInfoModalPiece(row.original)}
            >
              <AlertTriangle className="mr-1 size-3.5" />
              İhbar
            </Button>
          )
        },
      },
      {
        id: "iptal_bilgi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="İptal" />,
        enableSorting: false,
        size: 120,
        cell: ({ row }) => {
          const cancelInfo = pieceCancelInfoMap[row.original.parca_no]
          if (!cancelInfo) {
            return (
              <span className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400">
                <Minus className="size-3.5 stroke-[2.5]" />
              </span>
            )
          }

          return (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-lg border-rose-200 bg-rose-50 px-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 hover:text-rose-800"
              aria-label="Parça iptal bilgisini görüntüle"
              onClick={() => setPieceCancelInfoModalData({ pieceNo: row.original.parca_no, info: cancelInfo })}
            >
              <Ban className="mr-1 size-3.5" />
              İptal
            </Button>
          )
        },
      },
      {
        id: "actions",
        header: "Detay",
        enableSorting: false,
        enableHiding: false,
        size: 110,
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-lg border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            asChild
          >
            <Link href={`/arf/cargo/shipments/pieces/${row.original.id}`} aria-label="Parça detayına git">
              <Eye className="mr-1 size-3.5" />
              Detay
            </Link>
          </Button>
        ),
      },
    ],
    [hasDeliveryInfo, pieceCancelInfoMap, shipmentCancelInfo],
  )

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Kargo İşlemleri", href: "/arf/cargo/shipments" },
          { label: `Takip ${detailData.takipNo}` },
        ]}
      />

      <div className="flex flex-1 flex-col gap-3 bg-slate-50 p-3 pt-2.5 lg:gap-4">
        <Card className="relative overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
          <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-0 size-72 rounded-full bg-secondary/10 blur-3xl" />

          <CardContent className="relative space-y-3 p-3.5 lg:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">Takip No: {detailData.takipNo}</h1>
                  <Badge className={`rounded-lg border px-2.5 py-0.5 text-xs font-medium ${primaryCargoStatusBadge.className}`}>
                    {primaryCargoStatusBadge.label}
                  </Badge>
                  {hasPartialPieceCancel && (
                    <Badge className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                      Kısmi İptal ({canceledPieceCount}/{pieceRows.length})
                    </Badge>
                  )}
                  {reportedPieceCount > 0 && (
                    <Badge className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      İhbar ({reportedPieceCount} Parçada)
                    </Badge>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-slate-600">
                  Gönderen: {detailData.gonderen} · Alıcı: {detailData.alici}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button className="h-9 rounded-lg px-3.5 text-sm font-semibold">
                  <Printer className="size-4" />
                  Bilgi Fişi
                </Button>
                {hasShipmentHandover ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-lg px-3.5 text-sm font-semibold"
                    onClick={() => setHandoverInfoModalOpen(true)}
                  >
                    <Eye className="size-4" />
                    Devir Bilgi
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-lg px-3.5 text-sm font-semibold"
                    onClick={() => {
                      setHeaderActionNotice("")
                      setHandoverInitialValues({ reason: "musteri_adreste_degil", note: "" })
                      setHandoverModalOpen(true)
                    }}
                  >
                    <ArrowRightLeft className="size-4" />
                    Devret
                  </Button>
                )}
                {hasShipmentCancel ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-lg border-rose-200 px-3.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                    onClick={() => setCancelInfoModalOpen(true)}
                  >
                    <Eye className="size-4" />
                    İptal Bilgi
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 rounded-lg border-rose-200 px-3.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                    onClick={() => {
                      setHeaderActionNotice("")
                      setCancelInitialValues({ category: "operasyonel", reason: "musteri_talebi", note: "" })
                      setCancelModalOpen(true)
                    }}
                  >
                    <Ban className="size-4" />
                    İptal
                  </Button>
                )}
                <Button variant="outline" className="h-9 rounded-lg px-3.5 text-sm font-semibold" aria-label="Takip linkini kopyala">
                  <Copy className="size-4" />
                  Takip Linki
                </Button>
              </div>
            </div>

            {headerActionNotice && (
              <p className={`text-xs font-medium ${headerActionNotice.startsWith("Hata:") ? "text-rose-600" : "text-emerald-700"}`}>
                {headerActionNotice}
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoCell label="Rota" value={detailData.rota} compact />
              <InfoCell label="Toplam Parça Sayısı" value={detailData.parcaSayisi} />
              <InfoCell label="Toplam Desi" value={detailData.toplamDesi} />
              <InfoCell label="Toplam Tutar" value={detailData.toplamTutar} />
              <InfoCell label="İrsaliye No" value={detailData.irsaliyeNo} />
              <InfoCell label="ATF No" value={detailData.atfNo} />
              <InfoCell label="Oluşturulma Zamanı" value={detailData.gonderiTarihi} />
              <InfoCell label="Oluşturan" value={detailData.olusturan} />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="details" className="space-y-3">
          <TabsList className="grid h-10 w-full grid-cols-5 rounded-xl border border-slate-200 bg-slate-100 p-0.5">
            <TabsTrigger
              value="details"
              className="rounded-lg border border-transparent text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Detaylar
            </TabsTrigger>
            <TabsTrigger
              value="delivery-info"
              className="rounded-lg border border-transparent text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Teslimat Bilgi
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="rounded-lg border border-transparent text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Fatura
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="rounded-lg border border-transparent text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Hareketler
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="rounded-lg border border-transparent text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              Notlar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-2">
              <PartyInfoCard title="Gönderici Bilgileri" party={detailData.senderInfo as PartyInfo} />
              <PartyInfoCard title="Alıcı Bilgileri" party={detailData.receiverInfo as PartyInfo} />
            </div>

            <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-3 p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">Parça Detayları</h3>
                  {canceledPieceCount > 0 && (
                    <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">
                      İptal Parça: {canceledPieceCount}/{pieceRows.length}
                    </Badge>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                  <div className="flex flex-wrap gap-2">
                    <Button className="h-9 rounded-xl px-3.5 text-sm font-semibold shadow-sm">
                      <Printer className="size-4" />
                      Barkod Yazdır
                    </Button>
                    <Button
                      variant="outline"
                      className="h-9 rounded-xl border-slate-300 bg-white px-3.5 text-sm font-semibold hover:bg-slate-50"
                      onClick={handleOpenDeliveryEntryModal}
                    >
                      <CheckCircle2 className="size-4" />
                      Teslim Et
                    </Button>
                    <Button
                      variant="outline"
                      className="h-9 rounded-xl border-rose-200 bg-rose-50/70 px-3.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                      onClick={handleOpenReportModal}
                    >
                      <AlertTriangle className="size-4" />
                      İhbar Et
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-xl border-rose-200 bg-rose-50/70 px-3.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                      onClick={handleOpenPieceCancelModal}
                    >
                      <Ban className="size-4" />
                      Parça İptal
                    </Button>
                  </div>
                </div>

                {bulkActionNotice && <p className="text-xs font-medium text-rose-600">{bulkActionNotice}</p>}

                <DataTable
                  data={pieceRows}
                  columns={pieceColumns}
                  enableSorting
                  enableGlobalFilter
                  enableColumnVisibility
                  enableHorizontalScroll
                  stickyRightColumnCount={4}
                  enableRowSelection
                  className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
                  emptyMessage="Gösterilecek parça bulunamadı."
                  onTableReady={handlePieceTableReady}
                />

                {pieceTable && (
                  <DataTablePagination
                    table={pieceTable as TanStackTable<unknown>}
                    pageSizeOptions={[5, 10, 20]}
                    totalRows={pieceRows.length}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery-info" className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Toplam Parça" value={String(totalPieceCount)} />
              <StatCard label="Teslim Edilen" value={String(deliveredPieceCount)} />
              <StatCard label="Teslim Edilmeyen" value={String(pendingPieceCount)} />
              <StatCard label="Teslimat Oranı" value={`%${deliveryRate}`} />
            </div>

            <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
              <CardContent className="p-3.5">
                {hasPartialDelivery ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                    <div className="flex items-center gap-2 font-semibold">
                      <AlertTriangle className="size-4" />
                      Kısmi teslimat var
                    </div>
                    <p className="mt-1">
                      {deliveredPieceCount}/{totalPieceCount} parça teslim edildi, {pendingPieceCount} parça için teslimat bekleniyor.
                    </p>
                  </div>
                ) : deliveredPieceCount === totalPieceCount && totalPieceCount > 0 ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
                    <div className="flex items-center gap-2 font-semibold">
                      <CheckCircle2 className="size-4" />
                      Tüm parçalar teslim edildi
                    </div>
                    <p className="mt-1">Bu gönderideki tüm parçalara ait teslimat bilgileri tamamlandı.</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                    <div className="flex items-center gap-2 font-semibold">
                      <Package className="size-4" />
                      Henüz teslimat yapılmadı
                    </div>
                    <p className="mt-1">Bu gönderide teslimat kaydı bulunan parça bulunmuyor.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-3 lg:grid-cols-2">
              <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-3 p-3.5">
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">Teslim Edilen Parçalar</h3>
                  {deliveryPieces.length === 0 ? (
                    <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                      Teslimat bilgisi girilmiş parça yok.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {deliveryPieces.map((piece) => (
                        <div key={`delivered-${piece.parca_no}`} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-xs text-slate-500">Parça No</p>
                              <p className="text-sm font-semibold text-slate-900">{piece.parca_no}</p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 rounded-lg px-2.5 text-xs font-semibold"
                              onClick={() => setDeliveryInfoModalPiece(piece)}
                            >
                              <Eye className="size-3.5" />
                              Teslim Bilgi
                            </Button>
                          </div>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            <div>
                              <p className="text-[11px] text-slate-500">Teslimat Zamanı</p>
                              <p className="text-sm font-medium text-slate-800">{piece.teslimat_zamani || "-"}</p>
                            </div>
                            <div>
                              <p className="text-[11px] text-slate-500">Teslim Alan</p>
                              <p className="text-sm font-medium text-slate-800">
                                {`${piece.teslim_alan_ad || ""} ${piece.teslim_alan_soyad || ""}`.trim() || "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-3 p-3.5">
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">Teslimat Bekleyen Parçalar</h3>
                  {pendingDeliveryPieces.length === 0 ? (
                    <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
                      Bekleyen parça bulunmuyor.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {pendingDeliveryPieces.map((piece) => (
                        <div key={`pending-${piece.parca_no}`} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-xs text-slate-500">Parça No</p>
                              <p className="text-sm font-semibold text-slate-900">{piece.parca_no}</p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 rounded-lg px-2.5 text-xs font-semibold"
                              onClick={() => openSinglePieceDeliveryModal(piece)}
                            >
                              <CheckCircle2 className="size-3.5" />
                              Teslim Et
                            </Button>
                          </div>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            <div>
                              <p className="text-[11px] text-slate-500">Parça Tipi</p>
                              <p className="text-sm font-medium text-slate-800">{piece.parca_tipi}</p>
                            </div>
                            <div>
                              <p className="text-[11px] text-slate-500">Son İşlem</p>
                              <p className="text-sm font-medium text-slate-800">{piece.guncellenme_zamani || "-"}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-3">
              <StatCard label="Ara Toplam" value="333 ₺" />
              <StatCard label="KDV" value="66,6 ₺" />
              <StatCard label="Genel Toplam" value="399,6 ₺" />
            </div>

            <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
              <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-3 p-3.5">
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">Faturalama Bilgileri</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                      <p className="text-xs text-slate-500">Fatura Kesilecek Müşteri</p>
                      <p className="text-base font-semibold leading-tight tracking-tight text-slate-900">{detailData.gonderen}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                      <p className="text-xs text-slate-500">Ödeme Türü</p>
                      <p className="text-base font-semibold leading-tight tracking-tight text-slate-900">{detailData.odemeTuru}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                      <p className="text-xs text-slate-500">Fatura Türü</p>
                      <p className="text-base font-semibold leading-tight tracking-tight text-slate-900">{detailData.faturaTuru}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                      <p className="text-xs text-slate-500">Fatura Durumu</p>
                      <p className="text-base font-semibold leading-tight tracking-tight text-slate-900">{detailData.faturaDurumu}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-2.5 p-3.5">
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">İşlemler</h3>
                  <Button variant="outline" className="h-9 w-full justify-start rounded-lg px-3.5 text-sm font-semibold">Faturayı Görüntüle</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-3">
            <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-3.5">
                <h3 className="text-xl font-semibold tracking-tight text-slate-900">Kargo Zaman Akışı</h3>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Route className="size-4" />
                      <p className="text-xs font-semibold uppercase tracking-wide">Transfer Hattı</p>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-foreground">{detailData.transferHatti}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="size-4" />
                      <p className="text-xs font-semibold uppercase tracking-wide">Varış Şubesi</p>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-foreground">{detailData.varisSubesi}</p>
                  </div>
                </div>

                <TimelineBlock items={timelineItems} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-3 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">Notlar</h3>
                  <Button
                    type="button"
                    variant={isNoteEditorOpen ? "outline" : "default"}
                    className="h-9 rounded-lg px-3.5 text-sm font-semibold"
                    onClick={() => setIsNoteEditorOpen((prev) => !prev)}
                  >
                    Yeni Not Ekle
                  </Button>
                </div>

                {isNoteEditorOpen && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                    <p className="mb-2 text-sm font-semibold text-slate-700">Yeni Not Ekle</p>
                    <Textarea
                      placeholder="Operasyon veya destek notu girin..."
                      className="min-h-24 rounded-xl border-slate-200 bg-white text-sm"
                      value={noteDraft}
                      onChange={(event) => setNoteDraft(event.target.value)}
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 rounded-lg px-3.5 text-sm font-semibold"
                        onClick={() => {
                          setNoteDraft("")
                          setIsNoteEditorOpen(false)
                        }}
                      >
                        Vazgeç
                      </Button>
                      <Button className="h-9 rounded-lg px-3.5 text-sm font-semibold">Notu Kaydet</Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {notesHistory.map((item) => (
                    <div key={`${item.source}-${item.date}`} className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800">{item.source}</p>
                        <Badge
                          className={`rounded-xl border px-3 py-1 text-sm ${
                            item.tag === "Destek"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {item.tag}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-700">{item.note}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <DeliveryInfoModal
        open={Boolean(deliveryInfoModalPiece)}
        onOpenChange={(open) => {
          if (!open) {
            setDeliveryInfoModalPiece(null)
          }
        }}
        heading="Teslim Alan Kişi Bilgisi"
        firstName={deliveryInfoModalPiece?.teslim_alan_ad || "-"}
        lastName={deliveryInfoModalPiece?.teslim_alan_soyad || "-"}
        deliveryTime={deliveryInfoModalPiece?.teslimat_zamani || "-"}
        phone={deliveryInfoModalPiece?.teslim_alan_telefonu || "-"}
        imageUrl={deliveryInfoModalPiece?.teslimat_resmi_url || ""}
        imageAlt="Teslimat resmi"
      />

      <PieceReportInfoModal
        open={Boolean(reportInfoModalPiece)}
        onOpenChange={(open) => {
          if (!open) {
            setReportInfoModalPiece(null)
          }
        }}
        pieceNo={reportInfoModalPiece?.parca_no || "-"}
        reportTime={reportInfoModalPiece?.ihbar_zamani || "-"}
        reason={reportInfoModalPiece?.ihbar_sebebi || "-"}
        description={reportInfoModalPiece?.ihbar_aciklama || "-"}
        evidenceImageUrl={reportInfoModalPiece?.ihbar_kanit_url || ""}
      />

      <PieceCancelInfoModal
        open={Boolean(pieceCancelInfoModalData)}
        onOpenChange={(open) => {
          if (!open) {
            setPieceCancelInfoModalData(null)
          }
        }}
        pieceNo={pieceCancelInfoModalData?.pieceNo || "-"}
        info={pieceCancelInfoModalData?.info || null}
      />

      <PieceDeliveryEntryModal
        open={deliveryEntryModalOpen}
        onOpenChange={setDeliveryEntryModalOpen}
        pieceNos={deliveryEntryPieceNos}
        initialValues={deliveryEntryInitialValues}
        onConfirm={handleConfirmDeliveryEntry}
      />

      <PieceReportModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        pieceNos={reportPieceNos}
        initialValues={reportInitialValues}
        onConfirm={handleConfirmPieceReport}
        confirmLabel="İhbarı Kaydet"
      />

      <PieceCancelModal
        open={pieceCancelModalOpen}
        onOpenChange={setPieceCancelModalOpen}
        pieceNos={pieceCancelPieceNos}
        initialValues={pieceCancelInitialValues}
        onConfirm={handleConfirmPieceCancel}
        confirmLabel="Parça İptal"
      />

      <ShipmentHandoverInfoModal
        open={handoverInfoModalOpen}
        onOpenChange={setHandoverInfoModalOpen}
        trackingNo={detailData.takipNo}
        info={shipmentHandoverInfo}
      />

      <ShipmentCancelInfoModal
        open={cancelInfoModalOpen}
        onOpenChange={setCancelInfoModalOpen}
        trackingNo={detailData.takipNo}
        info={shipmentCancelInfo}
      />

      <ShipmentHandoverModal
        open={handoverModalOpen}
        onOpenChange={setHandoverModalOpen}
        trackingNo={detailData.takipNo}
        receiverBranch={detailData.receiverInfo.branch}
        initialValues={handoverInitialValues}
        onConfirm={handleConfirmShipmentHandover}
      />

      <ShipmentCancelModal
        open={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        trackingNo={detailData.takipNo}
        initialValues={cancelInitialValues}
        onConfirm={handleConfirmShipmentCancel}
      />
    </>
  )
}
