import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ChevronDown, Eye, Pencil, PowerOff, Trash2 } from "lucide-react"
import type { SupplierVehicle, VehicleBodyType, VehicleStatus, VehicleType } from "../_types"

const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  tir: "TIR",
  kamyon: "Kamyon",
  van: "Van",
  pickup: "Pickup",
}

const VEHICLE_BODY_TYPE_LABELS: Record<VehicleBodyType, string> = {
  tenteli: "Tenteli",
  kapali_kasa: "Kapalı Kasa",
  frigorifik: "Frigorifik",
  acik_kasa: "Açık Kasa",
  panelvan: "Panelvan",
  diger: "Diğer",
}

const STATUS_BADGE: Record<VehicleStatus, { label: string; className: string }> = {
  active: { label: "Aktif", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  passive: { label: "Pasif", className: "border-rose-200 bg-rose-50 text-rose-700" },
}

interface Options {
  onViewDocuments: (vehicle: SupplierVehicle) => void
  onEdit: (vehicle: SupplierVehicle) => void
  onDelete: (vehicle: SupplierVehicle) => void
  onToggleStatus: (vehicle: SupplierVehicle) => void
}

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString("tr-TR") : "—")

export function getVehiclesColumns({ onViewDocuments, onEdit, onDelete, onToggleStatus }: Options): ColumnDef<SupplierVehicle>[] {
  return [
    {
      accessorKey: "plate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Plaka" />,
      cell: ({ row }) => <span className="font-mono text-sm font-semibold">{row.original.plate}</span>,
    },
    {
      accessorKey: "brand",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Marka" />,
    },
    {
      accessorKey: "model",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Model" />,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Araç Durumu" />,
      cell: ({ row }) => {
        const config = STATUS_BADGE[row.original.status]
        return <Badge variant="outline" className={cn("border", config.className)}>{config.label}</Badge>
      },
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      accessorKey: "vehicleType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Araç Tipi" />,
      cell: ({ row }) => VEHICLE_TYPE_LABELS[row.original.vehicleType],
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      accessorKey: "bodyType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kasa Tipi" />,
      cell: ({ row }) => row.original.bodyType ? VEHICLE_BODY_TYPE_LABELS[row.original.bodyType] : "—",
      enableSorting: true,
    },
    {
      accessorKey: "maxWeightCapacity",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Max Ağırlık Kapasitesi" />,
      cell: ({ row }) => row.original.maxWeightCapacity != null ? `${row.original.maxWeightCapacity} ton` : "—",
    },
    {
      accessorKey: "maxVolumeCapacity",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Max Hacim Kapasitesi" />,
      cell: ({ row }) => row.original.maxVolumeCapacity != null ? `${row.original.maxVolumeCapacity} m3` : "—",
    },
    {
      accessorKey: "inspectionExpiryDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Araç Muayene Bitiş Tarihi" />,
      cell: ({ row }) => formatDate(row.original.inspectionExpiryDate),
    },
    {
      accessorKey: "trafficInsuranceExpiryDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Trafik Sigortası Bitiş Tarihi" />,
      cell: ({ row }) => formatDate(row.original.trafficInsuranceExpiryDate),
    },
    {
      accessorKey: "cascoPolicyNumber",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kasko Poliçe No" />,
      cell: ({ row }) => row.original.cascoPolicyNumber ?? "—",
    },
    {
      accessorKey: "cascoExpiryDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kasko Bitiş Tarihi" />,
      cell: ({ row }) => formatDate(row.original.cascoExpiryDate),
    },
    {
      id: "assignedDriver",
      accessorFn: (row) => row.currentDriverName ?? "",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Zimmetli Sürücü" />,
      cell: ({ row }) => row.original.currentDriverName ?? "—",
    },
    {
      id: "documents",
      accessorFn: (row) => row.documents?.length ?? 0,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Evraklar" />,
      cell: ({ row }) => {
        const count = row.original.documents?.length ?? 0
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700">{count} evrak</span>
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => onViewDocuments(row.original)} disabled={count === 0}>
              <Eye className="mr-1.5 size-3.5" />
              Görüntüle
            </Button>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">İşlemler</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const vehicle = row.original
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 rounded-lg px-2.5 text-xs">
                  İşlemler
                  <ChevronDown className="ml-1 size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onSelect={() => onEdit(vehicle)}>
                  <Pencil className="mr-2 size-4" />
                  Düzenle
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onToggleStatus(vehicle)}>
                  <PowerOff className="mr-2 size-4" />
                  {vehicle.status === "active" ? "Pasif Yap" : "Aktif Yap"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-700 focus:text-red-700" onSelect={() => onDelete(vehicle)}>
                  <Trash2 className="mr-2 size-4" />
                  Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
