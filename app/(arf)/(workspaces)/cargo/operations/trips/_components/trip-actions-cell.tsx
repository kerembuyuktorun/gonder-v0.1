import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Ban, ChevronDown, Eye, Printer, CheckCircle2 } from "lucide-react"
import type { TripRecord } from "../_types"

interface Props {
  row: TripRecord
  onComplete: (row: TripRecord) => void
  onCancel: (row: TripRecord) => void
}

export function TripActionsCell({ row, onComplete, onCancel }: Props) {
  return (
    <div className="flex justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-medium">
            İşlemler
            <ChevronDown className="ml-1 size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>{`Sefer #${row.tripNo} İşlemleri`}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href={`/arf/cargo/operations/trips/${row.id}`}>
              <Eye className="mr-2 size-4" />
              Detay Görüntüle
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => window.alert(`Araç Barkodu: ${row.tripNo}`)}>
            <Printer className="mr-2 size-4" />
            Araç Barkodu Yazdır
          </DropdownMenuItem>

          <DropdownMenuItem disabled={row.status !== "on_road"} onSelect={() => onComplete(row)}>
            <CheckCircle2 className="mr-2 size-4" />
            Tamamla
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-rose-700 focus:text-rose-700"
            disabled={row.status === "completed" || row.status === "cancelled"}
            onSelect={() => onCancel(row)}
          >
            <Ban className="mr-2 size-4" />
            İptal Et
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
