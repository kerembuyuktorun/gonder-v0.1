"use client"

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
import { ChevronDown, Pencil, PowerOff, Trash2 } from "lucide-react"
import type { TransferCenterUser } from "../_types"

const centeredHeader = "[&>div]:justify-center [&_button]:ml-0"

const roleConfig: Record<
  TransferCenterUser["role"],
  { label: string; className: string }
> = {
  yonetici: {
    label: "Yönetici",
    className: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  },
  operator: {
    label: "Operatör",
    className: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  },
  kurye: {
    label: "Kurye",
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
}

export const usersColumns: ColumnDef<TransferCenterUser>[] = [
  {
    id: "ad",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ad Soyad" />,
    cell: ({ row }) => (
      <span className="font-medium text-slate-800">
        {row.original.firstName} {row.original.lastName}
      </span>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rol" />,
    cell: ({ row }) => {
      const cfg = roleConfig[row.original.role]
      return (
        <Badge variant="outline" className={cn("border", cfg.className)}>
          {cfg.label}
        </Badge>
      )
    },
    filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
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
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="E-posta" className={centeredHeader} />
    ),
    cell: ({ row }) => (
      <span className="block text-center text-sm text-slate-500">{row.original.email}</span>
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
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kayıt Tarihi" className={centeredHeader} />
    ),
    cell: ({ row }) => (
      <span className="block text-center text-sm">{row.original.createdAt}</span>
    ),
  },
  {
    accessorKey: "lastActivity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Son Aktivite" className={centeredHeader} />
    ),
    cell: ({ row }) => {
      const { lastActivity } = row.original
      if (!lastActivity) {
        return (
          <span className="block text-center text-xs text-slate-400">Henüz aktivite yok</span>
        )
      }
      const date = new Date(lastActivity)
      return (
        <div className="text-center text-sm">
          <div>{date.toLocaleDateString("tr-TR")}</div>
          <div className="text-xs text-slate-400">
            {date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">İşlemler</span>,
    enableSorting: false,
    enableHiding: false,
    size: 136,
    minSize: 120,
    maxSize: 152,
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
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              {row.original.firstName} {row.original.lastName}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Pencil className="mr-2 size-4" />
              Düzenle
            </DropdownMenuItem>
            <DropdownMenuItem className="text-amber-600">
              <PowerOff className="mr-2 size-4" />
              {row.original.status === "active" ? "Pasif Yap" : "Aktif Yap"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 size-4" />
              Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]
