"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { formatDateTime, formatMoney } from "../../_lib/invoice-presenters"

export interface InvoicePaymentHistoryRow {
  id: string
  paymentDate: string
  bankAccountLabel: string
  amount: number
  matchType: string
  description: string
}

export function getPaymentHistoryColumns(): ColumnDef<InvoicePaymentHistoryRow>[] {
  return [
    {
      accessorKey: "paymentDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Eşleşme Tarihi" />,
      cell: ({ row }) => <span className="text-sm text-slate-700">{formatDateTime(row.original.paymentDate)}</span>,
    },
    {
      accessorKey: "bankAccountLabel",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Banka Hesabı" />,
      cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.bankAccountLabel}</span>,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Gelen Tutar" />,
      cell: ({ row }) => <span className="font-medium text-emerald-700">{formatMoney(row.original.amount)}</span>,
    },
    {
      accessorKey: "matchType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Eşleştirme Tipi" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
          {row.original.matchType}
        </Badge>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Açıklama / Dekont No" />,
      cell: ({ row }) => <span className="font-mono text-sm text-slate-600">{row.original.description}</span>,
    },
  ]
}