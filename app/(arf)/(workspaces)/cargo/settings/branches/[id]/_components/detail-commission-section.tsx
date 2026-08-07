"use client"

import { type ChangeEvent, useCallback, useMemo, useState } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Clock3, Download, Filter, Package, PlusCircle, TrendingUp, Truck, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { createCommissionColumns } from "../_columns/commission-columns"
import type { BranchCommissionRecord, BranchDetail } from "../_types"

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconClass,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  iconClass?: string
}) {
  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
            {sub ? <p className="mt-1 text-xs text-slate-400">{sub}</p> : null}
          </div>
          <div className={cn("rounded-xl p-2.5", iconClass ?? "bg-slate-100")}>
            <Icon className="size-5 text-slate-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function parseDateInput(value: string, endOfDay = false) {
  if (!value) {
    return null
  }
  return new Date(`${value}T${endOfDay ? "23:59:59" : "00:00:00"}`)
}

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

const transactionTypeFilterOptions = [
  { label: "Alım", value: "alim" },
  { label: "Dağıtım", value: "dagitim" },
]

const statusFilterOptions = [
  { label: "Kesinleşti", value: "confirmed" },
  { label: "İşlemde", value: "pending" },
  { label: "İptal", value: "cancelled" },
]

const cancelCategoryOptions = [
  { label: "Operasyonel", value: "operasyonel" },
  { label: "Finansal", value: "finansal" },
  { label: "Müşteri Talebi", value: "musteri_talebi" },
  { label: "Sistem", value: "sistem" },
]

const cancelReasonOptions = [
  { label: "Müşteri Talebi", value: "musteri_talebi" },
  { label: "Hatalı Hesaplama", value: "hatali_hesaplama" },
  { label: "Operasyon Hatası", value: "operasyon_hatasi" },
  { label: "Sistemsel Hata", value: "sistemsel_hata" },
  { label: "Diğer", value: "diger" },
]

interface Props {
  branch: BranchDetail
}

