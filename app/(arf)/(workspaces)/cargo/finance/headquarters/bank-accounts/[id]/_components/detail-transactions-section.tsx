"use client"

import { useEffect, useMemo, useState } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import {
  DataTable,
  DataTablePagination,
  DataTableExcelActions,
  DataTableFacetedFilter,
  DataTableToolbar,
} from "@hascanb/arf-ui-kit/datatable-kit"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Filter, X } from "lucide-react"
import type { BankAccountTransaction, Currency } from "../../_types"
import {
  applyManualTransactionMatch,
  fetchMappedCustomerForSenderIban,
  type MappedCustomerForSender,
} from "../../_api/bank-accounts-api"
import { fetchInvoices } from "../../../invoices/_api/invoices-api"
import { getTransactionsColumns } from "../_columns/transactions-columns"

interface Props {
  transactions: BankAccountTransaction[]
  currency: Currency
}

type MatchSource = NonNullable<BankAccountTransaction["matchSource"]>

const MATCH_SOURCE_LABELS: Record<MatchSource, string> = {
  branch_transfer: "Şube Transferi",
  customer_invoice: "Sözleşmeli Fatura",
  supplier_payment: "Tedarikçi Ödemesi",
}

const MATCH_SOURCE_OPTIONS: Array<{ label: string; value: MatchSource }> = [
  { label: "Şube Transferi", value: "branch_transfer" },
  { label: "Sözleşmeli Fatura", value: "customer_invoice" },
  { label: "Tedarikçi Ödemesi", value: "supplier_payment" },
]

const MATCH_SOURCE_ID_POOL: Record<MatchSource, string[]> = {
  branch_transfer: ["BTM-1001", "BTM-1002", "BTM-1107", "BTM-1201", "BTM-1202"],
  customer_invoice: ["CINV-4481", "CINV-4520", "CINV-4603"],
  supplier_payment: ["SPY-0889", "SPY-0445", "SPY-1001", "SPY-0210"],
}

