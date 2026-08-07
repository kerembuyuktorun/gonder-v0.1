"use client"

import { type ChangeEvent, useMemo, useState } from "react"
import type { OnChangeFn, PaginationState, Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableExcelActions,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cancelTripById } from "../_api/trip-cancel-api"
import { completeTripById } from "../_api/trip-complete-api"
import { getTripsColumns } from "../_columns/trips-columns"
import type { TripRecord } from "../_types"
import { Filter } from "lucide-react"

interface Props {
  rows: TripRecord[]
  onRowsChange: (rows: TripRecord[]) => void
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  filters: {
    datePreset: string
    status: string
    supplierType: string
    dateFrom: string
    dateTo: string
  }
  onFilterChange: (next: Record<string, string | null>) => void
  onMutation?: () => Promise<void> | void
}

const statusFilterOptions = [
  { label: "Başladı", value: "created" },
  { label: "Devam Ediyor", value: "on_road" },
  { label: "Bitti", value: "completed" },
  { label: "İptal Edildi", value: "cancelled" },
]

const supplierFilterOptions = [
  { label: "Şirket", value: "company" },
  { label: "Ambar", value: "warehouse" },
  { label: "Kamyon Sahibi", value: "truck_owner" },
  { label: "Lojistik", value: "logistics" },
]

export function TripsTableSection({
  rows,
  onRowsChange,
  pagination,
  onPaginationChange,
  filters,
  onFilterChange,
  onMutation,
}: Props) {
  const [table, setTable] = useState<TanStackTable<TripRecord> | null>(null)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)

  const filtered = useMemo(() => rows, [rows])

  const columns = useMemo(
    () =>
      getTripsColumns({
        onComplete: async (row) => {
          const updated = await completeTripById(row.id)
          if (!updated) return
          onRowsChange(rows.map((item) => (item.id === updated.id ? updated : item)))
          await onMutation?.()
        },
        onCancel: async (row) => {
          const ok = window.confirm(`${row.tripNo} numaralı sefer iptal edilsin mi?`)
          if (!ok) return
          const updated = await cancelTripById(row.id)
          if (!updated) return
          onRowsChange(rows.map((item) => (item.id === updated.id ? updated : item)))
          await onMutation?.()
        },
      }),
    [onMutation, onRowsChange, rows],
  )

  return (
    <Card className="border-slate-200">
      <CardContent className="space-y-4 pt-6">
        {table && (
          <div className="flex items-center gap-2">
            {!showFacetedFilters && (
              <DataTableExcelActions table={table} filename="sefer-listesi" exportSelected={false} exportLabel="Dışarı Aktar" />
            )}

            <DataTableToolbar table={table} showColumnSelector={!showFacetedFilters} viewLabel="Görünüm" columnsLabel="Sütunlar" resetLabel="Sıfırla">
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
                  <Select value={filters.status} onValueChange={(value: string) => onFilterChange({ status: value, page: "1" })}>
                    <SelectTrigger className="h-8 w-[160px] border-dashed">
                      <SelectValue placeholder="Durum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {statusFilterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.supplierType} onValueChange={(value: string) => onFilterChange({ supplierType: value, page: "1" })}>
                    <SelectTrigger className="h-8 w-[180px] border-dashed">
                      <SelectValue placeholder="Tedarikçi Tipi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {supplierFilterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.datePreset} onValueChange={(value: string) => onFilterChange({ datePreset: value, page: "1" })}>
                    <SelectTrigger className="h-8 w-[160px] border-dashed">
                      <SelectValue placeholder="Tarih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="today">Sadece bugün</SelectItem>
                      <SelectItem value="week">Bu hafta</SelectItem>
                      <SelectItem value="custom">Özel tarih</SelectItem>
                    </SelectContent>
                  </Select>

                  {filters.datePreset === "custom" && (
                    <>
                      <Input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => onFilterChange({ dateFrom: event.target.value || null, page: "1" })}
                        className="h-8 w-[160px]"
                      />
                      <Input
                        type="date"
                        value={filters.dateTo}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => onFilterChange({ dateTo: event.target.value || null, page: "1" })}
                        className="h-8 w-[160px]"
                      />
                    </>
                  )}
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
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          enableGlobalFilter
          enableHorizontalScroll
          stickyFirstColumn
          stickyLastColumn
          className="[&_thead_tr]:bg-slate-50 [&_thead_th]:font-semibold [&_thead_th]:text-slate-600"
          emptyMessage="Başlatılmış sefer bulunamadı."
        />

        {table && <DataTablePagination table={table as TanStackTable<unknown>} pageSizeOptions={[5, 10, 20, 50]} totalRows={filtered.length} />}
      </CardContent>
    </Card>
  )
}
