"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, ChevronDown } from "lucide-react"
import type { ExpenseRecord, ExpenseStatus } from "../_types/expense"

const STATUS_META: Record<ExpenseStatus, { label: string; className: string }> = {
  paid: {
    label: "ÖDENDİ",
    className: "border-emerald-200 bg-emerald-50 text-emerald-600",
  },
  unpaid: {
    label: "ÖDENMEDİ",
    className: "border-amber-200 bg-amber-50 text-amber-600",
  },
  partially_paid: {
    label: "KISMİ ÖDENDİ",
    className: "border-blue-200 bg-blue-50 text-blue-600",
  },
  overdue: {
    label: "GECİKMİŞ",
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

export interface ExpenseColumnActions {
  onViewDetail: (row: ExpenseRecord) => void
}

export function getExpensesColumns(actions: ExpenseColumnActions): ColumnDef<ExpenseRecord>[] {
  return [
    {
      accessorKey: "supplierTitle",
      minSize: 200,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tedarikçi Ünvanı" />,
      cell: ({ row }) => (
        <p className="text-sm font-medium text-slate-800">{row.original.supplierTitle}</p>
      ),
    },
    {
      accessorKey: "invoiceNo",
      size: 170,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fatura No" />,
      cell: ({ row }) => (
        <p className="text-sm font-medium text-slate-700">{row.original.invoiceNo}</p>
      ),
    },
    {
      accessorKey: "category",
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kategori" />,
      cell: ({ row }) => (
        <p className="text-sm text-slate-700">{row.original.category}</p>
      ),
    },
    {
      accessorKey: "tag",
      size: 120,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Etiket" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="rounded-full text-[11px] border-slate-200 bg-slate-50 text-slate-600">
          {row.original.tag}
        </Badge>
      ),
    },
    {
      accessorKey: "invoiceDate",
      size: 160,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Düzenlenme Tarihi" />,
      cell: ({ row }) => (
        <p className="text-sm text-slate-700">{formatLongDate(row.original.invoiceDate)}</p>
      ),
    },
    {
      accessorKey: "dueDate",
      size: 160,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Vade Tarihi" />,
      cell: ({ row }) => (
        <p className="text-sm text-slate-700">{formatLongDate(row.original.dueDate)}</p>
      ),
    },
    {
      accessorKey: "netAmount",
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Matrah" />,
      cell: ({ row }) => (
        <span className="text-sm text-slate-700">{formatAmount(row.original.netAmount)}</span>
      ),
    },
    {
      accessorKey: "vatAmount",
      size: 120,
      header: ({ column }) => <DataTableColumnHeader column={column} title="KDV" />,
      cell: ({ row }) => (
        <span className="text-sm text-slate-700">{formatAmount(row.original.vatAmount)}</span>
      ),
    },
    {
      accessorKey: "totalAmount",
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam" />,
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-slate-800">{formatAmount(row.original.totalAmount)}</span>
      ),
    },
    {
      accessorKey: "paidAmount",
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ödenen" />,
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-emerald-600">
          {formatAmount(row.original.totalAmount - row.original.remainingAmount)}
        </span>
      ),
    },
    {
      accessorKey: "remainingAmount",
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kalan" />,
      cell: ({ row }) => (
        <span className={`text-sm font-semibold ${row.original.remainingAmount > 0 ? "text-rose-600" : "text-slate-400"}`}>
          {formatAmount(row.original.remainingAmount)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      size: 120,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
      cell: ({ row }) => {
        const status = STATUS_META[row.original.status]
        return (
          <Badge variant="outline" className={`rounded-full text-[11px] ${status.className}`}>
            {status.label}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      size: 100,
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
