"use client"

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
import { ChevronDown, Pencil, Power, PowerOff, Trash2 } from "lucide-react"
import type { DistanceDefinitionRecord } from "../_types"
import { DISTANCE_SLA_LABELS, DISTANCE_STATUS_LABELS } from "../_types"

interface ColumnActions {
  onEdit: (row: DistanceDefinitionRecord) => void
  onDelete: (row: DistanceDefinitionRecord) => void
  onToggleStatus: (row: DistanceDefinitionRecord) => void
}

function formatKm(value: number): string {
  const rounded = Number(value.toFixed(2))
  return Number.isInteger(rounded) ? String(rounded) : String(rounded)
}

function formatRange(row: DistanceDefinitionRecord): string {
  const min = formatKm(row.minKm)
  if (!row.hasUpperLimit || row.maxKm === null) {
    return `${min} KM - Limit Yok`
  }
  return `${min} KM - ${formatKm(row.maxKm)} KM`
}

export function getDistanceDefinitionsListColumns(
  actions: ColumnActions,
): ColumnDef<DistanceDefinitionRecord>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tanım Adı" />,
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium text-slate-900">{row.original.name}</p>
          {row.original.description && (
            <p className="line-clamp-1 text-xs text-slate-500">{row.original.description}</p>
          )}
        </div>
      ),
    },
    {
      accessorFn: (row) => row.minKm,
      id: "range",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tanım Aralığı" />,
      cell: ({ row }) => <p className="text-sm text-slate-700">{formatRange(row.original)}</p>,
    },
    {
      accessorKey: "slaTarget",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Hedeflenen Teslimat Süresi" />,
      cell: ({ row }) => <p className="text-sm text-slate-700">{DISTANCE_SLA_LABELS[row.original.slaTarget]}</p>,
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
          {DISTANCE_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      header: () => <span className="sr-only">İşlemler</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" className="h-8 rounded-lg px-2.5 text-xs">
              İşlemler <ChevronDown className="ml-1 size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => actions.onEdit(row.original)}>
              <Pencil className="mr-2 size-4" />
              Düzenle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions.onToggleStatus(row.original)}>
              {row.original.status === "active" ? (
                <PowerOff className="mr-2 size-4" />
              ) : (
                <Power className="mr-2 size-4" />
              )}
              {row.original.status === "active" ? "Pasif Yap" : "Aktif Yap"}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => actions.onDelete(row.original)}>
              <Trash2 className="mr-2 size-4" />
              Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
