"use client"

import { useMemo, useState, type ChangeEvent } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Filter } from "lucide-react"
import { getCustomerCashregistersColumns } from "../_columns/customer-cashregisters-columns"
import type { CustomerCashregisterRecord } from "../_types"

interface Props {
  data: CustomerCashregisterRecord[]
}

function matchesSearch(row: CustomerCashregisterRecord, query: string): boolean {
  const normalizedQuery = query.toLocaleLowerCase("tr-TR")
  return [row.customerName, row.vkn || "", row.customerId]
    .join(" ")
    .toLocaleLowerCase("tr-TR")
    .includes(normalizedQuery)
}

export function CustomerCashregistersTableSection({ data }: Props) {
  const [table, setTable] = useState<TanStackTable<CustomerCashregisterRecord> | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const query = searchParams.get("q") ?? ""
  const contractType = searchParams.get("contractType") ?? "all"
  const risk = searchParams.get("risk") ?? "all"
  const hasOpenAmount = searchParams.get("hasOpenAmount") ?? "all"

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
    return data.filter((row) => {
      if (query && !matchesSearch(row, query)) {
        return false
      }
      if (contractType !== "all" && row.contractType !== contractType) {
        return false
      }
      if (risk !== "all" && row.riskLevel !== risk) {
        return false
      }
      if (hasOpenAmount === "yes" && row.aciktaTutar <= 0) {
        return false
      }
      if (hasOpenAmount === "no" && row.aciktaTutar > 0) {
        return false
      }
      return true
    })
  }, [contractType, data, hasOpenAmount, query, risk])

  const columns = useMemo(() => getCustomerCashregistersColumns(), [])

  return (
    <div className="space-y-4">
      {table && (
        <div className="flex items-center gap-2 pb-2">
          {!showFilters && (
            <DataTableExcelActions
              table={table}
              filename="musteri-kasalari"
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
                  value={query}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => updateQueryParam("q", event.target.value)}
                  placeholder="Müşteri veya VKN ara..."
                  className="h-8 w-[220px]"
                />

                <DataTableFacetedFilter
                  column={table.getColumn("contractType")}
                  title="Sözleşme"
                  options={[
                    { label: "Sözleşmeli", value: "sozlesmeli" },
                    { label: "Spot", value: "spot" },
                  ]}
                />

                <DataTableFacetedFilter
                  column={table.getColumn("riskLevel")}
                  title="Risk"
                  options={[
                    { label: "Normal", value: "normal" },
                    { label: "Takip", value: "warning" },
                    { label: "Kritik", value: "critical" },
                  ]}
                />

                <Select value={hasOpenAmount} onValueChange={(value: string) => updateQueryParam("hasOpenAmount", value)}>
                  <SelectTrigger className="h-8 w-[150px]">
                    <SelectValue placeholder="Açıkta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="yes">Açıkta var</SelectItem>
                    <SelectItem value="no">Açıkta yok</SelectItem>
                  </SelectContent>
                </Select>

                <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => router.replace(pathname)}>
                  Filtreleri Sıfırla
                </Button>
              </div>
            )}
          </DataTableToolbar>
        </div>
      )}

      <DataTable data={filteredRows} columns={columns} onTableReady={setTable} enableHorizontalScroll stickyFirstColumn stickyLastColumn />
      {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
    </div>
  )
}
