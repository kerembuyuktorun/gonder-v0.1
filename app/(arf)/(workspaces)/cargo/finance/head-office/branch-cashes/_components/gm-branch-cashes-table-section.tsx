"use client"

import { useMemo, useState, type ChangeEvent } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  DataTable,
  DataTableExcelActions,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter } from "lucide-react"
import type { GmBranchCashRow } from "../_types"
import { getGmBranchCashesColumns } from "../_columns/gm-branch-cashes-columns"

interface Props {
  data: GmBranchCashRow[]
}

function matchesSearch(row: GmBranchCashRow, query: string): boolean {
  const normalized = query.toLocaleLowerCase("tr-TR")
  return [row.branchName, row.city].join(" ").toLocaleLowerCase("tr-TR").includes(normalized)
}

export function GmBranchCashesTableSection({ data }: Props) {
  const [table, setTable] = useState<TanStackTable<GmBranchCashRow> | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const query = searchParams.get("q") ?? ""

  const updateQueryParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname)
  }

  const filteredRows = useMemo(() => {
    if (!query) return data
    return data.filter((row) => matchesSearch(row, query))
  }, [data, query])

  const columns = useMemo(() => getGmBranchCashesColumns(), [])

  return (
    <div className="space-y-4">
      {table && (
        <div className="flex items-center gap-2 pb-2">
          {!showFilters && (
            <DataTableExcelActions
              table={table}
              filename="gm-sube-kasalari"
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
              <div className="flex items-center gap-2">
                <Input
                  value={query}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateQueryParam("q", event.target.value)}
                  placeholder="Şube veya şehir ara..."
                  className="h-8 w-[240px]"
                />
                <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => router.replace(pathname)}>
                  Filtreleri Sıfırla
                </Button>
              </div>
            )}
          </DataTableToolbar>
        </div>
      )}

      <DataTable data={filteredRows} columns={columns} onTableReady={setTable} enableHorizontalScroll stickyLastColumn />
      {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
    </div>
  )
}
