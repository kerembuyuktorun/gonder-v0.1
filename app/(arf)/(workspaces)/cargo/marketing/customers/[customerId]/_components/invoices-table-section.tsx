"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
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
import { fetchInvoices as fetchCustomerInvoices } from "../_api/financial-api"
import type { FinancialExstreRecord } from "../_types/financial"
import { invoicesColumns, InvoiceExpandedRow } from "../_columns/invoices-columns"

const statusFilterOptions = [
  { label: "Tahsil Edildi", value: "odendi" },
  { label: "Bekliyor", value: "bekliyor" },
  { label: "Kısmi", value: "kismi" },
  { label: "Gecikti", value: "gecikti" },
]

const typeFilterOptions = [
  { label: "Fatura", value: "fatura" },
  { label: "Tahsilat", value: "gelen_odeme" },
]

export function InvoicesTableSection({
  data,
  customerId,
}: {
  data: FinancialExstreRecord[]
  customerId: string
}) {
  const [rows, setRows] = useState<FinancialExstreRecord[]>(data)
  const [table, setTable] = useState<TanStackTable<FinancialExstreRecord> | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false)

  useEffect(() => {
    const refresh = () => {
      void fetchCustomerInvoices(customerId).then(setRows)
    }

    refresh()
    window.addEventListener("arf-headquarters-invoices-updated", refresh)

    return () => {
      window.removeEventListener("arf-headquarters-invoices-updated", refresh)
    }
  }, [customerId])

  const filteredData = useMemo(() => {
    if (!showUnpaidOnly) return rows
    return rows.filter(
      (row) => row.status === "bekliyor" || row.status === "kismi" || row.status === "gecikti",
    )
  }, [rows, showUnpaidOnly])

  const renderSubComponent = useCallback(
    (row: FinancialExstreRecord) => <InvoiceExpandedRow row={row} />,
    [],
  )

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-4">
        {table && (
          <div className="mb-3 flex items-center gap-2">
            {!showFilters && (
              <DataTableExcelActions
                table={table}
                filename="faturalar-ve-tahsilatlar"
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
                <Filter className="mr-2 h-4 w-4" />
                Filtreler
              </Button>

              {showFilters && (
                <div className="flex flex-wrap items-center gap-2">
                  <DataTableFacetedFilter
                    column={table.getColumn("type")}
                    title="İşlem Tipi"
                    options={typeFilterOptions}
                  />
                  <DataTableFacetedFilter
                    column={table.getColumn("status")}
                    title="Durum"
                    options={statusFilterOptions}
                  />
                </div>
              )}
            </DataTableToolbar>

            <div className="ml-auto">
              <Button
                type="button"
                variant={showUnpaidOnly ? "default" : "outline"}
                size="sm"
                className="h-8"
                onClick={() => setShowUnpaidOnly((prev) => !prev)}
              >
                Tahsil Edilmemişleri Göster
              </Button>
            </div>
          </div>
        )}

        <DataTable
          data={filteredData}
          columns={invoicesColumns}
          onTableReady={setTable}
          renderSubComponent={renderSubComponent}
          expandOnRowClick
        />

        {table && (
          <DataTablePagination
            table={table as TanStackTable<unknown>}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        )}
      </CardContent>
    </Card>
  )
}
