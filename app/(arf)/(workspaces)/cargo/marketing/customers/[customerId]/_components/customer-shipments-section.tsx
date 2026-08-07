"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { ComponentType } from "react"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowRightLeft,
  Ban,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Eye,
  Filter,
  Package,
  Printer,
  Truck,
} from "lucide-react"
import type { CustomerShipmentRecord, ShipmentStatus } from "../../_data/customers"

type ShipmentFilter = "all" | "teslim_edildi" | "iptal" | "devredildi"
type ShipmentRow = CustomerShipmentRecord

const filterLabels: Record<ShipmentFilter, string> = {
  all: "Tümü",
  teslim_edildi: "Teslim Edilenler",
  iptal: "İptal Edilenler",
  devredildi: "Devredenler",
}

const shipmentStatusConfig: Record<
  ShipmentStatus,
  { label: string; className: string; icon: ComponentType<{ className?: string }> }
> = {
  hazirlaniyor: { label: "Hazırlanıyor", className: "bg-slate-500/10 text-slate-700 border-slate-400/30", icon: Clock },
  transferde: { label: "Transferde", className: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: Truck },
  dagitimda: { label: "Dağıtımda", className: "bg-sky-500/10 text-sky-600 border-sky-500/20", icon: Truck },
  teslim_edildi: { label: "Teslim Edildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  devredildi: { label: "Devredildi", className: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20", icon: ArrowRightLeft },
  iptal: { label: "İptal", className: "bg-rose-500/10 text-rose-600 border-rose-500/20", icon: Ban },
}

