"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import type { ColumnDef, OnChangeFn, PaginationState, Table as TanStackTable } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader, DataTablePagination } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { mockCargoList } from "../../../../shipments/_mock/shipments-mock-data"
import type { TripManifestItem } from "../../_types"
import { filterTripManifestItems, type TripManifestStatusFilter } from "../../_lib/trip-manifest-filter-engine"
import { formatCurrency, formatDateTime, formatNumber } from "../../_lib/trip-status-helpers"
import { Ban, Building2, CheckCircle2, ChevronDown, Download, Eye, Package, Printer, Truck } from "lucide-react"

interface Props {
  items: TripManifestItem[]
  selectedLegId: string | null
  onPrintTtl?: () => void
  onExportTtl?: () => void
}

const FILTERS: Array<{ value: TripManifestStatusFilter; label: string }> = [
  { value: "all", label: "Tümü" },
  { value: "loaded", label: "Yükleme" },
  { value: "unloaded", label: "İndirme" },
]

const kargoStatusConfig: Record<string, { label: string; className: string }> = {
  loaded: { label: "Transfer Sürecinde", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  unloaded: { label: "Teslim Edildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  missing: { label: "Varış Şubede", className: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  error: { label: "Kargo İptal", className: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
}

function resolvePieceTypeLabel(pieceList: string) {
  const normalized = pieceList.toLocaleLowerCase("tr-TR")
  if (normalized.includes("koli")) return "Koli"
  if (normalized.includes("palet")) return "Palet"
  if (normalized.includes("çuval") || normalized.includes("cuval")) return "Çuval"
  return "-"
}

function resolvePieceTypeClass(pieceType: string) {
  if (pieceType === "Koli") return "bg-slate-500/10 text-slate-700 border-slate-400/30"
  if (pieceType === "Palet") return "bg-indigo-500/10 text-indigo-700 border-indigo-500/20"
  if (pieceType === "Çuval") return "bg-orange-500/10 text-orange-700 border-orange-500/20"
  return "bg-slate-500/10 text-slate-600 border-slate-300"
}

function resolvePieceNo(item: TripManifestItem) {
  const normalizedTrackingNo = item.trackingNo.replace(/\D/g, "")
  return `${normalizedTrackingNo}001`
}

export function TripManifestSection({ items, selectedLegId, onPrintTtl, onExportTtl }: Props) {
  const [status, setStatus] = useState<TripManifestStatusFilter>("all")
  const [table, setTable] = useState<TanStackTable<TripManifestItem> | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 })

  const rows = useMemo(() => filterTripManifestItems(items, selectedLegId, status), [items, selectedLegId, status])

  const shipmentMap = useMemo(() => {
    const normalize = (value: string) => value.toUpperCase().replace(/\s+/g, "")
    const map = new Map<string, string>()
    const records = mockCargoList as Array<{ id: string; takip_no: string }>

    records.forEach((item) => {
      const key = normalize(item.takip_no)
      map.set(key, item.id)
      if (key.startsWith("ARF-")) {
        map.set(key.replace("ARF-", ""), item.id)
      }
    })

    return {
      resolveHref: (trackingNo: string) => {
        const normalized = normalize(trackingNo)
        const shipmentId = map.get(normalized)
        if (shipmentId) {
          return `/arf/cargo/shipments/${shipmentId}`
        }
        return `/arf/cargo/shipments/track?query=${encodeURIComponent(trackingNo)}`
      },
    }
  }, [])

  const columns = useMemo<ColumnDef<TripManifestItem>[]>(
    () => [
      {
        id: "pieceNo",
        enableHiding: false,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Parça No" />,
        cell: ({ row }) => (
          <Link
            href={`/arf/cargo/shipments/pieces?query=${encodeURIComponent(row.original.trackingNo)}`}
            className="font-mono text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60"
          >
            {resolvePieceNo(row.original)}
          </Link>
        ),
      },
      {
        accessorKey: "trackingNo",
        enableHiding: false,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Takip No" />,
        cell: ({ row }) => (
          <Link
            href={shipmentMap.resolveHref(row.original.trackingNo)}
            className="font-mono text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60"
          >
            {row.original.trackingNo}
          </Link>
        ),
      },
      {
        accessorKey: "paymentType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ödeme Türü" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.paymentType}</span>,
      },
      {
        accessorKey: "transportStatus",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kargo Durumu" />,
        cell: ({ row }) => {
          const status = kargoStatusConfig[row.original.transportStatus] ?? kargoStatusConfig.loaded
          const statusIcon =
            row.original.transportStatus === "unloaded"
              ? CheckCircle2
              : row.original.transportStatus === "loaded"
                ? Truck
                : row.original.transportStatus === "missing"
                  ? Building2
                  : row.original.transportStatus === "error"
                    ? Ban
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
        accessorKey: "pieceStatus",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Parça Durumu" />,
        cell: ({ row }) => {
          if (row.original.transportStatus === "loaded") {
            return (
              <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                Araca Yüklendi
              </Badge>
            )
          }

          if (row.original.transportStatus === "unloaded") {
            return (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Araçtan Boşaltıldı
              </Badge>
            )
          }

          return <span className="text-muted-foreground">-</span>
        },
      },
      {
        id: "pieceType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Parça Tipi" />,
        cell: ({ row }) => {
          const pieceType = resolvePieceTypeLabel(row.original.pieceList)
          return (
            <Badge variant="outline" className={resolvePieceTypeClass(pieceType)}>
              {pieceType}
            </Badge>
          )
        },
      },
      {
        accessorKey: "totalDesi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Desi" />,
        cell: ({ row }) => <span className="tabular-nums">{formatNumber(row.original.totalDesi)}</span>,
      },
      {
        id: "weight",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ağırlık" />,
        cell: () => <span className="text-muted-foreground">—</span>,
      },
      {
        accessorKey: "totalAmount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam Fiyat" />,
        cell: ({ row }) => <span className="font-medium tabular-nums">{formatCurrency(row.original.totalAmount)}</span>,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturulma Zamanı" />,
        cell: ({ row }) => <span className="text-muted-foreground">{formatDateTime(row.original.createdAt)}</span>,
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Son İşlem Zamanı" />,
        cell: ({ row }) => <span className="text-muted-foreground">{formatDateTime(row.original.updatedAt)}</span>,
      },
      {
        accessorKey: "arrivalAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Varış Zamanı" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.arrivalAt ? formatDateTime(row.original.arrivalAt) : "—"}</span>,
      },
      {
        accessorKey: "deliveredAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Teslimat Zamanı" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.deliveredAt ? formatDateTime(row.original.deliveredAt) : "—"}</span>,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">İşlemler</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-medium">
                  İşlemler
                  <ChevronDown className="ml-1 size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{`Parça No ${resolvePieceNo(row.original)} İşlemler:`}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={shipmentMap.resolveHref(row.original.trackingNo)}>
                    <Eye className="mr-2 size-4" />
                    Kargo Detay
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/arf/cargo/shipments/pieces?query=${encodeURIComponent(row.original.trackingNo)}`}>
                    <Package className="mr-2 size-4" />
                    Parça Detay
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [shipmentMap],
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((item) => (
            <Button
              key={item.value}
              type="button"
              variant={status === item.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatus(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {onPrintTtl && (
            <Button variant="outline" size="sm" onClick={onPrintTtl}>
              <Printer className="mr-1.5 size-3.5" />
              TTL Yazdır
            </Button>
          )}
          {onExportTtl && (
            <Button variant="outline" size="sm" onClick={onExportTtl}>
              <Download className="mr-1.5 size-3.5" />
              TTL Dışarı Aktar
            </Button>
          )}
        </div>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        enablePagination
        enableSorting
        enableColumnVisibility
        enableHorizontalScroll
        stickyFirstColumn
        className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
        emptyMessage="Filtreye uygun parça bulunamadı."
        pagination={pagination}
        onPaginationChange={setPagination as OnChangeFn<PaginationState>}
        onTableReady={setTable}
      />

      {table && <DataTablePagination table={table as TanStackTable<unknown>} pageSizeOptions={[5, 10, 20, 50]} totalRows={rows.length} />}
    </div>
  )
}
