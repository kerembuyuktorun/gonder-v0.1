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
import { CheckCircle2, ChevronDown, Link2 } from "lucide-react"
import type { BankAccountTransaction } from "../../_types"

function formatMoney(value: number, currency: BankAccountTransaction["currency"]): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const DEFAULT_PARTY_NAME = "ARF Lojistik A.Ş."
const DEFAULT_PARTY_IBAN = "TR090001061234567890123456"

function matchStatusLabel(status: BankAccountTransaction["matchStatus"]): string {
  if (status === "auto_matched") return "Otomatik Eşleşti"
  if (status === "manual_matched") return "Manuel Eşleşti"
  return "Eşleşme Bekliyor"
}

function matchStatusClass(status: BankAccountTransaction["matchStatus"]): string {
  if (status === "auto_matched") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (status === "manual_matched") return "border-blue-200 bg-blue-50 text-blue-700"
  return "border-amber-200 bg-amber-50 text-amber-700"
}

function matchSourceLabel(source?: BankAccountTransaction["matchSource"]): string {
  if (source === "branch_transfer") return "Şube Transferi"
  if (source === "customer_invoice") return "Sözleşmeli Fatura"
  if (source === "supplier_payment") return "Tedarikçi Ödemesi"
  return "-"
}

export function getTransactionsColumns(
  onManualMatch?: (row: BankAccountTransaction) => void,
  onShowMatchDetail?: (row: BankAccountTransaction) => void,
): ColumnDef<BankAccountTransaction>[] {
  return [
    {
      accessorKey: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Zaman" />,
      cell: ({ row }) => new Date(row.original.date).toLocaleString("tr-TR", { 
        day: "2-digit", 
        month: "2-digit", 
        year: "numeric", 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
    },
    {
      accessorKey: "senderName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderen" />,
      cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.senderName ?? DEFAULT_PARTY_NAME}</span>,
    },
    {
      accessorKey: "senderIban",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderen IBAN" />,
      cell: ({ row }) => <span className="font-mono text-xs text-slate-600">{(row.original.senderIban ?? DEFAULT_PARTY_IBAN).replace(/(.{4})/g, "$1 ").trim()}</span>,
    },
    {
      id: "recipientName",
      accessorFn: (row) => row.recipientName ?? DEFAULT_PARTY_NAME,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı" />,
      cell: ({ row }) => (
        <span className="text-sm text-slate-700">
          {row.original.recipientName ?? DEFAULT_PARTY_NAME}
        </span>
      ),
    },
    {
      id: "recipientIban",
      accessorFn: (row) => row.recipientIban ?? DEFAULT_PARTY_IBAN,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı IBAN" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-slate-600">
          {(row.original.recipientIban ?? DEFAULT_PARTY_IBAN).replace(/(.{4})/g, "$1 ").trim()}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Açıklama" />,
      cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.description}</span>,
    },
    {
      accessorKey: "referenceNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Referans No" />,
      cell: ({ row }) => <span className="font-mono text-xs text-slate-600">{row.original.referenceNumber ?? "—"}</span>,
    },
    {
      accessorKey: "direction",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Yön" />,
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn(
            "border",
            row.original.direction === "credit"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700",
          )}
        >
          {row.original.direction === "credit" ? "Giriş" : "Çıkış"}
        </Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tutar" />,
      cell: ({ row }) => (
        <span className={cn("font-medium", row.original.direction === "credit" ? "text-emerald-700" : "text-red-700")}>
          {formatMoney(row.original.amount, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: "balanceAfter",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Bakiye" />,
      cell: ({ row }) => <span className="font-medium text-slate-900">{formatMoney(row.original.balanceAfter, row.original.currency)}</span>,
    },
    {
      id: "matching",
      accessorFn: (row) => row.matchStatus,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Eşleştirme" />,
      cell: ({ row }) => (
        <div className="space-y-1">
          <Badge variant="outline" className={cn("border", matchStatusClass(row.original.matchStatus))}>
            {matchStatusLabel(row.original.matchStatus)}
          </Badge>
          {row.original.matchedEntityLabel && (
            <p className="text-xs text-slate-500">{row.original.matchedEntityLabel}</p>
          )}
        </div>
      ),
    },
    {
      id: "matchSource",
      accessorFn: (row) => row.matchSource ?? "-",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Eşleşme Kaynağı" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
          {matchSourceLabel(row.original.matchSource)}
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
              <Button variant="outline" size="sm" className="h-8 rounded-lg px-2.5 text-xs font-medium">
                İşlemler
                <ChevronDown className="ml-1 size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {row.original.matchStatus === "unmatched" && onManualMatch && (
                <DropdownMenuItem onSelect={() => onManualMatch(row.original)}>
                  <Link2 className="mr-2 size-4" />
                  Manuel Eşleştir
                </DropdownMenuItem>
              )}
              {row.original.matchStatus !== "unmatched" && onShowMatchDetail ? (
                <DropdownMenuItem onSelect={() => onShowMatchDetail(row.original)}>
                  <CheckCircle2 className="mr-2 size-4" />
                  Eşleşme Detayı
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled>
                  <CheckCircle2 className="mr-2 size-4" />
                  Eşleşme Detayı
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]
}
