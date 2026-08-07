"use client"

import { useCallback, useMemo, useState } from "react"
import type { ColumnDef, Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableColumnHeader,
  DataTableExcelActions,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowUpRight, ChevronRight, Filter } from "lucide-react"
import type {
  SupplierFinancialRecord,
  SupplierInvoicePaymentStatus,
} from "../_types"
import { supplierFinancialMock } from "../_mock/supplier-transport-mock-data"

/* ── Formatters ── */

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(value)

const formatDate = (iso?: string) => {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

const formatLongDate = (iso?: string) => {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
}

/* ── Status & Type configs ── */

const statusConfig: Record<SupplierInvoicePaymentStatus, { label: string; className: string }> = {
  odendi: { label: "Ödendi", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  bekliyor: { label: "Bekliyor", className: "border-amber-200 bg-amber-50 text-amber-700" },
  kismi: { label: "Kısmi Ödeme", className: "border-blue-200 bg-blue-50 text-blue-700" },
  gecikti: { label: "Gecikti", className: "border-rose-200 bg-rose-50 text-rose-700" },
}

const typeLabel: Record<string, { label: string; className: string }> = {
  fatura: { label: "Fatura", className: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
  odeme: { label: "Ödeme", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
}

const statusFilterOptions = [
  { label: "Ödendi", value: "odendi" },
  { label: "Bekliyor", value: "bekliyor" },
  { label: "Kısmi Ödeme", value: "kismi" },
  { label: "Gecikti", value: "gecikti" },
]

const typeFilterOptions = [
  { label: "Fatura", value: "fatura" },
  { label: "Ödeme", value: "odeme" },
]

/* ── Expanded Row Detail ── */

function DetailItem({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm text-slate-900">{value || "—"}</p>
    </div>
  )
}

function FinancialExpandedRow({ row }: { row: SupplierFinancialRecord }) {
  if (row.type === "fatura") {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-100/80 px-6 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Fatura Detayı</p>
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          <DetailItem label="Tedarikçi Ünvanı" value={row.supplierTitle} />
          <DetailItem label="Kategori" value={
            row.category ? (
              <Badge variant="outline" className="border-slate-200 bg-white text-xs text-slate-700">{row.category}</Badge>
            ) : "—"
          } />
          <DetailItem label="Etiket" value={
            row.tag ? (
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-[11px] text-blue-700">{row.tag}</Badge>
            ) : "—"
          } />
          <DetailItem label="Düzenlenme Tarihi" value={formatLongDate(row.invoiceDate)} />
          <DetailItem label="Vade Tarihi" value={formatLongDate(row.dueDate)} />
          <DetailItem label="Matrah" value={row.netAmount != null ? formatCurrency(row.netAmount) : "—"} />
          <DetailItem label="KDV" value={row.vatAmount != null ? formatCurrency(row.vatAmount) : "—"} />
          <DetailItem label="Toplam" value={row.totalAmount != null ? formatCurrency(row.totalAmount) : "—"} />
          <DetailItem label="Ödenen" value={
            <span className="text-emerald-700">{row.paidAmount != null ? formatCurrency(row.paidAmount) : "—"}</span>
          } />
          <DetailItem label="Kalan" value={
            <span className={row.remainingBalance > 0 ? "text-rose-600" : "text-emerald-600"}>
              {formatCurrency(row.remainingBalance)}
            </span>
          } />
          <DetailItem label="İşlem" value={
            <span className="cursor-not-allowed text-sm font-medium text-blue-600">
              Gider Faturası Detayına Git →
            </span>
          } />
        </div>
      </div>
    )
  }

  // Ödeme detayı
  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-6 py-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-500">Ödeme Detayı</p>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        <DetailItem label="Gönderen" value={row.senderName} />
        <DetailItem label="Gönderen IBAN" value={
          row.senderIban ? <span className="font-mono text-xs">{row.senderIban}</span> : "—"
        } />
        <DetailItem label="Alıcı" value={row.recipientName} />
        <DetailItem label="Alıcı IBAN" value={
          row.recipientIban ? <span className="font-mono text-xs">{row.recipientIban}</span> : "—"
        } />
        <DetailItem label="Referans No" value={
          row.referenceNumber ? <span className="font-mono text-sm">{row.referenceNumber}</span> : "—"
        } />
        <DetailItem label="Yön" value={
          row.direction === "debit" ? (
            <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">Çıkış</Badge>
          ) : row.direction === "credit" ? (
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Giriş</Badge>
          ) : "—"
        } />
        <DetailItem label="Eşleştirme" value={
          row.matchStatus === "matched" ? (
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Eşleştirildi</Badge>
          ) : row.matchStatus === "partial" ? (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Kısmi</Badge>
          ) : row.matchStatus === "unmatched" ? (
            <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">Eşleştirilmedi</Badge>
          ) : "—"
        } />
        <DetailItem label="Eşleşme Kaynağı" value={
          row.matchSource === "auto" ? "Otomatik" : row.matchSource === "manual" ? "Manuel" : "—"
        } />
        {row.matchedEntityLabel && (
          <DetailItem label="Eşleşen Kayıt" value={row.matchedEntityLabel} />
        )}
      </div>
    </div>
  )
}

/* ── Columns ── */

function getColumns(): ColumnDef<SupplierFinancialRecord>[] {
  return [
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); row.toggleExpanded() }}
          className="flex size-7 items-center justify-center rounded-md hover:bg-slate-100"
        >
          <ChevronRight
            className={cn(
              "size-4 text-slate-500 transition-transform duration-200",
              row.getIsExpanded() && "rotate-90",
            )}
          />
        </button>
      ),
      size: 40,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="İşlem Tipi" />,
      filterFn: (row, columnId, filterValues: string[]) => filterValues.includes(row.getValue(columnId)),
      cell: ({ row }) => {
        const cfg = typeLabel[row.original.type]
        return cfg ? (
          <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
        ) : <span>{row.original.type}</span>
      },
    },
    {
      accessorKey: "invoiceNo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Belge No" />,
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium text-slate-900">{row.original.invoiceNo}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tarih" />,
      cell: ({ row }) => (
        <span className="text-sm text-slate-700">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Açıklama / Fatura İsmi" />,
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate text-sm text-slate-600">{row.original.description}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tutar" />,
      cell: ({ row }) => {
        const isOdeme = row.original.type === "odeme"
        return (
          <div className="flex items-center gap-1.5">
            {isOdeme ? (
              <ArrowUpRight className="size-3.5 text-rose-500" />
            ) : null}
            <span className={cn("text-sm font-semibold tabular-nums", isOdeme ? "text-rose-700" : "text-slate-900")}>
              {isOdeme ? "-" : ""}{formatCurrency(row.original.amount)}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "remainingBalance",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kalan Bakiye" />,
      cell: ({ row }) => {
        const value = row.original.remainingBalance
        const isOdeme = row.original.type === "odeme"
        if (isOdeme) return <span className="text-sm text-slate-400">—</span>
        return (
          <span className={cn("text-sm font-medium tabular-nums", value > 0 ? "text-rose-600" : "text-emerald-600")}>
            {formatCurrency(value)}
          </span>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
      filterFn: (row, columnId, filterValues: string[]) => filterValues.includes(row.getValue(columnId)),
      cell: ({ row }) => {
        const cfg = statusConfig[row.original.status]
        const isOdeme = row.original.type === "odeme"
        const label = isOdeme
          ? row.original.status === "odendi" ? "Tamamlandı"
            : row.original.status === "kismi" ? "Kısmi Ödeme"
            : row.original.status === "bekliyor" ? "Bekleniyor"
            : cfg?.label ?? row.original.status
          : cfg?.label ?? row.original.status
        return cfg ? (
          <Badge variant="outline" className={cn("text-xs", cfg.className)}>{label}</Badge>
        ) : <span>{row.original.status}</span>
      },
    },
  ]
}

/* ── Ana Bileşen ── */

interface Props {
  supplierId: string
  supplierName: string
}

export function SupplierInvoicesSection({ supplierId, supplierName: _supplierName }: Props) {
  const data = useMemo(() => supplierFinancialMock[supplierId] ?? [], [supplierId])
  const columns = useMemo(() => getColumns(), [])
  const [table, setTable] = useState<TanStackTable<SupplierFinancialRecord> | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false)

  const filteredData = useMemo(() => {
    if (!showUnpaidOnly) return data
    return data.filter(
      (row) => row.status === "bekliyor" || row.status === "kismi" || row.status === "gecikti",
    )
  }, [data, showUnpaidOnly])

  const renderSubComponent = useCallback(
    (row: SupplierFinancialRecord) => <FinancialExpandedRow row={row} />,
    [],
  )

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardContent className="space-y-4 pt-4">
        {table && (
          <div className="flex items-center gap-2 pb-2">
            {!showFilters && (
              <DataTableExcelActions
                table={table}
                filename="tedarikci-faturalar-odemeler"
                exportSelected={false}
                exportLabel="Dışarı Aktar"
              />
            )}
            <DataTableToolbar
              table={table}
              showColumnSelector={!showFilters}
              viewLabel="Görünüm"
              columnsLabel="Sütunlar"
              resetLabel="Sıfırla"
            >
              <Button
                type="button"
                variant={showFilters ? "default" : "outline"}
                size="sm"
                className="mr-3 h-8"
                onClick={() => setShowFilters((prev) => !prev)}
              >
                <Filter className="mr-2 size-4" />
                Filtreler
              </Button>

              {showFilters && (
                <div className="flex flex-wrap items-center gap-2">
                  <DataTableFacetedFilter
                    column={table.getColumn("type")}
                    title="İşlem Tipi"
                    options={typeFilterOptions}
                  />
                  <DataTableFacetedFilter
                    column={table.getColumn("status")}
                    title="Durum"
                    options={statusFilterOptions}
                  />
                </div>
              )}
            </DataTableToolbar>

            <div className="ml-auto">
              <Button
                type="button"
                variant={showUnpaidOnly ? "default" : "outline"}
                size="sm"
                className="h-8"
                onClick={() => setShowUnpaidOnly((prev) => !prev)}
              >
                Ödenmemişleri Göster
              </Button>
            </div>
          </div>
        )}

        <DataTable
          data={filteredData}
          columns={columns}
          onTableReady={setTable}
          renderSubComponent={renderSubComponent}
          expandOnRowClick
          stickyLastColumn
        />
        {table && (
          <DataTablePagination
            table={table as TanStackTable<unknown>}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        )}
      </CardContent>
    </Card>
  )
}
