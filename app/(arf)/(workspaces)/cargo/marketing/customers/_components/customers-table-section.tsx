"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ChevronDown, Eye, Filter, PackageSearch, Wallet } from "lucide-react"
import type { CustomerListRow } from "../_data/customers"

const centeredHeaderClass = "[&>div]:justify-center [&_button]:ml-0"

export function CustomersTableSection({ data }: { data: CustomerListRow[] }) {
  const [table, setTable] = useState<TanStackTable<CustomerListRow> | null>(null)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)

  const tipOptions = useMemo(
    () => [
      { label: "Kurumsal", value: "corporate" },
      { label: "Bireysel", value: "individual" },
    ],
    [],
  )

  const durumOptions = useMemo(
    () => [
      { label: "Aktif", value: "active" },
      { label: "Pasif", value: "passive" },
    ],
    [],
  )

  const sozlesmeOptions = useMemo(
    () => [
      { label: "Sözleşmesi Olan", value: "var" },
      { label: "Sözleşmesi Olmayan", value: "yok" },
    ],
    [],
  )

  const columns = useMemo<ColumnDef<CustomerListRow>[]>(
    () => [
      {
        accessorKey: "ad",
        enableHiding: false,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Müşteri" />,
        cell: ({ row }) => (
          <div>
            <Link
              href={`/arf/cargo/marketing/customers/${row.original.id}`}
              className="font-medium text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60"
            >
              {row.original.ad}
            </Link>
          </div>
        ),
      },
      {
        accessorKey: "tip",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tip" />,
        cell: ({ row }) => (
          <Badge variant="outline" className={cn(
            row.original.tip === "corporate"
              ? "border-secondary/30 bg-primary/12 text-secondary"
              : "border-slate-300 bg-slate-100 text-slate-700",
          )}>
            {row.original.tip === "corporate" ? "Kurumsal" : "Bireysel"}
          </Badge>
        ),
        filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
      },
      {
        accessorKey: "durum",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Durum" />,
        cell: ({ row }) => (
          <Badge variant="outline" className={cn(
            row.original.durum === "active"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-slate-500/10 text-slate-500 border-slate-400/20",
          )}>
            {row.original.durum === "active" ? "Aktif" : "Pasif"}
          </Badge>
        ),
        filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
      },
      {
        accessorKey: "kimlik_no",
        header: ({ column }) => <DataTableColumnHeader column={column} title="VKN/TCKN" className={centeredHeaderClass} />,
      },
      {
        accessorKey: "telefon",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Telefon" className={centeredHeaderClass} />,
      },
      {
        accessorKey: "email",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Eposta" className={centeredHeaderClass} />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
      },
      {
        accessorKey: "aktif_sozlesme_sayisi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Aktif Sözleşme" className={centeredHeaderClass} />,
        filterFn: (row, id, value: string[]) => {
          const contractCount = Number(row.getValue(id) ?? 0)
          const bucket = contractCount > 0 ? "var" : "yok"
          return value.includes(bucket)
        },
        cell: ({ row }) => <span className="block text-center tabular-nums">{row.original.aktif_sozlesme_sayisi}</span>,
      },
      {
        accessorKey: "kayit_tarihi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Kayıt Tarihi" className={centeredHeaderClass} />,
        cell: ({ row }) => <span className="block text-center">{row.original.kayit_tarihi}</span>,
      },
      {
        accessorKey: "son_kargo_tarihi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Son Kargo" className={centeredHeaderClass} />,
        cell: ({ row }) => <span className="block text-center">{row.original.son_kargo_tarihi}</span>,
      },
      {
        accessorKey: "kargo_sayisi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam Kargo" className={centeredHeaderClass} />,
        cell: ({ row }) => <span className="block text-center tabular-nums">{row.original.kargo_sayisi}</span>,
      },
      {
        accessorKey: "tasima_sayisi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Toplam Taşıma" className={centeredHeaderClass} />,
        cell: ({ row }) => <span className="block text-center tabular-nums">{row.original.tasima_sayisi}</span>,
      },
      {
        accessorKey: "teslim_edilen_sayisi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Teslim Edilen" className={centeredHeaderClass} />,
        cell: ({ row }) => <span className="block text-center tabular-nums">{row.original.teslim_edilen_sayisi}</span>,
      },
      {
        accessorKey: "devir_edilen_sayisi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Devir Edilen" className={centeredHeaderClass} />,
        cell: ({ row }) => <span className="block text-center tabular-nums">{row.original.devir_edilen_sayisi}</span>,
      },
      {
        accessorKey: "iptal_edilen_sayisi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="İptal Edilen" className={centeredHeaderClass} />,
        cell: ({ row }) => <span className="block text-center tabular-nums">{row.original.iptal_edilen_sayisi}</span>,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">İşlemler</span>,
        enableSorting: false,
        enableHiding: false,
        size: 136,
        minSize: 120,
        maxSize: 152,
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
                <DropdownMenuLabel>{`${row.original.ad} İşlemleri`}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/arf/cargo/marketing/customers/${row.original.id}`}>
                    <Eye className="mr-2 size-4" />
                    Detay Görüntüle
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/arf/cargo/marketing/customers/${row.original.id}?tab=shipments`}>
                    <PackageSearch className="mr-2 size-4" />
                    Kargo Geçmişi
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/arf/cargo/marketing/customers/${row.original.id}?tab=finance`}>
                    <Wallet className="mr-2 size-4" />
                    Finansal Hareketler
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      {table && (
        <div className="flex items-center gap-2">
          {!showFacetedFilters && (
            <DataTableExcelActions
              table={table}
              filename="musteri-listesi"
              exportSelected={false}
              exportLabel="Dışarı Aktar"
            />
          )}

          <DataTableToolbar
            table={table}
            showColumnSelector={!showFacetedFilters}
            viewLabel="Görünüm"
            columnsLabel="Sütunlar"
            resetLabel="Sıfırla"
          >
            <Button
              type="button"
              variant={showFacetedFilters ? "default" : "outline"}
              size="sm"
              className="mr-3 h-8"
              onClick={() => setShowFacetedFilters((previous) => !previous)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtreler
            </Button>

            {showFacetedFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <DataTableFacetedFilter
                  column={table.getColumn("tip")}
                  title="Müşteri Tipi"
                  options={tipOptions}
                />
                <DataTableFacetedFilter
                  column={table.getColumn("durum")}
                  title="Durum"
                  options={durumOptions}
                />
                <DataTableFacetedFilter
                  column={table.getColumn("aktif_sozlesme_sayisi")}
                  title="Sözleşme"
                  options={sozlesmeOptions}
                />
              </div>
            )}
          </DataTableToolbar>
        </div>
      )}

      <DataTable
        data={data}
        columns={columns}
        enablePagination
        enableSorting
        enableColumnVisibility
        enableHorizontalScroll
        stickyFirstColumn
        stickyLastColumn
        className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
        emptyMessage="Gösterilecek müşteri bulunamadı."
        onTableReady={setTable}
      />

      {table && <DataTablePagination table={table as TanStackTable<unknown>} pageSizeOptions={[5, 10, 20, 50]} />}
    </div>
  )
}
