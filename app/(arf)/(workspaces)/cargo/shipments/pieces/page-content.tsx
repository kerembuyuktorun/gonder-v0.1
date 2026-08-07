"use client"

import Link from "next/link"
import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from "react"
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Table as TanStackTable,
  Updater,
} from "@tanstack/react-table"
import type { DateRange } from "react-day-picker"
import { tr } from "date-fns/locale"
import {
  DataTable,
  DataTableColumnHeader,
  DataTableExcelActions,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { DeliveryInfoModal } from "../_components/delivery-info-modal"
import { PieceCancelInfoModal } from "../_components/piece-cancel-info-modal"
import { PieceCancelModal } from "../_components/piece-cancel-modal"
import { PieceDeliveryEntryModal } from "../_components/piece-delivery-entry-modal"
import { PieceReportInfoModal } from "../_components/piece-report-info-modal"
import { PieceReportModal } from "../_components/piece-report-modal"
import { usePieceActions } from "../_hooks/use-piece-actions"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  AlertTriangle,
  ArrowRightLeft,
  Ban,
  CalendarIcon,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Building2,
  Eye,
  Filter,
  Package,
  PlusCircle,
  Printer,
  Truck,
} from "lucide-react"
import {
  mockPieceCancelInfoByPieceNo as sharedPieceCancelInfoByPieceNo,
  mockPieceListRows,
  shipmentDetailMockData,
} from "../_mock/shipments-mock-data"

type PieceStatus = "beklemede" | "transfer" | "varis_subede" | "dagitimda" | "teslim_edildi" | "devredildi" | "iptal_edildi"
type PieceType = "koli" | "palet" | "cuval"

