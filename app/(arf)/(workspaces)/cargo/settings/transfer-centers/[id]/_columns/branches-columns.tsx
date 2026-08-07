"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import {
  DataTableColumnHeader,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ChevronDown, Eye, MinusCircle } from "lucide-react"
import type { TransferCenterBranch } from "../_types"

const centeredHeader = "[&>div]:justify-center [&_button]:ml-0"

export function getBranchesColumns(
  onRemove?: (branch: TransferCenterBranch) => void,
): ColumnDef<TransferCenterBranch>[] {
  return [
  {
    accessorKey: "branchCode",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Şube Kodu" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-slate-700">{row.original.branchCode}</span>
    ),
  },
  {
    accessorKey: "branchName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Şube Adı" />,
    cell: ({ row }) => <span className="font-medium text-slate-800">{row.original.branchName}</span>,
  },
  {
    id: "konum",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Konum" className={centeredHeader} />
    ),
    cell: ({ row }) => (
      <span className="block text-center text-sm text-slate-600">
        {row.original.district}, {row.original.city}
      </span>
    ),
  },
  {
    accessorKey: "managerName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Yönetici" className={centeredHeader} />
    ),
    cell: ({ row }) => (
      <span className="block text-center text-sm">{row.original.managerName}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Telefon" className={centeredHeader} />
    ),
    cell: ({ row }) => (
      <span className="block text-center text-sm text-slate-600">{row.original.phone}</span>
    ),
  },
  {
    accessorKey: "connectedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bağlantı Tarihi" className={centeredHeader} />
    ),
    cell: ({ row }) => (
      <span className="block text-center text-sm">{row.original.connectedAt}</span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Durum" className={centeredHeader} />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge
          variant="outline"
          className={cn(
            "border",
            row.original.status === "active"
              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
              : "bg-slate-500/10 text-slate-500 border-slate-400/20",
          )}
        >
          {row.original.status === "active" ? "Aktif" : "Pasif"}
        </Badge>
      </div>
    ),
    filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
  },
    {
    id: "actions",
    header: () => <span className="sr-only">İşlemler</span>,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-medium"
            >
              İşlemler
              <ChevronDown className="ml-1 size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild>
                  <Link href={`/arf/cargo/settings/branches?search=${encodeURIComponent(row.original.branchCode)}`}>
                <Eye className="mr-2 size-4" />
                Detay Görüntüle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700"
              onClick={() => {
                if (
                  window.confirm(
                    `${row.original.branchName} bağlantısını kaldırmak istediğinizden emin misiniz?`,
                  )
                ) {
                  onRemove?.(row.original)
                }
              }}
            >
              <MinusCircle className="mr-2 size-4" />
              Bağlantıyı Kaldır
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
  ]
}
