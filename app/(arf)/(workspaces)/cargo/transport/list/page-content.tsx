"use client"

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react"
import Link from "next/link"
import {
  DataTable,
  DataTableColumnHeader,
  DataTableExcelActions,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import type { ColumnDef, ColumnFiltersState, PaginationState, SortingState, Table as TanStackTable, Updater } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Ban,
  CalendarIcon,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Filter,
  Loader2,
  Package,
  Plus,
  PlusCircle,
  Truck,
  TrendingUp,
  Building2,
  Wallet,
  Copy,
} from "lucide-react"
import { tr } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"

import type { TasimaListRow, TasimaDurum, GonderiTipi } from "./_types/transport-list"
import { mockTasimalar } from "./_mock/transport-list-mock-data"

/* ─── Durum Konfigürasyonu ─── */

const durumConfig: Record<TasimaDurum, { label: string; className: string; icon: typeof Package }> = {
  planlanmis: {
    label: "Planlanmış",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    icon: Clock,
  },
  yukleniyor: {
    label: "Yükleniyor",
    className: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    icon: Loader2,
  },
  yolda: {
    label: "Yolda",
    className: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    icon: Truck,
  },
  teslim_edildi: {
    label: "Teslim Edildi",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: CheckCircle2,
  },
  iptal: {
    label: "İptal",
    className: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: Ban,
  },
}

const gonderiTipiBadge: Record<GonderiTipi, { label: string; className: string }> = {
  FTL: { label: "FTL", className: "bg-violet-500/10 text-violet-600 border-violet-500/20" },
  LTL: { label: "LTL", className: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
}

/* ─── Filtre Seçenekleri ─── */

const durumFilterOptions = [
  { label: "Planlanmış", value: "planlanmis" },
  { label: "Yükleniyor", value: "yukleniyor" },
  { label: "Yolda", value: "yolda" },
  { label: "Teslim Edildi", value: "teslim_edildi" },
  { label: "İptal", value: "iptal" },
]

const gonderiTipiFilterOptions = [
  { label: "FTL – Komple", value: "FTL" },
  { label: "LTL – Parsiyel", value: "LTL" },
]

const tasimaciFirmaFilterOptions = [
  { label: "DELTA TEDARİK", value: "DELTA TEDARİK" },
  { label: "MARS LOJİSTİK", value: "MARS LOJİSTİK" },
  { label: "STAR TAŞIMACILIK", value: "STAR TAŞIMACILIK" },
]

/* ─── Tarih Yardımcıları ─── */

const isValidIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)

const parseIsoDate = (value: string): Date | undefined => {
  if (!isValidIsoDate(value)) return undefined
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime()) || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return undefined
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
  if (!match) return undefined
  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime()) || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return undefined
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
  if (!fromDate && !toDate) return ""
  if (fromDate && toDate && from === to) return formatDisplayDate(fromDate)
  if (fromDate && toDate) return `${formatDisplayDate(fromDate)} - ${formatDisplayDate(toDate)}`
  if (fromDate) return formatDisplayDate(fromDate)
  if (toDate) return formatDisplayDate(toDate)
  return ""
}

const parseRangeInput = (value: string): { from?: string; to?: string } => {
  const normalized = value.trim()
  if (!normalized) return {}
  const dateMatches = normalized.match(/\d{2}[./-]\d{2}[./-]\d{4}/g) ?? []
  if (dateMatches.length === 0) return {}
  const [firstDateText, secondDateText] = dateMatches
  if (!firstDateText) return {}
  const fromDate = parseDisplayDate(firstDateText)
  if (!fromDate) return {}
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
  return { from: formatIsoDate(startDate), to: formatIsoDate(endDate) }
}

const getDateOnly = (value: string) => value.split(" ")[0] ?? ""

const resolveUpdater = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === "function" ? (updater as (old: T) => T)(previous) : updater

/* ─── Sunucu-taklidi sorgu ─── */

