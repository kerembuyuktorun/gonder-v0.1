"use client"

import { useMemo, useState, type ChangeEvent } from "react"
import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Link2, Plus, X } from "lucide-react"
import {
  patchIncomingEInvoiceStatus,
  postIncomingEInvoiceNote,
} from "../../_api/incoming-e-invoices-api"
import type { IncomingEInvoiceDetail, IncomingEInvoiceStatus } from "../../_types/incoming-e-invoice"
import { IncomingEInvoiceImportModal } from "./incoming-e-invoice-import-modal"
import { IncomingEInvoiceProductsModal } from "./incoming-e-invoice-products-modal"

interface Props {
  initialInvoice: IncomingEInvoiceDetail
  supplierOptions: string[]
}

const STATUS_META: Record<IncomingEInvoiceStatus, { label: string; className: string }> = {
  accepted_basic: {
    label: "KABUL EDİLDİ(TEMEL)",
    className: "border-emerald-200 bg-emerald-50 text-emerald-600",
  },
  pending_approval: {
    label: "ONAY BEKLİYOR",
    className: "border-amber-200 bg-amber-50 text-amber-600",
  },
  rejected: {
    label: "REDDEDİLDİ",
    className: "border-rose-200 bg-rose-50 text-rose-600",
  },
}

function formatDate(value: string): string {
  if (!value) return "-"

  return new Date(value).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function formatDateTime(value: string): string {
  if (!value) return "-"

  return new Date(value).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function IncomingEInvoiceDetailContent({ initialInvoice, supplierOptions }: Props) {
  const [invoice, setInvoice] = useState(initialInvoice)
  const [noteDraft, setNoteDraft] = useState("")
  const [busy, setBusy] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false)

  const statusMeta = useMemo(() => STATUS_META[invoice.status], [invoice.status])

  async function handleStatusUpdate(status: IncomingEInvoiceStatus) {
    setBusy(true)
    const updated = await patchIncomingEInvoiceStatus(invoice.id, status)
    if (updated) {
      setInvoice(updated)
    }
    setBusy(false)
  }

  async function handleAddNote() {
    const note = noteDraft.trim()
    if (!note) {
      return
    }

    setBusy(true)
    const updated = await postIncomingEInvoiceNote(invoice.id, note)
    if (updated) {
      setInvoice(updated)
      setNoteDraft("")
    }
    setBusy(false)
  }

  async function handleImportInvoice() {
    if (invoice.supplierMatched) {
      setIsProductsModalOpen(true)
    } else {
      setIsImportModalOpen(true)
    }
  }

  return (
    <>
      <IncomingEInvoiceImportModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        supplierName={invoice.senderTitle}
        supplierOptions={supplierOptions}
        onConfirm={() => {
          setIsProductsModalOpen(true)
        }}
      />

      <IncomingEInvoiceProductsModal
        open={isProductsModalOpen}
        onOpenChange={setIsProductsModalOpen}
        onConfirm={() => undefined}
      />

      <AppHeader
        breadcrumbs={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Finans & Muhasebe", href: "/arf/cargo/finance" },
          { label: "Genel Merkez", href: "/arf/cargo/finance/headquarters" },
          { label: "Giderler" },
          { label: "Gelen E-Faturalar", href: "/arf/cargo/finance/headquarters/incoming-e-invoices" },
          { label: invoice.invoiceNo },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4 pt-0">
        <div className="grid gap-4 pt-4 xl:grid-cols-[1fr_320px]">
          <Card className="rounded-2xl border-slate-200 bg-slate-100 shadow-sm">
            <CardContent className="p-3 md:p-4">
              <div className="mx-auto w-full max-w-[980px] rounded-sm border border-slate-300 bg-white p-4 md:p-6">
                <div className="grid gap-4 border-b border-slate-300 pb-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{invoice.senderTitle}</p>
                    <p className="text-xs text-slate-500">İstanbul / Türkiye</p>
                    <p className="mt-2 text-xs text-slate-500">VKN: 3910525776</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-base font-semibold text-slate-700">e-FATURA</p>
                    <p className="mt-2 text-xs text-slate-500">ETTN: {invoice.ettn}</p>
                  </div>
                </div>

                <div className="grid gap-4 border-b border-slate-300 py-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Sayın</p>
                    <p className="text-sm font-semibold text-slate-700">{invoice.receiverTitle}</p>
                    <p className="mt-1 text-xs text-slate-500">VKN: {invoice.receiverTaxNumber}</p>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    <p>
                      <span className="font-medium">Fatura No:</span> {invoice.invoiceNo}
                    </p>
                    <p>
                      <span className="font-medium">Fatura Tarihi:</span> {formatDate(invoice.invoiceDate)}
                    </p>
                    <p>
                      <span className="font-medium">Düzenleme Zamanı:</span> {formatDateTime(invoice.issueDateTime)}
                    </p>
                    <p>
                      <span className="font-medium">Ödeme Tarihi:</span> {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                </div>

                <div className="py-4">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-y border-slate-300 bg-slate-50 text-left text-slate-600">
                        <th className="px-2 py-1.5">No</th>
                        <th className="px-2 py-1.5">Hizmet / Ürün</th>
                        <th className="px-2 py-1.5">Miktar</th>
                        <th className="px-2 py-1.5 text-right">Birim Fiyat</th>
                        <th className="px-2 py-1.5 text-right">KDV</th>
                        <th className="px-2 py-1.5 text-right">Toplam</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200 text-slate-700">
                        <td className="px-2 py-2">1</td>
                        <td className="px-2 py-2">Kurye hizmet bedeli</td>
                        <td className="px-2 py-2">1</td>
                        <td className="px-2 py-2 text-right">{formatMoney(invoice.amount / 1.2)}</td>
                        <td className="px-2 py-2 text-right">%20</td>
                        <td className="px-2 py-2 text-right font-medium">{formatMoney(invoice.amount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="ml-auto w-full max-w-sm space-y-1 border-t border-slate-300 pt-3 text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Mal Hizmet Toplamı</span>
                    <span>{formatMoney(invoice.amount / 1.2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Hesaplanan KDV (%20)</span>
                    <span>{formatMoney(invoice.amount - invoice.amount / 1.2)}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>Ödenecek Tutar</span>
                    <span>{formatMoney(invoice.amount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base font-semibold text-slate-800">
                  <span>e-Fatura Detayı</span>
                  <span className="text-xs font-medium text-slate-500">{formatDate(invoice.invoiceDate)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-1">
                <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">e-Fatura</span>
                    <Badge variant="outline" className={statusMeta.className}>{statusMeta.label}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">Belge No: {invoice.invoiceNo}</p>
                </div>

                {invoice.status === "accepted_basic" ? (
                  <Button
                    type="button"
                    disabled={busy}
                    onClick={handleImportInvoice}
                    variant="outline"
                    className="h-10 w-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    İçeri Al
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      disabled={busy}
                      onClick={() => handleStatusUpdate("accepted_basic")}
                      variant="outline"
                      className="h-10 w-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    >
                      Kabul Et
                    </Button>
                    <Button
                      type="button"
                      disabled={busy || invoice.status === "rejected"}
                      onClick={() => handleStatusUpdate("rejected")}
                      variant="outline"
                      className="h-10 w-full border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      <X className="mr-2 size-4" />
                      Reddet
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardContent className="space-y-2 p-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full justify-between rounded-lg border-slate-200 bg-white px-3 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    <span className="inline-flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                      <Link2 className="size-4" />
                    </span>
                    <span className="text-sm font-medium text-slate-700">PDF dosyasını göster</span>
                  </span>
                  <span className="inline-flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                    <Plus className="size-4" />
                  </span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full justify-between rounded-lg border-slate-200 bg-white px-3 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    <span className="inline-flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                      <Link2 className="size-4" />
                    </span>
                    <span className="text-sm font-medium text-slate-700">HTML dosyasını göster</span>
                  </span>
                  <span className="inline-flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                    <Plus className="size-4" />
                  </span>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardContent className="space-y-3 p-4">
                <p className="text-sm font-medium text-slate-700">Not Ekle</p>
                <Textarea
                  value={noteDraft}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setNoteDraft(event.target.value)}
                  placeholder="Not ekle"
                  className="min-h-20 resize-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddNote}
                  disabled={busy || !noteDraft.trim()}
                  className="h-10 w-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                >
                  <Plus className="mr-1 size-4" />
                  Ekle
                </Button>

                {invoice.notes.length > 0 && (
                  <div className="space-y-2 border-t border-slate-200 pt-3">
                    {invoice.notes.map((note, idx) => (
                      <div key={`${invoice.id}-note-${idx}`} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-600">
                        {note}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
