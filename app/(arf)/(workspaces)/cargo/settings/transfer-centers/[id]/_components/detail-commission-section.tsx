"use client"

import { useCallback, useMemo, useState, type ChangeEvent } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableExcelActions,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { BarChart3, Clock, Download, Package, TrendingUp } from "lucide-react"
import { commissionColumns } from "../_columns/commission-columns"
import type { CommissionRecord, CommissionStatus, TransferCenter } from "../_types"

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
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
          </div>
          <div className={cn("rounded-xl p-2.5", iconClass ?? "bg-slate-100")}>
            <Icon className="size-5 text-slate-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface Props {
  center: TransferCenter
}

function parseDateAtBoundary(value: string, endOfDay = false) {
  if (!value) return null
  return new Date(`${value}T${endOfDay ? "23:59:59" : "00:00:00"}`)
}

export function DetailCommissionSection({ center }: Props) {
  const [table, setTable] = useState<TanStackTable<CommissionRecord> | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const from = searchParams.get("from") ?? ""
  const to = searchParams.get("to") ?? ""
  const status = (searchParams.get("status") ?? "all") as CommissionStatus | "all"

  const updateQuery = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(updates)) {
        if (!value) {
          params.delete(key)
          continue
        }
        params.set(key, value)
      }

      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const filteredRecords = useMemo(() => {
    const fromDate = parseDateAtBoundary(from)
    const toDate = parseDateAtBoundary(to, true)

    return center.commissionRecords.filter((record) => {
      if (status !== "all" && record.status !== status) {
        return false
      }

      const processDate = new Date(record.processDate)
      if (fromDate && processDate < fromDate) {
        return false
      }
      if (toDate && processDate > toDate) {
        return false
      }

      return true
    })
  }, [center.commissionRecords, from, status, to])

  const totalEarning = filteredRecords
    .filter((r) => r.status === "confirmed")
    .reduce((sum, r) => sum + r.netEarning, 0)

  const totalPieces = filteredRecords
    .filter((r) => r.status === "confirmed")
    .reduce((sum, r) => sum + r.pieceCount, 0)

  const pendingEarning = filteredRecords
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.netEarning, 0)

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Toplam Kesinleşen Kazanç"
          value={totalEarning.toLocaleString("tr-TR", {
            style: "currency",
            currency: "TRY",
            minimumFractionDigits: 2,
          })}
          icon={TrendingUp}
          iconClass="bg-emerald-50"
        />
        <StatCard
          label={
            center.commissionModel === "per_piece" ? "Toplam Okutulan Parça" : "Toplam Kargo"
          }
          value={totalPieces.toLocaleString("tr-TR")}
          icon={Package}
          iconClass="bg-blue-50"
        />
        <StatCard
          label="Hakediş Modeli"
          value={
            center.commissionModel === "per_piece"
              ? "Parça Başı"
              : center.commissionModel === "percentage"
                ? "Oransal"
                : "—"
          }
          sub={
            center.commissionValue !== undefined
              ? center.commissionModel === "per_piece"
                ? `${center.commissionValue}₺ / parça`
                : `%${center.commissionValue}`
              : undefined
          }
          icon={BarChart3}
          iconClass="bg-purple-50"
        />
        <StatCard
          label="Onay Bekleyen Tutar"
          value={pendingEarning.toLocaleString("tr-TR", {
            style: "currency",
            currency: "TRY",
            minimumFractionDigits: 2,
          })}
          icon={Clock}
          iconClass="bg-amber-50"
        />
      </div>

      <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">Hakediş Detayları</CardTitle>
          <Button size="sm" variant="outline" className="h-8 text-xs">
            <Download className="mr-1.5 size-3.5" />
            Hakediş Raporu Oluştur
          </Button>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-3 pt-4">
          <div className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600">Başlangıç</p>
              <Input
                type="date"
                value={from}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateQuery({ from: e.target.value || undefined })}
                className="h-8 w-[160px] bg-white"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600">Bitiş</p>
              <Input
                type="date"
                value={to}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateQuery({ to: e.target.value || undefined })}
                className="h-8 w-[160px] bg-white"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600">Durum</p>
              <Select
                value={status}
                onValueChange={(value: string) =>
                  updateQuery({ status: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger className="h-8 w-[170px] bg-white">
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="confirmed">Kesinleşti</SelectItem>
                  <SelectItem value="pending">İşlemde</SelectItem>
                  <SelectItem value="cancelled">İptal Edildi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8"
              onClick={() => updateQuery({ from: undefined, to: undefined, status: undefined })}
            >
              Filtreleri Temizle
            </Button>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
              <BarChart3 className="size-8" />
              <p className="text-sm">Seçili filtrelerde hakediş kaydı bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-3">
              {table && (
                <div className="flex items-center gap-2">
                  <DataTableExcelActions
                    table={table}
                    filename="hakedis-detaylari"
                    exportSelected={false}
                    exportLabel="Dışarı Aktar"
                  />
                  <DataTableToolbar
                    table={table}
                    showColumnSelector
                    viewLabel="Görünüm"
                    columnsLabel="Sütunlar"
                    resetLabel="Sıfırla"
                  />
                </div>
              )}

              <DataTable columns={commissionColumns} data={filteredRecords} onTableReady={setTable} />

              {table && (
                <DataTablePagination
                  table={table as TanStackTable<unknown>}
                  pageSizeOptions={[5, 10, 20]}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
