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
import { ChevronDown, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TmEntitlementRow } from "../_types"

function formatMoney(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatCommissionValue(row: TmEntitlementRow): string {
  if (row.commissionModel === "per_piece") {
    return `${row.commissionValue}₺/parça`
  }
  return `%${(row.commissionValue * 100).toFixed(0)}`
}

export function getTmEntitlementColumns(): ColumnDef<TmEntitlementRow>[] {
  return [
    {
      accessorKey: "transferCenterName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Transfer Merkezi" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-900">{row.original.transferCenterName}</p>
          <p className="text-xs text-slate-500">{row.original.transferCenterCode}</p>
        </div>
      ),
    },
    {
      accessorKey: "commissionModel",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Hakediş Tipi" />,
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn(
            "border",
            row.original.commissionModel === "per_piece"
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-purple-200 bg-purple-50 text-purple-700",
          )}
        >
          {row.original.commissionModel === "per_piece" ? "Parça Başı" : "Yüzdelik"}
        </Badge>
      ),
    },
    {
      accessorKey: "commissionValue",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Hakediş Değeri" />,
      cell: ({ row }) => <span className="text-sm font-medium text-slate-700">{formatCommissionValue(row.original)}</span>,
    },
    {
      accessorKey: "toplamParcaAdedi",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Parça Adedi" />,
      cell: ({ row }) => {
        if (row.original.commissionModel !== "per_piece") return <span className="text-slate-400">—</span>
        return <span className="text-sm text-slate-700">{row.original.toplamParcaAdedi.toLocaleString("tr-TR")}</span>
      },
    },
    {
      accessorKey: "toplamKargoBedeli",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kargo Toplamı (KDV Hariç)" />,
      cell: ({ row }) => {
        if (row.original.commissionModel !== "percentage") return <span className="text-slate-400">—</span>
        return <span className="text-sm text-slate-700">{formatMoney(row.original.toplamKargoBedeli)}</span>
      },
    },
    {
      id: "parcaBasiToplam",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Parça Başı Toplam (KDV Hariç)" />,
      cell: ({ row }) => {
        const r = row.original
        if (r.commissionModel !== "per_piece") return <span className="text-slate-400">—</span>
        const val = r.toplamParcaAdedi * r.commissionValue
        return <span className="text-slate-800">{formatMoney(val)}</span>
      },
    },
    {
      id: "yuzdelikToplam",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Yüzdelik Toplam (KDV Hariç)" />,
      cell: ({ row }) => {
        const r = row.original
        if (r.commissionModel !== "percentage") return <span className="text-slate-400">—</span>
        const val = r.toplamKargoBedeli * r.commissionValue
        return <span className="text-slate-800">{formatMoney(val)}</span>
      },
    },
    {
      accessorKey: "iptalEdilen",
      header: ({ column }) => <DataTableColumnHeader column={column} title="İptal Edilen" />,
      cell: ({ row }) => {
        const r = row.original
        if (r.iptalEdilen === 0) return <span className="text-slate-400">0</span>
        return (
          <span className="font-medium text-red-600">
            {r.commissionModel === "per_piece"
              ? `${r.iptalEdilen.toLocaleString("tr-TR")} parça`
              : formatMoney(r.iptalEdilen)}
          </span>
        )
      },
    },
    {
      id: "netHakedis",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Net Hakediş (KDV Hariç)" />,
      cell: ({ row }) => {
        const r = row.original
        const net =
          r.commissionModel === "percentage"
            ? (r.toplamKargoBedeli - r.iptalEdilen) * r.commissionValue
            : (r.toplamParcaAdedi - r.iptalEdilen) * r.commissionValue
        return <span className="font-semibold text-emerald-700">{formatMoney(net)}</span>
      },
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
              <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-medium">
                İşlemler
                <ChevronDown className="ml-1 size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{`${row.original.transferCenterName} İşlemler:`}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  void row.original.transferCenterId
                }}
              >
                <Eye className="mr-2 size-4" />
                Detay Görüntüle
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]
}
