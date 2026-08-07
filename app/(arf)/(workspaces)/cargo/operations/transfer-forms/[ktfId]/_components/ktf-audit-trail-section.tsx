"use client"

import { useMemo, useState } from "react"
import type { ColumnDef, Table as TanStackTable } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader, DataTablePagination } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { History } from "lucide-react"
import type { KtfAuditLogEntry } from "../../_types/ktf-audit-types"
import { KTF_AUDIT_ACTION_CLASSES, KTF_AUDIT_ACTION_LABELS, formatDateTime } from "../../_lib/transfer-form-helpers"

interface Props {
  logs: KtfAuditLogEntry[]
}

export function KtfAuditTrailSection({ logs }: Props) {
  const [table, setTable] = useState<TanStackTable<KtfAuditLogEntry> | null>(null)

  const columns = useMemo<ColumnDef<KtfAuditLogEntry>[]>(
    () => [
      {
        accessorKey: "action",
        header: ({ column }) => <DataTableColumnHeader column={column} title="İşlem" />,
        cell: ({ row }) => (
          <Badge variant="outline" className={`text-xs ${KTF_AUDIT_ACTION_CLASSES[row.original.action] ?? "border-slate-200 bg-slate-100 text-slate-700"}`}>
            {KTF_AUDIT_ACTION_LABELS[row.original.action]}
          </Badge>
        ),
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
        accessorKey: "ipAddress",
        header: ({ column }) => <DataTableColumnHeader column={column} title="IP Adresi" />,
        cell: ({ row }) => <span className="font-mono text-xs text-slate-500">{row.original.ipAddress ?? "-"}</span>,
      },
      {
        accessorKey: "timestamp",
        header: ({ column }) => <DataTableColumnHeader column={column} title="İşlem Zamanı" />,
        cell: ({ row }) => <span className="text-xs text-slate-600">{formatDateTime(row.original.timestamp)}</span>,
      },
    ],
    [],
  )

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <History className="size-4 text-slate-400" />
          İşlem Geçmişi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        <DataTable columns={columns} data={logs} onTableReady={setTable} emptyMessage="Geçmiş kaydı bulunamadı." />
        {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
      </CardContent>
    </Card>
  )
}
