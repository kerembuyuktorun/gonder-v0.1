"use client"

import { useMemo, useState } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getTransferFormsColumns } from "../_columns/transfer-forms-columns"
import type { TransferFormListRecord } from "../_types"

interface Props {
  rows: TransferFormListRecord[]
}

const statusFilterOptions = [
  { label: "Açık", value: "OPEN" },
  { label: "Kapalı", value: "CLOSED" },
]

export function TransferFormsTableSection({ rows }: Props) {
  const [table, setTable] = useState<TanStackTable<TransferFormListRecord> | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  const columns = useMemo(() => getTransferFormsColumns(), [])

  const filtered = useMemo(() => {
    if (statusFilter === "all") return rows
    return rows.filter((r) => r.status === statusFilter)
  }, [rows, statusFilter])

  return (
    <Card className="border-slate-200">
      <CardContent className="space-y-4 pt-6">
        {table && (
          <div className="flex items-center gap-2">
            <DataTableToolbar table={table} showColumnSelector={!showFilters} viewLabel="Görünüm" columnsLabel="Sütunlar" resetLabel="Sıfırla">
              <Button
                type="button"
                variant={showFilters ? "default" : "outline"}
                size="sm"
                className="mr-3 h-8"
                onClick={() => setShowFilters((prev) => !prev)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtreler
              </Button>

              {showFilters && (
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value)}>
                    <SelectTrigger className="h-8 w-[160px] border-dashed">
                      <SelectValue placeholder="Durum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {statusFilterOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </DataTableToolbar>
          </div>
        )}

        <DataTable
          data={filtered}
          columns={columns}
          enablePagination
          enableSorting
          enableColumnVisibility
          onTableReady={setTable}
          enableGlobalFilter
          enableHorizontalScroll
          stickyFirstColumn
          stickyLastColumn
          className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
          emptyMessage="Kayıtlı transfer formu bulunamadı."
        />

        {table && <DataTablePagination table={table as TanStackTable<unknown>} pageSizeOptions={[5, 10, 20, 50]} totalRows={filtered.length} />}
      </CardContent>
    </Card>
  )
}
