"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { AlertTriangle, Star } from "lucide-react"
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
import { ChevronDown, Eye, Power, PowerOff } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SupplierRecord } from "../_types"

export const SUPPLIER_TYPE_LABELS: Record<SupplierRecord["supplierType"], string> = {
  ozmal: "Özmal",
  logistics: "Lojistik",
  truck_owner: "Kamyon Sahibi",
  warehouse: "Ambar",
}

export const CONTRACT_TYPE_LABELS: Record<SupplierRecord["contractType"], string> = {
  fixed_salary: "Sabit Maaşlı",
  per_trip: "Sefer Başı",
  per_desi: "Desi Başı",
  commission: "Komisyon",
}

const SUPPLIER_TYPE_BADGE_CLASSES: Record<SupplierRecord["supplierType"], string> = {
  ozmal: "border-slate-300 bg-slate-100 text-slate-700",
  logistics: "border-blue-500/25 bg-blue-500/10 text-blue-700",
  truck_owner: "border-amber-500/25 bg-amber-500/10 text-amber-700",
  warehouse: "border-slate-500/25 bg-slate-500/10 text-slate-700",
}

const CONTRACT_TYPE_BADGE_CLASSES: Record<SupplierRecord["contractType"], string> = {
  fixed_salary: "border-violet-300 bg-violet-50 text-violet-700",
  per_trip: "border-blue-300 bg-blue-50 text-blue-700",
  per_desi: "border-cyan-300 bg-cyan-50 text-cyan-700",
  commission: "border-amber-300 bg-amber-50 text-amber-700",
}

interface Options {
  onToggleStatus: (row: SupplierRecord) => void
}

export function getSuppliersColumns({ onToggleStatus }: Options): Array<ColumnDef<SupplierRecord>> {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Firma Adı" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          {row.original.supplierType === "ozmal" && (
            <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
          )}
          <Link
            href={`/arf/cargo/operations/suppliers/${row.original.id}`}
            className={cn(
              "text-sm underline decoration-slate-300 underline-offset-4 transition-all hover:decoration-slate-600",
              row.original.supplierType === "ozmal" ? "font-semibold text-slate-900" : "text-slate-800"
            )}
          >
            {row.original.name}
          </Link>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "supplierType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tedarikçi Tipi" />,
      cell: ({ row }) => (
        <Badge variant="outline" className={cn("text-xs", SUPPLIER_TYPE_BADGE_CLASSES[row.original.supplierType])}>
          {SUPPLIER_TYPE_LABELS[row.original.supplierType]}
        </Badge>
      ),
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      accessorKey: "contractType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Anlaşma Tipi" />,
      cell: ({ row }) => (
        <Badge variant="outline" className={cn("text-xs", CONTRACT_TYPE_BADGE_CLASSES[row.original.contractType])}>
          {CONTRACT_TYPE_LABELS[row.original.contractType]}
        </Badge>
      ),
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      accessorKey: "contactPerson",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Yetkili Kişi" />,
      cell: ({ row }) => (
        <span className="text-slate-700">{row.original.contactPerson ?? "-"}</span>
      ),
    },
    {
      accessorKey: "contactPhone",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Telefon" />,
      cell: ({ row }) => (
        <span className="font-mono text-sm text-slate-700">{row.original.contactPhone ?? "-"}</span>
      ),
    },
    {
      accessorKey: "city",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Şehir" />,
      cell: ({ row }) => (
        <span className="text-slate-700">{row.original.city ?? "-"}</span>
      ),
    },
    {
      accessorKey: "vehicleCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Araç Sayısı" />,
      cell: ({ row }) => (
        <span className="text-slate-700">{row.original.vehicleCount}</span>
      ),
    },
    {
      accessorKey: "driverCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sürücü Sayısı" />,
      cell: ({ row }) => (
        <span className="text-slate-700">{row.original.driverCount}</span>
      ),
    },
    {
      accessorKey: "activeTripsCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Aktif Sefer" />,
      cell: ({ row }) => (
        <span className="text-slate-700">{row.original.activeTripsCount}</span>
      ),
    },
    {
      accessorKey: "totalTripsCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam Sefer" />,
      cell: ({ row }) => (
        <span className="text-slate-700">{row.original.totalTripsCount}</span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
      cell: ({ row }) => {
        const isActive = row.original.status === "active"
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              isActive
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-rose-300 bg-rose-50 text-rose-700"
            )}
          >
            {isActive ? "Aktif" : "Pasif"}
          </Badge>
        )
      },
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      accessorKey: "hasExpiringDocuments",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Dosya Durumu" />,
      cell: ({ row }) =>
        row.original.hasExpiringDocuments ? (
          <span title="Süresi dolan veya yakında dolacak evrak mevcut">
            <AlertTriangle className="size-4 text-amber-500" />
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      id: "actions",
      header: undefined,
      cell: ({ row }) => {
        const supplier = row.original
        const isOzmal = !supplier.isDeactivatable
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 rounded-full px-4 text-xs">
                  İşlemler
                  <ChevronDown className="ml-1.5 size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{`${supplier.name} İşlemleri`}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/arf/cargo/operations/suppliers/${supplier.id}`}>
                    <Eye className="mr-2 size-4" />
                    Detay Görüntüle
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onToggleStatus(supplier)}
                  disabled={isOzmal}
                  className={supplier.status === "active" ? "text-amber-600" : "text-emerald-600"}
                >
                  {supplier.status === "active" ? (
                    <PowerOff className="mr-2 size-4" />
                  ) : (
                    <Power className="mr-2 size-4" />
                  )}
                  {supplier.status === "active" ? "Pasif Yap" : "Aktif Yap"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
