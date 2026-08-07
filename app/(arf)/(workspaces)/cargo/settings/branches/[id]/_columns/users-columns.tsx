"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ChevronDown, Trash2, UserCog } from "lucide-react"
import type { BranchUser } from "../_types"

const roleConfig = {
  yonetici: { label: "Yönetici", className: "border-purple-200 bg-purple-50 text-purple-700" },
  operator: { label: "Operatör", className: "border-blue-200 bg-blue-50 text-blue-700" },
  kurye: { label: "Kurye", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  muhasebe: { label: "Muhasebe", className: "border-amber-200 bg-amber-50 text-amber-700" },
} satisfies Record<BranchUser["role"], { label: string; className: string }>

const statusConfig = {
  active: { label: "Aktif", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  passive: { label: "Pasif", className: "border-red-200 bg-red-50 text-red-700" },
} satisfies Record<BranchUser["status"], { label: string; className: string }>

export function getUsersColumns(
  onToggleStatus: (user: BranchUser) => void,
  onRemove: (user: BranchUser) => void,
): ColumnDef<BranchUser>[] {
  return [
    {
      id: "fullName",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
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
        const config = roleConfig[row.original.role]
        return (
          <Badge variant="outline" className={cn("border", config.className)}>
            {config.label}
          </Badge>
        )
      },
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      accessorKey: "phone",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Telefon" />,
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="E-posta" />,
      cell: ({ row }) => <span className="text-slate-500">{row.original.email}</span>,
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
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kayıt Tarihi" />,
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("tr-TR"),
    },
    {
      accessorKey: "lastActivity",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Son Aktivite" />,
      cell: ({ row }) =>
        row.original.lastActivity ? new Date(row.original.lastActivity).toLocaleString("tr-TR") : "-",
    },
    {
      id: "actions",
      header: () => <span className="sr-only">İşlemler</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 rounded-lg px-2.5 text-xs">
                  İşlemler
                  <ChevronDown className="ml-1 size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onSelect={() => onToggleStatus(user)}>
                  <UserCog className="mr-2 size-4" />
                  {user.status === "active" ? "Pasif Yap" : "Aktif Yap"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-700 focus:text-red-700" onSelect={() => onRemove(user)}>
                  <Trash2 className="mr-2 size-4" />
                  Bağlantıyı Kaldır
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
