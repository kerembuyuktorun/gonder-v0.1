"use client"

import { AppHeader } from "@hascanb/arf-ui-kit/layout-kit"
import dynamic from "next/dynamic"
import { OperasyonDashboardKpiCards } from "./_components/operasyon-dashboard-kpi-cards"
import { RecentTripsTable } from "./_components/recent-trips-table"
import type { OperasyonDashboardData } from "./_types/operasyon-dashboard"

const TripStatusChart = dynamic(
  () =>
    import("./_components/trip-status-chart").then((m) => ({
      default: m.TripStatusChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

const DailyTripTrendChart = dynamic(
  () =>
    import("./_components/daily-trip-trend-chart").then((m) => ({
      default: m.DailyTripTrendChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

const LineTypeChart = dynamic(
  () =>
    import("./_components/line-type-chart").then((m) => ({
      default: m.LineTypeChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> },
)

const SupplierTypeChart = dynamic(
  () =>
    import("./_components/supplier-type-chart").then((m) => ({
      default: m.SupplierTypeChart,
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
  data: OperasyonDashboardData
}

export default function DashboardOperasyonContent({ data }: Props) {
  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: "Dashboard" }, { label: "Operasyon" }]}
        searchPlaceholder="Sefer, hat, tedarikçi ara..."
        searchShortcut={<>⌘K</>}
        notificationCount={3}
        notificationsLabel="Bildirimler"
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Operasyon Dashboard
          </h1>
        </div>

        {/* KPI Cards */}
        <OperasyonDashboardKpiCards kpiCards={data.kpiCards} />

        {/* Charts Row 1: Trip Status (donut) + Daily Trend (area) */}
        <div className="grid gap-6 lg:grid-cols-2">
          <TripStatusChart data={data.tripStatusDistribution} />
          <DailyTripTrendChart data={data.dailyTripTrend} />
        </div>

        {/* Charts Row 2: Line Type (horizontal bar, 2/3) + Supplier Type (pie, 1/3) */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LineTypeChart data={data.lineTypeDistribution} />
          </div>
          <SupplierTypeChart data={data.supplierTypeDistribution} />
        </div>

        {/* Recent Trips Table */}
        <RecentTripsTable trips={data.recentTrips} />
      </div>
    </>
  )
}
