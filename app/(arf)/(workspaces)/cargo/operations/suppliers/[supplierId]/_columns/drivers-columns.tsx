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
import { AlertTriangle, ChevronDown, Eye, Pencil, PowerOff, Trash2 } from "lucide-react"
import type { DriverStatus, SupplierDriver } from "../_types"

const STATUS_BADGE: Record<DriverStatus, { label: string; className: string }> = {
  available: { label: "Müsait", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  on_trip: { label: "Seferde", className: "border-blue-200 bg-blue-50 text-blue-700" },
  off_duty: { label: "Görev Dışı", className: "border-slate-200 bg-slate-50 text-slate-600" },
}

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString("tr-TR") : "—")

function isExpiringSoon(dateStr?: string): boolean {
  if (!dateStr) return false
  const date = new Date(dateStr)
  const thirtyDays = 30 * 24 * 60 * 60 * 1000
  return date.getTime() - Date.now() < thirtyDays && date > new Date()
}

interface Options {
  onViewDocuments: (driver: SupplierDriver) => void
  onEdit: (driver: SupplierDriver) => void
  onDelete: (driver: SupplierDriver) => void
  onToggleStatus: (driver: SupplierDriver) => void
}

export function getDriversColumns({ onViewDocuments, onEdit, onDelete, onToggleStatus }: Options): ColumnDef<SupplierDriver>[] {
  return [
    {
      accessorKey: "nationalId",
      header: ({ column }) => <DataTableColumnHeader column={column} title="TCKN" />,
      cell: ({ row }) => <span className="font-mono text-sm font-semibold">{row.original.nationalId}</span>,
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ad" />,
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Soyad" />,
    },
    {
      accessorKey: "phone",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Telefon" />,
    },
    {
      accessorKey: "birthDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Doğum Tarihi" />,
      cell: ({ row }) => formatDate(row.original.birthDate),
    },
    {
      accessorKey: "bloodGroup",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kan Grubu" />,
      cell: ({ row }) => row.original.bloodGroup ?? "—",
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
      cell: ({ row }) => {
        const config = STATUS_BADGE[row.original.status]
        return <Badge variant="outline" className={cn("border", config.className)}>{config.label}</Badge>
      },
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      accessorKey: "licenseClass",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ehliyet Sınıfı" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="border-slate-200 text-slate-600">
          Sınıf {row.original.licenseClass}
        </Badge>
      ),
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      accessorKey: "licenseExpiry",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Ehliyet Bitiş Tarihi" />,
      cell: ({ row }) => {
        const soon = isExpiringSoon(row.original.licenseExpiry)
        return (
          <span className={cn("text-sm", soon && "font-semibold text-amber-700")}>
            {formatDate(row.original.licenseExpiry)}
            {soon && <AlertTriangle className="ml-1 inline size-3.5 text-amber-600" />}
          </span>
        )
      },
    },
    {
      accessorKey: "srcType",
      header: ({ column }) => <DataTableColumnHeader column={column} title="SRC Belge Türü" />,
      cell: ({ row }) => {
        if (!row.original.hasSrcCertificate) {
          return <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-600">Yok</Badge>
        }
        return <span className="text-sm">{row.original.srcType ?? "—"}</span>
      },
    },
    {
      accessorKey: "srcExpiryDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="SRC Bitiş Tarihi" />,
      cell: ({ row }) => {
        if (!row.original.hasSrcCertificate) return <span className="text-slate-400">—</span>
        const soon = isExpiringSoon(row.original.srcExpiryDate)
        return (
          <span className={cn("text-sm", soon && "font-semibold text-amber-700")}>
            {formatDate(row.original.srcExpiryDate)}
            {soon && <AlertTriangle className="ml-1 inline size-3.5 text-amber-600" />}
          </span>
        )
      },
    },
    {
      accessorKey: "psychotechnicExpiryDate",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Psikoteknik Bitiş Tarihi" />,
      cell: ({ row }) => {
        const soon = isExpiringSoon(row.original.psychotechnicExpiryDate)
        return (
          <span className={cn("text-sm", soon && "font-semibold text-amber-700")}>
            {formatDate(row.original.psychotechnicExpiryDate)}
            {soon && <AlertTriangle className="ml-1 inline size-3.5 text-amber-600" />}
          </span>
        )
      },
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onViewDocuments(row.original)}
              disabled={count === 0}
            >
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
        const driver = row.original
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
                <DropdownMenuItem onSelect={() => onEdit(driver)}>
                  <Pencil className="mr-2 size-4" />
                  Düzenle
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onToggleStatus(driver)}>
                  <PowerOff className="mr-2 size-4" />
                  {driver.status === "off_duty" ? "Aktif Yap" : "Pasif Yap"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-700 focus:text-red-700"
                  onSelect={() => onDelete(driver)}
                >
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
