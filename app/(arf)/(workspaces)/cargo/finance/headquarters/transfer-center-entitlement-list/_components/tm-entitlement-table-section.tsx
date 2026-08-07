"use client"

import { useMemo, useState, type ChangeEvent } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableExcelActions,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter } from "lucide-react"
import { getTmEntitlementColumns } from "../_columns/tm-entitlement-columns"
import type { TmEntitlementRow } from "../_types"

interface Props {
  data: TmEntitlementRow[]
}

function matchesSearch(row: TmEntitlementRow, query: string): boolean {
  const q = query.toLocaleLowerCase("tr-TR")
  return [row.transferCenterName, row.transferCenterCode].join(" ").toLocaleLowerCase("tr-TR").includes(q)
}

export function TmEntitlementTableSection({ data }: Props) {
  const [table, setTable] = useState<TanStackTable<TmEntitlementRow> | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredRows = useMemo(() => {
    if (!searchQuery) return data
    return data.filter((row) => matchesSearch(row, searchQuery))
  }, [data, searchQuery])

  const columns = useMemo(() => getTmEntitlementColumns(), [])

  return (
    <div className="space-y-4">
      {table && (
        <div className="flex items-center gap-2 pb-2">
          {!showFilters && (
            <DataTableExcelActions
              table={table}
              filename="tm-hakedis-listesi"
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
                <Input
                  value={searchQuery}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
                  placeholder="TM adı veya kodu ara..."
                  className="h-8 w-[220px]"
                />

                {table.getColumn("commissionModel") && (
                  <DataTableFacetedFilter
                    column={table.getColumn("commissionModel")}
                    title="Hakediş Tipi"
                    options={[
                      { label: "Parça Başı", value: "per_piece" },
                      { label: "Yüzdelik", value: "percentage" },
                    ]}
                  />
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    setSearchQuery("")
                    table.getColumn("commissionModel")?.setFilterValue(undefined)
                  }}
                >
                  Filtreleri Sıfırla
                </Button>
              </div>
            )}
          </DataTableToolbar>
        </div>
      )}

      <DataTable
        data={filteredRows}
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
