"use client"

import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import dynamic from "next/dynamic"
import { FinansDashboardKpiCards } from "./_components/finans-dashboard-kpi-cards"
import { BankaHesaplariCard } from "./_components/banka-hesaplari-card"
import { RecentTransactionsTable } from "./_components/recent-transactions-table"
import type { FinansDashboardData } from "./_types/finans-dashboard"

const GelirGiderTrendChart = dynamic(
  () =>
    import("./_components/gelir-gider-trend-chart").then((m) => ({
      default: m.GelirGiderTrendChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

const FaturaDurumChart = dynamic(
  () =>
    import("./_components/fatura-durum-chart").then((m) => ({
      default: m.FaturaDurumChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

const GiderKategoriChart = dynamic(
  () =>
    import("./_components/gider-kategori-chart").then((m) => ({
      default: m.GiderKategoriChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

function ChartSkeleton() {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg border bg-muted/30">
      <span className="text-sm text-muted-foreground">
        Grafik yükleniyor…
      </span>
    </div>
  )
}

interface Props {
  data: FinansDashboardData
}

export default function DashboardFinansContent({ data }: Props) {
  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: "Dashboard" }, { label: "Finans" }]}
        searchPlaceholder="Fatura, gider, hesap ara..."
        searchShortcut={<>⌘K</>}
        notificationCount={3}
        notificationsLabel="Bildirimler"
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Finans Dashboard
          </h1>
        </div>

        {/* KPI Cards */}
        <FinansDashboardKpiCards kpiCards={data.kpiCards} />

        {/* Charts Row 1: Gelir-Gider Trend (bar) + Fatura Durumu (donut) */}
        <div className="grid gap-6 lg:grid-cols-2">
          <GelirGiderTrendChart data={data.gelirGiderTrend} />
          <FaturaDurumChart data={data.faturaDurumDistribution} />
        </div>

        {/* Charts Row 2: Gider Kategorileri (horizontal bar, 2/3) + Banka Hesapları (1/3) */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <GiderKategoriChart data={data.giderKategoriDistribution} />
          </div>
          <BankaHesaplariCard accounts={data.bankaHesaplari} />
        </div>

        {/* Recent Transactions Table */}
        <RecentTransactionsTable transactions={data.recentTransactions} />
      </div>
    </>
  )
}
