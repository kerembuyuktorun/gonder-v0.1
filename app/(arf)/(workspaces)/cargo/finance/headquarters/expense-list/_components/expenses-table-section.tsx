"use client"

import { useRouter } from "next/navigation"
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
import {
  getExpensesColumns,
  type ExpenseColumnActions,
} from "../_columns/expenses-columns"
import type { ExpenseRecord, ExpenseStatus } from "../_types/expense"

interface Props {
  rows: ExpenseRecord[]
}

const STATUS_OPTIONS: { value: ExpenseStatus; label: string }[] = [
  { value: "paid", label: "Ödendi" },
  { value: "unpaid", label: "Ödenmedi" },
  { value: "partially_paid", label: "Kısmi Ödendi" },
  { value: "overdue", label: "Gecikmiş" },
]

export function ExpensesTableSection({ rows }: Props) {
  const router = useRouter()
  const [table, setTable] = useState<TanStackTable<ExpenseRecord> | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const actions: ExpenseColumnActions = useMemo(
    () => ({
      onViewDetail: (row) => router.push(`/arf/cargo/finance/headquarters/expense-list/${row.id}`),
    }),
    [router],
  )

  const columns = useMemo(() => getExpensesColumns(actions), [actions])

  return (
    <div className="space-y-4">
      {table && (
        <div className="flex items-center gap-2 pb-2">
          {!showFilters && (
            <DataTableExcelActions
              table={table}
              filename="gider-listesi"
              exportSelected={false}
              exportLabel="Dışarı Aktar"
            />
          )}
          <DataTableToolbar
            table={table}
            showColumnSelector={!showFilters}
            viewLabel="Görünüm"
            columnsLabel="Sütunlar"
            resetLabel="Sıfırla"
          >
            <Button
              type="button"
              variant={showFilters ? "default" : "outline"}
              size="sm"
              className="mr-3 h-8"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <Filter className="mr-2 size-4" />
              Filtreler
            </Button>

            {showFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <DataTableFacetedFilter
                  column={table.getColumn("status")}
                  title="Durum"
                  options={STATUS_OPTIONS.map((opt) => ({ label: opt.label, value: opt.value }))}
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
        stickyLastColumn
      />
      {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
    </div>
  )
}
