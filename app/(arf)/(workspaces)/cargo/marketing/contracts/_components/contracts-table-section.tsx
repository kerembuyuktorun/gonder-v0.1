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
import { CheckCircle2, ChevronDown, Eye, Filter, Pencil, Trash2, XCircle } from "lucide-react"
import type { ContractListRow } from "../_data/contracts"

const customerTypeLabels: Record<ContractListRow["musteri_tip"], string> = {
  corporate: "Kurumsal",
  individual: "Bireysel",
}

const customerStatusLabels: Record<ContractListRow["musteri_durum"], string> = {
  active: "Aktif",
  passive: "Pasif",
}

const contractStatusLabels: Record<ContractListRow["sozlesme_durum"], string> = {
  active: "Aktif",
  expired: "Süresi Doldu",
  draft: "Pasif",
}

export function ContractsTableSection({ data }: { data: ContractListRow[] }) {
  const [table, setTable] = useState<TanStackTable<ContractListRow> | null>(null)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)

  const tipOptions = useMemo(
    () => [
      { label: "Kurumsal", value: "corporate" },
      { label: "Bireysel", value: "individual" },
    ],
    [],
  )

  const customerStatusOptions = useMemo(
    () => [
      { label: "Aktif Müşteri", value: "active" },
      { label: "Pasif Müşteri", value: "passive" },
    ],
    [],
  )

  const contractStatusOptions = useMemo(
    () => [
      { label: "Aktif", value: "active" },
      { label: "Süresi Doldu", value: "expired" },
      { label: "Pasif", value: "draft" },
    ],
    [],
  )

  const columns = useMemo<ColumnDef<ContractListRow>[]>(
    () => [
      {
        accessorKey: "musteri",
        enableHiding: false,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Müşteri" />,
        cell: ({ row }) => (
          <Link
            href={`/arf/cargo/marketing/customers/${row.original.customerId}?tab=contracts`}
            className="font-medium text-secondary underline decoration-secondary/40 underline-offset-4 transition-all hover:text-primary hover:decoration-primary/60"
          >
            {row.original.musteri}
          </Link>
        ),
      },
      {
        accessorKey: "musteri_tip",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Müşteri Tipi" />,
        filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              row.original.musteri_tip === "corporate"
                ? "border-secondary/30 bg-primary/12 text-secondary"
                : "border-slate-300 bg-slate-100 text-slate-700",
            )}
          >
            {customerTypeLabels[row.original.musteri_tip]}
          </Badge>
        ),
      },
      {
        accessorKey: "musteri_durum",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Müşteri Durumu" />,
        filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              row.original.musteri_durum === "active"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-slate-500/10 text-slate-500 border-slate-400/20",
            )}
          >
            {customerStatusLabels[row.original.musteri_durum]}
          </Badge>
        ),
      },
      {
        accessorKey: "sozlesme_durum",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sözleşme Durumu" />,
        filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              row.original.sozlesme_durum === "active"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : row.original.sozlesme_durum === "expired"
                  ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                  : "bg-amber-500/10 text-amber-700 border-amber-500/20",
            )}
          >
            {contractStatusLabels[row.original.sozlesme_durum]}
          </Badge>
        ),
      },
      {
        accessorKey: "sozlesme_no",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sözleşme No" />,
        cell: ({ row }) => <span className="font-mono">{row.original.sozlesme_no}</span>,
      },
      {
        accessorKey: "belge_no",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Belge No" />,
        cell: ({ row }) => <span className="font-mono text-muted-foreground">{row.original.belge_no}</span>,
      },
      {
        accessorKey: "baslangic_tarihi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Başlangıç" />,
      },
      {
        accessorKey: "bitis_tarihi",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Bitiş" />,
      },
      {
        accessorKey: "aciklama",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Açıklama" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.aciklama}</span>,
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
                <DropdownMenuLabel>{`${row.original.musteri} İşlemleri`}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/arf/cargo/marketing/customers/${row.original.customerId}?tab=contracts`}>
                    <Eye className="mr-2 size-4" />
                    Detay Görüntüle
                  </Link>
                </DropdownMenuItem>
                {row.original.sozlesme_durum === "active" ? (
                  <DropdownMenuItem>
                    <XCircle className="mr-2 size-4 text-amber-500" />
                    Pasif Yap
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem>
                    <CheckCircle2 className="mr-2 size-4 text-emerald-500" />
                    Aktif Yap
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Pencil className="mr-2 size-4" />
                  Düzenle
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 size-4" />
                  Sil
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
              filename="sozlesme-listesi"
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
                  column={table.getColumn("musteri_tip")}
                  title="Müşteri Tipi"
                  options={tipOptions}
                />
                <DataTableFacetedFilter
                  column={table.getColumn("musteri_durum")}
                  title="Müşteri Durumu"
                  options={customerStatusOptions}
                />
                <DataTableFacetedFilter
                  column={table.getColumn("sozlesme_durum")}
                  title="Sözleşme Durumu"
                  options={contractStatusOptions}
                />
              </div>
            )}
          </DataTableToolbar>
        </div>
      )}

      <DataTable
        data={data}
        columns={columns}
        enableSorting
        enableColumnVisibility
        enableHorizontalScroll
        stickyFirstColumn
        stickyLastColumn
        className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
        emptyMessage="Gösterilecek sözleşme bulunamadı."
        onTableReady={setTable}
      />

      {table && <DataTablePagination table={table as TanStackTable<unknown>} pageSizeOptions={[10, 20, 50]} />}
    </div>
  )
}
