"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { ColumnDef, Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableColumnHeader,
  DataTableExcelActions,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Link2 } from "lucide-react"
import { toast } from "sonner"
import { ARF_ROUTES } from "../../../../../../_shared/routes"

/* ── Types ── */

interface UnmatchedTrip {
  id: string
  tripNo: string
  lineName: string
  supplierType: "firma" | "sahis"
  supplierName: string
  driverName?: string
  vehiclePlate?: string
  tripLocation: string
  status: "created" | "on_road" | "completed" | "cancelled"
  totalLoad: number
  estimatedCost: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

/* ── Config ── */

const STATUS_BADGE: Record<UnmatchedTrip["status"], { label: string; className: string }> = {
  created: { label: "Bekliyor", className: "border-slate-200 bg-slate-50 text-slate-600" },
  on_road: { label: "Yolda", className: "border-blue-200 bg-blue-50 text-blue-700" },
  completed: { label: "Tamamlandı", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  cancelled: { label: "İptal", className: "border-rose-200 bg-rose-50 text-rose-600" },
}

const SUPPLIER_TYPE_LABELS: Record<UnmatchedTrip["supplierType"], string> = {
  firma: "Firma",
  sahis: "Şahıs",
}

/* ── Helpers ── */

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(value)

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })

/* ── Mock Data ── */

export const UNMATCHED_TRIPS_MOCK: Record<string, UnmatchedTrip[]> = {
  "1": [
    {
      id: "trip-unm-10001",
      tripNo: "10000170",
      lineName: "İstanbul - Mersin Hattı",
      supplierType: "firma",
      supplierName: "Ekspress24 Kargo",
      driverName: "Hüseyin Korkmaz",
      vehiclePlate: "34 KRG 088",
      tripLocation: "Konya T.M.",
      status: "completed",
      totalLoad: 22.5,
      estimatedCost: 28500,
      createdAt: "2026-04-08T07:30:00Z",
      updatedAt: "2026-04-09T16:00:00Z",
      createdBy: "Operasyon Admin",
    },
    {
      id: "trip-unm-10002",
      tripNo: "10000175",
      lineName: "Ankara - Trabzon Hattı",
      supplierType: "firma",
      supplierName: "Ekspress24 Kargo",
      driverName: "Cengiz Aydın",
      vehiclePlate: "06 TRB 245",
      tripLocation: "Samsun T.M.",
      status: "on_road",
      totalLoad: 15,
      estimatedCost: 22000,
      createdAt: "2026-04-12T06:00:00Z",
      updatedAt: "2026-04-12T14:30:00Z",
      createdBy: "Harekat Uzmanı",
    },
  ],
  "2": [
    {
      id: "trip-unm-10003",
      tripNo: "10000180",
      lineName: "Van - Ağrı Hattı",
      supplierType: "sahis",
      supplierName: "Kuzey Lojistik",
      driverName: "Hasan Çelik",
      vehiclePlate: "06 XYZ 100",
      tripLocation: "Patnos",
      status: "completed",
      totalLoad: 12,
      estimatedCost: 14500,
      createdAt: "2026-03-28T09:00:00Z",
      updatedAt: "2026-03-29T11:00:00Z",
      createdBy: "Planlama",
    },
  ],
  "4": [
    {
      id: "trip-unm-10004",
      tripNo: "10000185",
      lineName: "Gaziantep - Adana Hattı",
      supplierType: "firma",
      supplierName: "Bedirhan Nakliyat",
      driverName: "İbrahim Yılmaz",
      vehiclePlate: "27 BDR 440",
      tripLocation: "Adana",
      status: "created",
      totalLoad: 18,
      estimatedCost: 19000,
      createdAt: "2026-04-15T10:00:00Z",
      updatedAt: "2026-04-15T10:00:00Z",
      createdBy: "Operasyon Admin",
    },
  ],
}

/* ── Columns ── */

