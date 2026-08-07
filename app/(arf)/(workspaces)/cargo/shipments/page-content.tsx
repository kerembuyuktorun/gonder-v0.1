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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { ShipmentCancelModal } from "./_components/shipment-cancel-modal"
import { ShipmentHandoverModal } from "./_components/shipment-handover-modal"
import { usePieceActions } from "./_hooks/use-piece-actions"
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
  ArrowRightLeft,
  Building2,
  ChevronDown,
  ChevronUp,
  Ban,
  CalendarIcon,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Filter,
  Package,
  Plus,
  PlusCircle,
  Printer,
  Truck,
} from "lucide-react"
import {
  mockCargoList,
  mockPieceCancelInfoByPieceNo as sharedPieceCancelInfoByPieceNo,
  mockPieceListRows,
  shipmentDetailMockData,
} from "./_mock/shipments-mock-data"

const mockCargos = mockCargoList

type CargoRow = (typeof mockCargos)[number]
type CargoStatus = "olusturuldu" | "transfer_surecinde" | "varis_subede" | "dagitimda" | "teslim_edildi" | "devredildi" | "iptal_edildi"
type ViewCargoRow = Omit<CargoRow, "kargo_durumu"> & {
  kargo_durumu: CargoStatus
  parca_durumu_gosterim: string
  son_islem_zamani: string
}

type ShipmentHandoverInitialValues = {
  reason: "musteri_adreste_degil" | "musteriye_ulasilamiyor" | "diger_sebep"
  note: string
}

type ShipmentCancelInitialValues = {
  category: "operasyonel" | "musteri" | "guvenlik" | "diger"
  reason: "musteri_talebi" | "yanlis_gonderi_kaydi" | "tasimaya_uygunsuz" | "diger_sebep"
  note: string
}

const kargoStatusConfig: Record<CargoStatus, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  olusturuldu: { label: "Oluşturuldu", className: "bg-slate-500/10 text-slate-700 border-slate-400/30", icon: Clock },
  transfer_surecinde: { label: "Transfer Sürecinde", className: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: Truck },
  varis_subede: { label: "Varış Şubede", className: "bg-amber-500/10 text-amber-700 border-amber-500/20", icon: Building2 },
  dagitimda: { label: "Dağıtımda", className: "bg-sky-500/10 text-sky-600 border-sky-500/20", icon: Truck },
  teslim_edildi: {
    label: "Teslim Edildi",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: CheckCircle2,
  },
  devredildi: { label: "Devredildi", className: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20", icon: ArrowRightLeft },
  iptal_edildi: { label: "Kargo İptal", className: "bg-rose-500/10 text-rose-600 border-rose-500/20", icon: Ban },
}

const faturaStatusConfig: Record<string, { label: string; className: string }> = {
  kesildi: { label: "Kesildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  kesilmedi: { label: "Kesilmedi", className: "bg-slate-500/10 text-slate-500 border-slate-400/20" },
}

const tahsilatStatusConfig: Record<string, { label: string; className: string }> = {
  tahsil_edildi: { label: "Tahsil Edildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  beklemede: { label: "Beklemede", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  iptal: { label: "İptal", className: "bg-red-500/10 text-red-600 border-red-500/20" },
}

const statusFilterOptions = [
  { label: "Oluşturuldu", value: "olusturuldu" },
  { label: "Transfer Sürecinde", value: "transfer_surecinde" },
  { label: "Varış Şubede", value: "varis_subede" },
  { label: "Dağıtımda", value: "dagitimda" },
  { label: "Teslim Edildi", value: "teslim_edildi" },
  { label: "Devredildi", value: "devredildi" },
  { label: "Kargo İptal", value: "iptal_edildi" },
]

const paymentTypeFilterOptions = [
  { label: "Gönderici Ödemeli", value: "Gönderici Ödemeli" },
  { label: "Alıcı Ödemeli", value: "Alıcı Ödemeli" },
]

const invoiceTypeFilterOptions = [
  { label: "Gönderici", value: "Gönderici" },
  { label: "Alıcı", value: "Alıcı" },
]

const collectionStatusFilterOptions = [
  { label: "Tahsil Edildi", value: "tahsil_edildi" },
  { label: "Beklemede", value: "beklemede" },
  { label: "İptal", value: "iptal" },
]

const SUMMARY_VISIBILITY_STORAGE_KEY = "arf:shipments:list:summary-visible"

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

const normalizeDateTime = (value: string): string => {
  const raw = value.trim()
  if (!raw) {
    return ""
  }

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::\d{2})?$/)
  if (isoMatch) {
    const [, year, month, day, hour, minute] = isoMatch
    return `${year}-${month}-${day} ${hour}:${minute}`
  }

  const trMatch = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})[ ,]+(\d{1,2}):(\d{2})(?::\d{2})?$/)
  if (trMatch) {
    const [, day, month, year, hour, minute] = trMatch
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")} ${hour.padStart(2, "0")}:${minute}`
  }

  return ""
}

