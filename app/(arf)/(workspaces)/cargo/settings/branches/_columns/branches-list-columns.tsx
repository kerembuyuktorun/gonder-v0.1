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
import { ChevronDown, Eye, MapPin, Pencil, Power, PowerOff, Share2 } from "lucide-react"
import type { BranchRecord } from "../_mock/branches-mock-data"

export function getBranchesListColumns(
  onToggleStatus: (branchId: string) => void,
): ColumnDef<BranchRecord>[] {
  return [
    {
      accessorKey: "ad",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Şube Adı" />,
      cell: ({ row }) => (
        <Link href={`/arf/cargo/settings/branches/${row.original.id}`} className="font-medium text-slate-800 hover:text-primary hover:underline">
          {row.original.ad}
        </Link>
      ),
    },
    {
      accessorKey: "kod",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Şube Kodu" />,
      cell: ({ row }) => (
        <Link href={`/arf/cargo/settings/branches/${row.original.id}`} className="font-mono font-medium text-secondary hover:underline">
          {row.original.kod}
        </Link>
      ),
    },
    {
      accessorKey: "bagliTransferMerkezi",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Bağlı Transfer Merkezi" />,
    },
    {
      accessorKey: "il",
      header: ({ column }) => <DataTableColumnHeader column={column} title="İl" />,
    },
    {
      accessorKey: "ilce",
      header: ({ column }) => <DataTableColumnHeader column={column} title="İlçe" />,
    },
    {
      accessorKey: "mahalle",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mahalle" />,
    },
    {
      accessorKey: "telefon",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Şube Telefon" />,
    },
    {
      accessorKey: "eposta",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Şube E-Posta" />,
    },
    {
      accessorKey: "subeYoneticisi",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Şube Yöneticisi" />,
    },
    {
      accessorKey: "toplamKargo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam Kargo" />,
      cell: ({ row }) => row.original.toplamKargo.toLocaleString("tr-TR"),
    },
    {
      accessorKey: "aktif",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn(
            "border",
            row.original.aktif
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700",
          )}
        >
          {row.original.aktif ? "Aktif" : "Pasif"}
        </Badge>
      ),
      filterFn: (row, id, value: string[]) => {
        const aktif = row.getValue(id) as boolean
        return value.includes(aktif ? "aktif" : "pasif")
      },
    },
    {
      id: "actions",
      header: () => null,
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
                <Link href={`/arf/cargo/settings/branches/${row.original.id}`}>
                  <Eye className="mr-2 size-4" />
                  Detay Görüntüle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/arf/cargo/settings/branches/${row.original.id}`}>
                  <Pencil className="mr-2 size-4" />
                  Düzenle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  void navigator.clipboard?.writeText(`${window.location.origin}/arf/cargo/settings/branches/${row.original.id}`)
                }}
              >
                <Share2 className="mr-2 size-4" />
                Paylaş
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${row.original.il} ${row.original.ilce} ${row.original.mahalle}`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MapPin className="mr-2 size-4" />
                  Konum
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onToggleStatus(row.original.id)}>
                {row.original.aktif ? (
                  <PowerOff className="mr-2 size-4" />
                ) : (
                  <Power className="mr-2 size-4" />
                )}
                {row.original.aktif ? "Pasif Yap" : "Aktif Yap"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]
}
