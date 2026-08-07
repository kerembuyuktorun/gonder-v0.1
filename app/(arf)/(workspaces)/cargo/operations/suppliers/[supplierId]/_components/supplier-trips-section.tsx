"use client"

import { useMemo, useState } from "react"
import type { ColumnDef, Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableColumnHeader,
  DataTableExcelActions,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, Eye, Filter, Route } from "lucide-react"
import Link from "next/link"
import { ARF_ROUTES } from "../../../../../../_shared/routes"

interface MockTrip {
  id: string
  tripNo: string
  lineName: string
  supplierType: "firma" | "sahis"
  supplierName: string
  driverName?: string
  vehiclePlate?: string
  tripLocation: string
  status: "created" | "on_road" | "completed" | "cancelled"
  totalLoad: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

const SUPPLIER_TYPE_LABELS: Record<MockTrip["supplierType"], string> = {
  firma: "Firma",
  sahis: "Şahıs",
}

const STATUS_BADGE: Record<MockTrip["status"], { label: string; className: string }> = {
  created: { label: "Bekliyor", className: "border-slate-200 bg-slate-50 text-slate-600" },
  on_road: { label: "Yolda", className: "border-blue-200 bg-blue-50 text-blue-700" },
  completed: { label: "Tamamlandı", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  cancelled: { label: "İptal", className: "border-rose-200 bg-rose-50 text-rose-600" },
}

const MOCK_SUPPLIER_TRIPS: Record<string, MockTrip[]> = {
  "1": [
    {
      id: "trip-10000164",
      tripNo: "10000164",
      lineName: "Silopi - Diyarbakır Hattı",
      supplierType: "firma",
      supplierName: "Can Lojistik",
      driverName: "Mehmet Demir",
      vehiclePlate: "34 ABC 001",
      tripLocation: "Mardin T.M.",
      status: "on_road",
      totalLoad: 24,
      createdAt: "2024-01-15T08:00:00Z",
      updatedAt: "2024-01-15T10:35:00Z",
      createdBy: "Operasyon Admin",
    },
    {
      id: "trip-10000160",
      tripNo: "10000160",
      lineName: "İstanbul - Ankara Hattı",
      supplierType: "firma",
      supplierName: "Can Lojistik",
      driverName: "Ali Kaya",
      vehiclePlate: "34 DEF 002",
      tripLocation: "Ankara",
      status: "completed",
      totalLoad: 18.5,
      createdAt: "2024-01-10T10:00:00Z",
      updatedAt: "2024-01-11T08:20:00Z",
      createdBy: "Harekat Uzmanı",
    },
  ],
  "2": [
    {
      id: "trip-10000165",
      tripNo: "10000165",
      lineName: "Van - Ağrı Hattı",
      supplierType: "sahis",
      supplierName: "Hasan Çelik",
      driverName: "Hasan Çelik",
      vehiclePlate: "06 XYZ 100",
      tripLocation: "Patnos",
      status: "created",
      totalLoad: 12,
      createdAt: "2024-02-01T09:00:00Z",
      updatedAt: "2024-02-01T09:00:00Z",
      createdBy: "Planlama",
    },
  ],
}

interface Props {
  supplierId: string
}

export function SupplierTripsSection({ supplierId }: Props) {
  const [table, setTable] = useState<TanStackTable<MockTrip> | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const trips = MOCK_SUPPLIER_TRIPS[supplierId] ?? []

  const statusOptions = useMemo(
    () => [
      { label: "Bekliyor", value: "created" },
      { label: "Yolda", value: "on_road" },
      { label: "Tamamlandı", value: "completed" },
      { label: "İptal", value: "cancelled" },
    ],
    [],
  )

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })

