"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { OpenCargoRecord } from "../_types/financial"
import type { ShipmentStatus } from "../../_data/customers"
import {
  Ban,
  CheckCircle2,
  Clock,
  Package,
  Truck,
} from "lucide-react"
import type { ComponentType } from "react"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(value)

const shipmentStatusConfig: Record<
  ShipmentStatus,
  { label: string; className: string; icon: ComponentType<{ className?: string }> }
> = {
  hazirlaniyor: { label: "Hazırlanıyor", className: "bg-slate-500/10 text-slate-700 border-slate-400/30", icon: Clock },
  transferde: { label: "Transferde", className: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: Truck },
  dagitimda: { label: "Dağıtımda", className: "bg-sky-500/10 text-sky-600 border-sky-500/20", icon: Truck },
  teslim_edildi: { label: "Teslim Edildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  devredildi: { label: "Devredildi", className: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20", icon: Package },
  iptal: { label: "İptal", className: "bg-rose-500/10 text-rose-600 border-rose-500/20", icon: Ban },
}

const invoiceStatusConfig: Record<string, { label: string; className: string }> = {
  kesildi: { label: "Kesildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  kesilmedi: { label: "Kesilmedi", className: "bg-slate-500/10 text-slate-500 border-slate-400/20" },
}

const collectionStatusConfig: Record<string, { label: string; className: string }> = {
  tahsil_edildi: { label: "Tahsil Edildi", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  beklemede: { label: "Beklemede", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  iptal: { label: "İptal", className: "bg-red-500/10 text-red-600 border-red-500/20" },
}

export const openCargosColumns: ColumnDef<OpenCargoRecord>[] = [
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
        aria-label="Satırı seç"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
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
    accessorKey: "invoiceStatus",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fatura Durumu" />,
    cell: ({ row }) => {
      const cfg = invoiceStatusConfig[row.original.invoiceStatus ?? ""]
      return cfg ? (
        <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
      ) : <span className="text-muted-foreground">—</span>
    },
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
    accessorKey: "pieceStatus",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Parça Durumu" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.pieceStatus || "—"}</span>,
  },
  {
    accessorKey: "collectionStatus",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tahsilat Durumu" />,
    cell: ({ row }) => {
      const cfg = collectionStatusConfig[row.original.collectionStatus ?? ""]
      return cfg ? (
        <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
      ) : <span className="text-muted-foreground">—</span>
    },
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturan" />,
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.createdBy || "—"}</span>,
  },
]