type PieceRow = {
  id: string
  parca_no: string
  takip_no: string
  kargo_id: string
  odeme_turu: "Gönderici Ödemeli" | "Alıcı Ödemeli"
  kargo_durumu: PieceStatus
  parca_tipi: PieceType
  desi: number
  agirlik: number
  toplam_fiyat: number
  olusturulma_zamani: string
  guncellenme_zamani: string
  varis_zamani: string
  teslimat_zamani: string
  teslim_alan_adi: string
  teslim_alan_telefonu: string
  teslimat_resmi_var: boolean
  teslimat_resmi_url: string
  parca_durumu?: "parca_iptal" | "ihbar_edildi"
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
const basePieces: PieceRow[] = [...mockPieceListRows]


const kargoStatusConfig: Record<PieceStatus, { label: string; className: string }> = {
  beklemede: { label: "Oluşturuldu", className: "bg-slate-500/10 text-slate-700 border-slate-400/30" },
  transfer: { label: "Transfer Sürecinde", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  varis_subede: { label: "Varış Şubede", className: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  dagitimda: { label: "Dağıtımda", className: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
  teslim_edildi: { label: "Teslim Edildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  devredildi: { label: "Devredildi", className: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20" },
  iptal_edildi: { label: "Kargo İptal", className: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
}

const pieceTypeConfig: Record<PieceType, { label: string; className: string }> = {
  koli: { label: "Koli", className: "bg-slate-500/10 text-slate-700 border-slate-400/30" },
  palet: { label: "Palet", className: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20" },
  cuval: { label: "Çuval", className: "bg-orange-500/10 text-orange-700 border-orange-500/20" },
}

const odemeFilterOptions = [
  { label: "Gönderici Ödemeli", value: "Gönderici Ödemeli" },
  { label: "Alıcı Ödemeli", value: "Alıcı Ödemeli" },
]

const statusFilterOptions = [
  { label: "Oluşturuldu", value: "beklemede" },
  { label: "Transfer Sürecinde", value: "transfer" },
  { label: "Varış Şubede", value: "varis_subede" },
  { label: "Dağıtımda", value: "dagitimda" },
  { label: "Teslim Edildi", value: "teslim_edildi" },
  { label: "Devredildi", value: "devredildi" },
  { label: "Kargo İptal", value: "iptal_edildi" },
]

const pieceTypeFilterOptions = [
  { label: "Koli", value: "koli" },
  { label: "Palet", value: "palet" },
  { label: "Çuval", value: "cuval" },
]

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

const SUMMARY_VISIBILITY_STORAGE_KEY = "arf:shipments:pieces:summary-visible"

const isValidIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)

const parseIsoDate = (value: string): Date | undefined => {
  if (!isValidIsoDate(value)) {
    return undefined
  }

  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined
  }

  return date
}

const formatIsoDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const parseDisplayDate = (value: string): Date | undefined => {
  const match = value.trim().match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/)
  if (!match) {
    return undefined
  }

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined
  }

  return date
}

const formatDisplayDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

const formatRangeDisplay = (from?: string, to?: string) => {
  const fromDate = from ? parseIsoDate(from) : undefined
  const toDate = to ? parseIsoDate(to) : undefined

  if (!fromDate && !toDate) {
    return ""
  }

  if (fromDate && toDate && from === to) {
    return formatDisplayDate(fromDate)
  }

  if (fromDate && toDate) {
    return `${formatDisplayDate(fromDate)} - ${formatDisplayDate(toDate)}`
  }

  if (fromDate) {
    return formatDisplayDate(fromDate)
  }

  if (toDate) {
    return formatDisplayDate(toDate)
  }

  return ""
}

const parseRangeInput = (value: string): { from?: string; to?: string } => {
  const normalized = value.trim()
  if (!normalized) {
    return {}
  }

  const dateMatches = normalized.match(/\d{2}[./-]\d{2}[./-]\d{4}/g) ?? []
  if (dateMatches.length === 0) {
    return {}
  }

  const [firstDateText, secondDateText] = dateMatches
  if (!firstDateText) {
    return {}
  }

  const fromDate = parseDisplayDate(firstDateText)
  if (!fromDate) {
    return {}
  }

  if (dateMatches.length === 1) {
    const iso = formatIsoDate(fromDate)
    return { from: iso, to: iso }
  }

  const toDate = secondDateText ? parseDisplayDate(secondDateText) : undefined
  if (!toDate) {
    const iso = formatIsoDate(fromDate)
    return { from: iso, to: iso }
  }

  const [startDate, endDate] = fromDate <= toDate ? [fromDate, toDate] : [toDate, fromDate]

  return {
    from: formatIsoDate(startDate),
    to: formatIsoDate(endDate),
  }
}

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === "function" ? (updater as (old: T) => T)(previous) : updater

const getDateOnly = (value: string) => value.split(" ")[0] ?? ""

const queryPieces = ({
  rows,
  pagination,
  sorting,
  columnFilters,
}: {
  rows: PieceRow[]
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
}) => {
  let filtered = [...rows]

  for (const filter of columnFilters) {
    if (filter.id === "odeme_turu") {
      const selected = Array.isArray(filter.value)
        ? (filter.value as string[])
        : typeof filter.value === "string"
          ? [filter.value]
          : []
      if (selected.length > 0) {
        filtered = filtered.filter((row) => selected.includes(row.odeme_turu))
      }
      continue
    }

    if (filter.id === "kargo_durumu") {
      const selected = Array.isArray(filter.value)
        ? (filter.value as string[])
        : typeof filter.value === "string"
          ? [filter.value]
          : []
      if (selected.length > 0) {
        filtered = filtered.filter((row) => selected.includes(row.kargo_durumu))
      }
      continue
    }

    if (filter.id === "parca_durumu") {
      const selected = Array.isArray(filter.value)
        ? (filter.value as string[])
        : typeof filter.value === "string"
          ? [filter.value]
          : []
      if (selected.length > 0) {
        filtered = filtered.filter((row) => selected.includes(row.parca_durumu ?? ""))
      }
      continue
    }

    if (filter.id === "parca_tipi") {
      const selected = Array.isArray(filter.value) ? (filter.value as string[]) : []
      if (selected.length > 0) {
        filtered = filtered.filter((row) => selected.includes(row.parca_tipi))
      }
      continue
    }

    if (filter.id === "olusturulma_zamani") {
      const value = (filter.value ?? {}) as { from?: string; to?: string }
      if (value.from || value.to) {
        filtered = filtered.filter((row) => {
          const dateOnly = getDateOnly(row.olusturulma_zamani)
          if (!dateOnly) {
            return false
          }
          if (value.from && dateOnly < value.from) {
            return false
          }
          if (value.to && dateOnly > value.to) {
            return false
          }
          return true
        })
      }
      continue
    }
  }

  if (sorting.length > 0) {
    const [{ id, desc }] = sorting
    filtered.sort((a, b) => {
      const left = a[id as keyof PieceRow]
      const right = b[id as keyof PieceRow]

      if (typeof left === "number" && typeof right === "number") {
        return desc ? right - left : left - right
      }

      const leftText = String(left ?? "")
      const rightText = String(right ?? "")

      if (leftText === rightText) {
        return 0
      }

      if (desc) {
        return leftText < rightText ? 1 : -1
      }

      return leftText > rightText ? 1 : -1
    })
  }

  const totalRows = filtered.length
  const start = pagination.pageIndex * pagination.pageSize
  const end = start + pagination.pageSize

  return {
    rows: filtered.slice(start, end),
    totalRows,
  }
}

export default function ParcaListesiPage() {
  const [table, setTable] = useState<TanStackTable<PieceRow> | null>(null)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([{ id: "olusturulma_zamani", desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [data, setData] = useState<PieceRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const [createdAtFrom, setCreatedAtFrom] = useState("")
  const [createdAtTo, setCreatedAtTo] = useState("")
  const [createdAtRangeInput, setCreatedAtRangeInput] = useState("")
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false)
  const [deliveryInfoModalPiece, setDeliveryInfoModalPiece] = useState<PieceRow | null>(null)
  const [reportInfoModalPiece, setReportInfoModalPiece] = useState<PieceRow | null>(null)
  const [pieceCancelInfoModalPiece, setPieceCancelInfoModalPiece] = useState<PieceRow | null>(null)
  const [selectedActionPiece, setSelectedActionPiece] = useState<PieceRow | null>(null)
  const [pieceDeliveryEntryModalOpen, setPieceDeliveryEntryModalOpen] = useState(false)
  const [pieceReportModalOpen, setPieceReportModalOpen] = useState(false)
  const [pieceCancelModalOpen, setPieceCancelModalOpen] = useState(false)
  const [deliveryEntryInitialValues, setDeliveryEntryInitialValues] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  })
  const [pieceReportInitialValues, setPieceReportInitialValues] = useState<{
    reason: "hasarli_kargo" | "yanlis_urun" | "eksik_hatali_evrak" | "saskin_kargo"
    description: string
  }>({
    reason: "hasarli_kargo",
    description: "",
  })
  const [pieceCancelInitialValues, setPieceCancelInitialValues] = useState<{
    category: "operasyonel" | "musteri" | "hasar" | "diger"
    reason: "musteri_talebi" | "yanlis_parca_kaydi" | "teslimat_imkansiz" | "hasarli_parca" | "diger_sebep"
    note: string
  }>({
    category: "operasyonel",
    reason: "musteri_talebi",
    note: "",
  })
  const [pieceCancelInfoMap, setPieceCancelInfoMap] = useState<Record<string, PieceCancelInfo>>({
    ...sharedPieceCancelInfoByPieceNo,
  })
  const [pieceReportInfoMap, setPieceReportInfoMap] = useState<Record<string, PieceReportInfo>>({})
  const [allPieces, setAllPieces] = useState<PieceRow[]>(basePieces)
  const [isSummaryVisible, setIsSummaryVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return true
    }

    try {
      return localStorage.getItem(SUMMARY_VISIBILITY_STORAGE_KEY) !== "0"
    } catch {
      return true
    }
  })

  const { loading, submitDeliveryEntry, submitPieceReport, submitPieceCancel } = usePieceActions()

  useEffect(() => {
    try {
      localStorage.setItem(SUMMARY_VISIBILITY_STORAGE_KEY, isSummaryVisible ? "1" : "0")
    } catch {
      // ignore storage write errors in demo flow
    }
  }, [isSummaryVisible])

  useEffect(() => {
    const applyCancelOverlays = () => {
      const canceledTrackingNos = new Set<string>()
      const handedOverTrackingNos = new Set<string>()
      const nextCancelInfoMap: Record<string, PieceCancelInfo> = {
        ...(sharedPieceCancelInfoByPieceNo as Record<string, PieceCancelInfo>),
      }
      const canceledPieceNos = new Set<string>(Object.keys(nextCancelInfoMap))
      const reportedPieceNos = new Set<string>()
      const nextReportInfoMap: Record<string, PieceReportInfo> = {}

      ;(shipmentDetailMockData.parcaDetaylari as Array<{
        parca_no: string
        ihbar_edildi?: boolean
        ihbar_zamani?: string
        ihbar_sebebi?: string
        ihbar_aciklama?: string
        ihbar_kanit_url?: string
      }>).forEach((piece) => {
        if (!piece.ihbar_edildi) {
          return
        }

        reportedPieceNos.add(piece.parca_no)
        nextReportInfoMap[piece.parca_no] = {
          reportTime: piece.ihbar_zamani || "-",
          reason: piece.ihbar_sebebi || "-",
          description: piece.ihbar_aciklama || "-",
          evidenceImageUrl: piece.ihbar_kanit_url || "",
        }
      })

      for (const piece of basePieces) {
        try {
          const shipmentCancelRaw = localStorage.getItem(`shipment-cancel-info:${piece.takip_no}`)
          if (shipmentCancelRaw) {
            canceledTrackingNos.add(piece.takip_no)
          }

          const shipmentHandoverRaw = localStorage.getItem(`shipment-handover-info:${piece.takip_no}`)
          if (shipmentHandoverRaw) {
            handedOverTrackingNos.add(piece.takip_no)
          }

          const pieceCancelRaw = localStorage.getItem(`shipment-piece-cancel-info:${piece.takip_no}`)
          if (pieceCancelRaw) {
            const parsed = JSON.parse(pieceCancelRaw) as Record<string, PieceCancelInfo>
            for (const pieceNo of Object.keys(parsed)) {
              canceledPieceNos.add(pieceNo)
              nextCancelInfoMap[pieceNo] = parsed[pieceNo]
            }
          }

          const pieceReportRaw = localStorage.getItem(`shipment-piece-report-info:${piece.takip_no}`)
          if (pieceReportRaw) {
            const parsed = JSON.parse(pieceReportRaw) as Record<string, PieceReportInfo>
            for (const pieceNo of Object.keys(parsed)) {
              reportedPieceNos.add(pieceNo)
              nextReportInfoMap[pieceNo] = parsed[pieceNo]
            }
          }
        } catch {
          // ignore storage parse errors in demo flow
        }
      }

      const nextRows: PieceRow[] = basePieces.map((row) => {
        const canceledByShipment = canceledTrackingNos.has(row.takip_no)
        const handedOverByShipment = handedOverTrackingNos.has(row.takip_no)
        const canceledByPiece = canceledPieceNos.has(row.parca_no)
        const reportedByPiece = reportedPieceNos.has(row.parca_no)

        if (!canceledByShipment && !handedOverByShipment && !canceledByPiece && !reportedByPiece) {
          return row
        }

        let nextCargoStatus: PieceStatus = row.kargo_durumu

        if (row.kargo_durumu === "transfer" && row.varis_zamani) {
          nextCargoStatus = "varis_subede"
        }

        if (handedOverByShipment) {
          nextCargoStatus = "devredildi"
        }

        if (canceledByShipment) {
          nextCargoStatus = "iptal_edildi"
        }

        return {
          ...row,
          kargo_durumu: nextCargoStatus,
          parca_durumu: canceledByPiece ? "parca_iptal" : reportedByPiece ? "ihbar_edildi" : undefined,
        }
      })

      setPieceCancelInfoMap(nextCancelInfoMap)
      setPieceReportInfoMap(nextReportInfoMap)
      setAllPieces(nextRows)
    }

    applyCancelOverlays()

    const handleStorage = () => {
      applyCancelOverlays()
    }

    window.addEventListener("storage", handleStorage)
    return () => {
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    const timer = window.setTimeout(() => {
      const result = queryPieces({ rows: allPieces, pagination, sorting, columnFilters })

      if (!cancelled) {
        setData(result.rows)
        setTotalRows(result.totalRows)
        setIsLoading(false)
      }
    }, 180)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [allPieces, pagination, sorting, columnFilters])

  const summaryCards = useMemo(() => {
    const totalPieceCount = allPieces.length
    const totalPrice = allPieces.reduce((sum, row) => sum + row.toplam_fiyat, 0)
    const deliveredCount = allPieces.filter((row) => row.kargo_durumu === "teslim_edildi").length

    return [
      {
        label: "Toplam Parça",
        value: new Intl.NumberFormat("tr-TR").format(totalPieceCount),
        icon: Package,
        iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
        valueClass: "text-foreground",
      },
      {
        label: "Toplam Fiyat",
        value: new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(totalPrice),
        icon: Building2,
        iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
        valueClass: "text-foreground",
      },
      {
        label: "Teslim Edilen Parça",
        value: new Intl.NumberFormat("tr-TR").format(deliveredCount),
        icon: CheckCircle2,
        iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
        valueClass: "text-foreground",
      },
    ]
  }, [])

  const handleTableReady = useCallback((nextTable: TanStackTable<PieceRow>) => {
    setTable(nextTable)
  }, [])

  const hasDeliveryInfo = useCallback((piece: PieceRow) => {
    return [piece.teslimat_zamani, piece.teslim_alan_adi, piece.teslim_alan_telefonu, piece.teslimat_resmi_url]
      .some((value) => Boolean(value && value !== "—"))
  }, [])

  const getDeliveryNameParts = useCallback((fullName: string) => {
    if (!fullName || fullName === "—") {
      return { firstName: "-", lastName: "-" }
    }

    const pieces = fullName.trim().split(/\s+/)
    const firstName = pieces.shift() || "-"
    const lastName = pieces.join(" ") || "-"

    return { firstName, lastName }
  }, [])

  const openRowDeliveryEntryModal = useCallback(
    (piece: PieceRow) => {
      const nameParts = getDeliveryNameParts(piece.teslim_alan_adi)
      setSelectedActionPiece(piece)
      setDeliveryEntryInitialValues({
        firstName: nameParts.firstName === "-" ? "" : nameParts.firstName,
        lastName: nameParts.lastName === "-" ? "" : nameParts.lastName,
        phone: piece.teslim_alan_telefonu && piece.teslim_alan_telefonu !== "—" ? piece.teslim_alan_telefonu : "",
      })
      setPieceDeliveryEntryModalOpen(true)
    },
    [getDeliveryNameParts],
  )

  const openRowReportModal = useCallback((piece: PieceRow) => {
    setSelectedActionPiece(piece)
    setPieceReportInitialValues({ reason: "hasarli_kargo", description: "" })
    setPieceReportModalOpen(true)
  }, [])

  const openRowCancelModal = useCallback((piece: PieceRow) => {
    setSelectedActionPiece(piece)
    setPieceCancelInitialValues({
      category: "operasyonel",
      reason: "musteri_talebi",
      note: "",
    })
    setPieceCancelModalOpen(true)
  }, [])

  const handleConfirmPieceDelivery = useCallback(
    (values: { firstName: string; lastName: string; phone: string }) => {
      if (!selectedActionPiece || loading.deliveryEntry) {
        return
      }

      void (async () => {
        const result = await submitDeliveryEntry({
          pieceNos: [selectedActionPiece.parca_no],
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
        })

        if (!result.ok) {
          return
        }

        const deliveryTime = new Date().toLocaleString("tr-TR")
        const fullName = `${values.firstName} ${values.lastName}`.trim() || "—"

        setAllPieces((prev) =>
          prev.map((piece) =>
            piece.id === selectedActionPiece.id
              ? {
                  ...piece,
                  teslimat_zamani: deliveryTime,
                  teslim_alan_adi: fullName,
                  teslim_alan_telefonu: values.phone || "—",
                }
              : piece,
          ),
        )

        try {
          const storageKey = `shipment-piece-delivery-info:${selectedActionPiece.takip_no}`
          const storedDeliveryInfo = localStorage.getItem(storageKey)
          const parsed = storedDeliveryInfo ? (JSON.parse(storedDeliveryInfo) as Record<string, unknown>) : {}
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              ...parsed,
              [selectedActionPiece.parca_no]: {
                firstName: values.firstName || "-",
                lastName: values.lastName || "-",
                deliveryTime,
                phone: values.phone || "-",
                imageUrl: "",
              },
            }),
          )
        } catch {
          // ignore storage write errors in demo flow
        }

        setPieceDeliveryEntryModalOpen(false)
        setSelectedActionPiece(null)
      })()
    },
    [loading.deliveryEntry, selectedActionPiece, submitDeliveryEntry],
  )

  const handleConfirmPieceReport = useCallback(
    (values: { reason: string; description: string }) => {
      if (!selectedActionPiece || loading.pieceReport) {
        return
      }

      void (async () => {
        const result = await submitPieceReport({
          pieceNos: [selectedActionPiece.parca_no],
          reason: values.reason,
          description: values.description,
        })

        if (!result.ok) {
          return
        }

        const reportInfo: PieceReportInfo = {
          reportTime: new Date().toLocaleString("tr-TR"),
          reason: pieceReportReasonLabels[values.reason] || values.reason,
          description: values.description || "-",
          evidenceImageUrl: "",
        }

        setAllPieces((prev) =>
          prev.map((piece) =>
            piece.id === selectedActionPiece.id
              ? {
                  ...piece,
                  parca_durumu: "ihbar_edildi",
                  guncellenme_zamani: reportInfo.reportTime,
                }
              : piece,
          ),
        )

        setPieceReportInfoMap((prev) => ({ ...prev, [selectedActionPiece.parca_no]: reportInfo }))

        try {
          const storageKey = `shipment-piece-report-info:${selectedActionPiece.takip_no}`
          const storedReportInfo = localStorage.getItem(storageKey)
          const parsed = storedReportInfo ? (JSON.parse(storedReportInfo) as Record<string, PieceReportInfo>) : {}
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              ...parsed,
              [selectedActionPiece.parca_no]: reportInfo,
            }),
          )
        } catch {
          // ignore storage write errors in demo flow
        }

        setPieceReportModalOpen(false)
        setSelectedActionPiece(null)
      })()
    },
    [loading.pieceReport, selectedActionPiece, submitPieceReport],
  )

  const handleConfirmPieceCancel = useCallback(
    (values: { category: string; reason: string; note: string }) => {
      if (!selectedActionPiece || loading.pieceCancel) {
        return
      }

      void (async () => {
        const result = await submitPieceCancel({
          pieceNos: [selectedActionPiece.parca_no],
          reason: values.reason,
          note: values.note,
        })

        if (!result.ok) {
          return
        }

        const cancelInfo: PieceCancelInfo = {
          canceledAt: new Date().toLocaleString("tr-TR"),
          canceledBy: "Operasyon Merkezi",
          category: pieceCancelCategoryLabels[values.category] || values.category,
          reason: pieceCancelReasonLabels[values.reason] || values.reason,
          note: values.note,
        }

        setAllPieces((prev) =>
          prev.map((piece) =>
            piece.id === selectedActionPiece.id
              ? {
                  ...piece,
                  parca_durumu: "parca_iptal",
                  guncellenme_zamani: cancelInfo.canceledAt,
                }
              : piece,
          ),
        )

        setPieceCancelInfoMap((prev) => ({ ...prev, [selectedActionPiece.parca_no]: cancelInfo }))

        try {
          const storageKey = `shipment-piece-cancel-info:${selectedActionPiece.takip_no}`
          const storedCancelInfo = localStorage.getItem(storageKey)
          const parsed = storedCancelInfo ? (JSON.parse(storedCancelInfo) as Record<string, PieceCancelInfo>) : {}
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              ...parsed,
              [selectedActionPiece.parca_no]: cancelInfo,
            }),
          )
        } catch {
          // ignore storage write errors in demo flow
        }

        setPieceCancelModalOpen(false)
        setSelectedActionPiece(null)
      })()
    },
    [loading.pieceCancel, selectedActionPiece, submitPieceCancel],
  )

  const handlePaginationChange = useCallback((updater: Updater<PaginationState>) => {
    setPagination((previous) => resolveUpdater(updater, previous))
  }, [])

  const handleSortingChange = useCallback((updater: Updater<SortingState>) => {
    setSorting((previous) => resolveUpdater(updater, previous))
    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
  }, [])

  const handleColumnFiltersChange = useCallback((updater: Updater<ColumnFiltersState>) => {
    setColumnFilters((previous) => resolveUpdater(updater, previous))
    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
  }, [])

  const setDateFilterValue = useCallback((from: string, to: string) => {
    const normalizedFrom = isValidIsoDate(from) ? from : undefined
    const normalizedTo = isValidIsoDate(to) ? to : undefined

    setColumnFilters((previous) => {
      const withoutCreated = previous.filter((item) => item.id !== "olusturulma_zamani")

      if (!normalizedFrom && !normalizedTo) {
        return withoutCreated
      }

      return [
        ...withoutCreated,
        {
          id: "olusturulma_zamani",
          value: { from: normalizedFrom, to: normalizedTo },
        },
      ]
    })

    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
  }, [])

  const handleCreatedAtFilterChange = useCallback(
    (nextFrom: string, nextTo: string) => {
      setCreatedAtFrom(nextFrom)
      setCreatedAtTo(nextTo)
      setDateFilterValue(nextFrom, nextTo)
    },
    [setDateFilterValue],
  )

  const selectedCreatedAtRange = useMemo<DateRange | undefined>(() => {
    const fromDate = parseIsoDate(createdAtFrom)
    const toDate = parseIsoDate(createdAtTo)

    if (!fromDate && !toDate) {
      return undefined
    }

    if (fromDate && toDate) {
      return fromDate <= toDate
        ? { from: fromDate, to: toDate }
        : { from: toDate, to: fromDate }
    }

    if (fromDate) {
      return { from: fromDate, to: undefined }
    }

    return { from: toDate, to: undefined }
  }, [createdAtFrom, createdAtTo])

  const activeCargoStatusFilterValues = useMemo(() => {
    const statusFilter = columnFilters.find((item) => item.id === "kargo_durumu")
    if (!statusFilter) {
      return [] as string[]
    }

    if (Array.isArray(statusFilter.value)) {
      return statusFilter.value as string[]
    }

    if (typeof statusFilter.value === "string") {
      return [statusFilter.value]
    }

    return [] as string[]
  }, [columnFilters])

  const activePieceStatusFilterValues = useMemo(() => {
    const pieceStatusFilter = columnFilters.find((item) => item.id === "parca_durumu")
    if (!pieceStatusFilter) {
      return [] as string[]
    }

    if (Array.isArray(pieceStatusFilter.value)) {
      return pieceStatusFilter.value as string[]
    }

    if (typeof pieceStatusFilter.value === "string") {
      return [pieceStatusFilter.value]
    }

    return [] as string[]
  }, [columnFilters])

  const isIptalParcaFilterActive = activePieceStatusFilterValues.includes("parca_iptal")
  const isIhbarParcaFilterActive = activePieceStatusFilterValues.includes("ihbar_edildi")
  const isTeslimParcaFilterActive = activeCargoStatusFilterValues.includes("teslim_edildi")

  const handleCreatedAtRangeInputChange = useCallback(
    (value: string) => {
      setCreatedAtRangeInput(value)
      const parsed = parseRangeInput(value)
      handleCreatedAtFilterChange(parsed.from ?? "", parsed.to ?? "")
    },
    [handleCreatedAtFilterChange],
  )

  const handleCreatedAtRangeSelect = useCallback(
    (range: DateRange | undefined) => {
      if (!range?.from) {
        setCreatedAtRangeInput("")
        handleCreatedAtFilterChange("", "")
        setIsDateRangePickerOpen(false)
        return
      }

      const fromIso = formatIsoDate(range.from)
      if (!range.to) {
        setCreatedAtRangeInput(formatDisplayDate(range.from))
        handleCreatedAtFilterChange(fromIso, "")
        return
      }

      const [startDate, endDate] = range.from <= range.to ? [range.from, range.to] : [range.to, range.from]
      const startIso = formatIsoDate(startDate)
      const endIso = formatIsoDate(endDate)

      setCreatedAtRangeInput(formatRangeDisplay(startIso, endIso))
      handleCreatedAtFilterChange(startIso, endIso)
    },
    [handleCreatedAtFilterChange],
  )

  useEffect(() => {
    const createdFilter = columnFilters.find((item) => item.id === "olusturulma_zamani")
    const value = (createdFilter?.value ?? {}) as { from?: string; to?: string }

    const nextFrom = value.from && isValidIsoDate(value.from) ? value.from : ""
    const nextTo = value.to && isValidIsoDate(value.to) ? value.to : ""

    if (nextFrom !== createdAtFrom) {
      setCreatedAtFrom(nextFrom)
    }

    if (nextTo !== createdAtTo) {
      setCreatedAtTo(nextTo)
    }

    const nextRangeText = formatRangeDisplay(nextFrom, nextTo)
    if (nextRangeText !== createdAtRangeInput) {
      setCreatedAtRangeInput(nextRangeText)
    }
  }, [columnFilters, createdAtFrom, createdAtTo, createdAtRangeInput])

  const columns = useMemo<ColumnDef<PieceRow>[]>(
    () => [
      {
        accessorKey: "parca_no",
        enableHiding: false,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Parça No" />,
        cell: ({ row }) => (
          <Link
            href={`/arf/cargo/shipments/pieces/${row.original.id}`}
            className="font-mono text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60"
          >
            {row.original.parca_no}
          </Link>
        ),
      },
      {
        accessorKey: "takip_no",
        enableHiding: false,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Takip No" />,
        cell: ({ row }) => (
          <Link
            href={`/arf/cargo/shipments/${row.original.kargo_id}`}
            className="font-mono text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60"
          >
            {row.original.takip_no}
          </Link>
        ),
      },
      {
        accessorKey: "odeme_turu",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ödeme Türü" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.odeme_turu}</span>,
      },
      {
        accessorKey: "kargo_durumu",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kargo Durumu" />,
        cell: ({ row }) => {
          const status = kargoStatusConfig[row.original.kargo_durumu]
          const statusIcon =
            row.original.kargo_durumu === "teslim_edildi"
              ? CheckCircle2
              : row.original.kargo_durumu === "dagitimda"
                ? Truck
                : row.original.kargo_durumu === "devredildi"
                  ? ArrowRightLeft
                  : row.original.kargo_durumu === "iptal_edildi"
                    ? Ban
                    : row.original.kargo_durumu === "varis_subede"
                      ? Building2
                      : Package
          const StatusIcon = statusIcon || Package
          return (
            <Badge variant="outline" className={status.className}>
              <StatusIcon className="mr-1.5 size-3" />
              {status.label}
            </Badge>
          )
        },
      },
      {
        accessorKey: "parca_durumu",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Parça Durumu" />,
        cell: ({ row }) => {
          if (row.original.parca_durumu === "parca_iptal") {
            return (
              <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20">
                Parça İptal
              </Badge>
            )
          }

          if (row.original.parca_durumu === "ihbar_edildi") {
            return (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20">
                İhbar Edildi
              </Badge>
            )
          }

          return <span className="text-muted-foreground">-</span>
        },
      },
      {
        accessorKey: "parca_tipi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Parça Tipi" />,
        cell: ({ row }) => {
          const pieceType = pieceTypeConfig[row.original.parca_tipi]
          return (
            <Badge variant="outline" className={pieceType.className}>
              {pieceType.label}
            </Badge>
          )
        },
      },
      {
        accessorKey: "desi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Desi" />,
        cell: ({ row }) => <span className="tabular-nums">{row.original.desi}</span>,
      },
      {
        accessorKey: "agirlik",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ağırlık" />,
        cell: ({ row }) => <span className="tabular-nums">{row.original.agirlik.toFixed(1)} kg</span>,
      },
      {
        accessorKey: "toplam_fiyat",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam Fiyat" />,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">
            {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(row.original.toplam_fiyat)}
          </span>
        ),
      },
      {
        accessorKey: "olusturulma_zamani",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturulma Zamanı" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.olusturulma_zamani}</span>,
      },
      {
        accessorKey: "guncellenme_zamani",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Son İşlem Zamanı" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.guncellenme_zamani}</span>,
      },
      {
        accessorKey: "varis_zamani",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Varış Zamanı" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.varis_zamani || "—"}</span>,
      },
      {
        accessorKey: "teslimat_zamani",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Teslimat Zamanı" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.teslimat_zamani || "—"}</span>,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">İşlemler</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-medium">
                İşlemler
                <ChevronDown className="ml-1 size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{`Parça No ${row.original.parca_no} İşlemler:`}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/arf/cargo/shipments/${row.original.kargo_id}`}>
                  <Eye className="mr-2 size-4" />
                  Kargo Detay
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/arf/cargo/shipments/pieces/${row.original.id}`}>
                  <Package className="mr-2 size-4" />
                  Parça Detay
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Printer className="mr-2 size-4" />
                Barkod Yazdır
              </DropdownMenuItem>
              {hasDeliveryInfo(row.original) ? (
                <DropdownMenuItem
                  onSelect={() => {
                    setDeliveryInfoModalPiece(row.original)
                  }}
                >
                  <Eye className="mr-2 size-4" />
                  Teslim Bilgi
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onSelect={() => {
                    openRowDeliveryEntryModal(row.original)
                  }}
                >
                  <CheckCircle2 className="mr-2 size-4" />
                  Teslim Et
                </DropdownMenuItem>
              )}
              {row.original.parca_durumu === "ihbar_edildi" ? (
                <DropdownMenuItem
                  onSelect={() => {
                    setReportInfoModalPiece(row.original)
                  }}
                >
                  <Eye className="mr-2 size-4" />
                  İhbar Bilgi
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onSelect={() => {
                    openRowReportModal(row.original)
                  }}
                >
                  <AlertTriangle className="mr-2 size-4" />
                  İhbar Et
                </DropdownMenuItem>
              )}
              {row.original.parca_durumu === "parca_iptal" ? (
                <DropdownMenuItem
                  className="text-rose-700 focus:text-rose-700"
                  onSelect={() => {
                    setPieceCancelInfoModalPiece(row.original)
                  }}
                >
                  <Eye className="mr-2 size-4" />
                  Parça İptal Bilgi
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="text-rose-700 focus:text-rose-700"
                  onSelect={() => {
                    openRowCancelModal(row.original)
                  }}
                >
                  <Ban className="mr-2 size-4" />
                  Parça İptal
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [hasDeliveryInfo, openRowCancelModal, openRowDeliveryEntryModal, openRowReportModal],
  )

  const pageCount = Math.max(1, Math.ceil(totalRows / pagination.pageSize))

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Kargo İşlemleri", href: "/arf/cargo/shipments" },
          { label: "Parça Listesi" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Parça Listesi</h1>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant={isIptalParcaFilterActive ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setColumnFilters((previous) => {
                  const withoutQuickStatuses = previous.filter(
                    (item) => item.id !== "kargo_durumu" && item.id !== "parca_durumu",
                  )

                  if (isIptalParcaFilterActive) {
                    return withoutQuickStatuses
                  }

                  return [...withoutQuickStatuses, { id: "parca_durumu", value: ["parca_iptal"] }]
                })
                setPagination((previous) => ({ ...previous, pageIndex: 0 }))
              }}
            >
              <Ban className="mr-2 size-4" />
              İptal Parça Listesi
            </Button>
            <Button
              type="button"
              variant={isIhbarParcaFilterActive ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setColumnFilters((previous) => {
                  const withoutQuickStatuses = previous.filter(
                    (item) => item.id !== "kargo_durumu" && item.id !== "parca_durumu",
                  )

                  if (isIhbarParcaFilterActive) {
                    return withoutQuickStatuses
                  }

                  return [...withoutQuickStatuses, { id: "parca_durumu", value: ["ihbar_edildi"] }]
                })
                setPagination((previous) => ({ ...previous, pageIndex: 0 }))
              }}
            >
              <AlertTriangle className="mr-2 size-4" />
              İhbar Parça Listesi
            </Button>
            <Button
              type="button"
              variant={isTeslimParcaFilterActive ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setColumnFilters((previous) => {
                  const withoutQuickStatuses = previous.filter(
                    (item) => item.id !== "kargo_durumu" && item.id !== "parca_durumu",
                  )

                  if (isTeslimParcaFilterActive) {
                    return withoutQuickStatuses
                  }

                  return [...withoutQuickStatuses, { id: "kargo_durumu", value: ["teslim_edildi"] }]
                })
                setPagination((previous) => ({ ...previous, pageIndex: 0 }))
              }}
            >
              <CheckCircle2 className="mr-2 size-4" />
              Teslim Parça Listesi
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSummaryVisible((prev) => !prev)}
            >
              {isSummaryVisible ? <ChevronUp className="mr-2 size-4" /> : <ChevronDown className="mr-2 size-4" />}
              {isSummaryVisible ? "Özeti Gizle" : "Özeti Göster"}
            </Button>
          </div>
        </div>

        {isSummaryVisible && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {summaryCards.map((card) => (
              <Card key={card.label} className="rounded-2xl border-slate-200/80 bg-white shadow-none">
                <CardContent className="p-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium tracking-wide text-slate-500">{card.label}</p>
                      <p className={cn("mt-1 text-xl font-semibold tabular-nums leading-tight", card.valueClass)}>{card.value}</p>
                    </div>
                    <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-xl border", card.iconWrapClass)}>
                      <card.icon className="size-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardContent className="space-y-4">
            {table && (
              <div className="flex items-center gap-2">
                {!showFacetedFilters && (
                  <DataTableExcelActions table={table} filename="parca-listesi" exportSelected={false} exportLabel="Dışarı Aktar" />
                )}

                <DataTableToolbar table={table} showColumnSelector={!showFacetedFilters} viewLabel="Görünüm" columnsLabel="Sütunlar" resetLabel="Sıfırla">
                  <Button
                    type="button"
                    variant={showFacetedFilters ? "default" : "outline"}
                    size="sm"
                    className="mr-3 h-8"
                    onClick={() => setShowFacetedFilters((previous) => !previous)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filtreler
                  </Button>

                  {showFacetedFilters && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Popover open={isDateRangePickerOpen} onOpenChange={setIsDateRangePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 border-dashed">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Oluşturulma Tarihi
                            {createdAtRangeInput && (
                              <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                                {createdAtRangeInput}
                              </Badge>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="space-y-3 p-3">
                            <div className="flex items-center rounded-md border border-input bg-background px-2">
                              <Input
                                value={createdAtRangeInput}
                                placeholder="GG.AA.YYYY - GG.AA.YYYY"
                                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                  handleCreatedAtRangeInputChange(event.target.value)
                                }
                                className="h-8 w-[260px] border-0 px-0 focus-visible:ring-0"
                              />
                              <CalendarIcon className="size-4 text-muted-foreground" />
                            </div>

                            <div className="border-t pt-3">
                              <Calendar
                                mode="range"
                                selected={selectedCreatedAtRange}
                                onSelect={handleCreatedAtRangeSelect}
                                numberOfMonths={2}
                                locale={tr}
                                showOutsideDays={false}
                                initialFocus
                              />
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-3">
                              {(createdAtFrom || createdAtTo) && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setCreatedAtRangeInput("")
                                    handleCreatedAtFilterChange("", "")
                                  }}
                                >
                                  Temizle
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsDateRangePickerOpen(false)}
                              >
                                Kapat
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <DataTableFacetedFilter
                        column={table.getColumn("odeme_turu")}
                        title="Ödeme Türü"
                        options={odemeFilterOptions}
                      />
                      <DataTableFacetedFilter
                        column={table.getColumn("kargo_durumu")}
                        title="Kargo Durumu"
                        options={statusFilterOptions}
                      />
                      <DataTableFacetedFilter
                        column={table.getColumn("parca_tipi")}
                        title="Parça Tipi"
                        options={pieceTypeFilterOptions}
                      />
                    </div>
                  )}
                </DataTableToolbar>
              </div>
            )}

            <DataTable
              data={data}
              columns={columns}
              enablePagination
              pagination={pagination}
              onPaginationChange={handlePaginationChange}
              pageCount={pageCount}
              manualPagination
              enableSorting
              sorting={sorting}
              onSortingChange={handleSortingChange}
              manualSorting
              enableGlobalFilter
              columnFilters={columnFilters}
              onColumnFiltersChange={handleColumnFiltersChange}
              manualFiltering
              enableColumnVisibility
              enableHorizontalScroll
              stickyLeftColumnCount={2}
              stickyLastColumn
              isLoading={isLoading}
              className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
              emptyMessage="Gösterilecek parça bulunamadı."
              onTableReady={handleTableReady}
            />

            {table && (
              <DataTablePagination
                table={table as TanStackTable<unknown>}
                pageSizeOptions={[10, 20, 50]}
                totalRows={totalRows}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <DeliveryInfoModal
        open={Boolean(deliveryInfoModalPiece)}
        onOpenChange={(open) => {
          if (!open) {
            setDeliveryInfoModalPiece(null)
          }
        }}
        heading={`Teslimat Bilgisi - Parça ${deliveryInfoModalPiece?.parca_no || "-"}`}
        firstName={deliveryInfoModalPiece ? getDeliveryNameParts(deliveryInfoModalPiece.teslim_alan_adi).firstName : "-"}
        lastName={deliveryInfoModalPiece ? getDeliveryNameParts(deliveryInfoModalPiece.teslim_alan_adi).lastName : "-"}
        deliveryTime={deliveryInfoModalPiece?.teslimat_zamani || "-"}
        phone={deliveryInfoModalPiece?.teslim_alan_telefonu || "-"}
        imageUrl={deliveryInfoModalPiece?.teslimat_resmi_url || ""}
        imageAlt={`${deliveryInfoModalPiece?.parca_no || "Parça"} teslimat resmi`}
      />

      <PieceDeliveryEntryModal
        open={pieceDeliveryEntryModalOpen}
        onOpenChange={setPieceDeliveryEntryModalOpen}
        pieceNos={selectedActionPiece ? [selectedActionPiece.parca_no] : []}
        initialValues={deliveryEntryInitialValues}
        onConfirm={handleConfirmPieceDelivery}
      />

      <PieceReportModal
        open={pieceReportModalOpen}
        onOpenChange={setPieceReportModalOpen}
        pieceNos={selectedActionPiece ? [selectedActionPiece.parca_no] : []}
        initialValues={pieceReportInitialValues}
        onConfirm={handleConfirmPieceReport}
      />

      <PieceCancelModal
        open={pieceCancelModalOpen}
        onOpenChange={setPieceCancelModalOpen}
        pieceNos={selectedActionPiece ? [selectedActionPiece.parca_no] : []}
        initialValues={pieceCancelInitialValues}
        onConfirm={handleConfirmPieceCancel}
      />

      <PieceReportInfoModal
        open={Boolean(reportInfoModalPiece)}
        onOpenChange={(open) => {
          if (!open) {
            setReportInfoModalPiece(null)
          }
        }}
        pieceNo={reportInfoModalPiece?.parca_no || "-"}
        reportTime={reportInfoModalPiece ? pieceReportInfoMap[reportInfoModalPiece.parca_no]?.reportTime || "-" : "-"}
        reason={reportInfoModalPiece ? pieceReportInfoMap[reportInfoModalPiece.parca_no]?.reason || "-" : "-"}
        description={reportInfoModalPiece ? pieceReportInfoMap[reportInfoModalPiece.parca_no]?.description || "-" : "-"}
        evidenceImageUrl={reportInfoModalPiece ? pieceReportInfoMap[reportInfoModalPiece.parca_no]?.evidenceImageUrl || "" : ""}
      />

      <PieceCancelInfoModal
        open={Boolean(pieceCancelInfoModalPiece)}
        onOpenChange={(open) => {
          if (!open) {
            setPieceCancelInfoModalPiece(null)
          }
        }}
        pieceNo={pieceCancelInfoModalPiece?.parca_no || "-"}
        info={pieceCancelInfoModalPiece ? pieceCancelInfoMap[pieceCancelInfoModalPiece.parca_no] || null : null}
      />
    </>
  )
}
