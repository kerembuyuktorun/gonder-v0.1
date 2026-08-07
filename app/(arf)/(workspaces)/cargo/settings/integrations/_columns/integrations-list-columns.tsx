"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import type { IntegrationRecord } from "../_types"
import { INTEGRATION_STATUS_LABELS } from "../_types"

export const integrationsListColumns: ColumnDef<IntegrationRecord>[] = [
  {
    accessorKey: "platformId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Platform" />,
    cell: ({ row }) => (
      <Link href={`/arf/cargo/settings/integrations/${row.original.id}`} className="font-medium hover:underline">
        {row.original.platform?.name ?? row.original.platformId}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
    cell: ({ row }) => <Badge variant="outline">{INTEGRATION_STATUS_LABELS[row.original.status]}</Badge>,
  },
  {
    accessorKey: "lastSyncAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Son Senkronizasyon" />,
    cell: ({ row }) => (row.original.lastSyncAt ? new Date(row.original.lastSyncAt).toLocaleString("tr-TR") : "-")
  },
]
