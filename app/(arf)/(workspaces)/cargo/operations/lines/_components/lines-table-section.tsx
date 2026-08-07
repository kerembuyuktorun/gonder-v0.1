"use client"

import { useMemo, useState } from "react"
import type { OnChangeFn, PaginationState, Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableExcelActions,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Filter } from "lucide-react"
import { createLine, deleteLine, toggleLineStatus, updateLine } from "../_api/lines-api"
import { getLinesColumns } from "../_columns/lines-columns"
import type { LineFormState, LineRecord, LocationOption } from "../_types"
import { LineCreateEditModal } from "./line-create-edit-modal"

interface Props {
  initialData: LineRecord[]
  locations: LocationOption[]
  createOpen: boolean
  onCreateOpenChange: (open: boolean) => void
}

const typeFilterOptions = [
  { label: "Ana Hat", value: "main" },
  { label: "Merkez Hat", value: "hub" },
  { label: "Ara Hat", value: "feeder" },
]

const statusFilterOptions = [
  { label: "Aktif", value: "active" },
  { label: "Pasif", value: "passive" },
]

export function LinesTableSection({ initialData, locations, createOpen, onCreateOpenChange }: Props) {
  const [rows, setRows] = useState<LineRecord[]>(initialData)
  const [editRow, setEditRow] = useState<LineRecord | null>(null)
  const [table, setTable] = useState<TanStackTable<LineRecord> | null>(null)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 })

  const filtered = useMemo(() => rows, [rows])

  const columns = useMemo(
    () =>
      getLinesColumns({
        onToggleStatus: async (row) => {
          const updated = await toggleLineStatus(row.id)
          if (!updated) return
          setRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
        },
        onEdit: (row) => setEditRow(row),
        onDelete: async (row) => {
          const ok = window.confirm(`${row.name} silinsin mi?`)
          if (!ok) return
          await deleteLine(row.id)
          setRows((prev) => prev.filter((item) => item.id !== row.id))
        },
      }),
    [],
  )

  return (
    <div className="space-y-4">
      <LineCreateEditModal
        open={createOpen}
        onOpenChange={onCreateOpenChange}
        mode="create"
        locations={locations}
        onSubmit={async (payload: LineFormState) => {
          const created = await createLine(payload)
          setRows((prev) => [created, ...prev])
        }}
      />

      {editRow && (
        <LineCreateEditModal
          open={!!editRow}
          onOpenChange={(open) => {
            if (!open) setEditRow(null)
          }}
          mode="edit"
          initial={editRow}
          locations={locations}
          onSubmit={async (payload: LineFormState) => {
            const updated = await updateLine(editRow.id, payload)
            setRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
            setEditRow(null)
          }}
        />
      )}

      <Card className="border-slate-200">
        <CardContent className="space-y-4 pt-6">
          {table && (
            <div className="flex items-center gap-2">
              {!showFacetedFilters && (
                <DataTableExcelActions table={table} filename="hat-listesi" exportSelected={false} exportLabel="Dışarı Aktar" />
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
                    <DataTableFacetedFilter column={table.getColumn("type")} title="Hat Türü" options={typeFilterOptions} />
                    <DataTableFacetedFilter column={table.getColumn("status")} title="Durum" options={statusFilterOptions} />
                  </div>
                )}
              </DataTableToolbar>
            </div>
          )}

          <DataTable
            data={filtered}
            columns={columns}
            onTableReady={setTable}
            pagination={pagination}
            onPaginationChange={setPagination as OnChangeFn<PaginationState>}
            enableGlobalFilter={false}
            enableHorizontalScroll
            emptyMessage="Kayıtlı hat bulunamadı."
          />

          {table && <DataTablePagination table={table as TanStackTable<unknown>} pageSizeOptions={[5, 10, 20, 50]} totalRows={filtered.length} />}
        </CardContent>
      </Card>
    </div>
  )
}
