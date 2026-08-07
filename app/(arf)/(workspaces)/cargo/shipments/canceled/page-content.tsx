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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Ban, Building2, CalendarIcon, ChevronDown, ChevronUp, Eye, Filter, PlusCircle } from "lucide-react"
import { mockCanceledCargoList } from "../_mock/shipments-mock-data"

type CanceledCargoRow = {
  id: string
  takip_no: string
  gonderen_musteri: string
  gonderen_sube: string
  alici_musteri: string
  alici_sube: string
  odeme_turu: string
  toplam: number
  olusturulma_zamani: string
  iptal_tarihi: string
  iptal_nedeni: string
  iptal_nedeni_kategori: "musteri_talebi" | "operasyonel" | "adres_hatasi" | "odeme_sorunu"
  iptal_eden: string
  iade_durumu: "beklemede" | "kismi_iade" | "tamamlandi"
  iade_tutari: number
  tahsilat_durumu: "tahsil_edildi" | "beklemede" | "iade_edildi"
}
const mockCanceledCargos = mockCanceledCargoList as CanceledCargoRow[]


const iptalNedeniLabels: Record<CanceledCargoRow["iptal_nedeni_kategori"], string> = {
  musteri_talebi: "Müşteri Talebi",
  operasyonel: "Operasyonel",
  adres_hatasi: "Adres Hatası",
  odeme_sorunu: "Ödeme Sorunu",
}

const reasonFilterOptions = [
  { label: "Müşteri Talebi", value: "musteri_talebi" },
  { label: "Operasyonel", value: "operasyonel" },
  { label: "Adres Hatası", value: "adres_hatasi" },
  { label: "Ödeme Sorunu", value: "odeme_sorunu" },
]

const SUMMARY_VISIBILITY_STORAGE_KEY = "arf:shipments:canceled:summary-visible"

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

