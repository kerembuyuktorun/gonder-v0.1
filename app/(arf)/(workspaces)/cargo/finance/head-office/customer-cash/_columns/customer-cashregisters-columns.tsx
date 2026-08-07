"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
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
import type { CashregisterCurrency, CustomerCashregisterRecord } from "../_types"

function formatMoney(value: number, currency: CashregisterCurrency): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function riskClassName(level: CustomerCashregisterRecord["riskLevel"]): string {
  if (level === "critical") return "border-red-200 bg-red-50 text-red-700"
  if (level === "warning") return "border-amber-200 bg-amber-50 text-amber-700"
  return "border-emerald-200 bg-emerald-50 text-emerald-700"
}

function riskLabel(level: CustomerCashregisterRecord["riskLevel"]): string {
  if (level === "critical") return "Kritik"
  if (level === "warning") return "Takip"
  return "Normal"
}

export function getCustomerCashregistersColumns(): ColumnDef<CustomerCashregisterRecord>[] {
  return [
    {
      accessorKey: "customerName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Müşteri" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-900">{row.original.customerName}</p>
          <p className="text-xs text-slate-500">VKN: {row.original.vkn || "-"}</p>
        </div>
      ),
    },
    {
      accessorKey: "contractType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sözleşme Vade Günü" />,
      cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.vadeGunu} gün</span>,
    },
    {
      accessorKey: "toplamAlacak",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam Alacak" />,
      cell: ({ row }) => <span className="font-medium text-slate-900">{formatMoney(row.original.toplamAlacak, row.original.currency)}</span>,
    },
    {
      accessorKey: "aciktaTutar",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Açıktaki Alacak" />,
      cell: ({ row }) => (
        <span className={cn("font-medium", row.original.aciktaTutar > 0 ? "text-amber-700" : "text-slate-500")}>
          {formatMoney(row.original.aciktaTutar, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: "faturalanmisTutar",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Faturalanmış Alacak" />,
      cell: ({ row }) => <span className="text-slate-800">{formatMoney(row.original.faturalanmisTutar, row.original.currency)}</span>,
    },
    {
      accessorKey: "tahsilEdilen",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Faturadan Tahsil Edilen" />,
      cell: ({ row }) => <span className="text-emerald-700">{formatMoney(row.original.tahsilEdilen, row.original.currency)}</span>,
    },
    {
      accessorKey: "kalanBakiye",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Faturadan Kalan Bakiye" />,
      cell: ({ row }) => (
        <span className={cn("font-medium", row.original.kalanBakiye > 0 ? "text-rose-600" : "text-slate-500")}>
          {formatMoney(row.original.kalanBakiye, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: "gecikmisBakiye",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Gecikmiş Fatura Tutarı" />,
      cell: ({ row }) => (
        <span className={cn("font-medium", row.original.gecikmisBakiye > 0 ? "text-red-600" : "text-slate-500")}>
          {formatMoney(row.original.gecikmisBakiye, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: "gecikenGunSayisi",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Geciken Gün Sayısı" />,
      cell: ({ row }) => (
        <span className={cn("font-medium", row.original.gecikenGunSayisi > 0 ? "text-red-600" : "text-slate-500")}>
          {row.original.gecikenGunSayisi}
        </span>
      ),
    },
    {
      accessorKey: "riskLevel",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Risk" />,
      cell: ({ row }) => (
        <Badge variant="outline" className={cn("border", riskClassName(row.original.riskLevel))}>
          {riskLabel(row.original.riskLevel)}
        </Badge>
      ),
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
              <DropdownMenuLabel>{`${row.original.customerName} İşlemler:`}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/arf/cargo/marketing/customers/${row.original.customerId}?tab=finance`}>
                  <Eye className="mr-2 size-4" />
                  Detay Görüntüle
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]
}
