"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, ChevronDown } from "lucide-react"
import type { IncomingEInvoiceRecord, IncomingEInvoiceStatus } from "../_types/incoming-e-invoice"

const STATUS_META: Record<IncomingEInvoiceStatus, { label: string; className: string }> = {
  accepted_basic: {
    label: "KABUL EDİLDİ(TEMEL)",
    className: "border-emerald-200 bg-emerald-50 text-emerald-600",
  },
  pending_approval: {
    label: "ONAY BEKLİYOR",
    className: "border-amber-200 bg-amber-50 text-amber-600",
  },
  rejected: {
    label: "REDDEDİLDİ",
    className: "border-rose-200 bg-rose-50 text-rose-600",
  },
}

function formatAmount(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatLongDate(value: string): string {
  if (!value) return "-"

  return new Date(value).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export interface IncomingEInvoiceColumnActions {
  onViewDetail: (row: IncomingEInvoiceRecord) => void
}

export function getIncomingEInvoicesColumns(actions: IncomingEInvoiceColumnActions): ColumnDef<IncomingEInvoiceRecord>[] {
  return [
    {
      accessorKey: "senderTitle",
      minSize: 200,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderen Ünvan" />,
      cell: ({ row }) => (
        <p className="text-sm font-medium text-slate-800">{row.original.senderTitle}</p>
      ),
    },
    {
      accessorKey: "invoiceNo",
      size: 180,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fatura No" />,
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-slate-700">{row.original.invoiceNo}</p>
          <p className="text-xs text-slate-500">{row.original.profileLabel} / {row.original.invoiceTypeLabel}</p>
        </div>
      ),
    },
    {
      accessorKey: "invoiceDate",
      size: 180,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fatura Tarihi" />,
      cell: ({ row }) => {
        const status = STATUS_META[row.original.status]

        return (
          <div className="space-y-1">
            <p className="text-sm text-slate-700">{formatLongDate(row.original.invoiceDate)}</p>
            <Badge variant="outline" className={`rounded-full text-[11px] ${status.className}`}>
              {status.label}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "amount",
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fatura Tutarı" />,
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-slate-800">{formatAmount(row.original.amount)}</span>
      ),
    },
    {
      accessorKey: "status",
      enableHiding: true,
      enableSorting: false,
      header: () => null,
      cell: () => null,
    },
    {
      id: "actions",
      size: 120,
      enableHiding: false,
      enableSorting: false,
      header: () => null,
      cell: ({ row }) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-medium"
          onClick={() => actions.onViewDetail(row.original)}
        >
          <Eye className="mr-1.5 size-3.5 text-slate-500" />
          Görüntüle
          <ChevronDown className="ml-1 size-3.5" />
        </Button>
      ),
    },
  ]
}