const invoiceStatusConfig: Record<string, { label: string; className: string }> = {
  kesildi: { label: "Kesildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  kesilmedi: { label: "Kesilmedi", className: "bg-slate-500/10 text-slate-500 border-slate-400/20" },
}

const collectionStatusConfig: Record<string, { label: string; className: string }> = {
  tahsil_edildi: { label: "Tahsil Edildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  musteri_tahsil_edildi: { label: "Müşteriden Tahsil Edildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  beklemede: { label: "Beklemede", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  bekliyor: { label: "Bekliyor", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  gm_gonderildi: { label: "Tahsil Edildi (GM'ye Gönderildi)", className: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
  iptal: { label: "İptal", className: "bg-red-500/10 text-red-600 border-red-500/20" },
}

const statusFilterOptions = [
  { label: "Hazırlanıyor", value: "hazirlaniyor" },
  { label: "Transferde", value: "transferde" },
  { label: "Dağıtımda", value: "dagitimda" },
  { label: "Teslim Edildi", value: "teslim_edildi" },
  { label: "Devredildi", value: "devredildi" },
  { label: "İptal", value: "iptal" },
]

const invoiceStatusFilterOptions = [
  { label: "Kesildi", value: "kesildi" },
  { label: "Kesilmedi", value: "kesilmedi" },
]

const collectionStatusFilterOptions = [
  { label: "Tahsil Edildi", value: "tahsil_edildi" },
  { label: "Müşteriden Tahsil Edildi", value: "musteri_tahsil_edildi" },
  { label: "Beklemede", value: "beklemede" },
  { label: "Bekliyor", value: "bekliyor" },
  { label: "Tahsil Edildi (GM'ye Gönderildi)", value: "gm_gonderildi" },
  { label: "İptal", value: "iptal" },
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(value)

function isRelatedShipment(shipment: CustomerShipmentRecord, customerId: string) {
  if (!shipment.senderCustomerId && !shipment.receiverCustomerId) return true
  return shipment.senderCustomerId === customerId || shipment.receiverCustomerId === customerId
}

export function CustomerShipmentsSection({
  shipments,
  customerId,
}: {
  shipments: CustomerShipmentRecord[]
  customerId: string
}) {
  const [filter, setFilter] = useState<ShipmentFilter>("all")
  const [table, setTable] = useState<TanStackTable<ShipmentRow> | null>(null)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)

  const relatedShipments = useMemo(
    () => shipments.filter((shipment) => isRelatedShipment(shipment, customerId)),
    [customerId, shipments],
  )

  const filteredShipments = useMemo(() => {
    if (filter === "all") return relatedShipments
    return relatedShipments.filter((shipment) => shipment.status === filter)
  }, [filter, relatedShipments])

  const counts = useMemo(
    () => ({
      all: relatedShipments.length,
      teslim_edildi: relatedShipments.filter((s) => s.status === "teslim_edildi").length,
      iptal: relatedShipments.filter((s) => s.status === "iptal").length,
      devredildi: relatedShipments.filter((s) => s.status === "devredildi").length,
    }),
    [relatedShipments],
  )

  const columns = useMemo<ColumnDef<ShipmentRow>[]>(
    () => [
      {
        accessorKey: "trackingNo",
        enableHiding: false,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Takip No" />,
        cell: ({ row }) => (
          <Link
            href={`/arf/cargo/shipments/${row.original.id}`}
            className="font-mono text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60"
          >
            {row.original.trackingNo}
          </Link>
        ),
      },
      {
        accessorKey: "senderCustomer",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderici Müşteri" />,
      },
      {
        accessorKey: "senderBranch",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderici Şube" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.senderBranch}</span>,
      },
      {
        accessorKey: "receiverBranch",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı Şube" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.receiverBranch}</span>,
      },
      {
        accessorKey: "receiverCustomer",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı Müşteri" />,
      },
      {
        accessorKey: "receiverPhone",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı Telefon" />,
        cell: ({ row }) => <span className="tabular-nums">{row.original.receiverPhone}</span>,
      },
      {
        accessorKey: "paymentType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ödeme Türü" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.paymentType}</span>,
      },
      {
        accessorKey: "invoiceType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Fatura Türü" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.invoiceType}</span>,
      },
      {
        accessorKey: "baseAmount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Matrah (Fiyat)" />,
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.baseAmount != null ? formatCurrency(row.original.baseAmount) : "—"}
          </span>
        ),
      },
      {
        accessorKey: "vat",
        header: ({ column }) => <DataTableColumnHeader column={column} title="KDV (%20)" />,
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.vat != null ? formatCurrency(row.original.vat) : "—"}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam" />,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">{formatCurrency(row.original.amount)}</span>
        ),
      },
      {
        accessorKey: "pieceCount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="T. Adet" />,
        cell: ({ row }) => <span className="tabular-nums">{row.original.pieceCount}</span>,
      },
      {
        accessorKey: "volumetricWeight",
        header: ({ column }) => <DataTableColumnHeader column={column} title="T. Desi" />,
        cell: ({ row }) => <span className="tabular-nums">{row.original.volumetricWeight ?? "—"}</span>,
      },
      {
        accessorKey: "pieceList",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Parça Listesi" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.pieceList || "—"}</span>,
      },
      {
        accessorKey: "dispatchNo",
        header: ({ column }) => <DataTableColumnHeader column={column} title="İrsaliye No" />,
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.dispatchNo || "—"}</span>,
      },
      {
        accessorKey: "atfNo",
        header: ({ column }) => <DataTableColumnHeader column={column} title="ATF No" />,
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.atfNo || "—"}</span>,
      },
      {
        accessorKey: "date",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturulma Zamanı" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.date}</span>,
      },
      {
        accessorKey: "lastActionAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Son İşlem Zamanı" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.lastActionAt || "—"}</span>,
      },
      {
        accessorKey: "arrivalAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Varış Zamanı" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.arrivalAt || "—"}</span>,
      },
      {
        accessorKey: "deliveryAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Teslimat Zamanı" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.deliveryAt || "—"}</span>,
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kargo Durumu" />,
        filterFn: (row, columnId, filterValues: string[]) => filterValues.includes(row.getValue(columnId)),
        cell: ({ row }) => {
          const config = shipmentStatusConfig[row.original.status]
          const StatusIcon = config?.icon ?? Package
          return (
            <Badge variant="outline" className={config?.className}>
              <StatusIcon className="mr-1.5 size-3" />
              {config?.label ?? row.original.status}
            </Badge>
          )
        },
      },
      {
        accessorKey: "invoiceStatus",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Fatura Durumu" />,
        filterFn: (row, columnId, filterValues: string[]) => filterValues.includes(row.getValue(columnId)),
        cell: ({ row }) => {
          const status = invoiceStatusConfig[row.original.invoiceStatus ?? ""]
          return status ? (
            <Badge variant="outline" className={status.className}>{status.label}</Badge>
          ) : <span className="text-muted-foreground">—</span>
        },
      },
      {
        accessorKey: "collectionStatus",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tahsilat Durumu" />,
        filterFn: (row, columnId, filterValues: string[]) => filterValues.includes(row.getValue(columnId)),
        cell: ({ row }) => {
          const status = collectionStatusConfig[row.original.collectionStatus ?? ""]
          return status ? (
            <Badge variant="outline" className={status.className}>{status.label}</Badge>
          ) : <span className="text-muted-foreground">—</span>
        },
      },
      {
        accessorKey: "createdBy",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturan" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.createdBy || "—"}</span>,
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
                <DropdownMenuLabel>{`Takip No ${row.original.trackingNo} İşlemler:`}</DropdownMenuLabel>
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
                <DropdownMenuItem>
                  <ArrowRightLeft className="mr-2 size-4" />
                  Devret
                </DropdownMenuItem>
                <DropdownMenuItem className="text-amber-700 focus:text-amber-700">
                  <Ban className="mr-2 size-4" />
                  İptal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <Copy className="mr-2 size-4" />
                  Takip Linki
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-lg font-semibold">Müşteri Kargo Geçmişi</CardTitle>
        <div className="flex flex-wrap gap-2">
          {(["all", "teslim_edildi", "iptal", "devredildi"] as ShipmentFilter[]).map((item) => (
            <Button
              key={item}
              size="sm"
              variant={filter === item ? "default" : "outline"}
              onClick={() => setFilter(item)}
            >
              {filterLabels[item]} ({counts[item]})
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {table && (
          <div className="flex items-center gap-2">
            {!showFacetedFilters && (
              <DataTableExcelActions
                table={table}
                filename="musteri-kargo-gecmisi"
                exportSelected={false}
                exportLabel="Dışarı Aktar"
              />
            )}
            <DataTableToolbar
              table={table}
              showColumnSelector={!showFacetedFilters}
              viewLabel="Görünüm"
              columnsLabel="Sütunlar"
              resetLabel="Sıfırla"
            >
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
                  <DataTableFacetedFilter
                    column={table.getColumn("status")}
                    title="Kargo Durumu"
                    options={statusFilterOptions}
                  />
                  <DataTableFacetedFilter
                    column={table.getColumn("invoiceStatus")}
                    title="Fatura Durumu"
                    options={invoiceStatusFilterOptions}
                  />
                  <DataTableFacetedFilter
                    column={table.getColumn("collectionStatus")}
                    title="Tahsilat Durumu"
                    options={collectionStatusFilterOptions}
                  />
                </div>
              )}
            </DataTableToolbar>
          </div>
        )}

        <DataTable
          data={filteredShipments}
          columns={columns}
          enablePagination
          enableSorting
          enableColumnVisibility
          enableHorizontalScroll
          stickyFirstColumn
          stickyLastColumn
          className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
          emptyMessage={
            filter === "all"
              ? "Bu müşteriye ait kargo kaydı bulunmuyor."
              : `${filterLabels[filter]} için kayıt bulunmuyor.`
          }
          onTableReady={(instance) => setTable(instance as TanStackTable<ShipmentRow>)}
        />

        {table && <DataTablePagination table={table as TanStackTable<unknown>} pageSizeOptions={[5, 10, 20, 50]} />}
      </CardContent>
    </Card>
  )
}