const getLatestDateTime = (values: string[]): string => {
  const normalized = values.map(normalizeDateTime).filter(Boolean)
  if (normalized.length === 0) {
    return ""
  }

  return normalized.sort((left, right) => left.localeCompare(right)).at(-1) ?? ""
}

const queryCargos = ({
  rows,
  pagination,
  sorting,
  columnFilters,
}: {
  rows: ViewCargoRow[]
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
}) => {
  let filtered = [...rows]

  for (const filter of columnFilters) {
    if (
      filter.id === "odeme_turu" ||
      filter.id === "kargo_durumu" ||
      filter.id === "fatura_turu" ||
      filter.id === "tahsilat_durumu"
    ) {
      const selected = Array.isArray(filter.value) ? (filter.value as string[]) : []
      if (selected.length > 0) {
        filtered = filtered.filter((row) => selected.includes(String(row[filter.id as keyof ViewCargoRow] ?? "")))
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
    }
  }

  if (sorting.length > 0) {
    const [{ id, desc }] = sorting
    filtered.sort((a, b) => {
      const left = a[id as keyof ViewCargoRow]
      const right = b[id as keyof ViewCargoRow]

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

export default function KargolarPage() {
  const [table, setTable] = useState<TanStackTable<ViewCargoRow> | null>(null)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 })
  const [sorting, setSorting] = useState<SortingState>([{ id: "takip_no", desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [data, setData] = useState<ViewCargoRow[]>([])
  const [allCargos, setAllCargos] = useState<ViewCargoRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [activeCargo, setActiveCargo] = useState<ViewCargoRow | null>(null)
  const [handoverModalOpen, setHandoverModalOpen] = useState(false)
  const [handoverInitialValues, setHandoverInitialValues] = useState<ShipmentHandoverInitialValues>({
    reason: "musteri_adreste_degil",
    note: "",
  })
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelInitialValues, setCancelInitialValues] = useState<ShipmentCancelInitialValues>({
    category: "operasyonel",
    reason: "musteri_talebi",
    note: "",
  })

  const [createdAtFrom, setCreatedAtFrom] = useState("")
  const [createdAtTo, setCreatedAtTo] = useState("")
  const [createdAtRangeInput, setCreatedAtRangeInput] = useState("")
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false)
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

  const isDevirFilterActive = useMemo(() => {
    const statusFilter = columnFilters.find((item) => item.id === "kargo_durumu")
    const selected = Array.isArray(statusFilter?.value) ? (statusFilter.value as string[]) : []
    return selected.includes("devredildi")
  }, [columnFilters])

  useEffect(() => {
    try {
      localStorage.setItem(SUMMARY_VISIBILITY_STORAGE_KEY, isSummaryVisible ? "1" : "0")
    } catch {
      // ignore storage write errors in demo flow
    }
  }, [isSummaryVisible])

  const { loading, submitShipmentHandover, submitShipmentCancel } = usePieceActions()

  const buildViewCargos = useCallback((): ViewCargoRow[] => {
    return mockCargos.map((cargo) => {
      const trackingNo = cargo.takip_no.replace("ARF-", "")
      const canceledPieceNos = new Set<string>()
      const reportedPieceNos = new Set<string>()
      const pieceRows = mockPieceListRows.filter((piece) => piece.takip_no === trackingNo)

      Object.keys(sharedPieceCancelInfoByPieceNo).forEach((pieceNo) => {
        if (pieceNo.startsWith(trackingNo)) {
          canceledPieceNos.add(pieceNo)
        }
      })

      ;(shipmentDetailMockData.parcaDetaylari as Array<{ parca_no: string; ihbar_edildi?: boolean }>).forEach((piece) => {
        if (piece.ihbar_edildi && String(piece.parca_no).startsWith(trackingNo)) {
          reportedPieceNos.add(String(piece.parca_no))
        }
      })

      let hasShipmentCancel = false
      let hasShipmentHandover = false
      let shipmentCancelAt = ""
      let shipmentHandoverAt = ""

      if (typeof window !== "undefined") {
        try {
          const shipmentCancelRaw = localStorage.getItem(`shipment-cancel-info:${trackingNo}`)
          const shipmentHandoverRaw = localStorage.getItem(`shipment-handover-info:${trackingNo}`)

          hasShipmentCancel = Boolean(shipmentCancelRaw)
          hasShipmentHandover = Boolean(shipmentHandoverRaw)

          if (shipmentCancelRaw) {
            const parsed = JSON.parse(shipmentCancelRaw) as { canceledAt?: string }
            shipmentCancelAt = parsed.canceledAt ?? ""
          }

          if (shipmentHandoverRaw) {
            const parsed = JSON.parse(shipmentHandoverRaw) as { transferredAt?: string }
            shipmentHandoverAt = parsed.transferredAt ?? ""
          }

          const storedPieceCancelRaw = localStorage.getItem(`shipment-piece-cancel-info:${trackingNo}`)
          if (storedPieceCancelRaw) {
            const parsed = JSON.parse(storedPieceCancelRaw) as Record<string, unknown>
            Object.keys(parsed).forEach((pieceNo) => canceledPieceNos.add(pieceNo))
          }

          const storedPieceReportRaw = localStorage.getItem(`shipment-piece-report-info:${trackingNo}`)
          if (storedPieceReportRaw) {
            const parsed = JSON.parse(storedPieceReportRaw) as Record<string, unknown>
            Object.keys(parsed).forEach((pieceNo) => reportedPieceNos.add(pieceNo))
          }
        } catch {
          // ignore storage parse errors in demo flow
        }
      }

      let normalizedStatus: CargoStatus

      if (hasShipmentCancel) {
        normalizedStatus = "iptal_edildi"
      } else if (hasShipmentHandover) {
        normalizedStatus = "devredildi"
      } else if (cargo.kargo_durumu === "teslim_edildi") {
        normalizedStatus = "teslim_edildi"
      } else if (cargo.kargo_durumu === "dagitimda") {
        normalizedStatus = "dagitimda"
      } else if (cargo.kargo_durumu === "transfer") {
        normalizedStatus = cargo.varis_zamani ? "varis_subede" : "transfer_surecinde"
      } else {
        normalizedStatus = "olusturuldu"
      }

      const pieceStatusDisplay =
        canceledPieceNos.size > 0
          ? `Kısmi İptal (${canceledPieceNos.size}/${cargo.t_adet})`
          : reportedPieceNos.size > 0
            ? `İhbar (${reportedPieceNos.size} Parçada)`
            : "-"

      const latestPieceUpdate = getLatestDateTime(pieceRows.map((piece) => piece.guncellenme_zamani))
      const latestActionAt = getLatestDateTime([
        cargo.olusturulma_zamani,
        cargo.varis_zamani,
        cargo.teslimat_zamani,
        latestPieceUpdate,
        shipmentCancelAt,
        shipmentHandoverAt,
      ])

      return {
        ...cargo,
        kargo_durumu: normalizedStatus,
        parca_durumu_gosterim: pieceStatusDisplay,
        son_islem_zamani: latestActionAt || cargo.olusturulma_zamani,
      }
    })
  }, [])

  useEffect(() => {
    setAllCargos(buildViewCargos())

    const handleStorage = () => {
      setAllCargos(buildViewCargos())
    }

    window.addEventListener("storage", handleStorage)
    return () => {
      window.removeEventListener("storage", handleStorage)
    }
  }, [buildViewCargos])

  const openHandoverModal = useCallback((cargo: ViewCargoRow) => {
    setActiveCargo(cargo)
    setHandoverInitialValues({ reason: "musteri_adreste_degil", note: "" })
    setHandoverModalOpen(true)
  }, [])

  const openCancelModal = useCallback((cargo: ViewCargoRow) => {
    setActiveCargo(cargo)
    setCancelInitialValues({
      category: "operasyonel",
      reason: "musteri_talebi",
      note: "",
    })
    setCancelModalOpen(true)
  }, [])

  const handleConfirmShipmentHandover = useCallback(
    (values: { reason: string; note?: string }) => {
      if (!activeCargo || loading.shipmentHandover) {
        return
      }

      void (async () => {
        const result = await submitShipmentHandover({
          trackingNo: activeCargo.takip_no,
          reason: values.reason,
          note: values.note ?? "",
        })

        if (result.ok) {
          const trackingNo = activeCargo.takip_no.replace("ARF-", "")
          const handoverInfo = {
            transferredAt: new Date().toLocaleString("tr-TR"),
            transferredBy: "Operasyon Merkezi",
            receiverBranch: activeCargo.alici_sube,
            reason: values.reason,
            note: values.note ?? "",
          }

          try {
            localStorage.setItem(`shipment-handover-info:${trackingNo}`, JSON.stringify(handoverInfo))
          } catch {
            // ignore storage write errors in demo flow
          }

          setAllCargos(buildViewCargos())
          setHandoverModalOpen(false)
        }
      })()
    },
    [activeCargo, buildViewCargos, loading.shipmentHandover, submitShipmentHandover],
  )

  const handleConfirmShipmentCancel = useCallback(
    (values: { category: string; reason: string; note: string }) => {
      if (!activeCargo || loading.shipmentCancel) {
        return
      }

      void (async () => {
        const result = await submitShipmentCancel({
          trackingNo: activeCargo.takip_no,
          reason: values.reason,
          note: values.note,
        })

        if (result.ok) {
          const trackingNo = activeCargo.takip_no.replace("ARF-", "")
          const cancelInfo = {
            canceledAt: new Date().toLocaleString("tr-TR"),
            canceledBy: "Operasyon Merkezi",
            category: values.category,
            reason: values.reason,
            note: values.note,
          }

          try {
            localStorage.setItem(`shipment-cancel-info:${trackingNo}`, JSON.stringify(cancelInfo))
          } catch {
            // ignore storage write errors in demo flow
          }

          setAllCargos(buildViewCargos())
          setCancelModalOpen(false)
        }
      })()
    },
    [activeCargo, buildViewCargos, loading.shipmentCancel, submitShipmentCancel],
  )

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    const timer = window.setTimeout(() => {
      const result = queryCargos({ rows: allCargos, pagination, sorting, columnFilters })

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
  }, [allCargos, pagination, sorting, columnFilters])

  const summaryCards = useMemo(() => {
    const totalCargo = mockCargos.length
    const totalAmount = mockCargos.reduce((sum, row) => sum + row.toplam, 0)
    const deliveredCount = mockCargos.filter((row) => row.kargo_durumu === "teslim_edildi").length
    const waitingCount = mockCargos.filter((row) => row.kargo_durumu === "beklemede").length

    return [
      {
        label: "Toplam Kargo",
        value: new Intl.NumberFormat("tr-TR").format(totalCargo),
        icon: Package,
        iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
        valueClass: "text-foreground",
      },
      {
        label: "Toplam Tutar",
        value: new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(totalAmount),
        icon: Building2,
        iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
        valueClass: "text-foreground",
      },
      {
        label: "Teslim Edildi",
        value: new Intl.NumberFormat("tr-TR").format(deliveredCount),
        icon: CheckCircle2,
        iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
        valueClass: "text-foreground",
      },
      {
        label: "Beklemede",
        value: new Intl.NumberFormat("tr-TR").format(waitingCount),
        icon: Clock,
        iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
        valueClass: "text-foreground",
      },
    ]
  }, [])

  const handleTableReady = useCallback((nextTable: TanStackTable<ViewCargoRow>) => {
    setTable(nextTable)
  }, [])

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
      return fromDate <= toDate ? { from: fromDate, to: toDate } : { from: toDate, to: fromDate }
    }

    if (fromDate) {
      return { from: fromDate, to: undefined }
    }

    return { from: toDate, to: undefined }
  }, [createdAtFrom, createdAtTo])

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

  const columns = useMemo<ColumnDef<ViewCargoRow>[]>(
    () => [
      {
        accessorKey: "takip_no",
        enableHiding: false,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Takip No" />,
        cell: ({ row }) => (
          <Link
            href={`/arf/cargo/shipments/${row.original.id}`}
            className="font-mono text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60"
          >
            {row.original.takip_no}
          </Link>
        ),
      },
      {
        accessorKey: "gonderen_musteri",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderici Müşteri" />,
      },
      {
        accessorKey: "gonderen_sube",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderici Şube" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.gonderen_sube}</span>,
      },
      {
        accessorKey: "alici_sube",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı Şube" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.alici_sube}</span>,
      },
      {
        accessorKey: "alici_musteri",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı Müşteri" />,
      },
      {
        accessorKey: "alici_telefon",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı Telefon" />,
        cell: ({ row }) => <span className="tabular-nums">{row.original.alici_telefon}</span>,
      },
      {
        accessorKey: "odeme_turu",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ödeme Türü" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.odeme_turu}</span>,
      },
      {
        accessorKey: "fatura_turu",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Fatura Durumu" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.fatura_turu}</span>,
      },
      {
        accessorKey: "matrah",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Matrah (Fiyat)" />,
        cell: ({ row }) => (
          <span className="tabular-nums">
            {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(row.original.matrah)}
          </span>
        ),
      },
      {
        accessorKey: "kdv",
        header: ({ column }) => <DataTableColumnHeader column={column} title="KDV (%20)" />,
        cell: ({ row }) => (
          <span className="tabular-nums">
            {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(row.original.kdv)}
          </span>
        ),
      },
      {
        accessorKey: "toplam",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam" />,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">
            {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(row.original.toplam)}
          </span>
        ),
      },
      {
        accessorKey: "t_adet",
        header: ({ column }) => <DataTableColumnHeader column={column} title="T. Adet" />,
        cell: ({ row }) => <span className="tabular-nums">{row.original.t_adet}</span>,
      },
      {
        accessorKey: "t_desi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="T. Desi" />,
        cell: ({ row }) => <span className="tabular-nums">{row.original.t_desi}</span>,
      },
      {
        accessorKey: "parca_listesi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Parça Listesi" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.parca_listesi}</span>,
      },
      {
        accessorKey: "irsaliye_no",
        header: ({ column }) => <DataTableColumnHeader column={column} title="İrsaliye No" />,
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.irsaliye_no || "—"}</span>,
      },
      {
        accessorKey: "atf_no",
        header: ({ column }) => <DataTableColumnHeader column={column} title="ATF No" />,
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.atf_no || "—"}</span>,
      },
      {
        accessorKey: "olusturulma_zamani",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturulma Zamanı" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.olusturulma_zamani}</span>,
      },
      {
        accessorKey: "son_islem_zamani",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Son İşlem Zamanı" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.son_islem_zamani}</span>,
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
        accessorKey: "kargo_durumu",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kargo Durumu" />,
        cell: ({ row }) => {
          const status = kargoStatusConfig[row.original.kargo_durumu]
          const StatusIcon = status?.icon || Package
          return (
            <Badge variant="outline" className={status?.className}>
              <StatusIcon className="mr-1.5 size-3" />
              {status?.label || row.original.kargo_durumu}
            </Badge>
          )
        },
      },
      {
        accessorKey: "parca_durumu_gosterim",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Parça Durumu" />,
        cell: ({ row }) => {
          const value = row.original.parca_durumu_gosterim

          if (value.startsWith("Kısmi İptal")) {
            return (
              <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20">
                {value}
              </Badge>
            )
          }

          if (value.startsWith("İhbar")) {
            return (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20">
                {value}
              </Badge>
            )
          }

          return <span className="text-muted-foreground">-</span>
        },
      },
      {
        accessorKey: "fatura_durumu",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Fatura Durumu" />,
        cell: ({ row }) => {
          const status = faturaStatusConfig[row.original.fatura_durumu]
          return (
            <Badge variant="outline" className={status?.className}>
              {status?.label || row.original.fatura_durumu}
            </Badge>
          )
        },
      },
      {
        accessorKey: "tahsilat_durumu",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tahsilat Durumu" />,
        cell: ({ row }) => {
          const status = tahsilatStatusConfig[row.original.tahsilat_durumu]
          return (
            <Badge variant="outline" className={status?.className}>
              {status?.label || row.original.tahsilat_durumu}
            </Badge>
          )
        },
      },
      {
        accessorKey: "olusturan",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturan" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.olusturan}</span>,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">İşlemler</span>,
        enableSorting: false,
        enableHiding: false,
        size: 136,
        minSize: 120,
        maxSize: 152,
        cell: ({ row }) => {
          const backendTrackingLink =
            (row.original as CargoRow & { takip_linki?: string; tracking_link?: string }).takip_linki ??
            (row.original as CargoRow & { takip_linki?: string; tracking_link?: string }).tracking_link

          return (
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-medium">
                    İşlemler
                    <ChevronDown className="ml-1 size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>{`Takip No ${row.original.takip_no} İşlemler:`}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/arf/cargo/shipments/${row.original.id}`}>
                      <Eye className="mr-2 size-4" />
                      Detay Görüntüle
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/arf/cargo/shipments/${row.original.id}?action=print-slip`}>
                      <Printer className="mr-2 size-4" />
                      Bilgi Fişi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      openHandoverModal(row.original)
                    }}
                  >
                    <ArrowRightLeft className="mr-2 size-4" />
                    Devret
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-amber-700 focus:text-amber-700"
                    onSelect={() => {
                      openCancelModal(row.original)
                    }}
                  >
                    <Ban className="mr-2 size-4" />
                    İptal
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={!backendTrackingLink}
                    onSelect={(event: Event) => {
                      event.preventDefault()
                      if (!backendTrackingLink) {
                        return
                      }

                      void navigator.clipboard?.writeText(backendTrackingLink).catch(() => {})
                    }}
                  >
                    <Copy className="mr-2 size-4" />
                    Takip Linki
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [],
  )

  const pageCount = Math.max(1, Math.ceil(totalRows / pagination.pageSize))

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Kargo İşlemleri", href: "/arf/cargo/shipments" },
        { label: "Kargo Listesi" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Kargo Listesi</h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href="/arf/cargo/shipments/canceled">
                <Ban className="mr-2 size-4" />
                İptal Kargo Listesi
              </Link>
            </Button>
            <Button
              type="button"
              variant={isDevirFilterActive ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setColumnFilters((previous) => {
                  const withoutStatus = previous.filter((item) => item.id !== "kargo_durumu")

                  if (isDevirFilterActive) {
                    return withoutStatus
                  }

                  return [...withoutStatus, { id: "kargo_durumu", value: ["devredildi"] }]
                })
                setPagination((previous) => ({ ...previous, pageIndex: 0 }))
              }}
            >
              <ArrowRightLeft className="mr-2 size-4" />
              Devir Kargo Listesi
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
            <Button size="sm" asChild>
              <Link href="/arf/cargo/shipments/new">
                <Plus className="mr-2 size-4" />
                Yeni Kargo
              </Link>
            </Button>
          </div>
        </div>

        {isSummaryVisible && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                {!showFacetedFilters && <DataTableExcelActions table={table} filename="kargo-listesi" exportSelected={false} exportLabel="Dışarı Aktar" />}

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
                        options={paymentTypeFilterOptions}
                      />
                      <DataTableFacetedFilter
                        column={table.getColumn("kargo_durumu")}
                        title="Kargo Durumu"
                        options={statusFilterOptions}
                      />
                      <DataTableFacetedFilter
                        column={table.getColumn("fatura_turu")}
                        title="Fatura Durumu"
                        options={invoiceTypeFilterOptions}
                      />
                      <DataTableFacetedFilter
                        column={table.getColumn("tahsilat_durumu")}
                        title="Tahsilat Durumu"
                        options={collectionStatusFilterOptions}
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
              stickyFirstColumn
              stickyLastColumn
              isLoading={isLoading}
              className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
              emptyMessage="Gösterilecek kargo bulunamadı."
              onTableReady={handleTableReady}
            />

            {table && (
              <DataTablePagination table={table as TanStackTable<unknown>} pageSizeOptions={[5, 10, 20, 50]} totalRows={totalRows} />
            )}
          </CardContent>
        </Card>

        <ShipmentHandoverModal
          open={handoverModalOpen}
          onOpenChange={setHandoverModalOpen}
          trackingNo={activeCargo?.takip_no || "-"}
          receiverBranch={activeCargo?.alici_sube || "-"}
          initialValues={handoverInitialValues}
          onConfirm={handleConfirmShipmentHandover}
        />

        <ShipmentCancelModal
          open={cancelModalOpen}
          onOpenChange={setCancelModalOpen}
          trackingNo={activeCargo?.takip_no || "-"}
          initialValues={cancelInitialValues}
          onConfirm={handleConfirmShipmentCancel}
        />
      </div>
    </>
  )
}
