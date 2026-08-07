"use client"

import { useEffect, useMemo, useState } from "react"
import type { Table as TanStackTable } from "@tanstack/react-table"
import { DataTable, DataTablePagination } from "@hascanb/arf-ui-kit/datatable-kit"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { fetchInvoiceById, fetchInvoicePayments } from "../../_api/invoices-api"
import {
  formatDate,
  formatDateTime,
  formatMoney,
  getDueStatusMeta,
  INVOICE_STATUS_BADGE_CLASSES,
  INVOICE_STATUS_LABELS,
} from "../../_lib/invoice-presenters"
import type { InvoiceCargoSnapshot, InvoicePayment, InvoiceRecord } from "../../_types/invoice"
import { getCargoLinesColumns } from "../_columns/cargo-lines-columns"
import { getTransportLinesColumns } from "../_columns/transport-lines-columns"
import { ServiceLinesDisplay } from "./service-lines-display"
import { ArrowDownLeft, ChevronRight, Download } from "lucide-react"

interface Props {
  initialInvoice: InvoiceRecord
  initialPayments: InvoicePayment[]
}

function buildFallbackCargoSnapshots(invoice: InvoiceRecord): InvoiceCargoSnapshot[] {
  const lineCount = Math.max(invoice.relatedCargoCount, 1)
  const baseUnit = Math.floor((invoice.subTotal / lineCount) * 100) / 100
  const vatUnit = Math.floor((invoice.vatTotal / lineCount) * 100) / 100

  return invoice.relatedCargoIds.map((cargoId, index) => {
    const isLast = index === invoice.relatedCargoIds.length - 1
    const usedBase = baseUnit * index
    const usedVat = vatUnit * index
    const baseAmount = isLast ? Number((invoice.subTotal - usedBase).toFixed(2)) : Number(baseUnit.toFixed(2))
    const vat = isLast ? Number((invoice.vatTotal - usedVat).toFixed(2)) : Number(vatUnit.toFixed(2))

    return {
      id: cargoId,
      trackingNo: cargoId.toUpperCase(),
      date: `${invoice.issueDate}T09:00:00`,
      route: `${invoice.operatingBranchName} -> Teslimat Hattı ${index + 1}`,
      status: invoice.status === "odendi" ? "Teslim Edildi" : "Faturalandı",
      pieceCount: 1 + (index % 3),
      amount: baseAmount + vat,
      senderCustomer: invoice.customerName,
      senderBranch: invoice.operatingBranchName,
      receiverBranch: `Dağıtım Şubesi ${index + 1}`,
      receiverCustomer: `Alıcı Müşteri ${index + 1}`,
      receiverPhone: `0532 000 0${index + 1}${index + 2}`,
      paymentType: index % 2 === 0 ? "Gönderici Ödemeli" : "Alıcı Ödemeli",
      invoiceType: invoice.customerType === "corporate" ? "Kurumsal Fatura" : "Bireysel Fatura",
      baseAmount,
      vat,
      volumetricWeight: 8 + index * 2,
      pieceList: `Koli-${index + 1}`,
      dispatchNo: `IRS-${invoice.invoiceNo.slice(-4)}-${index + 1}`,
      atfNo: `ATF-${invoice.invoiceNo.slice(-4)}-${index + 1}`,
      arrivalAt: `${invoice.issueDate}T13:30:00`,
      deliveryAt: invoice.status === "odendi" ? `${invoice.dueDate}T11:15:00` : "",
      lastActionAt: `${invoice.dueDate}T09:45:00`,
      pieceStatus: "Sağlam",
      invoiceStatus: "kesildi",
      collectionStatus:
        invoice.status === "odendi"
          ? "tahsil_edildi"
          : invoice.status === "iade"
            ? "iptal"
            : invoice.status === "kismi"
              ? "gm_gonderildi"
              : "beklemede",
      createdBy: invoice.createdBy,
    }
  })
}