function formatMoney(value: number, currency: Currency): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function DetailTransactionsSection({ transactions, currency }: Props) {
  const [table, setTable] = useState<TanStackTable<BankAccountTransaction> | null>(null)
  const [rows, setRows] = useState<BankAccountTransaction[]>(transactions)
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [matchDetailModalOpen, setMatchDetailModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<BankAccountTransaction | null>(null)
  const [selectedMatchDetail, setSelectedMatchDetail] = useState<BankAccountTransaction | null>(null)
  const [manualMatchSource, setManualMatchSource] = useState<MatchSource>("branch_transfer")
  const [manualEntityId, setManualEntityId] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [invoiceOptions, setInvoiceOptions] = useState<Array<{ invoiceNo: string; customerId: string; customerName: string }>>([])
  const [mappedCustomerInfo, setMappedCustomerInfo] = useState<MappedCustomerForSender | null>(null)
  const [query] = useState("")
  const [fromDate] = useState("")
  const [toDate] = useState("")
  const [minAmount] = useState("")
  const [maxAmount] = useState("")

  useEffect(() => {
    let active = true

    void fetchInvoices().then((invoices) => {
      if (!active) {
        return
      }

      const uniqueByNo = new Map<string, { invoiceNo: string; customerId: string; customerName: string }>()
      for (const invoice of invoices) {
        if (!uniqueByNo.has(invoice.invoiceNo)) {
          uniqueByNo.set(invoice.invoiceNo, {
            invoiceNo: invoice.invoiceNo,
            customerId: invoice.customerId,
            customerName: invoice.customerName,
          })
        }
      }

      setInvoiceOptions(Array.from(uniqueByNo.values()))
    })

    return () => {
      active = false
    }
  }, [])

  const getAvailableTransferIds = (source: MatchSource, currentTransactionId?: string) => {
    const usedIds = new Set(
      rows
        .filter((item) => item.id !== currentTransactionId)
        .filter((item) => item.matchStatus !== "unmatched")
        .filter((item) => item.matchSource === source)
        .map((item) => item.matchedEntityId)
        .filter((value): value is string => Boolean(value)),
    )

    const customerInvoicePool = invoiceOptions.map((item) => item.invoiceNo).filter(Boolean)
    const sourcePool =
      source === "customer_invoice"
        ? (customerInvoicePool.length > 0 ? customerInvoicePool : MATCH_SOURCE_ID_POOL[source])
        : MATCH_SOURCE_ID_POOL[source]

    return sourcePool.filter((id) => !usedIds.has(id))
  }

  const openManualMatchModal = (row: BankAccountTransaction) => {
    const defaultSource: MatchSource = row.matchSource ?? "branch_transfer"
    const availableIds = getAvailableTransferIds(defaultSource, row.id)

    setSelectedTransaction(row)
    setManualMatchSource(defaultSource)
    setManualEntityId(row.matchedEntityId && availableIds.includes(row.matchedEntityId) ? row.matchedEntityId : (availableIds[0] ?? ""))
    setManualModalOpen(true)

    void fetchMappedCustomerForSenderIban(row.senderIban).then((result) => {
      setMappedCustomerInfo(result)
    })
  }

  const applyManualMatch = async () => {
    if (!selectedTransaction) {
      return
    }

    const trimmedEntityId = manualEntityId.trim()

    if (!trimmedEntityId) {
      return
    }

    const matchedInvoice =
      manualMatchSource === "customer_invoice"
        ? invoiceOptions.find((item) => item.invoiceNo === trimmedEntityId)
        : undefined

    const updated = await applyManualTransactionMatch({
      transactionId: selectedTransaction.id,
      matchSource: manualMatchSource,
      matchedEntityId: trimmedEntityId,
      matchedBy: "Mevcut Kullanıcı",
      customerId: matchedInvoice?.customerId,
      customerName: matchedInvoice?.customerName,
      senderIban: selectedTransaction.senderIban,
      senderName: selectedTransaction.senderName,
    })

    setRows((prev) => prev.map((item) => {
      if (item.id !== selectedTransaction.id) {
        return item
      }

      return updated ?? {
        ...item,
        matchStatus: "manual_matched",
        matchSource: manualMatchSource,
        matchedEntityId: trimmedEntityId,
        matchedEntityLabel: `${MATCH_SOURCE_LABELS[manualMatchSource]} - ${trimmedEntityId}`,
        matchedAt: new Date().toISOString(),
        matchedBy: "Mevcut Kullanıcı",
      }
    }))

    setManualModalOpen(false)
  }

  const closeManualModal = (open: boolean) => {
    setManualModalOpen(open)
    if (!open) {
      setSelectedTransaction(null)
      setMappedCustomerInfo(null)
    }
  }

  const openMatchDetailModal = (row: BankAccountTransaction) => {
    setSelectedMatchDetail(row)
    setMatchDetailModalOpen(true)
  }

  const closeMatchDetailModal = (open: boolean) => {
    setMatchDetailModalOpen(open)
    if (!open) {
      setSelectedMatchDetail(null)
    }
  }

  const handleRematchFromDetail = () => {
    if (!selectedMatchDetail) {
      return
    }

    setMatchDetailModalOpen(false)
    setSelectedMatchDetail(null)
    openManualMatchModal(selectedMatchDetail)
  }

  const columns = useMemo(
    () => getTransactionsColumns(
      (row) => {
        openManualMatchModal(row)
      },
      (row) => {
        openMatchDetailModal(row)
      },
    ),
    [],
  )

  const filteredRows = useMemo(() => {
    return rows.filter((item) => {
      if (query) {
        const normalizedQuery = query.toLocaleLowerCase("tr-TR")
        const searchableText = [item.description, item.matchedEntityLabel ?? "", item.matchedBy ?? ""]
          .join(" ")
          .toLocaleLowerCase("tr-TR")

        if (!searchableText.includes(normalizedQuery)) {
          return false
        }
      }
      if (fromDate && item.date.slice(0, 10) < fromDate) {
        return false
      }
      if (toDate && item.date.slice(0, 10) > toDate) {
        return false
      }
      if (minAmount && item.amount < Number(minAmount)) {
        return false
      }
      if (maxAmount && item.amount > Number(maxAmount)) {
        return false
      }
      return true
    })
  }, [fromDate, maxAmount, minAmount, query, rows, toDate])

  const totalCredit = filteredRows.filter((item) => item.direction === "credit").reduce((sum, item) => sum + item.amount, 0)
  const totalDebit = filteredRows.filter((item) => item.direction === "debit").reduce((sum, item) => sum + item.amount, 0)
  const currentBalance = filteredRows[0]?.balanceAfter ?? rows[0]?.balanceAfter ?? 0

  const directionOptions = [
    { label: "Giriş", value: "credit" },
    { label: "Çıkış", value: "debit" },
  ]

  const matchingOptions = [
    { label: "Eşleşme Bekliyor", value: "unmatched" },
    { label: "Otomatik Eşleşti", value: "auto_matched" },
    { label: "Manuel Eşleşti", value: "manual_matched" },
  ]

  const matchSourceOptions = [
    { label: "Şube Transferi", value: "branch_transfer" },
    { label: "Sözleşmeli Fatura", value: "customer_invoice" },
    { label: "Tedarikçi Ödemesi", value: "supplier_payment" },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Toplam Giriş</CardDescription>
            <CardTitle className="text-lg text-emerald-700">{formatMoney(totalCredit, currency)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Toplam Çıkış</CardDescription>
            <CardTitle className="text-lg text-red-700">{formatMoney(totalDebit, currency)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Güncel Bakiye</CardDescription>
            <CardTitle className="text-lg text-slate-900">{formatMoney(currentBalance, currency)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardContent className="space-y-4">
          {table && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DataTableExcelActions
                  table={table}
                  filename="hesap-hareketleri"
                  exportSelected={false}
                  exportLabel="Dışarı Aktar"
                />
                <DataTableToolbar
                  table={table}
                  showColumnSelector={!showFilters}
                  viewLabel="Görünüm"
                  columnsLabel="Sütunlar"
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
                    <>
                      {table.getColumn("direction") && (
                        <DataTableFacetedFilter
                          column={table.getColumn("direction")}
                          title="Yön"
                          options={directionOptions}
                        />
                      )}

                      {table.getColumn("matching") && (
                        <DataTableFacetedFilter
                          column={table.getColumn("matching")}
                          title="Eşleştirme"
                          options={matchingOptions}
                        />
                      )}

                      {table.getColumn("matchSource") && (
                        <DataTableFacetedFilter
                          column={table.getColumn("matchSource")}
                          title="Eşleşme Kaynağı"
                          options={matchSourceOptions}
                        />
                      )}
                    </>
                  )}
                </DataTableToolbar>
              </div>
            </div>
          )}

          <DataTable data={filteredRows} columns={columns} onTableReady={setTable} emptyMessage="Hareket bulunamadı." />
          {table && <DataTablePagination table={table as TanStackTable<unknown>} />}
        </CardContent>
      </Card>

      <AlertDialog open={manualModalOpen} onOpenChange={closeManualModal}>
        <AlertDialogContent className="sm:max-w-4xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Manuel Eşleştirme</AlertDialogTitle>
            <AlertDialogDescription>
              Seçilen hareketi manuel olarak bir kayıtla ilişkilendirin.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedTransaction && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">Hareket Özeti</p>
                  <Badge
                    variant="outline"
                    className={selectedTransaction.direction === "credit"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"}
                  >
                    {selectedTransaction.direction === "credit" ? "Giriş" : "Çıkış"}
                  </Badge>
                </div>
                <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-500">Tarih</p>
                    <p className="font-medium text-slate-800">
                      {new Date(selectedTransaction.date).toLocaleString("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Tutar</p>
                    <p className="font-medium text-slate-800">{formatMoney(selectedTransaction.amount, selectedTransaction.currency)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">İşlem Sonrası Bakiye</p>
                    <p className="font-medium text-slate-800">{formatMoney(selectedTransaction.balanceAfter, selectedTransaction.currency)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Referans No</p>
                    <p className="font-medium text-slate-800">{selectedTransaction.referenceNumber ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Gönderen</p>
                    <p className="font-medium text-slate-800">{selectedTransaction.senderName ?? "ARF Lojistik A.Ş."}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Gönderen IBAN</p>
                    <p className="font-medium text-slate-800">{(selectedTransaction.senderIban ?? "TR090001061234567890123456").replace(/(.{4})/g, "$1 ").trim()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Alıcı</p>
                    <p className="font-medium text-slate-800">{selectedTransaction.recipientName ?? "ARF Lojistik A.Ş."}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Alıcı IBAN</p>
                    <p className="font-medium text-slate-800">{(selectedTransaction.recipientIban ?? "TR090001061234567890123456").replace(/(.{4})/g, "$1 ").trim()}</p>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <p className="text-xs text-slate-500">Açıklama</p>
                    <p className="font-medium text-slate-800">{selectedTransaction.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="manual-match-source">Eşleşme Kaynağı</Label>
                  <Select
                    value={manualMatchSource}
                    onValueChange={(value: MatchSource) => {
                      setManualMatchSource(value)
                      const nextAvailableIds = getAvailableTransferIds(value, selectedTransaction.id)
                      setManualEntityId(nextAvailableIds[0] ?? "")
                    }}
                  >
                    <SelectTrigger id="manual-match-source" className="h-10 w-full">
                      <SelectValue placeholder="Kaynak seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATCH_SOURCE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-entity-id">
                    {manualMatchSource === "customer_invoice" ? "Eşleştirilecek Fatura No" : "Eşleşen Kayıt ID"}
                  </Label>
                  <Select value={manualEntityId} onValueChange={setManualEntityId}>
                    <SelectTrigger id="manual-entity-id" className="h-10 w-full">
                      <SelectValue
                        placeholder={
                          manualMatchSource === "customer_invoice"
                            ? "Fatura No seçin"
                            : "Boştaki Transfer ID seçin"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableTransferIds(manualMatchSource, selectedTransaction.id).length > 0 ? (
                        getAvailableTransferIds(manualMatchSource, selectedTransaction.id).map((id) => (
                          <SelectItem key={id} value={id}>{id}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__none" disabled>Uygun boş Transfer ID bulunamadı</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {mappedCustomerInfo && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
                  <p className="font-medium text-emerald-800">
                    Bu gönderici IBAN daha önce eşlenmiş: {mappedCustomerInfo.customerName} ({mappedCustomerInfo.customerId})
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button type="button" variant="outline" onClick={() => closeManualModal(false)}>
                  Vazgeç
                </Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  type="button"
                  onClick={() => void applyManualMatch()}
                  disabled={!selectedTransaction || !manualEntityId.trim()}
                >
                  Eşleştirmeyi Kaydet
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={matchDetailModalOpen} onOpenChange={closeMatchDetailModal}>
        <AlertDialogContent className="sm:max-w-3xl">
          <AlertDialogHeader className="flex flex-row items-center justify-between space-y-0">
            <AlertDialogTitle>Eşleşme Detayı</AlertDialogTitle>
            <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => closeMatchDetailModal(false)}>
              <X className="size-4" />
            </Button>
          </AlertDialogHeader>

          {selectedMatchDetail && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">Hareket Özeti</p>
                  <Badge
                    variant="outline"
                    className={selectedMatchDetail.direction === "credit"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"}
                  >
                    {selectedMatchDetail.direction === "credit" ? "Giriş" : "Çıkış"}
                  </Badge>
                </div>

                <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-500">Tarih</p>
                    <p className="font-medium text-slate-800">
                      {new Date(selectedMatchDetail.date).toLocaleString("tr-TR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Tutar</p>
                    <p className="font-medium text-slate-800">{formatMoney(selectedMatchDetail.amount, selectedMatchDetail.currency)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">İşlem Sonrası Bakiye</p>
                    <p className="font-medium text-slate-800">{formatMoney(selectedMatchDetail.balanceAfter, selectedMatchDetail.currency)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Referans No</p>
                    <p className="font-medium text-slate-800">{selectedMatchDetail.referenceNumber ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Gönderen</p>
                    <p className="font-medium text-slate-800">{selectedMatchDetail.senderName ?? "ARF Lojistik A.Ş."}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Gönderen IBAN</p>
                    <p className="font-medium text-slate-800">{(selectedMatchDetail.senderIban ?? "TR090001061234567890123456").replace(/(.{4})/g, "$1 ").trim()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Alıcı</p>
                    <p className="font-medium text-slate-800">{selectedMatchDetail.recipientName ?? "ARF Lojistik A.Ş."}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Alıcı IBAN</p>
                    <p className="font-medium text-slate-800">{(selectedMatchDetail.recipientIban ?? "TR090001061234567890123456").replace(/(.{4})/g, "$1 ").trim()}</p>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <p className="text-xs text-slate-500">Açıklama</p>
                    <p className="font-medium text-slate-800">{selectedMatchDetail.description}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                <p className="mb-3 text-sm font-semibold text-slate-900">Eşleşme Bilgileri</p>
                <div className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-500">Eşleşme Kaynağı</p>
                    <p className="font-medium text-slate-800">
                      {selectedMatchDetail.matchSource ? MATCH_SOURCE_LABELS[selectedMatchDetail.matchSource] : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Eşleşen Kayıt ID</p>
                    <p className="font-medium text-slate-800">{selectedMatchDetail.matchedEntityId ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Eşleştirme Zamanı</p>
                    <p className="font-medium text-slate-800">
                      {selectedMatchDetail.matchedAt
                        ? new Date(selectedMatchDetail.matchedAt).toLocaleString("tr-TR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Eşleştiren Kullanıcı</p>
                    <p className="font-medium text-slate-800">{selectedMatchDetail.matchedBy ?? "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <Button type="button" onClick={handleRematchFromDetail} disabled={!selectedMatchDetail}>
                Yeniden Eşleştir
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
