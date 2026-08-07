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
import Link from "next/link"
import { ChevronDown, Eye } from "lucide-react"
import type { BranchRiskLevel, GmBranchCashRow } from "../_types"

function formatMoney(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(date?: string): string {
  if (!date) return "-"
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date))
}

function riskClass(level: BranchRiskLevel): string {
  if (level === "kritik") return "bg-red-50 text-red-700 border-red-200"
  if (level === "uyari") return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-emerald-50 text-emerald-700 border-emerald-200"
}

function riskLabel(level: BranchRiskLevel): string {
  if (level === "kritik") return "Kritik"
  if (level === "uyari") return "Uyarı"
  return "Normal"
}

export function getGmBranchCashesColumns(): ColumnDef<GmBranchCashRow>[] {
  return [
    {
      accessorKey: "branchName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Şube" />,
      cell: ({ row }) => (
        <p className="font-medium text-slate-900">{row.original.branchName}</p>
      ),
    },
    {
      accessorKey: "toplamAlacak",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam Alacak" />,
      cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.toplamAlacak)}</span>,
    },
    {
      accessorKey: "bekleyenTransferAdet",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Bekleyen Transfer" />,
      cell: ({ row }) => <span className="font-medium">{row.original.bekleyenTransferAdet}</span>,
    },
    {
      accessorKey: "bekleyenTransferToplami",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Bekleyen Transfer Toplamı" />,
      cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.bekleyenTransferToplami)}</span>,
    },
    {
      accessorKey: "sonTransferTarihi",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Son Transfer Tarihi" />,
      cell: ({ row }) => <span className="text-slate-600">{formatDate(row.original.sonTransferTarihi)}</span>,
    },
    {
      accessorKey: "riskSeviyesi",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Risk" />,
      cell: ({ row }) => (
        <Badge variant="outline" className={riskClass(row.original.riskSeviyesi)}>
          {riskLabel(row.original.riskSeviyesi)}
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
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{`${row.original.branchName} İşlemler:`}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/arf/cargo/finance/head-office/branch-cashes/${row.original.branchId}`}>
                  <Eye className="mr-2 size-4" />
                  Detay Gör
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]
}
