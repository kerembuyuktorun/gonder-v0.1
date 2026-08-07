"use client"

import { useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  CalendarCheck,
  CircleDollarSign,
  FileText,
} from "lucide-react"
import { SupplierUnmatchedTripsSection, UNMATCHED_TRIPS_MOCK } from "./supplier-unmatched-trips-section"
import { SupplierUnmatchedTransportsSection } from "./supplier-unmatched-transports-section"
import { SupplierInvoicesSection } from "./supplier-invoices-section"
import { supplierTransportsMock, supplierFinancialMock } from "../_mock/supplier-transport-mock-data"

/* ── KPI Helpers ── */

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(value)

interface SupplierFinanceKpi {
  unmatchedAmount: number
  pendingInvoiceDebt: number
  overdueDebt: number
  lastPaymentDate: string
  lastPaymentAmount: number
}

function computeKpi(supplierId: string): SupplierFinanceKpi {
  const transports = supplierTransportsMock[supplierId] ?? []
  const financials = supplierFinancialMock[supplierId] ?? []

  // Eşleştirilmemiş gider kalemlerinin toplamı
  const unmatchedAmount = transports.reduce((sum, t) => {
    const unmatched = t.giderler
      .filter((g) => g.faturaDurumu === "eslestirilmedi")
      .reduce((acc, g) => acc + g.toplamTutar, 0)
    return sum + unmatched
  }, 0)

  // Fatura satırları
  const faturaRows = financials.filter((r) => r.type === "fatura")

  // Bekleyen fatura borcu
  const pendingInvoiceDebt = faturaRows
    .filter((r) => r.status === "bekliyor" || r.status === "kismi")
    .reduce((sum, r) => sum + r.remainingBalance, 0)

  // Gecikmiş borç
  const overdueDebt = faturaRows
    .filter((r) => r.status === "gecikti")
    .reduce((sum, r) => sum + r.remainingBalance, 0)

  // Son ödeme
  const odemeRows = financials
    .filter((r) => r.type === "odeme")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const lastPayment = odemeRows[0]

  return {
    unmatchedAmount,
    pendingInvoiceDebt,
    overdueDebt,
    lastPaymentDate: lastPayment?.createdAt ?? "-",
    lastPaymentAmount: lastPayment?.amount ?? 0,
  }
}

/* ── KPI Card ── */

function KpiCard({
  label,
  sublabel,
  value,
  icon: Icon,
  danger,
}: {
  label: string
  sublabel?: string
  value: string
  icon: React.ElementType
  danger?: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-500">{label}</p>
          {sublabel && (
            <p className="text-[10px] text-slate-400">{sublabel}</p>
          )}
        </div>
        <span
          className={
            danger
              ? "inline-flex size-7 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-600"
              : "inline-flex size-7 items-center justify-center rounded-lg border border-secondary/30 bg-primary/12 text-secondary"
          }
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p
        className={
          danger
            ? "mt-1 text-xl font-semibold tracking-tight text-rose-600"
            : "mt-1 text-xl font-semibold tracking-tight text-slate-900"
        }
      >
        {value}
      </p>
    </div>
  )
}

/* ── Ana Bileşen ── */

interface Props {
  supplierId: string
  supplierName: string
}

export function SupplierFinanceSection({ supplierId, supplierName }: Props) {
  const kpi = useMemo(() => computeKpi(supplierId), [supplierId])

  const unmatchedTripsCount = useMemo(
    () => (UNMATCHED_TRIPS_MOCK[supplierId] ?? []).length,
    [supplierId],
  )
  const unmatchedTransportsCount = useMemo(
    () => (supplierTransportsMock[supplierId] ?? []).filter((t) =>
      t.giderler.some((g) => g.faturaDurumu === "eslestirilmedi"),
    ).length,
    [supplierId],
  )
  const financialCount = useMemo(
    () => (supplierFinancialMock[supplierId] ?? []).length,
    [supplierId],
  )

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Eşleştirilmemiş"
          value={formatCurrency(kpi.unmatchedAmount)}
          icon={FileText}
        />
        <KpiCard
          label="Bekleyen Fatura Borcu"
          value={formatCurrency(kpi.pendingInvoiceDebt)}
          icon={CircleDollarSign}
        />
        <KpiCard
          label="Gecikmiş Borç"
          value={formatCurrency(kpi.overdueDebt)}
          icon={AlertTriangle}
          danger={kpi.overdueDebt > 0}
        />
        <KpiCard
          label="Son Ödeme"
          value={formatCurrency(kpi.lastPaymentAmount)}
          sublabel={kpi.lastPaymentDate !== "-" ? kpi.lastPaymentDate : undefined}
          icon={CalendarCheck}
        />
      </div>

      {/* Sub Tabs */}
      <Tabs defaultValue="unmatched-trips" className="space-y-3">
        <TabsList className="grid h-10 w-full grid-cols-3 rounded-xl border border-slate-200 bg-slate-100 p-0.5">
          <TabsTrigger value="unmatched-trips" className="gap-1.5">
            Eşleşmemiş Seferler
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-slate-300/80 text-[10px] font-semibold text-slate-700">
              {unmatchedTripsCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="unmatched-transports" className="gap-1.5">
            Eşleşmemiş Taşımalar
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-slate-300/80 text-[10px] font-semibold text-slate-700">
              {unmatchedTransportsCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="invoices-payments" className="gap-1.5">
            Faturalar ve Ödemeler
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-slate-300/80 text-[10px] font-semibold text-slate-700">
              {financialCount}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unmatched-trips">
          <SupplierUnmatchedTripsSection supplierId={supplierId} />
        </TabsContent>

        <TabsContent value="unmatched-transports">
          <SupplierUnmatchedTransportsSection supplierId={supplierId} />
        </TabsContent>

        <TabsContent value="invoices-payments">
          <SupplierInvoicesSection supplierId={supplierId} supplierName={supplierName} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
