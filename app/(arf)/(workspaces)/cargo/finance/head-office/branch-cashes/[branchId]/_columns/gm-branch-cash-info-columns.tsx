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
import type { BranchCashItem, CashItemStatus, PaymentType } from "../../../../branch-transfer-center/branch-cash/_types"

const paymentTypeLabels: Record<PaymentType, string> = {
  alici_odemeli: "Alıcı Ödemeli",
  pesin: "Peşin",
}

const statusConfig: Record<CashItemStatus, { label: string; className: string }> = {
  teslim_edildi: {
    label: "Teslim Edildi",
    className: "bg-green-500/10 text-green-700 border-green-500/20",
  },
  bekliyor: {
    label: "Bekliyor",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  iptal: {
    label: "İptal",
    className: "bg-red-500/10 text-red-600 border-red-500/20",
  },
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(isoString?: string): string {
  if (!isoString) return "-"
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(isoString))
}

export function getGmBranchCashInfoColumns(): ColumnDef<BranchCashItem>[] {
  return [
    {
      accessorKey: "trackingNo",
      size: 150,
      minSize: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Takip No" />,
      cell: ({ row }) => (
        <Link
          href={`/arf/cargo/shipments/${row.original.shipmentId}`}
          className="font-mono text-sm font-medium text-slate-900 transition-colors hover:text-primary hover:underline"
        >
          {row.original.trackingNo}
        </Link>
      ),
    },
    {
      accessorKey: "paymentType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ödeme Türü" />,
      cell: ({ row }) => <span className="text-slate-700">{paymentTypeLabels[row.original.paymentType]}</span>,
    },
    {
      accessorKey: "senderBranch",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderici Şube" />,
      cell: ({ row }) => <span className="text-slate-700">{row.original.senderBranch}</span>,
    },
    {
      accessorKey: "receiverBranch",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı Şube" />,
      cell: ({ row }) => <span className="text-slate-700">{row.original.receiverBranch}</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kargo Durumu" />,
      cell: ({ row }) => {
        const config = statusConfig[row.original.status]
        return (
          <Badge variant="outline" className={config.className}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturulma Zamanı" />,
      cell: ({ row }) => <span className="text-slate-600">{formatDate(row.original.createdAt)}</span>,
    },
    {
      accessorKey: "deliveredAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Teslimat Zamanı" />,
      cell: ({ row }) => <span className="text-slate-600">{formatDate(row.original.deliveredAt)}</span>,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam" />,
      cell: ({ row }) => <span className="font-semibold tabular-nums">{formatMoney(row.original.amount)}</span>,
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
              <DropdownMenuLabel>{`Takip No ${row.original.trackingNo} İşlemler:`}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/arf/cargo/shipments/${row.original.shipmentId}`}>
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
