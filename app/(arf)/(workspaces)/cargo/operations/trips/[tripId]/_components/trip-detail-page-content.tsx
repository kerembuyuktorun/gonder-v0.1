"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Ban, Barcode, Calculator, CheckCircle2, Clock3, Coins, FileCheck, GitBranch, List, Package, Truck, User } from "lucide-react"
import { cancelTripById } from "../../_api/trip-cancel-api"
import { completeTripById } from "../../_api/trip-complete-api"
import { fetchTripTtiDocument } from "../_api/trip-tti-api"
import { fetchTripTtlDocument } from "../_api/trip-ttl-api"
import { SUPPLIER_TYPE_LABELS, formatNumber } from "../../_lib/trip-status-helpers"
import type { TripAuditLogEntry, TripDetailRecord, TripManifestItem } from "../../_types"
import { TripStatusBadge } from "../../_components/trip-status-badge"
import { TripAuditTrailSection } from "./trip-audit-trail-section"
import { TripLegsSection } from "./trip-legs-section"
import { TripManifestSection } from "./trip-manifest-section"
import { TripTabFinance } from "./trip-tab-finance"

interface Props {
  initialDetail: TripDetailRecord
  initialManifest: TripManifestItem[]
  initialAudit: TripAuditLogEntry[]
}