const queryCanceledCargos = ({
  pagination,
  sorting,
  columnFilters,
}: {
  pagination: PaginationState
  sorting: SortingState
  columnFilters: ColumnFiltersState
}) => {
  let filtered = [...mockCanceledCargos]

  for (const filter of columnFilters) {
    if (filter.id === "iptal_nedeni_kategori") {
      const selected = Array.isArray(filter.value) ? (filter.value as string[]) : []
      if (selected.length > 0) {
        filtered = filtered.filter((row) => selected.includes(row.iptal_nedeni_kategori))
      }
      continue
    }

    if (filter.id === "olusturulma_zamani" || filter.id === "iptal_tarihi") {
      const value = (filter.value ?? {}) as { from?: string; to?: string }
      if (value.from || value.to) {
        filtered = filtered.filter((row) => {
          const dateOnly = getDateOnly(String(row[filter.id as keyof CanceledCargoRow] ?? ""))
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
      const left = a[id as keyof CanceledCargoRow]
      const right = b[id as keyof CanceledCargoRow]

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

export default function IptalKargoListesiPage() {
  const [table, setTable] = useState<TanStackTable<CanceledCargoRow> | null>(null)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 })
  const [sorting, setSorting] = useState<SortingState>([{ id: "iptal_tarihi", desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [data, setData] = useState<CanceledCargoRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const [createdAtFrom, setCreatedAtFrom] = useState("")
  const [createdAtTo, setCreatedAtTo] = useState("")
  const [createdAtRangeInput, setCreatedAtRangeInput] = useState("")
  const [isCreatedAtPickerOpen, setIsCreatedAtPickerOpen] = useState(false)
  const [canceledAtFrom, setCanceledAtFrom] = useState("")
  const [canceledAtTo, setCanceledAtTo] = useState("")
  const [canceledAtRangeInput, setCanceledAtRangeInput] = useState("")
  const [isCanceledAtPickerOpen, setIsCanceledAtPickerOpen] = useState(false)
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

  useEffect(() => {
    try {
      localStorage.setItem(SUMMARY_VISIBILITY_STORAGE_KEY, isSummaryVisible ? "1" : "0")
    } catch {
      // ignore storage write errors in demo flow
    }
  }, [isSummaryVisible])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    const timer = window.setTimeout(() => {
      const result = queryCanceledCargos({ pagination, sorting, columnFilters })

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

  const summaryCards = useMemo(() => {
    const totalCanceled = mockCanceledCargos.length
    const totalCanceledAmount = mockCanceledCargos.reduce((sum, row) => sum + row.toplam, 0)

    return [
      {
        label: "Toplam İptal Kargo",
        value: new Intl.NumberFormat("tr-TR").format(totalCanceled),
        icon: Ban,
        iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
        valueClass: "text-foreground",
      },
      {
        label: "Toplam İptal Tutarı",
        value: new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(totalCanceledAmount),
        icon: Building2,
        iconWrapClass: "bg-primary/12 text-secondary border-secondary/25",
        valueClass: "text-foreground",
      },
    ]
  }, [])

  const handleTableReady = useCallback((nextTable: TanStackTable<CanceledCargoRow>) => {
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

  const setDateFilterValue = useCallback((id: "olusturulma_zamani" | "iptal_tarihi", from: string, to: string) => {
    const normalizedFrom = isValidIsoDate(from) ? from : undefined
    const normalizedTo = isValidIsoDate(to) ? to : undefined

    setColumnFilters((previous) => {
      const withoutTarget = previous.filter((item) => item.id !== id)

      if (!normalizedFrom && !normalizedTo) {
        return withoutTarget
      }

      return [
        ...withoutTarget,
        {
          id,
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
      setDateFilterValue("olusturulma_zamani", nextFrom, nextTo)
    },
    [setDateFilterValue],
  )

  const handleCanceledAtFilterChange = useCallback(
    (nextFrom: string, nextTo: string) => {
      setCanceledAtFrom(nextFrom)
      setCanceledAtTo(nextTo)
      setDateFilterValue("iptal_tarihi", nextFrom, nextTo)
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

  const selectedCanceledAtRange = useMemo<DateRange | undefined>(() => {
    const fromDate = parseIsoDate(canceledAtFrom)
    const toDate = parseIsoDate(canceledAtTo)

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
  }, [canceledAtFrom, canceledAtTo])

  const handleCreatedAtRangeInputChange = useCallback(
    (value: string) => {
      setCreatedAtRangeInput(value)
      const parsed = parseRangeInput(value)
      handleCreatedAtFilterChange(parsed.from ?? "", parsed.to ?? "")
    },
    [handleCreatedAtFilterChange],
  )

  const handleCanceledAtRangeInputChange = useCallback(
    (value: string) => {
      setCanceledAtRangeInput(value)
      const parsed = parseRangeInput(value)
      handleCanceledAtFilterChange(parsed.from ?? "", parsed.to ?? "")
    },
    [handleCanceledAtFilterChange],
  )

  const handleCreatedAtRangeSelect = useCallback(
    (range: DateRange | undefined) => {
      if (!range?.from) {
        setCreatedAtRangeInput("")
        handleCreatedAtFilterChange("", "")
        setIsCreatedAtPickerOpen(false)
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

  const handleCanceledAtRangeSelect = useCallback(
    (range: DateRange | undefined) => {
      if (!range?.from) {
        setCanceledAtRangeInput("")
        handleCanceledAtFilterChange("", "")
        setIsCanceledAtPickerOpen(false)
        return
      }

      const fromIso = formatIsoDate(range.from)
      if (!range.to) {
        setCanceledAtRangeInput(formatDisplayDate(range.from))
        handleCanceledAtFilterChange(fromIso, "")
        return
      }

      const [startDate, endDate] = range.from <= range.to ? [range.from, range.to] : [range.to, range.from]
      const startIso = formatIsoDate(startDate)
      const endIso = formatIsoDate(endDate)

      setCanceledAtRangeInput(formatRangeDisplay(startIso, endIso))
      handleCanceledAtFilterChange(startIso, endIso)
    },
    [handleCanceledAtFilterChange],
  )

  useEffect(() => {
    const createdFilter = columnFilters.find((item) => item.id === "olusturulma_zamani")
    const createdValue = (createdFilter?.value ?? {}) as { from?: string; to?: string }

    const nextCreatedFrom = createdValue.from && isValidIsoDate(createdValue.from) ? createdValue.from : ""
    const nextCreatedTo = createdValue.to && isValidIsoDate(createdValue.to) ? createdValue.to : ""

    if (nextCreatedFrom !== createdAtFrom) {
      setCreatedAtFrom(nextCreatedFrom)
    }

    if (nextCreatedTo !== createdAtTo) {
      setCreatedAtTo(nextCreatedTo)
    }

    const nextCreatedText = formatRangeDisplay(nextCreatedFrom, nextCreatedTo)
    if (nextCreatedText !== createdAtRangeInput) {
      setCreatedAtRangeInput(nextCreatedText)
    }

    const canceledFilter = columnFilters.find((item) => item.id === "iptal_tarihi")
    const canceledValue = (canceledFilter?.value ?? {}) as { from?: string; to?: string }

    const nextCanceledFrom = canceledValue.from && isValidIsoDate(canceledValue.from) ? canceledValue.from : ""
    const nextCanceledTo = canceledValue.to && isValidIsoDate(canceledValue.to) ? canceledValue.to : ""

    if (nextCanceledFrom !== canceledAtFrom) {
      setCanceledAtFrom(nextCanceledFrom)
    }

    if (nextCanceledTo !== canceledAtTo) {
      setCanceledAtTo(nextCanceledTo)
    }

    const nextCanceledText = formatRangeDisplay(nextCanceledFrom, nextCanceledTo)
    if (nextCanceledText !== canceledAtRangeInput) {
      setCanceledAtRangeInput(nextCanceledText)
    }
  }, [
    canceledAtFrom,
    canceledAtRangeInput,
    canceledAtTo,
    columnFilters,
    createdAtFrom,
    createdAtRangeInput,
    createdAtTo,
  ])

  const columns = useMemo<ColumnDef<CanceledCargoRow>[]>(
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
        accessorKey: "alici_musteri",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı Müşteri" />,
      },
      {
        accessorKey: "alici_sube",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı Şube" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.alici_sube}</span>,
      },
      {
        accessorKey: "odeme_turu",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ödeme Türü" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.odeme_turu}</span>,
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
        accessorKey: "olusturulma_zamani",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturulma" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.olusturulma_zamani}</span>,
      },
      {
        accessorKey: "iptal_tarihi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="İptal Tarihi" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.iptal_tarihi}</span>,
      },
      {
        accessorKey: "iptal_nedeni",
        header: ({ column }) => <DataTableColumnHeader column={column} title="İptal Nedeni" />,
      },
      {
        accessorKey: "iptal_nedeni_kategori",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Neden Kategorisi" />,
        cell: ({ row }) => {
          const label = iptalNedeniLabels[row.original.iptal_nedeni_kategori]
          return (
            <Badge variant="outline" className="bg-muted/70 text-muted-foreground border-border">
              {label}
            </Badge>
          )
        },
      },
      {
        accessorKey: "iptal_eden",
        header: ({ column }) => <DataTableColumnHeader column={column} title="İptal Eden" />,
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
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/arf/cargo/shipments/${row.original.id}`}>
                  <Eye className="mr-2 size-4" />
                  Detay Görüntüle
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
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
          { label: "İptal Kargo Listesi" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">İptal Kargo Listesi</h1>
          </div>
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

        {isSummaryVisible && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
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
                  <DataTableExcelActions table={table} filename="iptal-kargo-listesi" exportSelected={false} exportLabel="Dışarı Aktar" />
                )}

                <DataTableToolbar table={table} showColumnSelector={!showFacetedFilters} viewLabel="Görünüm" columnsLabel="Sütunlar" resetLabel="Sıfırla">
                  <Button
                    type="button"
                    variant={showFacetedFilters ? "default" : "outline"}
                    size="sm"
                    className="mr-3 h-8"
                    onClick={() => setShowFacetedFilters((prev) => !prev)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filtreler
                  </Button>

                  {showFacetedFilters && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Popover open={isCreatedAtPickerOpen} onOpenChange={setIsCreatedAtPickerOpen}>
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
                                onClick={() => setIsCreatedAtPickerOpen(false)}
                              >
                                Kapat
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Popover open={isCanceledAtPickerOpen} onOpenChange={setIsCanceledAtPickerOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 border-dashed">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            İptal Tarihi
                            {canceledAtRangeInput && (
                              <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                                {canceledAtRangeInput}
                              </Badge>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="space-y-3 p-3">
                            <div className="flex items-center rounded-md border border-input bg-background px-2">
                              <Input
                                value={canceledAtRangeInput}
                                placeholder="GG.AA.YYYY - GG.AA.YYYY"
                                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                  handleCanceledAtRangeInputChange(event.target.value)
                                }
                                className="h-8 w-[260px] border-0 px-0 focus-visible:ring-0"
                              />
                              <CalendarIcon className="size-4 text-muted-foreground" />
                            </div>

                            <div className="border-t pt-3">
                              <Calendar
                                mode="range"
                                selected={selectedCanceledAtRange}
                                onSelect={handleCanceledAtRangeSelect}
                                numberOfMonths={2}
                                locale={tr}
                                showOutsideDays={false}
                                initialFocus
                              />
                            </div>

                            <div className="flex justify-end gap-2 border-t pt-3">
                              {(canceledAtFrom || canceledAtTo) && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setCanceledAtRangeInput("")
                                    handleCanceledAtFilterChange("", "")
                                  }}
                                >
                                  Temizle
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCanceledAtPickerOpen(false)}
                              >
                                Kapat
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <DataTableFacetedFilter
                        column={table.getColumn("iptal_nedeni_kategori")}
                        title="Neden Kategorisi"
                        options={reasonFilterOptions}
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
              emptyMessage="Gösterilecek iptal kargo bulunamadı."
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
