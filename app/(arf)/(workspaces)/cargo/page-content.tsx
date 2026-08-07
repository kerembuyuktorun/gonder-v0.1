"use client"

import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import dynamic from "next/dynamic"
import { DashboardKpiCards } from "./_components/dashboard-kpi-cards"
import { DashboardRecentCargos } from "./_components/dashboard-recent-cargos"
import { DashboardQuickActions } from "./_components/dashboard-quick-actions"
import type { DashboardData } from "./_types/dashboard"

const DashboardCargoChart = dynamic(() => import("./_components/dashboard-cargo-chart").then((m) => ({ default: m.DashboardCargoChart })), {
  ssr: false,
  loading: () => <div className="flex h-64 items-center justify-center rounded-lg border bg-muted/30"><span className="text-sm text-muted-foreground">Grafik yükleniyor…</span></div>,
})

const DashboardRevenueChart = dynamic(() => import("./_components/dashboard-revenue-chart").then((m) => ({ default: m.DashboardRevenueChart })), {
  ssr: false,
  loading: () => <div className="flex h-64 items-center justify-center rounded-lg border bg-muted/30"><span className="text-sm text-muted-foreground">Grafik yükleniyor…</span></div>,
})

interface Props {
  data: DashboardData
}

export default function DashboardGenelContent({ data }: Props) {
  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: "Dashboard" }, { label: "Genel" }]}
        searchPlaceholder="Kargo ara..."
        searchShortcut={<>⌘K</>}
        notificationCount={3}
        notificationsLabel="Bildirimler"
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Hoşgeldiniz</h1>
        </div>

        {/* KPI Cards */}
        <DashboardKpiCards kpiCards={data.kpiCards} />

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardCargoChart data={data.cargoDistribution} />
          <DashboardRevenueChart data={data.monthlyRevenue} />
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <DashboardRecentCargos cargos={data.recentCargos} />
          <DashboardQuickActions systemStatuses={data.systemStatuses} />
        </div>
      </div>
    </>
  )
}
