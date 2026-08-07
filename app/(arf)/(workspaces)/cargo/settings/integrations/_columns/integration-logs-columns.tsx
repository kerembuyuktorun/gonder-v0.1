"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { IntegrationLogEntry } from "../_types"

function statusClass(status: IntegrationLogEntry["status"]): string {
  switch (status) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "failed":
      return "border-red-200 bg-red-50 text-red-700"
    default:
      return "border-amber-200 bg-amber-50 text-amber-700"
  }
}

function statusLabel(status: IntegrationLogEntry["status"]): string {
  if (status === "success") return "Başarılı"
  if (status === "failed") return "Başarısız"
  return "Beklemede"
}

export const integrationLogsColumns: ColumnDef<IntegrationLogEntry>[] = [
  {
    accessorKey: "timestamp",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Zaman" />,
    cell: ({ row }) => new Date(row.original.timestamp).toLocaleString("tr-TR"),
  },
  {
    accessorKey: "action",
    header: ({ column }) => <DataTableColumnHeader column={column} title="İşlem Tipi" />,
  },
  {
    accessorKey: "resourceId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Kaynak" />,
    cell: ({ row }) => row.original.resourceId ?? row.original.resourceType,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
    cell: ({ row }) => (
      <Badge variant="outline" className={cn("border text-xs", statusClass(row.original.status))}>
        {statusLabel(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: "statusMessage",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Detay / Hata Mesajı" />,
    cell: ({ row }) => (
      <span title={row.original.errorDetails ?? row.original.statusMessage ?? "-"}>
        {row.original.statusMessage ?? "OK"}
      </span>
    ),
  },
]
