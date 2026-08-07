"use client"

import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { ColumnFiltersState, Table as TanStackTable } from "@tanstack/react-table"
import type { DateRange } from "react-day-picker"
import { tr } from "date-fns/locale"
import {
  DataTable,
  DataTableExcelActions,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, CheckCircle2, Clock3, Filter, Package, PlusCircle, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { cargoesColumns } from "../_columns/cargoes-columns"
import type { BranchCargoRecord } from "../_types"

// ─── date utilities ────────────────────────────────────────────────────────────
const isValidIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)

const parseIsoDate = (value: string): Date | undefined => {
  if (!isValidIsoDate(value)) return undefined
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) return undefined
  return date
}

const formatIsoDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const formatDisplayDate = (date: Date) => {
  const d = String(date.getDate()).padStart(2, "0")
  const m = String(date.getMonth() + 1).padStart(2, "0")
  return `${d}.${m}.${date.getFullYear()}`
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

const parseDisplayDate = (value: string): Date | undefined => {
  const match = value.trim().match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/)
  if (!match) return undefined
  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) return undefined
  return date
}

const parseRangeInput = (value: string): { from?: string; to?: string } => {
  const normalized = value.trim()
  if (!normalized) return {}
  const dateMatches = normalized.match(/\d{2}[./-]\d{2}[./-]\d{4}/g) ?? []
  if (dateMatches.length === 0) return {}
  const [firstText, secondText] = dateMatches
  if (!firstText) return {}
  const fromDate = parseDisplayDate(firstText)
  if (!fromDate) return {}
  if (dateMatches.length === 1) {
    const iso = formatIsoDate(fromDate)
    return { from: iso, to: iso }
  }
  const toDate = secondText ? parseDisplayDate(secondText) : undefined
  if (!toDate) {
    const iso = formatIsoDate(fromDate)
    return { from: iso, to: iso }
  }
  const [start, end] = fromDate <= toDate ? [fromDate, toDate] : [toDate, fromDate]
  return { from: formatIsoDate(start), to: formatIsoDate(end) }
}
// ──────────────────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
}: {
  label: string
  value: string
  icon: React.ElementType
  iconClass?: string
}) {
  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          </div>
          <div className={cn("rounded-xl p-2.5", iconClass ?? "bg-slate-100")}>
            <Icon className="size-5 text-slate-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const paymentTypeFilterOptions = [
  { label: "Gönderici Ödemeli", value: "Gönderici Ödemeli" },
  { label: "Alıcı Ödemeli", value: "Alıcı Ödemeli" },
]

