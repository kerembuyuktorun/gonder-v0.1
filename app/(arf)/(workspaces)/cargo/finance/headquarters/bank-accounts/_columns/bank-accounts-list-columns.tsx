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
import type { BankAccountRecord } from "../_types"
import { ChevronDown, Copy, Eye, Pencil, Power, PowerOff } from "lucide-react"

function formatMoney(value: number, currency: BankAccountRecord["currency"]): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDateTime(value?: string): string {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function getStatusBadgeClass(status: BankAccountRecord["status"]): string {
  return status === "active"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-red-200 bg-red-50 text-red-700"
}

function getIntegrationBadgeClass(status: BankAccountRecord["integrationStatus"]): string {
  return status === "active"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-red-200 bg-red-50 text-red-700"
}

function getAccountTypeBadgeClass(type: BankAccountRecord["accountType"]): string {
  return type === "collection"
    ? "border-sky-200 bg-sky-50 text-sky-700"
    : "border-orange-200 bg-orange-50 text-orange-700"
}

export function getBankAccountsListColumns(
  onToggleStatus: (row: BankAccountRecord) => void,
): ColumnDef<BankAccountRecord>[] {
  return [
    {
      id: "bank",
      accessorFn: (row) => `${row.bankName} ${row.branchName}`,
      enableSorting: true,
      enableColumnFilter: true,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Banka İsmi ve Şubesi" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-900">{row.original.bankName}</p>
          <p className="text-xs text-slate-500">{row.original.branchName}</p>
        </div>
      ),
    },
    {
      id: "label",
      accessorFn: (row) => row.label,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Hesap İsmi" />,
      cell: ({ row }) => <p className="font-medium text-slate-900">{row.original.label}</p>,
    },
    {
      accessorKey: "accountType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Hesap Türü" />,
      cell: ({ row }) => (
        <Badge variant="outline" className={cn("border", getAccountTypeBadgeClass(row.original.accountType))}>
          {row.original.accountType === "collection" ? "Tahsilat" : "Gider / Ödeme"}
        </Badge>
      ),
    },
    {
      id: "ibanAccountHolder",
      accessorFn: (row) => `${row.iban} ${row.accountHolder}`,
      header: ({ column }) => <DataTableColumnHeader column={column} title="IBAN ve Hesap Sahibi" />,
      cell: ({ row }) => (
        <div>
          <p className="font-mono text-sm text-slate-700">{row.original.iban.replace(/(.{4})/g, "$1 ").trim()}</p>
          <p className="text-xs text-slate-500">{row.original.accountHolder}</p>
        </div>
      ),
    },
    {
      accessorKey: "balance",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Bakiye" />,
      cell: ({ row }) => <span className="font-medium text-slate-900">{formatMoney(row.original.balance, row.original.currency)}</span>,
    },
    {
      accessorKey: "integrationStatus",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Entegrasyon" />,
      cell: ({ row }) => (
        <Badge variant="outline" className={cn("border", getIntegrationBadgeClass(row.original.integrationStatus))}>
          {row.original.integrationStatus === "active" ? "Aktif" : "Pasif"}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
      cell: ({ row }) => (
        <Badge variant="outline" className={cn("border", getStatusBadgeClass(row.original.status))}>
          {row.original.status === "active" ? "Aktif" : "Pasif"}
        </Badge>
      ),
    },
    {
      accessorKey: "lastDataSyncAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Son Veri Güncelleme" />,
      cell: ({ row }) => <span className="text-sm text-slate-700">{formatDateTime(row.original.lastDataSyncAt)}</span>,
    },
    {
      id: "actions",
      header: () => <span>İşlemler</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 rounded-lg px-2.5 text-xs">
                İşlemler
                <ChevronDown className="ml-1 size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <Link href={`/arf/cargo/finance/headquarters/bank-accounts/${row.original.id}`}>
                  <Eye className="mr-2 size-4" />
                  Detay Görüntüle
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void navigator.clipboard?.writeText(row.original.iban)}>
                <Copy className="mr-2 size-4" />
                IBAN Kopyala
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onToggleStatus(row.original)}>
                {row.original.status === "active" ? (
                  <PowerOff className="mr-2 size-4" />
                ) : (
                  <Power className="mr-2 size-4" />
                )}
                {row.original.status === "active" ? "Pasif Yap" : "Aktif Yap"}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/arf/cargo/finance/headquarters/bank-accounts/${row.original.id}?edit=1`}>
                  <Pencil className="mr-2 size-4" />
                  Düzenle
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]
}
