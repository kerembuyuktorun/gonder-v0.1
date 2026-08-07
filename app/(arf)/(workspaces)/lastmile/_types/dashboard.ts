/** Last Mile operasyon dashboard domain tipleri (mock → BE). */

export type DashboardKpi = {
  title: string
  value: string
  suffix?: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  description: string
}

export type StatusSlice = {
  name: string
  value: number
  color: string
}

export type DailyDeliveryPoint = {
  day: string
  teslim: number
  iptal: number
}

export type FleetSlice = {
  name: string
  value: number
  color: string
}

export type RecentOrderRow = {
  id: string
  customer: string
  district: string
  status:
    | 'atama_bekliyor'
    | 'hazirlaniyor'
    | 'yolda'
    | 'teslim_edildi'
    | 'iptal_edildi'
    | 'basarisiz'
  time: string
}

export type QuickAction = {
  title: string
  description: string
  href: string
}

export type OpsAlert = {
  id: string
  severity: 'warning' | 'critical' | 'info'
  title: string
  detail: string
}

export type LastmileDashboardData = {
  kpiCards: DashboardKpi[]
  orderStatusDistribution: StatusSlice[]
  dailyDeliveries: DailyDeliveryPoint[]
  fleetDistribution: FleetSlice[]
  recentOrders: RecentOrderRow[]
  quickActions: QuickAction[]
  alerts: OpsAlert[]
}

export type LiveCourierPin = {
  id: string
  name: string
  status: 'yolda' | 'bos'
  lat: number
  lng: number
  activeOrders: number
}

export type LiveException = {
  id: string
  kind: 'unassigned' | 'delayed' | 'doc' | 'overdue'
  title: string
  meta: string
  href?: string
}

export type LastmileLiveDashboardData = {
  kpis: Array<{ label: string; value: string; hint?: string }>
  couriers: LiveCourierPin[]
  exceptions: LiveException[]
  activeRouteCount: number
}