const cargoStatusFilterOptions = [
  { label: "Oluşturuldu", value: "olusturuldu" },
  { label: "Transfer Sürecinde", value: "transfer_surecinde" },
  { label: "Varış Şubede", value: "varis_subede" },
  { label: "Dağıtımda", value: "dagitimda" },
  { label: "Teslim Edildi", value: "teslim_edildi" },
  { label: "Devredildi", value: "devredildi" },
  { label: "İade", value: "iade" },
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

interface Props {
  cargoes: BranchCargoRecord[]
}

export function DetailCargoesSection({ cargoes }: Props) {
  const [table, setTable] = useState<TanStackTable<BranchCargoRecord> | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [createdAtFrom, setCreatedAtFrom] = useState("")
  const [createdAtTo, setCreatedAtTo] = useState("")
  const [createdAtRangeInput, setCreatedAtRangeInput] = useState("")
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const currentDirection = searchParams.get("yon") ?? "tumu"

  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "tumu" || value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname)
  }

  const filteredCargoes = useMemo(() => {
    if (currentDirection === "tumu") return cargoes
    return cargoes.filter((cargo) => cargo.yon === currentDirection)
  }, [cargoes, currentDirection])

  // İptaller hiçbir zaman gözükmesin
  const displayCargoes = useMemo(() => {
    return filteredCargoes.filter((cargo) => cargo.durum !== "iptal_edildi")
  }, [filteredCargoes])

  const toplamTutar = displayCargoes.reduce((sum, cargo) => sum + cargo.toplam, 0)
  const teslimEdildi = displayCargoes.filter((cargo) => cargo.durum === "teslim_edildi").length
  const beklemede = displayCargoes.filter((cargo) =>
    cargo.durum === "olusturuldu" ||
    cargo.durum === "transfer_surecinde" ||
    cargo.durum === "varis_subede" ||
    cargo.durum === "dagitimda",
  ).length

  // Sync date range state → controlled column filters
  useEffect(() => {
    const from = isValidIsoDate(createdAtFrom) ? createdAtFrom : undefined
    const to = isValidIsoDate(createdAtTo) ? createdAtTo : undefined
    setColumnFilters((prev) => {
      const without = prev.filter((f) => f.id !== "tarih")
      if (!from && !to) return without
      return [...without, { id: "tarih", value: { from, to } }]
    })
  }, [createdAtFrom, createdAtTo])

  const handleCreatedAtFilterChange = useCallback((nextFrom: string, nextTo: string) => {
    setCreatedAtFrom(nextFrom)
    setCreatedAtTo(nextTo)
  }, [])

  const selectedCreatedAtRange = useMemo<DateRange | undefined>(() => {
    const fromDate = parseIsoDate(createdAtFrom)
    const toDate = parseIsoDate(createdAtTo)
    if (!fromDate && !toDate) return undefined
    if (fromDate && toDate) return fromDate <= toDate ? { from: fromDate, to: toDate } : { from: toDate, to: fromDate }
    return { from: fromDate ?? toDate, to: undefined }
  }, [createdAtFrom, createdAtTo])

  const handleRangeInputChange = useCallback((value: string) => {
    setCreatedAtRangeInput(value)
    const parsed = parseRangeInput(value)
    handleCreatedAtFilterChange(parsed.from ?? "", parsed.to ?? "")
  }, [handleCreatedAtFilterChange])

  const handleCalendarSelect = useCallback((range: DateRange | undefined) => {
    if (!range?.from) {
      setCreatedAtRangeInput("")
      handleCreatedAtFilterChange("", "")
      setIsDatePickerOpen(false)
      return
    }
    const fromIso = formatIsoDate(range.from)
    if (!range.to) {
      setCreatedAtRangeInput(formatDisplayDate(range.from))
      handleCreatedAtFilterChange(fromIso, "")
      return
    }
    const [start, end] = range.from <= range.to ? [range.from, range.to] : [range.to, range.from]
    const startIso = formatIsoDate(start)
    const endIso = formatIsoDate(end)
    setCreatedAtRangeInput(formatRangeDisplay(startIso, endIso))
    handleCreatedAtFilterChange(startIso, endIso)
  }, [handleCreatedAtFilterChange])

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Toplam Kargo" value={String(displayCargoes.length)} icon={Package} iconClass="bg-slate-100" />
        <StatCard
          label="Toplam Tutar"
          value={new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(toplamTutar)}
          icon={TrendingUp}
          iconClass="bg-blue-50"
        />
        <StatCard label="Teslim Edildi" value={String(teslimEdildi)} icon={CheckCircle2} iconClass="bg-emerald-50" />
        <StatCard label="Beklemede" value={String(beklemede)} icon={Clock3} iconClass="bg-amber-50" />
      </div>

      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: "Tümü", value: "tumu" },
                { label: "Gönderici", value: "gonderici" },
                { label: "Alıcı", value: "alici" },
              ].map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  variant={currentDirection === item.value ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={() => updateQuery("yon", item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            {currentDirection !== "tumu" && (
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                Aktif filtre: {currentDirection === "gonderici" ? "Gönderici" : "Alıcı"}
              </Badge>
            )}
          </div>

          {table && (
            <div className="space-y-4">
              {!showFilters && (
                <div className="flex items-center gap-2">
                  <DataTableExcelActions table={table} filename="sube-kargolari" exportSelected={false} exportLabel="Dışarı Aktar" />
                  <DataTableToolbar 
                    table={table} 
                    showColumnSelector
                    viewLabel="Görünüm" 
                    columnsLabel="Sütunlar"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mr-3 h-8"
                      onClick={() => setShowFilters(true)}
                    >
                      <Filter className="mr-2 size-4" />
                      Filtreler
                    </Button>
                  </DataTableToolbar>
                </div>
              )}

              {showFilters && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="h-8"
                      onClick={() => setShowFilters(false)}
                    >
                      <Filter className="mr-2 size-4" />
                      Filtreler
                    </Button>

                    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
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
                              onChange={(e: ChangeEvent<HTMLInputElement>) => handleRangeInputChange(e.target.value)}
                              className="h-8 w-[260px] border-0 px-0 focus-visible:ring-0"
                            />
                            <CalendarIcon className="size-4 text-muted-foreground" />
                          </div>
                          <div className="border-t pt-3">
                            <Calendar
                              mode="range"
                              selected={selectedCreatedAtRange}
                              onSelect={handleCalendarSelect}
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
                              onClick={() => setIsDatePickerOpen(false)}
                            >
                              Kapat
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <DataTableFacetedFilter
                      column={table.getColumn("odemeTuru")}
                      title="Ödeme Türü"
                      options={paymentTypeFilterOptions}
                    />
                    <DataTableFacetedFilter
                      column={table.getColumn("durum")}
                      title="Kargo Durumu"
                      options={cargoStatusFilterOptions}
                    />
                    <DataTableFacetedFilter
                      column={table.getColumn("faturaTuru")}
                      title="Fatura Durumu"
                      options={invoiceTypeFilterOptions}
                    />
                    <DataTableFacetedFilter
                      column={table.getColumn("tahsilatDurumu")}
                      title="Tahsilat Durumu"
                      options={collectionStatusFilterOptions}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DataTable
            columns={cargoesColumns}
            data={displayCargoes}
            onTableReady={setTable}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            enableHorizontalScroll
            stickyFirstColumn
            stickyLastColumn
          />
          {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
        </CardContent>
      </Card>
    </div>
  )
}