const queryTransports = ({
  rows,
  pagination,
  sorting,
  columnFilters,
}: {
  rows: TasimaListRow[]
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
}) => {
  let filtered = [...rows]

  for (const filter of columnFilters) {
    if (filter.id === "durum" || filter.id === "gonderiTipi" || filter.id === "tasimaciFirma") {
      const selected = Array.isArray(filter.value) ? (filter.value as string[]) : []
      if (selected.length > 0) {
        filtered = filtered.filter((row) => selected.includes(String(row[filter.id as keyof TasimaListRow] ?? "")))
      }
      continue
    }

    if (filter.id === "yuklemeTarihi") {
      const value = (filter.value ?? {}) as { from?: string; to?: string }
      if (value.from || value.to) {
        filtered = filtered.filter((row) => {
          const dateOnly = getDateOnly(row.yuklemeTarihi)
          if (!dateOnly) return false
          if (value.from && dateOnly < value.from) return false
          if (value.to && dateOnly > value.to) return false
          return true
        })
      }
    }
  }

  if (sorting.length > 0) {
    const [{ id, desc }] = sorting
    filtered.sort((a, b) => {
      const left = a[id as keyof TasimaListRow]
      const right = b[id as keyof TasimaListRow]
      if (typeof left === "number" && typeof right === "number") return desc ? right - left : left - right
      const leftText = String(left ?? "")
      const rightText = String(right ?? "")
      if (leftText === rightText) return 0
      if (desc) return leftText < rightText ? 1 : -1
      return leftText > rightText ? 1 : -1
    })
  }

  const totalRows = filtered.length
  const start = pagination.pageIndex * pagination.pageSize
  const end = start + pagination.pageSize

  return { rows: filtered.slice(start, end), totalRows }
}

/* ─── Sayfa Bileşeni ─── */

const SUMMARY_VISIBILITY_STORAGE_KEY = "arf:transport:list:summary-visible"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value)

const formatNumber = (value: number) => new Intl.NumberFormat("tr-TR").format(value)

