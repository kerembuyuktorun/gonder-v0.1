"use client"

import Link from "next/link"
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
import { cn } from "@/lib/utils"
import { ChevronDown, Eye, Info, XCircle } from "lucide-react"
import type { BranchCommissionRecord } from "../_types"

const typeConfig = {
  alim: { label: "Alım", className: "border-blue-200 bg-blue-50 text-blue-700" },
  dagitim: { label: "Dağıtım", className: "border-violet-200 bg-violet-50 text-violet-700" },
} satisfies Record<BranchCommissionRecord["transactionType"], { label: string; className: string }>

const statusConfig = {
  confirmed: { label: "Kesinleşti", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  pending: { label: "İşlemde", className: "border-amber-200 bg-amber-50 text-amber-700" },
  cancelled: { label: "İptal", className: "border-red-200 bg-red-50 text-red-700" },
} satisfies Record<BranchCommissionRecord["status"], { label: string; className: string }>

const arrayFilterFn = (row: { getValue: (id: string) => unknown }, id: string, value: string[]) =>
  value.includes(String(row.getValue(id) ?? ""))

interface CommissionColumnsOptions {
  onCancelRequest: (record: BranchCommissionRecord) => void
  onCancelInfoRequest: (record: BranchCommissionRecord) => void
}

export const createCommissionColumns = ({
  onCancelRequest,
  onCancelInfoRequest,
}: CommissionColumnsOptions): ColumnDef<BranchCommissionRecord>[] => [
  {
    accessorKey: "trackingNo",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Takip No" />,
    cell: ({ row }) => (
      <Link
        href={`/arf/cargo/shipments?search=${row.original.trackingNo}`}
        className="font-mono text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-colors hover:text-primary"
      >
        {row.original.trackingNo}
      </Link>
    ),
  },
  {
    accessorKey: "transactionType",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Hakediş Tipi" />,
    cell: ({ row }) => {
      const config = typeConfig[row.original.transactionType]
      return (
        <Badge variant="outline" className={cn("border", config.className)}>
          {config.label}
        </Badge>
      )
    },
    filterFn: arrayFilterFn,
  },
  {
    accessorKey: "kargoBedeli",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Kargo Bedeli (KDV Hariç)" />,
    cell: ({ row }) =>
      new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
        row.original.kargoBedeli,
      ),
  },
  {
    accessorKey: "hesaplamaDetayi",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Hesaplama Detayı" />,
  },
  {
    accessorKey: "netKazanc",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Kazanç (KDV Hariç)" />,
    cell: ({ row }) => (
      <span className={cn("font-semibold tabular-nums", row.original.status === "cancelled" && "text-red-700") }>
        {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
          row.original.netKazanc,
        )}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
    cell: ({ row }) => {
      const config = statusConfig[row.original.status]
      return (
        <Badge variant="outline" className={cn("border", config.className)}>
          {config.label}
        </Badge>
      )
    },
    filterFn: arrayFilterFn,
  },
  {
    accessorKey: "processDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Hakediş Tarihi" />,
    cell: ({ row }) => new Date(row.original.processDate).toLocaleString("tr-TR"),
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    header: () => null,
    cell: ({ row }) => {
      const isCancelled = row.original.status === "cancelled"
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              İşlemler
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/arf/cargo/shipments?search=${row.original.trackingNo}`}>
                <Eye className="mr-2 h-4 w-4" />
                Kargo Detay Görüntüle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (isCancelled) {
                  onCancelInfoRequest(row.original)
                  return
                }
                onCancelRequest(row.original)
              }}
            >
              {isCancelled ? <Info className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
              {isCancelled ? "Hakediş İptal Bilgi" : "Hakediş İptal Et"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
