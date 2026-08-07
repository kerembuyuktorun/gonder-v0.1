"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatMoney } from "../../_lib/invoice-presenters"
import type { InvoiceTransportSnapshot } from "../../_types/invoice"

const gonderiTipiBadge: Record<string, { label: string; className: string }> = {
  FTL: { label: "FTL", className: "bg-violet-500/10 text-violet-600 border-violet-500/20" },
  LTL: { label: "LTL", className: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
}

export function getTransportLinesColumns(): ColumnDef<InvoiceTransportSnapshot>[] {
  return [
    {
      accessorKey: "tasimaNo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Taşıma No" />,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium text-slate-800">{row.original.tasimaNo}</span>
      ),
    },
    {
      accessorKey: "yuklemeTarihi",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Yükleme Tarihi" />,
      cell: ({ row }) => (
        <span className="text-xs text-slate-700">{formatDate(row.original.yuklemeTarihi)}</span>
      ),
    },
    {
      accessorKey: "gonderiTipi",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderi Tipi" />,
      cell: ({ row }) => {
        const cfg = gonderiTipiBadge[row.original.gonderiTipi]
        return cfg ? (
          <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
        ) : (
          <span className="text-xs text-slate-700">{row.original.gonderiTipi}</span>
        )
      },
    },
    {
      accessorKey: "gondericiFirma",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderici" />,
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.gondericiFirma}</span>,
    },
    {
      accessorKey: "aliciFirma",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı" />,
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.aliciFirma}</span>,
    },
    {
      accessorKey: "cikisAdres",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Çıkış Adresi" />,
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.cikisAdres}</span>,
    },
    {
      accessorKey: "varisAdres",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Varış Adresi" />,
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.varisAdres}</span>,
    },
    {
      accessorKey: "tasimaciAdi",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Taşımacı" />,
      cell: ({ row }) => (
        <span className="text-xs text-slate-700">{row.original.tasimaciAdi ?? "—"}</span>
      ),
    },
    {
      accessorKey: "satisFiyat",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Satış Fiyatı" />,
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-900">{formatMoney(row.original.satisFiyat)}</span>
      ),
    },
  ]
}