  const columns = useMemo<ColumnDef<MockTrip>[]>(
    () => [
      {
        accessorKey: "tripNo",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sefer No" />,
        cell: ({ row }) => (
          <Link
            href={`${ARF_ROUTES.cargo.operations.trips}/${row.original.id}`}
            className="font-mono text-sm font-bold text-slate-900 underline underline-offset-2"
          >
            #{row.original.tripNo}
          </Link>
        ),
      },
      {
        accessorKey: "lineName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Hat İsmi" />,
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-[260px] text-sm text-slate-700">
            {row.original.lineName}
          </span>
        ),
      },
      {
        accessorKey: "supplierType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tedarikçi Tipi" />,
        cell: ({ row }) => (
          <span className="text-sm text-slate-700">
            {SUPPLIER_TYPE_LABELS[row.original.supplierType]}
          </span>
        ),
      },
      {
        accessorKey: "supplierName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tedarikçi İsmi" />,
        cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.supplierName}</span>,
      },
      {
        accessorKey: "driverName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sürücü" />,
        cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.driverName ?? "—"}</span>,
      },
      {
        accessorKey: "vehiclePlate",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Araç Plakası" />,
        cell: ({ row }) => (
          <span className="font-mono text-sm text-slate-700">{row.original.vehiclePlate ?? "—"}</span>
        ),
      },
      {
        accessorKey: "tripLocation",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sefer Konumu" />,
        cell: ({ row }) => (
          <span className="line-clamp-1 max-w-[220px] text-sm text-slate-700">
            {row.original.tripLocation}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sefer Durumu" />,
        cell: ({ row }) => {
          const badge = STATUS_BADGE[row.original.status]
          return (
            <Badge variant="outline" className={badge.className}>
              {badge.label}
            </Badge>
          )
        },
        filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
      },
      {
        accessorKey: "totalLoad",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam Yük" />,
        cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.totalLoad} ton</span>,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturulma Zamanı" />,
        cell: ({ row }) => <span className="text-sm text-slate-600">{formatDateTime(row.original.createdAt)}</span>,
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Güncellenme Zamanı" />,
        cell: ({ row }) => <span className="text-sm text-slate-600">{formatDateTime(row.original.updatedAt)}</span>,
      },
      {
        accessorKey: "createdBy",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Oluşturan" />,
        cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.createdBy}</span>,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">İşlemler</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const trip = row.original
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 rounded-full px-4 text-xs">
                    İşlemler
                    <ChevronDown className="ml-1.5 size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{`Sefer #${trip.tripNo} İşlemleri`}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`${ARF_ROUTES.cargo.operations.trips}/${trip.id}`}>
                      <Eye className="mr-2 size-4" />
                      Detay Görüntüle
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [],
  )

  return (
    <Card className="rounded-2xl border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Route className="size-4 text-slate-400" />
          Sefer Geçmişi
          {trips.length > 0 && (
            <span className="inline-flex h-5 items-center rounded-full bg-slate-100 px-1.5 text-[10px] font-normal text-slate-500">
              {trips.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
            <Route className="size-8" />
            <p className="text-sm">Bu tedarikçiye ait sefer kaydı bulunamadı.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {table && (
              <div className="flex items-center gap-2">
                {!showFilters && (
                  <DataTableExcelActions table={table} filename="tedarikci-sefer-gecmisi" exportSelected={false} exportLabel="Dışarı Aktar" />
                )}
                <DataTableToolbar table={table} searchPlaceholder="Sefer no, hat, tedarikçi, sürücü ara..." showColumnSelector={!showFilters} viewLabel="Görünüm" columnsLabel="Sütunlar" resetLabel="Sıfırla">
                  <Button type="button" variant={showFilters ? "default" : "outline"} size="sm" className="mr-3 h-8" onClick={() => setShowFilters((value) => !value)}>
                    <Filter className="mr-2 size-4" />
                    Filtreler
                  </Button>
                </DataTableToolbar>
              </div>
            )}

            {showFilters && table && (
              <div className="flex flex-wrap gap-2">
                <DataTableFacetedFilter column={table.getColumn("status")} title="Durum" options={statusOptions} />
              </div>
            )}

            <DataTable
              columns={columns}
              data={trips}
              onTableReady={setTable}
              enableSorting
              enableColumnVisibility
              enableHorizontalScroll
              stickyFirstColumn
              stickyLastColumn
              className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
              emptyMessage="Gösterilecek sefer bulunamadı."
            />
            {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