export function InvoiceDetailContent({ initialInvoice, initialPayments }: Props) {
  const [invoice, setInvoice] = useState(initialInvoice)
  const [payments, setPayments] = useState(initialPayments)
  const [cargoTable, setCargoTable] = useState<TanStackTable<InvoiceCargoSnapshot> | null>(null)
  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null)

  useEffect(() => {
    const refresh = async () => {
      const [nextInvoice, nextPayments] = await Promise.all([
        fetchInvoiceById(initialInvoice.id),
        fetchInvoicePayments(initialInvoice.id),
      ])

      if (nextInvoice) {
        setInvoice(nextInvoice)
      }

      setPayments(nextPayments)
    }

    const handleInvoicesUpdated = () => {
      void refresh()
    }

    window.addEventListener("arf-headquarters-invoices-updated", handleInvoicesUpdated)
    return () => window.removeEventListener("arf-headquarters-invoices-updated", handleInvoicesUpdated)
  }, [initialInvoice.id])

  const dueStatus = useMemo(() => getDueStatusMeta(invoice), [invoice])
  const cargoRows = useMemo(
    () => (invoice.cargoSnapshots?.length ? invoice.cargoSnapshots.map((c) => ({ ...c })) : buildFallbackCargoSnapshots(invoice)),
    [invoice],
  )
  const transportRows = useMemo(() => invoice.transportSnapshots ?? [], [invoice])
  const serviceRows = useMemo(() => invoice.serviceLineSnapshots ?? [], [invoice])
  const cargoColumns = useMemo(() => getCargoLinesColumns(), [])
  const transportColumns = useMemo(() => getTransportLinesColumns(), [])

  const hasTransport = transportRows.length > 0
  const hasService = serviceRows.length > 0

  const channelLabel: Record<string, string> = {
    nakit: "Nakit",
    havale: "Havale",
    eft: "EFT",
    mahsup: "Mahsup",
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Finans & Muhasebe", href: "/arf/cargo/finance" },
          { label: "Genel Merkez", href: "/arf/cargo/finance/headquarters" },
          { label: "Satışlar" },
          { label: "Faturalar", href: "/arf/cargo/finance/headquarters/invoices" },
          { label: invoice.invoiceNo },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4 pt-0">
        <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm">
          <CardHeader className="gap-0 bg-[linear-gradient(135deg,rgba(248,250,252,0.98),rgba(241,245,249,0.90))] px-0 py-0">
            <div className="flex flex-col gap-4 px-6 pt-6 pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Fatura Detayı</p>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-2xl font-semibold text-slate-900">{invoice.invoiceNo}</CardTitle>
                  <Badge variant="outline" className={INVOICE_STATUS_BADGE_CLASSES[invoice.status]}>
                    {INVOICE_STATUS_LABELS[invoice.status]}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-xl border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
                  onClick={() => window.print()}
                >
                  <Download className="mr-1.5 size-3.5" />
                  PDF İndir
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-xl border-orange-200 bg-orange-50 px-4 text-sm text-orange-700 shadow-sm hover:bg-orange-100"
                >
                  İade İşaretle
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-xl border-red-200 bg-red-50 px-4 text-sm text-red-700 shadow-sm hover:bg-red-100"
                >
                  Red İşaretle
                </Button>
              </div>
            </div>

            <div className="grid gap-0 border-t border-slate-200 md:grid-cols-2 lg:grid-cols-4">
              <div className="border-slate-200 px-6 py-4 md:border-r">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Müşteri</p>
                <p className="mt-1.5 text-sm font-medium text-slate-700">{invoice.customerName}</p>
                <p className="text-xs text-slate-500">{invoice.taxNumber || "Vergi numarası yok"}</p>
              </div>
              <div className="border-slate-200 px-6 py-4 md:border-r lg:border-r">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Fatura Notu</p>
                <p className="mt-1.5 text-sm font-medium text-slate-700 line-clamp-2">{invoice.note || "—"}</p>
                <p className="text-xs text-slate-500">{invoice.note ? "Not eklendi" : "Not eklenmemiş"}</p>
              </div>
              <div className="border-slate-200 px-6 py-4 md:border-r">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Oluşturulma</p>
                <p className="mt-1.5 text-sm font-medium text-slate-700">{formatDateTime(invoice.createdAt)}</p>
                <p className="text-xs text-slate-500">{invoice.createdBy}</p>
              </div>
              <div className="px-6 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Son Durum Değişimi</p>
                <p className="mt-1.5 text-sm font-medium text-slate-700">{formatDateTime(invoice.statusChangedAt)}</p>
                <p className="text-xs text-slate-500">{invoice.statusChangedBy}</p>
              </div>
            </div>

            <div className="grid gap-0 border-t border-slate-200 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border-slate-200 px-6 py-4 sm:border-r">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Fatura Tutarı</p>
                  <p className="text-lg font-bold text-slate-900">{formatMoney(invoice.grandTotal)}</p>
                  <p className="text-xs text-slate-500">{formatMoney(invoice.subTotal)} + {formatMoney(invoice.vatTotal)} KDV</p>
                </div>
              </div>
              <div className="border-slate-200 px-6 py-4 sm:border-r">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Tahsil Edilen</p>
                  <p className="text-lg font-bold text-emerald-700">{formatMoney(invoice.paidTotal)}</p>
                  <p className="text-xs text-slate-500">{payments.length} eşleşme bulundu</p>
                </div>
              </div>
              <div className="border-slate-200 px-6 py-4 sm:border-r">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Kalan Bakiye</p>
                  <p className={`text-lg font-bold ${invoice.remainingBalance > 0 ? "text-rose-600" : "text-slate-900"}`}>
                    {formatMoney(invoice.remainingBalance)}
                  </p>
                  <p className="text-xs text-slate-500">{invoice.remainingBalance > 0 ? "Tahsil edilecek" : "Kapandı"}</p>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Vade / Gecikme</p>
                  <p className={`text-lg font-bold leading-tight ${dueStatus.className.includes("rose") ? "text-rose-600" : dueStatus.className.includes("emerald") ? "text-emerald-700" : dueStatus.className.includes("sky") ? "text-sky-700" : "text-slate-900"}`}>
                    {dueStatus.label}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(invoice.dueDate)}</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="lines" className="space-y-4">
          <TabsList className="grid h-10 w-full grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-0.5">
            <TabsTrigger value="lines" className="text-xs">Hizmet / Ürün</TabsTrigger>
            <TabsTrigger value="payments" className="text-xs">Tahsilatlar</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Hizmet / Ürün ── */}
          <TabsContent value="lines" className="space-y-4">
            {/* Kargo Kalemleri */}
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Kargo Kalemleri</CardTitle>
                <CardDescription>Bu faturaya dahil edilen kargolar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DataTable
                  columns={cargoColumns}
                  data={cargoRows}
                  onTableReady={setCargoTable}
                  enableHorizontalScroll
                  emptyMessage="Bu faturaya bağlı kargo kalemi bulunamadı."
                />
                {cargoTable && <DataTablePagination table={cargoTable as TanStackTable<unknown>} />}
              </CardContent>
            </Card>

            {/* Taşıma (Satış) Kalemleri — sadece veri varsa */}
            {hasTransport && (
              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Taşıma Kalemleri</CardTitle>
                  <CardDescription>Bu faturaya bağlı satış taşımaları.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DataTable
                    columns={transportColumns}
                    data={transportRows}
                    enableHorizontalScroll
                    emptyMessage="Taşıma kalemi bulunamadı."
                  />
                </CardContent>
              </Card>
            )}

            {/* Hizmet / Ürün Kalemleri — sadece veri varsa */}
            {hasService && (
              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Hizmet / Ürün Kalemleri</CardTitle>
                  <CardDescription>Manuel eklenen hizmet ve ürün satırları.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ServiceLinesDisplay lines={serviceRows} />
                </CardContent>
              </Card>
            )}

            {/* Toplamlar */}
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Ara Toplam</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{formatMoney(invoice.subTotal)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Toplam KDV</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{formatMoney(invoice.vatTotal)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Genel Toplam</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{formatMoney(invoice.grandTotal)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 2: Tahsilatlar ── */}
          <TabsContent value="payments">
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Tahsilatlar</CardTitle>
                <CardDescription>Bu faturaya ait tahsilat ve eşleşme kayıtları.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {payments.length === 0 ? (
                  <div className="px-6 py-8 text-center text-sm text-slate-500">
                    Bu faturaya ait tahsilat kaydı bulunmuyor.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {payments.map((payment) => {
                      const isExpanded = expandedPaymentId === payment.id
                      return (
                        <div key={payment.id}>
                          {/* Satır */}
                          <div
                            className="grid cursor-pointer grid-cols-[32px_auto] items-center gap-0 px-4 py-3 hover:bg-slate-50/70"
                            onClick={() => setExpandedPaymentId(isExpanded ? null : payment.id)}
                          >
                            <button
                              type="button"
                              className="flex size-7 items-center justify-center rounded-md hover:bg-slate-100"
                              onClick={(e) => { e.stopPropagation(); setExpandedPaymentId(isExpanded ? null : payment.id) }}
                            >
                              <ChevronRight className={cn("size-4 text-slate-500 transition-transform duration-200", isExpanded && "rotate-90")} />
                            </button>

                            <div className="grid grid-cols-[120px_160px_130px_1fr_130px_110px_110px] items-center gap-3 text-sm">
                              <Badge variant="outline" className="w-fit border-emerald-200 bg-emerald-50 text-emerald-700">
                                Tahsilat
                              </Badge>
                              <span className="font-mono text-xs text-slate-700">{payment.referenceNo || "—"}</span>
                              <span className="text-xs text-slate-700">{formatDate(payment.paymentDate)}</span>
                              <span className="truncate text-xs text-slate-600">{invoice.invoiceNo} tahsilatı</span>
                              <div className="flex items-center gap-1">
                                <ArrowDownLeft className="size-3.5 text-emerald-500" />
                                <span className="font-semibold tabular-nums text-emerald-700">+{formatMoney(payment.amount)}</span>
                              </div>
                              <span className="text-xs text-slate-400">—</span>
                              <Badge variant="outline" className="w-fit border-emerald-200 bg-emerald-50 text-xs text-emerald-700">
                                Tamamlandı
                              </Badge>
                            </div>
                          </div>

                          {/* Detay satırı */}
                          {isExpanded && (
                            <div className="border-t border-emerald-100 bg-emerald-50/40 px-8 py-4">
                              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-500">Tahsilat Detayı</p>
                              <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                                <div>
                                  <p className="text-xs font-medium text-slate-400">Gönderen</p>
                                  <p className="mt-0.5 text-sm text-slate-900">{invoice.customerName}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-slate-400">Gönderen IBAN</p>
                                  <p className="mt-0.5 font-mono text-xs text-slate-900">{payment.senderIban || "—"}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-slate-400">Alıcı</p>
                                  <p className="mt-0.5 text-sm text-slate-900">{invoice.operatingBranchName}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-slate-400">Alıcı IBAN</p>
                                  <p className="mt-0.5 font-mono text-xs text-slate-900">{payment.bankAccountLabel || "—"}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-slate-400">Referans No</p>
                                  <p className="mt-0.5 font-mono text-sm text-slate-900">{payment.referenceNo || "—"}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-slate-400">Yön</p>
                                  <Badge variant="outline" className="mt-0.5 border-emerald-200 bg-emerald-50 text-emerald-700">Giriş</Badge>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-slate-400">Eşleştirme</p>
                                  <Badge variant="outline" className={cn("mt-0.5 text-xs", payment.matchType === "bank_auto" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-blue-200 bg-blue-50 text-blue-700")}>
                                    {payment.matchType === "bank_auto" ? "Otomatik" : "Manuel"}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-slate-400">Eşleşme Kaynağı</p>
                                  <p className="mt-0.5 text-sm text-slate-900">Müşteri Faturası</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-slate-400">Eşleşen Kayıt</p>
                                  <p className="mt-0.5 text-sm text-slate-900">{invoice.invoiceNo}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-slate-400">Kanal</p>
                                  <p className="mt-0.5 text-sm text-slate-900">{channelLabel[payment.channel] ?? payment.channel}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}