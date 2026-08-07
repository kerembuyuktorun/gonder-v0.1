"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TransferCenterRoute } from "../_types"

const centeredHeader = "[&>div]:justify-center [&_button]:ml-0"

const routeTypeConfig = {
  ana: {
    label: "Ana Hat",
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
  merkez: {
    label: "Merkez Hat",
    className: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  },
  ara: {
    label: "Ara Hat",
    className: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
}

export const routesColumns: ColumnDef<TransferCenterRoute>[] = [
  {
    accessorKey: "routeName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Hat Adı" />,
    cell: ({ row }) => (
      <div>
        <Link
          href={`/arf/cargo/operations/trips?route=${row.original.routeCode}`}
          className="font-medium text-slate-800 hover:text-blue-700 hover:underline"
        >
          {row.original.routeName}
        </Link>
        <div className="font-mono text-xs text-slate-400">{row.original.routeCode}</div>
      </div>
    ),
  },
  {
    accessorKey: "routeType",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Hat Tipi" />,
    cell: ({ row }) => {
      const cfg = routeTypeConfig[row.original.routeType]
      return (
        <Badge variant="outline" className={cn("border", cfg.className)}>
          {cfg.label}
        </Badge>
      )
    },
    filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
  },
  {
    accessorKey: "destinationName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Varış Noktası" />,
    cell: ({ row }) => (
      <div>
        <div className="text-sm text-slate-700">{row.original.destinationName}</div>
        <div className="text-xs text-slate-400">{row.original.destinationCity}</div>
      </div>
    ),
  },
  {
    id: "zaman",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kalkış / Varış" className={centeredHeader} />
    ),
    cell: ({ row }) => (
      <div className="text-center text-sm">
        <span className="font-mono">{row.original.departureTime}</span>
        <span className="mx-1 text-slate-400">→</span>
        <span className="font-mono">{row.original.arrivalTime}</span>
      </div>
    ),
  },
  {
    accessorKey: "frequency",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sıklık" className={centeredHeader} />
    ),
    cell: ({ row }) => {
      const { frequency, frequencyDays } = row.original
      const label =
        frequency === "gunluk"
          ? "Her Gün"
          : frequency === "haftalik"
            ? "Haftalık"
            : (frequencyDays?.join(", ") ?? "Belirli Günler")
      return <div className="text-center text-sm text-slate-600">{label}</div>
    },
  },
  {
    accessorKey: "avgDailyVolume",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Ort. Günlük Hacim"
        className={centeredHeader}
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <span className="font-semibold text-slate-900">
          {row.original.avgDailyVolume.toLocaleString("tr-TR")}
        </span>
        <span className="ml-1 text-xs text-slate-500">parça/gün</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Durum" className={centeredHeader} />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge
          variant="outline"
          className={cn(
            "border",
            row.original.status === "active"
              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
              : "bg-slate-500/10 text-slate-500 border-slate-400/20",
          )}
        >
          {row.original.status === "active" ? "Aktif" : "Pasif"}
        </Badge>
      </div>
    ),
  },
]
