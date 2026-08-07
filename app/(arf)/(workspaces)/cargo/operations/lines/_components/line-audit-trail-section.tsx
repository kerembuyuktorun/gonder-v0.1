"use client"

import { useState } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader, DataTablePagination } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { History } from "lucide-react"
import type { LineAuditLogEntry } from "../_types"

interface Props {
  auditLogs: LineAuditLogEntry[]
}

const ACTION_LABELS: Record<LineAuditLogEntry["action"], string> = {
  line_created: "Hat Oluşturuldu",
  line_updated: "Hat Güncellendi",
  line_status_changed: "Hat Durumu Güncellendi",
  stop_added: "Durak Eklendi",
  stop_removed: "Durak Kaldırıldı",
  schedule_updated: "Zamanlama Güncellendi",
}

const ACTION_BADGE_CLASSES: Partial<Record<LineAuditLogEntry["action"], string>> = {
  line_created: "bg-emerald-50 text-emerald-700 border-emerald-200",
  line_updated: "bg-blue-100 text-blue-700 border-blue-200",
  line_status_changed: "bg-amber-100 text-amber-700 border-amber-200",
  stop_added: "bg-teal-100 text-teal-700 border-teal-200",
  stop_removed: "bg-red-100 text-red-700 border-red-200",
  schedule_updated: "bg-violet-100 text-violet-700 border-violet-200",
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const columns: ColumnDef<LineAuditLogEntry>[] = [
  {
    accessorKey: "action",
    header: ({ column }) => <DataTableColumnHeader column={column} title="İşlem" />,
    cell: ({ row }) => {
      const action = row.original.action
      return (
        <Badge
          variant="outline"
          className={`text-xs ${ACTION_BADGE_CLASSES[action] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}
        >
          {ACTION_LABELS[action] ?? action}
        </Badge>
      )
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Açıklama" />,
    cell: ({ row }) => (
      <span className="text-xs text-slate-600">{row.original.description}</span>
    ),
  },
  {
    accessorKey: "actorName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="İşlem Sahibi" />,
    cell: ({ row }) => (
      <span className="text-xs font-medium text-slate-700">{row.original.actorName}</span>
    ),
  },
  {
    accessorKey: "ipAddress",
    header: ({ column }) => <DataTableColumnHeader column={column} title="İşlem Sahibi IP Adresi" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-slate-500">
        {row.original.ipAddress ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => <DataTableColumnHeader column={column} title="İşlem Zamanı" />,
    cell: ({ row }) => (
      <span className="text-xs text-slate-600">{formatDateTime(row.original.timestamp)}</span>
    ),
  },
]

export function LineAuditTrailSection({ auditLogs }: Props) {
  const [table, setTable] = useState<TanStackTable<LineAuditLogEntry> | null>(null)

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <History className="size-4 text-slate-400" />
          İşlem Geçmişi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <DataTable columns={columns} data={auditLogs} onTableReady={setTable} />
        {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
      </CardContent>
    </Card>
  )
}