"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Pencil, Trash2 } from "lucide-react"
import type { InterlandScopeRow } from "../../_types"

export interface InterlandScopeGroupedRow {
  id: string
  city: string
  district: string
  neighborhood: string
  neighborhoods: string[]
  sourceRows: InterlandScopeRow[]
}

export function getScopeColumns(
  onEdit: (row: InterlandScopeGroupedRow) => void,
  onDelete: (row: InterlandScopeGroupedRow) => void,
): ColumnDef<InterlandScopeGroupedRow>[] {
  return [
    {
      accessorKey: "city",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Şehir" />,
    },
    {
      accessorKey: "district",
      header: ({ column }) => <DataTableColumnHeader column={column} title="İlçe" />,
    },
    {
      accessorKey: "neighborhood",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mahalle" />,
      cell: ({ row }) =>
        row.original.neighborhoods.length > 1
          ? `${row.original.neighborhoods.length} mahalle: ${row.original.neighborhoods.join(", ")}`
          : row.original.neighborhood,
    },
    {
      id: "actions",
      header: () => null,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-8 rounded-lg px-2.5 text-xs">
                İşlemler
                <ChevronDown className="ml-1 size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onSelect={() => onEdit(row.original)}>
                <Pencil className="mr-2 size-4" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-700 focus:text-red-700" onSelect={() => onDelete(row.original)}>
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
