"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, type ChangeEvent } from "react"
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
import { Label } from "@/components/ui/label"
import { Filter } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { fetchInvoices, patchInvoiceStatus } from "../_api/invoices-api"
import { getInvoicesColumns, type InvoiceColumnActions } from "../_columns/invoices-columns"
import type { InvoiceRecord, InvoiceStatus } from "../_types/invoice"

interface Props {
  data: InvoiceRecord[]
}

const STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: "bekliyor", label: "Bekliyor" },
  { value: "kismi", label: "Kısmi Ödeme" },
  { value: "odendi", label: "Ödendi" },
  { value: "gecikti", label: "Gecikti" },
  { value: "reddedildi", label: "Reddedildi" },
  { value: "iade", label: "İade" },
  { value: "iptal", label: "İptal" },
]

// ---------------------------------------------------------------------------
// RejectDialog
// ---------------------------------------------------------------------------

interface RejectDialogProps {
  invoice: InvoiceRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (invoiceId: string, reason: string) => Promise<void>
}

function RejectDialog({ invoice, open, onOpenChange, onConfirm }: RejectDialogProps) {
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleConfirm() {
    if (!invoice) return
    setSaving(true)
    await onConfirm(invoice.id, reason)
    setSaving(false)
    setReason("")
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Faturayı Reddedildi Olarak İşaretle</AlertDialogTitle>
          <AlertDialogDescription>
            Müşteri red sonrası bağlı kargolar yeniden faturalanabilir hale gelir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          {invoice && (
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <p className="font-medium text-slate-700">{invoice.invoiceNo}</p>
              <p className="text-slate-500">{invoice.customerName}</p>
            </div>
          )}
          <p className="text-sm text-slate-600">
            Bu fatura <strong>reddedildi</strong> olarak işaretlenecek. Bağlı kargolar serbest bırakılacak ve
            yeni fatura oluşturulabilecek.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="reject-reason">Red Gerekçesi (opsiyonel)</Label>
            <Input
              id="reject-reason"
              placeholder="Müşteri açıklaması..."
              value={reason}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Vazgeç</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" disabled={saving} onClick={handleConfirm}>
              {saving ? "İşleniyor..." : "Reddedildi İşaretle"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function InvoicesTableSection({ data }: Props) {
  const router = useRouter()
  const [rows, setRows] = useState<InvoiceRecord[]>(data)
  const [table, setTable] = useState<TanStackTable<InvoiceRecord> | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Modal state
  const [rejectTarget, setRejectTarget] = useState<InvoiceRecord | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [refundTarget, setRefundTarget] = useState<InvoiceRecord | null>(null)
  const [refundOpen, setRefundOpen] = useState(false)

  useEffect(() => {
    const refresh = () => {
      void fetchInvoices().then(setRows)
    }

    refresh()
    window.addEventListener("arf-headquarters-invoices-updated", refresh)

    return () => {
      window.removeEventListener("arf-headquarters-invoices-updated", refresh)
    }
  }, [])

  // -------------------------------------------------------------------------
  // Action handlers
  // -------------------------------------------------------------------------

  const actions: InvoiceColumnActions = useMemo(
    () => ({
      onViewDetail: (row) => {
        router.push(`/arf/cargo/finance/headquarters/invoices/${row.id}`)
      },
      onReject: (row) => {
        setRejectTarget(row)
        setRejectOpen(true)
      },
      onRefund: (row) => {
        setRefundTarget(row)
        setRefundOpen(true)
      },
    }),
    [router],
  )

  const columns = useMemo(() => getInvoicesColumns(actions), [actions])

  async function handleReject(invoiceId: string, reason: string) {
    const updated = await patchInvoiceStatus(invoiceId, { status: "reddedildi", reason })
    if (!updated) return
    setRows((prev) => prev.map((row) => (row.id === invoiceId ? updated : row)))
  }

  async function handleRefund() {
    if (!refundTarget) return
    const updated = await patchInvoiceStatus(refundTarget.id, { status: "iade" })
    if (!updated) return
    setRows((prev) => prev.map((row) => (row.id === refundTarget.id ? updated : row)))
    setRefundOpen(false)
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      <RejectDialog
        invoice={rejectTarget}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={handleReject}
      />
      <AlertDialog open={refundOpen} onOpenChange={setRefundOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İade İşlemi Başlat</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{refundTarget?.invoiceNo}</strong> faturası{" "}
              <strong>iade</strong> olarak işaretlenecek. Bağlı kargolar serbest bırakılacak.
              Bu işlem geri alınamaz. Onaylıyor musunuz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRefund}
              className="bg-purple-600 hover:bg-purple-700"
            >
              İade Onayla
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {table && (
        <div className="flex items-center gap-2 pb-2">
          {!showFilters && (
            <DataTableExcelActions
              table={table}
              filename="genel-merkez-faturalar"
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

      {/* Table */}
      <DataTable columns={columns} data={rows} onTableReady={setTable} enableHorizontalScroll stickyLastColumn />
      {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
    </div>
  )
}