export function TripDetailPageContent({ initialDetail, initialManifest, initialAudit }: Props) {
  const [detail, setDetail] = useState(initialDetail)
  const [manifest] = useState(initialManifest)
  const [audit] = useState(initialAudit)
  const [isActioning, setIsActioning] = useState(false)

  const supplierLabel = useMemo(() => SUPPLIER_TYPE_LABELS[detail.trip.supplierType], [detail.trip.supplierType])

  async function handleCompleteTrip() {
    setIsActioning(true)
    try {
      const updated = await completeTripById(detail.trip.id)
      if (!updated) return
      setDetail((prev) => ({ ...prev, trip: updated }))
    } finally {
      setIsActioning(false)
    }
  }

  async function handleCancelTrip() {
    setIsActioning(true)
    try {
      const updated = await cancelTripById(detail.trip.id)
      if (!updated) return
      setDetail((prev) => ({ ...prev, trip: updated }))
    } finally {
      setIsActioning(false)
    }
  }

  async function handlePrintTti() {
    const document = await fetchTripTtiDocument(detail.trip.id)
    if (!document) return

    const vehicleText = document.vehiclePlateDisplay === "Plakasız" ? "................" : document.vehiclePlateDisplay
    const driverText = document.driverNameDisplay === "Sürücüsüz" ? "................" : document.driverNameDisplay
    const lines = document.items
      .map((item, index) => `${index + 1}. ${item.trackingNo} | ${item.originSummary} | ${item.totalQuantity} parça | ${item.totalDesi} desi`)
      .join("<br/>")

    openPrintWindow(
      `TTI - Sefer #${document.tripNo}`,
      `
        <h2>Toplu Taşıma İrsaliyesi (Dinamik)</h2>
        <p><strong>Sefer:</strong> #${document.tripNo}</p>
        <p><strong>Araç:</strong> ${vehicleText}</p>
        <p><strong>Sürücü:</strong> ${driverText}</p>
        <p><strong>Toplam Parça:</strong> ${document.packageCount}</p>
        <p><strong>Toplam Desi:</strong> ${document.totalDesi}</p>
        <p><strong>Üretim Zamanı:</strong> ${document.generatedAt}</p>
        <hr/>
        <div style="font-family:monospace; font-size:12px; line-height:1.5">${lines || "Kayıt bulunamadı."}</div>
      `,
    )
  }

  async function handlePrintTtl() {
    const document = await fetchTripTtlDocument(detail.trip.id)
    if (!document) return

    const lines = document.items
      .map((item, index) => `${index + 1}. ${item.trackingNo} | ${item.originSummary} | ${item.totalQuantity} parça | ${item.totalDesi} desi`)
      .join("<br/>")

    openPrintWindow(
      `TTL - Sefer #${document.tripNo}`,
      `
        <h2>Toplam Taşıma Listesi</h2>
        <p><strong>Sefer:</strong> #${document.tripNo}</p>
        <p><strong>Toplam Taşınan Parça:</strong> ${document.touchedPackageCount}</p>
        <p><strong>Toplam Taşınan Desi:</strong> ${document.touchedDesi}</p>
        <p><strong>Üretim Zamanı:</strong> ${document.generatedAt}</p>
        <hr/>
        <div style="font-family:monospace; font-size:12px; line-height:1.5">${lines || "Kayıt bulunamadı."}</div>
      `,
    )
  }

  async function handleExportTtlExcel() {
    const document = await fetchTripTtlDocument(detail.trip.id)
    if (!document) return
    if (typeof window === "undefined") return

    const header = ["Takip No", "Nereden-Nereye", "Taşıma Durumu", "Toplam Adet", "Toplam Desi", "Toplam Tutar"]
    const body = document.items.map((item) => [
      item.trackingNo,
      item.originSummary,
      item.transportStatus,
      String(item.totalQuantity),
      String(item.totalDesi),
      String(item.totalAmount),
    ])

    const csv = [header, ...body]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = window.document.createElement("a")
    link.href = url
    link.download = `ttl-sefer-${document.tripNo}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardContent className="gap-0 bg-[linear-gradient(135deg,rgba(248,250,252,0.98),rgba(241,245,249,0.90))] p-0">
          <div className="px-6 pb-5 pt-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Sefer Detay</p>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold text-slate-900">{detail.trip.tripNo}</h1>
                  <TripStatusBadge status={detail.trip.status} />
                </div>
                <p className="text-sm text-slate-700">{detail.routeSummary}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start lg:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="rounded-xl"
                  onClick={() => window.alert(`Sefer Barkodu: ${detail.trip.tripNo}`)}
                >
                  <Barcode className="mr-1.5 size-4" />
                  Barkod Yazdır
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="rounded-xl"
                  disabled={detail.trip.status !== "on_road" || isActioning}
                  onClick={() => void handleCompleteTrip()}
                >
                  <CheckCircle2 className="mr-1.5 size-4" />
                  Bitir
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  disabled={detail.trip.status === "completed" || detail.trip.status === "cancelled" || isActioning}
                  onClick={() => void handleCancelTrip()}
                >
                  <Ban className="mr-1.5 size-4" />
                  İptal Et
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-0 border-t border-slate-200 md:grid-cols-6">
            <div className="border-slate-200 px-6 py-4 md:border-r">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Truck className="size-3.5" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Tedarikçi</p>
              </div>
              <p className="mt-1.5 text-sm font-medium text-slate-700">{supplierLabel} / {detail.trip.supplierName}</p>
            </div>
            <div className="border-slate-200 px-6 py-4 md:border-r">
              <div className="flex items-center gap-1.5 text-slate-400">
                <User className="size-3.5" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Plaka - Sürücü</p>
              </div>
              <p className="mt-1.5 text-sm font-medium text-slate-700">{detail.trip.vehiclePlate ?? "Plakasız"} - {detail.trip.driverName ?? "Sürücüsüz"}</p>
            </div>
            <div className="border-slate-200 px-6 py-4 md:border-r">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock3 className="size-3.5" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Oluşturulma Zamanı</p>
              </div>
              <p className="mt-1.5 text-sm font-medium text-slate-700">{new Date(detail.trip.createdAt).toLocaleString("tr-TR")}</p>
            </div>
            <div className="border-slate-200 px-6 py-4 md:border-r">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Package className="size-3.5" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Toplam Yük Özeti</p>
              </div>
              <p className="mt-1.5 text-sm font-medium text-slate-700">
                {formatNumber(detail.trip.totalPackageCount)} Adet / {formatNumber(detail.trip.totalDesi)} Desi
              </p>
            </div>
            <div className="border-slate-200 px-6 py-4 md:border-r">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Coins className="size-3.5" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Sefer Maliyeti</p>
              </div>
              <p className="mt-1.5 text-sm font-medium text-slate-700">
                {new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((detail.giderler ?? []).reduce((t, g) => t + g.toplamTutar, 0))}₺
              </p>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center gap-1.5 text-slate-400">
                <FileCheck className="size-3.5" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Fatura Durumu</p>
              </div>
              <p className="mt-1.5 text-sm font-medium text-slate-700">
                {(detail.giderler ?? []).filter((g) => g.faturaDurumu === "eslestirildi").length} Eşleştirildi / {(detail.giderler ?? []).filter((g) => g.faturaDurumu === "eslestirilmedi").length} Eşleştirilmedi
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="legs" className="space-y-4">
        <TabsList className="grid h-10 w-full grid-cols-4 rounded-xl border border-slate-200 bg-slate-100 p-0.5">
          <TabsTrigger value="legs" className="text-xs"><GitBranch className="mr-1.5 size-3.5" />Sefer Ayakları</TabsTrigger>
          <TabsTrigger value="manifest" className="text-xs"><List className="mr-1.5 size-3.5" />Toplam Taşıma Listesi</TabsTrigger>
          <TabsTrigger value="finance" className="text-xs"><Calculator className="mr-1.5 size-3.5" />Finans & Muhasebe</TabsTrigger>
          <TabsTrigger value="history" className="text-xs"><Clock3 className="mr-1.5 size-3.5" />Sistem Geçmişi</TabsTrigger>
        </TabsList>

        <TabsContent value="legs" className="space-y-3">
          <TripLegsSection
            legs={detail.legs}
            items={manifest}
            onPrintTti={handlePrintTti}
            onCompleteLeg={handleCompleteTrip}
            isActioning={isActioning}
          />
        </TabsContent>

        <TabsContent value="manifest">
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <TripManifestSection items={manifest} selectedLegId={null} onPrintTtl={handlePrintTtl} onExportTtl={handleExportTtlExcel} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance">
          <TripTabFinance data={detail} />
        </TabsContent>

        <TabsContent value="history">
          <TripAuditTrailSection logs={audit} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function openPrintWindow(title: string, bodyHtml: string) {
  if (typeof window === "undefined") return
  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
          h2 { margin: 0 0 12px; }
          p { margin: 4px 0; }
          hr { margin: 16px 0; }
        </style>
      </head>
      <body>${bodyHtml}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}