export function DetailCommissionSection({ branch }: Props) {
  const [table, setTable] = useState<TanStackTable<BranchCommissionRecord> | null>(null)
  const [records, setRecords] = useState<BranchCommissionRecord[]>(branch.commissionRecords)
  const [showFilters, setShowFilters] = useState(false)
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [dateRangeInput, setDateRangeInput] = useState("")
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<BranchCommissionRecord | null>(null)
  const [cancelMode, setCancelMode] = useState<"cancel" | "info">("cancel")
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelCategory, setCancelCategory] = useState("")
  const [cancelReason, setCancelReason] = useState("")
  const [cancelDescription, setCancelDescription] = useState("")

  const filteredRecords = useMemo(() => {
    const fromDate = parseDateInput(from)
    const toDate = parseDateInput(to, true)

    return records.filter((record) => {
      const processDate = new Date(record.processDate)
      if (fromDate && processDate < fromDate) {
        return false
      }
      if (toDate && processDate > toDate) {
        return false
      }
      return true
    })
  }, [records, from, to])

  const totalEarning = filteredRecords.reduce((sum, record) => sum + record.netKazanc, 0)
  const pickupTotal = filteredRecords
    .filter((record) => record.transactionType === "alim")
    .reduce((sum, record) => sum + record.netKazanc, 0)
  const deliveryTotal = filteredRecords
    .filter((record) => record.transactionType === "dagitim")
    .reduce((sum, record) => sum + record.netKazanc, 0)
  const pendingAccrual = filteredRecords
    .filter((record) => record.status === "pending")
    .reduce((sum, record) => sum + record.netKazanc, 0)

  const selectedDateRange = useMemo<DateRange | undefined>(() => {
    const fromDate = parseIsoDate(from)
    const toDate = parseIsoDate(to)
    if (!fromDate && !toDate) return undefined
    if (fromDate && toDate) return fromDate <= toDate ? { from: fromDate, to: toDate } : { from: toDate, to: fromDate }
    return { from: fromDate ?? toDate, to: undefined }
  }, [from, to])

  const handleDateRangeChange = useCallback((nextFrom: string, nextTo: string) => {
    setFrom(nextFrom)
    setTo(nextTo)
  }, [])

  const handleRangeInputChange = useCallback((value: string) => {
    setDateRangeInput(value)
    const parsed = parseRangeInput(value)
    handleDateRangeChange(parsed.from ?? "", parsed.to ?? "")
  }, [handleDateRangeChange])

  const handleCalendarSelect = useCallback((range: DateRange | undefined) => {
    if (!range?.from) {
      setDateRangeInput("")
      handleDateRangeChange("", "")
      setIsDatePickerOpen(false)
      return
    }
    const fromIso = formatIsoDate(range.from)
    if (!range.to) {
      setDateRangeInput(formatDisplayDate(range.from))
      handleDateRangeChange(fromIso, "")
      return
    }
    const [start, end] = range.from <= range.to ? [range.from, range.to] : [range.to, range.from]
    const startIso = formatIsoDate(start)
    const endIso = formatIsoDate(end)
    setDateRangeInput(formatRangeDisplay(startIso, endIso))
    handleDateRangeChange(startIso, endIso)
  }, [handleDateRangeChange])

  const currency = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" })

  const handleCancelRequest = useCallback((record: BranchCommissionRecord) => {
    setSelectedRecord(record)
    setCancelMode("cancel")
    setCancelCategory("")
    setCancelReason("")
    setCancelDescription("")
    setIsCancelModalOpen(true)
  }, [])

  const handleCancelInfoRequest = useCallback((record: BranchCommissionRecord) => {
    setSelectedRecord(record)
    setCancelMode("info")
    setIsCancelModalOpen(true)
  }, [])

  const handleConfirmCancel = useCallback(() => {
    if (!selectedRecord) return
    const category = cancelCategory.trim()
    const reason = cancelReason.trim()
    const description = cancelDescription.trim()
    if (!category || !reason || !description) return

    const cancelledAt = new Date().toISOString()
    const cancelledById = "current-user"
    const cancelledByName = "Mevcut Kullanıcı"

    setRecords((prev) =>
      prev.map((record) =>
        record.id === selectedRecord.id
          ? {
              ...record,
              status: "cancelled",
              cancelCategory: category,
              cancelReason: reason,
              cancelDescription: description,
              cancelledAt,
              cancelledById,
              cancelledByName,
            }
          : record,
      ),
    )
    setIsCancelModalOpen(false)
  }, [cancelCategory, cancelDescription, cancelReason, selectedRecord])

  const canSubmitCancel =
    cancelCategory.trim().length > 0 &&
    cancelReason.trim().length > 0 &&
    cancelDescription.trim().length > 0

  const columns = useMemo(
    () =>
      createCommissionColumns({
        onCancelRequest: handleCancelRequest,
        onCancelInfoRequest: handleCancelInfoRequest,
      }),
    [handleCancelInfoRequest, handleCancelRequest],
  )

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Dönemlik Toplam Kazanç" value={currency.format(totalEarning)} icon={TrendingUp} iconClass="bg-slate-100" />
        <StatCard label="Alım Hakediş Toplamı" value={currency.format(pickupTotal)} icon={Package} iconClass="bg-blue-50" />
        <StatCard label="Dağıtım Hakediş Toplamı" value={currency.format(deliveryTotal)} icon={Truck} iconClass="bg-violet-50" />

        <StatCard label="Teslimatı Beklenen Hakediş" value={currency.format(pendingAccrual)} icon={Clock3} iconClass="bg-emerald-50" />
      </div>

      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-4 p-5">
          {table && (
            <div className="space-y-4">
              {!showFilters && (
                <div className="flex items-center gap-2">
                  <DataTableExcelActions table={table} filename="sube-hakedis-detay" exportSelected={false} exportLabel="Dışarı Aktar" />
                  <Button type="button" variant="outline" size="sm" className="h-8">
                    <Download className="mr-2 size-4" />
                    Rapor Oluştur
                  </Button>
                  <DataTableToolbar table={table} viewLabel="Görünüm" columnsLabel="Sütunlar" resetLabel="Sıfırla">
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
                        İşlem Tarihi
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
                            onChange={(event: ChangeEvent<HTMLInputElement>) => handleRangeInputChange(event.target.value)}
                            className="h-8 w-[260px] border-0 px-0 focus-visible:ring-0"
                          />
                          <CalendarIcon className="size-4 text-muted-foreground" />
                        </div>
                        <div className="border-t pt-3">
                          <Calendar
                            mode="range"
                            selected={selectedDateRange}
                            onSelect={handleCalendarSelect}
                            numberOfMonths={2}
                            locale={tr}
                            showOutsideDays={false}
                            initialFocus
                          />
                        </div>
                        <div className="flex justify-end gap-2 border-t pt-3">
                          {(from || to) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDateRangeInput("")
                                handleDateRangeChange("", "")
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
                    column={table.getColumn("transactionType")}
                    title="İşlem Tipi"
                    options={transactionTypeFilterOptions}
                  />
                  <DataTableFacetedFilter
                    column={table.getColumn("status")}
                    title="Durum"
                    options={statusFilterOptions}
                  />
                </div>
              )}
            </div>
          )}

          <DataTable
            columns={columns}
            data={filteredRecords}
            onTableReady={setTable}
            enableHorizontalScroll
            stickyFirstColumn
            stickyLastColumn
          />
          {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
        </CardContent>
      </Card>

      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className={cancelMode === "info" ? "max-w-5xl" : "max-w-xl"}>
          <DialogHeader>
            <DialogTitle>
              {cancelMode === "cancel" ? "Hakediş İptal Et" : "Hakediş İptal Bilgisi"}
            </DialogTitle>
            {cancelMode === "cancel" && (
              <DialogDescription>
                Bu işlemle hakediş kaydı iptal durumuna alınır ve listede iptal olarak işaretlenir.
              </DialogDescription>
            )}
          </DialogHeader>

          {selectedRecord && cancelMode === "cancel" && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <p>
                <span className="font-medium">Takip No:</span> {selectedRecord.trackingNo}
              </p>
              <p>
                <span className="font-medium">Hakediş Tipi:</span> {selectedRecord.transactionType === "alim" ? "Alım" : "Dağıtım"}
              </p>
              <p>
                <span className="font-medium">Kazanç:</span> {currency.format(selectedRecord.netKazanc)}
              </p>
              <p>
                <span className="font-medium">Durum:</span> {selectedRecord.status === "cancelled" ? "İptal" : "Aktif"}
              </p>
            </div>
          )}

          {selectedRecord && cancelMode === "info" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                <p className="text-sm font-medium">Takip No: <span className="font-normal">{selectedRecord.trackingNo}</span></p>
                <p className="mt-2 text-sm font-medium">Hakediş Tipi: <span className="font-normal">{selectedRecord.transactionType === "alim" ? "Alım" : "Dağıtım"}</span></p>
                <p className="mt-2 text-sm font-medium">Kazanç: <span className="font-normal">{currency.format(selectedRecord.netKazanc)}</span></p>
                <p className="mt-2 text-sm font-medium">Durum: <span className="font-normal">{selectedRecord.status === "cancelled" ? "İptal" : "Aktif"}</span></p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>İptal Tarihi</Label>
                  <Input
                    value={selectedRecord.cancelledAt ? new Date(selectedRecord.cancelledAt).toLocaleString("tr-TR") : "Bilinmiyor"}
                    readOnly
                    className="h-12 rounded-2xl bg-slate-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>İşlemi Yapan</Label>
                  <Input value={selectedRecord.cancelledByName ?? "Bilinmiyor"} readOnly className="h-12 rounded-2xl bg-slate-50" />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <Input value={selectedRecord.cancelCategory ?? "Bilinmiyor"} readOnly className="h-12 rounded-2xl bg-slate-50" />
                </div>
                <div className="space-y-1.5">
                  <Label>İptal Nedeni</Label>
                  <Input value={selectedRecord.cancelReason ?? "Bilinmiyor"} readOnly className="h-12 rounded-2xl bg-slate-50" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Açıklama</Label>
                <Textarea
                  value={selectedRecord.cancelDescription ?? "Bilinmiyor"}
                  readOnly
                  className="min-h-28 rounded-2xl bg-slate-50"
                />
              </div>
            </div>
          )}

          {cancelMode === "cancel" && (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <Select value={cancelCategory} onValueChange={setCancelCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {cancelCategoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>İptal Nedeni</Label>
                  <Select value={cancelReason} onValueChange={setCancelReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="İptal nedeni seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {cancelReasonOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Açıklama</Label>
                <Textarea
                  value={cancelDescription}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setCancelDescription(event.target.value)}
                  placeholder="İptal açıklamasını yazın"
                  className="min-h-24"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              {cancelMode === "cancel" ? "Vazgeç" : "Kapat"}
            </Button>
            {cancelMode === "cancel" && (
              <Button type="button" variant="destructive" onClick={handleConfirmCancel} disabled={!canSubmitCancel}>
                Hakediş İptal Et
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
