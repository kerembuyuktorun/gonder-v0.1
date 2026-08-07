"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { InterlandAuditLog } from "../../_types"

const actionLabelMap: Record<InterlandAuditLog["actionType"], { label: string; className: string }> = {
  scope_add: { label: "Kapsam Ekleme", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  scope_update: { label: "Kapsam Güncelleme", className: "border-blue-200 bg-blue-50 text-blue-700" },
  scope_delete: { label: "Kapsam Silme", className: "border-red-200 bg-red-50 text-red-700" },
  status_change: { label: "Durum Değişimi", className: "border-amber-200 bg-amber-50 text-amber-700" },
  edit: { label: "Düzenleme", className: "border-slate-200 bg-slate-50 text-slate-700" },
}

export const auditColumns: ColumnDef<InterlandAuditLog>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tarih/Saat" />,
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString("tr-TR"),
  },
  {
    accessorKey: "actionType",
    header: ({ column }) => <DataTableColumnHeader column={column} title="İşlem Tipi" />,
    cell: ({ row }) => {
      const cfg = actionLabelMap[row.original.actionType]
      return (
        <Badge variant="outline" className={cn("border", cfg.className)}>
          {cfg.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "actorName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="İşlemi Yapan" />,
  },
]
