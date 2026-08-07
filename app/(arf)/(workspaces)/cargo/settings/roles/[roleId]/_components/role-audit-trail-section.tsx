"use client"

import { useState } from "react"
import type { Table as TanStackTable, ColumnDef } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader, DataTablePagination } from "@hascanb/arf-ui-kit/datatable-kit"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { History } from "lucide-react"
import type { RoleAuditLogEntry } from "../../_types"

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const columns: ColumnDef<RoleAuditLogEntry>[] = [
  {
    accessorKey: "action",
    header: ({ column }) => <DataTableColumnHeader column={column} title="İşlem" />,
    cell: ({ row }) => <span className="text-xs font-medium text-slate-700">{row.original.action}</span>,
  },
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Açıklama" />,
    cell: ({ row }) => <span className="text-xs text-slate-600">{row.original.description}</span>,
  },
  {
    accessorKey: "actorName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="İşlem Sahibi" />,
    cell: ({ row }) => <span className="text-xs font-medium text-slate-700">{row.original.actorName}</span>,
  },
  {
    accessorKey: "actorIpAddress",
    header: ({ column }) => <DataTableColumnHeader column={column} title="İşlem Sahibi IP Adresi" />,
    cell: ({ row }) => <span className="font-mono text-xs text-slate-500">{row.original.actorIpAddress ?? "—"}</span>,
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => <DataTableColumnHeader column={column} title="İşlem Zamanı" />,
    cell: ({ row }) => <span className="text-xs text-slate-600">{formatDateTime(row.original.timestamp)}</span>,
  },
]

export function RoleAuditTrailSection({ auditLogs }: { auditLogs: RoleAuditLogEntry[] }) {
  const [table, setTable] = useState<TanStackTable<RoleAuditLogEntry> | null>(null)

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <History className="size-4 text-slate-400" />
          İşlem Geçmişi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        <DataTable columns={columns} data={auditLogs} onTableReady={setTable} />
        {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
      </CardContent>
    </Card>
  )
}