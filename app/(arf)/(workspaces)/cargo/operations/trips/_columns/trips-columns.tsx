import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { formatDateTime, formatNumber, SUPPLIER_TYPE_LABELS } from "../_lib/trip-status-helpers"
import type { TripRecord } from "../_types"
import { TripActionsCell } from "../_components/trip-actions-cell"
import { TripStatusBadge } from "../_components/trip-status-badge"

interface Options {
  onComplete: (row: TripRecord) => void
  onCancel: (row: TripRecord) => void
}

function formatLineSummaryCompact(summary: string) {
  const stops = summary.split(" - ").map((item) => item.trim()).filter(Boolean)
  if (stops.length <= 2) {
    return summary
  }

  return `${stops[0]} -> ${stops[stops.length - 1]} (${stops.length} durak)`
}

export function getTripsColumns({ onComplete, onCancel }: Options): Array<ColumnDef<TripRecord>> {
  return [
    {
      accessorKey: "tripNo",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sefer No" />,
      cell: ({ row }) => (
        <Link
          href={`/arf/cargo/operations/trips/${row.original.id}`}
          className="font-mono text-sm font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60"
        >
          {row.original.tripNo}
        </Link>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "lineName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Hat İsmi" />,
      cell: ({ row }) => (
        <span className="text-slate-700" title={row.original.lineSummary}>
          {formatLineSummaryCompact(row.original.lineSummary)}
        </span>
      ),
    },
    {
      accessorKey: "supplierType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tedarikçi Tipi" />,
      cell: ({ row }) => <span className="text-slate-700">{SUPPLIER_TYPE_LABELS[row.original.supplierType]}</span>,
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      accessorKey: "supplierName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tedarikçi İsmi" />,
      cell: ({ row }) => <span className="text-slate-700">{row.original.supplierName}</span>,
    },
    {
      accessorKey: "driverName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sürücü" />,
      cell: ({ row }) => <span className="text-slate-700">{row.original.driverName ?? "-"}</span>,
    },
    {
      accessorKey: "vehiclePlate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Araç Plakası" />,
      cell: ({ row }) => <span className="text-slate-700">{row.original.vehiclePlate ?? "-"}</span>,
    },
    {
      accessorKey: "currentLocationSummary",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sefer Konumu" />,
      cell: ({ row }) => <span className="text-slate-700">{row.original.currentLocationSummary}</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Sefer Durumu" />,
      cell: ({ row }) => <TripStatusBadge status={row.original.status} />,
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      id: "totalLoad",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam Yük" />,
      cell: ({ row }) => (
        <span className="text-slate-700">
          {formatNumber(row.original.totalPackageCount)} Parça / {formatNumber(row.original.totalDesi)} Desi
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturulma Zamanı" />,
      cell: ({ row }) => <span className="text-slate-700">{formatDateTime(row.original.createdAt)}</span>,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Güncellenme Zamanı" />,
      cell: ({ row }) => <span className="text-slate-700">{formatDateTime(row.original.updatedAt)}</span>,
    },
    {
      accessorKey: "createdBy",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturan" />,
      cell: ({ row }) => <span className="text-slate-700">{row.original.createdBy}</span>,
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => <TripActionsCell row={row.original} onComplete={onComplete} onCancel={onCancel} />,
      enableSorting: false,
      enableHiding: false,
      size: 136,
      minSize: 120,
      maxSize: 152,
    },
  ]
}
