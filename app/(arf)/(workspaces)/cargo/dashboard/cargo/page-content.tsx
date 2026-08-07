"use client"

import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import dynamic from "next/dynamic"
import { KargoDashboardKpiCards } from "./_components/kargo-dashboard-kpi-cards"
import { KargoRecentCargosTable } from "./_components/kargo-recent-cargos-table"
import type { KargoDashboardData } from "./_types/kargo-dashboard"

const KargoStatusChart = dynamic(
  () => import("./_components/kargo-status-chart").then((m) => ({ default: m.KargoStatusChart })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

const KargoDailyTrendChart = dynamic(
  () => import("./_components/kargo-daily-trend-chart").then((m) => ({ default: m.KargoDailyTrendChart })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

const KargoBranchPerformanceChart = dynamic(
  () => import("./_components/kargo-branch-performance-chart").then((m) => ({ default: m.KargoBranchPerformanceChart })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

const KargoOdemeTuruChart = dynamic(
  () => import("./_components/kargo-odeme-turu-chart").then((m) => ({ default: m.KargoOdemeTuruChart })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

function ChartSkeleton() {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg border bg-muted/30">
      <span className="text-sm text-muted-foreground">Grafik yükleniyor…</span>
    </div>
  )
}

interface Props {
  data: KargoDashboardData
}

export default function DashboardKargoContent({ data }: Props) {
  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: "Dashboard" }, { label: "Kargo" }]}
        searchPlaceholder="Kargo ara..."
        searchShortcut={<>⌘K</>}
        notificationCount={3}
        notificationsLabel="Bildirimler"
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard Kargo</h1>
        </div>

        {/* KPI Cards */}
        <KargoDashboardKpiCards kpiCards={data.kpiCards} />

        {/* Charts Row 1: Status Distribution + Daily Trend */}
        <div className="grid gap-6 lg:grid-cols-2">
          <KargoStatusChart data={data.statusDistribution} />
          <KargoDailyTrendChart data={data.dailyTrend} />
        </div>

        {/* Charts Row 2: Branch Performance + Payment Type */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <KargoBranchPerformanceChart data={data.branchPerformance} />
          </div>
          <KargoOdemeTuruChart data={data.odemeTuruDistribution} />
        </div>

        {/* Recent Cargos Table */}
        <KargoRecentCargosTable cargos={data.recentCargos} />
      </div>
    </>
  )
}
