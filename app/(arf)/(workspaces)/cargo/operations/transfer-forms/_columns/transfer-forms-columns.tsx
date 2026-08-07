import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Eye } from "lucide-react"
import Link from "next/link"
import { KTF_STATUS_CLASSES, KTF_STATUS_LABELS, formatCurrency, formatDateTime } from "../_lib/transfer-form-helpers"
import type { TransferFormListRecord } from "../_types"

export function getTransferFormsColumns(): ColumnDef<TransferFormListRecord>[] {
  return [
    {
      accessorKey: "ktfNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="KTF No" />,
      cell: ({ row }) => (
        <Link
          href={`/arf/cargo/operations/transfer-forms/${row.original.id}`}
          className="font-mono text-sm font-semibold text-secondary underline"
        >
          {row.original.ktfNumber}
        </Link>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "courierName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kurye" />,
      cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.courierName}</span>,
    },
    {
      accessorKey: "branchName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Şube" />,
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.branchName}</span>,
    },
    {
      accessorKey: "openedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturulma Zamanı" />,
      cell: ({ row }) => <span className="text-sm tabular-nums text-slate-600">{formatDateTime(row.original.openedAt)}</span>,
    },
    {
      accessorKey: "totalConsignments",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Zimmetlenen Parça" />,
      cell: ({ row }) => (
        <span className="text-sm font-semibold tabular-nums text-slate-900">{row.original.totalConsignments}</span>
      ),
    },
    {
      accessorKey: "totalCollectionAmount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam Tahsilat" />,
      cell: ({ row }) => (
        <span className="text-sm font-semibold tabular-nums text-emerald-700">
          {formatCurrency(row.original.totalCollectionAmount)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant="outline" className={KTF_STATUS_CLASSES[status]}>
            {KTF_STATUS_LABELS[status]}
          </Badge>
        )
      },
      filterFn: (row, columnId, filterValues: string[]) => filterValues.includes(row.getValue(columnId)),
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-medium">
                İşlemler
                <ChevronDown className="ml-1 size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{`${row.original.ktfNumber} İşlemleri`}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/arf/cargo/operations/transfer-forms/${row.original.id}`}>
                  <Eye className="mr-2 size-4" />
                  Detay Görüntüle
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
