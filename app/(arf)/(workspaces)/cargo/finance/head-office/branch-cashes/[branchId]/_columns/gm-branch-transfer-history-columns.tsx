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
import { cn } from "@/lib/utils"
import { CheckCircle2, ChevronDown, Eye } from "lucide-react"
import type { GmBranchCashTransferHistoryRow, GmTransferStatus, GmValidationStatus } from "../../_types"

function formatMoney(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDateTime(date?: string): string {
  if (!date) return "-"

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

function transferStatusLabel(status: GmTransferStatus): string {
  if (status === "onaylandi") return "Onaylandı"
  if (status === "reddedildi") return "Reddedildi"
  if (status === "yarida_birakildi") return "Yarıda Bırakılan (Reddedildi)"
  if (status === "dogrulama_hatasi") return "L1-L2-L3 Hatası (Reddedildi)"
  return "Beklemede"
}

function transferStatusClass(status: GmTransferStatus): string {
  if (status === "onaylandi") return "bg-emerald-50 border-emerald-200 text-emerald-700"
  if (status === "reddedildi") return "bg-red-50 border-red-200 text-red-700"
  if (status === "yarida_birakildi") return "bg-red-50 border-red-200 text-red-700"
  if (status === "dogrulama_hatasi") return "bg-red-50 border-red-200 text-red-700"
  return "bg-amber-50 border-amber-200 text-amber-700"
}

function validationLabel(status: GmValidationStatus): string {
  if (status === "ok") return "OK"
  if (status === "hata") return "RED"
  return "-"
}

function validationClass(status: GmValidationStatus): string {
  if (status === "ok") return "text-emerald-700"
  if (status === "hata") return "text-red-600"
  return "text-slate-400"
}

export function getGmBranchTransferHistoryColumns(
  onViewDetail: (row: GmBranchCashTransferHistoryRow) => void,
  onManualApprove: (row: GmBranchCashTransferHistoryRow) => void,
): ColumnDef<GmBranchCashTransferHistoryRow>[] {
  return [
    {
      accessorKey: "transferNo",
      size: 170,
      minSize: 150,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Transfer ID" />,
      cell: ({ row }) => <span className="font-medium text-slate-900">{row.original.transferNo}</span>,
    },
    {
      accessorKey: "branchName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Şube" />,
      cell: ({ row }) => <span className="text-slate-800">{row.original.branchName}</span>,
    },
    {
      accessorKey: "iban",
      header: ({ column }) => <DataTableColumnHeader column={column} title="IBAN" />,
      cell: ({ row }) => <span className="text-slate-700">{row.original.iban}</span>,
    },
    {
      accessorKey: "sorguNo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Referans No" />,
      cell: ({ row }) => <span className="font-medium text-slate-700">{row.original.sorguNo}</span>,
    },
    {
      accessorKey: "transferTutari",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tutar" />,
      cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.transferTutari)}</span>,
    },
    {
      accessorKey: "l1",
      header: ({ column }) => <DataTableColumnHeader column={column} title="L1" />,
      cell: ({ row }) => <span className={cn("font-medium", validationClass(row.original.l1))}>{validationLabel(row.original.l1)}</span>,
    },
    {
      accessorKey: "l2",
      header: ({ column }) => <DataTableColumnHeader column={column} title="L2" />,
      cell: ({ row }) => <span className={cn("font-medium", validationClass(row.original.l2))}>{validationLabel(row.original.l2)}</span>,
    },
    {
      accessorKey: "l3",
      header: ({ column }) => <DataTableColumnHeader column={column} title="L3" />,
      cell: ({ row }) => <span className={cn("font-medium", validationClass(row.original.l3))}>{validationLabel(row.original.l3)}</span>,
    },
    {
      accessorKey: "durum",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
      cell: ({ row }) => (
        <Badge variant="outline" className={cn("font-medium", transferStatusClass(row.original.durum))}>
          {transferStatusLabel(row.original.durum)}
        </Badge>
      ),
    },
    {
      accessorKey: "talepTarihi",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Zaman" />,
      cell: ({ row }) => <span className="text-slate-700">{formatDateTime(row.original.talepTarihi)}</span>,
    },
    {
      accessorKey: "olusturanKullanici",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturan" />,
      cell: ({ row }) => <span className="text-slate-700">{row.original.olusturanKullanici}</span>,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">İşlemler</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-center">
          {(() => {
            const canManualApprove = row.original.durum === "beklemede"

            return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-medium">
                İşlemler
                <ChevronDown className="ml-1 size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{`${row.original.transferNo} İşlemler:`}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewDetail(row.original)}>
                <Eye className="mr-2 size-4" />
                Detay Görüntüle
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!canManualApprove}
                onClick={() => {
                  if (canManualApprove) {
                    onManualApprove(row.original)
                  }
                }}
              >
                <CheckCircle2 className="mr-2 size-4" />
                Manuel Onay
              </DropdownMenuItem>
              {!canManualApprove && (
                <DropdownMenuItem disabled className="text-xs text-slate-400">
                  Sadece beklemede kayıtlar manuel onaylanabilir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
            )
          })()}
        </div>
      ),
    },
  ]
}
