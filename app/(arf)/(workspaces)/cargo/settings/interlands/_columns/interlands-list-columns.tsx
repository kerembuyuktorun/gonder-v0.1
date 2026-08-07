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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ChevronDown, Eye, Power, PowerOff, Trash2 } from "lucide-react"
import type { InterlandRecord } from "../_types"

export function getInterlandsListColumns(
  onToggleStatus: (id: string) => void,
  onDelete: (id: string) => void,
): ColumnDef<InterlandRecord>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="İnterland Adı" />,
      cell: ({ row }) => (
        <Link href={`/arf/cargo/settings/interlands/${encodeURIComponent(row.original.id)}`} className="font-medium text-slate-800 hover:text-primary hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    {
      id: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tür" />,
      cell: ({ row }) => {
        const isBlocked = row.original.id.startsWith("blocked-")

        return (
          <Badge
            variant="outline"
            className={cn(
              "border",
              isBlocked
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-sky-200 bg-sky-50 text-sky-700",
            )}
          >
            {isBlocked ? "Yasaklı" : "Normal"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "branchName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Bağlı Şube" />,
    },
    {
      id: "scopeSummary",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kapsam Özeti" />,
      cell: ({ row }) => (
        <span className="text-sm text-slate-600">
          {row.original.cityCount} Şehir / {row.original.districtCount} İlçe / {row.original.neighborhoodCount} Mahalle
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn(
            "border",
            row.original.status === "active"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700",
          )}
        >
          {row.original.status === "active" ? "Aktif" : "Pasif"}
        </Badge>
      ),
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Güncellenme Zamanı" />,
      cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString("tr-TR"),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">İşlemler</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 rounded-lg px-2.5 text-xs">
                İşlemler
                <ChevronDown className="ml-1 size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <Link href={`/arf/cargo/settings/interlands/${encodeURIComponent(row.original.id)}`}>
                  <Eye className="mr-2 size-4" />
                  Detay Görüntüle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onToggleStatus(row.original.id)}>
                {row.original.status === "active" ? (
                  <PowerOff className="mr-2 size-4" />
                ) : (
                  <Power className="mr-2 size-4" />
                )}
                {row.original.status === "active" ? "Pasif Yap" : "Aktif Yap"}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-700 focus:text-red-700" onSelect={() => onDelete(row.original.id)}>
                <Trash2 className="mr-2 size-4" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]
}
