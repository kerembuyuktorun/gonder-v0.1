"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  FinancialExstreRecord,
  FinancialKpi,
  InvoiceCustomerInfo,
  OpenCargoRecord,
} from "../_types/financial"
import type { CustomerTransportRecord } from "../../_data/customers"
import { fetchInvoices as fetchCustomerInvoices } from "../_api/financial-api"
import { FinancialKpiCards } from "./financial-kpi-cards"
import { OpenCargosTableSection } from "./open-cargos-table-section"
import { OpenTransportsTableSection } from "./open-transports-table-section"
import { InvoicesTableSection } from "./invoices-table-section"

function computeKpi(
  openCargos: OpenCargoRecord[],
  openTransports: CustomerTransportRecord[],
  invoices: FinancialExstreRecord[],
): FinancialKpi {
  // Faturalaşmamış: açık kargo tutarları + faturalanmamış gelir kalemleri toplamı
  const openCargoAmount = openCargos.reduce((sum, c) => sum + (c.amount ?? 0), 0)
  const activeTransports = openTransports.filter(
    (t) => t.durum !== "teslim_edildi" && t.durum !== "iptal",
  )
  const openTransportAmount = activeTransports.reduce((sum, t) => {
    const faturasizGelir = t.gelirler
      .filter((g) => g.faturaDurumu === "olusturulmadi")
      .reduce((acc, g) => acc + g.toplamTutar, 0)
    return sum + faturasizGelir
  }, 0)

  // Sadece fatura satırlarını al
  const faturaRows = invoices.filter((r) => r.type === "fatura")

  // Bekleyen fatura borcu: bekliyor + kısmi olanların kalan bakiyesi
  const pendingInvoiceDebt = faturaRows
    .filter((r) => r.status === "bekliyor" || r.status === "kismi")
    .reduce((sum, r) => sum + r.remainingBalance, 0)

  // Gecikmiş borç: gecikti olanların kalan bakiyesi
  const overdueDebt = faturaRows
    .filter((r) => r.status === "gecikti")
    .reduce((sum, r) => sum + r.remainingBalance, 0)

  // Son tahsilat: en son gelen_odeme kaydı
  const tahsilatRows = invoices
    .filter((r) => r.type === "gelen_odeme")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const lastTahsilat = tahsilatRows[0]

  return {
    openCargoAmount: openCargoAmount + openTransportAmount,
    pendingInvoiceDebt,
    overdueDebt,
    lastCollectionDate: lastTahsilat?.createdAt ?? "-",
    lastCollectionAmount: lastTahsilat?.amount ?? 0,
    totalTransportCount: activeTransports.length,
  }
}

export function CustomerFinancialSection({
  openCargos,
  invoices,
  customerInfo,
  showOpenCargos,
  showOpenTransports,
  openTransports,
}: {
  openCargos: OpenCargoRecord[]
  invoices: FinancialExstreRecord[]
  customerInfo: InvoiceCustomerInfo
  showOpenCargos: boolean
  showOpenTransports: boolean
  openTransports: CustomerTransportRecord[]
}) {
  const [liveInvoices, setLiveInvoices] = useState<FinancialExstreRecord[]>(invoices)

  const refreshInvoices = useCallback(() => {
    void fetchCustomerInvoices(customerInfo.customerId).then(setLiveInvoices)
  }, [customerInfo.customerId])

  useEffect(() => {
    refreshInvoices()
    window.addEventListener("arf-headquarters-invoices-updated", refreshInvoices)
    return () => {
      window.removeEventListener("arf-headquarters-invoices-updated", refreshInvoices)
    }
  }, [refreshInvoices])

  const kpi = useMemo(
    () => computeKpi(openCargos, openTransports, liveInvoices),
    [openCargos, openTransports, liveInvoices],
  )

  const tabCount = (showOpenCargos ? 1 : 0) + (showOpenTransports ? 1 : 0) + 1 // +1 for Faturalar
  const defaultTab = showOpenCargos ? "open-cargos" : showOpenTransports ? "open-transports" : "invoices"

  return (
    <div className="space-y-4">
      <FinancialKpiCards kpi={kpi} />

      <Tabs defaultValue={defaultTab} className="space-y-3">
        <TabsList className={cn(
          "grid h-10 w-full rounded-xl border border-slate-200 bg-slate-100 p-0.5",
          { "grid-cols-1": tabCount === 1, "grid-cols-2": tabCount === 2, "grid-cols-3": tabCount === 3 }
        )}>
          {showOpenCargos && (
            <TabsTrigger value="open-cargos" className="gap-1.5">
              Açık Kargolar
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-slate-300/80 text-[10px] font-semibold text-slate-700">
                {openCargos.length}
              </span>
            </TabsTrigger>
          )}
          {showOpenTransports && (
            <TabsTrigger value="open-transports" className="gap-1.5">
              Açık Taşımalar
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-slate-300/80 text-[10px] font-semibold text-slate-700">
                {openTransports.filter((t) => t.durum !== "teslim_edildi" && t.durum !== "iptal").length}
              </span>
            </TabsTrigger>
          )}
          <TabsTrigger value="invoices" className="gap-1.5">
            Faturalar ve Tahsilatlar
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-slate-300/80 text-[10px] font-semibold text-slate-700">
              {liveInvoices.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {showOpenCargos && (
          <TabsContent value="open-cargos">
            <OpenCargosTableSection data={openCargos} customerInfo={customerInfo} />
          </TabsContent>
        )}

        {showOpenTransports && (
          <TabsContent value="open-transports">
            <OpenTransportsTableSection data={openTransports} customerInfo={customerInfo} />
          </TabsContent>
        )}

        <TabsContent value="invoices">
          <InvoicesTableSection data={liveInvoices} customerId={customerInfo.customerId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
