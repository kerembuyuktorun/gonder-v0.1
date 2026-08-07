"use client"

import { useMemo, useState } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableExcelActions,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { getBranchesListColumns } from "../_columns/branches-list-columns"
import type { BranchRecord } from "../_mock/branches-mock-data"

export function BranchesTableSection({ data }: { data: BranchRecord[] }) {
  const [rows, setRows] = useState<BranchRecord[]>(data)
  const [table, setTable] = useState<TanStackTable<BranchRecord> | null>(null)
  const [showFacetedFilters, setShowFacetedFilters] = useState(false)

  const columns = useMemo(
    () =>
      getBranchesListColumns((branchId) => {
        const targetBranch = rows.find((branch) => branch.id === branchId)
        const nextIsActive = targetBranch ? !targetBranch.aktif : true
        const confirmMessage = nextIsActive
          ? "Şube aktif yapılacak. Onaylıyor musunuz?"
          : "Şube pasif yapılacak. Onaylıyor musunuz?"

        if (!window.confirm(confirmMessage)) {
          return
        }

        setRows((prev) =>
          prev.map((branch) =>
            branch.id === branchId ? { ...branch, aktif: !branch.aktif } : branch,
          ),
        )
      }),
    [rows],
  )

  const durumOptions = useMemo(
    () => [
      { label: "Aktif", value: "aktif" },
      { label: "Pasif", value: "pasif" },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      {table && (
        <div className="flex items-center gap-2">
          {!showFacetedFilters && (
            <DataTableExcelActions table={table} filename="subeler" exportSelected={false} exportLabel="Dışarı Aktar" />
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
              <Filter className="mr-2 size-4" />
              Filtreler
            </Button>

            {showFacetedFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <DataTableFacetedFilter
                  column={table.getColumn("aktif")}
                  title="Durum"
                  options={durumOptions}
                />
              </div>
            )}
          </DataTableToolbar>
        </div>
      )}

      <DataTable
        data={rows}
        columns={columns}
        onTableReady={setTable}
        enableHorizontalScroll
        stickyFirstColumn
        stickyLastColumn
      />

      {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
    </div>
  )
}