export default function TasimaListesiPage() {
  const [table, setTable] = useState<TanStackTable<TasimaListRow> | null>(null)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([{ id: "tasimaNo", desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [data, setData] = useState<TasimaListRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [dateRangeInput, setDateRangeInput] = useState("")
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false)

  const [isSummaryVisible, setIsSummaryVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return true
    try {
      return localStorage.getItem(SUMMARY_VISIBILITY_STORAGE_KEY) !== "0"
    } catch {
      return true
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(SUMMARY_VISIBILITY_STORAGE_KEY, isSummaryVisible ? "1" : "0")
    } catch {
      // ignore
    }
  }, [isSummaryVisible])

  /* ─── Veri yükle ─── */

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    const timer = window.setTimeout(() => {
      const result = queryTransports({ rows: mockTasimalar, pagination, sorting, columnFilters })
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
  }, [pagination, sorting, columnFilters])

  /* ─── Özet kartlar ─── */

  const summaryCards = useMemo(() => {
    const totalTransport = mockTasimalar.length
    const deliveredCount = mockTasimalar.filter((row) => row.durum === "teslim_edildi").length
    const totalPurchase = mockTasimalar.reduce((sum, row) => sum + row.alisFiyat, 0)
    const totalSales = mockTasimalar.reduce((sum, row) => sum + row.satisFiyat, 0)
    const totalProfit = mockTasimalar.filter((r) => r.durum !== "iptal").reduce((sum, r) => sum + r.kar, 0)

    return [
      {
        label: "Toplam Taşıma",
        value: formatNumber(totalTransport),
        icon: Truck,
        iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
        valueClass: "text-foreground",
      },
      {
        label: "Teslim Edildi",
        value: formatNumber(deliveredCount),
        icon: CheckCircle2,
        iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
        valueClass: "text-foreground",
      },
      {
        label: "Toplam Alış",
        value: formatCurrency(totalPurchase),
        icon: Wallet,
        iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
        valueClass: "text-foreground",
      },
      {
        label: "Toplam Satış",
        value: formatCurrency(totalSales),
        icon: Building2,
        iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
        valueClass: "text-foreground",
      },
      {
        label: "Toplam Kar",
        value: formatCurrency(totalProfit),
        icon: TrendingUp,
        iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
        valueClass: "text-foreground",
      },
    ]
  }, [])

  /* ─── Callback'ler ─── */

  const handleTableReady = useCallback((nextTable: TanStackTable<TasimaListRow>) => {
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
      const withoutDate = previous.filter((item) => item.id !== "yuklemeTarihi")
      if (!normalizedFrom && !normalizedTo) return withoutDate
      return [...withoutDate, { id: "yuklemeTarihi", value: { from: normalizedFrom, to: normalizedTo } }]
    })

    setPagination((previous) => ({ ...previous, pageIndex: 0 }))
  }, [])

  const handleDateFilterChange = useCallback(
    (nextFrom: string, nextTo: string) => {
      setDateFrom(nextFrom)
      setDateTo(nextTo)
      setDateFilterValue(nextFrom, nextTo)
    },
    [setDateFilterValue],
  )

  const selectedDateRange = useMemo<DateRange | undefined>(() => {
    const fromDate = parseIsoDate(dateFrom)
    const toDate = parseIsoDate(dateTo)
    if (!fromDate && !toDate) return undefined
    if (fromDate && toDate) return fromDate <= toDate ? { from: fromDate, to: toDate } : { from: toDate, to: fromDate }
    if (fromDate) return { from: fromDate, to: undefined }
    return { from: toDate, to: undefined }
  }, [dateFrom, dateTo])

  const handleDateRangeInputChange = useCallback(
    (value: string) => {
      setDateRangeInput(value)
      const parsed = parseRangeInput(value)
      handleDateFilterChange(parsed.from ?? "", parsed.to ?? "")
    },
    [handleDateFilterChange],
  )

  const handleDateRangeSelect = useCallback(
    (range: DateRange | undefined) => {
      if (!range?.from) {
        setDateRangeInput("")
        handleDateFilterChange("", "")
        setIsDateRangePickerOpen(false)
        return
      }
      const fromIso = formatIsoDate(range.from)
      if (!range.to) {
        setDateRangeInput(formatDisplayDate(range.from))
        handleDateFilterChange(fromIso, "")
        return
      }
      const [startDate, endDate] = range.from <= range.to ? [range.from, range.to] : [range.to, range.from]
      const startIso = formatIsoDate(startDate)
      const endIso = formatIsoDate(endDate)
      setDateRangeInput(formatRangeDisplay(startIso, endIso))
      handleDateFilterChange(startIso, endIso)
    },
    [handleDateFilterChange],
  )

  useEffect(() => {
    const dateFilter = columnFilters.find((item) => item.id === "yuklemeTarihi")
    const value = (dateFilter?.value ?? {}) as { from?: string; to?: string }
    const nextFrom = value.from && isValidIsoDate(value.from) ? value.from : ""
    const nextTo = value.to && isValidIsoDate(value.to) ? value.to : ""
    if (nextFrom !== dateFrom) setDateFrom(nextFrom)
    if (nextTo !== dateTo) setDateTo(nextTo)
    const nextRangeText = formatRangeDisplay(nextFrom, nextTo)
    if (nextRangeText !== dateRangeInput) setDateRangeInput(nextRangeText)
  }, [columnFilters, dateFrom, dateTo, dateRangeInput])

  /* ─── Sütun tanımları ─── */

  const columns = useMemo<ColumnDef<TasimaListRow>[]>(
    () => [
      {
        accessorKey: "tasimaNo",
        enableHiding: false,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Taşıma No" />,
        cell: ({ row }) => (
          <span className="font-mono text-sm font-semibold text-secondary">
            {row.original.tasimaNo}
          </span>
        ),
      },
      {
        accessorKey: "yuklemeTarihi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Yükleme Tarihi" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.yuklemeTarihi}</span>,
      },
      {
        accessorKey: "gonderiTipi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderi Tipi" />,
        cell: ({ row }) => {
          const tip = gonderiTipiBadge[row.original.gonderiTipi]
          return (
            <Badge variant="outline" className={tip.className}>
              {tip.label}
            </Badge>
          )
        },
      },
      {
        accessorKey: "gondericiMusteri",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderici" />,
      },
      {
        accessorKey: "aliciMusteri",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı" />,
      },
      {
        accessorKey: "cikisAdres",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Çıkış Adresi" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.cikisAdres}</span>,
      },
      {
        accessorKey: "varisAdres",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Varış Adresi" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.varisAdres}</span>,
      },
      {
        accessorKey: "tasimaciFirma",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tedarikçi" />,
      },
      {
        accessorKey: "aracPlaka",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Araç Plaka" />,
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.aracPlaka}</span>,
      },
      {
        accessorKey: "surucu",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sürücü" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.surucu}</span>,
      },
      {
        accessorKey: "yukTipleri",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Yük Tipi" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.yukTipleri}</span>,
      },
      {
        accessorKey: "toplamAdet",
        header: ({ column }) => <DataTableColumnHeader column={column} title="T. Adet" />,
        cell: ({ row }) => <span className="tabular-nums">{formatNumber(row.original.toplamAdet)}</span>,
      },
      {
        accessorKey: "toplamAgirlik",
        header: ({ column }) => <DataTableColumnHeader column={column} title="T. Ağırlık (kg)" />,
        cell: ({ row }) => <span className="tabular-nums">{formatNumber(row.original.toplamAgirlik)}</span>,
      },
      {
        accessorKey: "toplamHacim",
        header: ({ column }) => <DataTableColumnHeader column={column} title="T. Hacim (m³)" />,
        cell: ({ row }) => <span className="tabular-nums">{row.original.toplamHacim.toFixed(1)}</span>,
      },
      {
        accessorKey: "toplamDesi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="T. Desi" />,
        cell: ({ row }) => <span className="tabular-nums">{formatNumber(row.original.toplamDesi)}</span>,
      },
      {
        accessorKey: "alisFiyat",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Alış Fiyat" />,
        cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.alisFiyat)}</span>,
      },
      {
        accessorKey: "satisFiyat",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Satış Fiyat" />,
        cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.satisFiyat)}</span>,
      },
      {
        accessorKey: "kar",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kar" />,
        cell: ({ row }) => {
          const kar = row.original.kar
          const colorClass = kar > 0 ? "text-emerald-600" : kar < 0 ? "text-red-600" : "text-muted-foreground"
          return <span className={cn("font-medium tabular-nums", colorClass)}>{formatCurrency(kar)}</span>
        },
      },
      {
        accessorKey: "durum",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
        cell: ({ row }) => {
          const status = durumConfig[row.original.durum]
          const StatusIcon = status?.icon || Package
          return (
            <Badge variant="outline" className={status?.className}>
              <StatusIcon className="mr-1.5 size-3" />
              {status?.label || row.original.durum}
            </Badge>
          )
        },
      },
      {
        accessorKey: "olusturmaTarihi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturma Tarihi" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.olusturmaTarihi}</span>,
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
        cell: ({ row }) => (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-medium">
                  İşlemler
                  <ChevronDown className="ml-1 size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>{`${row.original.tasimaNo} İşlemler:`}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/arf/cargo/transport/${row.original.tasimaNo}`}>
                    <Eye className="mr-2 size-4" />
                    Detay Görüntüle
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(event: Event) => {
                    event.preventDefault()
                    void navigator.clipboard?.writeText(row.original.tasimaNo).catch(() => {})
                  }}
                >
                  <Copy className="mr-2 size-4" />
                  Taşıma No Kopyala
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [],
  )

  const pageCount = Math.max(1, Math.ceil(totalRows / pagination.pageSize))

  /* ─── Render ─── */

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Taşıma İşlemleri", href: "/arf/cargo/transport/list" },
          { label: "Taşıma Listesi" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Başlık + Aksiyonlar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Taşıma Listesi</h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
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
              <Link href="/arf/cargo/transport/new">
                <Plus className="mr-2 size-4" />
                Yeni Taşıma
              </Link>
            </Button>
          </div>
        </div>

        {/* Özet Kartları */}
        {isSummaryVisible && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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

        {/* DataTable */}
        <Card>
          <CardContent className="space-y-4">
            {table && (
              <div className="flex items-center gap-2">
                {!showFacetedFilters && <DataTableExcelActions table={table} filename="tasima-listesi" exportSelected={false} exportLabel="Dışarı Aktar" />}

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
                            Yükleme Tarihi
                            {dateRangeInput && (
                              <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                                {dateRangeInput}
                              </Badge>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="space-y-3 p-3">
                            <div className="flex items-center rounded-md border border-input bg-background px-2">
                              <Input
                                value={dateRangeInput}
                                placeholder="GG.AA.YYYY - GG.AA.YYYY"
                                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                  handleDateRangeInputChange(event.target.value)
                                }
                                className="h-8 w-[260px] border-0 px-0 focus-visible:ring-0"
                              />
                              <CalendarIcon className="size-4 text-muted-foreground" />
                            </div>

                            <div className="border-t pt-3">
                              <Calendar
                                mode="range"
                                selected={selectedDateRange}
                                onSelect={handleDateRangeSelect}
                                numberOfMonths={2}
                                locale={tr}
                                showOutsideDays={false}
                                initialFocus
                              />
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-3">
                              {(dateFrom || dateTo) && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setDateRangeInput("")
                                    handleDateFilterChange("", "")
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
                        column={table.getColumn("gonderiTipi")}
                        title="Gönderi Tipi"
                        options={gonderiTipiFilterOptions}
                      />
                      <DataTableFacetedFilter
                        column={table.getColumn("durum")}
                        title="Durum"
                        options={durumFilterOptions}
                      />
                      <DataTableFacetedFilter
                        column={table.getColumn("tasimaciFirma")}
                        title="Taşımacı Firma"
                        options={tasimaciFirmaFilterOptions}
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
              emptyMessage="Gösterilecek taşıma bulunamadı."
              onTableReady={handleTableReady}
            />

            {table && (
              <DataTablePagination table={table as TanStackTable<unknown>} pageSizeOptions={[5, 10, 20, 50]} totalRows={totalRows} />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
