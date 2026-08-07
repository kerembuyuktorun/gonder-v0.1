"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CheckCircle2, Clock, Eye, XCircle } from "lucide-react"
import type { CommissionRecord } from "../_types"

const centeredHeader = "[&>div]:justify-center [&_button]:ml-0"

const statusConfig = {
  confirmed: {
    label: "Kesinleşti",
    Icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
  pending: {
    label: "İşlemde",
    Icon: Clock,
    className: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
  cancelled: {
    label: "İptal Edildi",
    Icon: XCircle,
    className: "bg-red-500/10 text-red-700 border-red-500/20",
  },
}

export const commissionColumns: ColumnDef<CommissionRecord>[] = [
  {
    accessorKey: "processDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="İşlem Tarihi" />,
    cell: ({ row }) => {
      const date = new Date(row.original.processDate)
      return (
        <div className="text-sm">
          <div>{date.toLocaleDateString("tr-TR")}</div>
          <div className="text-xs text-slate-400">
            {date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "trackingNo",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Takip No" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-slate-700">
        {row.original.trackingNo}
      </span>
    ),
  },
  {
    accessorKey: "pieceCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Parça Sayısı" className={centeredHeader} />
    ),
    cell: ({ row }) => (
      <span className="block text-center tabular-nums">{row.original.pieceCount}</span>
    ),
  },
  {
    accessorKey: "cargoValue",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kargo Bedeli" className={centeredHeader} />
    ),
    cell: ({ row }) => (
      <span className="block text-center tabular-nums">
        {row.original.cargoValue.toLocaleString("tr-TR", {
          style: "currency",
          currency: "TRY",
          minimumFractionDigits: 2,
        })}
      </span>
    ),
  },
  {
    accessorKey: "calculationDetail",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hesaplama" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs text-slate-600">{row.original.calculationDetail}</span>
    ),
  },
  {
    accessorKey: "netEarning",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Net Kazanç" className={centeredHeader} />
    ),
    cell: ({ row }) => (
      <span className="block text-center font-semibold text-slate-900 tabular-nums">
        {row.original.netEarning.toLocaleString("tr-TR", {
          style: "currency",
          currency: "TRY",
          minimumFractionDigits: 2,
        })}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Durum" className={centeredHeader} />
    ),
    cell: ({ row }) => {
      const cfg = statusConfig[row.original.status]
      const { Icon } = cfg
      return (
        <div className="flex justify-center">
          <Badge
            variant="outline"
            className={cn("inline-flex items-center gap-1 border", cfg.className)}
          >
            <Icon className="size-3" />
            {cfg.label}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">İşlemler</span>,
    enableSorting: false,
    enableHiding: false,
    cell: () => (
      <div className="flex justify-center">
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
          <Eye className="mr-1 size-3.5" />
          Detay
        </Button>
      </div>
    ),
  },
]
