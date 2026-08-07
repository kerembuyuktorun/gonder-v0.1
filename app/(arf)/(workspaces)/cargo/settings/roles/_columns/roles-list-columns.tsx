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
import { ChevronDown, Eye, EyeOff, Pencil, Power, Trash2 } from "lucide-react"
import type { RoleRecord } from "../_types"
import { ROLE_STATUS_LABELS } from "../_types"
import { SystemRoleBadge } from "../_components/system-role-badge"

const ROLES_BASE = "/arf/cargo/settings/roles"

interface ColumnActions {
  onEdit: (role: RoleRecord) => void
  onSuspend: (role: RoleRecord) => void
  onDelete: (role: RoleRecord) => void
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getRolesListColumns(actions: ColumnActions): ColumnDef<RoleRecord>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Rol Adı" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "roleType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Rol Tipi" />,
      cell: ({ row }) => (
        <SystemRoleBadge isSystem={row.original.roleType === "system"} />
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn(
            "border text-xs",
            row.original.status === "active"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-slate-50 text-slate-600",
          )}
        >
          {ROLE_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      id: "userCount",
      accessorFn: (row) => row.userCount,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kullanıcı Sayısı" />,
      cell: ({ row }) => (
        <Link
          href={`/arf/cargo/settings/users?role=${row.original.id}`}
          className="font-medium text-blue-700 hover:underline"
        >
          {row.original.userCount} Kişi
        </Link>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturulma Zamanı" />,
      cell: ({ row }) => <span className="text-sm text-slate-700">{formatDateTime(row.original.createdAt)}</span>,
    },
    {
      accessorKey: "createdBy",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturan" />,
      cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.createdBy ?? "-"}</span>,
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      header: () => <span className="sr-only">İşlemler</span>,
      cell: ({ row }) => {
        const role = row.original
        const canEdit = role.roleType !== "system"
        const canDelete = role.roleType !== "system" && role.status === "passive"

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="h-8 rounded-lg px-2.5 text-xs">
                İşlemler <ChevronDown className="ml-1 size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`${ROLES_BASE}/${role.id}`}>
                  <Eye className="mr-2 size-4" />
                  Detay Görüntüle
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => actions.onSuspend(role)}>
                {role.status === "active" ? (
                  <EyeOff className="mr-2 size-4" />
                ) : (
                  <Power className="mr-2 size-4" />
                )}
                {role.status === "active" ? "Pasif Yap" : "Aktif Yap"}
              </DropdownMenuItem>

              <DropdownMenuItem disabled={!canEdit} onClick={() => canEdit && actions.onEdit(role)}>
                <Pencil className="mr-2 size-4" />
                Düzenle
              </DropdownMenuItem>

              <DropdownMenuItem
                disabled={!canDelete}
                className={canDelete ? "text-red-600 focus:text-red-600" : "text-slate-400"}
                onClick={() => canDelete && actions.onDelete(role)}
              >
                <Trash2 className="mr-2 size-4" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
