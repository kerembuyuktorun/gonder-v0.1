"use client"

import { useEffect, useMemo, useState } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTableExcelActions,
  DataTablePagination,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createInvoiceRecord } from "../../../../finance/headquarters/invoices/_api/invoices-api"
import { getStoredOpenCargos, lockCustomerOpenCargos } from "../_mock/financial-mock-data"
import { FileText } from "lucide-react"
import { toast } from "sonner"
import type {
  CreateInvoicePayload,
  InvoiceCustomerInfo,
  OpenCargoRecord,
} from "../_types/financial"
import { openCargosColumns } from "../_columns/open-cargos-columns"
import { CreateInvoiceModal } from "./create-invoice-modal"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(value)

export function OpenCargosTableSection({
  data,
  customerInfo,
}: {
  data: OpenCargoRecord[]
  customerInfo: InvoiceCustomerInfo
}) {
  const [rows, setRows] = useState<OpenCargoRecord[]>(data)
  const [table, setTable] = useState<TanStackTable<OpenCargoRecord> | null>(null)
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    const refresh = () => {
      setRows(getStoredOpenCargos(customerInfo.customerId))
    }

    refresh()
    window.addEventListener("arf-customer-financial-updated", refresh)

    return () => {
      window.removeEventListener("arf-customer-financial-updated", refresh)
    }
  }, [customerInfo.customerId])

  const hasSelection = useMemo(
    () => Object.values(rowSelection).some(Boolean),
    [rowSelection],
  )

  const selectedRows = useMemo(() => {
    const selectedIndexes = Object.entries(rowSelection)
      .filter(([, selected]) => selected)
      .map(([index]) => Number(index))
      .filter((index) => Number.isInteger(index) && index >= 0 && index < rows.length)

    return selectedIndexes.map((index) => rows[index])
  }, [rowSelection, rows])

  const selectedTotal = useMemo(
    () => selectedRows.reduce((acc, c) => acc + c.amount, 0),
    [selectedRows],
  )

  const handleCreateInvoice = async (payload: CreateInvoicePayload) => {
    const operatingBranchName = selectedRows[0]?.senderBranch ?? selectedRows[0]?.receiverBranch ?? "İstanbul Merkez"
    const operatingBranchId = operatingBranchName
      .toLocaleLowerCase("tr-TR")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    await createInvoiceRecord({
      invoiceName: payload.invoiceName,
      invoiceNo: "",
      categoryLabel: "Kargo",
      tagLabels: ["Kargo Faturası"],
      customerId: customerInfo.customerId,
      customerName: customerInfo.tradeName,
      customerType: customerInfo.customerType,
      taxOffice: customerInfo.taxOffice,
      taxNumber: customerInfo.taxNumber,
      operatingBranchId: operatingBranchId || "istanbul-merkez",
      operatingBranchName,
      issueDate: payload.issueDate,
      dueDate: payload.dueDate,
      note: payload.note || payload.invoiceName,
      subTotal: payload.subTotal,
      vatTotal: payload.vatTotal,
      grandTotal: payload.grandTotal,
      source: "customer-detail",
      relatedCargoIds: selectedRows.map((row) => row.id),
      cargoSnapshots: selectedRows.map((row) => ({ ...row })),
      createdBy: "Mevcut Kullanıcı",
    })

    const nextRows = lockCustomerOpenCargos(customerInfo.customerId, selectedRows.map((row) => row.id))
    setRows(nextRows)
    toast.success(
      `${selectedRows.length} kargo için ${payload.invoiceName} oluşturuldu. Toplam: ${formatCurrency(payload.grandTotal)}`,
    )
    setRowSelection({})
    setConfirmOpen(false)
  }

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-4">
        {hasSelection && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-secondary/20 bg-primary/5 px-3 py-2">
            <p className="text-sm font-medium text-secondary">
              Seçili: {selectedRows.length} kargo – Toplam: {formatCurrency(selectedTotal)}
            </p>
            <Button size="sm" onClick={() => setConfirmOpen(true)}>
              <FileText className="mr-2 size-4" />
              Fatura Oluştur
            </Button>
          </div>
        )}

        {table && (
          <div className="mb-3 flex items-center gap-2">
            <DataTableExcelActions
              table={table}
              filename="acik-kargolar"
              exportSelected={false}
              exportLabel="Dışarı Aktar"
            />
            <DataTableToolbar
              table={table}
              showColumnSelector
              viewLabel="Görünüm"
              columnsLabel="Sütunlar"
              resetLabel="Sıfırla"
            />
          </div>
        )}

        <DataTable
          data={rows}
          columns={openCargosColumns}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          onTableReady={setTable}
        />

        {table && (
          <DataTablePagination
            table={table as TanStackTable<unknown>}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        )}

        <CreateInvoiceModal
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          selectedCargos={selectedRows}
          customerInfo={customerInfo}
          onConfirm={handleCreateInvoice}
        />
      </CardContent>
    </Card>
  )
}
