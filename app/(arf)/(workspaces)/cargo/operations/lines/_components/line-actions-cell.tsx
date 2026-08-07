"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Eye, Pencil, Power, PowerOff, Trash2 } from "lucide-react"
import type { LineRecord } from "../_types"

interface Props {
  row: LineRecord
  onToggleStatus: (row: LineRecord) => void
  onEdit: (row: LineRecord) => void
  onDelete: (row: LineRecord) => void
}

export function LineActionsCell({ row, onToggleStatus, onEdit, onDelete }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" className="h-8 rounded-lg px-2.5 text-xs">
          İşlemler <ChevronDown className="ml-1 size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/arf/cargo/operations/lines/${row.id}`}>
            <Eye className="mr-2 size-4" />
            Detay Görüntüle
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleStatus(row)}>
          {row.status === "active" ? <PowerOff className="mr-2 size-4" /> : <Power className="mr-2 size-4" />}
          {row.status === "active" ? "Pasif Yap" : "Aktif Yap"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(row)}>
          <Pencil className="mr-2 size-4" />
          Düzenle
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => onDelete(row)}>
          <Trash2 className="mr-2 size-4" />
          Sil
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
