"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LineActionsCell } from "../_components/line-actions-cell"
import { LineTypeBadge } from "../_components/line-type-badge"
import type { LineRecord } from "../_types"

interface Actions {
  onToggleStatus: (row: LineRecord) => void
  onEdit: (row: LineRecord) => void
  onDelete: (row: LineRecord) => void
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso))
}

export function getLinesColumns(actions: Actions): ColumnDef<LineRecord>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Hat Adı" />,
      cell: ({ row }) => (
        <Link href={`/arf/cargo/operations/lines/${row.original.id}`} className="font-medium text-slate-900 hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Hat Türü" />,
      cell: ({ row }) => <LineTypeBadge type={row.original.type} />,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            row.original.status === "active"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700",
          )}
        >
          {row.original.status === "active" ? "Aktif" : "Pasif"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturulma Zamanı" />,
      cell: ({ row }) => <span className="text-sm text-slate-700">{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      header: () => <span className="sr-only">İşlemler</span>,
      cell: ({ row }) => (
        <LineActionsCell
          row={row.original}
          onToggleStatus={actions.onToggleStatus}
          onEdit={actions.onEdit}
          onDelete={actions.onDelete}
        />
      ),
    },
  ]
}