function getColumns(): ColumnDef<UnmatchedTrip>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Tümünü seç"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
          aria-label={`Sefer ${row.original.tripNo} seç`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 36,
    },
    {
      accessorKey: "tripNo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sefer No" />,
      cell: ({ row }) => (
        <Link
          href={`${ARF_ROUTES.cargo.operations.trips}/${row.original.id}`}
          className="font-mono text-sm font-bold text-slate-900 underline underline-offset-2"
        >
          #{row.original.tripNo}
        </Link>
      ),
    },
    {
      accessorKey: "lineName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Hat İsmi" />,
      cell: ({ row }) => (
        <span className="line-clamp-1 max-w-[260px] text-sm text-slate-700">{row.original.lineName}</span>
      ),
    },
    {
      accessorKey: "supplierType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tedarikçi Tipi" />,
      cell: ({ row }) => (
        <span className="text-sm text-slate-700">{SUPPLIER_TYPE_LABELS[row.original.supplierType]}</span>
      ),
    },
    {
      accessorKey: "driverName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sürücü" />,
      cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.driverName ?? "—"}</span>,
    },
    {
      accessorKey: "vehiclePlate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Araç Plakası" />,
      cell: ({ row }) => (
        <span className="font-mono text-sm text-slate-700">{row.original.vehiclePlate ?? "—"}</span>
      ),
    },
    {
      accessorKey: "tripLocation",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sefer Konumu" />,
      cell: ({ row }) => (
        <span className="line-clamp-1 max-w-[220px] text-sm text-slate-700">{row.original.tripLocation}</span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
      cell: ({ row }) => {
        const badge = STATUS_BADGE[row.original.status]
        return (
          <Badge variant="outline" className={`text-[11px] ${badge.className}`}>
            {badge.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "totalLoad",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam Yük (ton)" />,
      cell: ({ row }) => <span className="tabular-nums text-sm">{row.original.totalLoad}</span>,
    },
    {
      accessorKey: "estimatedCost",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tahmini Maliyet" />,
      cell: ({ row }) => (
        <span className="text-sm font-semibold tabular-nums text-slate-900">
          {formatCurrency(row.original.estimatedCost)}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturulma" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDateTime(row.original.createdAt)}</span>
      ),
    },
    {
      accessorKey: "createdBy",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturan" />,
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.createdBy}</span>,
    },
  ]
}

/* ── Component ── */

interface Props {
  supplierId: string
}

export function SupplierUnmatchedTripsSection({ supplierId }: Props) {
  const data = useMemo(() => UNMATCHED_TRIPS_MOCK[supplierId] ?? [], [supplierId])
  const columns = useMemo(() => getColumns(), [])
  const [table, setTable] = useState<TanStackTable<UnmatchedTrip> | null>(null)
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})

  const hasSelection = useMemo(
    () => Object.values(rowSelection).some(Boolean),
    [rowSelection],
  )

  const selectedRows = useMemo(() => {
    return Object.entries(rowSelection)
      .filter(([, selected]) => selected)
      .map(([index]) => Number(index))
      .filter((index) => Number.isInteger(index) && index >= 0 && index < data.length)
      .map((index) => data[index])
  }, [rowSelection, data])

  const selectedTotal = useMemo(
    () => selectedRows.reduce((acc, r) => acc + r.estimatedCost, 0),
    [selectedRows],
  )

  const handleMatch = () => {
    toast.success(
      `${selectedRows.length} sefer eşleştirme için seçildi. Toplam tahmini maliyet: ${formatCurrency(selectedTotal)}`,
    )
    setRowSelection({})
  }

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-4">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-50">
              <Link2 className="size-5 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-slate-700">Tüm seferler eşleştirildi</p>
            <p className="mt-1 text-xs text-muted-foreground">Bu tedarikçiye ait eşleşmemiş sefer bulunmuyor.</p>
          </div>
        ) : (
          <>
            {hasSelection && (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-secondary/20 bg-primary/5 px-3 py-2">
                <p className="text-sm font-medium text-secondary">
                  Seçili: {selectedRows.length} sefer – Tahmini Maliyet: {formatCurrency(selectedTotal)}
                </p>
                <Button size="sm" variant="default" onClick={handleMatch}>
                  <Link2 className="mr-2 size-4" />
                  Eşleştir
                </Button>
              </div>
            )}



            {table && (
              <div className="mb-3 flex items-center gap-2">
                <DataTableExcelActions
                  table={table}
                  filename="eslesmemis-seferler"
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

            <DataTable
              data={data}
              columns={columns}
              enableRowSelection
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              onTableReady={setTable}
            />

            {table && (
              <DataTablePagination
                table={table as TanStackTable<unknown>}
                pageSizeOptions={[5, 10, 20, 50]}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
