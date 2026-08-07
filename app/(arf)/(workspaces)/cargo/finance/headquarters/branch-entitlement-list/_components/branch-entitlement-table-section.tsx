"use client"

import { useMemo, useState, type ChangeEvent } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableExcelActions,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Filter } from "lucide-react"
import { getBranchEntitlementColumns } from "../_columns/branch-entitlement-columns"
import type { BranchEntitlementRow } from "../_types"

interface Props {
  data: BranchEntitlementRow[]
}

function matchesSearch(row: BranchEntitlementRow, query: string): boolean {
  const q = query.toLocaleLowerCase("tr-TR")
  return [row.branchName, row.branchCode].join(" ").toLocaleLowerCase("tr-TR").includes(q)
}

const MONTHS = [
  { value: "1", label: "Ocak" },
  { value: "2", label: "Şubat" },
  { value: "3", label: "Mart" },
  { value: "4", label: "Nisan" },
  { value: "5", label: "Mayıs" },
  { value: "6", label: "Haziran" },
  { value: "7", label: "Temmuz" },
  { value: "8", label: "Ağustos" },
  { value: "9", label: "Eylül" },
  { value: "10", label: "Ekim" },
  { value: "11", label: "Kasım" },
  { value: "12", label: "Aralık" },
]

const YEARS = ["2026", "2025", "2024"]

const currentMonth = String(new Date().getMonth() + 1)
const currentYear = String(new Date().getFullYear())

export function BranchEntitlementTableSection({ data }: Props) {
  const [table, setTable] = useState<TanStackTable<BranchEntitlementRow> | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)

  const filteredRows = useMemo(() => {
    if (!searchQuery) return data
    return data.filter((row) => matchesSearch(row, searchQuery))
  }, [data, searchQuery])

  const columns = useMemo(() => getBranchEntitlementColumns(), [])

  return (
    <div className="space-y-4">
      {table && (
        <div className="flex items-center gap-2 pb-2">
          {!showFilters && (
            <DataTableExcelActions
              table={table}
              filename="sube-hakedis-listesi"
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
                  placeholder="Şube adı veya kodu ara..."
                  className="h-8 w-[220px]"
                />

                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="h-8 w-[130px]">
                    <SelectValue placeholder="Ay" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="h-8 w-[100px]">
                    <SelectValue placeholder="Yıl" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedMonth(currentMonth)
                    setSelectedYear(currentYear)
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
