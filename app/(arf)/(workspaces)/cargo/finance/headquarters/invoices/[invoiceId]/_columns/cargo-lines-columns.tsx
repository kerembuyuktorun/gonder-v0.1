"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { formatDateTime, formatMoney, getCollectionStatusLabel } from "../../_lib/invoice-presenters"
import type { InvoiceCargoSnapshot } from "../../_types/invoice"

function formatPercent(value?: number): string {
  if (typeof value !== "number") return "%20"
  return `%${value}`
}

export function getCargoLinesColumns(): ColumnDef<InvoiceCargoSnapshot>[] {
  return [
    {
      accessorKey: "trackingNo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Takip No" />,
      cell: ({ row }) => <span className="font-mono text-xs font-medium text-slate-800">{row.original.trackingNo}</span>,
    },
    {
      accessorKey: "senderCustomer",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderici Müşteri" />,
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.senderCustomer ?? "-"}</span>,
    },
    {
      accessorKey: "senderBranch",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderici Şube" />,
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.senderBranch ?? "-"}</span>,
    },
    {
      accessorKey: "receiverBranch",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı Şube" />,
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.receiverBranch ?? "-"}</span>,
    },
    {
      accessorKey: "receiverCustomer",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı Müşteri" />,
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.receiverCustomer ?? "-"}</span>,
    },
    {
      accessorKey: "receiverPhone",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı Telefon" />,
      cell: ({ row }) => <span className="font-mono text-xs text-slate-600">{row.original.receiverPhone ?? "-"}</span>,
    },
    {
      accessorKey: "paymentType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ödeme Türü" />,
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.paymentType ?? "-"}</span>,
    },
    {
      accessorKey: "invoiceType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fatura Türü" />,
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.invoiceType ?? "Standart"}</span>,
    },
    {
      accessorKey: "baseAmount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Matrah (Fiyat)" />,
      cell: ({ row }) => <span className="text-xs font-medium text-slate-800">{formatMoney(row.original.baseAmount ?? 0)}</span>,
    },
    {
      accessorKey: "vat",
      header: ({ column }) => <DataTableColumnHeader column={column} title="KDV (%20)" />,
      cell: ({ row }) => <span className="text-xs text-slate-700">{formatPercent(row.original.vat)}</span>,
    },
    {
      id: "lineTotal",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam" />,
      cell: ({ row }) => {
        const baseAmount = row.original.baseAmount ?? row.original.amount ?? 0
        const vat = row.original.vat ?? 0
        return <span className="text-xs font-semibold text-slate-900">{formatMoney(baseAmount + vat)}</span>
      },
    },
    {
      accessorKey: "pieceCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="T. Adet" />,
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.pieceCount}</span>,
    },
    {
      accessorKey: "volumetricWeight",
      header: ({ column }) => <DataTableColumnHeader column={column} title="T. Desi" />,
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.volumetricWeight ?? "-"}</span>,
    },
    {
      accessorKey: "pieceList",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Parça Listesi" />,
      cell: ({ row }) => <span className="text-xs text-slate-600">{row.original.pieceList ?? "-"}</span>,
    },
    {
      accessorKey: "dispatchNo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="İrsaliye No" />,
      cell: ({ row }) => <span className="font-mono text-xs text-slate-600">{row.original.dispatchNo ?? "-"}</span>,
    },
    {
      accessorKey: "atfNo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ATF No" />,
      cell: ({ row }) => <span className="font-mono text-xs text-slate-600">{row.original.atfNo ?? "-"}</span>,
    },
    {
      accessorKey: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturulma Zamanı" />,
      cell: ({ row }) => <span className="text-xs text-slate-600">{formatDateTime(row.original.date)}</span>,
    },
    {
      accessorKey: "lastActionAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Son İşlem Zamanı" />,
      cell: ({ row }) => <span className="text-xs text-slate-600">{formatDateTime(row.original.lastActionAt ?? "")}</span>,
    },
    {
      accessorKey: "arrivalAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Varış Zamanı" />,
      cell: ({ row }) => <span className="text-xs text-slate-600">{formatDateTime(row.original.arrivalAt ?? "")}</span>,
    },
    {
      accessorKey: "deliveryAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Teslimat Zamanı" />,
      cell: ({ row }) => <span className="text-xs text-slate-600">{formatDateTime(row.original.deliveryAt ?? "")}</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kargo Durumu" />,
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.status || "-"}</span>,
    },
    {
      accessorKey: "pieceStatus",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Parça Durumu" />,
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.pieceStatus ?? "-"}</span>,
    },
    {
      accessorKey: "invoiceStatus",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fatura Durumu" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 text-xs">
          {row.original.invoiceStatus === "kesildi" ? "Kesildi" : "Kesilmedi"}
        </Badge>
      ),
    },
    {
      accessorKey: "collectionStatus",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tahsilat Durumu" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 text-xs">
          {getCollectionStatusLabel(row.original.collectionStatus)}
        </Badge>
      ),
    },
    {
      accessorKey: "createdBy",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturan" />,
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.createdBy ?? "-"}</span>,
    },
  ]
}