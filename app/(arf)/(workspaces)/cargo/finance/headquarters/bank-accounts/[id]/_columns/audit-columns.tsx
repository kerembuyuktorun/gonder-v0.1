"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import type { BankAccountAuditLog } from "../../_types"

const actionLabelMap: Record<BankAccountAuditLog["action"], string> = {
  create: "Oluşturma",
  edit: "Düzenleme",
  status_change: "Statü Değişimi",
  integration_toggle: "Entegrasyon Değişimi",
  branch_scope_update: "Şube Kapsam Güncelleme",
}

export function getAuditColumns(): ColumnDef<BankAccountAuditLog>[] {
  return [
    {
      accessorKey: "timestamp",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tarih" />,
      cell: ({ row }) => new Date(row.original.timestamp).toLocaleString("tr-TR"),
    },
    {
      accessorKey: "action",
      header: ({ column }) => <DataTableColumnHeader column={column} title="İşlem Tipi" />,
      cell: ({ row }) => actionLabelMap[row.original.action],
    },
    {
      accessorKey: "previousValue",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Eski Değer" />,
      cell: ({ row }) => <span className="text-sm text-slate-500">{row.original.previousValue ?? "-"}</span>,
    },
    {
      accessorKey: "newValue",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Yeni Değer" />,
      cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.newValue ?? "-"}</span>,
    },
    {
      accessorKey: "actorName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="İşlemi Yapan" />,
    },
  ]
}
