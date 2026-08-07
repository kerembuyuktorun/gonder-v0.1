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
import { ChevronDown, Eye, Layers, Trash2 } from "lucide-react"
import {
  CARGO_STATUS_CLASSES,
  CARGO_STATUS_LABELS,
  CARGO_TYPE_LABELS,
  ITEM_STATUS_CLASSES,
  ITEM_STATUS_LABELS,
  PAYMENT_TYPE_CLASSES,
  PAYMENT_TYPE_LABELS,
  formatCurrency,
  formatDateTime,
} from "../../_lib/transfer-form-helpers"
import type { ConsignmentItem } from "../_types/detail"

interface ColumnOptions {
  isKtfClosed: boolean
  onRemove: (cargoId: string) => void
}

export function getConsignmentColumns({ isKtfClosed, onRemove }: ColumnOptions): ColumnDef<ConsignmentItem>[] {
  return [
    {
      accessorKey: "trackingNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Parça No" />,
      cell: ({ row }) => <span className="font-mono text-sm font-semibold text-slate-900">{row.original.trackingNumber}</span>,
      enableHiding: false,
    },
    {
      accessorKey: "cargoId",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Takip No" />,
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.cargoId}</span>,
    },
    {
      accessorKey: "senderCustomerName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderici Müşteri" />,
      cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.senderCustomerName}</span>,
    },
    {
      accessorKey: "senderBranchName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Gönderici Şube" />,
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.senderBranchName}</span>,
    },
    {
      accessorKey: "receiverBranchName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı Şube" />,
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.receiverBranchName}</span>,
    },
    {
      accessorKey: "receiverCustomerName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Alıcı Müşteri" />,
      cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.receiverCustomerName}</span>,
    },
    {
      accessorKey: "paymentType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ödeme Türü" />,
      cell: ({ row }) => {
        const type = row.original.paymentType
        return (
          <Badge variant="outline" className={PAYMENT_TYPE_CLASSES[type]}>
            {PAYMENT_TYPE_LABELS[type]}
          </Badge>
        )
      },
      filterFn: (row, columnId, filterValues: string[]) => filterValues.includes(row.getValue(columnId)),
    },
    {
      accessorKey: "cargoStatus",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kargo Durumu" />,
      cell: ({ row }) => {
        const status = row.original.cargoStatus
        return (
          <Badge variant="outline" className={CARGO_STATUS_CLASSES[status]}>
            {CARGO_STATUS_LABELS[status]}
          </Badge>
        )
      },
      filterFn: (row, columnId, filterValues: string[]) => filterValues.includes(row.getValue(columnId)),
    },
    {
      accessorKey: "itemStatus",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Parça Durumu" />,
      cell: ({ row }) => {
        const status = row.original.itemStatus
        return (
          <Badge variant="outline" className={ITEM_STATUS_CLASSES[status]}>
            {ITEM_STATUS_LABELS[status]}
          </Badge>
        )
      },
      filterFn: (row, columnId, filterValues: string[]) => filterValues.includes(row.getValue(columnId)),
    },
    {
      accessorKey: "cargoType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Parça Tipi" />,
      cell: ({ row }) => <span className="text-sm text-slate-600">{CARGO_TYPE_LABELS[row.original.cargoType]}</span>,
    },
    {
      accessorKey: "desi",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Desi" />,
      cell: ({ row }) => <span className="text-sm tabular-nums text-slate-600">{row.original.desi}</span>,
    },
    {
      accessorKey: "weight",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ağırlık (kg)" />,
      cell: ({ row }) => <span className="text-sm tabular-nums text-slate-600">{row.original.weight}</span>,
    },
    {
      accessorKey: "totalPrice",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam Fiyat" />,
      cell: ({ row }) => (
        <span className="text-sm font-semibold tabular-nums text-slate-900">{formatCurrency(row.original.totalPrice)}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturulma" />,
      cell: ({ row }) => <span className="text-sm tabular-nums text-slate-600">{formatDateTime(row.original.createdAt)}</span>,
    },
    {
      accessorKey: "lastUpdatedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Son İşlem" />,
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-slate-600">{formatDateTime(row.original.lastUpdatedAt)}</span>
      ),
    },
    {
      accessorKey: "arrivedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Varış Zamanı" />,
      cell: ({ row }) => <span className="text-sm tabular-nums text-slate-600">{formatDateTime(row.original.arrivedAt)}</span>,
    },
    {
      accessorKey: "deliveredAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Teslimat Zamanı" />,
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-slate-600">{formatDateTime(row.original.deliveredAt)}</span>
      ),
    },
    {
      id: "actions",
      header: () => null,
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
              <DropdownMenuLabel>{`#${row.original.trackingNumber} İşlemleri`}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => window.alert(`Kargo Detay: ${row.original.cargoId}`)}>
                <Eye className="mr-2 size-4" />
                Kargo Detay Görüntüle
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => window.alert(`Parça Detay: ${row.original.trackingNumber}`)}>
                <Layers className="mr-2 size-4" />
                Parça Detay Görüntüle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-rose-700 focus:text-rose-700"
                disabled={isKtfClosed}
                onSelect={() => onRemove(row.original.cargoId)}
              >
                <Trash2 className="mr-2 size-4" />
                Zimmetten Çıkar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
